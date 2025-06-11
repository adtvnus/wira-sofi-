import { useEffect } from "react";
import { useWedding } from "../../contexts/WeddingContext";

const Groom = () => {
  const { weddingData, isLoading, reloadActiveSettings } = useWedding();
  const groomSettings = weddingData.brideGroomSettings.groomSettings;

  // Load fresh data from database when component mounts
  useEffect(() => {
    reloadActiveSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: "#644F44" }}>Loading...</p>
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
        <div className="absolute top-16 right-16 w-44 h-44 bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 rounded-full opacity-20 blur-3xl animate-float-slower"></div>
        <div className="absolute bottom-20 left-16 w-52 h-52 bg-gradient-to-br from-amber-100 via-orange-100 to-blue-100 rounded-full opacity-25 blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/3 left-1/4 w-36 h-36 bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 rounded-full opacity-18 blur-2xl animate-float"></div>
        
        {/* Medium floating elements */}
        <div className="absolute top-1/4 right-1/3 w-28 h-28 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full opacity-15 blur-xl animate-float-slow"></div>
        <div className="absolute bottom-1/3 left-1/3 w-32 h-32 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full opacity-20 blur-xl animate-float-slower"></div>
        
        {/* Small decorative elements */}
        <div className="absolute top-24 left-24 w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full opacity-12 blur-lg animate-float"></div>
        <div className="absolute bottom-44 right-24 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full opacity-15 blur-lg animate-float-slow"></div>
      </div>

      {/* Ornamental Design Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner decorations */}
        <div className="absolute top-8 right-8">
          <div className="w-20 h-20 border-r-2 border-t-2 border-blue-200 opacity-40 relative">
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-300 rounded-full opacity-60"></div>
          </div>
        </div>
        <div className="absolute top-8 left-8">
          <div className="w-20 h-20 border-l-2 border-t-2 border-blue-200 opacity-40 relative">
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-300 rounded-full opacity-60"></div>
          </div>
        </div>
        
        {/* Floating decorative elements */}
        <div className="absolute top-1/4 right-12 opacity-30">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full mt-2 mr-2 animate-pulse delay-75"></div>
        </div>
        <div className="absolute bottom-1/4 left-12 opacity-30">
          <div className="w-6 h-6 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full animate-pulse delay-150"></div>
          <div className="w-3 h-3 bg-gradient-to-br from-orange-200 to-blue-200 rounded-full mt-2 ml-2 animate-pulse"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl w-full">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
            <div className="mx-8 flex space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
            </div>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
          </div>
          
          <h2
            className="text-3xl md:text-4xl font-light mb-4 tracking-wider"
            style={{ color: "#644F44" }}
          >
            {groomSettings.headerTitle}
          </h2>

          <p
            className="text-sm tracking-wide opacity-70 italic"
            style={{ color: "#644F44" }}
          >
            "{groomSettings.headerSubtitle}"
          </p>
        </div>

        {/* Main Profile Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Content Section - Left Side */}
          <div className="relative animate-slide-in-left order-1">
            {/* Main content card */}
            <div className="relative">
              {/* Background card */}
              <div className="absolute inset-0 bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/90"></div>
              
              {/* Content */}
              <div className="relative z-10 p-10 md:p-12">
                {/* Name section */}
                <div className="mb-12">
                  <div className="mb-6">
                    <span
                      className="text-lg font-light tracking-wider opacity-70 block mb-2"
                      style={{ color: "#644F44" }}
                    >
                      {groomSettings.label}
                    </span>
                    <h1
                      className="text-4xl md:text-5xl lg:text-6xl font-light mb-4"
                      style={{
                        color: "#644F44",
                        textShadow: "0 2px 8px rgba(100, 79, 68, 0.1)",
                        lineHeight: "1.1"
                      }}
                    >
                      {weddingData.couple.groomFirstName}
                    </h1>
                    <h2
                      className="text-2xl md:text-3xl font-light opacity-80 tracking-wide"
                      style={{ color: "#644F44" }}
                    >
                      {weddingData.couple.groomLastName}
                    </h2>
                  </div>
                  
                  {/* Decorative separator */}
                  <div className="flex items-center my-8">
                    <div className="w-12 h-px bg-gradient-to-r from-blue-300 to-transparent"></div>
                    <div className="mx-4 w-3 h-3 bg-blue-300 rounded-full opacity-60"></div>
                    <div className="w-12 h-px bg-gradient-to-l from-blue-300 to-transparent"></div>
                  </div>
                </div>

                {/* Parents section */}
                <div className="mb-10">
                  <h3
                    className="text-lg font-medium mb-6 tracking-wide"
                    style={{ color: "#644F44" }}
                  >
                    {groomSettings.parentLabel}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-300 rounded-full mr-4 animate-pulse"></div>
                      <span
                        className="text-xl font-light tracking-wide"
                        style={{ color: "#644F44" }}
                      >
                        {groomSettings.fatherName}
                      </span>
                    </div>

                    <div className="flex items-center justify-center my-3">
                      <span
                        className="text-lg opacity-60"
                        style={{ color: "#644F44" }}
                      >
                        &
                      </span>
                    </div>

                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-300 rounded-full mr-4 animate-pulse delay-75"></div>
                      <span
                        className="text-xl font-light tracking-wide"
                        style={{ color: "#644F44" }}
                      >
                        {groomSettings.motherName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom decoration */}
                <div className="flex items-center justify-center pt-8">
                  <div className="w-8 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-50"></div>
                  <div className="mx-3 w-2 h-2 bg-blue-300 rounded-full opacity-40"></div>
                  <div className="w-8 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-50"></div>
                </div>
              </div>
              
              {/* Card decorative elements */}
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full opacity-40"></div>
              <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full opacity-50"></div>
            </div>
          </div>

          {/* Photo Section - Right Side */}
          <div className="relative animate-slide-in-right order-2">
            {/* Main photo container */}
            <div className="relative">
              {/* Decorative frame layers */}
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-200 via-cyan-200 to-amber-200 rounded-3xl blur-md opacity-40"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-blue-100 via-cyan-100 to-orange-100 rounded-2xl opacity-30"></div>
              
              {/* Photo container */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-transparent to-cyan-100/20 z-10 rounded-2xl"></div>
                
                <img
                  src={groomSettings.photo}
                  alt={`${weddingData.couple.groomFullName} - The Groom`}
                  className="relative z-10 w-full h-96 md:h-[28rem] lg:h-[32rem] object-cover rounded-2xl"
                />
                
                {/* Photo overlay decorations */}
                <div className="absolute top-6 left-6 w-10 h-10 border-l-3 border-t-3 border-white/60 z-20"></div>
                <div className="absolute bottom-6 right-6 w-10 h-10 border-r-3 border-b-3 border-white/60 z-20"></div>
                
                {/* Floating decorative elements */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="w-4 h-4 bg-white/80 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute bottom-4 left-4 z-20">
                  <div className="w-3 h-3 bg-blue-200/80 rounded-full animate-pulse delay-75"></div>
                </div>
              </div>
              
              {/* Floating decorative elements around photo */}
              <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full opacity-50 animate-float blur-sm"></div>
              <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full opacity-40 animate-float-slow blur-sm"></div>
              <div className="absolute top-1/2 -left-4 w-8 h-8 bg-gradient-to-br from-cyan-300 to-blue-300 rounded-full opacity-35 animate-float-slower"></div>
            </div>
          </div>
        </div>

        {/* Bottom Quote Section */}
        <div className="text-center animate-fade-in-up">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-xl"></div>
            <div className="relative z-10 px-8 py-6">
              <p
                className="text-lg italic font-light leading-relaxed"
                style={{ color: "#644F44" }}
              >
                "{groomSettings.quote}"
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-6 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
                <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                <div className="w-6 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/6 right-1/5 w-1 h-1 bg-blue-300 rounded-full animate-float-slow opacity-70"></div>
        <div className="absolute top-1/3 left-1/6 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-float opacity-60"></div>
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-amber-300 rounded-full animate-float-slower opacity-50"></div>
        <div className="absolute top-2/3 left-1/4 w-1 h-1 bg-blue-200 rounded-full animate-float opacity-65"></div>
        <div className="absolute bottom-1/5 left-1/6 w-1.5 h-1.5 bg-cyan-200 rounded-full animate-float-slow opacity-55"></div>
        <div className="absolute top-1/5 right-2/3 w-1 h-1 bg-blue-300 rounded-full animate-float-slower opacity-60"></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-blue-300 opacity-30 animate-pulse transform rotate-45"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-cyan-300 opacity-25 animate-pulse delay-75 transform rotate-45"></div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Ovo:wght@400&display=swap');

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-3deg); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 1.2s ease-out 0.3s both;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 1.2s ease-out 0.5s both;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 1.2s ease-out 0.7s both;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 1.2s both;
        }
        
        .animate-float {
          animation: float 7s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 9s ease-in-out infinite;
        }
        
        .animate-float-slower {
          animation: float-slower 11s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Groom;