import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/LOGO.svg';

const SplashScreen = ({ onReady }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Artificial delay for splash screen or wait for critical data
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Ensure onReady is called after animation finishes or simultaneous
      if (onReady) setTimeout(onReady, 500);
    }, 800);

    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#E0F3E9] via-white to-[#E0F3E9]"
        >
          {/* Animated Background Blobs */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#069484]/10 rounded-full blur-[120px] pointer-events-none"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], rotate: [0, -45, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#069484]/10 rounded-full blur-[150px] pointer-events-none"
          />

          <div className="relative z-10 flex flex-col items-center gap-12">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
              animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/50 blur-[40px] rounded-full -m-6" />
              <img
                src={logo}
                alt="Logo"
                className="w-48 h-48 md:w-64 md:h-64 drop-shadow-[0_20px_40px_rgba(6,148,132,0.25)] relative"
              />
            </motion.div>

            <div className="flex flex-col items-center gap-4">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="font-heading font-black text-4xl md:text-5xl text-[#1E2F2E] tracking-tight"
              >
                {/* معتز <span className="text-[#069484]">ستور</span> */}
              </motion.h1>

              <div className="flex gap-1.5 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 bg-[#069484] rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-12 font-bold text-[#8FA7A6] tracking-widest uppercase text-xs"
          >
            جاري التحميل...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
