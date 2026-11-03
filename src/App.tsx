import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  Check,
  Navigation,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Heart,
  Lock,
  Save,
  RotateCcw,
  X,
  Edit3,
  FileDown,
  LocateFixed,
  Palette,
  ImagePlus,
  Flower2,
  Share2,
  MessageCircle,
  Link,
  Hand,
  Settings,
} from 'lucide-react';
import { weddingAudio } from './utils/weddingAudio';
import { triggerWeddingCardPdfPrint } from './utils/pdfCardExport';
import { auth, db, doc, getDoc, setDoc, onSnapshot, collection, addDoc } from './utils/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { AuthModal } from './components/AuthModal';
import {
  MarigoldCornerMotif,
  ClassicGoldCorner,
  LushFloralCorner,
  ModernLeafCorner,
  FloralDivider,
  MarigoldGarlandHeader,
  CardFloralArchBorder,
  FloralBackgroundAndFallingPetals,
} from './components/RoyalFloralMotifs';

// High-resolution generated wedding imagery
const HERO_IMAGE = '/src/assets/images/wedding_hero_backdrop_1793681200761.jpg';
const MEHNDI_IMAGE = '/src/assets/images/event_mehndi_festive_1793681201541.jpg';
const BARAAT_IMAGE = '/src/assets/images/event_baraat_nikkah_1793681202937.jpg';
const WALIMA_IMAGE = '/src/assets/images/event_walima_reception_1793681202864.jpg';

type CardTabId = 'cover' | 'events' | 'venue' | 'rsvp';
type RoyalThemeId = 'pink-watercolor' | 'rose-gold' | 'regal-crimson' | 'minimal-white' | 'golden-ochre' | 'midnight-indigo' | 'lavender-mist' | 'teal-treasure';

const ROYAL_THEMES: {
  id: RoyalThemeId;
  name: string;
  subtitle: string;
  floralBadge: string;
  bgPreview: string;
  cardPreview: string;
  accentPreview: string;
  flower1Preview: string;
  flower2Preview: string;
  defaultBgUrl: string;
}[] = [
  {
    id: 'pink-watercolor',
    name: 'Pink Watercolor Bloom',
    subtitle: 'Soft Hand-Painted Pink Florals & Soft Blush',
    floralBadge: 'Blush Pink Rose',
    bgPreview: '#831843',
    cardPreview: '#9D174D',
    accentPreview: '#F472B6',
    flower1Preview: '#FDA4AF',
    flower2Preview: '#F472B6',
    defaultBgUrl: HERO_IMAGE,
  },
  {
    id: 'rose-gold',
    name: 'Romantic Rose & Gold',
    subtitle: 'Dusty Rose Pink & Glittering Champagne Gold',
    floralBadge: 'Rose Gold Peony',
    bgPreview: '#4C0519',
    cardPreview: '#881337',
    accentPreview: '#F5C542',
    flower1Preview: '#FB7185',
    flower2Preview: '#F43F5E',
    defaultBgUrl: BARAAT_IMAGE,
  },
  {
    id: 'regal-crimson',
    name: 'Royal Crimson & Antique Gold',
    subtitle: 'Velvet Ruby Red & Heirloom Zari Gold',
    floralBadge: 'Deep Red Rose',
    bgPreview: '#1A0409',
    cardPreview: '#2E0812',
    accentPreview: '#D4AF37',
    flower1Preview: '#E11D48',
    flower2Preview: '#B45309',
    defaultBgUrl: BARAAT_IMAGE,
  },
  {
    id: 'minimal-white',
    name: 'Modern Minimal White',
    subtitle: 'Refined Aesthetic & Elegant Olive Greens',
    floralBadge: 'Olive & White Lily',
    bgPreview: '#F9FAFB',
    cardPreview: '#FFFFFF',
    accentPreview: '#4A5D4E',
    flower1Preview: '#6B7280',
    flower2Preview: '#9CA3AF',
    defaultBgUrl: WALIMA_IMAGE,
  },
  {
    id: 'golden-ochre',
    name: 'Boho Golden Ochre',
    subtitle: 'Earthy Warm Tones & Radiant Amber Blossoms',
    floralBadge: 'Amber Sunflower',
    bgPreview: '#3B1802',
    cardPreview: '#6D2E0B',
    accentPreview: '#F59E0B',
    flower1Preview: '#D97706',
    flower2Preview: '#92400E',
    defaultBgUrl: MEHNDI_IMAGE,
  },
  {
    id: 'midnight-indigo',
    name: 'Midnight Indigo & Copper',
    subtitle: 'Deep Navy Velvet & Lustrous Metallic Florals',
    floralBadge: 'Indigo Blossom',
    bgPreview: '#0F0D24',
    cardPreview: '#1E1B4B',
    accentPreview: '#B45309',
    flower1Preview: '#6366F1',
    flower2Preview: '#DB2777',
    defaultBgUrl: HERO_IMAGE,
  },
  {
    id: 'lavender-mist',
    name: 'Dreamy Lavender Mist',
    subtitle: 'Serene Purple Pastels & Silver Stardust',
    floralBadge: 'Lavender & Wisteria',
    bgPreview: '#F3E8FF',
    cardPreview: '#FFFFFF',
    accentPreview: '#7C3AED',
    flower1Preview: '#C4B5FD',
    flower2Preview: '#F9A8D4',
    defaultBgUrl: WALIMA_IMAGE,
  },
  {
    id: 'teal-treasure',
    name: 'Teal Treasure & Coral',
    subtitle: 'Vibrant Sea Teal & Exotic Coral Petals',
    floralBadge: 'Teal & Coral Rose',
    bgPreview: '#022C22',
    cardPreview: '#0F766E',
    accentPreview: '#FB923C',
    flower1Preview: '#2DD4BF',
    flower2Preview: '#F43F5E',
    defaultBgUrl: HERO_IMAGE,
  },
];

const FLORAL_BG_PRESETS = [
  {
    id: 'rose-palace',
    label: 'Regal Crimson (Roses)',
    url: BARAAT_IMAGE,
  },
  {
    id: 'marigold-canopy',
    label: 'Golden Ochre (Marigold)',
    url: MEHNDI_IMAGE,
  },
  {
    id: 'mughal-arch',
    label: 'Forest Jasmine (Emerald)',
    url: HERO_IMAGE,
  },
  {
    id: 'white-florals',
    label: 'Lavender Mist (Orchids)',
    url: WALIMA_IMAGE,
  },
];

interface WeddingEventItem {
  id: 'mehndi' | 'baraat' | 'walima';
  shortName: string;
  title: string;
  urduSubtitle: string;
  dateLabel: string;
  isoDate: string;
  timeRange: string;
  venueName: string;
  address: string;
  mapEmbedQuery: string;
  dressCode: string;
  image: string;
  rasmHighlights: { time: string; label: string }[];
}

interface WeddingConfigData {
  themeId?: RoyalThemeId;
  floralBgUrl?: string;
  themeCustomBgMap?: Partial<Record<RoyalThemeId, string>>;
  customBgList?: { id: string; label: string; url: string }[];
  bgBrightness?: number;
  showFallingFlowers?: boolean;
  coverPhotoUrl?: string;
  salamHeading: string;
  arabicDua: string;
  urduRomanDua: string;
  groomName: string;
  brideName: string;
  hostParentsLine: string;
  weddingDatesSummary: string;
  cityLabel: string;
  events: WeddingEventItem[];
  cardOpacity?: number;
  cardBlur?: number;
  cardBackgroundUrl?: string;
  cornerStyle?: 'marigold' | 'classic-gold' | 'lush-floral' | 'modern-leaf';
  recipientName?: string;
}

const DEFAULT_WEDDING_DATA: WeddingConfigData = {
  themeId: 'regal-crimson',
  floralBgUrl: BARAAT_IMAGE,
  themeCustomBgMap: {},
  customBgList: [],
  bgBrightness: 0.58,
  cardOpacity: 0.85,
  cardBlur: 16,
  showFallingFlowers: true,
  coverPhotoUrl: HERO_IMAGE,
  salamHeading: 'ASSALAM-O-ALAIKUM',
  arabicDua: 'بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
  urduRomanDua:
    '“Allah Ta’ala aap dono ki jori ko hamesha salamat rakhe aur dono khandano mein dheron barkat, mohabbat aur khushiyan ata farmaye — Ameen.”',
  groomName: 'Anas Mahmood',
  brideName: 'Abeer Zahid',
  hostParentsLine:
    'Mr. & Mrs. Mahmood & Family cordially invite you to the wedding of',
  weddingDatesSummary: '14 — 15 November 2026',
  cityLabel: 'Lahore, Pakistan',
  events: [
    {
      id: 'mehndi',
      shortName: 'Mehndi · 13 Nov',
      title: 'Hina & Festive Mehndi Night',
      urduSubtitle: 'جشنِ مہندی',
      dateLabel: 'Friday, Nov 13, 2026',
      isoDate: '2026-11-13T19:00:00',
      timeRange: '7:00 PM — 10:30 PM',
      venueName: 'Al-Amir Marquee (Alameer)',
      address: 'Main Canal Bank Road, Lahore',
      mapEmbedQuery: 'Al-Amir Marquee Canal Road Lahore',
      dressCode: 'Vibrant Yellows, Oranges & Traditional Green',
      image: MEHNDI_IMAGE,
      rasmHighlights: [
        { time: '7:15 PM', label: 'Dhol & Gidda Performance' },
        { time: '8:00 PM', label: 'Mehndi Application Rasm' },
        { time: '9:30 PM', label: 'Festive Dinner & Sangeet' },
      ],
    },
    {
      id: 'baraat',
      shortName: 'Baraat · 14 Nov',
      title: 'Nikkah & Shahi Baraat',
      urduSubtitle: 'عقدِ نکاح و بارات',
      dateLabel: 'Saturday, Nov 14, 2026',
      isoDate: '2026-11-14T19:00:00',
      timeRange: '7:00 PM — 11:00 PM',
      venueName: 'Al-Amir Marquee (Alameer)',
      address: 'Main Canal Bank Road, Lahore',
      mapEmbedQuery: 'Al-Amir Marquee Canal Road Lahore',
      dressCode: 'Crimson, Deep Emerald & Gold Formals',
      image: BARAAT_IMAGE,
      rasmHighlights: [
        { time: '7:00 PM', label: 'Baraat Arrival & Milni' },
        { time: '8:00 PM', label: 'Sacred Khutbah-e-Nikkah' },
        { time: '9:30 PM', label: 'Shahi Banquet & Rukhsati' },
      ],
    },
    {
      id: 'walima',
      shortName: 'Walima · 15 Nov',
      title: 'Dawat-e-Walima Reception',
      urduSubtitle: 'دعوتِ ولیمہ',
      dateLabel: 'Sunday, Nov 15, 2026',
      isoDate: '2026-11-15T19:00:00',
      timeRange: '7:00 PM — 10:30 PM',
      venueName: 'Anmol Marquee',
      address: 'Gurumangat Road, Gulberg III, Lahore',
      mapEmbedQuery: 'Anmol Marquee Gulberg Lahore',
      dressCode: 'Champagne Gold, Ivory & Eastern Formals',
      image: WALIMA_IMAGE,
      rasmHighlights: [
        { time: '7:15 PM', label: 'Red Carpet Welcome' },
        { time: '8:00 PM', label: 'Couple Arrival & Salamti Dua' },
        { time: '9:15 PM', label: 'Royal Walima Dinner' },
      ],
    },
  ],
  cardOpacity: 0.85,
  cardBackgroundUrl: '',
  recipientName: 'Muazzam Mehmaan',
};

const STORAGE_KEY = 'shahi_shadiama_custom_card_v2';

