import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, ArrowRight, ExternalLink, Star } from 'lucide-react';

interface FooterProps {
  onNavigateAndScroll: (sectionId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigateAndScroll }) => {
  return (
    <footer className="bg-studio-green text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/IMG_2896-2.png" 
                alt="23 Photo Studio logo - Professional photo studio rental in North Hollywood, Los Angeles" 
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 mb-4">
              Professional photo and video studio rental in North Hollywood. 
              Fully equipped with top-tier equipment at the best price-to-quality ratio in LA.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-heading font-black mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => onNavigateAndScroll('home')}
                  className="hover:text-rich-yellow transition-colors duration-200 text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateAndScroll('studio')}
                  className="hover:text-rich-yellow transition-colors duration-200 text-left"
                >
                  Studio Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateAndScroll('equipment')}
                  className="hover:text-rich-yellow transition-colors duration-200 text-left"
                >
                  Equipment
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateAndScroll('booking')}
                  className="hover:text-rich-yellow transition-colors duration-200 text-left"
                >
                  Book Studio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateAndScroll('contact')}
                  className="hover:text-rich-yellow transition-colors duration-200 text-left"
                >
                  Contact
                </button>
              </li>
              <li><Link to="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-heading font-black mb-4">Pricing</h3>
            <div className="space-y-2 text-gray-400">
              <div>Weekdays: $50/hr (2hr min)</div>
              <div>Weekdays: $40/hr (5+ hrs)</div>
              <div>Weekends: $60/hr (2hr min)</div>
              <div>Weekends: $50/hr (5+ hrs)</div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-heading font-black mb-4">Contact</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4" />
                <a
                  href="tel:+12133359103"
                  className="hover:text-white transition-colors duration-200"
                >
                  +1 (213) 335-9103
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4" />
                <span>LA23PRODUCTION@GMAIL.COM</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4" />
                <span>10710 BURBANK BLVD<br />NORTH HOLLYWOOD, CA 91601</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 mt-6">
              <a
                href="https://www.instagram.com/23rental/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors duration-200"
                aria-label="Follow 23 Rental on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-gray-300 mb-3">Trusted Reviews</p>
              <div className="space-y-3">
                <a
                  href="https://www.google.com/maps?cid=2516701744026527069"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 p-3"
                  aria-label="Open Google Business Profile reviews"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-heading font-black text-white uppercase">Google Business Profile</div>
                      <div className="flex items-center gap-1 mt-1 text-rich-yellow">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <Star className="h-3.5 w-3.5 fill-current" />
                      </div>
                      <p className="text-xs text-gray-300 mt-1">See our verified location, reviews, and latest updates.</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-rich-yellow transition-colors duration-200 flex-shrink-0 mt-0.5" />
                  </div>
                </a>

                <a
                  href="https://www.yelp.com/biz/23-films-studio-north-hollywood"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200 p-3"
                  aria-label="Open Yelp reviews"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-heading font-black text-white uppercase">Yelp Reviews</div>
                      <div className="flex items-center gap-1 mt-1 text-rich-yellow">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <Star className="h-3.5 w-3.5 fill-current" />
                      </div>
                      <p className="text-xs text-gray-300 mt-1">Read client experiences and recent studio feedback on Yelp.</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-rich-yellow transition-colors duration-200 flex-shrink-0 mt-0.5" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Book CTA */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col items-center gap-6">
          <button
            onClick={() => onNavigateAndScroll('booking')}
            className="group bg-rich-yellow text-gray-900 px-8 py-3 font-heading font-black text-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 uppercase"
          >
            BOOK STUDIO TIME
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} 23 Production LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;