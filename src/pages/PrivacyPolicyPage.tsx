import React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, Shield, Eye, Lock, Database, Mail, Phone } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigateAndScroll: (sectionId: string) => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigateAndScroll }) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy | 23 Photo Studio North Hollywood';

    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    const setCanonical = (href: string) => {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = href;
    };

    setMeta(
      'description',
      'Read the Privacy Policy for 23 Photo Studio in North Hollywood, including how booking and contact information is collected and used.'
    );
    setCanonical('https://23photostudio.com/privacy');
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigateAndScroll={onNavigateAndScroll} />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-studio-green to-studio-green-darker">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-heading font-black text-white mb-4">Privacy Policy</h1>
            <p className="text-xl text-white/80 mb-8">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <div className="text-white/60 text-sm">
              Last updated: July 2025
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

          {/* Privacy Policy Content */}
          <div id="privacy-policy-content" className="prose prose-lg max-w-none">
            <div className="bg-gray-50 p-8 rounded-lg mb-8">
              <p className="text-gray-700 mb-4">
                <strong>Effective Date:</strong> July 2025
              </p>
              <p className="text-gray-700">
                This Privacy Policy describes how 23 Production LLC ("we," "our," or "us"), operating the website and brand "23 Photo Studio," collects, uses, and shares your personal information when you visit or interact with our services, including studio bookings, rental equipment, and production services.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">1. Information We May Collect</h2>
              <p className="text-gray-700 mb-4">
                We may collect the following categories of information:
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li>Contact information, such as name, email, phone number.</li>
                <li>Booking details, date, time, and service requested.</li>
                <li>Communication data, emails, messages, and interactions.</li>
                <li>Device and usage information, IP address, browser type, and visit data.</li>
                <li>Location data, if enabled by your device.</li>
                <li>Marketing preferences, if you opt in.</li>
                <li>Payment information, processed securely by third-party providers (e.g., Stripe); we do not store payment data.</li>
                <li>Any other information you voluntarily provide.</li>
              </ul>
              <p className="text-gray-700 mt-4">
                You are responsible for the accuracy of the information you provide.
              </p>
            </div>

            <div className="bg-gray-50 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">2. How We May Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We may use your information to:
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li>Process bookings and respond to inquiries.</li>
                <li>Provide and manage services.</li>
                <li>Send transactional messages related to your booking.</li>
                <li>Send promotional content if you have explicitly opted in, as permitted by law.</li>
                <li>May improve our services and website, where permitted.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">3. Marketing and Email Communication</h2>
              <p className="text-gray-700 mb-4">
                By completing a booking and agreeing via the consent checkbox, you authorize us to send transactional email communications related to your booking (e.g., confirmations, reminders, schedule updates).
              </p>
              <p className="text-gray-700 mb-4">
                If you opt in to receive marketing communications, we may send you promotional emails about discounts, new offerings, or updates.
              </p>
              <p className="text-gray-700">
                You can opt out of marketing emails at any time by clicking "unsubscribe" in any promotional email.
              </p>
            </div>

            <div className="bg-gray-50 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">4. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not sell or rent your personal data. We may share information:
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li>With trusted service providers who perform services on our behalf (e.g., payment processors, email platforms).</li>
                <li>In connection with business transfers (e.g., merger, acquisition, or asset sale).</li>
                <li>To comply with legal obligations or law enforcement requests.</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We are not responsible for the privacy practices of third-party services linked to or used by our website.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">5. Legal Basis for Processing</h2>
              <p className="text-gray-700">
                We process personal information in accordance with applicable laws, including based on your consent, contract performance, or legal obligations, as allowed by law.
              </p>
            </div>

            <div className="bg-gray-50 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We aim to apply commercially reasonable safeguards, but make no representations or warranties regarding security. While we take all reasonable steps to protect your information and maintain security, this Privacy Policy does not constitute a guarantee of absolute security or privacy. You acknowledge and accept that no method of data transmission or storage is completely secure.
              </p>
              <p className="text-gray-700">
                We will notify you of any data breach if legally required. We disclaim all warranties regarding data security.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">
                We use essential storage to keep booking and security-related functionality working. Optional analytics and marketing technologies load only after your consent in our cookie banner.
              </p>
              <ul className="list-none text-gray-700 space-y-2">
                <li><strong>Essential:</strong> fraud prevention, booking/session state, and required infrastructure.</li>
                <li><strong>Analytics (optional):</strong> usage measurement to improve pages and booking flow.</li>
                <li><strong>Marketing (optional):</strong> third-party widgets and ad-related measurement after consent.</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Third-party processors may include Stripe (payments), Supabase (data infrastructure), and Elfsight (embedded widgets when enabled). To withdraw consent, adjust your browser storage settings and re-open the site to make new choices in the banner.
              </p>
            </div>

            <div className="bg-gray-50 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">8. Your Rights</h2>
              <p className="text-gray-700 mb-4">
                Depending on your jurisdiction, you may have the right to access, correct, or delete your personal information. Requests will be handled within a reasonable timeframe, subject to applicable law.
              </p>
              <p className="text-gray-700 mb-4">
                These rights apply to US residents only, unless otherwise stated.
              </p>
              <p className="text-gray-700">
                We may deny requests if not feasible or legally required.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Our services are not intended for children under the age of 13. We do not knowingly collect data from children under 13. If you believe we have collected such data, please contact us.
              </p>
            </div>

            <div className="bg-gray-50 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. Changes will be posted on this page. Your continued use of our website or services after changes constitutes acceptance of the revised policy. We are not liable for non-material changes. We will notify users of material changes via email or site notice.
              </p>
            </div>

            <div className="bg-white border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy, contact us at:
              </p>
              <div className="space-y-2 text-gray-700">
                <div><strong>23 Production LLC</strong></div>
                <div>10710 Burbank Blvd</div>
                <div>North Hollywood, CA 91601</div>
                <div>Email: LA23PRODUCTION@GMAIL.COM</div>
              </div>
              <p className="text-gray-700 mt-4">
                We aim to respond within a reasonable timeframe.
              </p>
            </div>

            <div className="bg-gray-50 p-8">
              <h2 className="text-2xl font-heading font-black text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700">
                This Privacy Policy is governed by the laws of the State of California, without regard to its conflict of law provisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigateAndScroll={onNavigateAndScroll} />
    </div>
  );
};

export default PrivacyPolicyPage;