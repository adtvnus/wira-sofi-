import { useState, useEffect } from "react";

interface GalleryImage {
  id: number;
  image_src: string;
  image_alt: string;
  image_type: 'landscape' | 'square' | 'portrait';
  image_size: 'L' | 'S';
  display_order: number;
}

interface GallerySettings {
  header_title: string;
  header_subtitle: string;
  bottom_quote: string;
}

const Gallery = () => {
  const [galleryData, setGalleryData] = useState<{
    settings: GallerySettings;
    images: GalleryImage[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<null | GalleryImage>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  // Load gallery data from database
  useEffect(() => {
    loadGalleryData();
  }, []);

  const loadGalleryData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE_URL}/gallery/public`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGalleryData(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading gallery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get active gallery images
  const activeGalleryImages = galleryData?.images || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p style={{ color: "#644F44" }}>Loading gallery from database...</p>
        </div>
      </div>
    );
  }

  // If no data or no active images, show default message
  if (!galleryData || activeGalleryImages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: "#644F44" }}>No gallery images available</p>
          <p className="text-sm text-gray-500 mt-2">Please check back later</p>
        </div>
      </div>
    );
  }

  const handleImageLoad = (imageId: string) => {
    setImageLoaded(prev => ({ ...prev, [imageId]: true }));
  };

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <div
      className="min-h-screen px-6 py-12 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #f8f6f3 0%, #f1ede8 50%, #ede7e0 100%)",
        fontFamily: "Ovo, serif",
      }}
    >
      {/* Enhanced Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-48 h-48 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 rounded-full opacity-20 blur-3xl animate-float-slower"></div>
        <div className="absolute bottom-32 right-20 w-56 h-56 bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 rounded-full opacity-25 blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 rounded-full opacity-18 blur-2xl animate-float"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full opacity-15 blur-xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-36 h-36 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full opacity-20 blur-xl animate-float-slower"></div>
      </div>

      {/* Ornamental Design Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-amber-200 opacity-30">
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-amber-300 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 border-amber-200 opacity-30">
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-300 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-8 left-8 w-24 h-24 border-l-2 border-b-2 border-amber-200 opacity-30">
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-amber-300 rounded-full opacity-60"></div>
        </div>
        <div className="absolute bottom-8 right-8 w-24 h-24 border-r-2 border-b-2 border-amber-200 opacity-30">
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-300 rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            <div className="mx-8 flex space-x-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-150"></div>
            </div>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
          </div>
          
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-wider"
            style={{ color: "#644F44" }}
          >
            {galleryData.settings.header_title}
          </h1>

          <p
            className="text-lg tracking-wide opacity-70 italic max-w-2xl mx-auto leading-relaxed"
            style={{ color: "#644F44" }}
          >
            "{galleryData.settings.header_subtitle}"
          </p>
          
          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
            <div className="w-2 h-2 bg-rose-300 rounded-full animate-pulse"></div>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent"></div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {activeGalleryImages.map((image, index) => (
              <div 
                key={image.id}
                className={`relative group cursor-pointer animate-scale-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => openLightbox(image)}
              >
                {/* Image Container */}
                <div className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:scale-105 ${
                  image.image_type === 'landscape'
                    ? 'aspect-video md:col-span-2 lg:col-span-2'
                    : image.image_type === 'portrait'
                    ? 'aspect-[3/4]'
                    : 'aspect-square'
                }`}>
                  {/* Loading skeleton */}
                  {!imageLoaded[image.id] && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-2xl"></div>
                  )}

                  {/* Decorative frame */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-amber-200 via-rose-200 to-pink-200 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm"></div>

                  {/* Main image */}
                  <img
                    src={image.image_src}
                    alt={image.image_alt}
                    className="relative z-10 w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-110"
                    onLoad={() => handleImageLoad(image.id.toString())}
                  />

                  {/* Size badge */}
                  <div className="absolute top-4 left-4 z-40">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      image.image_size === 'L'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {image.image_size}
                    </span>
                  </div>
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl z-20"></div>
                  
                  {/* Hover effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100/10 via-transparent to-rose-100/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl z-15"></div>
                  
                  {/* Corner decorations */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"></div>
                  
                  {/* Floating elements */}
                  <div className="absolute top-6 right-6 w-3 h-3 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse z-30"></div>
                  <div className="absolute bottom-6 left-6 w-2 h-2 bg-amber-200/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse delay-75 z-30"></div>
                </div>
                
                {/* Floating decorative elements around image */}
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 animate-float blur-sm"></div>
                <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-gradient-to-br from-rose-300 to-pink-300 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500 animate-float-slow blur-sm"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-20 animate-fade-in-delayed">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-xl"></div>
            <div className="relative z-10 px-10 py-8">
              <p
                className="text-xl italic font-light leading-relaxed mb-4"
                style={{ color: "#644F44" }}
              >
                "{galleryData.settings.bottom_quote}"
              </p>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
                <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse"></div>
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={closeLightbox}
        >
          <div className="relative max-w-5xl max-h-full">
            <img
              src={selectedImage.image_src}
              alt={selectedImage.image_alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            {/* Image info overlay */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
              <p className="text-white text-sm">
                Size: {selectedImage.image_size} | Type: {selectedImage.image_type}
              </p>
            </div>
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/5 left-1/6 w-1 h-1 bg-amber-300 rounded-full animate-float-slow opacity-70"></div>
        <div className="absolute top-1/3 right-1/5 w-1.5 h-1.5 bg-rose-300 rounded-full animate-float opacity-60"></div>
        <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-float-slower opacity-50"></div>
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-pink-300 rounded-full animate-float opacity-65"></div>
        <div className="absolute bottom-1/5 right-1/6 w-1.5 h-1.5 bg-orange-300 rounded-full animate-float-slow opacity-55"></div>
        <div className="absolute top-1/6 left-2/3 w-1 h-1 bg-amber-200 rounded-full animate-float-slower opacity-60"></div>
        <div className="absolute top-1/2 right-1/5 w-1 h-1 bg-rose-200 rounded-full animate-float opacity-45"></div>
        <div className="absolute bottom-1/3 left-1/5 w-1 h-1 bg-pink-200 rounded-full animate-float-slow opacity-50"></div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Ovo:wght@400&display=swap');

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
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
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.6s both;
        }
        
        .animate-fade-in-delayed {
          animation: fade-in 1s ease-out 1.2s both;
        }
        
        .animate-scale-in {
          animation: scale-in 0.8s ease-out both;
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

export default Gallery;