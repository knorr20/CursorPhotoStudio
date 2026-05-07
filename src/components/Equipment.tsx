import React from 'react';
import { Camera, Lightbulb, Wind, Volume2, Monitor, Palette } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

type EquipmentItem = {
  icon?: React.ReactNode;
  name: string;
  quantity: string;
  description: string;
  imageSrc?: string;
  imageSrcJpg?: string;
  altText?: string;
};

const ADDITIONAL_BACKDROP_COLORS: { hex: string; name: string }[] = [
  { hex: '#FF0000', name: 'Red' },
  { hex: '#DC143C', name: 'Crimson' },
  { hex: '#8B0000', name: 'Dark Red' },
  { hex: '#FF6347', name: 'Tomato' },
  { hex: '#FF4500', name: 'Orange Red' },
  { hex: '#FFA500', name: 'Orange' },
  { hex: '#FFD700', name: 'Gold' },
  { hex: '#FFFF00', name: 'Yellow' },
  { hex: '#9ACD32', name: 'Yellow Green' },
  { hex: '#32CD32', name: 'Lime Green' },
  { hex: '#228B22', name: 'Forest Green' },
  { hex: '#006400', name: 'Dark Green' },
  { hex: '#008B8B', name: 'Dark Cyan' },
  { hex: '#00CED1', name: 'Dark Turquoise' },
  { hex: '#00BFFF', name: 'Deep Sky Blue' },
  { hex: '#0000FF', name: 'Blue' },
  { hex: '#000080', name: 'Navy' },
  { hex: '#4B0082', name: 'Indigo' },
  { hex: '#8A2BE2', name: 'Blue Violet' },
  { hex: '#9932CC', name: 'Dark Orchid' },
  { hex: '#FF00FF', name: 'Magenta' },
  { hex: '#FF1493', name: 'Deep Pink' },
  { hex: '#FFB6C1', name: 'Light Pink' },
  { hex: '#F5DEB3', name: 'Wheat' },
  { hex: '#DEB887', name: 'Burlywood' },
  { hex: '#D2691E', name: 'Chocolate' },
  { hex: '#8B4513', name: 'Saddle Brown' },
  { hex: '#A0522D', name: 'Sienna' },
  { hex: '#696969', name: 'Dim Gray' },
  { hex: '#2F4F4F', name: 'Dark Slate Gray' },
];

