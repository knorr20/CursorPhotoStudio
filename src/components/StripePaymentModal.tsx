import React, { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { X, CreditCard, Lock, AlertTriangle } from 'lucide-react';
import TurnstileWidget from './TurnstileWidget';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string) ?? '';

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  amount: number;
  clientEmail: string;
  description: string;
  stripePublishableKey: string;
  bookingData: {
    date: string;
    startTime: string;
    endTime: string;
    duration: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    projectType: string;
    totalPrice: number;
    notes: string;
    agreedToTerms: boolean;
    termsAgreedAt: string | null;
  };
}

// Inner form — must live inside <Elements>
const CheckoutForm: React.FC<{
  amount: number;
  paymentIntentId: string;
  clientSecret: string;
  onPaymentSuccess: () => void;
}> = ({ amount, paymentIntentId, clientSecret, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const readyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elementReadyRef = useRef(false);

  useEffect(() => {
    setIsReady(false);
    elementReadyRef.current = false;
    setPaymentError(null);
    if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    readyTimerRef.current = setTimeout(() => {
      if (!elementReadyRef.current) {
        setPaymentError(
          'Payment form is taking too long. Check: (1) VITE_STRIPE_PUBLISHABLE_KEY must be from the same Stripe account as STRIPE_SECRET_KEY on the server, both test mode or both live. (2) Browser console / ad blocker blocking Stripe.'
        );
      }
    }, 25000);
    return () => {
      if (readyTimerRef.current) clearTimeout(readyTimerRef.current);
    };
  }, [clientSecret, paymentIntentId]);

  const handlePaymentElementReady = () => {
    elementReadyRef.current = true;
    if (readyTimerRef.current) {
      clearTimeout(readyTimerRef.current);
      readyTimerRef.current = null;
    }
    setIsReady(true);
  };

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setPaymentError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    });

    if (error) {
      setPaymentError(error.message ?? 'Payment failed. Please try again.');
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-payment`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'finalize_booking',
            paymentIntentId: paymentIntent.id,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error ?? 'Failed to save payment');
      } catch (err) {
        setPaymentError(err instanceof Error ? err.message : 'Payment succeeded, but booking finalization failed.');
        setIsProcessing(false);
        return;
      }
      onPaymentSuccess();
    } else {
      setPaymentError('Payment was not completed. Please try again.');
      setIsProcessing(false);
    }
  };

  // clientSecret is passed via Elements options, just used to satisfy lint
  void clientSecret;

  return (
    <div className="p-6">
      {/* Amount summary */}
      <div className="mb-6 flex items-stretch gap-0 border border-gray-200 overflow-hidden">
        <div className="flex-1 bg-gray-950 text-white px-5 py-4">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Amount Due</div>
          <div className="text-4xl font-black tracking-tight">${amount}</div>
        </div>
        <div className="bg-gray-100 px-5 py-4 flex flex-col justify-center text-right border-l border-gray-200">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Booking</div>
          <div className="text-lg font-bold text-gray-800">{paymentIntentId.slice(-8).toUpperCase()}</div>
        </div>
      </div>

      {/* Keep min height so Stripe iframe can mount; h-0 prevented onReady from ever firing in some browsers */}
      <div className="mb-5 relative min-h-[140px]">
        {!isReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white/90 text-gray-500 text-sm">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Preparing payment form...
          </div>
        )}
        {/* No layout/wallets overrides — Stripe picks order & wallets (e.g. Apple Pay in Safari) from PI + Dashboard */}
        <PaymentElement onReady={handlePaymentElementReady} />
      </div>

      {paymentError && (
        <div className="bg-red-50 border border-red-200 p-3 flex items-start gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{paymentError}</p>
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={!isReady || !stripe || isProcessing}
        className={`w-full py-4 px-6 font-bold text-base tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
          !isReady || !stripe || isProcessing
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            : 'bg-gray-950 hover:bg-gray-800 text-white'
        }`}
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Pay ${amount}
          </>
        )}
      </button>

      <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Lock className="h-3 w-3" />
        Payments processed securely by Stripe
      </div>
    </div>
  );
};

const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
  clientEmail,
  description,
  stripePublishableKey,
  bookingData,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const publishableOk = Boolean(stripePublishableKey?.trim());
  const [stripePromise] = useState(() =>
    publishableOk ? loadStripe(stripePublishableKey) : Promise.resolve(null)
  );

  const missingPublishableMessage =
    'Stripe publishable key is missing. In Vercel → Project → Settings → Environment Variables add VITE_STRIPE_PUBLISHABLE_KEY with your pk_test_... (or pk_live_...) from Stripe Dashboard → Developers → API keys. It must be the same Stripe account as STRIPE_SECRET_KEY (sk_...) in Supabase. Redeploy after saving.';

  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setPaymentIntentId(null);
      setInitError(null);
      setTurnstileToken(null);
      return;
    }

    setClientSecret(null);
    setPaymentIntentId(null);
    setInitError(null);
    setTurnstileToken(null);
    setTurnstileResetKey((k) => k + 1);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !stripePublishableKey?.trim() || !turnstileToken) return;

    let cancelled = false;

    const create = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-payment`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create_payment_intent',
            amount,
            description,
            clientEmail,
            bookingData,
            turnstileToken,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error ?? 'Failed to initialize payment');
        if (!cancelled) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
        }
      } catch (err) {
        if (!cancelled) {
          setInitError(err instanceof Error ? err.message : 'Failed to initialize payment');
        }
      }
    };

    create();
    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    turnstileToken,
    amount,
    description,
    clientEmail,
    bookingData.date,
    bookingData.startTime,
    bookingData.endTime,
    bookingData.duration,
    bookingData.clientName,
    bookingData.clientEmail,
    bookingData.clientPhone,
    bookingData.projectType,
    bookingData.totalPrice,
    bookingData.notes,
    bookingData.agreedToTerms,
    bookingData.termsAgreedAt,
    stripePublishableKey,
  ]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto z-50"
      style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label="Payment"
    >
      <div className="flex min-h-full items-start justify-center p-4 py-8">
      <div className="bg-white max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gray-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-studio-green rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">Pay for Studio</div>
              <div className="text-gray-400 text-xs">Secure payment via Stripe</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!publishableOk ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm whitespace-pre-wrap">{missingPublishableMessage}</p>
            </div>
          </div>
        ) : !turnstileToken ? (
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-3">
              Complete verification to load the secure payment form.
            </p>
            <TurnstileWidget
              siteKey={TURNSTILE_SITE_KEY}
              onVerify={setTurnstileToken}
              onExpire={() => setTurnstileToken(null)}
              resetKey={turnstileResetKey}
            />
          </div>
        ) : initError ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm whitespace-pre-wrap">{initError}</p>
            </div>
          </div>
        ) : !clientSecret ? (
          <div className="p-6 flex items-center justify-center gap-2 py-16 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            Initializing payment...
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#111827',
                  colorBackground: '#ffffff',
                  colorText: '#111827',
                  colorDanger: '#ef4444',
                  fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                  borderRadius: '0px',
                },
              },
            }}
          >
            {paymentIntentId ? (
              <CheckoutForm
                amount={amount}
                paymentIntentId={paymentIntentId}
                clientSecret={clientSecret}
                onPaymentSuccess={onPaymentSuccess}
              />
            ) : null}
          </Elements>
        )}
      </div>
      </div>
    </div>
  );
};

export default StripePaymentModal;
