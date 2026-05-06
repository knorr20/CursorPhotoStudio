import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onNavigateAndScroll: (sectionId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateAndScroll }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isStudioPage = location.pathname === '/studio';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    onNavigateAndScroll(sectionId);
    setIsMenuOpen(false);
  };

  const showSolid = !isHomePage || isScrolled || isMenuOpen;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      showSolid
        ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm'
        : 'bg-transparent border-b border-transparent'
    }`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-studio-green focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Now clickable home link */}
          <button
            onClick={() => onNavigateAndScroll('home')}
            className="hover:opacity-80 transition-opacity duration-200"
            aria-label="Go to 23 Photo Studio homepage"
          >
            <picture>
              <source srcSet="/IMG_2896-2.jpg" type="image/jpeg" />
              <img
                src="/IMG_2896-2.png"
                alt="23 Photo Studio logo - Professional photo studio rental North Hollywood"
                className={`h-10 w-auto transition-all duration-300 ${showSolid ? '' : 'brightness-0 invert'}`}
                width={512}
                height={496}
                decoding="async"
              />
            </picture>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8" aria-label="Main navigation">
            <Link
              to="/studio"
              onClick={() => setIsMenuOpen(false)}
              aria-current={isStudioPage ? 'page' : undefined}
              className={`transition-colors duration-300 font-heading font-black uppercase ${
                showSolid ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'
              } ${isStudioPage ? 'underline underline-offset-4 decoration-2' : ''}`}
            >
              Studio tour
            </Link>
            <button
              onClick={() => scrollToSection('equipment')}
              className={`transition-colors duration-300 font-heading font-black uppercase ${
                showSolid ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'
              }`}
            >
              Equipment
            </button>
            <button
              onClick={() => scrollToSection('booking')}
              className={`transition-colors duration-300 font-heading font-black uppercase ${
                showSolid ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'
              }`}
            >
              Book Studio
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className={`transition-colors duration-300 font-heading font-black uppercase ${
                showSolid ? 'text-gray-700 hover:text-gray-900' : 'text-white/90 hover:text-white'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-md transition-colors duration-300 ${
              showSolid ? 'text-gray-700 hover:text-gray-900' : 'text-white hover:text-white/80'
            }`}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-gray-200 bg-white" aria-label="Mobile navigation">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/studio"
                onClick={() => setIsMenuOpen(false)}
                aria-current={isStudioPage ? 'page' : undefined}
                className={`block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 font-heading font-black uppercase ${
                  isStudioPage ? 'text-studio-green' : ''
                }`}
              >
                Studio tour
              </Link>
              <button
                onClick={() => scrollToSection('equipment')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 font-heading font-black uppercase"
              >
                Equipment
              </button>
              <button
                onClick={() => scrollToSection('booking')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 font-heading font-black uppercase"
              >
                Book Studio
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200 font-heading font-black uppercase"
              >
                Contact
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;