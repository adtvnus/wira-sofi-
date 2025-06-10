import { useState, useEffect } from "react";
import { useWedding } from "../../contexts/WeddingContext";

const Invited = () => {
  const [isMapLoaded, setIsMapLoaded] = useState(true);
  const [weddingSettings, setWeddingSettings] = useState<any>(null);
  const [invitedSettingsDB, setInvitedSettingsDB] = useState<any>(null);
  const { weddingData } = useWedding();
  const { invitedSettings } = weddingData;

  // Debug: Log invited settings
  console.log("🔍 Invited Settings from Context:", invitedSettings);
  console.log("🔍 Invited Settings from DB:", invitedSettingsDB);
  console.log("🔍 Wedding Data from Context:", weddingData);

  // Load wedding settings from database
  useEffect(() => {
    const loadWeddingSettings = async () => {
      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:3001/api";
        const response = await fetch(`${API_BASE_URL}/wedding-settings/active`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setWeddingSettings(data.data);
          }
        }
      } catch (error) {
        console.error("Error loading wedding settings:", error);
      }
    };

    loadWeddingSettings();
  }, []);

  // Load invited settings from database
  useEffect(() => {
    const loadInvitedSettings = async () => {
      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_URL || "http://localhost:3001/api";
        const response = await fetch(`${API_BASE_URL}/invited-settings/public`);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            console.log("✅ Loaded invited settings from database:", data.data);
            setInvitedSettingsDB(data.data);
          }
        }
      } catch (error) {
        console.error("Error loading invited settings:", error);
        console.log("🔄 Fallback to context data");
      }
    };

    loadInvitedSettings();
  }, []);

  // Complete wedding details from database
  const weddingDetails = weddingSettings
    ? {
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
      }
    : null;

  // Complete invited settings with priority: Database > Context > Default
  const completeInvitedSettings = {
    // Header information
    headerTitle:
      invitedSettingsDB?.header_title ||
      invitedSettings.headerTitle ||
      "Wedding Invitation",
    headerSubtitle:
      invitedSettingsDB?.header_subtitle ||
      invitedSettings.headerSubtitle ||
      "We invite you to celebrate our special day",

    // Event information from InvitedManagement
    eventTitle:
      invitedSettingsDB?.event_title ||
      invitedSettings.eventTitle ||
      "Wedding Ceremony",
    eventName:
      invitedSettingsDB?.event_name ||
      invitedSettings.eventName ||
      "Wedding Ceremony",
    eventDate: invitedSettingsDB?.event_date || invitedSettings.eventDate || "",
    eventTime: invitedSettingsDB?.event_time || invitedSettings.eventTime || "",

    // Venue information from InvitedManagement
    venueName: invitedSettingsDB?.venue_name || invitedSettings.venueName || "",
    venueAddress:
      invitedSettingsDB?.venue_address || invitedSettings.venueAddress || "",
    googleMapsUrl:
      invitedSettingsDB?.google_maps_url || invitedSettings.googleMapsUrl || "",

    // Save the date information
    saveTheDateTitle:
      invitedSettingsDB?.save_the_date_title ||
      invitedSettings.saveTheDateTitle ||
      "Save The Date",
    saveTheDateMessage:
      invitedSettingsDB?.save_the_date_message ||
      invitedSettings.saveTheDateMessage ||
      "We can't wait to celebrate with you!",

    // Status
    isEnabled:
      invitedSettingsDB?.is_enabled !== false &&
      invitedSettings.isEnabled !== false,
  };

  // Determine which venue details to use (prioritize database wedding details)
  const venueDetails = {
    name: weddingDetails?.weddingVenue || completeInvitedSettings.venueName,
    address:
      weddingDetails?.weddingAddress || completeInvitedSettings.venueAddress,
    event: completeInvitedSettings.eventTitle,
  };

  const googleMapsUrl = completeInvitedSettings.googleMapsUrl;

  const handleDirections = () => {
    if (googleMapsUrl) {
      // Use provided Google Maps URL
      window.open(googleMapsUrl, "_blank");
    } else {
      // Fallback to search by address
      const address =
        weddingDetails?.weddingAddress || completeInvitedSettings.venueAddress;
      if (address) {
        const encodedAddress = encodeURIComponent(address);
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`,
          "_blank"
        );
      }
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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
        <div className="grid lg:grid-cols-2 gap-20 items-start mb-16">
          {/* Event Details Section */}
          <div className="relative animate-slide-in-left">
            {/* Background Glow Effect */}
            <div className="absolute -inset-8 bg-gradient-to-br from-amber-200/30 via-orange-200/20 to-rose-200/30 rounded-[3rem] blur-3xl opacity-60 animate-pulse-slow"></div>

            {/* Event Details Card */}
            <div className="relative group">
              {/* Animated border gradient */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 rounded-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-gradient-shift"></div>

              {/* Background card with enhanced glassmorphism */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/85 to-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/95 group-hover:shadow-3xl transition-all duration-500"></div>

              {/* Content */}
              <div className="relative z-10 p-12 md:p-16">
                {/* Event Title with enhanced styling */}
                <div className="text-center mb-12 transform group-hover:scale-[1.02] transition-transform duration-500">
                  <h3
                    className="text-4xl md:text-5xl font-light mb-6 tracking-wider leading-tight"
                    style={{ color: "#644F44" }}
                  >
                    {completeInvitedSettings.eventTitle}
                  </h3>
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent animate-shimmer"></div>
                    <div className="mx-6 relative">
                      <div className="w-4 h-4 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full shadow-lg animate-gentle-float"></div>
                      <div className="absolute inset-0 w-4 h-4 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <div className="w-16 h-px bg-gradient-to-l from-transparent via-amber-300 to-transparent animate-shimmer"></div>
                  </div>
                </div>

                {/* Event Details with enhanced styling */}
                <div className="space-y-10">
                  {/* Wedding Ceremony */}
                  {weddingDetails && weddingDetails.weddingDate && (
                    <div className="flex items-start space-x-6 group/item hover:transform hover:scale-[1.02] transition-all duration-300">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-300 via-orange-300 to-amber-400 rounded-full flex-shrink-0 mt-1 shadow-xl group-hover/item:shadow-2xl transition-shadow duration-300"></div>
                        <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full animate-ping opacity-30 group-hover/item:opacity-50"></div>
                      </div>
                      <div className="flex-1">
                        <h4
                          className="text-xl font-semibold mb-3 group-hover/item:text-opacity-90 transition-all duration-300"
                          style={{ color: "#644F44" }}
                        >
                          Wedding Ceremony
                        </h4>
                        <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 rounded-2xl p-4 backdrop-blur-sm border border-amber-100/50">
                          <p
                            className="text-lg font-medium opacity-90 mb-2"
                            style={{ color: "#644F44" }}
                          >
                            {formatDate(weddingDetails.weddingDate)}
                          </p>
                          {weddingDetails.weddingTime && (
                            <p className="text-2xl font-bold mt-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                              {weddingDetails.weddingTime} WIB
                            </p>
                          )}
                          {weddingDetails.weddingVenue && (
                            <div className="mt-4 p-3 bg-white/60 rounded-xl border border-white/80">
                              <p
                                className="text-lg font-semibold mb-2"
                                style={{ color: "#644F44" }}
                              >
                                {weddingDetails.weddingVenue}
                              </p>
                              {weddingDetails.weddingAddress && (
                                <p
                                  className="text-sm opacity-80 leading-relaxed"
                                  style={{ color: "#644F44" }}
                                >
                                  {weddingDetails.weddingAddress}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reception with similar enhanced styling */}
                  {weddingDetails && weddingDetails.receptionDate && (
                    <div className="flex items-start space-x-6 group/item hover:transform hover:scale-[1.02] transition-all duration-300">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-300 via-pink-300 to-rose-400 rounded-full flex-shrink-0 mt-1 shadow-xl group-hover/item:shadow-2xl transition-shadow duration-300"></div>
                        <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full animate-ping opacity-30 group-hover/item:opacity-50"></div>
                      </div>
                      <div className="flex-1">
                        <h4
                          className="text-xl font-semibold mb-3 group-hover/item:text-opacity-90 transition-all duration-300"
                          style={{ color: "#644F44" }}
                        >
                          Reception
                        </h4>
                        <div className="bg-gradient-to-r from-rose-50/80 to-pink-50/80 rounded-2xl p-4 backdrop-blur-sm border border-rose-100/50">
                          <p
                            className="text-lg font-medium opacity-90 mb-2"
                            style={{ color: "#644F44" }}
                          >
                            {formatDate(weddingDetails.receptionDate)}
                          </p>
                          {weddingDetails.receptionTime && (
                            <p className="text-2xl font-bold mt-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                              {weddingDetails.receptionTime} WIB
                            </p>
                          )}
                          {weddingDetails.receptionVenue && (
                            <div className="mt-4 p-3 bg-white/60 rounded-xl border border-white/80">
                              <p
                                className="text-lg font-semibold mb-2"
                                style={{ color: "#644F44" }}
                              >
                                {weddingDetails.receptionVenue}
                              </p>
                              {weddingDetails.receptionAddress && (
                                <p
                                  className="text-sm opacity-80 leading-relaxed"
                                  style={{ color: "#644F44" }}
                                >
                                  {weddingDetails.receptionAddress}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* General Event (fallback) with enhanced styling */}
                  {(!weddingDetails ||
                    (!weddingDetails.weddingDate &&
                      !weddingDetails.receptionDate)) && (
                    <div className="flex items-start space-x-6 group/item hover:transform hover:scale-[1.02] transition-all duration-300">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-300 via-amber-300 to-orange-400 rounded-full flex-shrink-0 mt-1 shadow-xl group-hover/item:shadow-2xl transition-shadow duration-300"></div>
                        <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full animate-ping opacity-30 group-hover/item:opacity-50"></div>
                      </div>
                      <div className="flex-1">
                        <h4
                          className="text-xl font-semibold mb-3 group-hover/item:text-opacity-90 transition-all duration-300"
                          style={{ color: "#644F44" }}
                        >
                          {completeInvitedSettings.eventName ||
                            completeInvitedSettings.eventTitle}
                        </h4>
                        <div className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 rounded-2xl p-4 backdrop-blur-sm border border-orange-100/50">
                          {completeInvitedSettings.eventDate && (
                            <p
                              className="text-lg font-medium opacity-90 mb-2"
                              style={{ color: "#644F44" }}
                            >
                              {formatDate(completeInvitedSettings.eventDate)}
                            </p>
                          )}
                          {completeInvitedSettings.eventTime && (
                            <p className="text-2xl font-bold mt-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                              {completeInvitedSettings.eventTime}
                            </p>
                          )}
                          {venueDetails.name && (
                            <div className="mt-4 p-3 bg-white/60 rounded-xl border border-white/80">
                              <p
                                className="text-lg font-semibold mb-2"
                                style={{ color: "#644F44" }}
                              >
                                {venueDetails.name}
                              </p>
                              {venueDetails.address && (
                                <p
                                  className="text-sm opacity-80 leading-relaxed"
                                  style={{ color: "#644F44" }}
                                >
                                  {venueDetails.address}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Directions Button */}
                {(venueDetails.address || googleMapsUrl) && (
                  <div className="mt-12 text-center">
                    <button
                      onClick={handleDirections}
                      className="group relative inline-flex items-center px-10 py-5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-500 hover:via-orange-500 hover:to-amber-600 text-white font-semibold rounded-full shadow-2xl transform transition-all duration-500 hover:scale-110 hover:shadow-3xl active:scale-95 overflow-hidden"
                      style={{ color: "#644F44" }}
                    >
                      {/* Button background animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer-button"></div>

                      {/* Icon with enhanced animation */}
                      <svg
                        className="w-6 h-6 mr-4 group-hover:animate-bounce transition-transform duration-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-5.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>

                      <span className="relative z-10 tracking-wide text-lg">
                        Get Directions
                      </span>

                      {/* Ripple effect */}
                      <div className="absolute inset-0 rounded-full bg-white/30 scale-0 group-active:scale-100 transition-transform duration-200"></div>
                    </button>
                  </div>
                )}
              </div>

              {/* Enhanced decorative elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full opacity-50 animate-gentle-float blur-sm"></div>
              <div className="absolute -bottom-6 -right-6 w-8 h-8 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full opacity-60 animate-gentle-float-reverse blur-sm"></div>
              <div className="absolute top-1/2 -right-4 w-6 h-6 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full opacity-40 animate-gentle-float blur-sm"></div>
            </div>
          </div>

          {/* Google Maps Section with Enhanced Design */}
          <div className="relative animate-slide-in-right">
            {/* Enhanced background glow */}
            <div className="absolute -inset-8 bg-gradient-to-tl from-orange-200/30 via-amber-200/20 to-yellow-200/30 rounded-[3rem] blur-3xl opacity-60 animate-pulse-slow"></div>

            {/* Map Container */}
            <div className="relative group">
              {/* Enhanced decorative frame layers */}
              <div className="absolute -inset-6 bg-gradient-to-br from-amber-200 via-orange-200 to-yellow-200 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
              <div className="absolute -inset-4 bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 rounded-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
              <div className="absolute -inset-2 bg-gradient-to-br from-white/60 to-white/40 rounded-2xl backdrop-blur-sm border border-white/70"></div>

              {/* Map container with enhanced styling */}
              <div className="relative overflow-hidden rounded-2xl shadow-2xl group-hover:shadow-3xl transition-shadow duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 via-transparent to-orange-100/20 z-10 rounded-2xl"></div>

                {isMapLoaded && googleMapsUrl ? (
                  <div className="relative">
                    <iframe
                      src={googleMapsUrl}
                      width="100%"
                      height="450"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="relative z-10 rounded-2xl group-hover:scale-[1.02] transition-transform duration-700"
                      title="Wedding Venue Location"
                      onError={() => setIsMapLoaded(false)}
                    />
                    {/* Map overlay with enhanced corner decorations */}
                    <div className="absolute top-6 left-6 w-12 h-12 border-l-3 border-t-3 border-white/80 z-20 rounded-tl-lg"></div>
                    <div className="absolute bottom-6 right-6 w-12 h-12 border-r-3 border-b-3 border-white/80 z-20 rounded-br-lg"></div>

                    {/* Interactive hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-100/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-15 rounded-2xl"></div>
                  </div>
                ) : (
                  <div className="w-full h-[450px] bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl flex items-center justify-center group-hover:from-amber-100 group-hover:via-orange-100 group-hover:to-yellow-100 transition-colors duration-500">
                    <div className="text-center p-10 transform group-hover:scale-105 transition-transform duration-500">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                          <svg
                            className="w-10 h-10 text-white animate-gentle-float"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full mx-auto animate-ping opacity-20"></div>
                      </div>
                      <h4
                        className="text-2xl font-bold mb-3"
                        style={{ color: "#644F44" }}
                      >
                        Wedding Venue
                      </h4>
                      <p
                        className="text-base opacity-80 mb-6 max-w-sm mx-auto leading-relaxed"
                        style={{ color: "#644F44" }}
                      >
                        {venueDetails.name || "Venue information not available"}
                      </p>
                      {(venueDetails.address || googleMapsUrl) && (
                        <button
                          onClick={handleDirections}
                          className="group/btn px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-full text-base font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 active:scale-95"
                          style={{ color: "#644F44" }}
                        >
                          <span className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2 group-hover/btn:animate-bounce"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Open in Google Maps
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced floating decorative elements */}
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full opacity-40 animate-gentle-float blur-md"></div>
              <div className="absolute -bottom-6 -left-6 w-10 h-10 bg-gradient-to-br from-orange-300 to-yellow-300 rounded-full opacity-50 animate-gentle-float-reverse blur-md"></div>
              <div className="absolute top-1/4 -left-4 w-6 h-6 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full opacity-40 animate-gentle-float blur-sm"></div>
              <div className="absolute bottom-1/4 -right-4 w-8 h-8 bg-gradient-to-br from-yellow-300 to-amber-300 rounded-full opacity-30 animate-gentle-float-reverse blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Add these custom CSS animations - place in your global CSS or styled-components */}
        <style>{`
          @keyframes gentle-float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }

          @keyframes gentle-float-reverse {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(10px) rotate(-5deg); }
          }

          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }

          @keyframes shimmer-button {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes pulse-slow {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.8; }
          }

          .animate-gentle-float {
            animation: gentle-float 4s ease-in-out infinite;
          }

          .animate-gentle-float-reverse {
            animation: gentle-float-reverse 5s ease-in-out infinite;
          }

          .animate-shimmer {
            background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.6), transparent);
            background-size: 200% 100%;
            animation: shimmer 2s linear infinite;
          }

          .animate-shimmer-button {
            animation: shimmer-button 2s ease-in-out infinite;
          }

          .animate-gradient-shift {
            background-size: 200% 200%;
            animation: gradient-shift 3s ease infinite;
          }

          .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
          }

          .border-l-3 { border-left-width: 3px; }
          .border-t-3 { border-top-width: 3px; }
          .border-r-3 { border-right-width: 3px; }
          .border-b-3 { border-bottom-width: 3px; }

          .shadow-3xl {
            box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
          }
        `}</style>

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
                {/* Priority: Event date > Wedding date > Reception date */}
                {completeInvitedSettings.eventDate
                  ? formatDate(completeInvitedSettings.eventDate)
                  : weddingDetails && weddingDetails.weddingDate
                  ? formatDate(weddingDetails.weddingDate)
                  : weddingDetails && weddingDetails.receptionDate
                  ? formatDate(weddingDetails.receptionDate)
                  : "Save The Date"}
              </p>
              <p className="text-base opacity-70" style={{ color: "#644F44" }}>
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
