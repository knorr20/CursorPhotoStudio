import React from 'react';
import { MapPin, ShieldCheck, Camera, Wrench, DollarSign, Clock } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const StudioFeatures = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Prime Location",
      description: "Heart of North Hollywood with easy access and convenient parking"
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: "Safe & Quiet",
      description: "Quiet and safe neighborhood perfect for professional shoots"
    },
    {
      icon: <Camera className="h-8 w-8" />,
      title: "Best Included Gear",
      description: "Top-tier professional equipment included in your base rental price"
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: "Additional Equipment",
      description: "Extra equipment available on request for specialized needs"
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Best Value",
      description: "Best price-to-quality ratio in Los Angeles area"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Flexible Hours",
      description: "Available weekdays and weekends with competitive hourly rates"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : ''}`}>
          <h2 className="text-4xl font-heading font-black text-gray-900 mb-4">WHY CHOOSE OUR STUDIO</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group ${
                isVisible ? 'animate-fade-in-up' : ''
              }`}
              style={isVisible ? { animationDelay: `${index * 100}ms` } : undefined}
            >
              <div className="flex flex-col items-center text-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0 sm:text-left">
                <div className="text-gray-900 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-heading font-black text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StudioFeatures;