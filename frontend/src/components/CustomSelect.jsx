import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { createPortal } from 'react-dom';

const CustomSelect = ({ value, onChange, options, placeholder, className = "", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropDirection, setDropDirection] = useState('down');
  const [dropdownPos, setDropdownPos] = useState(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value || opt === value);
  const displayLabel = selectedOption?.label || selectedOption || placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        !(dropdownRef.current && dropdownRef.current.contains(event.target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updatePos = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPos({
        left: rect.left,
        width: rect.width,
        top: rect.top,
        bottom: rect.bottom,
      });
    };

    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const reservedBottom = window.innerWidth < 1024 ? 130 : 0;
      const spaceBelow = window.innerHeight - reservedBottom - rect.bottom;
      const spaceAbove = rect.top;
      
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        setDropDirection('up');
      } else {
        setDropDirection('down');
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div ref={containerRef} className={`relative ${className} ${isOpen ? 'z-[3000]' : 'z-[10]'}`} dir="rtl">
      {/* Trigger Button */}
      <motion.div
        whileTap={disabled ? {} : { scale: 0.98 }}
        onClick={handleToggle}
        className={`bg-white/80 backdrop-blur-2xl px-6 py-4 border border-white/60 rounded-[2rem] flex items-center justify-between transition-all ${disabled ? 'opacity-60 cursor-not-allowed shadow-none' : 'cursor-pointer hover:shadow-lg'} ${isOpen ? 'ring-4 ring-primary/5 border-primary/40 shadow-xl' : 'shadow-sm hover:border-primary/20'}`}
      >
        <span className={`font-black text-sm transition-colors ${value ? 'text-text-primary' : 'text-text-muted opacity-60'}`}>
          {displayLabel}
        </span>
        <motion.div
            animate={{ rotate: isOpen ? (dropDirection === 'up' ? -180 : 180) : 0 }}
            className={`${disabled ? 'text-text-muted' : 'text-primary'} font-black`}
        >
            <FiChevronDown className="stroke-[3px] w-5 h-5" />
        </motion.div>
      </motion.div>
 
      {/* Dropdown Options */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && dropdownPos && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: dropDirection === 'up' ? -15 : 15, scale: 0.95 }}
              animate={{ opacity: 1, y: dropDirection === 'up' ? -8 : 8, scale: 1 }}
              exit={{ opacity: 0, y: dropDirection === 'up' ? -15 : 15, scale: 0.95 }}
              style={{
                transformOrigin: dropDirection === 'up' ? 'bottom center' : 'top center',
                position: 'fixed',
                left: dropdownPos.left,
                width: dropdownPos.width,
                top: dropDirection === 'up' ? dropdownPos.top - 8 : dropdownPos.bottom + 8,
                transform: dropDirection === 'up' ? 'translateY(-100%)' : undefined,
              }}
              className="z-[4000] bg-white/95 shadow-[0_20px_60px_-15px_rgba(49,96,95,0.2)] backdrop-blur-3xl border border-white/80 rounded-[2.5rem] overflow-hidden"
              dir="rtl"
            >
              <style>
                  {`
                  .custom-select-list::-webkit-scrollbar {
                    width: 5px;
                  }
                  .custom-select-list::-webkit-scrollbar-track {
                    background: rgba(49, 96, 95, 0.05);
                    margin: 15px 0;
                  }
                  .custom-select-list::-webkit-scrollbar-thumb {
                    background: rgba(49, 96, 95, 0.15);
                    border-radius: 10px;
                  }
                  .custom-select-list::-webkit-scrollbar-thumb:hover {
                    background: rgba(49, 96, 95, 0.25);
                  }
                  `}
              </style>
              <div className="p-3 max-h-72 overflow-y-auto custom-select-list">
                {options.map((option, index) => {
                  const optValue = option.value !== undefined ? option.value : option;
                  const isSelected = optValue === value;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ x: -6, backgroundColor: isSelected ? undefined : 'rgba(49,96,95,0.04)' }}
                      onClick={() => {
                        onChange(optValue);
                        setIsOpen(false);
                      }}
                      className={`px-6 py-4 rounded-[1.5rem] mb-1 last:mb-0 cursor-pointer text-xs font-black flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'text-text-secondary hover:text-primary'
                      }`}
                    >
                      <span>{option.label || option}</span>
                      {isSelected && (
                          <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex justify-center items-center bg-white/20 rounded-full w-5 h-5"
                          >
                              <FiCheck className="stroke-[4px] w-3 h-3" />
                          </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default CustomSelect;
