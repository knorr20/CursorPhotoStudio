import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, Camera } from 'lucide-react';
import PageSeo from '../components/PageSeo';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const canonicalPath = location.pathname || '/';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <PageSeo
        title="Page not found | 23 Photo Studio North Hollywood"
        description="The page you requested does not exist on 23 Photo Studio. Return home or use the navigation menu."
        canonicalPath={canonicalPath}
        robots="noindex, nofollow"
      />
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gray-900 flex items-center justify-center mx-auto mb-6">
            <Camera className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-8xl font-heading font-black text-gray-900 mb-2">404</h1>
          <div className="w-16 h-1 bg-studio-green mx-auto mb-6" />
          <h2 className="text-2xl font-heading font-black text-gray-700 uppercase mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-500 text-lg">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-heading font-black uppercase hover:border-gray-400 hover:bg-gray-100 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-studio-green text-white font-heading font-black uppercase hover:bg-studio-green-darker transition-all duration-200"
          >
            <Home className="h-5 w-5" />
            Home Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
