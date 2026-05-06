import React from 'react';
import { Link } from 'react-router-dom';
import PageSeo from '../components/PageSeo';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, FileText, AlertTriangle, DollarSign, Clock, Shield, Camera } from 'lucide-react';

interface TermsOfServicePageProps {
  onNavigateAndScroll: (sectionId: string) => void;
}

const TERMS_SEO = {
  title: 'Terms of Service | 23 Photo Studio North Hollywood',
  description:
    'Review the Terms of Service for 23 Photo Studio rentals in North Hollywood, including booking, payments, cancellation, and studio rules.',
  canonicalPath: '/terms',
} as const;

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ onNavigateAndScroll }) => {
  return (
    <div className="min-h-screen bg-white">
      <PageSeo
        title={TERMS_SEO.title}
        description={TERMS_SEO.description}
        canonicalPath={TERMS_SEO.canonicalPath}
      />
      <Header onNavigateAndScroll={onNavigateAndScroll} />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-studio-green to-studio-green-darker">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-heading font-black text-white mb-4">Terms of Service</h1>
            <p className="text-xl text-white/80 mb-8">
              Please read these terms carefully before using our studio rental services.
            </p>
            <div className="text-white/60 text-sm">
              Last updated: January 2025
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back to Home Link */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-studio-green hover:text-studio-green-darker transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>

          {/* Terms of Service Content */}
          <div id="terms-of-service-content" className="prose prose-lg max-w-none">
            <div className="bg-gray-50 p-8 rounded-lg mb-8">
              <p className="text-gray-700 mb-4">
                <strong>Effective Date:</strong> January 2025
              </p>
              <p className="text-gray-700">
                These Terms of Service ("Terms") govern your use of services provided by 23 Production LLC ("we," "our," or "us"), operating the website and brand "23 Photo Studio." By booking with us or using our services, you agree to these Terms.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4 flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-studio-green" />
                1. Bookings and Payment
              </h2>
              <ul className="list-none space-y-2 text-gray-700">
                <li>Bookings are subject to availability.</li>
                <li>Full payment is required to confirm a reservation.</li>
                <li>Prices and availability are subject to change without notice until payment is received.</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4 flex items-center gap-3">
                <Clock className="h-6 w-6 text-studio-green" />
                2. Cancellation and Refunds
              </h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">By Client:</h3>
                  <ul className="list-none space-y-1">
                    <li>Cancellations made more than 48 hours before the scheduled time may receive a full refund.</li>
                    <li>Cancellations within 48 hours are non-refundable unless otherwise agreed.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">By Studio:</h3>
                  <ul className="list-none space-y-1">
                    <li>We reserve the right to cancel any confirmed booking due to unforeseen circumstances or at our discretion.</li>
                    <li>In such cases, a full refund will be issued, and we are not responsible for any additional costs, losses, or inconvenience caused by the cancellation.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4 flex items-center gap-3">
                <Camera className="h-6 w-6 text-studio-green" />
                3. Studio Rules
              </h2>
              <p className="text-gray-700 mb-4">
                By booking, you agree to follow all posted and communicated studio rules. These include:
              </p>
              <ul className="list-none space-y-2 text-gray-700">
                <li>No smoking or illegal substances.</li>
                <li>No pets unless previously approved.</li>
                <li>No glitter, confetti, or open flames.</li>
                <li>All equipment and property must be used with care.</li>
                <li>Overtime is billed in 30-minute increments.</li>
                <li>You are responsible for all guests and any damage during your booking.</li>
              </ul>
              <p className="text-gray-700 mt-4">
                A full list of rules is posted in the studio and provided before your session.
              </p>
            </div>

            <div className="bg-gray-50 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4 flex items-center gap-3">
                <Shield className="h-6 w-6 text-gray-600" />
                4. Liability and Waiver
              </h2>
              <ul className="list-none space-y-2 text-gray-700">
                <li>You acknowledge that studio use involves inherent risks.</li>
                <li>You agree to use the space responsibly and release 23 Production LLC and its staff from any liability for personal injury, property damage, or loss.</li>
                <li>We may require you to sign a separate waiver of liability prior to entry.</li>
                <li>If the person who booked the session is not the person attending, it is your responsibility to ensure that all attending parties are aware of and comply with these Terms and sign any necessary waivers.</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">5. Equipment Rental (if applicable)</h2>
              <ul className="list-none space-y-2 text-gray-700">
                <li>Rented equipment must be returned in the condition provided.</li>
                <li>You are liable for any damage, loss, or theft.</li>
                <li>Late returns may result in additional fees.</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">6. Use of Content</h2>
              <ul className="list-none space-y-2 text-gray-700">
                <li>We may request to use behind-the-scenes content (with your consent) for promotional purposes.</li>
                <li>All rights to your content remain yours unless otherwise agreed in writing.</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">7. Termination</h2>
              <p className="text-gray-700">
                We may terminate or refuse service to anyone who violates our policies or behaves inappropriately, without refund.
              </p>
            </div>

            <div className="bg-gray-50 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700">
                We are not responsible for any indirect, incidental, or consequential damages. Maximum liability is limited to the amount paid for the booking.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700">
                We may modify these Terms at any time. Updated Terms will be posted online. Continued use of our services indicates acceptance of the revised Terms.
              </p>
            </div>

            <div className="bg-gray-50 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">10. Governing Law</h2>
              <p className="text-gray-700">
                These Terms are governed by the laws of the State of California, without regard to its conflict of law provisions.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions, contact:
              </p>
              <div className="space-y-2 text-gray-700">
                <div><strong>23 Production LLC</strong></div>
                <div>10710 Burbank Blvd</div>
                <div>North Hollywood, CA 91601</div>
                <div>Email: LA23PRODUCTION@GMAIL.COM</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigateAndScroll={onNavigateAndScroll} />
    </div>
  );
};

export default TermsOfServicePage;