// Helper to extract a clean Google Maps search query from a pasted Google Maps link, coordinates, or plain place name
function parseEasyLocationInput(rawInput: string, fallbackVenue: string, fallbackAddress: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return `${fallbackVenue} ${fallbackAddress}`.trim();
  }

  // Check if user pasted a full URL with ?q=... or /place/... or @lat,lng
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const qParam = url.searchParams.get('q') || url.searchParams.get('query');
      if (qParam) return qParam;

      // Check for @lat,lng in Google Maps URL
      const coordMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        return `${coordMatch[1]},${coordMatch[2]}`;
      }

      // Check for /place/Place+Name/
      const placeMatch = url.pathname.match(/\/place\/([^/]+)/);
      if (placeMatch && placeMatch[1]) {
        return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      }
    }
  } catch {
    // Fallback to raw string
  }

  return trimmed;
}

export default function App() {
  // Load customizable wedding card data from Firestore
  const [weddingData, setWeddingData] = useState<WeddingConfigData>(DEFAULT_WEDDING_DATA);
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false);

  useEffect(() => {
    // Listen for wedding data updates
    const unsub = onSnapshot(doc(db, 'settings', 'weddingConfig'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as WeddingConfigData;
        
        // Auto-upgrade if doc still contains old default names
        if (data.groomName === 'Zayd Sikandar Khan') {
          const updated = {
            ...data,
            groomName: 'Anas Mahmood',
            brideName: 'Abeer Zahid',
            hostParentsLine: 'Mr. & Mrs. Mahmood & Family cordially invite you to the wedding of',
            weddingDatesSummary: '14 — 15 November 2026',
            events: DEFAULT_WEDDING_DATA.events,
          };
          setDoc(doc(db, 'settings', 'weddingConfig'), updated).catch(console.error);
          setWeddingData(updated);
        } else {
          // Check for guest name in URL parameters
          const urlParams = new URLSearchParams(window.location.search);
          const guestFromUrl = urlParams.get('g') || urlParams.get('guest') || urlParams.get('name');
          if (guestFromUrl) {
            data.recipientName = decodeURIComponent(guestFromUrl);
          }
          setWeddingData(data);
        }
      } else {
        // Initialize with default data if doc doesn't exist
        setWeddingData(DEFAULT_WEDDING_DATA);
      }
      setIsFirebaseLoaded(true);
    }, (error) => {
      console.error("Firestore read error:", error);
      setIsFirebaseLoaded(true);
    });

    return () => unsub();
  }, []);

  // Admin access control using Firebase Auth
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'km@gmail.com') {
        setIsAdmin(true);
        setUserEmail(user.email);
      } else {
        setIsAdmin(false);
        setUserEmail(null);
      }
    });
    return () => unsub();
  }, []);

  // Step 1 vs Step 2
  const [isInvitationOpened, setIsInvitationOpened] = useState<boolean>(false);
  const [isCurtainAnimating, setIsCurtainAnimating] = useState<boolean>(false);

  // Active section inside the compact single-screen Digital Card
  const [activeCardTab, setActiveCardTab] = useState<CardTabId>('cover');
  const [selectedEventIdx, setSelectedEventIdx] = useState<number>(1); // Default Baraat

  useEffect(() => {
    if (!isInvitationOpened) {
      const timer = setTimeout(() => {
        handleOpenInvitation(false);
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [isInvitationOpened]);

  // Countdown Timer Mode: 'auto' (Auto-connects Baraat -> Walima) or manual override
  const [timerMode, setTimerMode] = useState<'auto' | 'mehndi' | 'baraat' | 'walima'>('auto');

  // Audio player state
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Secret 10-Click Header Unlock & Password ("111222") Editor States + 10-Click Theme Switcher
  const [, setHeaderClickCount] = useState<number>(0);
  const clickResetTimerRef = useRef<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [showEditorModal, setShowEditorModal] = useState<boolean>(false);
  const [draftData, setDraftData] = useState<WeddingConfigData>(weddingData);
  const [saveSuccessBanner, setSaveSuccessBanner] = useState<boolean>(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string>('');
  const [themeToastMsg, setThemeToastMsg] = useState<string>('');
  const [customBgUrlInput, setCustomBgUrlInput] = useState<string>('');
  const [themeStudioTab, setThemeStudioTab] = useState<'themes' | 'bg'>('themes');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [focusedElement, setFocusedElement] = useState<'countdown' | 'event' | 'map' | 'photo' | null>(null);
  const [editorTab, setEditorTab] = useState<'couples' | 'themes' | 'style' | 'events'>('couples');

  // Guest name inline editing states
  const [guestNameClicks, setGuestNameClicks] = useState<number>(0);
  const [isInlineEditingName, setIsInlineEditingName] = useState<boolean>(false);
  const guestClickResetTimerRef = useRef<number | null>(null);

  // Name to use when sharing via WhatsApp
  const [shareRecipientName, setShareRecipientName] = useState<string>('');


  const activeThemeId: RoyalThemeId = ROYAL_THEMES.some(t => t.id === weddingData.themeId) ? (weddingData.themeId as RoyalThemeId) : 'regal-crimson';
  const activeThemeObj = ROYAL_THEMES.find((t) => t.id === activeThemeId) || ROYAL_THEMES[0];

  // Active background URL resolves in order:
  // 1. Custom BG uploaded specifically for this Theme
  // 2. Currently selected floralBgUrl
  // 3. The Theme's own default floral background
  const effectiveBackgroundUrl =
    weddingData.themeCustomBgMap?.[activeThemeId] ||
    weddingData.floralBgUrl ||
    activeThemeObj.defaultBgUrl;

  useEffect(() => {
    document.documentElement.setAttribute('data-wedding-theme', activeThemeId);
  }, [activeThemeId]);

  const applyThemeInstantly = (nextThemeId: RoyalThemeId) => {
    const themeObj = ROYAL_THEMES.find((t) => t.id === nextThemeId) || ROYAL_THEMES[0];
    if (!themeObj) return;
    // Switch both the Theme Palette AND its associated Background (custom or theme default)!
    const nextBg =
      weddingData.themeCustomBgMap?.[nextThemeId] || themeObj.defaultBgUrl;

    const updated: WeddingConfigData = {
      ...weddingData,
      themeId: nextThemeId,
      floralBgUrl: nextBg,
    };
    setWeddingData(updated);
    setDraftData((prev) => ({
      ...prev,
      themeId: nextThemeId,
      floralBgUrl: nextBg,
    }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setThemeToastMsg(`Theme & BG Changed: ${themeObj.name}`);
    window.setTimeout(() => {
      setThemeToastMsg('');
    }, 2600);
  };

  const cycleToNextTheme = () => {
    if (ROYAL_THEMES.length === 0) return;
    const currentIndex = ROYAL_THEMES.findIndex((t) => t.id === activeThemeId);
    const nextIndex = (currentIndex + 1) % ROYAL_THEMES.length;
    applyThemeInstantly(ROYAL_THEMES[nextIndex].id);
  };

  // Compress & convert uploaded image file to Data URL so it saves reliably in localStorage
  // Supports uploading for a specific theme OR adding to the custom background gallery!
  const handleImageFileUpload = (
    file: File | undefined,
    targetField: 'floralBgUrl' | 'coverPhotoUrl' | 'cardBackgroundUrl',
    forSpecificThemeId?: RoyalThemeId
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const resultUrl = ev.target?.result as string;
      if (!resultUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1280;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

          if (targetField === 'coverPhotoUrl') {
            const updated = { ...weddingData, coverPhotoUrl: compressedDataUrl };
            setWeddingData(updated);
            setDraftData((prev) => ({ ...prev, coverPhotoUrl: compressedDataUrl }));
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {
              // ignore
            }
            setThemeToastMsg('Card Cover Photo Uploaded!');
          } else if (targetField === 'cardBackgroundUrl') {
            const updated = { ...weddingData, cardBackgroundUrl: compressedDataUrl };
            setWeddingData(updated);
            setDraftData((prev) => ({ ...prev, cardBackgroundUrl: compressedDataUrl }));
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {
              // ignore
            }
            setThemeToastMsg('Card Inner Background Uploaded!');
          } else {
            const themeKey = forSpecificThemeId || activeThemeId;
            const prevCustomList = weddingData.customBgList || [];
            const newCustomItem = {
              id: `custom-bg-${Date.now()}`,
              label: `My BG ${prevCustomList.length + 1}`,
              url: compressedDataUrl,
            };
            const updated: WeddingConfigData = {
              ...weddingData,
              themeId: themeKey,
              floralBgUrl: compressedDataUrl,
              themeCustomBgMap: {
                ...(weddingData.themeCustomBgMap || {}),
                [themeKey]: compressedDataUrl,
              },
              customBgList: [newCustomItem, ...prevCustomList].slice(0, 6),
            };
            setWeddingData(updated);
            setDraftData(updated);
            setWeddingData(updated);
            setDraftData(updated);
            if (isAdmin) {
              setDoc(doc(db, 'settings', 'weddingConfig'), updated).catch(console.error);
            }
            setThemeToastMsg('Apni Pasand ka Background Add Ho Gaya!');
          }
          window.setTimeout(() => setThemeToastMsg(''), 2600);
        }
      };
      img.src = resultUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomBgByUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = customBgUrlInput.trim();
    if (!url) return;
    const prevCustomList = weddingData.customBgList || [];
    const newCustomItem = {
      id: `url-bg-${Date.now()}`,
      label: `Custom Link ${prevCustomList.length + 1}`,
      url,
    };
    const updated: WeddingConfigData = {
      ...weddingData,
      floralBgUrl: url,
      themeCustomBgMap: {
        ...(weddingData.themeCustomBgMap || {}),
        [activeThemeId]: url,
      },
      customBgList: [newCustomItem, ...prevCustomList].slice(0, 6),
    };
    setWeddingData(updated);
    setDraftData(updated);
    setCustomBgUrlInput('');
    setWeddingData(updated);
    setDraftData(updated);
    setCustomBgUrlInput('');
    if (isAdmin) {
      setDoc(doc(db, 'settings', 'weddingConfig'), updated).catch(console.error);
    }
    setThemeToastMsg('Custom Image Link Background Set Ho Gaya!');
    window.setTimeout(() => setThemeToastMsg(''), 2500);
  };

  const applyFloralPreset = (presetUrl: string, label: string) => {
    const updated: WeddingConfigData = {
      ...weddingData,
      floralBgUrl: presetUrl,
      themeCustomBgMap: {
        ...(weddingData.themeCustomBgMap || {}),
        [activeThemeId]: presetUrl,
      },
    };
    setWeddingData(updated);
    setDraftData(updated);
    setWeddingData(updated);
    setDraftData(updated);
    if (isAdmin) {
      setDoc(doc(db, 'settings', 'weddingConfig'), updated).catch(console.error);
    }
    setThemeToastMsg(`Floral BG Set: ${label}`);
    window.setTimeout(() => setThemeToastMsg(''), 2400);
  };

  const handleResetThemeCustomBg = (themeIdToReset: RoyalThemeId) => {
    const themeObj = ROYAL_THEMES.find((t) => t.id === themeIdToReset) || ROYAL_THEMES[0];
    const nextMap = { ...(weddingData.themeCustomBgMap || {}) };
    delete nextMap[themeIdToReset];
    const updated: WeddingConfigData = {
      ...weddingData,
      themeCustomBgMap: nextMap,
      floralBgUrl:
        activeThemeId === themeIdToReset ? themeObj.defaultBgUrl : weddingData.floralBgUrl,
    };
    setWeddingData(updated);
    setDraftData(updated);
    setWeddingData(updated);
    setDraftData(updated);
    if (isAdmin) {
      setDoc(doc(db, 'settings', 'weddingConfig'), updated).catch(console.error);
    }
    setThemeToastMsg(`${themeObj.name} Default Floral BG Restored!`);
    window.setTimeout(() => setThemeToastMsg(''), 2200);
  };

  const handleUpdateBgBrightness = (nextVal: number) => {
    const updated: WeddingConfigData = {
      ...weddingData,
      bgBrightness: nextVal,
    };
    setWeddingData(updated);
    setDraftData((prev) => ({ ...prev, bgBrightness: nextVal }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleToggleFallingFlowers = () => {
    const nextState = weddingData.showFallingFlowers === false ? true : false;
    const updated: WeddingConfigData = {
      ...weddingData,
      showFallingFlowers: nextState,
    };
    setWeddingData(updated);
    setDraftData((prev) => ({ ...prev, showFallingFlowers: nextState }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setThemeToastMsg(
      nextState ? 'Falling Flowers (Phool) ON' : 'Falling Flowers (Phool) OFF'
    );
    window.setTimeout(() => setThemeToastMsg(''), 2000);
  };

  const handleCardBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('File size zyada hai (max 8MB). Choti image upload karein.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setDraftData((prev) => ({ ...prev, cardBackgroundUrl: dataUrl }));
        setThemeToastMsg('Card Background Image Uploaded!');
        window.setTimeout(() => setThemeToastMsg(''), 2000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOuterBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('File size zyada hai (max 8MB). Choti image upload karein.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setDraftData((prev) => ({ ...prev, floralBgUrl: dataUrl }));
        setThemeToastMsg('Outer Screen Background Image Uploaded!');
        window.setTimeout(() => setThemeToastMsg(''), 2000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyLink = () => {
    const name = shareRecipientName.trim();
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = name ? `${baseUrl}?g=${encodeURIComponent(name)}` : window.location.href;
    
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setThemeToastMsg('Personalized Card Link Copied!');
    window.setTimeout(() => {
      setIsCopied(false);
      setThemeToastMsg('');
    }, 2500);
  };

  const handleShareWhatsApp = () => {
    const name = shareRecipientName.trim();
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = name ? `${baseUrl}?g=${encodeURIComponent(name)}` : window.location.href;
    
    const intro = name ? `Pyare Mohtaram ${name},` : 'Assalam-o-Alaikum,';
    const groom = weddingData.groomName || 'Anas Mahmood';
    const bride = weddingData.brideName || 'Abeer Zahid';
    const dates = weddingData.weddingDatesSummary || '14 — 15 November 2026';
    
    const shareText = `🌹 ${intro}\n\nAapko ${groom} weds ${bride} ki shadi mein shirkat ki dawat di jati hai (${dates}).\n\nAapka Khas Digital Invitation Card dekhne ke liye is link par click karein:\n👇👇👇\n${shareUrl}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  // Live Countdown State
  const [timeLeft, setTimeLeft] = useState({ days: 46, hours: 18, mins: 30, secs: 15 });

  // Compact RSVP Form State
  const [guestName, setGuestName] = useState('');
  const [attending, setAttending] = useState<'yes' | 'no'>('yes');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [rsvpEvents, setRsvpEvents] = useState<string[]>(['Mehndi', 'Baraat', 'Walima']);
  const [rsvpSubmitted, setRsvpSubmitted] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Determine which event the Countdown Timer is connected to:
  // In 'auto' mode, it automatically connects to Baraat first, and once Baraat time arrives/passes,
  // it automatically switches to Walima! Users can also tap Baraat or Walima directly.
  const connectedTimerEvent = useMemo(() => {
    const mehndiEv = weddingData.events.find((e) => e.id === 'mehndi') || weddingData.events[0];
    const baraatEv = weddingData.events.find((e) => e.id === 'baraat') || weddingData.events[1] || weddingData.events[0];
    const walimaEv = weddingData.events.find((e) => e.id === 'walima') || weddingData.events[2] || baraatEv;

    if (timerMode === 'mehndi') return mehndiEv;
    if (timerMode === 'baraat') return baraatEv;
    if (timerMode === 'walima') return walimaEv;

    // 'auto' mode: Connect to Baraat if Baraat is in the future; otherwise auto-switch to Walima!
    const now = Date.now();
    const baraatTime = new Date(baraatEv.isoDate).getTime();
    if (!isNaN(baraatTime) && now < baraatTime) {
      return baraatEv;
    }
    return walimaEv;
  }, [weddingData.events, timerMode]);

  useEffect(() => {
    const updateTimer = () => {
      const target = new Date(connectedTimerEvent.isoDate).getTime();
      const diff = Math.max(0, (isNaN(target) ? Date.now() : target) - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / 1000 / 60) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    };
    updateTimer();
    const id = window.setInterval(updateTimer, 1000);
    return () => clearInterval(id);
  }, [connectedTimerEvent]);

  // Handle 10 clicks on Header or Welcome Title:
  // Automatically cycles to the next Royal Theme AND opens the Theme Switcher & Secret Editor Modal!
  const handleSecretHeaderClick = () => {
    if (clickResetTimerRef.current) {
      window.clearTimeout(clickResetTimerRef.current);
    }

    setHeaderClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        cycleToNextTheme();
        setIsAuthModalOpen(true);
        return 0;
      }
      return next;
    });

    clickResetTimerRef.current = window.setTimeout(() => {
      setHeaderClickCount(0);
    }, 4000);
  };

  const handleGuestNameClick = () => {
    if (guestClickResetTimerRef.current) {
      window.clearTimeout(guestClickResetTimerRef.current);
    }

    setGuestNameClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        (async () => {
          if (isAdmin) {
            setIsInlineEditingName(true);
          } else {
            const password = window.prompt('Baraye mehrbani admin password (111222) darj karein:');
            if (password) {
              try {
                await signInWithEmailAndPassword(auth, 'km@gmail.com', password);
                setIsInlineEditingName(true);
              } catch (err: any) {
                alert('Ghalat password!');
              }
            }
          }
        })();
        return 0;
      }
      return next;
    });

    guestClickResetTimerRef.current = window.setTimeout(() => {
      setGuestNameClicks(0);
    }, 3000);
  };

  const handleAdminLogin = async () => {
    const email = window.prompt('Admin Email darj karein:', 'km@gmail.com');
    if (!email) return;
    const password = window.prompt('Password darj karein:');
    if (!password) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setThemeToastMsg('Admin Login Successful!');
    } catch (err: any) {
      alert(`Login failed: ${err.message}`);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      setThemeToastMsg('Logged Out');
    } catch (err: any) {
      console.error(err);
    }
  };


  const handleSaveCardEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clean up mapEmbedQuery for each event using easy location parser
    const cleanedEvents = draftData.events.map((ev) => ({
      ...ev,
      mapEmbedQuery: parseEasyLocationInput(ev.mapEmbedQuery, ev.venueName, ev.address),
    }));
    const finalData = { ...draftData, events: cleanedEvents };

    setWeddingData(finalData);
    if (isAdmin) {
      try {
        await setDoc(doc(db, 'settings', 'weddingConfig'), finalData);
        setSaveSuccessBanner(true);
        window.setTimeout(() => {
          setSaveSuccessBanner(false);
          setShowEditorModal(false);
        }, 800);
      } catch (err: any) {
        alert(`Save failed: ${err.message}`);
      }
    } else {
      alert('Admin login required to save changes.');
    }
  };

  const handleResetToDefault = async () => {
    if (window.confirm('Kya aap waqai default settings par wapas jana chahte hain?')) {
      setDraftData(JSON.parse(JSON.stringify(DEFAULT_WEDDING_DATA)));
      setWeddingData(DEFAULT_WEDDING_DATA);
      if (isAdmin) {
        try {
          await setDoc(doc(db, 'settings', 'weddingConfig'), DEFAULT_WEDDING_DATA);
          setThemeToastMsg('Default Settings Restored');
        } catch (err: any) {
          console.error(err);
        }
      }
    }
  };

  const updateDraftEvent = (
    idx: number,
    field: keyof WeddingEventItem,
    value: string
  ) => {
    setDraftData((prev) => {
      const updated = [...prev.events];
      const nextItem = {
        ...updated[idx],
        [field]: value,
      };
      // If user edits Venue Name or Address, auto-sync map query if not custom link
      if (field === 'venueName' || field === 'address') {
        nextItem.mapEmbedQuery = `${nextItem.venueName} ${nextItem.address}`.trim();
      }
      updated[idx] = nextItem;
      return { ...prev, events: updated };
    });
  };

  // One-click GPS location pin helper inside the Editor
  const handleUseCurrentGpsForEvent = (idx: number) => {
    if (!navigator.geolocation) {
      setGpsStatusMsg('GPS browser mein support nahi hai. Naam ya link paste karein.');
      return;
    }
    setGpsStatusMsg('Current GPS location hasil ki ja rahi hai...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
        updateDraftEvent(idx, 'mapEmbedQuery', coords);
        setGpsStatusMsg(`Function ${idx + 1} ke liye GPS Pin (${coords}) set ho gaya!`);
      },
      () => {
        setGpsStatusMsg('GPS permission nahi mili. Aap Hall ka naam ya Google Map link likh sakte hain.');
      }
    );
  };

  const handleOpenInvitation = (playAudio = true) => {
    setIsCurtainAnimating(true);
    if (playAudio) {
      const started = weddingAudio.start();
      setIsMusicPlaying(started);
    }
    window.setTimeout(() => {
      setIsInvitationOpened(true);
      setIsCurtainAnimating(false);
    }, 450);
  };

  const handleToggleMusic = () => {
    setIsMusicPlaying(weddingAudio.toggle());
  };

  const toggleEventSelection = (name: string) => {
    setRsvpEvents((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setFormError('Baraye mehrbani apna naam likhein (Please enter your name).');
      return;
    }
    
    try {
      await addDoc(collection(db, 'rsvps'), {
        guestName: guestName.trim(),
        attending,
        guestCount: attending === 'yes' ? guestCount : 0,
        events: rsvpEvents,
        submittedAt: new Date().toISOString()
      });
      setFormError('');
      setRsvpSubmitted(true);
    } catch (err: any) {
      setFormError(`RSVP failed: ${err.message}`);
    }
  };

  const currentEvent = weddingData.events[selectedEventIdx] || weddingData.events[0];
  const shortGroomFirst = weddingData.groomName.split(' ')[0] || 'Groom';
  const shortBrideFirst = weddingData.brideName.split(' ')[0] || 'Bride';

  const CornerMotif = useMemo(() => {
    switch (weddingData.cornerStyle) {
      case 'classic-gold': return ClassicGoldCorner;
      case 'lush-floral': return LushFloralCorner;
      case 'modern-leaf': return ModernLeafCorner;
      default: return MarigoldCornerMotif;
    }
  }, [weddingData.cornerStyle]);

  const baraatEvent = weddingData.events.find((e) => e.id === 'baraat') || weddingData.events[1] || weddingData.events[0];
  const walimaEvent = weddingData.events.find((e) => e.id === 'walima') || weddingData.events[2] || weddingData.events[0];

  // ============================================================================
  // PRINTABLE A4 ROYAL PDF INVITATION SHEET (VISIBLE ON PDF EXPORT / PRINT)
  // ============================================================================
  const renderPrintablePdfSheet = () => (
    <div className="hidden print-only-sheet p-8 bg-[#061812] text-[#FBF7EE] border-4 border-[#D4AF37] rounded-3xl max-w-[210mm] mx-auto space-y-6">
      <div className="text-center space-y-2 border-b border-[#D4AF37]/40 pb-5">
        <p className="text-xs tracking-[0.25em] text-[#D4AF37] uppercase">
          {weddingData.salamHeading} · بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="font-arabic text-2xl text-[#F3E5AB]" dir="rtl">
          {weddingData.arabicDua}
        </p>
        <p className="font-serif-display italic text-base text-[#F3E5AB] max-w-xl mx-auto">
          {weddingData.urduRomanDua}
        </p>
      </div>

      <div className="text-center space-y-2 py-2">
        <p className="text-sm text-[#C8C2B4]">{weddingData.hostParentsLine}</p>
        <h1 className="font-serif-display text-4xl font-bold text-[#FBF7EE]">
          {weddingData.groomName}
        </h1>
        <p className="font-serif-display italic text-xl text-[#D4AF37]">weds</p>
        <h2 className="font-serif-display text-4xl font-bold text-[#F3E5AB]">
          {weddingData.brideName}
        </h2>
        <p className="text-sm text-[#D4AF37] pt-1">
          {weddingData.weddingDatesSummary} &nbsp;·&nbsp; {weddingData.cityLabel}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#D4AF37]/40">
        {weddingData.events.map((ev) => (
          <div
            key={ev.id}
            className="p-4 rounded-2xl bg-[#0B2B22] border border-[#D4AF37]/45 space-y-1.5"
          >
            <p className="font-arabic text-lg text-[#F3E5AB]" dir="rtl">
              {ev.urduSubtitle}
            </p>
            <h3 className="font-serif-display text-xl font-semibold text-[#FBF7EE]">
              {ev.title}
            </h3>
            <p className="text-xs text-[#D4AF37]">{ev.dateLabel}</p>
            <p className="text-xs font-mono-tabular text-[#FBF7EE]">{ev.timeRange}</p>
            <p className="text-xs font-semibold text-[#F3E5AB] pt-1">{ev.venueName}</p>
            <p className="text-[11px] text-[#C8C2B4]">{ev.address}</p>
          </div>
        ))}
      </div>

      <div className="text-center pt-4 border-t border-[#D4AF37]/30 text-xs text-[#C8C2B4]">
        R.S.V.P. &amp; Best Compliments from Both Families · {weddingData.cityLabel}
      </div>
    </div>
  );

  // ============================================================================
  // PASSWORD & ADMIN EDITOR OVERLAY MODALS (UNLOCKED BY 10 CLICKS ON HEADER + 111222)
  // ============================================================================
  const renderSecretModals = () => (
    <div className="no-print">
      {/* Floating Theme Changed Toast Notification */}
      {themeToastMsg && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#D4AF37] text-[#061812] font-semibold text-xs shadow-2xl flex items-center gap-2 whitespace-nowrap">
          <Palette className="w-4 h-4 shrink-0" />
          <span>{themeToastMsg}</span>
        </div>
      )}

      {/* Admin Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => setShowEditorModal(true)} 
      />

      {/* Social Media Share Modal */}
      {showShareModal && (
        <div
          onClick={() => setShowShareModal(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-[#0B2B22] border-2 border-[#D4AF37] shadow-2xl overflow-hidden text-center p-6 space-y-6"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] text-[#D4AF37] flex items-center justify-center">
                <Share2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif-display text-2xl font-semibold text-[#FBF7EE]">
                Share Invitation
              </h3>
              <p className="text-xs text-[#C8C2B4]">
                Send this digital card to your loved ones
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-left space-y-1.5">
                <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-widest">
                  Mehmaan ka Naam (Guest Name)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={shareRecipientName}
                    onChange={(e) => setShareRecipientName(e.target.value)}
                    placeholder="e.g. Mr. & Mrs. Kamran Ahmed"
                    className="w-full px-4 py-3 rounded-xl bg-[#061812] border border-[#D4AF37]/40 text-sm text-[#FBF7EE] focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Edit3 className="w-4 h-4 text-[#D4AF37]/50" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-[#25D366] text-white font-bold text-sm shadow-lg hover:brightness-110 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Share on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-[#061812] border-2 border-[#D4AF37] text-[#F3E5AB] font-bold text-sm shadow-lg hover:bg-[#D4AF37]/10 transition-all cursor-pointer"
              >
                {isCopied ? <Check className="w-5 h-5" /> : <Link className="w-5 h-5" />}
                <span>{isCopied ? 'Link Copied!' : 'Copy Invitation Link'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="text-xs font-medium text-[#C8C2B4] hover:text-[#FBF7EE] transition-colors pt-2"
            >
              Close (✕)
            </button>
          </div>
        </div>
      )}

      {/* Full Wedding Card Customization Modal */}
      {showEditorModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-[#0B2B22] border border-[#D4AF37]/60 p-4 sm:p-7 shadow-2xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D4AF37]/25">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-[#D4AF37] shrink-0" />
                <div>
                  <h3 className="font-serif-display text-xl sm:text-2xl font-semibold text-[#FBF7EE]">
                    Edit Digital Wedding Card
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="p-1.5 rounded-lg text-[#C8C2B4] hover:text-[#FBF7EE] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-[#061812] border border-[#D4AF37]/30 rounded-2xl my-3">
              {[
                { id: 'couples' as const, label: '1. Couple & Host', icon: Heart },
                { id: 'themes' as const, label: '2. Themes', icon: Palette },
                { id: 'style' as const, label: '3. Design & BG', icon: ImagePlus },
                { id: 'events' as const, label: '4. Events & Map', icon: Clock },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = editorTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEditorTab(tab.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      active
                        ? 'bg-[#D4AF37] text-[#061812] shadow-md scale-[1.02]'
                        : 'text-[#C8C2B4] hover:text-[#FBF7EE] hover:bg-[#D4AF37]/10'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'opacity-100' : 'opacity-60'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            
            <form
              onSubmit={handleSaveCardEdits}
              className="flex-1 overflow-y-auto py-2 pr-1 space-y-5 text-left"
            >
              {/* TAB 1: COUPLE & HOST */}
              {editorTab === 'couples' && (
                <div className="space-y-4">
                  <h4 className="text-[#D4AF37] font-semibold text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#D4AF37]" /> Bride & Groom Names
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#F3E5AB] mb-1">Groom Name</label>
                      <input
                        type="text"
                        value={draftData.groomName}
                        onChange={(e) => setDraftData({ ...draftData, groomName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#061812] border border-[#D4AF37]/35 text-xs sm:text-sm text-[#FBF7EE]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#F3E5AB] mb-1">Bride Name</label>
                      <input
                        type="text"
                        value={draftData.brideName}
                        onChange={(e) => setDraftData({ ...draftData, brideName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#061812] border border-[#D4AF37]/35 text-xs sm:text-sm text-[#FBF7EE]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-[#F3E5AB] mb-1">Host Parents Line</label>
                      <input
                        type="text"
                        value={draftData.hostParentsLine}
                        onChange={(e) => setDraftData({ ...draftData, hostParentsLine: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#061812] border border-[#D4AF37]/35 text-xs sm:text-sm text-[#FBF7EE]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#F3E5AB] mb-1">Wedding Dates Summary</label>
                      <input
                        type="text"
                        value={draftData.weddingDatesSummary}
                        onChange={(e) => setDraftData({ ...draftData, weddingDatesSummary: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#061812] border border-[#D4AF37]/35 text-xs sm:text-sm text-[#FBF7EE]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#F3E5AB] mb-1">City Label</label>
                      <input
                        type="text"
                        value={draftData.cityLabel}
                        onChange={(e) => setDraftData({ ...draftData, cityLabel: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#061812] border border-[#D4AF37]/35 text-xs sm:text-sm text-[#FBF7EE]"
                      />
                    </div>
                  </div>

                  <h4 className="text-[#D4AF37] font-semibold text-sm pt-2">Salam & Duas</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-[#F3E5AB] mb-1">Salam Heading</label>
                      <input
                        type="text"
                        value={draftData.salamHeading}
                        onChange={(e) => setDraftData({ ...draftData, salamHeading: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#061812] border border-[#D4AF37]/35 text-xs sm:text-sm text-[#FBF7EE]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#F3E5AB] mb-1">Arabic Dua</label>
                      <input
                        type="text"
                        value={draftData.arabicDua}
                        onChange={(e) => setDraftData({ ...draftData, arabicDua: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#061812] border border-[#D4AF37]/35 text-xs sm:text-sm text-[#FBF7EE] font-arabic"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#F3E5AB] mb-1">Urdu / Roman Translation</label>
                      <textarea
                        rows={2}
                        value={draftData.urduRomanDua}
                        onChange={(e) => setDraftData({ ...draftData, urduRomanDua: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#061812] border border-[#D4AF37]/35 text-xs text-[#FBF7EE]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: THEMES */}
              {editorTab === 'themes' && (
                <div className="space-y-4">
                  <h4 className="text-[#D4AF37] font-semibold text-sm flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#D4AF37]" /> Choose Royal Color Palette
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ROYAL_THEMES.map((theme) => {
                      const selected = draftData.themeId === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => {
                            setDraftData({ ...draftData, themeId: theme.id });
                            applyThemeInstantly(theme.id);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            selected
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] shadow-lg scale-[1.01]'
                              : 'bg-[#061812] border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-[#FBF7EE]">{theme.name}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: theme.bgPreview }} />
                              <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: theme.accentPreview }} />
                              <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: theme.flower1Preview }} />
                            </div>
                          </div>
                          <p className="text-xs text-[#C8C2B4]">{theme.subtitle}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: DESIGN & BACKGROUND */}
              {editorTab === 'style' && (
                <div className="space-y-5">
                  {/* Section 1: Inner Card Background Controls */}
                  <div className="p-4 bg-[#061812] rounded-2xl border border-[#D4AF37]/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
                      <h4 className="text-[#D4AF37] font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                        <ImagePlus className="w-4 h-4 text-[#D4AF37]" /> 1. Inner Card Background Control
                      </h4>
                      {draftData.cardBackgroundUrl && (
                        <button
                          type="button"
                          onClick={() => setDraftData({ ...draftData, cardBackgroundUrl: '' })}
                          className="text-[11px] text-[#E11D48] hover:underline cursor-pointer"
                        >
                          Clear Card Image
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-[#C8C2B4]">
                      Choose a visual backdrop for the inner card box or paste a custom background image link:
                    </p>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { label: 'None (Glass/Solid)', url: '' },
                        { label: 'Crimson Velvet', url: BARAAT_IMAGE },
                        { label: 'Festive Marigold', url: MEHNDI_IMAGE },
                        { label: 'Emerald Courtyard', url: HERO_IMAGE },
                        { label: 'Walima Orchids', url: WALIMA_IMAGE },
                      ].map((preset) => {
                        const isSelected = (draftData.cardBackgroundUrl || '') === preset.url;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setDraftData({ ...draftData, cardBackgroundUrl: preset.url })}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer overflow-hidden ${
                              isSelected
                                ? 'bg-[#D4AF37] text-[#061812] border-[#D4AF37] font-bold shadow-md scale-105'
                                : 'bg-[#0B2B22] text-[#C8C2B4] border-[#D4AF37]/25 hover:border-[#D4AF37]/50 hover:text-[#FBF7EE]'
                            }`}
                          >
                            {preset.url ? (
                              <div className="h-10 w-full rounded-lg overflow-hidden mb-1 border border-black/30">
                                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-10 w-full rounded-lg bg-[#061812] border border-[#D4AF37]/30 flex items-center justify-center mb-1 text-[10px] text-[#D4AF37]">
                                Glass / Solid
                              </div>
                            )}
                            <span className="text-[11px] block truncate">{preset.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs text-[#F3E5AB] mb-1 font-semibold">Upload Card Image File (Device/Gallery)</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleCardBgFileUpload}
                            className="hidden" 
                            id="card-bg-file-upload"
                          />
                          <label 
                            htmlFor="card-bg-file-upload"
                            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] text-xs font-bold text-[#F3E5AB] hover:bg-[#D4AF37]/35 transition-all cursor-pointer shadow-sm active:scale-95"
                          >
                            <ImagePlus className="w-4 h-4 text-[#D4AF37]" />
                            <span>Upload Image from Device</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-[#F3E5AB] mb-1">Or Paste Card Background Image URL</label>
                        <input 
                          type="text"
                          value={draftData.cardBackgroundUrl || ''}
                          onChange={e => setDraftData({ ...draftData, cardBackgroundUrl: e.target.value })}
                          placeholder="Paste image URL..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B2B22] border border-[#D4AF37]/35 text-xs text-[#FBF7EE] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Outer Main Screen Background Control */}
                  <div className="p-4 bg-[#061812] rounded-2xl border border-[#D4AF37]/30 space-y-3">
                    <div className="border-b border-[#D4AF37]/20 pb-2">
                      <h4 className="text-[#D4AF37] font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#D4AF37]" /> 2. Outer Screen Background Control
                      </h4>
                    </div>

                    <p className="text-xs text-[#C8C2B4]">
                      Select outer wallpaper backdrop or upload a background image from your device:
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {FLORAL_BG_PRESETS.map((preset) => {
                        const isSelected = draftData.floralBgUrl === preset.url;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setDraftData({ ...draftData, floralBgUrl: preset.url })}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer overflow-hidden ${
                              isSelected
                                ? 'bg-[#D4AF37] text-[#061812] border-[#D4AF37] font-bold shadow-md scale-105'
                                : 'bg-[#0B2B22] text-[#C8C2B4] border-[#D4AF37]/25 hover:border-[#D4AF37]/50 hover:text-[#FBF7EE]'
                            }`}
                          >
                            <div className="h-12 w-full rounded-lg overflow-hidden mb-1 border border-black/30">
                              <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[11px] block truncate">{preset.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-xs text-[#F3E5AB] mb-1 font-semibold">Upload Outer Background File</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleOuterBgFileUpload}
                            className="hidden" 
                            id="outer-bg-file-upload"
                          />
                          <label 
                            htmlFor="outer-bg-file-upload"
                            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] text-xs font-bold text-[#F3E5AB] hover:bg-[#D4AF37]/35 transition-all cursor-pointer shadow-sm active:scale-95"
                          >
                            <ImagePlus className="w-4 h-4 text-[#D4AF37]" />
                            <span>Upload Image</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-[#F3E5AB] mb-1">Or Paste Outer Image URL</label>
                        <input 
                          type="text"
                          value={draftData.floralBgUrl || ''}
                          onChange={e => setDraftData({ ...draftData, floralBgUrl: e.target.value })}
                          placeholder="Paste outer image URL..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B2B22] border border-[#D4AF37]/35 text-xs text-[#FBF7EE] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-[#F3E5AB] mb-1">
                          Brightness ({Math.round((draftData.bgBrightness || 0.58) * 100)}%)
                        </label>
                        <input 
                          type="range" min="0.1" max="1" step="0.05"
                          value={draftData.bgBrightness || 0.58}
                          onChange={e => setDraftData({ ...draftData, bgBrightness: parseFloat(e.target.value) })}
                          className="w-full accent-[#D4AF37] mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Cover Photo & Styling */}
                  <div className="p-4 bg-[#061812] rounded-2xl border border-[#D4AF37]/30 space-y-3">
                    <h4 className="text-[#D4AF37] font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 border-b border-[#D4AF37]/20 pb-2">
                      <ImagePlus className="w-4 h-4 text-[#D4AF37]" /> 3. Card Cover Photo & Motif Controls
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[#F3E5AB] mb-1">Card Cover Photo URL</label>
                        <input 
                          type="text"
                          value={draftData.coverPhotoUrl || ''}
                          onChange={e => setDraftData({ ...draftData, coverPhotoUrl: e.target.value })}
                          placeholder="Paste cover photo URL..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B2B22] border border-[#D4AF37]/35 text-xs text-[#FBF7EE]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-[#F3E5AB] mb-1">Corner Motif Border Style</label>
                        <select 
                          value={draftData.cornerStyle || 'marigold'}
                          onChange={e => setDraftData({ ...draftData, cornerStyle: e.target.value as any })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B2B22] border border-[#D4AF37]/35 text-xs text-[#FBF7EE]"
                        >
                          <option value="marigold">Marigold Motif</option>
                          <option value="classic-gold">Classic Gold Motif</option>
                          <option value="lush-floral">Lush Floral Motif</option>
                          <option value="modern-leaf">Modern Leaf Motif</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Card Glass Transparency & Blur */}
                  <div className="p-4 bg-[#061812] rounded-2xl border border-[#D4AF37]/30 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
                      <label className="text-xs text-[#F3E5AB] font-bold uppercase tracking-wider">4. Card Transparency & Blur Presets</label>
                      <span className="text-[11px] text-[#D4AF37] font-mono">
                        Opacity: {Math.round((draftData.cardOpacity ?? 0.85) * 100)}% | Blur: {draftData.cardBlur ?? 16}px
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Crystal Glass', opacity: 0.25, blur: 20 },
                        { label: 'Frosted Glass', opacity: 0.55, blur: 16 },
                        { label: 'Velvet Dark', opacity: 0.85, blur: 12 },
                        { label: 'Solid Shield', opacity: 1.0, blur: 0 },
                      ].map((preset) => {
                        const isSelected = Math.abs((draftData.cardOpacity ?? 0.85) - preset.opacity) < 0.05;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setDraftData({ ...draftData, cardOpacity: preset.opacity, cardBlur: preset.blur })}
                            className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer text-center ${
                              isSelected
                                ? 'bg-[#D4AF37] text-[#061812] border-[#D4AF37] font-bold shadow-sm'
                                : 'bg-[#0B2B22] text-[#C8C2B4] border-[#D4AF37]/25 hover:text-[#FBF7EE] hover:border-[#D4AF37]/50'
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#D4AF37]/15">
                      <div>
                        <label className="block text-[11px] text-[#C8C2B4] mb-1">
                          Custom Card Opacity ({Math.round((draftData.cardOpacity ?? 0.85) * 100)}%)
                        </label>
                        <input 
                          type="range" min="0" max="1" step="0.05"
                          value={draftData.cardOpacity ?? 0.85}
                          onChange={e => setDraftData({ ...draftData, cardOpacity: parseFloat(e.target.value) })}
                          className="w-full accent-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#C8C2B4] mb-1">
                          Backdrop Glass Blur ({draftData.cardBlur ?? 16}px)
                        </label>
                        <input 
                          type="range" min="0" max="30" step="2"
                          value={draftData.cardBlur ?? 16}
                          onChange={e => setDraftData({ ...draftData, cardBlur: parseInt(e.target.value, 10) })}
                          className="w-full accent-[#D4AF37]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#D4AF37]/15">
                      <div>
                        <p className="text-xs text-[#F3E5AB] font-semibold">Falling Flowers Animation (Phool)</p>
                        <p className="text-[10px] text-[#C8C2B4]">Floating petals falling on background</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={draftData.showFallingFlowers !== false}
                        onChange={e => setDraftData({ ...draftData, showFallingFlowers: e.target.checked })}
                        className="w-5 h-5 accent-[#D4AF37] rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: EVENTS & MAP */}
              {editorTab === 'events' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[#D4AF37] font-semibold text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#D4AF37]" /> Wedding Itinerary & Venues
                    </h4>
                    {gpsStatusMsg && (
                      <span className="text-[11px] text-[#F3E5AB] bg-[#061812] px-2.5 py-1 rounded-lg border border-[#D4AF37]/30">
                        {gpsStatusMsg}
                      </span>
                    )}
                  </div>

                  {draftData.events.map((ev, idx) => (
                    <div key={ev.id} className="p-4 bg-[#061812] rounded-2xl border border-[#D4AF37]/30 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
                        <p className="text-[#D4AF37] font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
                          <span>{ev.id} Details</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => handleUseCurrentGpsForEvent(idx)}
                          className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB] text-[11px] font-medium hover:bg-[#D4AF37]/30 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <LocateFixed className="w-3 h-3" />
                          <span>Set Live GPS Pin</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-[#C8C2B4] mb-1">Event Title</label>
                          <input
                            type="text"
                            value={ev.title}
                            onChange={(e) => updateDraftEvent(idx, 'title', e.target.value)}
                            placeholder="Event Title"
                            className="w-full px-3 py-2 rounded-xl bg-[#0B2B22] border border-[#D4AF37]/35 text-xs text-[#FBF7EE]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-[#C8C2B4] mb-1">Venue Name</label>
                          <input
                            type="text"
                            value={ev.venueName}
                            onChange={(e) => updateDraftEvent(idx, 'venueName', e.target.value)}
                            placeholder="Venue Name"
                            className="w-full px-3 py-2 rounded-xl bg-[#0B2B22] border border-[#D4AF37]/35 text-xs text-[#FBF7EE]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] text-[#C8C2B4] mb-1">Venue Address</label>
                          <input
                            type="text"
                            value={ev.address}
                            onChange={(e) => updateDraftEvent(idx, 'address', e.target.value)}
                            placeholder="Address"
                            className="w-full px-3 py-2 rounded-xl bg-[#0B2B22] border border-[#D4AF37]/35 text-xs text-[#FBF7EE]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-[#C8C2B4] mb-1">Date & Time Label</label>
                          <input
                            type="text"
                            value={ev.dateLabel}
                            onChange={(e) => updateDraftEvent(idx, 'dateLabel', e.target.value)}
                            placeholder="e.g. Friday, Dec 18, 2026"
                            className="w-full px-3 py-2 rounded-xl bg-[#0B2B22] border border-[#D4AF37]/35 text-xs text-[#FBF7EE]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-[#C8C2B4] mb-1">Time Range</label>
                          <input
                            type="text"
                            value={ev.timeRange}
                            onChange={(e) => updateDraftEvent(idx, 'timeRange', e.target.value)}
                            placeholder="e.g. 7:00 PM — 10:30 PM"
                            className="w-full px-3 py-2 rounded-xl bg-[#0B2B22] border border-[#D4AF37]/35 text-xs text-[#FBF7EE]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] text-[#C8C2B4] mb-1">Google Maps Query / Link / Coords</label>
                          <input
                            type="text"
                            value={ev.mapEmbedQuery}
                            onChange={(e) => updateDraftEvent(idx, 'mapEmbedQuery', e.target.value)}
                            placeholder="Paste Google Maps link or coordinates..."
                            className="w-full px-3 py-2 rounded-xl bg-[#0B2B22] border border-[#D4AF37]/35 text-xs text-[#FBF7EE]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#D4AF37]/25">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-4 py-2.5 rounded-xl border border-[#D4AF37]/40 text-xs text-[#C8C2B4] hover:text-[#F3E5AB] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 bg-[#D4AF37] text-[#061812] rounded-xl font-bold text-xs sm:text-sm shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderFocusOverlay = () => {
    if (!focusedElement) return null;

    let content = null;
    let title = "";

    switch (focusedElement) {
      case 'countdown':
        title = "Wedding Countdown";
        content = (
          <div className="space-y-6 text-center py-8 px-4">
            <h3 className="font-serif-display text-3xl sm:text-4xl text-[#F3E5AB]">
              {connectedTimerEvent.title}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
              {[
                { val: timeLeft.days, lbl: 'Days' },
                { val: timeLeft.hours, lbl: 'Hours' },
                { val: timeLeft.mins, lbl: 'Minutes' },
                { val: timeLeft.secs, lbl: 'Seconds' },
              ].map((item) => (
                <div
                  key={item.lbl}
                  className="rounded-3xl bg-[#061812] border-2 border-[#D4AF37]/40 py-6 px-2 shadow-2xl"
                >
                  <span className="font-mono-tabular text-4xl sm:text-5xl font-bold text-[#F3E5AB] block mb-1">
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-[#C8C2B4] font-semibold uppercase tracking-widest">
                    {item.lbl}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[#D4AF37] text-sm sm:text-base italic max-w-md mx-auto">
              “Wait for the most beautiful moment of our lives together.”
            </p>
          </div>
        );
        break;
      case 'event':
        title = currentEvent.title;
        content = (
          <div className="space-y-6">
             <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden border-2 border-[#D4AF37]/40">
                <img src={currentEvent.image} className="w-full h-full object-cover" alt={currentEvent.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                  <span className="font-arabic text-3xl text-[#F3E5AB]" dir="rtl">{currentEvent.urduSubtitle}</span>
                </div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="p-5 rounded-2xl bg-[#061812]/60 border border-[#D4AF37]/30">
                   <p className="text-[#D4AF37] font-bold text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                     <Clock className="w-4 h-4" /> Time & Date
                   </p>
                   <p className="text-[#FBF7EE] text-lg font-semibold">{currentEvent.dateLabel}</p>
                   <p className="text-[#F3E5AB] text-base">{currentEvent.timeRange}</p>
                </div>
                <div className="p-5 rounded-2xl bg-[#061812]/60 border border-[#D4AF37]/30">
                   <p className="text-[#D4AF37] font-bold text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                     <MapPin className="w-4 h-4" /> Venue
                   </p>
                   <p className="text-[#FBF7EE] text-lg font-semibold">{currentEvent.venueName}</p>
                   <p className="text-[#C8C2B4] text-sm">{currentEvent.address}</p>
                </div>
             </div>
             <div className="p-6 rounded-2xl bg-[#061812]/80 border border-[#D4AF37]/40">
                <p className="text-[#D4AF37] font-bold text-sm uppercase tracking-widest mb-4">Itinerary / Rasm Highlights</p>
                <div className="space-y-3">
                   {currentEvent.rasmHighlights.map(r => (
                     <div key={r.label} className="flex items-center justify-between py-3 border-b border-[#D4AF37]/20 last:border-0">
                        <span className="text-[#FBF7EE] text-base font-medium">{r.label}</span>
                        <span className="text-[#D4AF37] font-mono-tabular font-bold">{r.time}</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        );
        break;
      case 'map':
        title = "Venue Location Map";
        content = (
          <div className="space-y-4">
             <div className="h-[60vh] sm:h-[70vh] rounded-3xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-2xl relative">
                <iframe
                  title="Fullscreen Map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(currentEvent.mapEmbedQuery || `${currentEvent.venueName} ${currentEvent.address}`)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0"
                />
             </div>
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#061812]/60 border border-[#D4AF37]/30">
                <div className="text-left">
                   <h4 className="text-[#F3E5AB] font-bold">{currentEvent.venueName}</h4>
                   <p className="text-xs text-[#C8C2B4]">{currentEvent.address}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentEvent.mapEmbedQuery || `${currentEvent.venueName} ${currentEvent.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] text-[#061812] font-bold text-sm hover:brightness-110 transition-all shadow-lg"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open Navigation</span>
                </a>
             </div>
          </div>
        );
        break;
      case 'photo':
        title = "Wedding Memory";
        content = (
          <div className="relative h-[75vh] w-full rounded-3xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-2xl">
            <img src={weddingData.coverPhotoUrl || HERO_IMAGE} className="w-full h-full object-contain bg-[#061812]" alt="Wedding Focus" />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent text-center">
               <p className="font-serif-display text-2xl sm:text-3xl text-[#F3E5AB] italic">“Hamesha Salamat Rahay Ye Jodi — Ameen”</p>
               <p className="text-[#D4AF37] text-xs sm:text-sm tracking-[0.3em] uppercase mt-2">{weddingData.cityLabel}</p>
            </div>
          </div>
        );
        break;
    }

    return (
      <div 
        className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 no-print overflow-y-auto"
        onClick={() => setFocusedElement(null)}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-[#0B2B22] border-2 border-[#D4AF37] rounded-[2rem] p-6 sm:p-10 shadow-[0_0_100px_rgba(212,175,55,0.2)]"
          style={{ 
            backgroundImage: weddingData.cardBackgroundUrl ? `url(${weddingData.cardBackgroundUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: `rgba(11, 43, 34, ${weddingData.cardOpacity ?? 0.85})`
          }}
        >
          {/* Floral Corners */}
          <CornerMotif className="w-20 h-20 sm:w-32 sm:h-32 text-[#D4AF37] absolute top-3 left-3 pointer-events-none opacity-60" />
          <CornerMotif className="w-20 h-20 sm:w-32 sm:h-32 text-[#D4AF37] absolute top-3 right-3 scale-x-[-1] pointer-events-none opacity-60" />
          <CornerMotif className="w-20 h-20 sm:w-32 sm:h-32 text-[#D4AF37] absolute bottom-3 left-3 scale-y-[-1] pointer-events-none opacity-60" />
          <CornerMotif className="w-20 h-20 sm:w-32 sm:h-32 text-[#D4AF37] absolute bottom-3 right-3 scale-[-1] pointer-events-none opacity-60" />

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setFocusedElement(null)}
            className="absolute -top-3 -right-3 sm:-top-5 sm:-right-5 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#D4AF37] text-[#061812] flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer z-50 border-4 border-[#0B2B22]"
            aria-label="Close"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-6">
               <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
               <h2 className="font-serif-display text-xl sm:text-2xl text-[#F3E5AB] font-semibold text-center uppercase tracking-widest">{title}</h2>
               <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
            </div>

            <div className="max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
              {content}
            </div>
            
            <div className="mt-8 flex justify-center">
               <CardFloralArchBorder />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // STEP 1: COMPACT SALAM & DUA WELCOME CURTAIN (MOBILE-RESPONSIVE + FLORAL)
  // ============================================================================
  if (!isInvitationOpened) {
    return (
      <div
        className={`min-h-screen w-full bg-[#061812] text-[#FBF7EE] relative overflow-hidden flex flex-col justify-between transition-all duration-500 ${
          isCurtainAnimating ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        }`}
      >
        {renderSecretModals()}
        {renderPrintablePdfSheet()}
        <FloralBackgroundAndFallingPetals
          bgImageUrl={effectiveBackgroundUrl}
          bgOpacity={weddingData.bgBrightness ?? 0.58}
          showFallingFlowers={weddingData.showFallingFlowers !== false}
        />

        <div
          className="fixed inset-0 pointer-events-none no-print"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.16) 0%, rgba(11, 43, 34, 0.65) 55%, rgba(6, 24, 18, 0.98) 100%)',
          }}
        />

        <div className="no-print">
          <MarigoldGarlandHeader />
        </div>

        <main className="relative z-10 flex-1 flex items-center justify-center px-3 sm:px-4 py-3 no-print">
        <div 
          className="relative w-full max-w-lg border-2 border-[#D4AF37]/50 rounded-3xl p-5 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.75)] text-center backdrop-blur-md"
          style={{ 
            backgroundColor: `rgba(11, 43, 34, ${weddingData.cardOpacity ?? 0.85})`,
            backdropFilter: `blur(${weddingData.cardBlur ?? 16}px)`,
            WebkitBackdropFilter: `blur(${weddingData.cardBlur ?? 16}px)`,
            backgroundImage: weddingData.cardBackgroundUrl ? `url(${weddingData.cardBackgroundUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
            {/* Lush 4-Corner Floral Borders */}
            <CornerMotif className="w-14 h-14 sm:w-20 sm:h-20 text-[#D4AF37] absolute top-2 left-2 pointer-events-none" />
            <CornerMotif className="w-14 h-14 sm:w-20 sm:h-20 text-[#D4AF37] absolute top-2 right-2 scale-x-[-1] pointer-events-none" />
            <CornerMotif className="w-14 h-14 sm:w-20 sm:h-20 text-[#D4AF37] absolute bottom-2 left-2 scale-y-[-1] pointer-events-none" />
            <CornerMotif className="w-14 h-14 sm:w-20 sm:h-20 text-[#D4AF37] absolute bottom-2 right-2 scale-[-1] pointer-events-none" />

            {/* Admin Settings Button (Top Right) HIDDEN
            <button
              type="button"
              onClick={handleAdminLogin}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-[#061812]/60 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#061812] transition-all cursor-pointer z-20"
              title="Admin Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            */}

            {/* Clicking header/title 10 times triggers Password Editor */}
            <div
              onClick={handleSecretHeaderClick}
              className="relative z-10 space-y-1.5 pt-1 select-none cursor-pointer"
              title="Assalam-o-Alaikum"
            >
              <CardFloralArchBorder />
              <p className="text-[11px] sm:text-xs tracking-[0.22em] text-[#D4AF37] font-semibold uppercase pt-1">
                {weddingData.salamHeading}
              </p>
              <p className="font-arabic text-xl sm:text-2xl text-[#F3E5AB]" dir="rtl">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>

            <FloralDivider className="my-3" />

            <div className="relative z-10 space-y-3 px-1 sm:px-2">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#061812]/80 border border-[#D4AF37]/30">
                <p
                  className="font-arabic text-lg sm:text-xl text-[#FBF7EE] leading-relaxed mb-1"
                  dir="rtl"
                >
                  {weddingData.arabicDua}
                </p>
                <p className="font-serif-display text-sm sm:text-lg italic text-[#F3E5AB] leading-snug">
                  {weddingData.urduRomanDua}
                </p>
              </div>

              <div className="pt-0.5">
                <p className="text-[11px] sm:text-xs text-[#C8C2B4] mb-1.5">Shahi Shadiama Invitation</p>
                <div className="py-3 px-5 rounded-2xl bg-[#061812]/85 border-2 border-[#D4AF37]/50 backdrop-blur-md shadow-lg animate-border-glow inline-block max-w-full">
                  <h1 className="font-serif-display text-2xl sm:text-4xl font-semibold text-[#FBF7EE]">
                    <span className="animate-text-shimmer">{weddingData.groomName}</span>{' '}
                    <span className="text-[#D4AF37] italic font-normal mx-1 animate-pulse">&amp;</span>{' '}
                    <span className="animate-text-shimmer-gold">{weddingData.brideName}</span>
                  </h1>
                </div>
                <p className="text-xs text-[#D4AF37] mt-1.5 font-medium">
                  {weddingData.weddingDatesSummary} &nbsp;·&nbsp; {weddingData.cityLabel}
                </p>
              </div>

              {/* Guest Name Section: 5 Clicks to Edit Inline (Password 111222) */}
              <div className="pt-2 pb-1">
                <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em] mb-1 opacity-80">
                  Dawat-e-Shadi Bara-e-Meharbani
                </p>
                <div 
                  onClick={!isInlineEditingName ? handleGuestNameClick : undefined}
                  className={`inline-block px-5 py-2 rounded-2xl bg-[#061812]/40 border border-[#D4AF37]/30 backdrop-blur-sm shadow-inner transition-all ${!isInlineEditingName ? 'cursor-pointer active:scale-95' : ''}`}
                >
                  {isInlineEditingName ? (
                    <input
                      autoFocus
                      type="text"
                      value={weddingData.recipientName}
                      onChange={(e) => {
                        const next = { ...weddingData, recipientName: e.target.value };
                        setWeddingData(next);
                      }}
                      onBlur={() => {
                        setIsInlineEditingName(false);
                        if (isAdmin) {
                          setDoc(doc(db, 'settings', 'weddingConfig'), weddingData).catch(console.error);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsInlineEditingName(false);
                          if (isAdmin) {
                            setDoc(doc(db, 'settings', 'weddingConfig'), weddingData).catch(console.error);
                          }
                        }
                      }}
                      className="bg-transparent border-none outline-none font-serif-display text-2xl sm:text-3xl text-[#F3E5AB] font-semibold text-center w-full max-w-[280px]"
                    />
                  ) : (
                    <h3 className="font-serif-display text-2xl sm:text-3xl text-[#F3E5AB] font-semibold">
                      {weddingData.recipientName || 'Muazzam Mehmaan'}
                    </h3>
                  )}
                </div>
              </div>
            </div>

            <FloralDivider className="my-3" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleOpenInvitation(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C59B27] text-[#061812] font-semibold text-sm shadow-lg hover:brightness-110 transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Open Invitation</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
                {/* Animated Hand Icon (Only for non-admins) */}
                {!isAdmin && (
                  <div className="absolute -bottom-8 -right-4 pointer-events-none animate-hand-click opacity-0 sm:opacity-100">
                    <Hand className="w-10 h-10 text-[#D4AF37] fill-[#D4AF37]/20 -rotate-12 drop-shadow-lg" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleOpenInvitation(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#D4AF37]/35 text-xs font-medium text-[#F3E5AB] hover:bg-[#D4AF37]/15 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Open Without Music
              </button>
            </div>
          </div>
        </main>

        {renderFocusOverlay()}
        <footer className="relative z-10 pb-3 text-center text-[11px] text-[#C8C2B4]/70 no-print">
          Tap Open Invitation to view the Digital Card
        </footer>
      </div>
    );
  }

  // ============================================================================
  // STEP 2: MOBILE-RESPONSIVE SHORT DIGITAL WEDDING CARD + PDF EXPORT + AUTO TIMER
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#061812] text-[#FBF7EE] flex flex-col justify-between relative selection:bg-[#D4AF37]/30">
      {renderSecretModals()}
      {renderPrintablePdfSheet()}
      <FloralBackgroundAndFallingPetals
        bgImageUrl={effectiveBackgroundUrl}
        bgOpacity={weddingData.bgBrightness ?? 0.58}
        showFallingFlowers={weddingData.showFallingFlowers !== false}
      />

      {/* 3-Zone Top Bar Contract (Clicking Header 10 times triggers Password Prompt) */}
      <header
        onClick={handleSecretHeaderClick}
        className="bg-[#061812]/95 border-b border-[#D4AF37]/30 select-none no-print sticky top-0 z-30 backdrop-blur-md"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-3 sm:px-4 py-2.5">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => setActiveCardTab('cover')}
            className="font-serif-display text-lg sm:text-xl font-semibold text-[#F3E5AB] cursor-pointer whitespace-nowrap shrink-0"
          >
            {shortGroomFirst} &amp; {shortBrideFirst}
          </button>

          {/* Zone 2: 4 Single-line Card Section Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-[#C8C2B4]">
            {[
              { id: 'cover' as CardTabId, label: 'Main Card' },
              { id: 'events' as CardTabId, label: 'Functions & Rasm' },
              { id: 'venue' as CardTabId, label: 'Venue Map' },
              { id: 'rsvp' as CardTabId, label: 'RSVP' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCardTab(item.id);
                }}
                className={`transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeCardTab === item.id
                    ? 'text-[#D4AF37] underline underline-offset-4 font-semibold'
                    : 'hover:text-[#F3E5AB]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 Primary Action (Music Play/Pause) */}
            <div className="flex items-center gap-2 shrink-0">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#F3E5AB] text-xs font-medium hover:bg-[#D4AF37]/20 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              ) : null}

              {isAdmin && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDraftData(JSON.parse(JSON.stringify(weddingData)));
                    setShowEditorModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#061812] text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit Card</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMusic();
                }}
                className={`inline-flex items-center justify-center p-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isMusicPlaying
                    ? 'bg-[#D4AF37] text-[#061812] font-semibold'
                    : 'bg-[#0B2B22] text-[#F3E5AB] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/15'
                }`}
              >
                {isMusicPlaying ? (
                    <Volume2 className="w-2.5 h-2.5 shrink-0" />
                ) : (
                    <VolumeX className="w-2.5 h-2.5 shrink-0" />
                )}
              </button>
            </div>
        </div>
      </header>

      {/* Top Marigold & Crimson Rose Garland Toran */}
      <div className="no-print">
        <MarigoldGarlandHeader />
      </div>

      {/* Main Compact Digital Card Frame */}
      <main className="flex-1 flex items-center justify-center px-2.5 sm:px-6 py-2 sm:py-4 no-print">
        <div 
          className="relative w-full max-w-3xl border border-[#D4AF37]/30 rounded-[2rem] p-6 sm:p-10 shadow-[0_25px_50px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-md"
          style={{ 
            backgroundColor: `rgba(11, 43, 34, ${weddingData.cardOpacity ?? 0.85})`,
            backdropFilter: `blur(${weddingData.cardBlur ?? 16}px)`,
            WebkitBackdropFilter: `blur(${weddingData.cardBlur ?? 16}px)`,
            backgroundImage: weddingData.cardBackgroundUrl ? `url(${weddingData.cardBackgroundUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Lush 4-Corner Marigold & Crimson Rose Floral Motifs */}
          <CornerMotif className="w-14 h-14 sm:w-20 sm:h-20 text-[#D4AF37] absolute top-1.5 left-1.5 pointer-events-none" />
          <CornerMotif className="w-14 h-14 sm:w-20 sm:h-20 text-[#D4AF37] absolute top-1.5 right-1.5 scale-x-[-1] pointer-events-none" />
          <CornerMotif className="w-14 h-14 sm:w-20 sm:h-20 text-[#D4AF37] absolute bottom-1.5 left-1.5 scale-y-[-1] pointer-events-none" />
          <CornerMotif className="w-14 h-14 sm:w-20 sm:h-20 text-[#D4AF37] absolute bottom-1.5 right-1.5 scale-[-1] pointer-events-none" />

          {/* Top Floral Blossom Strip & Mobile-Responsive 4-Tab Bar */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-2 mb-4">
            <CardFloralArchBorder />
            <div className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex items-center gap-1 p-1 rounded-xl bg-[#061812] border border-[#D4AF37]/30">
              {[
                { id: 'cover' as CardTabId, label: '1. Card' },
                { id: 'events' as CardTabId, label: '2. Events' },
                { id: 'venue' as CardTabId, label: '3. Map' },
                { id: 'rsvp' as CardTabId, label: '4. RSVP' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCardTab(tab.id)}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 text-center flex items-center justify-center gap-2 ${
                    activeCardTab === tab.id
                      ? 'bg-[#D4AF37] text-[#061812] shadow-lg scale-105'
                      : 'text-[#C8C2B4] hover:text-[#FBF7EE] hover:bg-[#D4AF37]/10'
                  }`}
                >
                  <Flower2 className={`w-3.5 h-3.5 ${activeCardTab === tab.id ? 'opacity-100' : 'opacity-50'}`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ===================================================================
              TAB 1: COVER, COUPLE NAMES, AUTO BARAAT/WALIMA TIMER & PDF EXPORT
          =================================================================== */}
          {activeCardTab === 'cover' && (
            <div className="relative z-10 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-stretch p-2 rounded-2xl">
                {/* Left 7 Cols: Names, Host Line & Auto-Connected Baraat/Walima Countdown */}
                <div className="md:col-span-7 flex flex-col justify-between text-center md:text-left space-y-3.5 p-4 rounded-3xl border border-[#D4AF37]/20">
                  <div className="space-y-1">
                    <div className="relative my-2 py-4 px-3 sm:px-6 rounded-3xl bg-[#061812]/80 border-2 border-[#D4AF37]/50 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-border-glow overflow-hidden group text-center md:text-left">
                      {/* Ambient background shimmer light */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                      <p className="text-[11px] sm:text-xs text-[#D4AF37] tracking-widest uppercase mb-3 font-semibold">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </p>
                      
                      <h1 className="relative font-serif-display text-3xl sm:text-5xl font-semibold leading-tight drop-shadow-md">
                        <span className="relative inline-block animate-text-shimmer">
                           {weddingData.groomName}
                        </span>
                      </h1>

                      <div className="flex items-center justify-center md:justify-start gap-3 my-2">
                        <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                        <span className="font-serif-display italic text-2xl sm:text-3xl text-[#D4AF37] animate-pulse">
                          weds
                        </span>
                        <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                      </div>

                      <h2 className="relative font-serif-display text-3xl sm:text-5xl font-semibold leading-tight drop-shadow-md">
                        <span className="relative inline-block animate-text-shimmer-gold">
                           {weddingData.brideName}
                        </span>
                      </h2>
                    </div>
                    <p className="text-xs text-[#C8C2B4] leading-relaxed italic">
                      {weddingData.hostParentsLine}
                    </p>
                  </div>

                  {/* Quick Baraat & Walima Highlight Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-left">
                    <div className="p-3.5 rounded-xl bg-[#061812]/75 border border-[#D4AF37]/30 shadow-sm">
                      <p className="text-xs sm:text-sm font-bold text-[#D4AF37] uppercase tracking-tighter">
                        Baraat · {baraatEvent.dateLabel}
                      </p>
                      <p className="text-sm text-[#FBF7EE] font-medium truncate mt-0.5">
                        {baraatEvent.venueName}
                      </p>
                      <p className="text-xs text-[#C8C2B4] font-mono-tabular opacity-80">
                        {baraatEvent.timeRange}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#061812]/75 border border-[#D4AF37]/30 shadow-sm">
                      <p className="text-xs sm:text-sm font-bold text-[#F3E5AB] uppercase tracking-tighter">
                        Walima · {walimaEvent.dateLabel}
                      </p>
                      <p className="text-sm text-[#FBF7EE] font-medium truncate mt-0.5">
                        {walimaEvent.venueName}
                      </p>
                      <p className="text-xs text-[#C8C2B4] font-mono-tabular opacity-80">
                        {walimaEvent.timeRange}
                      </p>
                    </div>
                  </div>

                  {/* Auto-Connected Baraat & Walima Live Countdown Timer */}
                  <div 
                    onClick={() => setFocusedElement('countdown')}
                    className="group relative space-y-2.5 bg-[#061812]/60 p-4 rounded-3xl border border-[#D4AF37]/30 shadow-lg cursor-pointer hover:border-[#D4AF37]/60 transition-all active:scale-[0.98]"
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-[#D4AF37] font-bold uppercase tracking-widest">
                        Countdown: {connectedTimerEvent.title}
                      </span>
                      {/* Quick Switcher */}
                      <div 
                        className="inline-flex items-center gap-1 bg-[#0B2B22] p-1 rounded-xl border border-[#D4AF37]/40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {[
                          { id: 'auto' as const, label: 'Auto' },
                          { id: 'baraat' as const, label: 'Baraat' },
                          { id: 'walima' as const, label: 'Walima' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setTimerMode(m.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                              timerMode === m.id
                                ? 'bg-[#D4AF37] text-[#061812] shadow-sm'
                                : 'text-[#C8C2B4] hover:text-[#FBF7EE]'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5">
                      {[
                        { val: timeLeft.days, lbl: 'Days' },
                        { val: timeLeft.hours, lbl: 'Hrs' },
                        { val: timeLeft.mins, lbl: 'Mins' },
                        { val: timeLeft.secs, lbl: 'Secs' },
                      ].map((item) => (
                        <div
                          key={item.lbl}
                          className="rounded-2xl bg-[#061812] border border-[#D4AF37]/35 py-2.5 px-1 text-center shadow-inner group-hover:border-[#D4AF37]/50 transition-colors"
                        >
                          <span className="font-mono-tabular text-xl sm:text-2xl font-bold text-[#F3E5AB] block">
                            {String(item.val).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] text-[#C8C2B4] font-medium uppercase tracking-tighter">
                            {item.lbl}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Primary Call to Actions */}
                  {weddingData.recipientName && (
                    <div className="mb-2 py-1.5 px-3.5 rounded-2xl bg-[#061812]/90 border border-[#D4AF37]/50 shadow-md backdrop-blur-md inline-flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse shrink-0" />
                      <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-wider">Mohtaram Mehmaan:</span>
                      <span className="text-xs sm:text-sm font-serif-display font-bold text-[#F3E5AB]">{weddingData.recipientName}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveCardTab('rsvp')}
                      className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-[#D4AF37] text-[#061812] text-xs font-bold hover:brightness-110 shadow-xl transition-all cursor-pointer active:scale-95"
                    >
                      Confirm RSVP
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowShareModal(true)}
                      className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl border-2 border-[#25D366] bg-[#25D366]/15 text-xs font-bold text-[#FBF7EE] hover:bg-[#25D366]/30 shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]/20" />
                      <span>WhatsApp Share</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowShareModal(true)}
                      className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl border border-[#D4AF37]/50 bg-[#061812] text-xs font-bold text-[#F3E5AB] hover:bg-[#D4AF37]/10 shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share Link</span>
                    </button>
                    <button
                      type="button"
                      onClick={triggerWeddingCardPdfPrint}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl border border-[#D4AF37]/50 bg-[#061812] text-[#D4AF37] hover:bg-[#D4AF37]/10 shadow-xl transition-all cursor-pointer active:scale-95"
                      title="Save as PDF"
                    >
                      <FileDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5 flex flex-col">
                  <div 
                    onClick={() => setFocusedElement('photo')}
                    className="group relative h-56 sm:h-72 md:h-full w-full rounded-3xl overflow-hidden border border-[#D4AF37]/50 bg-[#061812] shadow-2xl cursor-pointer active:scale-[0.99] transition-all"
                  >
                    {!brokenImages[weddingData.coverPhotoUrl || HERO_IMAGE] ? (
                      <img
                        src={weddingData.coverPhotoUrl || HERO_IMAGE}
                        alt="Royal Wedding Courtyard"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setBrokenImages((prev) => ({
                            ...prev,
                            [weddingData.coverPhotoUrl || HERO_IMAGE]: true,
                          }))
                        }
                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <Heart className="w-12 h-12 text-[#D4AF37] opacity-40 animate-pulse" />
                        <p className="font-serif-display text-xl text-[#F3E5AB] italic">
                          A Beautiful Journey Begins
                        </p>
                      </div>
                    )}
                    
                    {/* Artistic Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#061812] via-transparent to-[#061812]/40 pointer-events-none" />

                    {/* Corner Floral Motifs */}
                    <div className="absolute top-0 right-0 w-28 h-28 rotate-90 opacity-90 drop-shadow-lg">
                      <CornerMotif className="w-full h-full" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-28 h-28 -rotate-90 opacity-90 drop-shadow-lg">
                      <CornerMotif className="w-full h-full" />
                    </div>

                    <div className="absolute bottom-6 left-0 right-0 text-center px-4">
                      <div className="inline-block px-4 py-1.5 rounded-full bg-[#061812]/70 border border-[#D4AF37]/50 backdrop-blur-md shadow-xl">
                        <p className="font-arabic text-lg text-[#F3E5AB] mb-1" dir="rtl">
                          بارك الله لكما
                        </p>
                        <p className="text-[10px] text-[#FBF7EE] font-bold uppercase tracking-[0.3em]">
                          {weddingData.cityLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 2: COMPACT ITINERARY & RASM-O-RIWAAJ (MEHNDI, BARAAT, WALIMA)
          =================================================================== */}
          {activeCardTab === 'events' && (
            <div className="relative z-10 space-y-4 p-3 rounded-3xl">
              {/* Sub-tabs for Mehndi / Baraat / Walima */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D4AF37]/20">
                <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#FBF7EE]">
                  Wedding Itinerary &amp; Rasm-o-Riwaaj
                </h2>
                <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-[#061812] p-1 rounded-xl border border-[#D4AF37]/25">
                  {weddingData.events.map((ev, idx) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setSelectedEventIdx(idx)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 text-center ${
                        selectedEventIdx === idx
                          ? 'bg-[#D4AF37] text-[#061812] font-semibold'
                          : 'text-[#C8C2B4] hover:text-[#FBF7EE]'
                      }`}
                    >
                      {ev.shortName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Function Card */}
              <div 
                className="group grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-stretch cursor-pointer"
                onClick={() => setFocusedElement('event')}
              >
                <div className="md:col-span-5">
                  <div className="relative h-44 sm:h-52 md:h-full w-full rounded-2xl overflow-hidden border border-[#D4AF37]/30 bg-[#061812] transition-all group-hover:border-[#D4AF37]/60">
                    <img
                      src={currentEvent.image}
                      alt={currentEvent.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-3.5">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <span className="font-arabic text-lg text-[#F3E5AB]" dir="rtl">
                        {currentEvent.urduSubtitle}
                      </span>
                      <span className="text-[11px] text-[#C8C2B4]">
                        Dress: {currentEvent.dressCode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-base sm:text-lg font-semibold text-[#D4AF37]">
                      <span>{currentEvent.dateLabel}</span>
                      <span aria-hidden="true" className="opacity-50">·</span>
                      <span className="font-mono-tabular">{currentEvent.timeRange}</span>
                    </div>
                    <h3 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#FBF7EE] mt-1">
                      {currentEvent.title}
                    </h3>
                    <p className="text-xs text-[#C8C2B4] mt-0.5">
                      <MapPin className="w-3.5 h-3.5 inline text-[#D4AF37] mr-1" />
                      {currentEvent.venueName} — {currentEvent.address}
                    </p>
                  </div>

                  {/* Compact 3-Step Rasm Timeline */}
                  <div className="space-y-2 pt-1">
                    {currentEvent.rasmHighlights.map((r) => (
                      <div
                        key={r.label}
                        className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#061812]/70 border border-[#D4AF37]/20 text-xs"
                      >
                        <span className="font-medium text-[#FBF7EE]">{r.label}</span>
                        <span className="font-mono-tabular text-[#D4AF37]">{r.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={triggerWeddingCardPdfPrint}
                      className="text-xs text-[#C8C2B4] hover:text-[#F3E5AB] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Download PDF Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCardTab('venue')}
                      className="text-xs font-medium text-[#D4AF37] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>See Location on Map</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 3: EASY VENUE LOCATION & GOOGLE MAPS PIN
          =================================================================== */}
          {activeCardTab === 'venue' && (
            <div className="relative z-10 space-y-4 p-3 rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#D4AF37]/20">
                <div>
                  <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#FBF7EE]">
                    Venue Location &amp; Google Maps Pin
                  </h2>
                </div>
                <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-[#061812] p-1 rounded-xl border border-[#D4AF37]/25">
                  {weddingData.events.map((ev, idx) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setSelectedEventIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 text-center ${
                        selectedEventIdx === idx
                          ? 'bg-[#D4AF37] text-[#061812] font-semibold'
                          : 'text-[#C8C2B4] hover:text-[#FBF7EE]'
                      }`}
                    >
                      {ev.id.charAt(0).toUpperCase() + ev.id.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick & Easy Location Search Bar right inside the Map Tab */}
              <div className="p-3 rounded-2xl bg-[#061812]/80 border border-[#D4AF37]/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <input
                    type="text"
                    value={currentEvent.mapEmbedQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updatedEvents = [...weddingData.events];
                      updatedEvents[selectedEventIdx] = {
                        ...updatedEvents[selectedEventIdx],
                        mapEmbedQuery: parseEasyLocationInput(
                          val,
                          currentEvent.venueName,
                          currentEvent.address
                        ),
                      };
                      const updated = { ...weddingData, events: updatedEvents };
                      setWeddingData(updated);
                      try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                      } catch {
                        // ignore
                      }
                    }}
                    placeholder="Yahan Hall ka naam ya Google Map link likhein..."
                    className="w-full bg-transparent text-xs sm:text-sm text-[#FBF7EE] placeholder:text-[#C8C2B4]/60 focus:outline-none"
                  />
                </div>
                <span className="text-[11px] text-[#D4AF37] shrink-0">
                  Live Map Pin Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-stretch">
                <div className="md:col-span-5 flex flex-col justify-between space-y-3 bg-[#061812]/70 p-4 rounded-2xl border border-[#D4AF37]/25">
                  <div className="space-y-1.5">
                    <p className="text-xs text-[#D4AF37]">{currentEvent.title}</p>
                    <h3 className="font-serif-display text-2xl font-semibold text-[#FBF7EE]">
                      {currentEvent.venueName}
                    </h3>
                    <p className="text-sm text-[#C8C2B4] leading-relaxed">
                      {currentEvent.address}
                    </p>
                    <p className="text-sm sm:text-base text-[#F3E5AB] font-mono-tabular pt-1">
                      <Clock className="w-4 h-4 inline mr-1 text-[#D4AF37]" />
                      {currentEvent.dateLabel} · {currentEvent.timeRange}
                    </p>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      currentEvent.mapEmbedQuery || `${currentEvent.venueName} ${currentEvent.address}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#061812] font-semibold text-xs hover:brightness-110 transition-all whitespace-nowrap shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open Directions in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div 
                  onClick={() => setFocusedElement('map')}
                  className="group relative md:col-span-7 h-52 sm:h-60 rounded-2xl overflow-hidden border border-[#D4AF37]/35 bg-[#061812] cursor-pointer hover:border-[#D4AF37]/60 transition-all"
                >
                  <div className="absolute inset-0 z-10 bg-transparent" /> {/* Click interceptor for iframe */}
                  <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-[#061812]/80 p-1.5 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37]">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <iframe
                    title={`Map for ${currentEvent.venueName}`}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      currentEvent.mapEmbedQuery || `${currentEvent.venueName} ${currentEvent.address}`
                    )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB 4: COMPACT DIGITAL RSVP FORM
          =================================================================== */}
          {activeCardTab === 'rsvp' && (
            <div className="relative z-10 space-y-4 p-3 rounded-3xl">
              <div className="pb-2 border-b border-[#D4AF37]/20 flex items-center justify-between">
                <div>
                  <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#FBF7EE]">
                    Quick Digital RSVP
                  </h2>
                  <p className="text-xs text-[#C8C2B4]">
                    Kindly confirm your attendance &amp; number of guests
                  </p>
                </div>
                <span className="font-arabic text-xl text-[#D4AF37]" dir="rtl">
                  چشمِ براہ
                </span>
              </div>

              {rsvpSubmitted ? (
                <div className="p-5 rounded-2xl bg-[#061812] border border-[#D4AF37]/45 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center mx-auto">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif-display text-2xl text-[#FBF7EE]">
                    JazakAllah Khair, {guestName}!
                  </h3>
                  <p className="text-xs text-[#C8C2B4]">
                    {attending === 'yes'
                      ? `Your RSVP for ${guestCount} ${
                          guestCount === 1 ? 'Guest' : 'Guests'
                        } (${rsvpEvents.join(', ')}) has been recorded.`
                      : `Thank you for your warm wishes and duas for ${shortGroomFirst} & ${shortBrideFirst}.`}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRsvpSubmitted(false);
                        setGuestName('');
                      }}
                      className="px-4 py-2 rounded-xl border border-[#D4AF37]/40 text-xs text-[#F3E5AB] hover:bg-[#D4AF37]/15 cursor-pointer"
                    >
                      Edit Response
                    </button>
                    <button
                      type="button"
                      onClick={triggerWeddingCardPdfPrint}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] text-[#061812] font-semibold text-xs cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download Card PDF</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-3.5">
                  {formError && (
                    <p className="text-xs text-[#E11D48] bg-[#E11D48]/10 px-3 py-2 rounded-lg border border-[#E11D48]/40">
                      {formError}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs text-[#F3E5AB] mb-1">
                        Your Full Name / Family Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Mr. & Mrs. Kamran Ahmed"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#061812] border border-[#D4AF37]/30 text-xs sm:text-sm text-[#FBF7EE] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[#F3E5AB] mb-1">
                        Attendance Status
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAttending('yes')}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                            attending === 'yes'
                              ? 'bg-[#D4AF37] text-[#061812] border-[#D4AF37]'
                              : 'bg-[#061812] text-[#C8C2B4] border-[#D4AF37]/25'
                          }`}
                        >
                          Yes, Attending
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttending('no')}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                            attending === 'no'
                              ? 'bg-[#D4AF37] text-[#061812] border-[#D4AF37]'
                              : 'bg-[#061812] text-[#C8C2B4] border-[#D4AF37]/25'
                          }`}
                        >
                          Sending Duas
                        </button>
                      </div>
                    </div>
                  </div>

                  {attending === 'yes' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs text-[#F3E5AB] mb-1">
                          Number of Guests
                        </label>
                        <div className="flex items-center gap-1.5 bg-[#061812] p-1 rounded-xl border border-[#D4AF37]/30">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setGuestCount(n)}
                              className={`flex-1 py-1.5 rounded-lg font-mono-tabular text-xs font-semibold cursor-pointer ${
                                guestCount === n
                                  ? 'bg-[#D4AF37] text-[#061812]'
                                  : 'text-[#C8C2B4]'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-[#F3E5AB] mb-1">
                          Functions Attending
                        </label>
                        <div className="flex items-center gap-1.5">
                          {['Mehndi', 'Baraat', 'Walima'].map((fn) => {
                            const active = rsvpEvents.includes(fn);
                            return (
                              <button
                                key={fn}
                                type="button"
                                onClick={() => toggleEventSelection(fn)}
                                className={`flex-1 py-2 rounded-xl border text-xs font-medium cursor-pointer ${
                                  active
                                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#FBF7EE]'
                                    : 'bg-[#061812] border-[#D4AF37]/25 text-[#C8C2B4]'
                                }`}
                              >
                                {fn}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C59B27] text-[#061812] font-semibold text-xs sm:text-sm shadow-md hover:brightness-110 transition-all cursor-pointer"
                  >
                    Submit RSVP
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Compact Mobile-Responsive Footer */}
      <footer className="pb-3 px-4 text-center text-[11px] sm:text-xs text-[#C8C2B4]/80 flex flex-wrap items-center justify-center gap-2 sm:gap-3 no-print">
        <span>
          {shortGroomFirst} &amp; {shortBrideFirst} · {weddingData.weddingDatesSummary}
        </span>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={triggerWeddingCardPdfPrint}
          className="text-[#D4AF37] hover:underline cursor-pointer"
        >
          Download PDF
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={() => setIsInvitationOpened(false)}
          className="text-[#D4AF37] hover:underline cursor-pointer"
        >
          Salam &amp; Dua Screen
        </button>
        {renderFocusOverlay()}
      </footer>
    </div>
  );
}
