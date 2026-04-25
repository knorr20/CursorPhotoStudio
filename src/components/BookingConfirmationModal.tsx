import React, { useEffect, useRef } from 'react';
import { Mail, X, Calendar, Clock, DollarSign, User, Phone, Camera, CheckCircle } from 'lucide-react';
import { Booking } from '../types/booking';

interface BookingConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: Omit<Booking, 'id' | 'createdAt'> | null;
  paid?: boolean;
}

const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  isOpen,
  onClose,
  bookingDetails,
  paid = false,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !bookingDetails) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-label="Booking confirmation">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-studio-green to-studio-green-darker text-white p-8">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-200"
            aria-label="Close confirmation"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {paid ? <CheckCircle className="h-10 w-10 text-white" /> : <Mail className="h-10 w-10 text-white" />}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {paid ? 'Booking Confirmed!' : 'Booking Request Received!'}
            </h2>
            <p className="text-white/80 text-lg">
              {paid
                ? 'Payment successful — your studio time is secured'
                : 'Your studio rental request has been submitted successfully'}
            </p>
          </div>
        </div>

        <div className="p-8">
          {/* Payment status banner */}
          {paid ? (
            <div className="bg-green-50 border border-green-200 p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-green-900">Payment Successful</div>
                <div className="text-sm text-green-700">A receipt has been sent to {bookingDetails.clientEmail}</div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-4 mb-6 flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <span className="font-semibold">Payment pending.</span> We will contact you to arrange payment before your session.
              </div>
            </div>
          )}

          {/* Booking Details */}
          <div className="bg-gray-50 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Date</div>
                    <div className="font-semibold text-gray-900">{formatDate(bookingDetails.date)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Time</div>
                    <div className="font-semibold text-gray-900">
                      {bookingDetails.startTime} - {bookingDetails.endTime}
                    </div>
                    <div className="text-sm text-gray-500">Duration: {bookingDetails.duration}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Project Type</div>
                    <div className="font-semibold text-gray-900">{bookingDetails.projectType}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Total Cost</div>
                    <div className="font-bold text-2xl text-studio-green">${bookingDetails.totalPrice}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-studio-green/10 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-studio-green" />
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-semibold text-gray-900">{bookingDetails.clientName}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-studio-green" />
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-semibold text-gray-900">{bookingDetails.clientEmail}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-studio-green" />
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-semibold text-gray-900">{bookingDetails.clientPhone}</div>
                </div>
              </div>
            </div>

            {bookingDetails.notes && (
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-1">Additional Notes</div>
                <div className="text-gray-900 bg-white p-3 border">{bookingDetails.notes}</div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          {paid ? (
            <div className="bg-gray-50 border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">What Happens Next?</h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-studio-green text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold">Confirmation Email</div>
                    <div className="text-sm">Check your inbox for a booking confirmation and payment receipt</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-studio-green text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold">Studio Access Details</div>
                    <div className="text-sm">We'll send access instructions and setup info before your session</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">What Happens Next?</h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold">Confirmation Call</div>
                    <div className="text-sm">We'll contact you within 24 hours to confirm your booking details</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold">Payment & Final Details</div>
                    <div className="text-sm">We'll discuss payment options and any special requirements for your shoot</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold">Studio Access</div>
                    <div className="text-sm">You'll receive studio access details and setup instructions before your session</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="bg-gray-900 text-white p-6 mb-6">
            <h3 className="text-lg font-bold mb-3">Need to Make Changes?</h3>
            <p className="text-gray-300 mb-4">
              If you need to modify or cancel your booking, please contact us as soon as possible:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <a href="tel:+12133359103" className="text-white/95 hover:text-white underline-offset-2 hover:underline">
                  +1 (213) 335-9103
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>LA23PRODUCTION@GMAIL.COM</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-studio-green text-white py-3 px-6 font-semibold hover:bg-studio-green-darker transition-colors duration-200 text-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
