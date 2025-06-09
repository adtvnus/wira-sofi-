import { useState, useEffect } from "react";

interface Quote {
  id: number;
  quote_text: string;
  quote_author: string;
  quote_category: string;
  quote_image_url: string;
  display_order: number;
  created_at: string;
}

const Quotes = () => {
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Fetch active quote from database
  useEffect(() => {
    const fetchActiveQuote = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/quotes/active`);

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setActiveQuote(data.data);
          } else {
            setError(data.message || 'No active quote found');
          }
        } else {
          throw new Error('Failed to fetch quote');
        }
      } catch (error) {
        console.error('Error fetching active quote:', error);
        setError('Failed to load quote');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveQuote();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p style={{ color: "#644F44" }}>Loading quotes...</p>
        </div>
      </div>
    );
  }

  // If error or no active quote, show message
  if (error || !activeQuote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <i className="fas fa-quote-left text-6xl text-amber-300 opacity-50"></i>
          </div>
          <h2 className="text-2xl font-light mb-4" style={{ color: "#644F44" }}>
            No Quote Available
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'No quote has been activated yet.'}
          </p>
          <p className="text-sm text-gray-500">
            Please check back later or contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #f8f6f3 0%, #f1ede8 50%, #ede7e0 100%)",
        fontFamily: "Ovo, serif",
      }}
    >
      {/* Enhanced Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating elements */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 rounded-full opacity-25 blur-2xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 rounded-full opacity-25 blur-2xl animate-float-slower"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 rounded-full opacity-20 blur-xl animate-float"></div>
        
        {/* Medium floating elements */}
        <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full opacity-15 blur-lg animate-float-slow"></div>
        <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full opacity-18 blur-lg animate-float-slower"></div>
        
        {/* Small decorative elements */}
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full opacity-12 blur-md animate-float"></div>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full opacity-15 blur-md animate-float-slow"></div>
      </div>

      {/* Ornamental corners */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-amber-200 opacity-30"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-amber-200 opacity-30"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-amber-200 opacity-30"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-amber-200 opacity-30"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            <div className="mx-6 flex space-x-2">
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-rose-300 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse delay-150"></div>
            </div>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
          </div>
          
          <h2
            className="text-3xl md:text-4xl font-light mb-4 tracking-wider"
            style={{ color: "#644F44" }}
          >
            Words of Love
          </h2>

          <p
            className="text-sm tracking-wide opacity-70"
            style={{ color: "#644F44" }}
          >
            Kata-kata indah tentang cinta dan pernikahan
          </p>
        </div>

        {/* Quote Image and Content Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
          {/* Image Section */}
          <div className="relative animate-slide-in-left">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Decorative frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-transparent to-rose-100/30 z-10 rounded-2xl"></div>
              <div className="absolute -inset-1 bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 rounded-2xl blur-sm opacity-50"></div>
              
              {activeQuote.quote_image_url ? (
                <img
                  src={activeQuote.quote_image_url}
                  alt="Wedding Quote"
                  className="relative z-10 w-full h-80 md:h-96 object-cover rounded-2xl"
                />
              ) : (
                <div className="relative z-10 w-full h-80 md:h-96 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-quote-left text-6xl text-amber-400 opacity-50 mb-4"></i>
                    <p className="text-amber-700 font-medium">Quote Image</p>
                  </div>
                </div>
              )}
              
              {/* Overlay decorations */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/50 z-20"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/50 z-20"></div>
            </div>
            
            {/* Floating elements around image */}
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-60 animate-float"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full opacity-50 animate-float-slow"></div>
          </div>

          {/* Quote Content Section */}
          <div className="relative animate-slide-in-right">
            <div className="relative">
              {/* Quote background */}
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/80"></div>
              
              {/* Quote content */}
              <div className="relative z-10 p-8 md:p-10">
                {/* Quote mark */}
                <div className="mb-6">
                  <span 
                    className="text-6xl font-serif opacity-20 leading-none"
                    style={{ color: "#644F44" }}
                  >
                    "
                  </span>
                </div>
                
                {/* Quote text */}
                <blockquote
                  className="text-lg md:text-xl leading-relaxed mb-6 italic"
                  style={{ color: "#644F44" }}
                >
                  {activeQuote.quote_text}
                </blockquote>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-8 h-px bg-gradient-to-r from-amber-300 to-transparent mr-4"></div>
                  <cite
                    className="text-sm font-medium not-italic tracking-wide"
                    style={{ color: "#644F44" }}
                  >
                    — {activeQuote.quote_author || 'Unknown'}
                  </cite>
                </div>

                {/* Category Badge */}
                <div className="mt-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    activeQuote.quote_category === 'love' ? 'bg-red-100 text-red-800' :
                    activeQuote.quote_category === 'marriage' ? 'bg-blue-100 text-blue-800' :
                    activeQuote.quote_category === 'blessing' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {activeQuote.quote_category}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-40"></div>
            <div className="absolute -bottom-3 -right-3 w-4 h-4 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full opacity-50"></div>
          </div>
        </div>

        {/* Bottom Decorative Section */}
        <div className="text-center animate-fade-in-up">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="w-3 h-3 bg-amber-300 rounded-full animate-pulse"></div>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            <div className="w-4 h-4 bg-rose-300 rounded-full animate-pulse delay-75"></div>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
            <div className="w-3 h-3 bg-amber-300 rounded-full animate-pulse delay-150"></div>
          </div>
          
          <p
            className="text-sm opacity-60 tracking-wider"
            style={{ color: "#644F44" }}
          >
            Semoga kata-kata ini memberikan inspirasi dan keberkahan
          </p>
        </div>
      </div>

      {/* Enhanced Floating Particles Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-1 h-1 bg-amber-300 rounded-full animate-float-slow opacity-70"></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-rose-300 rounded-full animate-float opacity-60"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-float-slower opacity-50"></div>
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-pink-300 rounded-full animate-float opacity-65"></div>
        <div className="absolute bottom-1/4 right-1/5 w-1.5 h-1.5 bg-orange-300 rounded-full animate-float-slow opacity-55"></div>
        <div className="absolute top-1/6 left-2/3 w-1 h-1 bg-amber-200 rounded-full animate-float-slower opacity-60"></div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Ovo:wght@400&display=swap');

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 1.2s ease-out 0.2s both;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 1s ease-out 0.4s both;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 1s ease-out 0.6s both;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 1s both;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Quotes;