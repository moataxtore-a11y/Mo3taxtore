import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const BookLoader = () => {
  const location = useLocation();

  const pageNames = {
    '/': 'الرئيسية',
    '/marketplace': 'الكتب المتاحة',
    '/admin': 'الداشبورد',
    '/teacher/dashboard': 'لوحة المعلم',
    '/student/dashboard': 'ادارة الطلبات',
    '/profile': 'الملف الشخصي',
    '/cart': 'الطلبات',
    '/checkout': 'صفحة إتمام الطلب',
    '/about': 'قصتنا',
    '/faq': 'الأسئلة الشائعة',
    '/best-sellers': 'للكتب الأكثر مبيعاً'
  };

  let currentPage = 'الصفحة';
  if (location.pathname.startsWith('/books/')) {
    currentPage = 'تفاصيل الكتاب';
  } else {
    currentPage = pageNames[location.pathname] || 'الصفحة المطلوبة';
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8">
      {/* Animated Book */}
      <div className="relative w-24 h-16 perspective-[1000px]">
        {/* Spine */}
        <div className="absolute left-1/2 -translate-x-1/2 w-4 h-full bg-gradient-to-r from-primary to-primary-dark rounded-sm z-10 shadow-[inset_0_0_10px_rgba(0,0,0,0.3)]" />
        
        {/* Flipping Pages (Right side animated, originating from center) */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute right-1/2 w-10 h-full bg-white border border-[#EEF4F3] rounded-l-md"
            style={{ originX: 1, zIndex: 20 - i }}
            animate={{
              rotateY: [0, -160, -180],
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
          >
            <div className="absolute inset-1.5 flex flex-col gap-1 opacity-20">
              <div className="h-1 bg-primary w-3/4 rounded-full" />
              <div className="h-1 bg-primary w-full rounded-full" />
              <div className="h-1 bg-primary w-5/6 rounded-full" />
            </div>
          </motion.div>
        ))}
        
        {/* Static Left Page */}
        <div className="absolute right-1/2 w-10 h-full bg-white border border-[#EEF4F3] rounded-l-md shadow-lg flex flex-col gap-1 p-1.5 opacity-50">
             <div className="h-1 bg-primary w-full rounded-full" />
             <div className="h-1 bg-primary w-4/5 rounded-full" />
             <div className="h-1 bg-primary w-5/6 rounded-full" />
        </div>
        {/* Static Right Page */}
        <div className="absolute left-1/2 w-10 h-full bg-white border border-[#EEF4F3] rounded-r-md shadow-lg flex flex-col gap-1 p-1.5">
             <div className="h-1 bg-primary w-3/4 rounded-full" />
             <div className="h-1 bg-primary w-full rounded-full" />
             <div className="h-1 bg-primary w-4/5 rounded-full" />
        </div>
      </div>

      {/* Dynamic Text */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex flex-wrap justify-center items-center gap-2 font-heading font-black text-2xl">
          <motion.span
            className="text-text-muted"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            جاري تحميل
          </motion.span>
          <span className="text-primary">
            {currentPage}
          </span>
        </div>
        <p className="text-text-muted text-sm mt-2 font-bold">
          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>لحظات من فضلك...</motion.span>
        </p>
      </div>
    </div>
  );
};

export default BookLoader;
