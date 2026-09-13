import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Leaf, ArrowRight, Check, Menu, X, Shield, Sparkles, Cpu, ShoppingBag, Eye, Heart, Star, Send, Instagram, Twitter, Linkedin, Github, Mail } from "lucide-react";
import Shoe3DViewer from "./components/Shoe3DViewer";
import ShoeCarousel from "./components/ShoeCarousel";
import logoBZLI from "../assets/logo/logoBZLI.png";
import * as productsService from "./admin/services/products.service";

type Colorway = "teal" | "red" | "black";

// Awwwards-quality Statistics Count-Up Component
function CountUp({ to, duration = 1500, suffix = "", decimals = 0 }: { to: number; duration?: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(progress * to);
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, [to, duration, hasAnimated]);

  return (
    <span ref={elementRef} className="font-mono">
      {decimals > 0 ? count.toFixed(decimals) : Math.round(count)}
      {suffix}
    </span>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Collections");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"reserve" | "login">("reserve");
  const [email, setEmail] = useState("");
  const [selectedSize, setSelectedSize] = useState<string>("US 9.5");
  const [selectedColor, setSelectedColor] = useState<Colorway>("teal");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [clickedHotspot, setClickedHotspot] = useState<string | null>(null);
  const [isDeconstructed, setIsDeconstructed] = useState(true);
  const [hoveredLayer, setHoveredLayer] = useState<"upper" | "plate" | "midsole" | null>(null);
  const [customLace, setCustomLace] = useState<"neon" | "stealth" | "reflective">("neon");
  const [customSolePattern, setCustomSolePattern] = useState<"speed" | "trail" | "track">("speed");
  const [sustainPhase, setSustainPhase] = useState<"harvest" | "forge" | "circular">("harvest");
  const [activeCity, setActiveCity] = useState<"nyc" | "tokyo" | "london" | "berlin">("tokyo");
  const [colorwayImages, setColorwayImages] = useState<Record<string, string>>({});

  // Pull real per-colorway product photos from the Admin catalog so the
  // Colorway Studio cards show actual product images instead of a filter.
  useEffect(() => {
    productsService.getProducts().then((products) => {
      const byColorway: Record<string, string> = {};
      for (const product of products) {
        if (!byColorway[product.colorway]) byColorway[product.colorway] = product.imageUrl;
      }
      setColorwayImages(byColorway);
    });
  }, []);

  // Premium Animation States
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [activeReview, setActiveReview] = useState(0);
  const [particles] = useState(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 5 + 2,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 10 + 8}s`
    }))
  );

  // Close active hotspots when clicking elsewhere
  useEffect(() => {
    const handleDocumentClick = () => {
      setClickedHotspot(null);
    };
    window.addEventListener("click", handleDocumentClick);
    return () => window.removeEventListener("click", handleDocumentClick);
  }, []);

  // Premium ripple click effect on all buttons
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest("button") as HTMLButtonElement | null;
      if (!btn) return;

      const ripple = document.createElement("span");
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top  = `${e.clientY - rect.top  - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Intersection Observer for Scroll Spy
  useEffect(() => {
    const sectionIds = ["collections", "features", "technology", "color-variants", "performance-stats", "stores", "reservation"];
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -45% 0px",
      threshold: 0.1
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          let linkName = "";
          if (id === "collections") linkName = "Hero";
          else if (id === "features") linkName = "Features";
          else if (id === "technology") linkName = "Technology";
          else if (id === "color-variants") linkName = "Color Variants";
          else if (id === "performance-stats") linkName = "Performance Stats";
          else if (id === "stores") linkName = "Store Locations";
          else if (id === "reservation") linkName = "Reservation";
          
          if (linkName) {
            setActiveTab(linkName);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (link: string) => {
    setActiveTab(link);
    const id = link.toLowerCase().replace(" ", "-");
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleShoeMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxTiltX = 10;
    const maxTiltY = 10;
    setRotateX(((centerY - y) / centerY) * maxTiltX);
    setRotateY(((x - centerX) / centerX) * maxTiltY);
  };

  const handleShoeMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleHotspotClick = (hotspot: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClickedHotspot(clickedHotspot === hotspot ? null : hotspot);
  };

  const navLinks = ["Hero", "Features", "Technology", "Color Variants", "Performance Stats", "Store Locations", "Reservation"];
  const shoeSizes = ["US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 11", "US 12"];

  const handleOpenModal = (type: "reserve" | "login") => {
    setModalType(type);
    setIsModalOpen(true);
    setIsSubmitted(false);
    setEmail("");
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsModalOpen(false);
      }, 2000);
    }
  };

  // Dynamically update the color theme glow color depending on selected colorway
  const getGlowColor = () => {
    if (selectedColor === "teal") return "rgba(45, 212, 191, 0.4)";
    if (selectedColor === "red") return "rgba(239, 68, 68, 0.4)";
    return "rgba(163, 163, 163, 0.4)";
  };

  const getButtonGradient = () => {
    if (selectedColor === "teal") return "from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)]";
    if (selectedColor === "red") return "from-red-500 to-orange-400 hover:from-red-400 hover:to-orange-300 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]";
    return "from-neutral-100 to-neutral-300 hover:from-white hover:to-neutral-100 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]";
  };

  return (
    <div id="hero-root" className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col font-sans select-none">
      {/* Elegant Loading Screen */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-sans select-none"
          >
            <div className="flex flex-col items-center max-w-[280px] w-full px-6 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(45,212,191,0.25)]"
              >
                <img src={logoBZLI} alt="BZ Lifestyle Shoes" className="w-full h-full object-cover" />
              </motion.div>
              
              <div className="w-full bg-neutral-900 h-[3px] rounded-full overflow-hidden mb-4 border border-white/5 relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-400 to-cyan-400"
                  style={{
                    background: selectedColor === "teal"
                      ? "linear-gradient(to right, #0d9488, #2dd4bf)"
                      : selectedColor === "red"
                        ? "linear-gradient(to right, #b91c1c, #f87171)"
                        : "linear-gradient(to right, #a3a3a3, #ffffff)"
                  }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              
              <div className="flex justify-between items-center w-full text-[10px] font-mono text-white uppercase tracking-widest">
                <span>Aero-Stride v2</span>
                <span>{loadingProgress}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Scroll Canvas Background */}
      <div className="fixed inset-0 w-screen h-screen z-0 overflow-hidden bg-black pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(3,4,8,0.85)_100%)] pointer-events-none z-10" />
        <Shoe3DViewer onProgress={setLoadingProgress} onLoaded={() => setIsLoading(false)} />
      </div>

      {/* Cinematic Ambient Glow and Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute -top-[10%] left-[20%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-15 animate-orbit-1 transition-all duration-1000"
          style={{
            background: selectedColor === "teal" ? "#0d9488" : selectedColor === "red" ? "#b91c1c" : "#262626"
          }}
        />
        <div
          className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-15 animate-orbit-2 transition-all duration-1000"
          style={{
            background: selectedColor === "teal" ? "#06b6d4" : selectedColor === "red" ? "#ea580c" : "#404040"
          }}
        />
        <div
          className="absolute -bottom-[10%] left-[10%] w-[500px] h-[500px] rounded-full blur-[130px] opacity-10 animate-orbit-1 transition-all duration-1000"
          style={{
            background: selectedColor === "teal" ? "#14b8a6" : selectedColor === "red" ? "#dc2626" : "#171717"
          }}
        />

        {/* Aurora blobs – additive ambient layer, below content */}
        <div
          className="aurora-blob-1 absolute top-[15%] right-[5%] w-[700px] h-[400px] rounded-full pointer-events-none transition-all duration-1000"
          style={{
            background: selectedColor === "teal"
              ? "radial-gradient(ellipse, rgba(13,148,136,0.06) 0%, transparent 70%)"
              : selectedColor === "red"
                ? "radial-gradient(ellipse, rgba(185,28,28,0.05) 0%, transparent 70%)"
                : "radial-gradient(ellipse, rgba(64,64,64,0.04) 0%, transparent 70%)",
            filter: "blur(40px)"
          }}
        />
        <div
          className="aurora-blob-2 absolute bottom-[20%] left-[8%] w-[600px] h-[350px] rounded-full pointer-events-none transition-all duration-1000"
          style={{
            background: selectedColor === "teal"
              ? "radial-gradient(ellipse, rgba(6,182,212,0.055) 0%, transparent 70%)"
              : selectedColor === "red"
                ? "radial-gradient(ellipse, rgba(234,88,12,0.05) 0%, transparent 70%)"
                : "radial-gradient(ellipse, rgba(38,38,38,0.04) 0%, transparent 70%)",
            filter: "blur(50px)"
          }}
        />
        <div
          className="aurora-blob-3 absolute top-[55%] right-[30%] w-[500px] h-[300px] rounded-full pointer-events-none transition-all duration-1000"
          style={{
            background: selectedColor === "teal"
              ? "radial-gradient(ellipse, rgba(20,184,166,0.04) 0%, transparent 70%)"
              : selectedColor === "red"
                ? "radial-gradient(ellipse, rgba(220,38,38,0.04) 0%, transparent 70%)"
                : "radial-gradient(ellipse, rgba(23,23,23,0.04) 0%, transparent 70%)",
            filter: "blur(60px)"
          }}
        />

        {/* Gradient mesh bloom — additive, cinematic depth */}
        <div
          className="gradient-mesh absolute top-[25%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
          style={{
            background: selectedColor === "teal"
              ? "radial-gradient(ellipse at center, rgba(13,148,136,0.05) 0%, rgba(6,182,212,0.03) 40%, transparent 70%)"
              : selectedColor === "red"
                ? "radial-gradient(ellipse at center, rgba(185,28,28,0.04) 0%, rgba(234,88,12,0.03) 40%, transparent 70%)"
                : "radial-gradient(ellipse at center, rgba(64,64,64,0.03) 0%, transparent 70%)",
          }}
        />

        {/* Floating orb — breathing ambient light */}
        <div
          className="float-orb absolute top-[10%] right-[15%] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: selectedColor === "teal"
              ? "radial-gradient(circle, rgba(45,212,191,0.04) 0%, transparent 70%)"
              : selectedColor === "red"
                ? "radial-gradient(circle, rgba(248,113,113,0.035) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(163,163,163,0.025) 0%, transparent 70%)",
            filter: "blur(30px)"
          }}
        />

        {/* Floating Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bg-white/20 rounded-full animate-drift"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration
            }}
          />
        ))}
      </div>

      {/* Dynamic ambient top border glow matching selected colorway */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] transition-all duration-700 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${getGlowColor()}, transparent)`
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col relative z-10 pt-6 pb-20">

        {/* HEADER / FLOATING NAVIGATION */}
        <motion.header
          id="navbar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full z-50 sticky top-4 mt-2"
        >
          <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 sm:py-2.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {/* Logo */}
            <div className="flex items-center gap-2.5 pl-3 sm:pl-4">
              <div
                className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-700"
                style={{ boxShadow: `0 0 15px ${getGlowColor()}` }}
              >
                <img src={logoBZLI} alt="BZ Lifestyle Shoes" className="w-full h-full object-cover" />
              </div>
              <span className="font-sans font-bold tracking-[0.1em] text-sm text-white uppercase whitespace-nowrap">
                BZ Lifestyle
              </span>
            </div>

            {/* Desktop Nav Links (Pure White text as requested) */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const isActive = activeTab === link;
                return (
                  <button
                    id={`nav-link-${link.toLowerCase()}`}
                    key={link}
                    onClick={() => handleNavClick(link)}
                    className="relative px-4 py-1.5 text-[13px] font-medium text-white hover:opacity-80 transition-all duration-200 cursor-pointer"
                  >
                    <span>{link}</span>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-dot"
                        className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: selectedColor === "teal" ? "#2dd4bf" : selectedColor === "red" ? "#f87171" : "#ffffff",
                          boxShadow: `0 0 8px ${selectedColor === "teal" ? "#2dd4bf" : selectedColor === "red" ? "#f87171" : "#ffffff"}`
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* CTA & Login Actions */}
            <div className="hidden md:flex items-center gap-3 pr-1">
              <button
                id="btn-login-desktop"
                onClick={() => navigate("/admin/login")}
                className="px-5 py-2 text-[13px] font-medium text-white hover:bg-white/5 rounded-full transition-all duration-200 cursor-pointer border border-transparent hover:border-neutral-800"
              >
                Log in
              </button>
              <button
                id="btn-get-started-desktop"
                onClick={() => handleOpenModal("reserve")}
                className={`relative group overflow-hidden bg-gradient-to-r text-black px-5 py-2 rounded-full font-semibold text-[13px] flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${getButtonGradient()}`}
              >
                Reserve Pair
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden pr-1">
              <button
                id="btn-mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-full text-white hover:bg-neutral-800/50 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.header>

        {/* MOBILE DROPDOWN MENU (Pure White text as requested) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-nav-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden z-40 fixed top-20 left-4 right-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  {navLinks.map((link) => (
                    <button
                      id={`mobile-nav-link-${link.toLowerCase()}`}
                      key={link}
                      onClick={() => {
                        handleNavClick(link);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`text-left px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all ${activeTab === link
                          ? "bg-neutral-900 text-white border-l-2 border-white pl-3.5"
                          : "text-white hover:bg-neutral-900/50"
                        }`}
                    >
                      {link}
                    </button>
                  ))}
                </div>
                <div className="h-[1px] bg-neutral-800/80 my-1" />

                <div className="flex flex-col gap-2.5">
                  <button
                    id="btn-login-mobile"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/admin/login");
                    }}
                    className="w-full py-3 rounded-xl border border-neutral-800 text-white text-sm font-medium transition-all text-center"
                  >
                    Log in
                  </button>
                  <button
                    id="btn-get-started-mobile"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleOpenModal("reserve");
                    }}
                    className={`w-full py-3 rounded-xl bg-gradient-to-r text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all ${getButtonGradient()}`}
                  >
                    Reserve Pair
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO SECTION - RESTRUCTURED TO 2-COLUMN LEFT-ALIGNED GRID */}
        <div id="collections" className="flex-grow grid grid-cols-1 lg:grid-cols-12 items-center justify-between mt-10 sm:mt-16 lg:mt-20 gap-12 lg:gap-8 relative">

          {/* Subtle glowing color background focal glow behind the CTA on the left */}
          <div
            className="absolute top-[40%] left-[-10%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full blur-[100px] sm:blur-[150px] pointer-events-none transition-all duration-700"
            style={{
              backgroundColor: selectedColor === "teal"
                ? "rgba(20, 184, 166, 0.04)"
                : selectedColor === "red"
                  ? "rgba(239, 68, 68, 0.04)"
                  : "rgba(255, 255, 255, 0.02)"
            }}
          />

          {/* LEFT SIDE: HEADER, COPY, CTA, CHECKLISTS (ALL ALIGNED TO THE LEFT, WRAPPED IN GLASS CARD) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10 max-w-2xl w-full">
            <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative z-10">
              
              {/* 1. BADGE (Pure white text as requested) */}
              <motion.div
                id="hero-badge"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-xs sm:text-[13px] backdrop-blur-md hover:border-white/25 transition-colors duration-300 cursor-pointer group">
                  <span className="flex items-center gap-1.5 font-semibold text-white">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                    />
                    New Release
                  </span>
                  <span className="w-[1px] h-3 bg-white/20" />
                  <span className="flex items-center gap-1 text-white font-medium">
                    {selectedColor === "teal" && "Aero-Stride v2 Electric Teal is now available"}
                    {selectedColor === "red" && "Aero-Stride v2 Crimson Flame is now available"}
                    {selectedColor === "black" && "Aero-Stride v2 Carbon Obsidian is now available"}
                    <span className="inline-block group-hover:translate-x-0.5 transition-transform duration-200 ml-1">&gt;</span>
                  </span>
                </div>
              </motion.div>

              {/* Bold Product Tagline (Pure White) */}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-white uppercase mb-3 block"
              >
                THE FUTURE OF VELOCITY — DYNAMIC BIO-ADAPTATION
              </motion.span>

              {/* 2. MAIN TITLE (Reduced strictly to exactly 52px on desktop, pure white) */}
              <motion.h1
                id="hero-title"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl xs:text-4xl sm:text-5xl lg:text-[52px] font-medium tracking-tight text-white leading-[1.12] mb-4 select-text"
                style={{ fontSize: "52px", lineHeight: "1.12" }}
              >
                Performance that{" "}
                <span className="font-serif italic font-light text-white pr-1 select-text">
                  grows
                </span>{" "}
                with you.
              </motion.h1>

              {/* Ratings summary (Pure White) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25 }}
                className="flex items-center gap-1.5 mb-5 text-xs text-white"
              >
                <div className="flex text-white">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current text-white" />
                  ))}
                </div>
                <span className="font-bold text-white">4.9</span>
                <span className="text-white opacity-80">(1,240 Reviews)</span>
                <span className="text-white opacity-30">|</span>
                <span className="font-semibold text-white">98% Run Satisfaction</span>
              </motion.div>

              {/* 3. SUBTITLE (Pure white text as requested) */}
              <motion.p
                id="hero-subtitle"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-white font-normal leading-relaxed mb-8 max-w-xl"
              >
                Experience the world's first bio-adaptive running shoe. Engineered with custom-formulated responsive propulsion foam and dynamic fit weave that micro-adjusts to your unique footprint in real-time.
              </motion.p>

              {/* 4. CALL TO ACTION WITH GLOW (CTA has dark/black text, backlight glows appropriately) */}
              <motion.div
                id="hero-cta-group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-8"
              >
                {/* Soft glowing backlight */}
                <div
                  className="absolute inset-0 rounded-full blur-[32px] opacity-40 transition-all duration-700 pointer-events-none scale-90"
                  style={{
                    background: selectedColor === "teal"
                      ? "linear-gradient(to right, #06b6d4, #14b8a6)"
                      : selectedColor === "red"
                        ? "linear-gradient(to right, #ef4444, #f97316)"
                        : "linear-gradient(to right, #ffffff, #d4d4d4)"
                  }}
                />

                {/* Button (CTA text is black as requested by exception) */}
                <button
                  id="btn-start-free-trial"
                  onClick={() => handleOpenModal("reserve")}
                  className={`relative group text-black bg-gradient-to-r px-9 py-4 rounded-full font-bold text-sm sm:text-base flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${getButtonGradient()}`}
                >
                  Reserve Aero-Stride
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 stroke-[2.5]" />
                </button>
              </motion.div>

              {/* 5. CHECKLIST BADGES BELOW CTA (All pure white text as requested) */}
              <motion.div
                id="hero-checklist"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="flex flex-wrap items-center gap-4 sm:gap-6 text-[13px] text-white font-medium"
              >
                <div id="check-no-credit" className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                  <span className="text-white">30-day risk-free runs</span>
                </div>
                <div id="check-14-day" className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                  <span className="text-white">Free express courier shipping</span>
                </div>
                <div id="check-cancel" className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                  <span className="text-white">Lifetime fit promise</span>
                </div>
              </motion.div>

            </div>
          </div>

          {/* RIGHT SIDE: PREMIUM PRODUCT CONFIGURATOR VISUAL SHOWCASE */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative min-h-[460px] lg:min-h-[550px] z-10 w-full pl-0 lg:pl-6">

            {/* Interactive Halo Background Portal */}
            <div
              className="absolute w-[280px] sm:w-[380px] h-[280px] sm:h-[380px] rounded-full border border-white/5 transition-all duration-700 flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${getGlowColor().replace('0.4', '0.08')} 0%, transparent 70%)`
              }}
            >
              <div className="absolute w-[220px] h-[220px] rounded-full border border-dashed border-white/10 animate-[spin_40s_linear_infinite]" />
              <div className="absolute w-[140px] h-[140px] rounded-full border border-white/5" />
            </div>

            {/* Glowing Focal Orb */}
            <div
              className="absolute w-72 h-72 rounded-full blur-[60px] opacity-20 pointer-events-none transition-all duration-700"
              style={{
                backgroundColor: selectedColor === "teal" ? "#2dd4bf" : selectedColor === "red" ? "#ef4444" : "#ffffff"
              }}
            />

            {/* SNEAKER VISUAL CANVAS */}
            <motion.div
              className="relative w-full max-w-[380px] h-[300px] flex items-center justify-center cursor-crosshair group mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              onMouseMove={handleShoeMouseMove}
              onMouseLeave={handleShoeMouseLeave}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Elliptical Shadow underneath the shoe (moves in opposite phase) */}
              <motion.div
                className="absolute bottom-1 w-52 h-4 bg-black/75 rounded-full blur-[12px] pointer-events-none z-0"
                animate={{
                  scale: [1, 0.82, 1],
                  opacity: [0.75, 0.4, 0.75]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut"
                }}
              />

              {/* Floating and Tilting Sneaker Frame */}
              <motion.div
                className="w-full h-full flex items-center justify-center relative z-10"
                animate={{
                  y: [0, -12, 0],
                  rotateX: rotateX,
                  rotateY: rotateY
                }}
                style={{ transformStyle: "preserve-3d" }}
                transition={{
                  y: {
                    repeat: Infinity,
                    duration: 6,
                    ease: "easeInOut"
                  },
                  rotateX: { type: "spring", stiffness: 120, damping: 20 },
                  rotateY: { type: "spring", stiffness: 120, damping: 20 }
                }}
              >
                {/* Product Image with exact Hue-rotation to render electric teal/red/black beautifully */}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedColor}
                    src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=700"
                    alt="BZ Lifestyle Aero-Stride v2 Premium Footwear"
                    referrerPolicy="no-referrer"
                    className="w-[92%] h-[92%] object-contain select-none pointer-events-none"
                    initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 180, damping: 20 }}
                    style={{
                      filter: selectedColor === "teal"
                        ? "grayscale(1) sepia(1) hue-rotate(140deg) saturate(4) brightness(1.1) drop-shadow(0 25px 45px rgba(0,0,0,0.85))"
                        : selectedColor === "red"
                          ? "saturate(1.3) brightness(1.05) drop-shadow(0 25px 45px rgba(0,0,0,0.85))"
                          : "grayscale(1) brightness(0.60) contrast(1.25) drop-shadow(0 25px 45px rgba(0,0,0,0.85))"
                    }}
                  />
                </AnimatePresence>

                {/* Hotspot 1: Heel Cushioning */}
                <div
                  className="absolute top-[52%] left-[18%] w-6 h-6 z-20 group/hotspot flex items-center justify-center cursor-pointer pointer-events-auto"
                  style={{ transform: "translateZ(30px)" }}
                  onMouseEnter={() => setActiveHotspot("heel")}
                  onMouseLeave={() => setActiveHotspot(null)}
                  onClick={(e) => handleHotspotClick("heel", e)}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-5 h-5 bg-white/20 rounded-full animate-ping" />
                    <div className="w-3 h-3 bg-white border border-black rounded-full cursor-pointer shadow-[0_0_8px_rgba(255,255,255,0.8)]" />

                    {/* Tooltip Popup */}
                    <AnimatePresence>
                      {(activeHotspot === "heel" || clickedHotspot === "heel") && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: -45, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-0 w-44 bg-neutral-950/90 backdrop-blur-md border border-neutral-800 p-2.5 rounded-xl pointer-events-none shadow-2xl text-center z-30"
                        >
                          <p className="text-[11px] font-bold text-white uppercase tracking-wider">Aero-Cushion Heel</p>
                          <p className="text-[10px] text-white mt-0.5 leading-normal">+92% Energy Return</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Hotspot 2: Adaptive Mesh */}
                <div
                  className="absolute top-[35%] left-[55%] w-6 h-6 z-20 group/hotspot flex items-center justify-center cursor-pointer pointer-events-auto"
                  style={{ transform: "translateZ(30px)" }}
                  onMouseEnter={() => setActiveHotspot("mesh")}
                  onMouseLeave={() => setActiveHotspot(null)}
                  onClick={(e) => handleHotspotClick("mesh", e)}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-5 h-5 bg-white/20 rounded-full animate-ping" />
                    <div className="w-3 h-3 bg-white border border-black rounded-full cursor-pointer shadow-[0_0_8px_rgba(255,255,255,0.8)]" />

                    {/* Tooltip Popup */}
                    <AnimatePresence>
                      {(activeHotspot === "mesh" || clickedHotspot === "mesh") && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: -45, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-0 w-44 bg-neutral-950/90 backdrop-blur-md border border-neutral-800 p-2.5 rounded-xl pointer-events-none shadow-2xl text-center z-30"
                        >
                          <p className="text-[11px] font-bold text-white uppercase tracking-wider">Bio-Adaptive Mesh</p>
                          <p className="text-[10px] text-white mt-0.5 leading-normal">Molds to your precise arch</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Hotspot 3: Traction Grip */}
                <div
                  className="absolute top-[68%] left-[72%] w-6 h-6 z-20 group/hotspot flex items-center justify-center cursor-pointer pointer-events-auto"
                  style={{ transform: "translateZ(30px)" }}
                  onMouseEnter={() => setActiveHotspot("grip")}
                  onMouseLeave={() => setActiveHotspot(null)}
                  onClick={(e) => handleHotspotClick("grip", e)}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-5 h-5 bg-white/20 rounded-full animate-ping" />
                    <div className="w-3 h-3 bg-white border border-black rounded-full cursor-pointer shadow-[0_0_8px_rgba(255,255,255,0.8)]" />

                    {/* Tooltip Popup */}
                    <AnimatePresence>
                      {(activeHotspot === "grip" || clickedHotspot === "grip") && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: -45, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-0 w-44 bg-neutral-950/90 backdrop-blur-md border border-neutral-800 p-2.5 rounded-xl pointer-events-none shadow-2xl text-center z-30"
                        >
                          <p className="text-[11px] font-bold text-white uppercase tracking-wider">Dynamic Traction</p>
                          <p className="text-[10px] text-white mt-0.5 leading-normal">Wet/dry smart compound</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              </motion.div>
            </motion.div>            {/* FLOATING SPECS CARD AND CONFIGURATION INTERFACES (Pure White text, Glassmorphic Styling) */}
            <div className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">

              {/* Colorway Switcher & Visual Specs */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white block">Active Colorway</span>
                  <span className="text-xs font-semibold text-white">
                    {selectedColor === "teal" && "Electric Teal"}
                    {selectedColor === "red" && "Crimson Flame"}
                    {selectedColor === "black" && "Carbon Obsidian"}
                  </span>
                </div>
                {/* Color pickers */}
                <div className="flex gap-2">
                  <button
                    id="color-teal"
                    onClick={() => setSelectedColor("teal")}
                    className={`w-6 h-6 rounded-full border bg-teal-400 transition-all cursor-pointer ${selectedColor === "teal" ? "border-white ring-2 ring-teal-500/50 scale-110" : "border-transparent"
                      }`}
                    title="Electric Teal"
                  />
                  <button
                    id="color-red"
                    onClick={() => setSelectedColor("red")}
                    className={`w-6 h-6 rounded-full border bg-red-500 transition-all cursor-pointer ${selectedColor === "red" ? "border-white ring-2 ring-red-500/50 scale-110" : "border-transparent"
                      }`}
                    title="Crimson Flame"
                  />
                  <button
                    id="color-black"
                    onClick={() => setSelectedColor("black")}
                    className={`w-6 h-6 rounded-full border bg-zinc-700 transition-all cursor-pointer ${selectedColor === "black" ? "border-white ring-2 ring-white/30 scale-110" : "border-transparent"
                      }`}
                    title="Carbon Obsidian"
                  />
                </div>
              </div>

              <div className="h-[1px] bg-white/10" />

              {/* Shoe Size Selection Row */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white block">Select Men's Size</span>
                  <span className="text-[11px] text-white underline cursor-pointer hover:opacity-80">Size Guide</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-1">
                  {shoeSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        id={`size-${size.replace(' ', '-').toLowerCase()}`}
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg shrink-0 transition-all cursor-pointer ${isSelected
                            ? "bg-white text-black font-bold shadow-md scale-105"
                            : "bg-neutral-900 border border-neutral-850 hover:border-neutral-700 text-white"
                          }`}
                      >
                        {size.replace("US ", "")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Spec Metrics Footer (Pure White text) */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-white opacity-95 block">Weight</span>
                  <span className="text-xs font-bold text-white"><CountUp to={184} suffix=" Grams" /></span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-white opacity-95 block">Cushioning</span>
                  <span className="text-xs font-bold text-white">Bio-Foam</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-white opacity-95 block">Drop</span>
                  <span className="text-xs font-bold text-white">4mm</span>
                </div>
              </div>

              {/* Trust Badges for Premium E-commerce Polish */}
              <div className="h-[1px] bg-white/10 my-1" />
              <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-white text-center uppercase tracking-wider">
                <div className="flex flex-col items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-white" />
                  <span>Secure Pay</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  <span>Free Express</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 rotate-180 text-white" />
                  <span>30-Day Run</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ── SECTION: FEATURES ─────────────────────────────── */}
        <div id="features" className="w-full mt-24 sm:mt-32 lg:mt-40 border-t border-neutral-900 pt-20 sm:pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative">

            {/* Ambient glow */}
            <div className="absolute left-[-10%] top-[30%] w-[350px] h-[350px] rounded-full blur-[130px] opacity-10 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: selectedColor === "teal" ? "#0d9488" : selectedColor === "red" ? "#b91c1c" : "#ffffff" }}
            />

            {/* LEFT — 4 Feature Cards Grid */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 grid grid-cols-2 gap-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              {[
                { icon: <Leaf className="w-6 h-6" />, title: "Bio-Adaptive Foam", desc: "Microalgae cushioning that responds to your weight, speed, and terrain in real time." },
                { icon: <Cpu className="w-6 h-6" />, title: "Carbon Kinetic Plate", desc: "Aerospace-grade carbon fibre spring plate stores and releases propulsive energy." },
                { icon: <Sparkles className="w-6 h-6" />, title: "Dynamic Fit Weave", desc: "Zero-waste knit structure that micro-adjusts to your unique foot shape within 3 strides." },
                { icon: <Shield className="w-6 h-6" />, title: "Smart Traction Grip", desc: "Wet/dry compound that auto-hardening on smooth surfaces and softens on rough terrain." }
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 hover:border-white/20 hover:bg-white/8 transition-all duration-300"
                >
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 w-fit"
                    style={{ color: selectedColor === "teal" ? "#2dd4bf" : selectedColor === "red" ? "#f87171" : "#ffffff" }}
                  >
                    {feat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{feat.title}</p>
                    <p className="text-xs text-white/70 leading-relaxed">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* RIGHT — Text */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex flex-col items-start lg:items-end text-left lg:text-right z-10 w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl"
            >
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-6 p-3 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-4xl lg:text-[42px] font-medium tracking-tight text-white leading-[1.12] mb-6 select-text"
              >
                key{" "}<span className="font-serif italic font-light">features</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-white font-normal leading-relaxed mb-8 max-w-md select-text"
              >
                Four groundbreaking technologies engineered into a single pair. Every gram, every thread, every compound chosen for one purpose — peak human performance.
              </motion.p>
              <ul className="flex flex-col gap-3 text-sm text-white font-medium">
                {["30-day risk-free return guarantee", "Lifetime fit promise on all pairs", "Free express worldwide courier"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 lg:justify-end">
                    <span>{item}</span>
                    <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>
        </div>

        {/* SECOND SECTION: ULTRA LIGHT CONSTRUCTION */}
        <div id="technology" className="w-full mt-24 sm:mt-32 lg:mt-40 border-t border-neutral-900 pt-20 sm:pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative">

            {/* Ambient background glow for section */}
            <div
              className="absolute right-[-10%] top-[30%] w-[350px] h-[350px] rounded-full blur-[130px] opacity-10 pointer-events-none transition-all duration-700 animate-pulse"
              style={{
                backgroundColor: selectedColor === "teal" ? "#0d9488" : selectedColor === "red" ? "#b91c1c" : "#ffffff"
              }}
            />

            {/* LEFT SIDE: SPACE FOR VISUAL (ULTRA LIGHT SKELETON EXPLODED VIEW) */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[420px] bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/10 overflow-hidden w-full"
            >

              {/* Subtle background tech grid lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Top Bar for the Visual Module */}
              <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse transition-all duration-500"
                    style={{
                      backgroundColor: selectedColor === "teal" ? "#2dd4bf" : selectedColor === "red" ? "#f87171" : "#ffffff",
                      boxShadow: `0 0 6px ${selectedColor === "teal" ? "#2dd4bf" : selectedColor === "red" ? "#f87171" : "#ffffff"}`
                    }}
                  />
                  <span className="text-[10px] uppercase font-mono tracking-wider text-white opacity-60">Interactive Weight Lab</span>
                </div>
                <button
                  id="btn-toggle-deconstruct"
                  onClick={() => setIsDeconstructed(!isDeconstructed)}
                  className="px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] text-white hover:border-neutral-700 hover:bg-neutral-800 transition-all font-mono uppercase tracking-wider cursor-pointer"
                >
                  {isDeconstructed ? "Assemble view" : "Explode Tech"}
                </button>
              </div>

              {/* Exploded Shoe Visual Container */}
              <div className="w-full h-[320px] relative flex items-center justify-center mt-6">

                {/* 1. UPPER LAYER (KNIT MESH UPPER) */}
                <motion.div
                  id="layer-upper"
                  animate={{
                    y: isDeconstructed ? -65 : -5,
                    opacity: hoveredLayer && hoveredLayer !== "upper" ? 0.35 : 1,
                    scale: hoveredLayer === "upper" ? 1.05 : 1
                  }}
                  transition={{ type: "spring", stiffness: 180, damping: 20 }}
                  onMouseEnter={() => setHoveredLayer("upper")}
                  onMouseLeave={() => setHoveredLayer(null)}
                  className="absolute w-[240px] h-[100px] z-20 cursor-pointer"
                >
                  <svg viewBox="0 0 240 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                    <path
                      d="M20 75 C40 40, 90 20, 160 30 C190 35, 210 50, 225 70 C195 72, 175 60, 130 55 C90 50, 45 65, 20 75 Z"
                      fill="none"
                      stroke={selectedColor === "teal" ? "#2dd4bf" : selectedColor === "red" ? "#f87171" : "#ffffff"}
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      className="transition-all duration-700"
                    />
                    <path
                      d="M45 65 C65 52, 100 42, 140 45 C170 47, 190 58, 205 68"
                      fill="none"
                      stroke={selectedColor === "teal" ? "#0f766e" : selectedColor === "red" ? "#991b1b" : "#404040"}
                      strokeWidth="1.5"
                      className="transition-all duration-700"
                    />
                    <path
                      d="M70 45 L55 65 M90 44 L75 64 M110 44 L95 64 M130 45 L115 65 M150 47 L135 67 M170 51 L155 71"
                      stroke={selectedColor === "teal" ? "rgba(45, 212, 191, 0.25)" : selectedColor === "red" ? "rgba(239, 68, 68, 0.25)" : "rgba(255, 255, 255, 0.15)"}
                      strokeWidth="1"
                    />
                  </svg>

                  {/* Indicator Line & Tag */}
                  {isDeconstructed && (
                    <div className="absolute top-1/4 -right-2 flex sm:-right-8 items-center gap-2 pointer-events-none z-30">
                      <div className="w-6 h-[1px] border-t border-dashed border-white/30 hidden sm:block" />
                      <div className="text-[10px] font-mono text-white whitespace-nowrap bg-neutral-900/90 border border-neutral-800 px-2 py-1 rounded shadow-lg">
                        Kinetic Knit Upper — <span className="font-bold text-white">38g</span>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* 2. MIDSOLE SUSPENSION PLATE LAYER (CARBON FIBER SHANK) */}
                <motion.div
                  id="layer-plate"
                  animate={{
                    y: isDeconstructed ? 0 : 0,
                    opacity: hoveredLayer && hoveredLayer !== "plate" ? 0.35 : 1,
                    scale: hoveredLayer === "plate" ? 1.05 : 1
                  }}
                  transition={{ type: "spring", stiffness: 180, damping: 20 }}
                  onMouseEnter={() => setHoveredLayer("plate")}
                  onMouseLeave={() => setHoveredLayer(null)}
                  className="absolute w-[230px] h-[40px] z-10 cursor-pointer"
                >
                  <svg viewBox="0 0 230 40" className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                    <path
                      d="M15 15 C45 25, 100 28, 150 15 C190 5, 210 10, 220 18"
                      fill="none"
                      stroke={selectedColor === "teal" ? "#06b6d4" : selectedColor === "red" ? "#f97316" : "#a3a3a3"}
                      strokeWidth="3"
                      className="transition-all duration-700"
                    />
                    <path
                      d="M40 21 L50 18 M70 23 L80 20 M100 23 L110 20 M130 20 L140 17 M160 14 L170 11 M190 10 L200 8"
                      stroke="#ffffff"
                      strokeWidth="1"
                      strokeOpacity="0.4"
                    />
                  </svg>

                  {/* Indicator Line & Tag */}
                  {isDeconstructed && (
                    <div className="absolute top-1/2 -left-2 sm:-left-12 flex items-center gap-2 pointer-events-none z-30">
                      <div className="text-[10px] font-mono text-white whitespace-nowrap bg-neutral-900/90 border border-neutral-800 px-2 py-1 rounded shadow-lg">
                        Carbon Kinetic Plate — <span className="font-bold text-white">24g</span>
                      </div>
                      <div className="w-6 h-[1px] border-t border-dashed border-white/30 hidden sm:block" />
                    </div>
                  )}
                </motion.div>

                {/* 3. OUTSOLE / BASE SUSPENSION LAYER (RESPONSIVE HELIUM SOLE) */}
                <motion.div
                  id="layer-midsole"
                  animate={{
                    y: isDeconstructed ? 65 : 5,
                    opacity: hoveredLayer && hoveredLayer !== "midsole" ? 0.35 : 1,
                    scale: hoveredLayer === "midsole" ? 1.05 : 1
                  }}
                  transition={{ type: "spring", stiffness: 180, damping: 20 }}
                  onMouseEnter={() => setHoveredLayer("midsole")}
                  onMouseLeave={() => setHoveredLayer(null)}
                  className="absolute w-[245px] h-[90px] z-0 cursor-pointer"
                >
                  <svg viewBox="0 0 245 90" className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.7)]">
                    <path
                      d="M10 25 C30 28, 90 35, 145 23 C185 14, 215 15, 235 30 C220 50, 180 55, 130 52 C80 49, 30 45, 10 25 Z"
                      fill={selectedColor === "teal" ? "rgba(13, 148, 136, 0.15)" : selectedColor === "red" ? "rgba(185, 28, 28, 0.15)" : "rgba(64, 64, 64, 0.15)"}
                      stroke={selectedColor === "teal" ? "#14b8a6" : selectedColor === "red" ? "#ef4444" : "#737373"}
                      strokeWidth="2.5"
                      className="transition-all duration-700"
                    />
                    <circle cx="45" cy="31" r="4" fill="none" stroke="white" strokeOpacity="0.25" />
                    <circle cx="65" cy="33" r="4.5" fill="none" stroke="white" strokeOpacity="0.25" />
                    <circle cx="85" cy="34" r="5" fill="none" stroke="white" strokeOpacity="0.25" />
                    <circle cx="105" cy="33" r="5" fill="none" stroke="white" strokeOpacity="0.25" />
                    <circle cx="125" cy="31" r="4.5" fill="none" stroke="white" strokeOpacity="0.25" />
                    <circle cx="145" cy="28" r="4" fill="none" stroke="white" strokeOpacity="0.25" />
                    <circle cx="165" cy="25" r="3.5" fill="none" stroke="white" strokeOpacity="0.25" />
                    <circle cx="185" cy="23" r="3" fill="none" stroke="white" strokeOpacity="0.25" />
                  </svg>

                  {/* Indicator Line & Tag */}
                  {isDeconstructed && (
                    <div className="absolute bottom-1/4 -right-2 sm:-right-8 flex items-center gap-2 pointer-events-none z-30">
                      <div className="w-6 h-[1px] border-t border-dashed border-white/30 hidden sm:block" />
                      <div className="text-[10px] font-mono text-white whitespace-nowrap bg-neutral-900/90 border border-neutral-800 px-2 py-1 rounded shadow-lg">
                        Helium-Propulsion Cushion — <span className="font-bold text-white">122g</span>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Floating Microparticles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-[20%] left-[30%] w-1 h-1 rounded-full bg-teal-400 animate-ping" />
                  <div className="absolute bottom-[20%] right-[30%] w-1.5 h-1.5 rounded-full bg-cyan-400/50 animate-pulse" />
                </div>

              </div>

              {/* Live Weight Gauge */}
              <div className="absolute bottom-5 left-6 right-6 flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3 z-10 backdrop-blur-md">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-white opacity-50 block">Current Configuration</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    {hoveredLayer === "upper" && "Upper Layer Active"}
                    {hoveredLayer === "plate" && "Suspension Carbon Active"}
                    {hoveredLayer === "midsole" && "Outsole Cushion Active"}
                    {!hoveredLayer && "Total Combined System"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-white opacity-50 block">Total Mass</span>
                  <span className="text-base sm:text-lg font-mono font-bold text-white flex items-baseline gap-0.5 justify-end">
                    {hoveredLayer === "upper" && "38"}
                    {hoveredLayer === "plate" && "24"}
                    {hoveredLayer === "midsole" && "122"}
                    {!hoveredLayer && <CountUp to={184} />}
                    <span className="text-xs font-normal text-white">g</span>
                  </span>
                </div>
              </div>

            </motion.div>

            {/* RIGHT SIDE: TEXT AND SPEC MODULES (ALIGN TO THE RIGHT SIDE OF FRAME, WRAPPED IN GLASS CARD) */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex flex-col items-start lg:items-end text-left lg:text-right z-10 max-w-xl ml-auto w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative"
            >

              {/* Ultra Light Tech Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-6 p-3 rounded-2xl bg-white/5 border border-white/10 text-white shadow-xl"
              >
                <Cpu className="w-5 h-5 text-white" />
              </motion.div>

              {/* MAIN TITLE (Headline: "ultra light construction") */}
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-4xl lg:text-[42px] font-medium tracking-tight text-white leading-[1.12] mb-6 select-text"
              >
                ultra light{" "}
                <span className="font-serif italic font-light text-white select-text">
                  construction
                </span>
              </motion.h2>

              {/* SUBTEXT (Pure white text color as requested) */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-white font-normal leading-relaxed mb-8 max-w-md select-text"
              >
                move faster with a light weight design thar reduces fatigue and maximizes agiility
              </motion.p>

              {/* Dynamic spec bars supporting "ultra light" context */}
              <div className="w-full flex flex-col gap-4 mt-2">

                {/* Spec item 1 */}
                <div className="flex flex-col items-start lg:items-end w-full">
                  <div className="flex justify-between w-full mb-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    <span className="lg:order-2">35% Lighter</span>
                    <span className="lg:order-1 opacity-95">Industry Standard comparison</span>
                  </div>
                  <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r lg:bg-gradient-to-l from-white to-neutral-300"
                      initial={{ width: 0 }}
                      whileInView={{ width: "85%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Spec item 2 */}
                <div className="flex flex-col items-start lg:items-end w-full">
                  <div className="flex justify-between w-full mb-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    <span className="lg:order-2">Zero Fatigue Matrix</span>
                    <span className="lg:order-1 opacity-95">Extended wear test comfort</span>
                  </div>
                  <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r lg:bg-gradient-to-l from-white to-neutral-300"
                      initial={{ width: 0 }}
                      whileInView={{ width: "94%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
                    />
                  </div>
                </div>

              </div>

            </motion.div>

          </div>
        </div>

        {/* ── SECTION: COLOR VARIANTS ─────────────────────── */}
        <div id="color-variants" className="w-full mt-24 sm:mt-32 lg:mt-40 border-t border-neutral-900 pt-20 sm:pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative">

            <div className="absolute left-[-10%] top-[30%] w-[350px] h-[350px] rounded-full blur-[120px] opacity-10 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: selectedColor === "teal" ? "#0d9488" : selectedColor === "red" ? "#b91c1c" : "#ffffff" }}
            />

            {/* LEFT — 3 Colorway Showcase Cards */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              <div className="absolute top-4 left-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: selectedColor === "teal" ? "#2dd4bf" : selectedColor === "red" ? "#f87171" : "#ffffff" }} />
                <span className="text-[10px] uppercase font-mono tracking-wider text-white opacity-60">Colorway Studio</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                {([
                  { key: "teal", label: "Electric Teal", hex: "#2dd4bf", filter: "grayscale(1) sepia(1) hue-rotate(140deg) saturate(4) brightness(1.1)" },
                  { key: "red",  label: "Crimson Flame", hex: "#f87171", filter: "saturate(1.3) brightness(1.05)" },
                  { key: "black",label: "Carbon Obsidian",hex: "#a3a3a3", filter: "grayscale(1) brightness(0.60) contrast(1.25)" }
                ] as {key: Colorway; label: string; hex: string; filter: string}[]).map((cw) => (
                  <motion.button
                    key={cw.key}
                    onClick={() => setSelectedColor(cw.key)}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`flex-1 rounded-2xl border p-4 flex flex-col items-center gap-3 transition-all duration-300 cursor-pointer ${
                      selectedColor === cw.key
                        ? "border-white/40 bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.08)]"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="w-full h-24 flex items-center justify-center overflow-hidden rounded-xl bg-black/20">
                      <img
                        src={colorwayImages[cw.label] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300"}
                        alt={cw.label}
                        className="w-full h-full object-contain"
                        style={{
                          filter: colorwayImages[cw.label]
                            ? "drop-shadow(0 8px 16px rgba(0,0,0,0.8))"
                            : `${cw.filter} drop-shadow(0 8px 16px rgba(0,0,0,0.8))`
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cw.hex }} />
                      <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">{cw.label}</span>
                    </div>
                    {selectedColor === cw.key && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono uppercase tracking-wider">Active</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* RIGHT — Text */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex flex-col items-start lg:items-end text-left lg:text-right z-10 w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl"
            >
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-6 p-3 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                <Eye className="w-5 h-5 text-white" />
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-4xl lg:text-[42px] font-medium tracking-tight text-white leading-[1.12] mb-6 select-text"
              >
                color{" "}<span className="font-serif italic font-light">ways</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-white font-normal leading-relaxed mb-8 max-w-md select-text"
              >
                Three distinct editions — each commanding its own energy. Select a colorway on the left to instantly update the entire experience.
              </motion.p>
              <AnimatePresence mode="wait">
                <motion.div key={selectedColor} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4"
                >
                  <span className="text-[9px] uppercase font-bold tracking-widest text-white/50 block mb-1">Active Edition</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {selectedColor === "teal" ? "Electric Teal — Biome Edition" : selectedColor === "red" ? "Crimson Flame — Apex Edition" : "Carbon Obsidian — Stealth Edition"}
                  </span>
                  <p className="text-xs text-white/70 mt-2 leading-relaxed">
                    {selectedColor === "teal" ? "Inspired by ocean ecosystems. The electric teal weave shifts its hue under different light spectrums for a dynamic, living finish."
                      : selectedColor === "red" ? "Born from motorsport engineering. High-energy crimson paired with a heat-formed outsole compound for maximum sprint acceleration."
                      : "Forged in precision darkness. The matte carbon finish uses a military-grade anti-reflective coating for the ultimate stealth athletic profile."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

          </div>
        </div>

        {/* ── SECTION: PERFORMANCE STATS ───────────────────── */}
        <div id="performance-stats" className="w-full mt-24 sm:mt-32 lg:mt-40 border-t border-neutral-900 pt-20 sm:pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative">

            <div className="absolute right-[-10%] top-[30%] w-[350px] h-[350px] rounded-full blur-[130px] opacity-10 pointer-events-none transition-all duration-700 animate-pulse"
              style={{ backgroundColor: selectedColor === "teal" ? "#0d9488" : selectedColor === "red" ? "#b91c1c" : "#ffffff" }}
            />

            {/* LEFT — Animated Stat Bars + CountUp Numbers */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              <div className="absolute top-4 left-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: selectedColor === "teal" ? "#2dd4bf" : selectedColor === "red" ? "#f87171" : "#ffffff" }} />
                <span className="text-[10px] uppercase font-mono tracking-wider text-white opacity-60">Live Performance Lab</span>
              </div>

              {/* Big 3 CountUp metrics */}
              <div className="grid grid-cols-3 gap-4 mt-12 mb-8">
                {[
                  { label: "Shoe Weight", value: 184, suffix: "g", decimals: 0 },
                  { label: "Energy Return", value: 92, suffix: "%", decimals: 0 },
                  { label: "Heel Drop", value: 4, suffix: "mm", decimals: 0 },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
                  >
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-white">
                      <CountUp to={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-white/50 block mt-1">{stat.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Animated progress bars */}
              <div className="flex flex-col gap-5">
                {[
                  { label: "Energy Return", pct: 92, detail: "vs 61% industry average" },
                  { label: "Weight Reduction", pct: 35, detail: "lighter than standard trainers" },
                  { label: "Traction Score", pct: 97, detail: "wet/dry combined index" },
                  { label: "Flex Index", pct: 88, detail: "biomechanical adaptation rate" },
                ].map((bar, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                      <span>{bar.label}</span>
                      <span className="opacity-60">{bar.detail}</span>
                    </div>
                    <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: selectedColor === "teal" ? "linear-gradient(to right, #0d9488, #2dd4bf)" : selectedColor === "red" ? "linear-gradient(to right, #b91c1c, #f87171)" : "linear-gradient(to right, #404040, #ffffff)" }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${bar.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.3, delay: i * 0.12, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT — Text */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex flex-col items-start lg:items-end text-left lg:text-right z-10 w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl"
            >
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-6 p-3 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                <Star className="w-5 h-5 text-white" />
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-4xl lg:text-[42px] font-medium tracking-tight text-white leading-[1.12] mb-6 select-text"
              >
                performance{" "}<span className="font-serif italic font-light">data</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-white font-normal leading-relaxed mb-8 max-w-md select-text"
              >
                Every metric independently verified at the BZ Lifestyle Biometric Lab. We publish our real data — no marketing numbers, no rounded averages.
              </motion.p>
              <div className="flex flex-col gap-3 w-full">
                {[
                  { label: "Lab Certification", value: "ISO 9001:2015" },
                  { label: "Test Distance", value: "4,200 km tracked" },
                  { label: "Athletes Tested", value: "340 elite runners" },
                  { label: "Carbon Offset", value: "−24.8 kg per pair" },
                ].map((fact, i) => (
                  <div key={i} className="flex items-center justify-between lg:flex-row-reverse bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                    <span className="text-xs font-mono font-bold text-white">{fact.value}</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/50">{fact.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>


        {/* FIFTH SECTION: STORES */}
        <div id="stores" className="w-full mt-24 sm:mt-32 lg:mt-40 border-t border-neutral-900 pt-20 sm:pt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative">

            {/* Ambient background glow */}
            <div
              className="absolute right-[-10%] top-[40%] w-[320px] h-[320px] rounded-full blur-[120px] opacity-10 pointer-events-none transition-all duration-700"
              style={{
                backgroundColor: selectedColor === "teal" ? "#0d9488" : selectedColor === "red" ? "#b91c1c" : "#ffffff"
              }}
            />

            {/* LEFT SIDE: VISUAL CONTAINER (FLAGSHIP CITY SELECTION GRID) */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[460px] bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/10 overflow-hidden w-full"
            >

              {/* background grids */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-ping bg-teal-400" />
                  <span className="text-[10px] uppercase font-mono tracking-wider text-white opacity-60">Global Flagship Network</span>
                </div>
                <span className="text-[10px] font-mono text-white bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Active gate online
                </span>
              </div>

              {/* Dynamic Map Terminal representation */}
              <div className="w-full h-[250px] relative flex flex-col items-center justify-center mt-6">

                {/* Radial grid background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.05)_0%,transparent_70%)] pointer-events-none" />

                {/* City Location specs */}
                <AnimatePresence mode="wait">
                  {activeCity === "tokyo" && (
                    <motion.div
                      key="tokyo"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-[280px] bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2 backdrop-blur-md text-left font-mono z-10"
                    >
                      <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                        <span className="text-xs font-bold text-teal-400 uppercase">SHIBUYA BIOME HUB</span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">OPEN NOW</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-white pt-1">
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Location</span>
                          <span>Tokyo, Japan</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Coordinates</span>
                          <span>35.6580° N</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Molding Lab</span>
                          <span>Active 3D Gate</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Stock Priority</span>
                          <span className="text-teal-400 font-bold">Aero-Stride v2</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {activeCity === "nyc" && (
                    <motion.div
                      key="nyc"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-[280px] bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2 backdrop-blur-md text-left font-mono z-10"
                    >
                      <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                        <span className="text-xs font-bold text-teal-400 uppercase">SOHO STRETCH LAB</span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">OPEN NOW</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-white pt-1">
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Location</span>
                          <span>New York, USA</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Coordinates</span>
                          <span>40.7128° W</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Molding Lab</span>
                          <span>Dynamic Gait scan</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Stock Priority</span>
                          <span className="text-teal-400 font-bold">Aero-Stride v2</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {activeCity === "london" && (
                    <motion.div
                      key="london"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-[280px] bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2 backdrop-blur-md text-left font-mono z-10"
                    >
                      <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                        <span className="text-xs font-bold text-teal-400 uppercase">RESTRIDE COVENT GARDEN</span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">HOLIDAY HOURS</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-white pt-1">
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Location</span>
                          <span>London, UK</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Coordinates</span>
                          <span>51.5074° N</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Molding Lab</span>
                          <span>Circular recycling hub</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Stock Priority</span>
                          <span className="text-teal-400 font-bold">Limited restock</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {activeCity === "berlin" && (
                    <motion.div
                      key="berlin"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-[280px] bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2 backdrop-blur-md text-left font-mono z-10"
                    >
                      <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                        <span className="text-xs font-bold text-teal-400 uppercase">MITTE KINETIC TERMINAL</span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">OPEN NOW</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-white pt-1">
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Location</span>
                          <span>Berlin, Germany</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Coordinates</span>
                          <span>52.5200° E</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Molding Lab</span>
                          <span>Precision heat-mold</span>
                        </div>
                        <div>
                          <span className="opacity-50 block text-[8px] uppercase font-bold">Stock Priority</span>
                          <span className="text-teal-400 font-bold">Aero-Stride v2</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* City Selection chips */}
              <div className="w-full flex flex-wrap justify-center gap-1.5 z-10 pt-4">
                {["nyc", "tokyo", "london", "berlin"].map((city) => (
                  <button
                    key={city}
                    onClick={() => setActiveCity(city as any)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border capitalize transition-all cursor-pointer ${activeCity === city
                        ? "bg-white text-black border-white shadow-md scale-105"
                        : "bg-neutral-900 text-white border-neutral-800 hover:border-neutral-700"
                      }`}
                  >
                    {city === "nyc" ? "New York" : city === "tokyo" ? "Tokyo" : city === "london" ? "London" : "Berlin"}
                  </button>
                ))}
              </div>

            </motion.div>

            {/* RIGHT SIDE: TEXT MODULES (ALIGN TO THE RIGHT SIDE OF FRAME, WRAPPED IN GLASS CARD) */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex flex-col items-start lg:items-end text-left lg:text-right z-10 max-w-xl ml-auto w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative"
            >

              {/* Store Network Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-6 p-3 rounded-2xl bg-white/5 border border-white/10 text-white shadow-xl"
              >
                <ShoppingBag className="w-5 h-5 text-white" />
              </motion.div>

              {/* MAIN TITLE (Headline: "flagship stores") */}
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-4xl lg:text-[42px] font-medium tracking-tight text-white leading-[1.12] mb-6 select-text"
              >
                flagship{" "}
                <span className="font-serif italic font-light text-white select-text">
                  stores
                </span>
              </motion.h2>

              {/* SUBTEXT (Pure white text color as requested) */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-white font-normal leading-relaxed mb-8 max-w-md select-text"
              >
                Experience the ultimate stride firsthand. Step into our architectural flagship lounges, complete with dynamic biomechanical analysis lanes and professional molding labs.
              </motion.p>

              {/* Store reservation promo action button (CTA) */}
              <button
                onClick={() => handleOpenModal("reserve")}
                className={`relative group text-black bg-gradient-to-r px-7 py-3.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${getButtonGradient()}`}
              >
                Book Store Session
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 stroke-[2.5]" />
              </button>

            </motion.div>

          </div>
        </div>

      </div>

      {/* ── SECTION: SHOP THE COLLECTION ─────────────────────── */}
      <div id="collection" className="w-full mt-24 sm:mt-32 lg:mt-40 border-t border-neutral-900 pt-20 sm:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="relative z-10 mb-8 flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 w-fit shadow-xl shrink-0">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-medium tracking-tight text-white leading-[1.12] mb-2">
                  shop the{" "}<span className="font-serif italic font-light">collection</span>
                </h2>
                <p className="text-sm sm:text-base text-white/70 font-normal leading-relaxed max-w-xl">
                  Every Aero-Stride colorway and style, in one place. Six builds, one obsession — peak performance.
                </p>
              </div>
            </div>
            <div className="relative z-10">
              <ShoeCarousel />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION: RESERVATION ─────────────────────────────── */}
      <div id="reservation" className="w-full mt-24 sm:mt-32 lg:mt-40 border-t border-neutral-900 pt-20 sm:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative">

            <div className="absolute left-[-5%] top-[20%] w-[400px] h-[400px] rounded-full blur-[140px] opacity-10 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: selectedColor === "teal" ? "#0d9488" : selectedColor === "red" ? "#b91c1c" : "#ffffff" }}
            />

            {/* LEFT — Size picker + Summary card */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex flex-col gap-5 z-10"
            >

              {/* Colorway switcher visual */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                <span className="text-[9px] uppercase font-bold tracking-widest text-white/50 block mb-4">Select Colorway</span>
                <div className="flex gap-3">
                  {(["teal","red","black"] as Colorway[]).map((c) => (
                    <button key={c} onClick={() => setSelectedColor(c)}
                      className={`flex-1 py-3 rounded-xl border text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        selectedColor === c ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/10 hover:border-white/25"
                      }`}
                    >
                      {c === "teal" ? "Electric Teal" : c === "red" ? "Crimson Flame" : "Carbon Obsidian"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size selector */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-white/50">Select Men's Size</span>
                  <span className="text-[11px] text-white underline cursor-pointer hover:opacity-80">Size Guide</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {shoeSizes.map((size) => (
                    <button key={size} onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-[11px] font-semibold rounded-xl transition-all cursor-pointer border ${
                        selectedSize === size ? "bg-white text-black border-white shadow-md" : "bg-neutral-900 text-white border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order summary */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8">
                <span className="text-[9px] uppercase font-bold tracking-widest text-white/50 block mb-4">Reservation Summary</span>
                <div className="grid grid-cols-2 gap-3 font-mono text-xs text-white">
                  {[
                    { label: "Model", value: "Aero-Stride v2" },
                    { label: "Colorway", value: selectedColor === "teal" ? "Electric Teal" : selectedColor === "red" ? "Crimson Flame" : "Carbon Obsidian" },
                    { label: "Size", value: selectedSize },
                    { label: "Est. Delivery", value: "14–21 days" },
                    { label: "Payment", value: "No charge today" },
                    { label: "Status", value: "Priority reserve" },
                  ].map((row) => (
                    <div key={row.label}>
                      <span className="opacity-40 text-[8px] uppercase font-bold block">{row.label}</span>
                      <span className="font-bold">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>

            {/* RIGHT — Text + Email form */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex flex-col items-start lg:items-end text-left lg:text-right z-10 w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl"
            >
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-6 p-3 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                <ShoppingBag className="w-5 h-5 text-white" />
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-4xl lg:text-[42px] font-medium tracking-tight text-white leading-[1.12] mb-6 select-text"
              >
                reserve{" "}<span className="font-serif italic font-light">now</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-white font-normal leading-relaxed mb-8 max-w-md select-text"
              >
                Secure your size today — no card required. Priority reservation holders ship 7 days before the public launch window opens.
              </motion.p>

              <form onSubmit={(e) => { e.preventDefault(); handleOpenModal("reserve"); }} className="w-full flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-white uppercase tracking-wider pl-1">Email Address</label>
                  <input type="email" required placeholder="you@domain.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all"
                  />
                </div>
                <button type="submit"
                  className={`w-full py-3.5 rounded-xl text-black bg-gradient-to-r font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${getButtonGradient()}`}
                >
                  Secure Priority Spot
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>

              <div className="flex items-center gap-2 mt-5 text-xs text-white/60">
                <Shield className="w-3.5 h-3.5" />
                <span>Secured SSL · No payment required · Cancel anytime</span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* PREMIUM FOOTER */}
      <footer className="w-full mt-32 border-t border-neutral-900 bg-neutral-950/30 pt-16 pb-12 relative z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
            
            {/* Brand Column */}
            <div className="md:col-span-4 flex flex-col items-start gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center">
                  <img src={logoBZLI} alt="BZ Lifestyle Shoes" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold tracking-[0.1em] text-sm text-white uppercase whitespace-nowrap">
                  BZ Lifestyle
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                Designing a carbon-neutral athletic future. Leveraging bio-adaptive foam, marine plastic thread, and circular loops to maximize human potential with zero planetary cost.
              </p>
              
              {/* Social icons */}
              <div className="flex gap-3 mt-2">
                {[
                  { icon: <Twitter className="w-4 h-4" />, url: "https://x.com/Tarunnn16", label: "Twitter" },
                  { icon: <Instagram className="w-4 h-4" />, url: "https://www.instagram.com/_bloody_tarun_?igsh=NXB0OTczYzkwcTZl", label: "Instagram" },
                  { 
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.216 3.075.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.008c6.56 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    ),
                    url: "https://wa.me/919391789983",
                    label: "WhatsApp"
                  },
                  { icon: <Mail className="w-4 h-4" />, url: "mailto:tarunsakamuri2020@gmail.com", label: "Email" }
                ].map((soc, idx) => (
                  <motion.a
                    key={idx}
                    href={soc.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={soc.label}
                    whileHover={{ scale: 1.1, rotate: 6 }}
                    className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
                  >
                    {soc.icon}
                  </motion.a>
                ))}
              </div>
            </div>
            
            {/* Navigation Links Column */}
            <div className="md:col-span-4 grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-white mb-4">Technology</h4>
                <ul className="flex flex-col gap-2.5 text-xs text-neutral-400">
                  <li><button onClick={() => handleNavClick("Technology")} className="hover:text-white transition-colors cursor-pointer text-left hover-underline">Helium Cushioning</button></li>
                  <li><button onClick={() => handleNavClick("Technology")} className="hover:text-white transition-colors cursor-pointer text-left hover-underline">Carbon Shank</button></li>
                  <li><button onClick={() => handleNavClick("Custom Lab")} className="hover:text-white transition-colors cursor-pointer text-left hover-underline">Bespoke Fit Weft</button></li>
                  <li><button onClick={() => handleNavClick("Sustainability")} className="hover:text-white transition-colors cursor-pointer text-left hover-underline">Circularity Program</button></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-white mb-4">Enterprise</h4>
                <ul className="flex flex-col gap-2.5 text-xs text-neutral-400">
                  <li><button onClick={() => handleNavClick("Stores")} className="hover:text-white transition-colors cursor-pointer text-left hover-underline">Flagship Hubs</button></li>
                  <li><a href="#" className="hover:text-white transition-colors hover-underline">Press Inquiries</a></li>
                  <li><a href="#" className="hover:text-white transition-colors hover-underline">Retail Partnerships</a></li>
                  <li><a href="#" className="hover:text-white transition-colors hover-underline">Support Portal</a></li>
                </ul>
              </div>
            </div>
            
            {/* Newsletter Signup Column */}
            <div className="md:col-span-4 flex flex-col items-start gap-4">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-white mb-1">Newsletter Subscription</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Subscribe to receive priority release schedules, biometric lab reports, and global pre-order gates.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Subscribed successfully!");
                }}
                className="w-full flex gap-2"
              >
                <input
                  type="email"
                  required
                  placeholder="newsletter@domain.com"
                  className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400 transition-all"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-4 rounded-xl text-black bg-gradient-to-r font-bold text-xs flex items-center justify-center cursor-pointer ${getButtonGradient()}`}
                >
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </form>
            </div>
            
          </div>
          
          <div className="h-[1px] bg-neutral-900 my-8" />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
            <span>© 2026 NIKE INC. ALL RIGHTS RESERVED.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-neutral-300 hover-underline">Privacy Policy</a>
              <a href="#" className="hover:text-neutral-300 hover-underline">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL SYSTEM (RESERVE SIZE & LOGIN) */}
      <AnimatePresence>
        {isModalOpen && (
          <div id="modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Glass Backdrop */}
            <motion.div
              id="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              id="modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_24px_50px_rgba(0,0,0,0.9)] overflow-hidden"
            >
              {/* Radial glowing core in modal background matching active color */}
              <div
                className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700"
                style={{
                  backgroundColor: selectedColor === "teal"
                    ? "rgba(45, 212, 191, 0.15)"
                    : selectedColor === "red"
                      ? "rgba(239, 68, 68, 0.15)"
                      : "rgba(255, 255, 255, 0.1)"
                }}
              />

              {/* Close Button */}
              <button
                id="btn-modal-close"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors p-1.5 hover:bg-neutral-900 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Submitted success state */}
              {isSubmitted ? (
                <div id="modal-success-state" className="flex flex-col items-center justify-center text-center py-8">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 rounded-full bg-white/10 border border-white flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    <Check className="w-8 h-8 text-white stroke-[2.5]" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Pre-Order Confirmed!</h3>
                  <p className="text-white text-sm px-4">
                    Your spot is secured for the <strong>BZ Lifestyle Aero-Stride v2</strong> in <strong>{selectedSize}</strong> ({selectedColor === "teal" ? "Electric Teal" : selectedColor === "red" ? "Crimson Flame" : "Carbon Obsidian"}). We've sent a priority reservation code to your inbox.
                  </p>
                </div>
              ) : (
                <div id="modal-form-state">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={logoBZLI} alt="BZ Lifestyle Shoes" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-bold tracking-[0.1em] text-xs uppercase text-white">
                      {modalType === "reserve" ? "Priority Reservation" : "Log In to Workspace"}
                    </span>
                  </div>

                  <h3 className="text-2xl font-semibold tracking-tight text-white mb-2">
                    {modalType === "reserve"
                      ? "Reserve your Aero-Stride v2"
                      : "Welcome back"}
                  </h3>
                  <p className="text-white text-sm mb-6 opacity-90">
                    {modalType === "reserve"
                      ? `Secure your pair in size ${selectedSize} before public launch. No immediate payment required.`
                      : "Enter your email credentials to access your customer dashboard."}
                  </p>

                  <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="email" className="text-xs font-semibold text-white uppercase tracking-wider pl-1">
                        Email Address
                      </label>
                      <input
                        id="input-email-field"
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all"
                      />
                    </div>

                    {modalType === "login" && (
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-xs font-semibold text-white uppercase tracking-wider pl-1">
                          Password
                        </label>
                        <input
                          id="input-password-field"
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white transition-all"
                        />
                      </div>
                    )}

                    <button
                      id="btn-modal-submit"
                      type="submit"
                      className={`w-full mt-2 py-3 rounded-xl text-black bg-gradient-to-r font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${getButtonGradient()}`}
                    >
                      {modalType === "reserve" ? "Secure Priority Spot" : "Access Console"}
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </form>

                  <div className="mt-6 flex justify-between items-center text-xs text-white opacity-80">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-white" />
                      <span>Secured SSL Portal</span>
                    </div>
                    <button
                      id="btn-modal-switch"
                      type="button"
                      onClick={() => setModalType(modalType === "reserve" ? "login" : "reserve")}
                      className="text-white underline font-medium cursor-pointer hover:opacity-80"
                    >
                      {modalType === "reserve" ? "Already have an account? Log in" : "Need to secure a pair? Reserve now"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
