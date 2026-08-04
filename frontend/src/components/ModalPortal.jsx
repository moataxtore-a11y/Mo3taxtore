import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const ModalPortal = ({ children, isOpen = true }) => {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="relative z-[99999] modal-portal-root">
      {children}
    </div>,
    document.body
  );
};

export default ModalPortal;
