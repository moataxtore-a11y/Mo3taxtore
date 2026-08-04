import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { FiShoppingCart, FiMenu, FiX, FiLogOut, FiGrid, FiUserPlus, FiLogIn, FiUser, FiUser as FiUserIcon, FiBookOpen, FiTrendingUp, FiInfo, FiHelpCircle, FiHome, FiShoppingBag, FiSettings, FiList, FiUsers, FiLayers, FiTruck, FiEdit, FiAlertCircle } from 'react-icons/fi';
import { 
  RiHome5Line, RiHome5Fill, 
  RiBookOpenLine, RiBookOpenFill, 
  RiStore2Line, RiStore2Fill, 
  RiListCheck, RiListUnordered,
  RiShoppingCart2Line, RiShoppingCart2Fill,
  RiSettings3Line, RiSettings3Fill,
  RiUser3Line, RiUser3Fill,
  RiPieChartLine, RiPieChartFill,
  RiLayoutGridLine, RiLayoutGridFill,
  RiFileList3Line, RiFileList3Fill,
  RiLayout6Line, RiLayout6Fill,
  RiLoginBoxLine, RiLoginBoxFill
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import logo from '../assets/LOGO.svg';
import CompanyCredit from './CompanyCredit';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const isAdminPath = window.location.pathname.startsWith('/admin');

  // Framer Motion Scroll Progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (user?.role === 'admin') {
        try {
          const res = await api.get('/admin/orders/pending-count');
          setPendingOrdersCount(res.data.count || 0);
        } catch (err) { console.error('Error fetching pending orders:', err); }
      }
    };

    // Initial fetch
    fetchPendingCount();

    // Auto-polling
    const interval = setInterval(fetchPendingCount, 60000); // Refresh every minute

    // Instant sync listener from AdminDashboard optimistic updates
    window.addEventListener('orderStatusUpdated', fetchPendingCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener('orderStatusUpdated', fetchPendingCount);
    };
  }, [user]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'teacher') return '/teacher/dashboard';
    return '/student/dashboard';
  };

  const navLinks = [
    { label: 'الكتب', path: '/marketplace', icon: FiBookOpen },
    { label: 'منتجات متجرنا', path: '/store', icon: FiGrid },
    { label: 'الأكثر مبيعاً', path: '/best-sellers', icon: FiTrendingUp },
    { label: 'مين إحنا؟', path: '/about', icon: FiInfo },
    { label: 'الأسئلة الشائعة', path: '/faq', icon: FiHelpCircle },
  ];

  const adminDockTabs = [
    { id: 'overview', label: 'الرئيسية', icon: RiPieChartLine, activeIcon: RiPieChartFill, path: '/admin?tab=overview' },
    { id: 'store_products', label: 'المتجر', icon: RiLayoutGridLine, activeIcon: RiLayoutGridFill, path: '/admin?tab=store_products' },
    { id: 'orders', label: 'الطلبات', icon: RiFileList3Line, activeIcon: RiFileList3Fill, path: '/admin?tab=orders', badge: pendingOrdersCount, badgeColor: 'bg-red-500' },
    { id: 'books', label: 'الكتب', icon: RiBookOpenLine, activeIcon: RiBookOpenFill, path: '/admin?tab=books' },
    { id: 'settings', label: 'المزيد', icon: RiLayout6Line, activeIcon: RiLayout6Fill, path: null, isMore: true },
  ];

  const currentTabs = isAdminPath && user?.role === 'admin'
    ? adminDockTabs
    : [
      { id: 'home', label: 'الرئيسية', icon: RiHome5Line, activeIcon: RiHome5Fill, path: '/' },
      { id: 'books', label: 'الكتب', icon: RiBookOpenLine, activeIcon: RiBookOpenFill, path: '/marketplace' },
      {
        id: 'orders_notif',
        label: 'طلبات',
        icon: RiFileList3Line,
        activeIcon: RiFileList3Fill,
        path: '/admin?tab=orders',
        badge: pendingOrdersCount,
        adminOnly: true,
        badgeColor: 'bg-red-500'
      },
      { id: 'store', label: 'المتجر', icon: RiStore2Line, activeIcon: RiStore2Fill, path: '/store' },
      { id: 'cart', label: 'السلة', icon: RiShoppingCart2Line, activeIcon: RiShoppingCart2Fill, path: '/cart', badge: totalItems },
      {
        id: 'settings',
        label: user ? 'الاعدادات' : 'دخول',
        icon: user ? RiSettings3Line : RiLoginBoxLine, 
        activeIcon: user ? RiSettings3Fill : RiLoginBoxFill,
        path: user ? null : '/login'
      },
    ].filter(tab => !tab.adminOnly || user?.role === 'admin');

  return (
    <nav
      className={`fixed left-0 right-0 z-[990] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex justify-center ${isScrolled ? 'top-4 px-4 lg:px-0' : 'top-0 px-0'
        }`}
    >
      <div
        className={`transition-all duration-500 flex flex-col w-full relative ${isScrolled
          ? 'lg:w-auto lg:min-w-[1000px] xl:min-w-[1150px] lg:max-w-[95%] rounded-3xl bg-white/70 backdrop-blur-3xl shadow-2xl border border-white/40 lg:border-black/5 py-1 px-2'
          : 'max-w-full rounded-none bg-white/80 backdrop-blur-2xl shadow-lg border-b border-black/5 py-4 px-4 sm:px-8 lg:px-12'
          }`}
      >
        <div className="flex justify-between items-center w-full min-h-[60px] mx-auto max-w-7xl relative px-4" dir="rtl">

          {/* Right Side (Desktop) - Navigation Links */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = window.location.pathname === link.path;
              return (
                <Link key={link.path} to={link.path} className={`group flex items-center rounded-xl transition-all duration-300 ${isActive ? 'text-[#31605f] bg-[#31605f]/10 px-4 py-2 gap-2 shadow-sm' : 'text-slate-600 hover:text-[#31605f] hover:bg-black/5 px-3 py-2 hover:gap-2'}`}>
                  <Icon className="flex-shrink-0 w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  <span className={`font-bold text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${isActive ? 'max-w-[120px] opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100'}`}>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Center (Desktop/Mobile) - Logo */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
            <Link 
              to="/" 
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="group flex items-center"
              style={{ pointerEvents: 'auto' }}
            >
              <img
                src={logo}
                alt="Moataxtore Logo"
                className={`w-auto transition-all duration-300 drop-shadow-lg ${isScrolled ? 'h-8 lg:h-10' : 'h-10 lg:h-14'}`}
              />
            </Link>
          </div>

          {/* Left Side (Desktop) - User Actions (Cart, Profile, Login) */}
          <div className="hidden lg:flex items-center gap-4">
            {!user ? (
              <div className="flex items-center gap-3">
                <Link to="/login" className="hover:bg-black/5 px-6 py-2.5 rounded-2xl font-black text-slate-700 text-sm transition-all">دخول</Link>
                <Link to="/register" className="shadow-black/5 shadow-xl hover:shadow-2xl px-6 py-2.5 rounded-2xl font-black text-white text-sm transition-all bg-[#31605f] hover:bg-[#254948] whitespace-nowrap">اشترك الآن</Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {user.role === 'admin' && (
                  <Link to="/admin?tab=orders" className="relative hover:bg-black/5 p-2.5 rounded-xl text-[#31605f] transition-all">
                    <FiList className="w-6 h-6" />
                    {pendingOrdersCount > 0 && (
                      <span className="-top-1 -right-1 absolute flex justify-center items-center bg-red-500 shadow-lg rounded-full w-5 h-5 font-black text-[10px] text-white animate-bounce">
                        {pendingOrdersCount}
                      </span>
                    )}
                  </Link>
                )}
                <Link to="/cart" className="relative hover:bg-black/5 p-2.5 rounded-xl text-slate-700 transition-all">
                  <FiShoppingCart className="w-6 h-6" />
                  {totalItems > 0 && <span className="-top-1 -right-1 absolute flex justify-center items-center bg-[#31605f] shadow-lg rounded-full w-5 h-5 font-black text-[10px] text-white animate-in zoom-in duration-300">{totalItems}</span>}
                </Link>
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 hover:bg-black/5 p-1.5 rounded-xl transition-all">
                    <div className="flex justify-center items-center shadow-lg border-2 border-black/10 rounded-full w-10 h-10 font-bold text-white text-base bg-[#31605f] hover:rotate-6 transition-transform">
                      <FiUserIcon className="w-5 h-5" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.95 }} className="left-0 absolute bg-white/90 shadow-2xl backdrop-blur-2xl mt-4 p-2 border border-primary/5 rounded-2xl w-64 overflow-hidden z-[120]">
                        <div className="flex items-center gap-3 bg-primary/5 mb-2 px-4 py-4 border-border border-b rounded-xl">
                          <div className="flex justify-center items-center bg-primary rounded-full w-10 h-10 font-bold text-white text-sm">{user.name?.charAt(0)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-text-primary text-sm truncate">{user.name}</p>
                            <p className="text-[10px] text-text-muted truncate">{user.email}</p>
                          </div>
                        </div>
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="group flex justify-between items-center hover:bg-primary/10 px-4 py-3 rounded-xl font-bold text-text-secondary hover:text-primary text-sm transition-all">
                          <span className="flex items-center gap-3"><FiUserIcon className="w-4 h-4 text-primary/70" /> البروفايل</span>
                        </Link>
                        <Link to={getDashboardLink()} onClick={() => setUserMenuOpen(false)} className="group flex justify-between items-center hover:bg-primary/10 px-4 py-3 rounded-xl font-bold text-text-secondary hover:text-primary text-sm transition-all">
                          <span className="flex items-center gap-3"><FiGrid className="w-4 h-4 text-primary/70" />إدارة</span>
                        </Link>
                        <div className="mt-1 pt-1 border-primary/5 border-t">
                          <button onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }} className="group flex justify-between items-center hover:bg-red-50 px-4 py-3 rounded-xl w-full font-bold text-red-500 text-sm text-right transition-all">
                            <span className="flex items-center gap-3"><FiLogOut className="w-4 h-4" /> تسجيل الخروج</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Integrated Progress Bar with Clipping Mask */}
        <div className={`absolute inset-0 pointer-events-none overflow-hidden transition-all duration-500 ${isScrolled ? 'rounded-3xl' : 'rounded-none'}`}>
          <AnimatePresence>
            {isScrolled && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute left-0 right-0 bottom-0 bg-primary/10 h-[2.5px] overflow-hidden"
              >
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-primary-dark shadow-[0_0_10px_rgba(49,96,95,0.5)]" 
                  style={{ scaleX, originX: 0 }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Bottom Navigation Dock */}
      <div className="lg:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-[110] w-[92%] max-w-sm">
        {/* Mobile Context Menu Tooltip */}
        <AnimatePresence>
          {user && mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.8 }} className="absolute bottom-[110%] left-0 right-0 px-2 pointer-events-none">
              <div className="bg-white/95 shadow-[0_15px_60px_rgba(49,96,95,0.3)] backdrop-blur-2xl p-2 border border-primary/5 rounded-3xl w-full pointer-events-auto overflow-hidden">
                <div className="bg-primary/5 p-3 rounded-2xl mb-2 text-center">
                  <p className="font-black text-text-primary text-xs truncate">أهلاً، {user.name?.split(' ')[0]} - {isAdminPath ? 'قائمة الإدارة' : 'الإعدادات'}</p>
                </div>

                {isAdminPath ? (
                  <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-sidebar-scroll p-1">
                    {[
                      { id: 'users', label: 'المستخدمين', icon: FiUsers },
                      { id: 'categories', label: 'المواد', icon: FiGrid },
                      { id: 'store_categories', label: 'اقسام المتجر', icon: FiGrid },
                      { id: 'grades', label: 'الصفوف الدراسية', icon: FiLayers },
                      { id: 'coupons', label: 'الكوبونات', icon: FiTrendingUp },
                      { id: 'logistics', label: 'اسعار الشحن', icon: FiTruck },
                      { id: 'cms', label: 'المحتوى العام', icon: FiEdit },
                      { id: 'announcements', label: 'الرسائل والإعلانات', icon: FiAlertCircle },
                      { id: 'teachers_list', label: 'المدرسين', icon: FiUsers },
                    ].map(tab => (
                      <Link
                        key={tab.id}
                        to={`/admin?tab=${tab.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 bg-primary/5 hover:bg-primary/10 p-3 rounded-2xl transition-all"
                      >
                        <tab.icon className="w-4 h-4 text-primary" />
                        <span className="font-black text-[11px] text-text-secondary">{tab.label}</span>
                      </Link>
                    ))}
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="col-span-2 flex items-center justify-center gap-2 bg-secondary/10 hover:bg-secondary/20 py-3.5 rounded-2xl font-black text-secondary text-xs transition-all">
                      <FiUserIcon className="w-4 h-4" /> البروفايل الشخصي
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1">
                    <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 py-3.5 rounded-2xl font-bold text-primary text-xs transition-all">
                      <FiSettings className="w-4 h-4" /> الداشبورد
                    </Link>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 py-3.5 rounded-2xl font-bold text-primary text-xs transition-all">
                      <FiUserIcon className="w-4 h-4" /> البروفايل
                    </Link>
                  </div>
                )}

                <button onClick={() => { logout(); setMobileMenuOpen(false); navigate('/'); }} className="flex items-center justify-center gap-3 bg-red-50 hover:bg-red-100 py-3.5 mt-2 rounded-2xl w-full font-black text-red-500 text-xs transition-all">
                  <FiLogOut className="w-4 h-4" /> تسجيل الخروج
                </button>
                <div className="mt-3 pt-3 border-[#31605f]/15 dark:border-white/10 border-t text-center">
                  <CompanyCredit className="text-[#5F7A79] hover:text-[#31605F] dark:text-slate-300 dark:hover:text-white text-[10px] font-medium" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl px-2 py-2 border border-white/40 rounded-[2.5rem] flex items-center justify-around relative">
          {currentTabs.map((tab) => {
            const tabPathname = tab.path?.split('?')[0];
            const tabSearch = tab.path?.split('?')[1];

            const isTabActive = tab.path && (
              tabSearch
                ? (location.pathname === tabPathname && location.search.includes(tabSearch))
                : (location.pathname === tabPathname)
            );

            const Icon = (isTabActive && tab.activeIcon) ? tab.activeIcon : tab.icon;
            const isTabActiveColor = isTabActive || (tab.isMore && mobileMenuOpen);

            const content = (
              <div className={`flex flex-col items-center justify-center px-1 py-1.5 rounded-2xl transition-all duration-300 relative z-10 ${isTabActiveColor ? 'text-[#31605f]' : 'text-slate-500'}`}>
                <div className="relative">
                  <Icon className={`w-6 h-6 mb-0.5 transition-all duration-300 ${isTabActiveColor ? 'scale-110' : ''}`} />
                  {tab.badge > 0 && (
                    <span className={`absolute -top-1.5 -right-1.5 ${tab.badgeColor || 'bg-[#31605f]'} text-white text-[9px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${tab.id === 'orders' || tab.id === 'orders_notif' ? 'animate-bounce' : ''}`}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-black transition-all duration-300 ${isTabActive ? 'opacity-100' : 'opacity-70'}`}>{tab.label}</span>
              </div>
            );

            return (
              <div key={tab.id} className="flex-1 relative">
                {(isTabActive) && (
                  <motion.div
                    layoutId="dock-pill"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[90%] aspect-square bg-[#31605f]/10 rounded-full z-0 border border-[#31605f]/10 shadow-inner"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {((tab.isMore || (tab.id === 'settings' && user)) && !tab.path) ? (
                  <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-full outline-none py-1">
                    {content}
                  </button>
                ) : (
                  <Link to={tab.path} onClick={() => setMobileMenuOpen(false)} className="block py-1">
                    {content}
                  </Link>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
