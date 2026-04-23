export interface Booking {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectType: string;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  notes: string;
  receivePromotionalComms: boolean;
  agreedToTerms: boolean;
  termsAgreedAt: string | null;
  receivePromotionalCommsAt: string | null;
  createdAt: string;
  stripePaymentIntentId?: string | null;
  paymentStatus?: 'paid' | 'refunded';
  receiptUrl?: string | null;
}

export interface BookingFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectType: string;
  notes: string;
  receivePromotionalComms: boolean;
  agreedToTerms: boolean;
}