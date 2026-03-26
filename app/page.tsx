"use client";

import { useEffect, useRef, useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { SERVICES, PROS, TESTIS } from "@/lib/data";
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  User, 
  ShoppingBag,
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  RefreshCcw, 
  PhoneCall, 
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Home as HomeIcon,
  Star,
  Instagram,
  Facebook,
  Twitter,
  LayoutDashboard,
  LogOut,
  Zap,
  Droplet,
  Paintbrush,
  Sparkles,
  Snowflake,
  Bug,
  Lamp,
  Scissors,
  Wand2,
  Copy,
  Clock,
  IndianRupee,
  Camera,
  MessageSquare,
  ThumbsUp,
  Edit3,
  Menu,
  X
} from "lucide-react";

const HERO_SLIDES = [
  {
    id: "clean-1",
    img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=85",
  },
  {
    id: "ac-1",
    img: "https://images.unsplash.com/photo-1558227691-41ea78d1f631?w=1600&q=85",
  },
  {
    id: "furn-1",
    img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1600&q=85",
  },
  {
    id: "salon-1",
    img: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1600&q=85",
  },
  {
    id: "plumbing-1",
    img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=85",
  },
];

const TAG_COLORS: Record<string, string> = {
  POPULAR: "#10B97A",
  BESTSELLER: "#0891b2",
  NEW: "#10B97A",
  HOT: "#f97316",
  RELAX: "#7c3aed",
};

type ServiceItem = (typeof SERVICES)[number];
type ServiceSub = ServiceItem["subs"][number];

type BookingData = {
  sub: ServiceSub | null;
  date: string | null;
  time: string | null;
  pro: string | null;
  addr: { name: string; phone: string; pin: string; flat: string; city: string };
  pay: string;
};

type OrderItem = {
  id: string;
  service: string;
  sub: string;
  date: string | null;
  time: string | null;
  pro: string | null;
  price: number;
  status: string;
  img: string;
  createdAt: string;
};

