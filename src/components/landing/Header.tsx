import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Search, User, Heart, ShoppingBag, ChevronDown, LogOut, Package, MapPin } from "lucide-react";
import logoBZLI from "../../../assets/logo/logoBZLI.png";
import { navItems } from "../../data/navigation";
import MegaMenu from "./MegaMenu";
import LoginModal from "./LoginModal";
import CustomerAuthModal from "./CustomerAuthModal";
import { useCart } from "../../context/CartContext";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useWishlist } from "../../context/WishlistContext";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount, openCart } = useCart();
  const { customer, signOut, isAuthModalOpen, openAuthModal, closeAuthModal } = useCustomerAuth();
  const { count: wishlistCount } = useWishlist();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  // Admin-only — never exposed via a visible button, only opened by the
  // ProtectedRoute redirect below (a staff member hitting /admin logged out).
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // A logged-out visit to a protected /admin/* route redirects here with
  // this flag, so the (admin) login modal pops open instead of leaving the
  // visitor stranded on the homepage with no obvious way back in.
  useEffect(() => {
    if ((location.state as { openLogin?: boolean } | null)?.openLogin) {
      setShowAdminLoginModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleAccountClick = () => {
    if (customer) setShowAccountMenu((v) => !v);
    else openAuthModal();
  };

  const handleWishlistClick = () => {
    if (customer) navigate("/account/wishlist");
    else openAuthModal();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black border-b border-neutral-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <button id="btn-home-logo" onClick={() => navigate("/")} className="flex items-center gap-2.5 shrink-0 cursor-pointer">
          <div className="w-9 h-9 rounded-xl overflow-hidden">
            <img src={logoBZLI} alt="BZ Lifestyle Shoes" className="w-full h-full object-cover" />
          </div>
          <span className="hidden sm:block font-bold tracking-[0.1em] text-sm text-white uppercase whitespace-nowrap">BZ Lifestyle</span>
        </button>

        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center" onMouseLeave={() => setOpenMenu(null)}>
          {navItems.map((item) => (
            <div key={item.label} className="relative" onMouseEnter={() => setOpenMenu(item.megaMenu ? item.label : null)}>
              <a
                href={item.href}
                className={`flex items-center gap-1 px-4 py-2 text-[13px] font-semibold uppercase tracking-wide rounded-full transition-colors hover:bg-white/5 cursor-pointer ${
                  item.accent ? "text-red-400" : "text-white"
                }`}
              >
                {item.label}
                {item.megaMenu && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
              </a>
              <AnimatePresence>{item.megaMenu && openMenu === item.label && <MegaMenu columns={item.megaMenu} />}</AnimatePresence>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="hidden sm:flex items-center">
            <AnimatePresence initial={false} mode="wait">
              {searchOpen ? (
                <motion.input
                  key="search-input"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                  placeholder="Search products..."
                  className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                />
              ) : (
                <motion.button
                  key="search-icon"
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-full hover:bg-white/5 text-white cursor-pointer"
                  aria-label="Search"
                >
                  <Search className="w-[18px] h-[18px]" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button id="btn-account" onClick={handleAccountClick} className="p-2 rounded-full hover:bg-white/5 text-white cursor-pointer" aria-label="Account">
              <User className="w-[18px] h-[18px]" />
            </button>
            <AnimatePresence>
              {showAccountMenu && customer && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-neutral-950 border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white truncate">{customer.name}</p>
                      <p className="text-xs text-white/40 truncate">{customer.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        navigate("/account");
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        navigate("/account/orders");
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                    >
                      <Package className="w-4 h-4" /> My Orders
                    </button>
                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        navigate("/account/addresses");
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" /> Saved Addresses
                    </button>
                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        navigate("/account/wishlist");
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                    >
                      <Heart className="w-4 h-4" /> Wishlist
                    </button>
                    <div className="h-[1px] bg-white/10" />
                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleWishlistClick} className="relative p-2 rounded-full hover:bg-white/5 text-white cursor-pointer" aria-label="Wishlist">
            <Heart className="w-[18px] h-[18px]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold flex items-center justify-center">{wishlistCount}</span>
            )}
          </button>

          <button onClick={openCart} className="relative p-2 rounded-full hover:bg-white/5 text-white cursor-pointer" aria-label="Cart">
            <ShoppingBag className="w-[18px] h-[18px]" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-teal-400 text-black text-[9px] font-bold flex items-center justify-center">{itemCount}</span>
            )}
          </button>

          <button id="btn-mobile-menu-toggle" onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 rounded-full hover:bg-white/5 text-white cursor-pointer" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[82%] max-w-sm bg-neutral-950 border-l border-white/10 p-6 flex flex-col gap-1 lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold tracking-[0.1em] text-sm text-white uppercase">Menu</span>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-white cursor-pointer" aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`px-3 py-3 rounded-xl text-sm font-semibold uppercase tracking-wide hover:bg-white/5 cursor-pointer ${item.accent ? "text-red-400" : "text-white"}`}
                >
                  {item.label}
                </a>
              ))}
              <div className="h-[1px] bg-white/10 my-3" />
              {customer ? (
                <>
                  <button
                    onClick={() => {
                      setIsMobileOpen(false);
                      navigate("/account");
                    }}
                    className="px-3 py-3 rounded-xl text-sm font-semibold text-white text-left hover:bg-white/5 cursor-pointer"
                  >
                    My Account
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileOpen(false);
                      signOut();
                    }}
                    className="px-3 py-3 rounded-xl text-sm font-semibold text-red-400 text-left hover:bg-white/5 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    openAuthModal();
                  }}
                  className="px-3 py-3 rounded-xl text-sm font-semibold text-white text-left hover:bg-white/5 cursor-pointer"
                >
                  Account Log In
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CustomerAuthModal open={isAuthModalOpen} onClose={closeAuthModal} />
      <LoginModal open={showAdminLoginModal} onClose={() => setShowAdminLoginModal(false)} />
    </header>
  );
}