const Equipment = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.2 });
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal({ threshold: 0.05 });
  const { ref: backdropRef, isVisible: backdropVisible } = useScrollReveal({ threshold: 0.1 });

  const allEquipment: EquipmentItem[] = [
    {
      icon: <Lightbulb className="h-6 w-6" />,
      name: "Profoto D2 500Ws AirTTL Monolights",
      quantity: "2x",
      description: "Professional studio lighting",
      imageSrc: "/d-2 2x.png",
      imageSrcJpg: "/d-2 2x.jpg",
      altText: "Profoto D2 500Ws AirTTL Monolight professional studio lighting equipment"
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      name: "Profoto Pro-D3 750Ws Monolight",
      quantity: "1x",
      description: "High-power studio light",
      imageSrc: "/d-3 1x.png",
      imageSrcJpg: "/d-3 1x.jpg",
      altText: "Profoto Pro-D3 750Ws Monolight high-power professional studio lighting"
    },
    {
      icon: <Monitor className="h-6 w-6" />,
      name: "Profoto Strip Softbox (1 x 4', Silver Interior)",
      quantity: "2x",
      description: "Strip lighting modifier",
      imageSrc: "/strip 1x4 profoto 23 films.png",
      imageSrcJpg: "/strip 1x4 profoto 23 films.jpg",
      altText: "Profoto Strip Softbox 1x4 feet with silver interior for professional photography lighting"
    },
    {
      name: "Profoto Zoom Reflector 2",
      quantity: "2x",
      description: "Light focusing reflector",
      imageSrc: "/Zoom_reflector_profoto.png",
      imageSrcJpg: "/Zoom_reflector_profoto.jpg",
      altText: "Profoto Zoom Reflector 2 light focusing reflector for studio photography"
    },
    {
      name: "Profoto Rectangular Softbox (3 x 4', Silver Interior)",
      quantity: "1x",
      description: "Large softbox modifier",
      imageSrc: "/profoto_201505_rectangular_softbox_3_x_1726738217_1848650 (1)-1.png",
      imageSrcJpg: "/profoto_201505_rectangular_softbox_3_x_1726738217_1848650 (1)-1.jpg",
      altText: "Profoto Rectangular Softbox 3x4 feet with silver interior for professional studio lighting and photography"
    },
    {
      name: "Profoto Silver Softlight Beauty Dish Reflector - 20.5\"",
      quantity: "1x",
      description: "Beauty dish for portraits",
      imageSrc: "/Profoto-Beauty-Dish-Silver.png",
      imageSrcJpg: "/Profoto-Beauty-Dish-Silver.jpg",
      altText: "Profoto Silver Softlight Beauty Dish Reflector for professional studio photography and portraits"
    },
    {
      name: "V-FLAT WORLD Foldable V-Flat 2.0",
      quantity: "2x",
      description: "Light control panels",
      imageSrc: "/Foldable-V-Flat-BlackWhite-23.png",
      imageSrcJpg: "/Foldable-V-Flat-BlackWhite-23.jpg",
      altText: "V-FLAT WORLD Foldable V-Flat 2.0 light control panels for professional studio photography lighting control"
    },
    {
      name: "Heavy Duty Direct Drive Tilt Drum Fan",
      quantity: "1x",
      description: "Air circulation and effects",
      imageSrc: "/orange-commercial-electric-industrial-fans.png",
      imageSrcJpg: "/orange-commercial-electric-industrial-fans.jpg",
      altText: "Heavy Duty Direct Drive Tilt Drum Fan for studio air circulation and special effects"
    },
    {
      name: "Bluetooth Speaker",
      quantity: "1x",
      description: "High-quality audio for shoots",
      imageSrc: "/bose speaker.png",
      imageSrcJpg: "/bose speaker.jpg",
      altText: "Bose Bluetooth Speaker for studio audio in Los Angeles, Burbank - perfect for music during photo shoots at 23 Photo Studio"
    },
    {
      icon: <Monitor className="h-6 w-6" />,
      name: "Backdrop holder and stands",
      quantity: "1x",
      description: "Background support system",
      imageSrc: "/BACKGROUNDS.png",
      imageSrcJpg: "/BACKGROUNDS.jpg",
      altText: "Professional backdrop holder and stands system for photography at 23 Photo Studio in North Hollywood, Los Angeles - supports seamless paper rolls and fabric backgrounds"
    }
  ];

  const backdropOptions = [
    {
      option: "FREE",
      description: "If the backdrop <strong>doesn't touch the floor and remains undamaged</strong>"
    },
    {
      option: "$30",
      description: "One backdrop sweep. <strong>Up to 6 ft</strong> on the floor"
    },
    {
      option: "$60",
      description: "More than one backdrop sweep. You are using <strong>more than 6 ft</strong> on the floor"
    },
    {
      option: "$80",
      description: "<strong>A full seamless paper roll</strong>. Size 107\"x36'"
    }
  ];

  return (
    <section id="equipment" className="pt-20 pb-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className={`text-center mb-16 ${headerVisible ? 'animate-fade-in-up' : ''}`}>
          <h2 className="text-4xl font-heading font-black text-gray-900 mb-4 uppercase">What's Included</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything in this list is part of every booking — no extras to rent.
          </p>
        </div>

        {/* All Equipment */}
        <div className="mb-16" ref={gridRef}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allEquipment.map((item, index) => (
              <div
                key={index}
                className={`bg-gray-50 p-6 hover:shadow-lg transition-shadow duration-300 ${
                  gridVisible ? 'animate-fade-in-up' : ''
                }`}
                style={gridVisible ? { animationDelay: `${index * 80}ms` } : undefined}
              >
                <div className="text-center">
                  {item.imageSrc ? (
                    <div className="mb-4 flex justify-center">
                      <picture>
                        {item.imageSrcJpg ? <source srcSet={item.imageSrcJpg} type="image/jpeg" /> : null}
                        <img
                          src={item.imageSrc}
                          alt={item.altText || `${item.name} - Professional studio equipment available for rental`}
                          className="h-24 w-24 object-contain"
                          loading="lazy"
                          decoding="async"
                          width={96}
                          height={96}
                        />
                      </picture>
                    </div>
                  ) : (
                    <div className="text-gray-700 mb-4 flex justify-center">
                      {item.icon}
                    </div>
                  )}
                  <div className="bg-gray-900 text-white px-2 py-1 rounded text-sm font-heading font-black mb-3 inline-block">
                    {item.quantity}
                  </div>
                  <h4 className="font-heading font-black text-gray-900 mb-2">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paper Backdrop Options */}
        <div className="bg-gray-50 p-8" ref={backdropRef}>
          <h3 className={`text-2xl font-heading font-black text-gray-900 mb-8 text-center ${backdropVisible ? 'animate-fade-in-up' : ''}`}>Paper Backdrop Options</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {backdropOptions.map((option, index) => (
              <div
                key={index}
                className={`bg-white p-6 border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200 text-center md:text-left ${
                  backdropVisible ? 'animate-fade-in-up' : ''
                }`}
                style={backdropVisible ? { animationDelay: `${index * 100}ms` } : undefined}
              >
                <div className="flex flex-col items-center justify-center mb-3 md:flex-row md:items-center md:justify-between">
                  <span className="text-2xl font-heading font-black text-gray-900">{option.option}</span>
                </div>
                <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: option.description }}></p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <h4 className="text-lg font-heading font-black text-gray-900 mb-4">Always Available Colors</h4>
            <div className="flex justify-center gap-4 mb-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-black mb-2"></div>
                <span className="text-sm font-heading font-black">Black</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-500 mb-2"></div>
                <span className="text-sm font-heading font-black">Grey</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white border-2 border-gray-300 mb-2"></div>
                <span className="text-sm font-heading font-black">White</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              For any other color, please check availability before your visit
            </p>
            
            {/* Additional Color Options — collapsed by default to reduce visual noise */}
            <details className="mt-4 group">
              <summary className="cursor-pointer list-none inline-flex items-center gap-2 text-sm font-heading font-black uppercase tracking-wide text-studio-green hover:text-studio-green-darker">
                <span className="group-open:hidden">Show all 30+ available colors</span>
                <span className="hidden group-open:inline">Hide colors</span>
                <span className="text-xs">▾</span>
              </summary>
              <div className="mt-4">
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                  {ADDITIONAL_BACKDROP_COLORS.map(({ hex, name }) => (
                    <div
                      key={hex}
                      title={name}
                      aria-label={name}
                      role="img"
                      className="w-6 h-6 border border-gray-300"
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
                <p className="text-gray-500 text-xs text-center">
                  Hover over any color for its name. Additional colors available upon request.
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Equipment;