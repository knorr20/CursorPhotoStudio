import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ContactMessage } from '../types/contactMessage';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const useContactMessages = () => {
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertDbRowToContactMessage = (row: Record<string, unknown>): ContactMessage => ({
    id: row.id as number,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string | null,
    message: row.message as string,
    status: ((row.status as string) || 'new') as 'new' | 'read' | 'archived',
    createdAt: row.created_at as string,
  });

  /** contact_messages RLS: SELECT only for authenticated. Never query as anon. */
  const fetchContactMessages = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError(
        'Missing Supabase environment variables. In Vercel add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for this environment, then redeploy.'
      );
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setContactMessages([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: qError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (qError) throw qError;

      setContactMessages(data?.map(convertDbRowToContactMessage) || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contact messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const addContactMessage = async (
    newMessage: Omit<ContactMessage, 'id' | 'createdAt'>,
    honeypot: string = '',
    turnstileToken: string = ''
  ) => {
    if (!isSupabaseConfigured) {
      const msg = 'Missing Supabase environment variables. Configure Vercel and redeploy.';
      setError(msg);
      throw new Error(msg);
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spam-protection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'contact',
          data: newMessage,
          honeypot: honeypot,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      await fetchContactMessages();

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact message');
      throw err;
    }
  };

  const updateContactMessageStatus = async (messageId: number, newStatus: 'new' | 'read' | 'archived') => {
    if (!supabase) {
      setError('Supabase is not configured.');
      throw new Error('Supabase is not configured.');
    }
    try {
      const { data, error: uError } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', messageId)
        .select();

      if (uError) {
        throw uError;
      }

      if (data && data.length > 0) {
        const convertedMessage = convertDbRowToContactMessage(data[0] as Record<string, unknown>);
        setContactMessages((prev) => prev.map((message) => (message.id === messageId ? convertedMessage : message)));
        return convertedMessage;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact message status');
      throw err;
    }
  };

  const deleteContactMessage = async (messageId: number) => {
    if (!supabase) {
      setError('Supabase is not configured.');
      throw new Error('Supabase is not configured.');
    }
    try {
      const { error: dError } = await supabase.from('contact_messages').delete().eq('id', messageId);

      if (dError) {
        throw dError;
      }

      setContactMessages((prev) => prev.filter((message) => message.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact message');
      throw err;
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel | null = null;

    const removeRealtime = () => {
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }
    };

    const attachRealtime = () => {
      removeRealtime();
      channel = supabase
        .channel('contact-messages-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'contact_messages',
          },
          (payload) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              const newMessage = convertDbRowToContactMessage(payload.new as Record<string, unknown>);
              setContactMessages((prev) => [newMessage, ...prev]);
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              const updatedMessage = convertDbRowToContactMessage(payload.new as Record<string, unknown>);
              setContactMessages((prev) =>
                prev.map((message) => (message.id === updatedMessage.id ? updatedMessage : message))
              );
            } else if (payload.eventType === 'DELETE' && payload.old) {
              const oldRow = payload.old as { id?: number };
              if (oldRow.id != null) {
                setContactMessages((prev) => prev.filter((message) => message.id !== oldRow.id));
              }
            }
          }
        )
        .subscribe();
    };

    const sync = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        removeRealtime();
        setContactMessages([]);
        setError(null);
        setLoading(false);
        return;
      }

      await fetchContactMessages();
      attachRealtime();
    };

    void sync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void sync();
    });

    return () => {
      removeRealtime();
      subscription.unsubscribe();
    };
  }, [fetchContactMessages, supabase]);

  return {
    contactMessages,
    loading,
    error,
    clearError: () => setError(null),
    addContactMessage,
    updateContactMessageStatus,
    deleteContactMessage,
    refetch: fetchContactMessages,
  };
};
