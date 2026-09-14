import { useState } from "react";
import CartDrawer from "./components/landing/CartDrawer";
import ChatWidget from "./components/landing/ChatWidget";
import AnnouncementBar from "./components/landing/AnnouncementBar";
import Header from "./components/landing/Header";
import HeroCarousel from "./components/landing/HeroCarousel";
import FlashSaleBanner from "./components/landing/FlashSaleBanner";
import CategoryGrid from "./components/landing/CategoryGrid";
import PromoStrip from "./components/landing/PromoStrip";
import SectionHeader from "./components/landing/SectionHeader";
import Reveal from "./components/landing/Reveal";
import ShoeCarousel from "./components/ShoeCarousel";
import TrendingSection from "./components/landing/TrendingSection";
import BrandStrip from "./components/landing/BrandStrip";
import EditorialBanner from "./components/landing/EditorialBanner";
import MembershipCallout from "./components/landing/MembershipCallout";
import NewsletterSignup from "./components/landing/NewsletterSignup";
import Footer from "./components/landing/Footer";

// Foot Locker-inspired retail landing page: white body, black header/footer,
// bold colorful promo/ad banners in between. Each section below is its own
// component under src/components/landing/, with content driven by
// src/data/*.ts config files — see those for copy/image/link edits.
export default function App() {
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white text-neutral-900 overflow-x-hidden">
      <AnnouncementBar />
      <Header />
      <CartDrawer />
      <ChatWidget />

      <main className="flex flex-col pb-8">
        <HeroCarousel />
        <FlashSaleBanner />
        <CategoryGrid onSelectCategory={setSelectedCategoryLabel} />
        <PromoStrip />

        <section id="featured" className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28">
          <SectionHeader title="New Arrivals" subtitle="Fresh off the line this week" shopAllHref="#" />
          <Reveal delay={0.1}>
            <ShoeCarousel />
          </Reveal>
        </section>

        <TrendingSection selectedCategoryLabel={selectedCategoryLabel} />
        <BrandStrip />
        <EditorialBanner />
        <MembershipCallout />
        <NewsletterSignup />
      </main>

      <Footer />
    </div>
  );
}
