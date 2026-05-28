import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiChevronRight, FiChevronLeft, FiX } from 'react-icons/fi';
import api from '../services/api';
import { getIcon } from '../utils/icons';

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements');
        setAnnouncements(res.data.announcements || []);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [announcements]);

  if (!isVisible || announcements.length === 0) return null;

  const current = announcements[currentIndex];
  const Icon = getIcon(current.icon || 'FiAlertCircle');

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="relative z-[100] bg-gradient-to-r from-primary-dark via-primary to-primary-dark shadow-lg overflow-hidden"
    >
      <div className="mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center min-h-[50px] md:min-h-[64px] py-2 md:py-3">
          
          {/* Controls - Left (Next in RTL) */}
          <div className="flex items-center gap-1 z-10">
             {announcements.length > 1 && (
               <button 
                 onClick={() => setCurrentIndex((prev) => (prev + 1) % announcements.length)}
                 className="hover:bg-white/10 p-1.5 rounded-full text-white/80 transition-colors"
                 title="التالي"
               >
                 <FiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
               </button>
             )}
          </div>

          {/* Content */}
          <div className="relative flex-1 flex justify-center items-center overflow-hidden">
             <AnimatePresence mode="wait">
               <motion.div
                 key={current._id}
                 initial={{ y: 15, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: -15, opacity: 0 }}
                 transition={{ duration: 0.4, ease: "easeOut" }}
                 className="flex items-center w-full justify-center"
               >
                 {current.displayType === 'marquee' ? (
                    <div className="group relative w-full overflow-hidden flex items-center justify-center">
                      <div className="animate-banner-marquee whitespace-nowrap flex items-center gap-12 font-bold text-white text-xs md:text-sm tracking-wide">
                         {[1, 2, 3, 4, 5].map(i => (
                             <div key={i} className="flex items-center gap-3">
                               <Icon className="shrink-0 text-white/50 w-4 h-4 md:w-5 md:h-5" />
                               {current.link ? (
                                 <a href={current.link} target="_blank" rel="noopener noreferrer" className="hover:underline font-black text-sm md:text-lg tracking-wide uppercase">{current.text}</a>
                               ) : (
                                 <span className="font-black text-sm md:text-lg tracking-wide uppercase">{current.text}</span>
                               )}
                            </div>
                         ))}
                      </div>
                    </div>
                 ) : (
                    <div className="flex items-center gap-3 px-4 text-center">
                      <Icon className="shrink-0 text-white/60 w-5 h-5 md:w-6 md:h-6" />
                      {current.link ? (
                        <a 
                          href={current.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-black text-white text-sm md:text-xl hover:underline tracking-wide underline-offset-8"
                        >
                          {current.text}
                        </a>
                      ) : (
                        <span className="font-black text-white text-sm md:text-xl tracking-wide">
                          {current.text}
                        </span>
                      )}
                    </div>
                 )}
               </motion.div>
             </AnimatePresence>
          </div>

          {/* Controls - Right (Close & Prev) */}
          <div className="flex items-center gap-1 md:gap-2 z-10">
            {announcements.length > 1 && (
                 <button 
                   onClick={() => setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)}
                   className="hover:bg-white/10 p-2 rounded-full text-white/80 transition-colors hidden md:block"
                   title="السابق"
                 >
                   <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                 </button>
               )}
            <button 
              onClick={() => setIsVisible(false)}
              className="hover:bg-white/10 p-2 rounded-full text-white/80 transition-colors ml-2"
              title="إغلاق التنبيه"
            >
              <FiX className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Marquee Background Effect (Enhanced) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden select-none">
        <div className="animate-bg-marquee whitespace-nowrap py-0 font-black text-white text-7xl uppercase italic">
            {current.text} • {current.text} • {current.text} • {current.text}
        </div>
      </div>
      
      <style>{`
        @keyframes banner-marquee {
          0% { transform: translateX(20%); }
          100% { transform: translateX(-20%); }
        }
        .animate-banner-marquee {
          display: flex;
          animation: banner-marquee 20s linear infinite;
        }
        .animate-banner-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes bg-marquee {
          0% { transform: translateX(50%); }
          100% { transform: translateX(-50%); }
        }
        .animate-bg-marquee {
          display: inline-block;
          animation: bg-marquee 60s linear infinite;
        }
      `}</style>
    </motion.div>
  );
};

export default AnnouncementBanner;
