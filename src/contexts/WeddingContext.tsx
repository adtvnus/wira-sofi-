import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WeddingSettings, WeddingCouple, WeddingEvent, QuotesSettings, BrideGroomPageSettings, StoryPageSettings, GalleryPageSettings, RsvpSettings, ThanksSettings, InvitedSettings } from '../types/wedding';
import { storageManager } from '../utils/storageManager';
import apiService from '../services/apiService';

interface WeddingContextType {
  weddingData: WeddingSettings;
  updateWeddingData: (data: Partial<WeddingSettings>) => void;
  updateCouple: (couple: Partial<WeddingCouple>) => void;
  updateEvents: (events: WeddingEvent[]) => void;
  updateQuotesSettings: (quotesSettings: Partial<QuotesSettings>) => void;
  updateBrideGroomSettings: (brideGroomSettings: Partial<BrideGroomPageSettings>) => void;
  updateStorySettings: (storySettings: Partial<StoryPageSettings>) => void;
  updateGallerySettings: (gallerySettings: Partial<GalleryPageSettings>) => void;
  updateRsvpSettings: (rsvpSettings: Partial<RsvpSettings>) => void;
  updateThanksSettings: (thanksSettings: Partial<ThanksSettings>) => void;
  updateInvitedSettings: (invitedSettings: Partial<InvitedSettings>) => void;
  guestName: string;
  setGuestName: (name: string) => void;
  isLoading: boolean;
  isOnline: boolean;
  useAPI: boolean;
  toggleAPIMode: () => void;
  syncWithAPI: () => Promise<void>;
  reloadActiveSettings: () => Promise<void>;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

// Default wedding data
const defaultWeddingData: WeddingSettings = {
  couple: {
    groomFirstName: "Wira",
    groomLastName: "Maulana",
    groomFullName: "Wira Maulana",
    groomParentNames: "Bapak Ahmad & Ibu Siti",
    groomPhoto: "public/images/BrideGroom/groom.jpg",
    brideFirstName: "Sofi",
    brideLastName: "Kumala",
    brideFullName: "Sofi Kumala",
    brideParentNames: "Bapak Budi & Ibu Rina",
    bridePhoto: "public/images/BrideGroom/bride.jpg",
  },
  events: [
    {
      eventName: "Akad Nikah",
      date: "Jumat, 26 September 2025",
      time: "12.00 WIB",
      venue: "Gedung C Teknik, Universitas Riau",
      address: "Jl. HR. Soebrantas, Simpang Baru, Kec. Tampan, Kota Pekanbaru, Riau",
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.668857089829!2d101.35013931475436!3d0.4637126997291157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31aa706cd2fd9b5f%3A0x7a4f8e4f4f4f4f4f!2sUniversitas%20Riau!5e0!3m2!1sen!2sid!4v1635123456789!5m2!1sen!2sid"
    }
  ],
  defaultGuestName: "Bapak/Ibu Tamu Undangan",
  welcomeMessage: "We would be honored by your presence",
  quotesSettings: {
    quotes: [
      {
        id: "1",
        text: "Cinta sejati tidak pernah berakhir. Kekasih mungkin berpisah, tetapi mereka tidak pernah berpisah sepenuhnya",
        author: "Paulo Coelho",
        isActive: true
      },
      {
        id: "2",
        text: "Pernikahan adalah tentang menjadi tim. Anda akan menghadapi dunia bersama-sama",
        author: "Anonymous",
        isActive: true
      },
      {
        id: "3",
        text: "Dalam pernikahan, cinta bukanlah perasaan semata, tetapi keputusan untuk mencintai setiap hari",
        author: "Gary Chapman",
        isActive: true
      }
    ],
    headerTitle: "Words of Love",
    headerSubtitle: "Kata-kata indah tentang cinta dan pernikahan",
    bottomMessage: "Love is the bridge between two hearts",
    quotesImage: "public/images/Quotes/quotes.jpg"
  },
  brideGroomSettings: {
    brideSettings: {
      headerTitle: "The Bride",
      headerSubtitle: "A beautiful soul with a heart full of love",
      label: "Calon Pengantin Wanita",
      parentLabel: "Putri dari",
      fatherName: "Bapak Adit",
      motherName: "Ibu Shikimori",
      quote: "Cinta sejati dimulai ketika tidak ada yang diharapkan sebagai balasan",
      photo: "public/images/BrideGroom/bride.jpg"
    },
    groomSettings: {
      headerTitle: "The Groom",
      headerSubtitle: "A gentle soul with strength and devotion",
      label: "Calon Pengantin Pria",
      parentLabel: "Putra dari",
      fatherName: "Bapak Agata",
      motherName: "Ibu Ayaka",
      quote: "Cinta sejati adalah ketika kamu menemukan seseorang yang membuatmu menjadi versi terbaik dari dirimu",
      photo: "public/images/BrideGroom/groom.jpg"
    }
  },
  storySettings: {
    headerTitle: "Our Story",
    headerSubtitle: "Perjalanan cinta kami dimulai dari pertemuan sederhana hingga janji suci yang akan kami ikrarkan",
    timelineItems: [
      {
        id: "1",
        year: "2019",
        title: "First Meet",
        date: "Agustus 2019",
        description: "Kami pertama kali bertemu dalam Ospek Perkuliahan. Dalam masa kuliah kami hanya teman biasa.",
        icon: "👫",
        color: "from-amber-200 to-orange-200",
        bgColor: "from-amber-100/20 to-orange-100/20",
        isActive: true
      },
      {
        id: "2",
        year: "2020",
        title: "Relationship",
        date: "25 Februari 2020",
        description: "Kami mengikat janji sebagai pasangan kekasih.",
        icon: "💕",
        color: "from-rose-200 to-pink-200",
        bgColor: "from-rose-100/20 to-pink-100/20",
        isActive: true
      },
      {
        id: "3",
        year: "2023",
        title: "Engagement",
        date: "25 Februari 2023",
        description: "Lika-liku hubungan kami lalui bersama hingga kami memutuskan untuk bertunangan pada 25 Februari 2023.",
        icon: "💍",
        color: "from-purple-200 to-violet-200",
        bgColor: "from-purple-100/20 to-violet-100/20",
        isActive: true
      },
      {
        id: "4",
        year: "2025",
        title: "Married",
        date: "26 September 2025",
        description: "Kami memutuskan untuk mengikat janji suci pernikahan pada 26 September 2025.",
        icon: "👰🤵",
        color: "from-emerald-200 to-teal-200",
        bgColor: "from-emerald-100/20 to-teal-100/20",
        isActive: true
      }
    ]
  },
  gallerySettings: {
    headerTitle: "Our Gallery",
    headerSubtitle: "Setiap momen indah dalam perjalanan cinta kami, terabadikan dalam kenangan yang tak terlupakan",
    bottomQuote: "Cinta adalah lukisan yang indah, dan setiap momen adalah sapuan kuas yang sempurna",
    images: [
      {
        id: "L1",
        src: "/images/Gallery/L1.jpg",
        alt: "Wedding Moment 1",
        type: "landscape",
        isActive: true
      },
      {
        id: "L2",
        src: "/images/Gallery/L2.jpg",
        alt: "Wedding Moment 2",
        type: "landscape",
        isActive: true
      },
      {
        id: "L3",
        src: "/images/Gallery/L3.jpg",
        alt: "Wedding Moment 3",
        type: "landscape",
        isActive: true
      },
      {
        id: "K1",
        src: "/images/Gallery/K1.jpg",
        alt: "Wedding Moment 4",
        type: "square",
        isActive: true
      },
      {
        id: "K2",
        src: "/images/Gallery/K2.jpg",
        alt: "Wedding Moment 5",
        type: "square",
        isActive: true
      },
      {
        id: "K3",
        src: "/images/Gallery/K3.jpg",
        alt: "Wedding Moment 6",
        type: "square",
        isActive: true
      }
    ]
  },
  rsvpSettings: {
    headerTitle: "RSVP",
    headerSubtitle: "Kehadiran dan doa restu Anda merupakan kebahagiaan bagi kami",
    description: "Mohon konfirmasi kehadiran Anda sebelum tanggal deadline.",
    deadlineDate: "15 Desember 2024",
    contactPhone: "+62 812 3456 7890",
    contactEmail: "wedding@wirasofi.com",
    ceremonyTime: "Akad Nikah (10:00 WIB)",
    receptionTime: "Resepsi (12:00 - 15:00 WIB)",
    isEnabled: true,
    responses: []
  },
  thanksSettings: {
    headerTitle: "Thank You",
    headerSubtitle: "Terima Kasih",
    mainMessage: "Atas kehadiran, doa, dan restu yang telah diberikan dalam hari bahagia kami, kami mengucapkan terima kasih yang sebesar-besarnya.",
    subMessage: "Semoga keberkahan dan kebahagiaan senantiasa menyertai kita semua.",
    coupleNames: "Wira & Sofi",
    blessingQuoteArabic: "Barakallahu lakuma wa baraka alaikuma wa jama'a bainakuma fi khair",
    blessingQuoteTranslation: "Semoga Allah memberkati kalian dan menyatukan kalian dalam kebaikan",
    backgroundImage: "",
    showSocialMedia: false,
    socialMedia: {
      instagram: "",
      facebook: "",
      twitter: ""
    },
    contactInfo: {
      phone: "",
      email: "",
      address: ""
    },
    isEnabled: true
  },
  invitedSettings: {
    headerTitle: "You're Invited",
    headerSubtitle: "We would be honored by your presence",
    eventTitle: "Wedding Ceremony",
    eventName: "Akad Nikah",
    eventDate: "Jumat, 26 September 2025",
    eventTime: "12.00 WIB",
    venueName: "Gedung C Teknik, Universitas Riau",
    venueAddress: "Jl. HR. Soebrantas, Simpang Baru, Kec. Tampan, Kota Pekanbaru, Riau",
    googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.668857089829!2d101.35013931475436!3d0.4637126997291157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31aa706cd2fd9b5f%3A0x7a4f8e4f4f4f4f4f!2sUniversitas%20Riau!5e0!3m2!1sen!2sid!4v1635123456789!5m2!1sen!2sid",
    saveTheDateTitle: "Save the Date",
    saveTheDateMessage: "We can't wait to celebrate with you!",
    isEnabled: true
  }
};

const STORAGE_KEY = 'wedding-invitation-data';

interface WeddingProviderProps {
  children: ReactNode;
}

export const WeddingProvider: React.FC<WeddingProviderProps> = ({ children }) => {
  const [weddingData, setWeddingData] = useState<WeddingSettings>(defaultWeddingData);
  const [guestName, setGuestName] = useState<string>(defaultWeddingData.defaultGuestName);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [useAPI, setUseAPI] = useState(() => {
    const saved = localStorage.getItem('useAPI');
    return saved ? JSON.parse(saved) : false;
  });

  // Use singleton API service (already initialized in AuthContext)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data from storage or API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        if (useAPI && isOnline) {
          // Try to load from API first
          try {
            const apiResult = await apiService.getWeddingSettings();
            if (apiResult.success && apiResult.data) {
              setWeddingData({ ...defaultWeddingData, ...apiResult.data });
              // Also save to local storage as backup
              await storageManager.setItem(STORAGE_KEY, apiResult.data);
            } else {
              // Fallback to local storage
              const result = await storageManager.getItem<WeddingSettings>(STORAGE_KEY);
              if (result.success && result.data) {
                setWeddingData({ ...defaultWeddingData, ...result.data });
              }
            }
          } catch (error) {
            console.warn('API load failed, using local storage:', error);
            // Fallback to local storage
            const result = await storageManager.getItem<WeddingSettings>(STORAGE_KEY);
            if (result.success && result.data) {
              setWeddingData({ ...defaultWeddingData, ...result.data });
            }
          }
        } else {
          // Load from local storage
          const result = await storageManager.getItem<WeddingSettings>(STORAGE_KEY);
          if (result.success && result.data) {
            setWeddingData({ ...defaultWeddingData, ...result.data });
          }
        }
      } catch (error) {
        console.error('Error loading wedding data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [useAPI, isOnline]);

  // Save data to storage and API whenever weddingData changes
  useEffect(() => {
    if (!isLoading) {
      const saveData = async () => {
        try {
          // Always save to local storage first
          const localResult = await storageManager.setItem(STORAGE_KEY, weddingData);
          if (!localResult.success) {
            console.error('Failed to save wedding data locally:', localResult.error);
          }

          // If API mode is enabled and online, also save to API
          if (useAPI && isOnline) {
            try {
              const apiResult = await apiService.updateWeddingSettings(weddingData);
              if (!apiResult.success) {
                console.warn('Failed to save to API, data saved locally:', apiResult.error);
              }
            } catch (apiError) {
              console.warn('API save failed, data saved locally:', apiError);
            }
          }

          // Auto-save completed successfully
          console.log('Wedding data saved successfully');
        } catch (error) {
          console.error('Error saving wedding data:', error);
        }
      };

      saveData();
    }
  }, [weddingData, isLoading, useAPI, isOnline]);

  const updateWeddingData = (data: Partial<WeddingSettings>) => {
    setWeddingData(prev => ({ ...prev, ...data }));
  };

  const updateCouple = (couple: Partial<WeddingCouple>) => {
    setWeddingData(prev => ({
      ...prev,
      couple: { ...prev.couple, ...couple }
    }));
  };

  const updateEvents = (events: WeddingEvent[]) => {
    setWeddingData(prev => ({
      ...prev,
      events
    }));
  };

  const updateQuotesSettings = (quotesSettings: Partial<QuotesSettings>) => {
    setWeddingData(prev => ({
      ...prev,
      quotesSettings: { ...prev.quotesSettings, ...quotesSettings }
    }));
  };

  const updateBrideGroomSettings = (brideGroomSettings: Partial<BrideGroomPageSettings>) => {
    setWeddingData(prev => ({
      ...prev,
      brideGroomSettings: { ...prev.brideGroomSettings, ...brideGroomSettings }
    }));
  };

  const updateStorySettings = (storySettings: Partial<StoryPageSettings>) => {
    setWeddingData(prev => ({
      ...prev,
      storySettings: { ...prev.storySettings, ...storySettings }
    }));
  };

  const updateGallerySettings = (gallerySettings: Partial<GalleryPageSettings>) => {
    setWeddingData(prev => ({
      ...prev,
      gallerySettings: { ...prev.gallerySettings, ...gallerySettings }
    }));
  };

  const updateRsvpSettings = (rsvpSettings: Partial<RsvpSettings>) => {
    setWeddingData(prev => ({
      ...prev,
      rsvpSettings: { ...prev.rsvpSettings, ...rsvpSettings }
    }));
  };

  const updateThanksSettings = (thanksSettings: Partial<ThanksSettings>) => {
    setWeddingData(prev => ({
      ...prev,
      thanksSettings: { ...prev.thanksSettings, ...thanksSettings }
    }));
  };

  const updateInvitedSettings = (invitedSettings: Partial<InvitedSettings>) => {
    setWeddingData(prev => ({
      ...prev,
      invitedSettings: { ...prev.invitedSettings, ...invitedSettings }
    }));
  };

  // Toggle API mode
  const toggleAPIMode = () => {
    const newUseAPI = !useAPI;
    setUseAPI(newUseAPI);
    localStorage.setItem('useAPI', JSON.stringify(newUseAPI));
  };

  // Sync with API
  const syncWithAPI = async () => {
    if (!isOnline) {
      throw new Error('No internet connection');
    }

    try {
      // Get latest data from API
      const apiResult = await apiService.getWeddingSettings();
      if (apiResult.success && apiResult.data) {
        setWeddingData({ ...defaultWeddingData, ...apiResult.data });
        // Save to local storage as backup
        await storageManager.setItem(STORAGE_KEY, apiResult.data);
      } else {
        throw new Error(apiResult.error || 'Failed to sync with API');
      }
    } catch (error) {
      console.error('Sync with API failed:', error);
      throw error;
    }
  };

  // Reload active wedding settings from database
  const reloadActiveSettings = async () => {
    try {
      const apiResult = await apiService.getWeddingSettings();
      if (apiResult.success && apiResult.data.data) {
        // Convert database format to context format
        const dbData = apiResult.data.data;
        const contextData = {
          couple: {
            groomFirstName: dbData.groom_first_name || '',
            groomLastName: dbData.groom_full_name?.split(' ').slice(-1)[0] || '',
            groomFullName: dbData.groom_full_name || '',
            groomParents: dbData.groom_parents || '',
            brideFirstName: dbData.bride_first_name || '',
            brideLastName: dbData.bride_full_name?.split(' ').slice(-1)[0] || '',
            brideFullName: dbData.bride_full_name || '',
            brideParents: dbData.bride_parents || ''
          },
          events: [
            {
              id: '1',
              eventName: 'Wedding Ceremony',
              date: dbData.wedding_date || '',
              time: dbData.wedding_time || '',
              venue: dbData.wedding_venue || '',
              address: dbData.wedding_address || '',
              mapUrl: ''
            },
            ...(dbData.reception_date ? [{
              id: '2',
              eventName: 'Reception',
              date: dbData.reception_date || '',
              time: dbData.reception_time || '',
              venue: dbData.reception_venue || '',
              address: dbData.reception_address || '',
              mapUrl: ''
            }] : [])
          ]
        };

        setWeddingData(prev => ({ ...prev, ...contextData }));
        console.log('✅ Active wedding settings reloaded from database');
      }
    } catch (error) {
      console.error('Failed to reload active settings:', error);
    }
  };

  const value: WeddingContextType = {
    weddingData,
    updateWeddingData,
    updateCouple,
    updateEvents,
    updateQuotesSettings,
    updateBrideGroomSettings,
    updateStorySettings,
    updateGallerySettings,
    updateRsvpSettings,
    updateThanksSettings,
    updateInvitedSettings,
    guestName,
    setGuestName,
    isLoading,
    isOnline,
    useAPI,
    toggleAPIMode,
    syncWithAPI,
    reloadActiveSettings
  };

  return (
    <WeddingContext.Provider value={value}>
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = (): WeddingContextType => {
  const context = useContext(WeddingContext);
  if (context === undefined) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
