import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "تأكيد", cancelText = "إلغاء", type = "danger" }) => {

  const colors = {
    danger: {
      bg: "bg-red-50",
      icon: "text-red-500",
      button: "bg-red-500 hover:bg-red-600 shadow-red-500/30",
      ring: "ring-red-100"
    },
    warning: {
      bg: "bg-amber-50",
      icon: "text-amber-500",
      button: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30",
      ring: "ring-amber-100"
    },
    success: {
        bg: "bg-emerald-50",
        icon: "text-emerald-500",
        button: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30",
        ring: "ring-emerald-100"
    }
  };

  const activeColors = colors[type] || colors.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 max-w-md w-full border border-white/80"
            dir="rtl"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 left-6 p-2 rounded-full hover:bg-bg/80 text-text-muted transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className={`${activeColors.bg} p-6 rounded-full ring-8 ${activeColors.ring}`}>
                <FiAlertTriangle className={`w-12 h-12 ${activeColors.icon}`} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-text-primary font-heading">
                  {title}
                </h3>
                <p className="text-text-secondary font-bold leading-relaxed px-4">
                  {message}
                </p>
              </div>

              <div className="flex gap-4 w-full pt-4">
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-4 rounded-2xl font-black text-white transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] ${activeColors.button}`}
                >
                  {confirmText}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-black text-text-primary bg-bg/80 hover:bg-white transition-all border border-primary/5 hover:shadow-lg"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
