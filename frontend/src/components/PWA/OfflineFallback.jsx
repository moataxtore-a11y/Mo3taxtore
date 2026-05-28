import React, { useState, useEffect } from 'react';
import { FiWifiOff, FiRefreshCcw, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const OfflineFallback = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-gradient-to-br from-white to-[#E0F3E9] text-center"
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -mr-40 -mt-40 animate-pulse-soft" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -ml-40 -mb-40 animate-float" />

      <div className="relative max-w-sm w-full mx-auto space-y-12">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-40 h-40 mx-auto bg-white shadow-2xl rounded-[3rem] flex items-center justify-center border border-primary/10 relative z-10"
          >
            <FiWifiOff className="w-20 h-20 text-[#069484] drop-shadow-md" />
          </motion.div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-2 rounded-full font-black text-xs shadow-xl shadow-red-500/30 z-20 whitespace-nowrap">
            أنت في وضع عدم الاتصال
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-heading font-black text-4xl text-text-primary leading-tight">عذراً، انقطع الاتصال بالإنترنت!</h2>
          <p className="font-medium text-text-secondary text-lg leading-relaxed px-4">
            تحقق من اتصالك بالشبكة للمتابعة، أو يمكنك الوصول إلى المحتوى المحمل مسبقاً.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-3 bg-[#069484] hover:bg-[#057a6c] text-white px-10 py-5 rounded-[2rem] font-black text-xl transition-all shadow-2xl shadow-primary/30 active:scale-95 group"
          >
            <FiRefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
            إعادة المحاولة
          </button>
          
          <Link
            to="/"
            className="flex items-center justify-center gap-3 bg-white hover:bg-white/80 text-[#069484] px-10 py-5 rounded-[2rem] font-black text-xl transition-all shadow-xl border border-primary/20"
          >
            <FiHome className="w-6 h-6" />
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OfflineFallback;
