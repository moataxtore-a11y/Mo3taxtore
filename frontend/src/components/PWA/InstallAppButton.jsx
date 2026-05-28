import React, { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const InstallAppButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-80 z-[100]"
      >
        <div className="bg-white shadow-2xl rounded-[2rem] p-6 border border-primary/10 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />
          
          <div className="bg-primary/10 p-4 rounded-2xl text-primary shrink-0">
            <FiDownload className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-black text-text-primary text-sm mb-1">تثبيت التطبيق</h4>
            <p className="text-[10px] text-text-secondary font-bold leading-tight line-clamp-2">
              استمتع بتجربة أسرع وأفضل عبر تثبيت التطبيق على جهازك.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-lg shadow-primary/20 active:scale-95 whitespace-nowrap"
            >
              تثبيت الآن
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-text-muted hover:text-red-500 text-[10px] font-bold transition-all text-center"
            >
              ليس الآن
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallAppButton;
