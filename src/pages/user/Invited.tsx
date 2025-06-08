import { useState, useEffect } from "react";
import { useWedding } from "../../contexts/WeddingContext";

const Invited = () => {
  const [isMapLoaded, setIsMapLoaded] = useState(true);
  const [weddingSettings, setWeddingSettings] = useState<any>(null);
  const { weddingData } = useWedding();
  const { invitedSettings } = weddingData;

  // Load wedding settings from database
  useEffect(() => {
    const loadWeddingSettings = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/wedding-settings/active');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setWeddingSettings(data.data);
          }
        }
      } catch (error) {
        console.error('Error loading wedding settings:', error);
      }
    };

    loadWeddingSettings();
  }, []);

  // Complete wedding details from database
  const weddingDetails = weddingSettings ? {
    // Wedding ceremony details
    weddingDate: weddingSettings.wedding_date,
    weddingTime: weddingSettings.wedding_time,
    weddingVenue: weddingSettings.wedding_venue,
    weddingAddress: weddingSettings.wedding_address,
    // Reception details
    receptionDate: weddingSettings.reception_date,
    receptionTime: weddingSettings.reception_time,
    receptionVenue: weddingSettings.reception_venue,
    receptionAddress: weddingSettings.reception_address,
  } : null;

  // Complete invited settings with all parameters from admin
  const completeInvitedSettings = {
    // Header information
    headerTitle: invitedSettings.headerTitle || "Wedding Invitation",
    headerSubtitle: invitedSettings.headerSubtitle || "We invite you to celebrate our special day",

    // Event information from InvitedManagement
    eventTitle: invitedSettings.eventTitle || "Wedding Ceremony",
    eventName: invitedSettings.eventName || "Wedding Ceremony",
    eventDate: invitedSettings.eventDate || "",
    eventTime: invitedSettings.eventTime || "",

    // Venue information from InvitedManagement
    venueName: invitedSettings.venueName || "",
    venueAddress: invitedSettings.venueAddress || "",
    googleMapsUrl: invitedSettings.googleMapsUrl || "",

    // Save the date information
    saveTheDateTitle: invitedSettings.saveTheDateTitle || "Save The Date",
    saveTheDateMessage: invitedSettings.saveTheDateMessage || "We can't wait to celebrate with you!",

    // Status
    isEnabled: invitedSettings.isEnabled !== false
  };

  // Determine which venue details to use (prioritize database wedding details)
  const venueDetails = {
    name: weddingDetails?.weddingVenue || completeInvitedSettings.venueName,
    address: weddingDetails?.weddingAddress || completeInvitedSettings.venueAddress,
    event: completeInvitedSettings.eventTitle
  };

  const googleMapsUrl = completeInvitedSettings.googleMapsUrl;

  const handleDirections = () => {
    if (googleMapsUrl) {
      // Use provided Google Maps URL
      window.open(googleMapsUrl, '_blank');
    } else {
      // Fallback to search by address
      const address = weddingDetails?.weddingAddress || completeInvitedSettings.venueAddress;
      if (address) {
        const encodedAddress = encodeURIComponent(address);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
      }
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // If invited page is disabled, show a message
  if (!completeInvitedSettings.isEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center p-8">
          <h2 className="text-2xl font-light mb-4" style={{ color: "#644F44" }}>
            Invitation Page Temporarily Unavailable
          </h2>
          <p className="text-base opacity-70" style={{ color: "#644F44" }}>
            Please check back later or contact the wedding organizer.
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
        <div className="absolute top-16 left-16 w-48 h-48 bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 rounded-full opacity-20 blur-3xl animate-float-slower"></div>
        <div className="absolute bottom-20 right-16 w-56 h-56 bg-gradient-to-br from-orange-100 via-amber-100 to-rose-100 rounded-full opacity-25 blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/5 w-40 h-40 bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 rounded-full opacity-18 blur-2xl animate-float"></div>
        
        {/* Medium floating elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full opacity-15 blur-xl animate-float-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full opacity-20 blur-xl animate-float-slower"></div>
      </div>

      {/* Ornamental Design Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner decorations */}
        <div className="absolute top-8 left-8">
          <div className="w-24 h-24 border-l-2 border-t-2 border-amber-200 opacity-40 relative">
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-amber-300 rounded-full opacity-60"></div>
            <div className="absolute top-6 left-6 w-2 h-2 bg-orange-300 rounded-full opacity-50"></div>
          </div>
        </div>
        <div className="absolute top-8 right-8">
          <div className="w-24 h-24 border-r-2 border-t-2 border-amber-200 opacity-40 relative">
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-300 rounded-full opacity-60"></div>
            <div className="absolute top-6 right-6 w-2 h-2 bg-orange-300 rounded-full opacity-50"></div>
          </div>
        </div>
        
        {/* Floating geometric elements */}
        <div className="absolute top-1/5 left-12 opacity-30">
          <div className="w-3 h-12 bg-gradient-to-b from-amber-200 to-transparent rotate-12 animate-pulse"></div>
          <div className="w-12 h-3 bg-gradient-to-r from-orange-200 to-transparent -mt-6 animate-pulse delay-75"></div>
        </div>
        <div className="absolute bottom-1/5 right-12 opacity-30">
          <div className="w-3 h-12 bg-gradient-to-b from-orange-200 to-transparent -rotate-12 animate-pulse delay-150"></div>
          <div className="w-12 h-3 bg-gradient-to-r from-amber-200 to-transparent -mt-6 animate-pulse"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl w-full">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            <div className="mx-8 flex space-x-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-150"></div>
            </div>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
          </div>
          
          <h2
            className="text-4xl md:text-5xl font-light mb-6 tracking-wider"
            style={{ color: "#644F44" }}
          >
            {completeInvitedSettings.headerTitle}
          </h2>

          <p
            className="text-lg tracking-wide opacity-70 italic"
            style={{ color: "#644F44" }}
          >
            "{completeInvitedSettings.headerSubtitle}"
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
          {/* Event Details Section */}
          <div className="relative animate-slide-in-left">
            {/* Event Details Card */}
            <div className="relative">
              {/* Background card */}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/90"></div>
              
              {/* Content */}
              <div className="relative z-10 p-10 md:p-12">
                {/* Event Title */}
                <div className="text-center mb-10">
                  <h3
                    className="text-3xl font-light mb-4 tracking-wide"
                    style={{ color: "#644F44" }}
                  >
                    {completeInvitedSettings.eventTitle}
                  </h3>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-px bg-gradient-to-r from-amber-300 to-transparent"></div>
                    <div className="mx-4 w-3 h-3 bg-amber-300 rounded-full opacity-60"></div>
                    <div className="w-12 h-px bg-gradient-to-l from-amber-300 to-transparent"></div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-8">
                  {/* Wedding Ceremony */}
                  {weddingDetails && weddingDetails.weddingDate && (
                    <div className="flex items-start space-x-4">
                      <div className="w-6 h-6 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full flex-shrink-0 mt-1 shadow-lg"></div>
                      <div>
                        <h4
                          className="text-lg font-medium mb-2"
                          style={{ color: "#644F44" }}
                        >
                          Wedding Ceremony
                        </h4>
                        <p
                          className="text-base opacity-80"
                          style={{ color: "#644F44" }}
                        >
                          {formatDate(weddingDetails.weddingDate)}
                        </p>
                        {weddingDetails.weddingTime && (
                          <p
                            className="text-xl font-medium mt-1"
                            style={{ color: "#644F44" }}
                          >
                            {weddingDetails.weddingTime} WIB
                          </p>
                        )}
                        {weddingDetails.weddingVenue && (
                          <div className="mt-3">
                            <p
                              className="text-base font-medium mb-1"
                              style={{ color: "#644F44" }}
                            >
                              {weddingDetails.weddingVenue}
                            </p>
                            {weddingDetails.weddingAddress && (
                              <p
                                className="text-sm opacity-70 leading-relaxed"
                                style={{ color: "#644F44" }}
                              >
                                {weddingDetails.weddingAddress}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reception */}
                  {weddingDetails && weddingDetails.receptionDate && (
                    <div className="flex items-start space-x-4">
                      <div className="w-6 h-6 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full flex-shrink-0 mt-1 shadow-lg"></div>
                      <div>
                        <h4
                          className="text-lg font-medium mb-2"
                          style={{ color: "#644F44" }}
                        >
                          Reception
                        </h4>
                        <p
                          className="text-base opacity-80"
                          style={{ color: "#644F44" }}
                        >
                          {formatDate(weddingDetails.receptionDate)}
                        </p>
                        {weddingDetails.receptionTime && (
                          <p
                            className="text-xl font-medium mt-1"
                            style={{ color: "#644F44" }}
                          >
                            {weddingDetails.receptionTime} WIB
                          </p>
                        )}
                        {weddingDetails.receptionVenue && (
                          <div className="mt-3">
                            <p
                              className="text-base font-medium mb-1"
                              style={{ color: "#644F44" }}
                            >
                              {weddingDetails.receptionVenue}
                            </p>
                            {weddingDetails.receptionAddress && (
                              <p
                                className="text-sm opacity-70 leading-relaxed"
                                style={{ color: "#644F44" }}
                              >
                                {weddingDetails.receptionAddress}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* General Event (fallback when no specific wedding/reception details) */}
                  {(!weddingDetails || (!weddingDetails.weddingDate && !weddingDetails.receptionDate)) && (
                    <div className="flex items-start space-x-4">
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full flex-shrink-0 mt-1 shadow-lg"></div>
                      <div>
                        <h4
                          className="text-lg font-medium mb-2"
                          style={{ color: "#644F44" }}
                        >
                          {completeInvitedSettings.eventName || completeInvitedSettings.eventTitle}
                        </h4>
                        {completeInvitedSettings.eventDate && (
                          <p
                            className="text-base opacity-80"
                            style={{ color: "#644F44" }}
                          >
                            {formatDate(completeInvitedSettings.eventDate)}
                          </p>
                        )}
                        {completeInvitedSettings.eventTime && (
                          <p
                            className="text-xl font-medium mt-1"
                            style={{ color: "#644F44" }}
                          >
                            {completeInvitedSettings.eventTime} WIB
                          </p>
                        )}
                        {venueDetails.name && (
                          <div className="mt-3">
                            <p
                              className="text-base font-medium mb-1"
                              style={{ color: "#644F44" }}
                            >
                              {venueDetails.name}
                            </p>
                            {venueDetails.address && (
                              <p
                                className="text-sm opacity-70 leading-relaxed"
                                style={{ color: "#644F44" }}
                              >
                                {venueDetails.address}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Directions Button */}
                {(venueDetails.address || googleMapsUrl) && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={handleDirections}
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-300 to-orange-300 hover:from-amber-400 hover:to-orange-400 text-white font-medium rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      style={{ color: "#644F44" }}
                    >
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-5.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Get Directions
                    </button>
                  </div>
                )}
              </div>
              
              {/* Card decorative elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full opacity-40"></div>
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full opacity-50"></div>
            </div>
          </div>

          {/* Google Maps Section */}
          <div className="relative animate-slide-in-right">
            {/* Map Container */}
            <div className="relative">
              {/* Decorative frame layers */}
              <div className="absolute -inset-4 bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200 rounded-3xl blur-md opacity-40"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 rounded-2xl opacity-30"></div>
              
              {/* Map container */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/10 via-transparent to-orange-100/10 z-10 rounded-2xl"></div>
                
                {isMapLoaded && googleMapsUrl ? (
                  <iframe
                    src={googleMapsUrl}
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="relative z-10 rounded-2xl"
                    title="Wedding Venue Location"
                    onError={() => setIsMapLoaded(false)}
                  />
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium mb-2" style={{ color: "#644F44" }}>
                        Wedding Venue
                      </h4>
                      <p className="text-sm opacity-70 mb-4" style={{ color: "#644F44" }}>
                        {venueDetails.name || "Venue information not available"}
                      </p>
                      {(venueDetails.address || googleMapsUrl) && (
                        <button
                          onClick={handleDirections}
                          className="px-6 py-2 bg-gradient-to-r from-amber-300 to-orange-300 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300"
                          style={{ color: "#644F44" }}
                        >
                          Open in Google Maps
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Map overlay decorations */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/60 z-20"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/60 z-20"></div>
              </div>
              
              {/* Floating decorative elements around map */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full opacity-50 animate-float blur-sm"></div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-br from-orange-300 to-yellow-300 rounded-full opacity-40 animate-float-slow blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Save The Date */}
        <div className="text-center animate-fade-in-up">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl"></div>
            <div className="relative z-10 px-12 py-8">
              <h3
                className="text-2xl font-light mb-4"
                style={{ color: "#644F44" }}
              >
                {completeInvitedSettings.saveTheDateTitle}
              </h3>
              <p
                className="text-lg font-medium mb-2"
                style={{ color: "#644F44" }}
              >
                {/* Priority: Wedding date > Reception date > Event date */}
                {weddingDetails && weddingDetails.weddingDate ?
                  formatDate(weddingDetails.weddingDate) :
                  weddingDetails && weddingDetails.receptionDate ?
                    formatDate(weddingDetails.receptionDate) :
                    completeInvitedSettings.eventDate ?
                      formatDate(completeInvitedSettings.eventDate) :
                      'Save The Date'
                }
              </p>
              <p
                className="text-base opacity-70"
                style={{ color: "#644F44" }}
              >
                {completeInvitedSettings.saveTheDateMessage}
              </p>
              
              <div className="mt-6 flex items-center justify-center space-x-3">
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                <div className="w-2 h-2 bg-amber-300 rounded-full"></div>
                <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                <div className="w-2 h-2 bg-amber-300 rounded-full"></div>
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/6 left-1/5 w-1 h-1 bg-amber-300 rounded-full animate-float-slow opacity-70"></div>
        <div className="absolute top-1/3 right-1/6 w-1.5 h-1.5 bg-orange-300 rounded-full animate-float opacity-60"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-float-slower opacity-50"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-amber-200 rounded-full animate-float opacity-65"></div>
        <div className="absolute bottom-1/5 right-1/6 w-1.5 h-1.5 bg-orange-200 rounded-full animate-float-slow opacity-55"></div>
        <div className="absolute top-1/5 left-2/3 w-1 h-1 bg-amber-300 rounded-full animate-float-slower opacity-60"></div>
        
        {/* Diamond shapes */}
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-amber-300 opacity-30 animate-pulse transform rotate-45"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-orange-300 opacity-25 animate-pulse delay-75 transform rotate-45"></div>
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
          50% { transform: translateY(-10px) rotate(-10px); }
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

export default Invited;