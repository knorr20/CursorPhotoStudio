import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ContactMessage } from '../types/contactMessage';

export const useContactMessages = () => {
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert database row to ContactMessage type
  const convertDbRowToContactMessage = (row: any): ContactMessage => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: (row.status || 'new') as 'new' | 'read' | 'archived',
    createdAt: row.created_at
  });

  const fetchContactMessages = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError(
        'Missing Supabase environment variables. In Vercel add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for this environment, then redeploy.'
      );
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setContactMessages(data?.map(convertDbRowToContactMessage) || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contact messages');
    } finally {
      setLoading(false);
    }
  };

  // Add a new contact message
  const addContactMessage = async (newMessage: Omit<ContactMessage, 'id' | 'createdAt'>, honeypot: string = '') => {
    if (!isSupabaseConfigured) {
      const msg = 'Missing Supabase environment variables. Configure Vercel and redeploy.';
      setError(msg);
      throw new Error(msg);
    }
    try {
      // Use spam protection edge function instead of direct insert
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spam-protection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'contact',
          data: newMessage,
          honeypot: honeypot
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Refresh messages list to get the new message
      await fetchContactMessages();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact message');
      throw err;
    }
  };

  // Update contact message status
  const updateContactMessageStatus = async (messageId: number, newStatus: 'new' | 'read' | 'archived') => {
    if (!supabase) {
      setError('Supabase is not configured.');
      throw new Error('Supabase is not configured.');
    }
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', messageId)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const convertedMessage = convertDbRowToContactMessage(data[0]);
        setContactMessages(prev =>
          prev.map(message =>
            message.id === messageId ? convertedMessage : message
          )
        );
        return convertedMessage;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact message status');
      throw err;
    }
  };

  // Delete contact message
  const deleteContactMessage = async (messageId: number) => {
    if (!supabase) {
      setError('Supabase is not configured.');
      throw new Error('Supabase is not configured.');
    }
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        throw error;
      }

      setContactMessages(prev =>
        prev.filter(message => message.id !== messageId)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact message');
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchContactMessages();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('contact-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_messages'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const newMessage = convertDbRowToContactMessage(payload.new);
            setContactMessages(prev => [newMessage, ...prev]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedMessage = convertDbRowToContactMessage(payload.new);
            setContactMessages(prev =>
              prev.map(message =>
                message.id === updatedMessage.id ? updatedMessage : message
              )
            );
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setContactMessages(prev =>
              prev.filter(message => message.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    contactMessages,
    loading,
    error,
    clearError: () => setError(null),
    addContactMessage,
    updateContactMessageStatus,
    deleteContactMessage,
    refetch: fetchContactMessages
  };
};