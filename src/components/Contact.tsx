import React, { useCallback, useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Navigation } from 'lucide-react';
import DirectionsModal from './DirectionsModal';
import TurnstileWidget from './TurnstileWidget';
import { formatPhoneNumber } from '../utils/phoneFormat';
import { useScrollReveal } from '../hooks/useScrollReveal';

const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string) ?? '';

const Contact = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: contentRef, isVisible: contentVisible } = useScrollReveal({ threshold: 0.1 });
  const { ref: mapRef, isVisible: mapVisible } = useScrollReveal({ threshold: 0.15 });
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const studioAddress = "10710 BURBANK BLVD, NORTH HOLLYWOOD, CA 91601";
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [honeypotValue, setHoneypotValue] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      setSubmitStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Use spam protection edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spam-protection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          type: 'contact',
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            message: formData.message,
            status: 'new'
          },
          honeypot: honeypotValue,
          turnstileToken,
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setHoneypotValue('');
      setTurnstileToken(null);
      setTurnstileResetKey((k) => k + 1);
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className={`text-center mb-16 ${headerVisible ? 'animate-fade-in-up' : 'scroll-hidden'}`}>
          <h2 className="text-4xl font-heading font-black text-gray-900 mb-4 uppercase">Contact Us</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about our photo and video studio rental? Get in touch with us today
          </p>
        </div>

        <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className={contentVisible ? 'animate-fade-in-up' : 'scroll-hidden'} style={contentVisible ? { animationDelay: '100ms' } : undefined}>
            <h3 className="text-2xl font-heading font-black text-gray-900 mb-8">Contact details</h3>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                  <div className="font-heading font-black text-gray-900">Phone</div>
                  <a href="tel:+12133359103" className="text-gray-600 hover:text-gray-900 transition-colors">
                    +1 (213) 335-9103
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                  <div className="font-heading font-black text-gray-900">Email</div>
                  <a
                    href="mailto:la23production@gmail.com"
                    className="text-gray-600 hover:text-gray-900 transition-colors break-all"
                  >
                    la23production@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                  <div className="font-heading font-black text-gray-900">Address</div>
                  <div className="text-gray-600">10710 BURBANK BLVD<br />NORTH HOLLYWOOD, CA, 91601</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-gray-900" />
                </div>
                <div>
                  <div className="font-heading font-black text-gray-900">Availability</div>
                  <div className="text-gray-600">7 days a week<br />Flexible hours by appointment</div>
                </div>
              </div>
            </div>

            {/* Studio Image */}
            <div className="mt-8 overflow-hidden">
              <img
                src="https://23photostudio.com/23photostudio.jpg"
                alt="23 Photo Studio exterior"
                className="w-full h-48 object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className={contentVisible ? 'animate-fade-in-up' : 'scroll-hidden'} style={contentVisible ? { animationDelay: '250ms' } : undefined}>
            <h3 className="text-2xl font-heading font-black text-gray-900 mb-8">Send Us a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot field - hidden from users but visible to bots */}
              <input
                type="text"
                name="website"
                value={honeypotValue}
                onChange={(e) => setHoneypotValue(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-200"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-200"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-200"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors duration-200"
                  placeholder="Tell us about your project and studio needs..."
                />
              </div>

              <div className="space-y-2">
                <span className="block text-sm font-medium text-gray-700">Verification</span>
                <TurnstileWidget
                  siteKey={TURNSTILE_SITE_KEY}
                  onVerify={setTurnstileToken}
                  onExpire={handleTurnstileExpire}
                  resetKey={turnstileResetKey}
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || !turnstileToken}
                className="w-full bg-studio-green text-white px-6 py-3 hover:bg-studio-green-darker transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-heading font-black uppercase"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
            
            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-800" role="alert">
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  <span className="font-semibold">Message sent successfully!</span>
                </div>
                <p className="text-sm mt-1">Thank you for your message. We'll get back to you soon.</p>
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800" role="alert">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <span className="font-semibold">Failed to send message</span>
                </div>
                <p className="text-sm mt-1">
                  Please try again or contact us directly at{' '}
                  <a href="tel:+12133359103" className="underline font-medium">
                    +1 (213) 335-9103
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Studio Location Section - Centered Below */}
        <div ref={mapRef} className={`mt-16 max-w-4xl mx-auto ${mapVisible ? 'animate-fade-in-up' : 'scroll-hidden'}`}>
          <h3 className="text-2xl font-heading font-black text-gray-900 mb-8 text-center">Studio Location</h3>
          <div className="bg-gray-50 p-6 border border-gray-200">
            <div className="relative w-full h-64 overflow-hidden mb-4">
              <iframe
                src="https://maps.google.com/maps?q=10710%20Burbank%20Blvd%2C%20North%20Hollywood%2C%20CA%2091601&t=&z=15&ie=UTF8&iwloc=B&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="23 Photo Studio Location"
              />
            </div>
            <button
              onClick={() => setShowDirectionsModal(true)}
              className="flex items-center justify-center gap-2 text-white hover:text-white transition-colors duration-200 text-sm w-full py-3 px-6 bg-studio-green hover:bg-studio-green-darker font-heading font-black uppercase"
            >
              <Navigation className="h-4 w-4" />
              Get Directions
            </button>
          </div>
        </div>
      </div>

      {/* Directions Modal */}
      <DirectionsModal
        isOpen={showDirectionsModal}
        onClose={() => setShowDirectionsModal(false)}
        address={studioAddress}
      />
    </section>
  );
};

export default Contact;