export default function Home() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState("main"); // main or dash
  const [dashPanel, setDashPanel] = useState("overview");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [trustOpenId, setTrustOpenId] = useState<string | null>(null);
  const trustBarRef = useRef<HTMLDivElement | null>(null);

  // Booking states
  const [selSvc, setSelSvc] = useState<ServiceItem | null>(null);
  const [bStep, setBStep] = useState(1);
  const [bData, setBData] = useState<BookingData>({
    sub: null,
    date: null,
    time: null,
    pro: null,
    addr: { name: "", phone: "", pin: "", flat: "", city: "Ranchi" },
    pay: "upi"
  });

  // Mobile verification states
  const [mobileVerifyStep, setMobileVerifyStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Generate Prompt modal
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  // Feedback system states
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);
  const [feedbackStars, setFeedbackStars] = useState(0);
  const [feedbackWorkerStars, setFeedbackWorkerStars] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackTags, setFeedbackTags] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<{ orderId: string; stars: number; workerStars: number; comment: string; tags: string[]; createdAt: string }[]>([]);

  // Profile edit states
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileNickname, setProfileNickname] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileCity, setProfileCity] = useState("Ranchi");
  const [profileBio, setProfileBio] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!trustOpenId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTrustOpenId(null);
    };

    const onPointerDown = (e: PointerEvent) => {
      const root = trustBarRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) setTrustOpenId(null);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [trustOpenId]);

  // Close search results on outside click or Escape
  useEffect(() => {
    if (!showSearchResults) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSearchResults(false);
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [showSearchResults]);

  const heroSlides = HERO_SLIDES.map((slide) => {
    const svc = SERVICES.find((service) => service.id === slide.id);
    return {
      ...slide,
      name: svc?.name || "Home Service",
      desc: svc?.desc || "Trusted professional service at your doorstep.",
    };
  });

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('sh_orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error('Failed to parse saved orders:', e);
      }
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('sh_orders', JSON.stringify(orders));
    }
  }, [orders]);

  useEffect(() => {
    console.log("[user-auth-debug]", {
      isLoaded,
      isSignedIn: !!user,
      userId: user?.id ?? null,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
      path: typeof window !== "undefined" ? window.location.pathname : null,
      hash: typeof window !== "undefined" ? window.location.hash : null,
    });
  }, [isLoaded, user]);

  const initialsFromName = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const fullName =
    user?.fullName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const currentUser = user
    ? { name: fullName, email: userEmail, init: initialsFromName(fullName) }
    : null;
  const activeView = currentUser ? view : "main";
  const authModalOpen = isAuthModalOpen && !currentUser;

  const openAuth = () => {
    if (currentUser) {
      setView("dash");
      setDashPanel("overview");
    } else {
      console.log("[user-auth-debug] redirecting to /sign-in from openAuth");
      router.push("/sign-in");
    }
  };

  const openBooking = (id: string) => {
    if (!currentUser) {
      console.log("[user-auth-debug] booking blocked: redirecting to /sign-in");
      router.push("/sign-in");
      showToast("Sign in to book");
      return;
    }
    const s = SERVICES.find(x => x.id === id);
    if (!s) return;
    setSelSvc(s);
    setBStep(1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    setBData({
        ...bData,
        sub: s.subs[0],
        pro: PROS[0].name,
        date: tomorrow.toLocaleDateString('en-IN'),
        time: "10:00 AM"
    });
    setIsBookModalOpen(true);
  };

  const placeOrder = () => {
    const newOrder = {
      id: `#SH${1000 + orders.length + 1}`,
      service: selSvc.name,
      sub: bData.sub.n,
      date: bData.date,
      time: bData.time,
      pro: bData.pro,
      price: bData.sub.p + Math.round(bData.sub.p * 0.05),
      status: "confirmed",
      img: selSvc.img,
      createdAt: new Date().toLocaleDateString('en-IN')
    };
    setOrders([newOrder, ...orders]);
    setBStep(6);
    showToast("Order placed successfully!");
  };

  const handleLogout = async () => {
    await signOut();
    setView("main");
    setDashPanel("overview");
    setIsProfileDropdownOpen(false);
    showToast("Signed out");
  };

  const resetBookingState = () => {
    setBStep(1);
    setMobileVerifyStep(1);
    setMobileNumber("");
    setOtpCode(["", "", "", "", "", ""]);
    setMobileVerified(false);
    setPaymentMethod("upi");
    setUpiId("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setSelectedBank("");
  };

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const filteredServices = selectedCat === "all" ? SERVICES : SERVICES.filter(s => s.cat === selectedCat);

  return (
    <div className="min-h-screen font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-slate2-900 text-white px-5 py-3 rounded-full text-sm font-semibold flex items-center gap-2.5 shadow-2xl transition-all scale-100">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-dot"></span>
          <span>{toast}</span>
        </div>
      )}

      {/* Auth Modal */}
      <div className={`modal-wrap ${authModalOpen ? 'open' : ''}`} onClick={closeAuthModal}>
        <div className="modal-box bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
          <div className="h-40 relative overflow-hidden">
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80" alt="Home cleaning professional at work" className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-700/90 to-slate2-900/80 flex flex-col items-center justify-center gap-1 text-center">
              <div className="font-display text-3xl font-bold text-white">Service<span className="text-accent-400">Hub</span></div>
              <div className="text-xs text-white/70 font-semibold tracking-widest uppercase px-4">Home Services at Your Doorstep</div>
            </div>
          </div>
          <button onClick={closeAuthModal} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center text-lg transition-all z-10">x</button>
          <div className="p-7">
            <p className="mb-4 text-sm font-semibold text-slate2-700">Continue with secure user login/signup.</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/sign-in")}
                className="w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-brand text-sm"
              >
                Go to Sign In
              </button>
              <button
                onClick={() => router.push("/sign-up")}
                className="w-full border-2 border-slate2-200 text-slate2-700 font-bold py-3.5 rounded-xl transition-all hover:border-brand-500 hover:text-brand-600 text-sm"
              >
                Go to Create Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <div className={`modal-wrap ${isBookModalOpen ? 'open' : ''}`} onClick={() => setIsBookModalOpen(false)}>
        <div className="modal-box bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative h-[140px] w-full overflow-hidden rounded-t-2xl">
                <img
                  src={selSvc?.img || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80"}
                  alt={selSvc?.name || "Selected home service"}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/45" />
                <div className="absolute bottom-4 left-5 text-white text-[20px] font-bold leading-tight">
                  {selSvc?.name || "Service Booking"}
                </div>
                <button onClick={() => setIsBookModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/35 text-white hover:bg-black/50 flex items-center justify-center text-lg z-10 font-bold">x</button>
            </div>
            <div className="px-7 pt-4 pb-2">
                <p className="text-sm text-slate2-500 font-semibold">Fill details to confirm booking</p>
            </div>
            <div className="p-7">
                {bStep === 1 && (
                    <div>
                        <p className="text-xs font-bold text-slate2-500 uppercase tracking-widest mb-4">Choose Service Type</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selSvc?.subs.map((s: ServiceSub, i: number) => (
                                <div key={i} onClick={() => setBData({...bData, sub: s})} className={`flex items-center gap-3 p-3.5 border-2 ${bData.sub?.n === s.n ? 'border-brand-500 bg-brand-50' : 'border-slate2-200'} rounded-xl cursor-pointer transition-all`}>
                                    <div>
                                        <div className="text-sm font-bold text-slate2-800">{s.n}</div>
                                        <div className="text-xs text-slate2-400 mt-0.5">₹{s.p}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setBStep(2)} className="w-full mt-6 bg-brand-600 text-white font-bold py-3 rounded-xl">Continue →</button>
                    </div>
                )}
                {bStep === 2 && (
                    <div>
                        <p className="text-xs font-bold text-slate2-500 uppercase tracking-widest mb-4">Select Date & Time</p>
                        {/* 14 Day Scrollable Date Picker */}
                        <div className="mb-4">
                            <p className="text-xs font-bold text-slate2-400 mb-2">Select Date</p>
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {[...Array(14)].map((_, i) => {
                                    const d = new Date();
                                    d.setDate(d.getDate() + i + 1);
                                    const ds = d.toLocaleDateString('en-IN');
                                    const month = d.toLocaleDateString('en-IN', { month: 'short' });
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => setBData({...bData, date: ds})}
                                            className={`shrink-0 text-center px-4 py-3 border-2 rounded-xl cursor-pointer min-w-[70px] transition-all ${bData.date === ds ? 'border-brand-500 bg-brand-50' : 'border-slate2-200 hover:border-brand-300'}`}
                                        >
                                            <div className="text-[10px] font-bold text-slate2-400 uppercase">{d.toLocaleDateString('en-IN', {weekday: 'short'})}</div>
                                            <div className="font-display text-xl font-bold text-slate2-900">{d.getDate()}</div>
                                            <div className="text-[10px] font-semibold text-slate2-400">{month}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Time Slots */}
                        <div className="mb-4">
                            <p className="text-xs font-bold text-slate2-400 mb-2">Select Time Slot</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"].map(t => (
                                    <div
                                        key={t}
                                        onClick={() => setBData({...bData, time: t})}
                                        className={`flex items-center justify-center gap-1.5 py-2.5 border-2 rounded-xl cursor-pointer text-sm font-semibold transition-all ${bData.time === t ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate2-200 text-slate2-600 hover:border-brand-300'}`}
                                    >
                                        <Clock className="w-3.5 h-3.5" />
                                        {t}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => setBStep(3)} className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl">Continue →</button>
                        <button onClick={() => setBStep(1)} className="w-full mt-2 text-slate2-400 text-sm">← Back</button>
                    </div>
                )}
                {bStep === 3 && (
                    <div>
                        <p className="text-xs font-bold text-slate2-500 uppercase tracking-widest mb-4">Verify Mobile Number</p>
                        {mobileVerifyStep === 1 && (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                                        <PhoneCall className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate2-900">Enter Mobile Number</p>
                                        <p className="text-xs text-slate2-400">We'll send a 6-digit OTP</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-4">
                                    <span className="flex items-center px-4 bg-slate2-100 border border-slate2-200 rounded-xl text-sm font-bold text-slate2-600">+91</span>
                                    <input
                                        type="tel"
                                        placeholder="10-digit mobile number"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="flex-1 border border-slate2-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        if (mobileNumber.length === 10) {
                                            setIsVerifying(true);
                                            setTimeout(() => {
                                                setIsVerifying(false);
                                                setMobileVerifyStep(2);
                                                setOtpTimer(30);
                                                showToast("OTP sent to +91 " + mobileNumber);
                                            }, 1200);
                                        } else {
                                            showToast("Please enter valid 10-digit number");
                                        }
                                    }}
                                    disabled={isVerifying}
                                    className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                                >
                                    {isVerifying ? "Sending OTP..." : "Send OTP"}
                                </button>
                            </div>
                        )}
                        {mobileVerifyStep === 2 && (
                            <div>
                                <div className="text-center mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-3">
                                        <ShieldCheck className="w-6 h-6 text-white" />
                                    </div>
                                    <p className="font-bold text-slate2-900">Enter OTP</p>
                                    <p className="text-xs text-slate2-400">Sent to +91 {mobileNumber}</p>
                                </div>
                                <div className="flex justify-center gap-2 mb-4">
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={otpCode[i]}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                const newOtp = [...otpCode];
                                                newOtp[i] = val;
                                                setOtpCode(newOtp);
                                                if (val && i < 5) {
                                                    const nextInput = e.target.nextElementSibling as HTMLInputElement;
                                                    nextInput?.focus();
                                                }
                                            }}
                                            className="w-11 h-12 text-center text-lg font-bold border border-slate2-200 rounded-xl outline-none focus:border-brand-500 transition-all"
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => {
                                        const enteredOtp = otpCode.join('');
                                        if (enteredOtp.length === 6) {
                                            setIsVerifying(true);
                                            setTimeout(() => {
                                                setIsVerifying(false);
                                                setMobileVerified(true);
                                                setBData({...bData, addr: {...bData.addr, phone: mobileNumber}});
                                                setMobileVerifyStep(3);
                                                showToast("Mobile verified successfully!");
                                            }, 1200);
                                        } else {
                                            showToast("Please enter complete 6-digit OTP");
                                        }
                                    }}
                                    disabled={isVerifying}
                                    className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                                >
                                    {isVerifying ? "Verifying..." : "Verify OTP"}
                                </button>
                                <button
                                    onClick={() => setMobileVerifyStep(1)}
                                    className="w-full mt-3 text-slate2-500 text-sm font-semibold hover:text-brand-600"
                                >
                                    ← Change Number
                                </button>
                                <button
                                    onClick={() => {
                                        if (otpTimer <= 0) {
                                            setOtpTimer(30);
                                            showToast("OTP resent to +91 " + mobileNumber);
                                        }
                                    }}
                                    disabled={otpTimer > 0}
                                    className="w-full mt-2 text-sm font-semibold text-brand-600 disabled:text-slate2-400"
                                >
                                    {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
                                </button>
                            </div>
                        )}
                        {mobileVerifyStep === 3 && (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </div>
                                <p className="font-bold text-slate2-900 mb-1">Mobile Verified!</p>
                                <p className="text-sm text-slate2-500 mb-3">+91 {mobileNumber}</p>
                                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Verified
                                </div>
                            </div>
                        )}
                        <button onClick={() => { if (mobileVerified || mobileVerifyStep === 3) setBStep(4); else showToast("Please verify mobile first"); }} className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl mt-4">Continue →</button>
                        <button onClick={() => setBStep(2)} className="w-full mt-2 text-slate2-400 text-sm">← Back</button>
                    </div>
                )}
                {bStep === 4 && (
                    <div>
                        <p className="text-xs font-bold text-slate2-500 uppercase tracking-widest mb-4">Select Payment Method</p>
                        {/* Payment Options */}
                        <div className="space-y-3 mb-4">
                            {/* UPI */}
                            <div
                                onClick={() => setPaymentMethod("upi")}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "upi" ? 'border-brand-500 bg-brand-50' : 'border-slate2-200'}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-slate2-900">UPI</span>
                                    <div className="flex gap-2">
                                        {/* GPay Logo */}
                                        <div className="w-8 h-8 rounded-lg bg-white border border-slate2-200 flex items-center justify-center text-[10px] font-black">
                                            <span className="text-blue-500">G</span><span className="text-red-500">o</span><span className="text-yellow-500">o</span><span className="text-blue-500">g</span><span className="text-green-500">l</span><span className="text-red-500">e</span>
                                        </div>
                                        {/* PhonePe Logo */}
                                        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white text-[8px] font-black">Pe</div>
                                        {/* Paytm Logo */}
                                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-[8px] font-black">Paytm</div>
                                    </div>
                                </div>
                                {paymentMethod === "upi" && (
                                    <input
                                        type="text"
                                        placeholder="yourname@upi"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        className="w-full border border-slate2-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 mt-2"
                                    />
                                )}
                            </div>
                            {/* Debit/Credit Card */}
                            <div
                                onClick={() => setPaymentMethod("card")}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "card" ? 'border-brand-500 bg-brand-50' : 'border-slate2-200'}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-slate2-900">Debit / Credit Card</span>
                                    <div className="flex gap-2">
                                        {/* Visa Logo */}
                                        <div className="w-8 h-5 rounded bg-blue-800 flex items-center justify-center text-white text-[8px] font-black italic">VISA</div>
                                        {/* Mastercard Logo */}
                                        <div className="w-8 h-5 rounded bg-slate2-800 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-red-500 -mr-1"></div>
                                            <div className="w-3 h-3 rounded-full bg-orange-500 -ml-1"></div>
                                        </div>
                                        {/* RuPay Logo */}
                                        <div className="w-8 h-5 rounded bg-green-600 flex items-center justify-center text-white text-[6px] font-black">RuPay</div>
                                    </div>
                                </div>
                                {paymentMethod === "card" && (
                                    <div className="space-y-2 mt-2">
                                        <input type="text" placeholder="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} className="w-full border border-slate2-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500" />
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="flex-1 border border-slate2-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500" />
                                            <input type="password" placeholder="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} className="w-20 border border-slate2-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500" />
                                        </div>
                                        <input type="text" placeholder="Cardholder Name" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full border border-slate2-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500" />
                                    </div>
                                )}
                            </div>
                            {/* Net Banking */}
                            <div
                                onClick={() => setPaymentMethod("netbanking")}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "netbanking" ? 'border-brand-500 bg-brand-50' : 'border-slate2-200'}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-slate2-900">Net Banking</span>
                                    <div className="flex gap-2">
                                        {/* SBI Logo */}
                                        <div className="w-8 h-5 rounded bg-blue-700 flex items-center justify-center text-white text-[6px] font-black">SBI</div>
                                        {/* HDFC Logo */}
                                        <div className="w-8 h-5 rounded bg-blue-900 flex items-center justify-center text-white text-[5px] font-black">HDFC</div>
                                        {/* ICICI Logo */}
                                        <div className="w-8 h-5 rounded bg-orange-500 flex items-center justify-center text-white text-[5px] font-black">ICICI</div>
                                    </div>
                                </div>
                                {paymentMethod === "netbanking" && (
                                    <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} className="w-full border border-slate2-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 mt-2 bg-white">
                                        <option value="">Select Bank</option>
                                        <option value="sbi">State Bank of India</option>
                                        <option value="hdfc">HDFC Bank</option>
                                        <option value="icici">ICICI Bank</option>
                                        <option value="axis">Axis Bank</option>
                                        <option value="pnb">Punjab National Bank</option>
                                    </select>
                                )}
                            </div>
                            {/* Cash on Delivery */}
                            <div
                                onClick={() => setPaymentMethod("cod")}
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "cod" ? 'border-brand-500 bg-brand-50' : 'border-slate2-200'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate2-900">Cash on Delivery</span>
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <IndianRupee className="w-4 h-4 text-emerald-600" />
                                    </div>
                                </div>
                                <p className="text-xs text-slate2-400 mt-1">Pay when service is completed</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                // RAZORPAY_KEY_ID = '' // enter your key here
                                setIsProcessingPayment(true);
                                setTimeout(() => {
                                    setIsProcessingPayment(false);
                                    setBStep(5);
                                    showToast("Payment successful!");
                                }, 2200);
                            }}
                            disabled={isProcessingPayment}
                            className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                        >
                            {isProcessingPayment ? "Processing payment..." : `Pay ₹${bData.sub?.p ? bData.sub.p + Math.round(bData.sub.p * 0.05) : 0}`}
                        </button>
                        <button onClick={() => setBStep(3)} className="w-full mt-2 text-slate2-400 text-sm">← Back</button>
                    </div>
                )}
                {bStep === 5 && (
                    <div>
                        <p className="text-xs font-bold text-slate2-500 uppercase tracking-widest mb-4">Booking Summary</p>
                        <div className="bg-slate2-50 p-4 rounded-xl mb-4">
                            <div className="flex justify-between font-bold mb-2 text-slate-800"><span>{selSvc?.name}</span><span>₹{bData.sub?.p}</span></div>
                            <div className="text-sm text-slate2-500 mb-1">Type: {bData.sub?.n}</div>
                            <div className="text-sm text-slate2-500 mb-1">Date: {bData.date}</div>
                            <div className="text-sm text-slate2-500 mb-1">Time: {bData.time}</div>
                            <div className="text-sm text-slate2-500 mb-1">Professional: {bData.pro}</div>
                            <div className="text-sm text-slate2-500 mb-1">Mobile: +91 {mobileNumber}</div>
                            <div className="text-sm text-slate2-500 mb-1">Payment: {paymentMethod.toUpperCase()}</div>
                            <div className="border-t border-slate2-200 mt-2 pt-2 flex justify-between font-bold text-slate-800">
                                <span>Total (incl. 5% GST)</span>
                                <span>₹{bData.sub?.p ? bData.sub.p + Math.round(bData.sub.p * 0.05) : 0}</span>
                            </div>
                        </div>
                        {/* Generate Prompt Button */}
                        <button
                            onClick={() => {
                                const prompt = `🛠️ ServiceHub Booking Summary

Service: ${selSvc?.name}
Sub-service: ${bData.sub?.n}
Price: ₹${bData.sub?.p}
Date: ${bData.date}
Time: ${bData.time}
Professional: ${bData.pro}
Customer Mobile: +91 ${mobileNumber}
Payment Method: ${paymentMethod.toUpperCase()}
Total Amount: ₹${bData.sub?.p ? bData.sub.p + Math.round(bData.sub.p * 0.05) : 0}

---
Hello! I have booked a ${selSvc?.name} service (${bData.sub?.n}) through ServiceHub. The service is scheduled for ${bData.date} at ${bData.time}. My assigned professional is ${bData.pro}. Please confirm the booking details and let me know if any additional information is needed. Thank you! 🙏`;
                                setGeneratedPrompt(prompt);
                                setIsPromptModalOpen(true);
                            }}
                            className="w-full mb-3 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            <Wand2 className="w-4 h-4" />
                            ✨ Generate Prompt
                        </button>
                        <button onClick={placeOrder} className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl">Confirm & Place Order</button>
                        <button onClick={() => setBStep(4)} className="w-full mt-2 text-slate2-400 text-sm">← Back</button>
                    </div>
                )}
                {bStep === 6 && (
                    <div className="text-center py-6">
                        <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center text-4xl mx-auto mb-4 text-white">✓</div>
                        <h3 className="text-2xl font-bold mb-2 text-slate-900">Order Confirmed!</h3>
                        <p className="text-sm text-slate2-500 mb-4">Your booking has been placed successfully.</p>
                        <button onClick={() => {setIsBookModalOpen(false); setView('dash'); setDashPanel('orders'); resetBookingState();}} className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold">View Orders</button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Generate Prompt Modal */}
      <div className={`modal-wrap ${isPromptModalOpen ? 'open' : ''}`} onClick={() => setIsPromptModalOpen(false)}>
        <div className="modal-box bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-purple-600 to-violet-600 p-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <Wand2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">AI Generated Prompt</h3>
                        <p className="text-sm text-white/70">ServiceHub Customer Service</p>
                    </div>
                </div>
            </div>
            <button onClick={() => setIsPromptModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center text-lg transition-all z-10">x</button>
            <div className="p-6">
                <div className="bg-slate2-50 rounded-xl p-4 mb-4 max-h-[300px] overflow-y-auto">
                    <pre className="text-sm text-slate2-700 whitespace-pre-wrap font-medium">{generatedPrompt}</pre>
                </div>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(generatedPrompt);
                        showToast("Prompt copied to clipboard!");
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                </button>
            </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <div className={`modal-wrap ${isFeedbackModalOpen ? 'open' : ''}`} onClick={() => setIsFeedbackModalOpen(false)}>
        <div className="modal-box bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white">Share Your Feedback</h3>
                        <p className="text-xs sm:text-sm text-white/70">Help us improve your experience</p>
                    </div>
                </div>
            </div>
            <button onClick={() => setIsFeedbackModalOpen(false)} className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center text-base sm:text-lg transition-all z-10">x</button>
            <div className="p-4 sm:p-6">
                {/* Service Info */}
                {(() => {
                    const order = orders.find(o => o.id === feedbackOrderId);
                    if (!order) return null;
                    return (
                        <div className="bg-slate2-50 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden">
                                    <img src={order.img} alt={order.service} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate2-900">{order.service}</p>
                                    <p className="text-xs text-slate2-400">Professional: {order.pro}</p>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Service Rating */}
                <div className="mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm font-bold text-slate2-700 mb-1.5 sm:mb-2">Rate the Service</p>
                    <div className="flex gap-1.5 sm:gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                onClick={() => setFeedbackStars(star)}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 border-slate2-200 flex items-center justify-center transition-all hover:border-amber-400"
                            >
                                <Star className={`w-5 h-5 sm:w-6 sm:h-6 ${star <= feedbackStars ? 'text-amber-400 fill-amber-400' : 'text-slate2-300'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Worker Rating */}
                <div className="mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm font-bold text-slate2-700 mb-1.5 sm:mb-2">Rate your Professional</p>
                    <div className="flex gap-1.5 sm:gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                onClick={() => setFeedbackWorkerStars(star)}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 border-slate2-200 flex items-center justify-center transition-all hover:border-amber-400"
                            >
                                <Star className={`w-5 h-5 sm:w-6 sm:h-6 ${star <= feedbackWorkerStars ? 'text-amber-400 fill-amber-400' : 'text-slate2-300'}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Comment */}
                <div className="mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm font-bold text-slate2-700 mb-1.5 sm:mb-2">Your Experience</p>
                    <textarea
                        placeholder="Tell us about your experience..."
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        className="w-full border border-slate2-200 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm outline-none focus:border-brand-500 transition-all resize-none h-20 sm:h-24"
                    />
                </div>

                {/* Tags */}
                <div className="mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm font-bold text-slate2-700 mb-1.5 sm:mb-2">Quick Tags</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {["On Time", "Clean Work", "Friendly", "Professional", "Would Rebook"].map(tag => (
                            <button
                                key={tag}
                                onClick={() => {
                                    if (feedbackTags.includes(tag)) {
                                        setFeedbackTags(feedbackTags.filter(t => t !== tag));
                                    } else {
                                        setFeedbackTags([...feedbackTags, tag]);
                                    }
                                }}
                                className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all ${feedbackTags.includes(tag) ? 'bg-brand-500 text-white' : 'bg-slate2-100 text-slate2-600 hover:bg-slate2-200'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <button
                    onClick={() => {
                        if (feedbackStars === 0 || feedbackWorkerStars === 0) {
                            showToast("Please provide both ratings");
                            return;
                        }
                        const newFeedback = {
                            orderId: feedbackOrderId || "",
                            stars: feedbackStars,
                            workerStars: feedbackWorkerStars,
                            comment: feedbackComment,
                            tags: feedbackTags,
                            createdAt: new Date().toLocaleDateString('en-IN')
                        };
                        setFeedbacks([...feedbacks, newFeedback]);
                        setOrders(orders.map(o => o.id === feedbackOrderId ? { ...o, status: "reviewed" } : o));
                        setIsFeedbackModalOpen(false);
                        setFeedbackStars(0);
                        setFeedbackWorkerStars(0);
                        setFeedbackComment("");
                        setFeedbackTags([]);
                        setFeedbackOrderId(null);
                        showToast("Thank you for your feedback! ⭐");
                    }}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
                >
                    <ThumbsUp className="w-4 h-4" />
                    Submit Feedback
                </button>
            </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white sticky top-0 z-[200] border-b border-slate2-200 shadow-sm" id="mainHeader">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Mobile Hamburger Menu */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate2-50 transition-all"
            >
              <Menu className="w-5 h-5 text-slate2-700" />
            </button>
            
            <button onClick={() => setView('main')} className="font-display text-xl sm:text-2xl font-bold text-slate2-900 shrink-0 outline-none">
              Service<span className="text-brand-600">Hub</span>
            </button>
            
            {/* Location Selector - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 border border-slate2-200 rounded-xl bg-slate2-50 cursor-pointer hover:border-brand-500 transition-all group">
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-rose-500 fill-rose-500/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate2-400 uppercase tracking-widest leading-none mb-0.5">Deliver To</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-slate2-900 leading-none">Ranchi, Jharkhand</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate2-400 group-hover:text-brand-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Search - Hidden on mobile */}
          <div className="hidden lg:block flex-1 max-w-2xl">
            <div className="relative group search-container">
              <div className="absolute inset-y-0 left-0 pl-4 pr-2 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate2-400 group-focus-within:text-brand-500 transition-colors" />
              </div>
              <input 
                placeholder='Search "AC repair", "cleaning", "plumber"...' 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.length > 0);
                }}
                onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                className="w-full bg-slate2-50 border border-slate2-200 rounded-2xl pl-10 pr-24 py-3 text-sm outline-none text-slate-800 placeholder:text-slate2-400 font-medium shadow-sm group-focus-within:border-brand-500 group-focus-within:bg-white group-focus-within:shadow-lg group-focus-within:shadow-brand/20 transition-all"
              />
              <button 
                onClick={() => {
                  if (searchQuery.trim()) {
                    setShowSearchResults(true);
                  }
                }}
                className="absolute inset-y-0 right-0 flex items-center"
              >
                <div className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold px-5 py-2 text-sm transition-all rounded-xl mr-1 my-1.5 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Search</span>
                </div>
              </button>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate2-200 max-h-[400px] overflow-y-auto z-[300]">
                  {SERVICES.filter(s => 
                    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.subs.some(sub => sub.n.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).length > 0 ? (
                    <div className="p-2">
                      <p className="text-xs font-bold text-slate2-400 px-3 py-2 uppercase tracking-wider">Services</p>
                      {SERVICES.filter(s => 
                        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.subs.some(sub => sub.n.toLowerCase().includes(searchQuery.toLowerCase()))
                      ).map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSelSvc(s);
                            setBStep(1);
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1);
                            setBData({
                              ...bData,
                              sub: s.subs[0],
                              pro: PROS[0].name,
                              date: tomorrow.toLocaleDateString('en-IN'),
                              time: "10:00 AM"
                            });
                            setIsBookModalOpen(true);
                            setSearchQuery("");
                            setShowSearchResults(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-brand-50 rounded-xl transition-all text-left"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                            <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate2-900 text-sm">{s.name}</p>
                            <p className="text-xs text-slate2-400 truncate">{s.subs[0]?.n} • {s.price}</p>
                          </div>
                          <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-1 rounded-full font-semibold uppercase">{s.cat}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <Search className="w-8 h-8 mx-auto mb-2 text-slate2-300" />
                      <p className="text-sm text-slate2-500">No services found for "{searchQuery}"</p>
                      <p className="text-xs text-slate2-400 mt-1">Try "AC repair", "cleaning", or "plumber"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Profile Section */}
          <div className="hidden lg:flex items-center gap-5">
            <div className="flex items-center gap-4">
              {!isLoaded ? (
                <div className="h-10 w-40 animate-pulse rounded-xl bg-slate2-100" />
              ) : currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-3 rounded-xl border border-slate2-200 bg-white px-4 py-2.5 hover:border-brand-500 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {currentUser.init}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-bold text-slate2-900">{currentUser.name}</span>
                      <span className="text-[10px] text-slate2-400">My Account</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate2-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                      />
                      <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate2-100 overflow-hidden z-20">
                        <div className="bg-gradient-to-br from-brand-600 to-brand-500 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold">
                              {currentUser.init}
                            </div>
                            <div>
                              <div className="font-bold text-white">{currentUser.name}</div>
                              <div className="text-sm text-brand-100">{currentUser.email}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <button
                            onClick={() => { setView('dash'); setDashPanel('overview'); setIsProfileDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate2-50 transition-colors text-left"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate2-400" />
                            <div>
                              <div className="text-sm font-bold text-slate2-900">Dashboard</div>
                              <div className="text-xs text-slate2-400">View overview</div>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => { setView('dash'); setDashPanel('orders'); setIsProfileDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate2-50 transition-colors text-left"
                          >
                            <ShoppingBag className="w-4 h-4 text-slate2-400" />
                            <div>
                              <div className="text-sm font-bold text-slate2-900">My Orders</div>
                              <div className="text-xs text-slate2-400">Track bookings</div>
                            </div>
                          </button>
                          
                          <button
                            onClick={() => { setView('dash'); setDashPanel('profile'); setIsProfileDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate2-50 transition-colors text-left"
                          >
                            <User className="w-4 h-4 text-slate2-400" />
                            <div>
                              <div className="text-sm font-bold text-slate2-900">My Profile</div>
                              <div className="text-xs text-slate2-400">Manage account</div>
                            </div>
                          </button>
                          
                          <div className="border-t border-slate2-100 my-2" />
                          
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4 text-red-500" />
                            <div>
                              <div className="text-sm font-bold text-red-600">Sign Out</div>
                              <div className="text-xs text-slate2-400">Log out of account</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button onClick={openAuth} className="flex flex-col items-center gap-1 text-slate2-600 hover:text-brand-600 transition-all group">
                  <div className="p-1.5 rounded-lg group-hover:bg-brand-50 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate2-500 group-hover:text-brand-600">Account</span>
                </button>
              )}
              <button 
                onClick={() => {
                  if(!currentUser) { setIsAuthModalOpen(true); showToast("Sign in to view orders"); }
                  else { setView('dash'); setDashPanel('orders'); }
                }} 
                className="flex flex-col items-center gap-1 text-slate2-600 hover:text-brand-600 transition-all group"
              >
                <div className="p-1.5 rounded-lg group-hover:bg-brand-50 transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-slate2-500 group-hover:text-brand-600">Orders</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Icons - Only icons visible */}
          <div className="flex lg:hidden items-center gap-1">
            {!isLoaded ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-slate2-100" />
            ) : currentUser ? (
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate2-50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {currentUser.init}
                </div>
              </button>
            ) : (
              <button onClick={openAuth} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate2-50 transition-all">
                <User className="w-5 h-5 text-slate2-600" />
              </button>
            )}
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Bottom Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[300] lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-slate2-100 p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate2-900">Menu</h3>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate2-100 transition-all"
              >
                <X className="w-5 h-5 text-slate2-600" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Search in Mobile Menu */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate2-400" />
                </div>
                <input 
                  placeholder='Search services...' 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate2-50 border border-slate2-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-brand-500 transition-all"
                />
              </div>
              
              {/* Location */}
              <button className="w-full flex items-center gap-3 p-3 bg-slate2-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-rose-500" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate2-400">Deliver To</p>
                  <p className="font-bold text-slate2-900">Ranchi, Jharkhand</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate2-400 ml-auto" />
              </button>
              
              {/* Menu Items */}
              {currentUser ? (
                <>
                  <button
                    onClick={() => { setView('dash'); setDashPanel('overview'); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate2-50 rounded-xl transition-all"
                  >
                    <LayoutDashboard className="w-5 h-5 text-slate2-400" />
                    <span className="font-bold text-slate2-900">Dashboard</span>
                  </button>
                  
                  <button
                    onClick={() => { setView('dash'); setDashPanel('orders'); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate2-50 rounded-xl transition-all"
                  >
                    <ShoppingBag className="w-5 h-5 text-slate2-400" />
                    <span className="font-bold text-slate2-900">My Orders</span>
                  </button>
                  
                  <button
                    onClick={() => { setView('dash'); setDashPanel('profile'); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate2-50 rounded-xl transition-all"
                  >
                    <User className="w-5 h-5 text-slate2-400" />
                    <span className="font-bold text-slate2-900">My Profile</span>
                  </button>
                  
                  <div className="border-t border-slate2-100 pt-4">
                    <button
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <LogOut className="w-5 h-5 text-red-500" />
                      <span className="font-bold text-red-600">Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => { openAuth(); setIsMobileMenuOpen(false); }}
                  className="w-full bg-brand-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Profile Bottom Sheet */}
      {isProfileDropdownOpen && (
        <div className="fixed inset-0 z-[300] lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsProfileDropdownOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-br from-brand-600 to-brand-500 p-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold">
                  {currentUser?.init}
                </div>
                <div>
                  <div className="font-bold text-white text-lg">{currentUser?.name}</div>
                  <div className="text-sm text-brand-100">{currentUser?.email}</div>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              <button
                onClick={() => { setView('dash'); setDashPanel('overview'); setIsProfileDropdownOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate2-50 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5 text-slate2-400" />
                <span className="font-bold text-slate2-900">Dashboard</span>
              </button>
              
              <button
                onClick={() => { setView('dash'); setDashPanel('orders'); setIsProfileDropdownOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate2-50 transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-slate2-400" />
                <span className="font-bold text-slate2-900">My Orders</span>
              </button>
              
              <button
                onClick={() => { setView('dash'); setDashPanel('profile'); setIsProfileDropdownOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate2-50 transition-colors"
              >
                <User className="w-5 h-5 text-slate2-400" />
                <span className="font-bold text-slate2-900">My Profile</span>
              </button>
              
              <div className="border-t border-slate2-100 my-2" />
              
              <button
                onClick={() => { handleLogout(); setIsProfileDropdownOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="font-bold text-red-600">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'main' ? (
        <main>
          {/* Hero */}
          <section className="relative h-[260px] sm:h-[380px] md:h-[480px] overflow-hidden bg-slate-900 group">
            {heroSlides.map((s, i) => (
              <div key={i} className={`hero-slide ${activeSlide === i ? 'active' : ''}`}>
                <img src={s.img} alt={s.name} className="h-full w-full object-cover transition-transform duration-[10000ms] group-hover:scale-110" loading={i === 0 ? "eager" : "lazy"} />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to right, rgba(10,20,15,0.80) 45%, rgba(0,0,0,0.20) 100%)" }}
                />
                <div className="absolute inset-0 flex items-center max-w-7xl mx-auto px-4 sm:px-5">
                  <div className="slide-content max-w-2xl">
                    <div className="hidden sm:inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white/90 text-xs font-bold tracking-widest uppercase mb-5">
                      <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse"></span>
                      50,000+ Happy Customers
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-3 sm:mb-6 leading-[1.15]">
                      {i === 0 ? <>Professional <span className="text-brand-400">Home Services</span><br className="hidden sm:block"/>at Your Doorstep</> : s.name}
                    </h1>
                    <p className="hidden sm:block text-white/70 text-base md:text-xl mb-6 md:mb-8 max-w-lg leading-relaxed font-medium">{s.desc}</p>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                      <button onClick={() => openBooking(s.id)} className="bg-brand-500 text-white font-bold px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl transition-all hover:-translate-y-1 shadow-brand text-sm sm:text-lg select-none">Book Now</button>
                      <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold px-6 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-lg transition-all hover:bg-white/20 select-none">Explore All</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Slider Controls */}
            <div className="absolute bottom-4 sm:bottom-10 right-4 sm:right-10 flex gap-2 sm:gap-3 z-10">
              <button onClick={() => setActiveSlide((activeSlide - 1 + heroSlides.length) % heroSlides.length)} className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all group/btn">
                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 group-hover/btn:-translate-x-0.5 transition-transform" />
              </button>
              <button onClick={() => setActiveSlide((activeSlide + 1) % heroSlides.length)} className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all group/btn">
                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
            {/* Slide Indicators */}
            <div className="absolute left-4 sm:left-10 bottom-4 sm:bottom-10 flex gap-1.5 sm:gap-2 z-10">
              {heroSlides.map((_, idx) => (
                <div key={idx} className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ${activeSlide === idx ? 'w-6 sm:w-10 bg-brand-500' : 'w-1.5 sm:w-2 bg-white/30'}`} />
              ))}
            </div>
          </section>

          {/* Trust Bar */}
          <div className="bg-white border-b border-slate2-100 py-3.5 px-4">
            <div ref={trustBarRef} className="max-w-7xl mx-auto flex items-center justify-center gap-10 flex-wrap">
              {[
                {
                  id: "bg",
                  label: "Background Verified",
                  hint: "Every professional is verified with identity & background checks.",
                  icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
                },
                {
                  id: "ins",
                  label: "Fully Insured Professionals",
                  hint: "Work is covered with insurance for extra peace of mind.",
                  icon: <ShieldCheck className="w-4 h-4 text-brand-500" />,
                },
                {
                  id: "sat",
                  label: "100% Satisfaction Guarantee",
                  hint: "Not happy? We’ll fix it or refund as per policy.",
                  icon: <Award className="w-4 h-4 text-amber-500" />,
                },
                {
                  id: "res",
                  label: "Free Re-service Promise",
                  hint: "If something isn’t right, request a free re-service within the window.",
                  icon: <RefreshCcw className="w-4 h-4 text-blue-500" />,
                },
                {
                  id: "pay",
                  label: "Secure Payments",
                  hint: "Payments are processed securely and your details stay protected.",
                  icon: <CreditCard className="w-4 h-4 text-purple-500" />,
                },
              ].map((t) => {
                const open = trustOpenId === t.id;
                return (
                  <div key={t.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setTrustOpenId(open ? null : t.id)}
                      className="flex items-center gap-2.5 text-sm font-bold text-slate2-700 tracking-tight hover:text-slate2-900 transition-colors"
                      aria-haspopup="dialog"
                      aria-expanded={open}
                    >
                      {t.icon}
                      <span className="underline decoration-dotted underline-offset-4">{t.label}</span>
                    </button>

                    {open && (
                      <div
                        role="dialog"
                        aria-label={t.label}
                        className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+10px)] z-50 w-[260px] rounded-xl border border-slate2-200 bg-white shadow-xl p-3 text-xs font-semibold text-slate2-700"
                      >
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white border-l border-t border-slate2-200" />
                        <div className="text-slate2-900 text-sm font-bold mb-1">{t.label}</div>
                        <div className="leading-relaxed">{t.hint}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Services Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-5 py-8 sm:py-12">
            <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-4 sm:pb-5 mb-6 sm:mb-8 no-scrollbar scroll-smooth -mx-4 sm:mx-0 px-4 sm:px-0">
              {[
                { id: "all", label: "All", icon: <HomeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                { id: "cleaning", label: "Cleaning", icon: <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                { id: "ac", label: "AC", icon: <Snowflake className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                { id: "plumbing", label: "Plumbing", icon: <Droplet className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                { id: "electrical", label: "Electrical", icon: <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                { id: "painting", label: "Painting", icon: <Paintbrush className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                { id: "salon", label: "Salon", icon: <Scissors className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                { id: "pest", label: "Pest", icon: <Bug className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
                { id: "furniture", label: "Carpentry", icon: <Lamp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
              ].map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setSelectedCat(c.id)} 
                  className={`category-tab shrink-0 flex items-center gap-1.5 sm:gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold border whitespace-nowrap select-none ${
                    selectedCat === c.id 
                    ? 'bg-brand-600 border-brand-600 text-white shadow-brand scale-105' 
                    : 'bg-white border-slate2-200 text-slate2-700'
                  }`}
                >
                  <span className={selectedCat === c.id ? 'text-white' : 'text-slate2-400'}>
                    {c.icon}
                  </span>
                  {c.label}
                </button>
              ))}
            </div>

            {/* Section Header */}
            <div className="flex items-end justify-between mb-5 sm:mb-7">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-brand-600 uppercase tracking-widest mb-1 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2">
                  <span className="inline-block w-3 sm:w-4 h-0.5 bg-brand-500"></span>Popular Services
                </p>
                <h2 className="font-display text-xl sm:text-3xl md:text-4xl font-bold text-slate2-900">
                  Top <em className="not-italic text-brand-600">Home Services</em>
                </h2>
              </div>
              <button className="hidden md:flex items-center gap-1.5 border-2 border-slate2-200 hover:border-brand-500 hover:text-brand-600 rounded-xl px-4 py-2.5 text-sm font-bold text-slate2-600 transition-all">View All →</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredServices.map(s => (
                <div key={s.id} className="service-card bg-white rounded-xl sm:rounded-[12px] overflow-hidden border border-slate2-100 flex flex-col">
                  <div className="relative w-full h-36 sm:h-[200px] overflow-hidden rounded-t-xl sm:rounded-t-[12px]">
                    <img src={s.img} alt={s.name} className="service-card-image w-full h-full object-cover block" loading="lazy" />
                    {s.tag && (
                      <div
                        className="absolute top-2 sm:top-[10px] left-2 sm:left-[10px] text-white text-[10px] sm:text-[11px] font-bold uppercase px-2 sm:px-[10px] py-0.5 sm:py-[4px] rounded-full"
                        style={{
                          backgroundColor: TAG_COLORS[s.tag] || "#10B97A",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {s.tag}
                      </div>
                    )}
                    <div
                      className="absolute bottom-[10px] left-[10px] text-white text-[11px] font-semibold px-[10px] py-[4px] rounded-[6px] flex items-center gap-1.5"
                      style={{ background: "rgba(0,0,0,0.65)" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>{s.time}</span>
                    </div>
                  </div>
                  <div className="px-4 pt-4 pb-4 flex flex-col flex-1">
                    <h3 className="font-bold text-slate2-900 mb-1">{s.name}</h3>
                    <p className="text-xs text-slate2-400 mb-4 h-8 line-clamp-2 leading-relaxed">{s.desc}</p>
                    <div className="flex items-center justify-between mb-4 mt-auto">
                      <span className="font-bold text-brand-700">Starting {s.price}</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-slate2-600">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                        {s.rating} <span className="text-slate2-300">({s.rev})</span>
                      </span>
                    </div>
                    <button onClick={() => openBooking(s.id)} className="service-book-btn w-full bg-brand-600 text-white font-bold py-2.5 rounded-xl text-xs">
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Professionals */}
          <div className="bg-white px-5 py-16 border-y border-slate2-100">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">Verified Experts</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-slate2-900">Meet Our Top Professionals</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {PROS.map((pro, i) => (
                  <div key={i} className="bg-slate2-50 border border-slate2-100 rounded-2xl p-5 text-center">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] mx-auto mb-3" style={{ borderColor: "#10B97A" }}>
                      <img src={pro.img} alt={pro.name} className="w-full h-full object-cover block" loading="lazy" />
                    </div>
                    <div className="text-[15px] font-bold text-slate2-900">{pro.name}</div>
                    <div className="text-xs text-slate2-500 mt-1">{pro.spec}</div>
                    <div className="text-xs text-brand-600 font-bold mt-2">{pro.rating} rating • {pro.jobs} jobs</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-brand-700 to-brand-500 py-16 px-5">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <p className="text-xs font-bold text-brand-200 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-0.5 bg-brand-300"></span>Simple Process<span className="inline-block w-4 h-0.5 bg-brand-300"></span>
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                  How <em className="not-italic text-accent-300">ServiceHub</em> Works
                </h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative">
                <div className="hidden lg:block absolute top-8 left-[18%] right-[18%] h-0.5 bg-white/15"></div>
                <div className="text-center relative z-10 group">
                  <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:bg-white/25 transition-all duration-500 shadow-lg">
                    <Search className="w-7 h-7 text-white" />
                  </div>
                  <div className="font-display text-lg font-bold text-white mb-2">1. Browse</div>
                  <div className="text-sm text-brand-100/70 leading-relaxed font-medium">Choose from 100+ home services with clear pricing</div>
                </div>
                <div className="text-center relative z-10 group">
                  <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:bg-white/25 transition-all duration-500 shadow-lg">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div className="font-display text-lg font-bold text-white mb-2">2. Schedule</div>
                  <div className="text-sm text-brand-100/70 leading-relaxed font-medium">Pick date, time & preferred professional</div>
                </div>
                <div className="text-center relative z-10 group">
                  <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:bg-white/25 transition-all duration-500 shadow-lg">
                    <HomeIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="font-display text-lg font-bold text-white mb-2">3. We Arrive</div>
                  <div className="text-sm text-brand-100/70 leading-relaxed font-medium">Verified expert arrives on time at your door</div>
                </div>
                <div className="text-center relative z-10 group">
                  <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:bg-white/25 transition-all duration-500 shadow-lg">
                    <Star className="w-7 h-7 text-white fill-current" />
                  </div>
                  <div className="font-display text-lg font-bold text-white mb-2">4. Quality Job</div>
                  <div className="text-sm text-brand-100/70 leading-relaxed font-medium">Pay securely after you&apos;re happy with the work</div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-slate2-50 py-16 px-5">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-0.5 bg-brand-500"></span>Reviews<span className="inline-block w-4 h-0.5 bg-brand-500"></span>
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-slate2-900">
                  What Customers <em className="not-italic text-brand-600">Say</em>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {TESTIS.map((t, i) => (
                  <div key={i} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 relative border border-slate2-100 group">
                    <div className="flex gap-1 mb-6">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-amber-400 fill-current" />)}
                    </div>
                    <p className="text-slate2-600 font-medium leading-relaxed mb-8 italic">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-bold text-white shrink-0"
                        style={{ background: t.color }}
                      >
                        {t.av}
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-slate2-900 leading-tight">{t.name}</div>
                        <div className="text-[12px] text-slate2-500 mt-1">{t.loc}</div>
                        <div className="inline-block text-[11px] mt-2 px-2 py-0.5 rounded" style={{ background: "#e6f9f2", color: "#10B97A" }}>
                          {t.svc}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      ) : (
        <div className="flex max-w-7xl mx-auto w-full flex-1">
            <aside className="w-64 bg-slate2-900 min-h-full p-6 hidden md:block">
                <div className="text-white mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-xl font-bold mb-3">{currentUser?.init}</div>
                    <div className="font-bold truncate">{currentUser?.name}</div>
                    <div className="text-xs text-slate2-400 truncate">{currentUser?.email}</div>
                </div>
                <nav className="space-y-2">
                    {['overview', 'orders', 'profile', 'book-service', 'my-reviews'].map(p => (
                        <button key={p} onClick={() => setDashPanel(p)} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${dashPanel === p ? 'bg-white/10 text-white' : 'text-slate2-400 hover:text-white'}`}>
                            {p === 'book-service' ? 'BOOK SERVICE' : p === 'my-reviews' ? 'MY REVIEWS' : p.toUpperCase()}
                        </button>
                    ))}
                    <button onClick={handleLogout} className="w-full mt-8 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-bold transition-all">
                        LOGOUT
                    </button>
                </nav>
            </aside>
            <main className="flex-1 p-6">
                {dashPanel === 'overview' && (
                    <div>
                        <h2 className="text-2xl font-bold text-slate2-900 mb-6 font-display">Dashboard Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-white p-6 rounded-xl shadow-card">
                                <h3 className="font-bold text-slate2-900 mb-2">Total Orders</h3>
                                <p className="text-3xl font-bold text-brand-600">{orders.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-card">
                                <h3 className="font-bold text-slate2-900 mb-2">Pending Services</h3>
                                <p className="text-3xl font-bold text-orange-600">2</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-card">
                                <h3 className="font-bold text-slate2-900 mb-2">Completed</h3>
                                <p className="text-3xl font-bold text-green-600">3</p>
                            </div>
                        </div>
                        {/* Generate Prompt Button in Overview */}
                        <button
                            onClick={() => {
                                if (orders.length > 0) {
                                    const lastOrder = orders[0];
                                    const prompt = `🛠️ ServiceHub Booking Summary

Service: ${lastOrder.service}
Sub-service: ${lastOrder.sub}
Price: ₹${lastOrder.price}
Date: ${lastOrder.date}
Time: ${lastOrder.time}
Professional: ${lastOrder.pro}
Status: ${lastOrder.status}
Order ID: ${lastOrder.id}

---
Hello! I have booked a ${lastOrder.service} service (${lastOrder.sub}) through ServiceHub. The service is scheduled for ${lastOrder.date} at ${lastOrder.time}. Please confirm the booking details and let me know if any additional information is needed. Thank you! 🙏`;
                                    setGeneratedPrompt(prompt);
                                    setIsPromptModalOpen(true);
                                } else {
                                    showToast("No orders to generate prompt");
                                }
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
                        >
                            <Wand2 className="w-4 h-4" />
                            ✨ Generate Prompt
                        </button>
                    </div>
                )}
                {dashPanel === 'orders' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate2-900 mb-4 sm:mb-6 font-display">Your Orders</h2>
                        <div className="space-y-3 sm:space-y-4">
                            {orders.map(o => (
                                 <div key={o.id} className="bg-white p-3 sm:p-4 rounded-xl shadow-card flex items-center gap-3 sm:gap-4 border border-slate2-100">
                                     <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0">
                                         <img src={o.img} alt={o.service} className="h-full w-full object-cover" loading="lazy" />
                                     </div>
                                     <div className="flex-1 min-w-0">
                                         <div className="font-bold text-slate2-900 text-sm sm:text-base truncate">{o.service}</div>
                                         <div className="text-[10px] sm:text-xs text-slate2-400">{o.date} · {o.time}</div>
                                     </div>
                                     <div className="text-right flex flex-col items-end gap-1.5 sm:gap-2">
                                         <div className="font-bold text-slate-900 text-sm sm:text-base">₹{o.price}</div>
                                         <div className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${o.status === 'reviewed' ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700'}`}>
                                             {o.status === 'reviewed' ? '✓ Reviewed' : o.status}
                                         </div>
                                         {(o.status === 'confirmed' || o.status === 'completed') && o.status !== 'reviewed' && (
                                             <button
                                                 onClick={() => {
                                                     setFeedbackOrderId(o.id);
                                                     setIsFeedbackModalOpen(true);
                                                 }}
                                                 className="text-[9px] sm:text-[10px] bg-amber-100 text-amber-700 font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full hover:bg-amber-200 transition-all flex items-center gap-1"
                                             >
                                                 <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                 Feedback
                                             </button>
                                         )}
                                     </div>
                                </div>
                            ))}
                            {orders.length === 0 && <div className="text-center py-16 sm:py-20 text-slate2-400 text-sm sm:text-base">No orders yet.</div>}
                        </div>
                    </div>
                )}
                {dashPanel === 'profile' && (
                    <div>
                         <h2 className="text-xl sm:text-2xl font-bold text-slate2-900 mb-4 sm:mb-6 font-display">My Profile</h2>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                             {/* Profile Form */}
                             <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-card">
                                 {/* Photo Section */}
                                 <div className="flex flex-col items-center mb-4 sm:mb-6">
                                     <div className="relative group">
                                         {profilePhoto ? (
                                             <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-brand-100">
                                                 <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                             </div>
                                         ) : (
                                             <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-brand">
                                                 {currentUser?.init}
                                             </div>
                                         )}
                                         <button
                                             onClick={() => fileInputRef.current?.click()}
                                             className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                         >
                                             <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                         </button>
                                     </div>
                                     <input
                                         ref={fileInputRef}
                                         type="file"
                                         accept="image/*"
                                         className="hidden"
                                         onChange={(e) => {
                                             const file = e.target.files?.[0];
                                             if (file) {
                                                 const reader = new FileReader();
                                                 reader.onloadend = () => {
                                                     setProfilePhoto(reader.result as string);
                                                 };
                                                 reader.readAsDataURL(file);
                                             }
                                         }}
                                     />
                                     <button
                                         onClick={() => fileInputRef.current?.click()}
                                         className="mt-2 sm:mt-3 text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                     >
                                         <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                         Upload Photo
                                     </button>
                                     {profilePhoto && (
                                         <button
                                             onClick={() => setProfilePhoto(null)}
                                             className="mt-1 text-[10px] sm:text-xs text-red-500 hover:text-red-600"
                                         >
                                             Remove Photo
                                         </button>
                                     )}
                                 </div>

                                 {/* Edit Fields */}
                                 <div className="space-y-4">
                                     <div>
                                         <label className="text-xs font-bold text-slate2-500 mb-1 block">Full Name</label>
                                         <input
                                             type="text"
                                             value={profileName}
                                             onChange={(e) => setProfileName(e.target.value)}
                                             placeholder={currentUser?.name || "Enter your name"}
                                             className="w-full border border-slate2-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-all"
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-slate2-500 mb-1 block">Display Name / Nickname</label>
                                         <input
                                             type="text"
                                             value={profileNickname}
                                             onChange={(e) => setProfileNickname(e.target.value)}
                                             placeholder="How should we call you?"
                                             className="w-full border border-slate2-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-all"
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-slate2-500 mb-1 block">Phone Number</label>
                                         <input
                                             type="tel"
                                             value={profilePhone}
                                             onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                             placeholder="10-digit mobile number"
                                             className="w-full border border-slate2-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-all"
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-slate2-500 mb-1 block">City</label>
                                         <select
                                             value={profileCity}
                                             onChange={(e) => setProfileCity(e.target.value)}
                                             className="w-full border border-slate2-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-all bg-white"
                                         >
                                             <option value="Ranchi">Ranchi</option>
                                             <option value="Patna">Patna</option>
                                             <option value="Dhanbad">Dhanbad</option>
                                             <option value="Jamshedpur">Jamshedpur</option>
                                             <option value="Bokaro">Bokaro</option>
                                             <option value="Hazaribagh">Hazaribagh</option>
                                         </select>
                                     </div>
                                     <div>
                                         <label className="text-xs font-bold text-slate2-500 mb-1 flex justify-between">
                                             <span>Bio</span>
                                             <span className="text-slate2-400">{profileBio.length}/150</span>
                                         </label>
                                         <textarea
                                             value={profileBio}
                                             onChange={(e) => setProfileBio(e.target.value.slice(0, 150))}
                                             placeholder="Tell us a little about yourself..."
                                             className="w-full border border-slate2-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500 transition-all resize-none h-20"
                                         />
                                     </div>
                                     <div className="flex items-center gap-3">
                                         <button
                                             onClick={() => {
                                                 setProfileSaved(true);
                                                 setTimeout(() => setProfileSaved(false), 2000);
                                                 showToast("Profile updated successfully! ✅");
                                             }}
                                             className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
                                         >
                                             <Edit3 className="w-4 h-4" />
                                             Save Changes
                                         </button>
                                         {profileSaved && (
                                             <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                                                 <CheckCircle2 className="w-4 h-4" />
                                                 Saved
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             </div>

                             {/* Profile Preview Card */}
                             <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-card">
                                 <h3 className="text-[10px] sm:text-sm font-bold text-slate2-500 uppercase tracking-widest mb-3 sm:mb-4">Profile Preview</h3>
                                 <div className="bg-gradient-to-br from-brand-50 to-accent-50 rounded-xl p-4 sm:p-6 border border-brand-100">
                                     <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                         {profilePhoto ? (
                                             <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-white shadow-md">
                                                 <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                             </div>
                                         ) : (
                                             <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-lg sm:text-xl font-bold text-white shadow-brand">
                                                 {currentUser?.init}
                                             </div>
                                         )}
                                         <div>
                                             <p className="font-bold text-slate2-900 text-base sm:text-lg">{profileName || currentUser?.name || "Your Name"}</p>
                                             {profileNickname && <p className="text-xs sm:text-sm text-brand-600 font-semibold">"{profileNickname}"</p>}
                                         </div>
                                     </div>
                                     <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                                         {profilePhone && (
                                             <div className="flex items-center gap-2 text-slate2-600">
                                                 <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500" />
                                                 +91 {profilePhone}
                                             </div>
                                         )}
                                         <div className="flex items-center gap-2 text-slate2-600">
                                             <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500" />
                                             {profileCity}
                                         </div>
                                         <div className="flex items-center gap-2 text-slate2-600">
                                             <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500" />
                                             Member since {new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                         </div>
                                     </div>
                                     {profileBio && (
                                         <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-brand-200">
                                             <p className="text-xs sm:text-sm text-slate2-600 italic">"{profileBio}"</p>
                                         </div>
                                     )}
                                 </div>
                             </div>
                         </div>
                    </div>
                )}
                {dashPanel === 'book-service' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate2-900 mb-4 sm:mb-6 font-display">Book a Service</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {SERVICES.map(s => (
                                <div key={s.id} className="bg-white rounded-xl shadow-card overflow-hidden border border-slate2-100 hover:shadow-lg transition-all">
                                    <div className="relative h-24 sm:h-32 overflow-hidden">
                                        <img src={s.img} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
                                    </div>
                                    <div className="p-3 sm:p-4">
                                        <h3 className="font-bold text-slate2-900 text-xs sm:text-sm mb-1 truncate">{s.name}</h3>
                                        <p className="text-[10px] sm:text-xs text-brand-600 font-semibold mb-2 sm:mb-3">{s.price}</p>
                                        <button
                                            onClick={() => {
                                                setSelSvc(s);
                                                setBStep(1);
                                                const tomorrow = new Date();
                                                tomorrow.setDate(tomorrow.getDate() + 1);
                                                setBData({
                                                    ...bData,
                                                    sub: s.subs[0],
                                                    pro: PROS[0].name,
                                                    date: tomorrow.toLocaleDateString('en-IN'),
                                                    time: "10:00 AM"
                                                });
                                                setIsBookModalOpen(true);
                                            }}
                                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2 rounded-lg text-xs transition-all"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {dashPanel === 'my-reviews' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate2-900 mb-4 sm:mb-6 font-display">My Reviews</h2>
                        <div className="space-y-3 sm:space-y-4">
                            {feedbacks.map((f, i) => {
                                const order = orders.find(o => o.id === f.orderId);
                                return (
                                    <div key={i} className="bg-white p-3 sm:p-4 rounded-xl shadow-card border border-slate2-100">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            {order && (
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0">
                                                    <img src={order.img} alt={order.service} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
                                                    <p className="font-bold text-slate2-900 text-sm sm:text-base truncate">{order?.service || "Service"}</p>
                                                    <span className="text-[10px] sm:text-xs text-slate2-400 shrink-0">{f.createdAt}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-1.5 sm:mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] sm:text-xs text-slate2-500">Service:</span>
                                                        <div className="flex gap-0.5">
                                                            {[1,2,3,4,5].map(s => (
                                                                <Star key={s} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${s <= f.stars ? 'text-amber-400 fill-amber-400' : 'text-slate2-300'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] sm:text-xs text-slate2-500">Worker:</span>
                                                        <div className="flex gap-0.5">
                                                            {[1,2,3,4,5].map(s => (
                                                                <Star key={s} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${s <= f.workerStars ? 'text-amber-400 fill-amber-400' : 'text-slate2-300'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                {f.comment && (
                                                    <p className="text-xs sm:text-sm text-slate2-600 mb-1.5 sm:mb-2 italic line-clamp-2">"{f.comment}"</p>
                                                )}
                                                {f.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {f.tags.map(tag => (
                                                            <span key={tag} className="text-[9px] sm:text-[10px] bg-brand-100 text-brand-700 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {feedbacks.length === 0 && (
                                <div className="text-center py-16 sm:py-20 text-slate2-400">
                                    <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                                    <p className="text-sm sm:text-base">No reviews yet.</p>
                                    <p className="text-[10px] sm:text-xs mt-1">Complete a service and leave feedback!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate2-900 pt-14 pb-8 px-5 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-1">
              <div className="font-display text-3xl font-bold text-white mb-6 tracking-tight">Service<span className="text-brand-400">Hub</span></div>
              <p className="text-sm text-slate2-400 leading-relaxed mb-8 max-w-sm font-medium">Professional home services delivered to your door. Trusted by 50,000+ households for quality and reliability.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  aria-label="Instagram"
                  onClick={() => showToast("Instagram link coming soon!")}
                  className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-500 hover:border-brand-500 transition-all duration-300"
                >
                  <Instagram className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="Facebook"
                  onClick={() => showToast("Facebook link coming soon!")}
                  className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-500 hover:border-brand-500 transition-all duration-300"
                >
                  <Facebook className="w-5 h-5 fill-current" />
                </button>
                <button
                  type="button"
                  aria-label="Twitter"
                  onClick={() => showToast("Twitter link coming soon!")}
                  className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-500 hover:border-brand-500 transition-all duration-300"
                >
                  <Twitter className="w-5 h-5 fill-current" />
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-7">Popular Services</h4>
              <ul className="space-y-4 text-sm font-medium text-slate2-400">
                {SERVICES.slice(0, 5).map(s => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => openBooking(s.id)}
                      className="w-full text-left hover:text-brand-400 cursor-pointer transition-all flex items-center gap-2 group"
                    >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate2-700 group-hover:bg-brand-500 transition-colors"></span>
                    {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-7">Our Company</h4>
              <ul className="space-y-4 text-sm font-medium text-slate2-400">
                <li>
                  <button type="button" onClick={() => showToast("About page coming soon!")} className="hover:text-brand-400 cursor-pointer transition-all">
                    About Our Story
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => showToast("Careers page coming soon!")} className="hover:text-brand-400 cursor-pointer transition-all">
                    Career Opportunities
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => showToast("Blog coming soon!")} className="hover:text-brand-400 cursor-pointer transition-all">
                    Service Quality Blog
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => showToast("Partner signup coming soon!")} className="hover:text-brand-400 cursor-pointer transition-all">
                    Become a Partner
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] mb-7">Contact & Support</h4>
              <ul className="space-y-4 text-sm font-medium text-slate2-400">
                <li>
                  <a href="tel:+9118007378423" className="flex items-center gap-3 hover:text-brand-400 transition-all">
                    <PhoneCall className="w-4 h-4 text-brand-500" /> +91 1800-SERVICE
                  </a>
                </li>
                <li>
                  <button type="button" onClick={() => showToast("Help Center coming soon!")} className="hover:text-brand-400 cursor-pointer transition-all">
                    Help Center
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => showToast("Privacy Policy page coming soon!")} className="hover:text-brand-400 cursor-pointer transition-all">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => showToast("Terms & Conditions page coming soon!")} className="hover:text-brand-400 cursor-pointer transition-all">
                    Terms & Conditions
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-[10px] sm:text-xs text-slate2-500 uppercase tracking-[0.1em] font-bold">© 2025 ServiceHub Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-2">
              <span className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] text-slate2-500 font-bold">VISA</span>
              <span className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] text-slate2-500 font-bold">MC</span>
              <span className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] text-slate2-500 font-bold">UPI</span>
              <span className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] text-slate2-500 font-bold">GPAY</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-pulse">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}

