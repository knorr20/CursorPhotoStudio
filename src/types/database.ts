export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: number;
          date: string;
          start_time: string;
          end_time: string;
          duration: string;
          client_name: string;
          client_email: string;
          client_phone: string;
          project_type: string;
          total_price: number;
          status: 'confirmed' | 'cancelled';
          notes: string;
          receive_promotional_comms: boolean;
          agreed_to_terms: boolean;
          terms_agreed_at: string | null;
          receive_promotional_comms_at: string | null;
          stripe_payment_intent_id: string | null;
          payment_status: 'paid' | 'refunded';
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          date: string;
          start_time: string;
          end_time: string;
          duration: string;
          client_name: string;
          client_email: string;
          client_phone: string;
          project_type: string;
          total_price: number;
          status?: 'confirmed' | 'cancelled';
          notes: string;
          receive_promotional_comms?: boolean;
          agreed_to_terms?: boolean;
          terms_agreed_at?: string | null;
          receive_promotional_comms_at?: string | null;
          stripe_payment_intent_id?: string | null;
          payment_status?: 'paid' | 'refunded';
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          date?: string;
          start_time?: string;
          end_time?: string;
          duration?: string;
          client_name?: string;
          client_email?: string;
          client_phone?: string;
          project_type?: string;
          total_price?: number;
          status?: 'confirmed' | 'cancelled';
          notes?: string;
          receive_promotional_comms?: boolean;
          agreed_to_terms?: boolean;
          terms_agreed_at?: string | null;
          receive_promotional_comms_at?: string | null;
          stripe_payment_intent_id?: string | null;
          payment_status?: 'paid' | 'refunded';
          receipt_url?: string | null;
          created_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: number;
          name: string;
          email: string;
          phone: string | null;
          message: string;
          status: 'new' | 'read' | 'archived';
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
          status?: 'new' | 'read' | 'archived';
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          email?: string;
          phone?: string | null;
          message?: string;
          status?: 'new' | 'read' | 'archived';
          created_at?: string;
        };
      };
    };
    Views: {
      bookings_public_calendar: {
        Row: {
          id: number;
          date: string;
          start_time: string;
          end_time: string;
          duration: string;
          status: 'confirmed' | 'cancelled';
          created_at: string;
        };
      };
    };
  };
}