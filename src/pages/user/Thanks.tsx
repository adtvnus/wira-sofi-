
import React, { useState, useEffect } from 'react';
import { useWedding } from '../../contexts/WeddingContext';

const Thanks = () => {
  const { weddingData } = useWedding();
  const { thanksSettings, couple } = weddingData;
  const [apiThanksSettings, setApiThanksSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load thanks settings from API
  useEffect(() => {
    loadThanksSettings();
  }, []);

  const loadThanksSettings = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

      const response = await fetch(`${API_BASE_URL}/thanks-settings`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setApiThanksSettings(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading thanks settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use API data if available, fallback to context data
  const currentSettings = apiThanksSettings || thanksSettings;

  // Generate couple names from weddingData.couple (same as Opening.tsx)
  const getCoupleNames = () => {
    if (couple.groomFirstName && couple.brideFirstName) {
      return `${couple.groomFirstName} & ${couple.brideFirstName}`;
    }
    return currentSettings.coupleNames || 'Wira & Sofi';
  };
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
        <div className="absolute top-10 left-10 w-48 h-48 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 rounded-full opacity-25 blur-3xl animate-float-slower"></div>
        <div className="absolute bottom-16 right-16 w-56 h-56 bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 rounded-full opacity-30 blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/5 w-40 h-40 bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 rounded-full opacity-20 blur-2xl animate-float"></div>
        
        {/* Medium floating elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full opacity-18 blur-xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full opacity-22 blur-xl animate-float-slower"></div>
        
        {/* Small decorative elements */}
        <div className="absolute top-20 right-1/3 w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full opacity-15 blur-lg animate-float"></div>
        <div className="absolute bottom-32 right-1/4 w-28 h-28 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full opacity-18 blur-lg animate-float-slow"></div>
      </div>

      {/* Ornamental Design Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Elegant corner decorations */}
        <div className="absolute top-8 left-8">
          <div className="w-24 h-24 border-l-2 border-t-2 border-amber-200 opacity-40 relative">
            <div className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-amber-300 rounded-full opacity-60"></div>
            <div className="absolute top-4 left-4 w-2 h-2 bg-amber-200 rounded-full opacity-50"></div>
          </div>
        </div>
        <div className="absolute top-8 right-8">
          <div className="w-24 h-24 border-r-2 border-t-2 border-amber-200 opacity-40 relative">
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-300 rounded-full opacity-60"></div>
            <div className="absolute top-4 right-4 w-2 h-2 bg-amber-200 rounded-full opacity-50"></div>
          </div>
        </div>
        <div className="absolute bottom-8 left-8">
          <div className="w-24 h-24 border-l-2 border-b-2 border-amber-200 opacity-40 relative">
            <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-amber-300 rounded-full opacity-60"></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-amber-200 rounded-full opacity-50"></div>
          </div>
        </div>
        <div className="absolute bottom-8 right-8">
          <div className="w-24 h-24 border-r-2 border-b-2 border-amber-200 opacity-40 relative">
            <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-amber-300 rounded-full opacity-60"></div>
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-amber-200 rounded-full opacity-50"></div>
          </div>
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-1/5 left-16 opacity-25">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full animate-pulse"></div>
          <div className="w-6 h-6 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full mt-3 ml-3 animate-pulse delay-75"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-yellow-200 to-amber-200 rounded-full mt-2 ml-1 animate-pulse delay-150"></div>
        </div>
        <div className="absolute bottom-1/5 right-16 opacity-25">
          <div className="w-8 h-8 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full animate-pulse delay-100"></div>
          <div className="w-5 h-5 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full mt-2 mr-2 animate-pulse delay-200"></div>
          <div className="w-2 h-2 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full mt-2 mr-1 animate-pulse"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* Header Decoration */}
        <div className="mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            <div className="mx-8 flex space-x-3">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-rose-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse delay-150"></div>
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse delay-225"></div>
              <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse delay-300"></div>
            </div>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
          </div>
          
          {/* Decorative top flourish */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full blur-md opacity-40"></div>
              <div className="absolute inset-2 w-12 h-12 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full blur-sm opacity-50"></div>
              <div className="absolute inset-4 w-8 h-8 bg-gradient-to-br from-yellow-200 to-amber-200 rounded-full opacity-60"></div>
            </div>
          </div>
        </div>

        {/* Main Thanks Content */}
        <div className="mb-16 animate-slide-up">
          {/* Main title */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-light mb-8 tracking-wider"
            style={{
              color: "#644F44",
              textShadow: "0 4px 12px rgba(100, 79, 68, 0.1)",
            }}
          >
            {currentSettings.headerTitle || "Thank You"}
          </h1>

          {/* Subtitle */}
          <h2
            className="text-3xl md:text-4xl font-light mb-12 tracking-wide opacity-80"
            style={{ color: "#644F44" }}
          >
            {currentSettings.headerSubtitle || "Terima Kasih"}
          </h2>
          
          {/* Decorative separator */}
          <div className="flex items-center justify-center my-12">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            <div className="mx-6 flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-rose-300 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse delay-150"></div>
            </div>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
          </div>
        </div>

        {/* Gratitude Message */}
        <div className="mb-16 animate-fade-in-up">
          <div className="relative inline-block max-w-3xl">
            {/* Background card */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-lg rounded-3xl shadow-xl border border-white/80"></div>
            
            {/* Content */}
            <div className="relative z-10 p-8 md:p-12">
              <p
                className="text-lg md:text-xl leading-relaxed mb-6 font-light"
                style={{ color: "#644F44" }}
              >
                {currentSettings.mainMessage || "Atas kehadiran, doa, dan restu yang telah diberikan dalam hari bahagia kami, kami mengucapkan terima kasih yang sebesar-besarnya."}
              </p>
              
              <p
                className="text-base md:text-lg leading-relaxed opacity-80 italic"
                style={{ color: "#644F44" }}
              >
                {currentSettings.subMessage || "Semoga keberkahan dan kebahagiaan senantiasa menyertai kita semua."}
              </p>
              
              {/* Signature area */}
              <div className="mt-10 pt-8 border-t border-amber-200/50">
                <div className="flex items-center justify-center space-x-4">
                  {(() => {
                    const coupleNames = getCoupleNames();
                    return coupleNames.includes('&') ? (
                      <>
                        <span
                          className="text-2xl md:text-3xl font-light tracking-wider"
                          style={{ color: "#644F44" }}
                        >
                          {coupleNames.split('&')[0].trim()}
                        </span>
                        <span
                          className="text-xl opacity-60"
                          style={{ color: "#644F44" }}
                        >
                          &
                        </span>
                        <span
                          className="text-2xl md:text-3xl font-light tracking-wider"
                          style={{ color: "#644F44" }}
                        >
                          {coupleNames.split('&')[1].trim()}
                        </span>
                      </>
                    ) : (
                      <span
                        className="text-2xl md:text-3xl font-light tracking-wider"
                        style={{ color: "#644F44" }}
                      >
                        {coupleNames}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            {/* Card decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full opacity-40"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full opacity-50"></div>
            <div className="absolute top-1/2 -left-2 w-4 h-4 bg-gradient-to-br from-yellow-300 to-amber-300 rounded-full opacity-35"></div>
            <div className="absolute top-1/4 -right-2 w-5 h-5 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full opacity-40"></div>
          </div>
        </div>

        {/* Final Decorative Element */}
        <div className="mt-16 flex justify-center animate-fade-in-final">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-60"></div>
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-amber-300 rounded-full opacity-50"></div>
              <div className="w-3 h-3 bg-rose-300 rounded-full opacity-60"></div>
              <div className="w-2 h-2 bg-orange-300 rounded-full opacity-50"></div>
            </div>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-60"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/6 left-1/6 w-1 h-1 bg-amber-400 rounded-full animate-float-slow opacity-70"></div>
        <div className="absolute top-1/4 right-1/5 w-1.5 h-1.5 bg-rose-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-orange-400 rounded-full animate-float-slower opacity-50"></div>
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-pink-400 rounded-full animate-float opacity-65"></div>
        <div className="absolute bottom-1/4 right-1/6 w-1.5 h-1.5 bg-amber-300 rounded-full animate-float-slow opacity-55"></div>
        <div className="absolute top-1/5 left-2/3 w-1 h-1 bg-rose-300 rounded-full animate-float-slower opacity-60"></div>
        <div className="absolute bottom-2/3 left-1/5 w-1 h-1 bg-yellow-400 rounded-full animate-float opacity-45"></div>
        <div className="absolute top-3/4 right-2/5 w-1 h-1 bg-orange-300 rounded-full animate-float-slow opacity-50"></div>
        
        {/* Special floating elements */}
        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute bottom-1/2 right-1/2 w-1.5 h-1.5 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full opacity-35 animate-pulse delay-150"></div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Ovo:wght@400&display=swap');

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(50px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delayed {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-final {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(5deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 1.5s ease-out 0.2s both;
        }
        
        .animate-slide-up {
          animation: slide-up 1.3s ease-out 0.5s both;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1.2s ease-out 0.8s both;
        }
        
        .animate-fade-in-delayed {
          animation: fade-in-delayed 1s ease-out 1.2s both;
        }
        
        .animate-fade-in-final {
          animation: fade-in-final 1s ease-out 1.5s both;
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        
        .animate-float-slower {
          animation: float-slower 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Thanks;  