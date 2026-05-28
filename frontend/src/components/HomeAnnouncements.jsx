import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight, FiChevronLeft, FiMessageCircle, FiArrowRight, FiX } from 'react-icons/fi';
import api from '../services/api';
import { getIcon } from '../utils/icons';
import { Link } from 'react-router-dom';

const HomeAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements');
        // Filter active and sort by priority
        const active = (res.data.announcements || [])
          .filter(a => a.isActive)
          .sort((a, b) => (b.priority || 0) - (a.priority || 0));
        setAnnouncements(active);
      } catch (err) {
        console.error('Failed to fetch home announcements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [announcements]);

  if (loading || announcements.length === 0 || !isVisible) return null;

  const current = announcements[currentIndex];
  const Icon = getIcon(current.icon || 'FiMessageCircle');

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 my-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden group"
      >
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-2xl shadow-primary/5 transition-all duration-500 group-hover:shadow-primary/10" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-6 left-6 z-20 p-2 bg-white/20 hover:bg-red-500/10 rounded-full text-primary hover:text-red-500 transition-all"
          title="إغلاق التنبيه"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          
          {/* Header/Badge Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-right gap-3 md:border-l md:border-primary/10 md:pl-8">
            <div className="bg-primary/10 p-4 rounded-3xl text-primary flex items-center justify-center shadow-inner">
               <FiMessageCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-heading font-black text-primary text-xl">تنبيهات معتز</h3>
              <p className="text-text-secondary text-sm font-bold opacity-60">آخر الأخبار والمستجدات</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 relative min-h-[100px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full"
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                   <div className="hidden md:flex flex-shrink-0 bg-white shadow-xl shadow-primary/5 w-16 h-16 rounded-2xl items-center justify-center text-primary border border-primary/5">
                      <Icon className="w-8 h-8" />
                   </div>
                   <div className="flex-1 text-center md:text-right">
                      <p className="text-text-primary text-lg md:text-2xl font-black leading-relaxed">
                        {current.text}
                      </p>
                      {current.link && (
                        <div className="mt-4 flex justify-center md:justify-start">
                           <a 
                             href={current.link} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="group/link inline-flex items-center gap-2 bg-primary/5 hover:bg-primary px-6 py-2.5 rounded-2xl text-primary hover:text-white font-black text-sm transition-all duration-300"
                           >
                             اكتشف المزيد
                             <FiArrowRight className="transition-transform group-hover/link:-translate-x-1" />
                           </a>
                        </div>
                      )}
                   </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Controls */}
          {announcements.length > 1 && (
            <div className="flex md:flex-col gap-3">
               <button 
                 onClick={() => setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)}
                 className="w-12 h-12 rounded-2xl bg-white shadow-lg border border-primary/5 flex items-center justify-center text-primary/40 hover:text-primary hover:scale-110 transition-all"
               >
                 <FiChevronRight className="w-6 h-6" />
               </button>
               <button 
                 onClick={() => setCurrentIndex((prev) => (prev + 1) % announcements.length)}
                 className="w-12 h-12 rounded-2xl bg-white shadow-lg border border-primary/5 flex items-center justify-center text-primary/40 hover:text-primary hover:scale-110 transition-all"
               >
                 <FiChevronLeft className="w-6 h-6" />
               </button>
            </div>
          )}
        </div>

        {/* Progress bar for auto-play */}
        {announcements.length > 1 && (
          <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full overflow-hidden">
             <motion.div 
               key={currentIndex}
               initial={{ width: 0 }}
               animate={{ width: "100%" }}
               transition={{ duration: 8, ease: "linear" }}
               className="h-full bg-primary"
             />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HomeAnnouncements;
