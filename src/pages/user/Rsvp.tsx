import { useState, useEffect } from "react";
import { useWedding } from "../../contexts/WeddingContext";
import { useGuestName } from "../../hooks/useGuestName";
import { RsvpResponse } from "../../types/wedding";

const Rsvp = () => {
  const { weddingData, updateRsvpSettings } = useWedding();
  const { rsvpSettings } = weddingData;
  const { displayName: guestName } = useGuestName();

  // Check if RSVP is disabled
  if (!rsvpSettings.isEnabled) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f8f6f3 0%, #f1ede8 50%, #ede7e0 100%)",
          fontFamily: "Ovo, serif",
        }}
      >
        <div className="relative z-10 text-center max-w-lg animate-fade-in">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>

            <h2 className="text-3xl md:text-4xl font-light mb-4 tracking-wider" style={{ color: "#644F44" }}>
              RSVP Ditutup
            </h2>

            <p className="text-lg leading-relaxed opacity-80 mb-6" style={{ color: "#644F44" }}>
              Maaf, periode RSVP telah ditutup. Terima kasih atas perhatian Anda.
            </p>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/80">
              <p className="text-sm opacity-70" style={{ color: "#644F44" }}>
                Untuk informasi lebih lanjut, silakan hubungi: {rsvpSettings.contactPhone}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    attendance: '',
    guestCount: '1',
    dietaryRestrictions: '',
    message: '',
    ceremony: false,
    reception: false
  });

  // Pre-fill name from URL parameter
  useEffect(() => {
    if (guestName && guestName !== 'Tamu Undangan') {
      setFormData(prev => ({
        ...prev,
        name: guestName
      }));
    }
  }, [guestName]);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Create new RSVP response
    const newResponse: RsvpResponse = {
      id: `rsvp_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      attendance: formData.attendance as 'yes' | 'no',
      guestCount: formData.guestCount,
      dietaryRestrictions: formData.dietaryRestrictions,
      message: formData.message,
      ceremony: formData.ceremony,
      reception: formData.reception,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Simulate API call and save to context
    setTimeout(() => {
      // Add response to existing responses
      const updatedResponses = [...rsvpSettings.responses, newResponse];
      updateRsvpSettings({ responses: updatedResponses });

      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f8f6f3 0%, #f1ede8 50%, #ede7e0 100%)",
          fontFamily: "Ovo, serif",
        }}
      >
        {/* Success Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full opacity-25 blur-2xl animate-float-slow"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full opacity-25 blur-2xl animate-float-slower"></div>
        </div>

        <div className="relative z-10 text-center max-w-lg animate-fade-in">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-light mb-4 tracking-wider" style={{ color: "#644F44" }}>
              Terima Kasih!
            </h2>
            
            <p className="text-lg leading-relaxed opacity-80 mb-6" style={{ color: "#644F44" }}>
              RSVP Anda telah berhasil dikirim. Kami sangat menantikan kehadiran Anda di hari bahagia kami.
            </p>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/80">
              <p className="text-sm opacity-70" style={{ color: "#644F44" }}>
                Konfirmasi akan dikirim melalui email dalam 24 jam ke depan.
              </p>
            </div>
          </div>
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Ovo:wght@400&display=swap');
          
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
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
            animation: fade-in 1s ease-out both;
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
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f8f6f3 0%, #f1ede8 50%, #ede7e0 100%)",
        fontFamily: "Ovo, serif",
      }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-16 left-16 w-44 h-44 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 rounded-full opacity-20 blur-3xl animate-float-slower"></div>
        <div className="absolute bottom-20 right-16 w-52 h-52 bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 rounded-full opacity-25 blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-36 h-36 bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 rounded-full opacity-18 blur-2xl animate-float"></div>
        
        {/* Medium floating elements */}
        <div className="absolute top-1/4 left-1/3 w-28 h-28 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full opacity-15 blur-xl animate-float-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full opacity-20 blur-xl animate-float-slower"></div>
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
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            <div className="mx-8 flex space-x-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-150"></div>
            </div>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-light mb-6 tracking-wider" style={{ color: "#644F44" }}>
            {rsvpSettings.headerTitle}
          </h1>

          <p className="text-lg leading-relaxed opacity-80 max-w-2xl mx-auto" style={{ color: "#644F44" }}>
            {rsvpSettings.headerSubtitle}
          </p>

          <p className="text-base leading-relaxed opacity-70 max-w-2xl mx-auto mt-4" style={{ color: "#644F44" }}>
            {rsvpSettings.description} Deadline: {rsvpSettings.deadlineDate}.
          </p>
        </div>

        {/* RSVP Form */}
        <div className="animate-slide-up">
          <div className="relative">
            {/* Form background */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/90"></div>
            
            {/* Form content */}
            <div className="relative z-10 p-8 md:p-12">
              <div className="space-y-8">
                {/* Personal Information Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: "#644F44" }}>
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all duration-300"
                      style={{ color: "#644F44" }}
                      placeholder="Ahmad Budi Santoso"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: "#644F44" }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all duration-300"
                      style={{ color: "#644F44" }}
                      placeholder="ahmad.budi@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: "#644F44" }}>
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all duration-300"
                      style={{ color: "#644F44" }}
                      placeholder="+62 812 3456 7890"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: "#644F44" }}>
                      Jumlah Tamu *
                    </label>
                    <select
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all duration-300"
                      style={{ color: "#644F44" }}
                    >
                      <option value="1">1 Orang</option>
                      <option value="2">2 Orang</option>
                      <option value="3">3 Orang</option>
                      <option value="4">4 Orang</option>
                      <option value="5">5+ Orang</option>
                    </select>
                  </div>
                </div>

                {/* Attendance Confirmation */}
                <div>
                  <label className="block text-sm font-medium mb-4" style={{ color: "#644F44" }}>
                    Konfirmasi Kehadiran *
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="flex items-center p-4 rounded-xl border-2 border-gray-200 bg-white/60 hover:bg-white/80 cursor-pointer transition-all duration-300">
                      <input
                        type="radio"
                        name="attendance"
                        value="yes"
                        checked={formData.attendance === 'yes'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${formData.attendance === 'yes' ? 'border-green-400 bg-green-400' : 'border-gray-300'}`}>
                        {formData.attendance === 'yes' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span style={{ color: "#644F44" }}>Ya, saya akan hadir</span>
                    </label>
                    
                    <label className="flex items-center p-4 rounded-xl border-2 border-gray-200 bg-white/60 hover:bg-white/80 cursor-pointer transition-all duration-300">
                      <input
                        type="radio"
                        name="attendance"
                        value="no"
                        checked={formData.attendance === 'no'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${formData.attendance === 'no' ? 'border-red-400 bg-red-400' : 'border-gray-300'}`}>
                        {formData.attendance === 'no' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span style={{ color: "#644F44" }}>Maaf, saya tidak dapat hadir</span>
                    </label>
                  </div>
                </div>

                {/* Event Selection */}
                {formData.attendance === 'yes' && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium mb-4" style={{ color: "#644F44" }}>
                      Acara yang akan dihadiri
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 rounded-lg bg-white/60 hover:bg-white/80 cursor-pointer transition-all duration-300">
                        <input
                          type="checkbox"
                          name="ceremony"
                          checked={formData.ceremony}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${formData.ceremony ? 'border-amber-400 bg-amber-400' : 'border-gray-300'}`}>
                          {formData.ceremony && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span style={{ color: "#644F44" }}>{rsvpSettings.ceremonyTime}</span>
                      </label>
                      
                      <label className="flex items-center p-3 rounded-lg bg-white/60 hover:bg-white/80 cursor-pointer transition-all duration-300">
                        <input
                          type="checkbox"
                          name="reception"
                          checked={formData.reception}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${formData.reception ? 'border-amber-400 bg-amber-400' : 'border-gray-300'}`}>
                          {formData.reception && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span style={{ color: "#644F44" }}>{rsvpSettings.receptionTime}</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Dietary Restrictions */}
                {formData.attendance === 'yes' && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium mb-3" style={{ color: "#644F44" }}>
                      Pantangan Makanan / Alergi
                    </label>
                    <input
                      type="text"
                      name="dietaryRestrictions"
                      value={formData.dietaryRestrictions}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all duration-300"
                      style={{ color: "#644F44" }}
                      placeholder="Contoh: Vegetarian, tidak makan seafood, dll."
                    />
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: "#644F44" }}>
                    Pesan & Doa untuk Kedua Mempelai
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all duration-300 resize-none"
                    style={{ color: "#644F44" }}
                    placeholder="Selamat untuk Wira & Sofi! Semoga pernikahan kalian diberkahi kebahagiaan..."
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || !formData.name || !formData.email || !formData.attendance}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Kirim RSVP
                      </>
                    )}
                  </button>
                  
                  <p className="mt-4 text-xs opacity-60" style={{ color: "#644F44" }}>
                    * Field yang wajib diisi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="text-center mt-12 animate-fade-in-up">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/80">
            <h3 className="text-lg font-medium mb-4" style={{ color: "#644F44" }}>
              Butuh Bantuan?
            </h3>
            <p className="text-sm opacity-70 mb-3" style={{ color: "#644F44" }}>
              Jika Anda mengalami kesulitan atau memiliki pertanyaan, silakan hubungi:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
              <a href={`tel:${rsvpSettings.contactPhone}`} className="flex items-center text-sm hover:text-amber-600 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {rsvpSettings.contactPhone}
              </a>
              <a href={`mailto:${rsvpSettings.contactEmail}`} className="flex items-center text-sm hover:text-amber-600 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {rsvpSettings.contactEmail}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-1 h-1 bg-amber-300 rounded-full animate-float-slow opacity-70"></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-rose-300 rounded-full animate-float opacity-60"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-float-slower opacity-50"></div>
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-pink-300 rounded-full animate-float opacity-65"></div>
        <div className="absolute bottom-1/4 right-1/5 w-1.5 h-1.5 bg-orange-300 rounded-full animate-float-slow opacity-55"></div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Ovo:wght@400&display=swap');

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-3deg); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(2deg); }
        }
        
        .animate-fade-in {
          animation: fade-in 1.2s ease-out 0.2s both;
        }
        
        .animate-slide-up {
          animation: slide-up 1s ease-out 0.4s both;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.8s both;
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

export default Rsvp;