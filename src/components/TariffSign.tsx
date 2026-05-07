import React from 'react';
import { Clock, DollarSign, Calendar, Star } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const TariffSign = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.15 });

  return (
    <section className="py-16 bg-studio-green" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 ${isVisible ? 'animate-fade-in-up' : ''}`}>
          <h2 className="text-4xl font-heading font-black text-white mb-4 uppercase">Studio Rental Rates</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Weekday Rates */}
          <div
            className={`bg-white/10 backdrop-blur-sm p-8 border border-white/20 ${isVisible ? 'animate-fade-in-up' : ''}`}
            style={isVisible ? { animationDelay: '150ms' } : undefined}
          >
            <div className="text-center mb-6">
              <Calendar className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-black text-white mb-2 uppercase">Weekday Rates</h3>
              <p className="text-gray-300">Monday - Friday</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-white" />
                  <span className="text-white font-heading font-black">2-4 Hours</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-heading font-black text-white">$50<span className="text-lg">/hr</span></div>
                  <div className="text-sm text-gray-400">2 hour minimum</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-white/5">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-beige" />
                  <span className="text-beige font-heading font-black">5+ Hours</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-heading font-black text-beige">$40<span className="text-lg">/hr</span></div>
                  <div className="text-sm text-beige animate-pulse-badge font-bold">Best Value!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekend Rates */}
          <div
            className={`bg-white/10 backdrop-blur-sm p-8 border border-white/20 ${isVisible ? 'animate-fade-in-up' : ''}`}
            style={isVisible ? { animationDelay: '300ms' } : undefined}
          >
            <div className="text-center mb-6">
              <Calendar className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-black text-white mb-2 uppercase">Weekend Rates</h3>
              <p className="text-gray-300">Saturday - Sunday</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-white" />
                  <span className="text-white font-heading font-black">2-4 Hours</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-heading font-black text-white">$60<span className="text-lg">/hr</span></div>
                  <div className="text-sm text-gray-400">2 hour minimum</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-white/5">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-beige" />
                  <span className="text-beige font-heading font-black">5+ Hours</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-heading font-black text-beige">$50<span className="text-lg">/hr</span></div>
                  <div className="text-sm text-beige animate-pulse-badge font-bold">Best Value!</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TariffSign;