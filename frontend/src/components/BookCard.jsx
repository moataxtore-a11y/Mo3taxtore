import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiPlus, FiMinus, FiBook, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useState } from 'react';

import discountSvg from '../assets/discount.svg';

const BookCard = ({ book }) => {
  const { items, addToCart, updateQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = items.find(item => item._id === book._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addToCart(book);
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity === 0) {
      addToCart(book);
    } else {
      updateQuantity(book._id, quantity + 1);
    }
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 0) {
      updateQuantity(book._id, quantity - 1);
    }
  };

  const teacherName = (() => {
    if (book?.teacherName) return book.teacherName;
    if (!book?.teacher) return '';
    if (typeof book.teacher === 'string') {
      const maybeObjectId = /^[a-f\d]{24}$/i.test(book.teacher);
      return maybeObjectId ? '' : book.teacher;
    }
    return book.teacher?.name || '';
  })();

  // Image optimization via Cloudinary
  const getOptimizedImage = (url) => {
    if (!url) return '';
    if (url.includes('cloudinary.com') && !url.includes('q_auto')) {
      // Set width to 800px for sharp display on Retina screens while saving bandwidth
      return url.replace('/upload/', '/upload/w_800,q_auto,f_auto/');
    }
    return url;
  };
  const optimizedCoverImage = getOptimizedImage(book.coverImage);

  return (
    <Link to={`/books/${book._id}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="group relative flex flex-col bg-[#31605F]/80 backdrop-blur-xl p-4 border border-white/10 rounded-[2.5rem] transition-all cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        {/* Cover Image Container */}
        <div className="relative shadow-2xl mb-6 border border-white/5 rounded-[2rem] aspect-square overflow-hidden">
          {book.coverImage ? (
            <img
              src={optimizedCoverImage}
              alt={book.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="flex justify-center items-center bg-gradient-to-br from-white/5 to-white/10 w-full h-full">
              <FiBook className="text-white/20 text-7xl" />
            </div>
          )}

          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#31605F]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Out of Stock Overlay */}
          {book.stock <= 0 && (
            <div className="z-30 absolute inset-0 flex flex-col justify-center items-center bg-black/10 backdrop-blur-[2px] rounded-[2rem]">
              <div className="flex flex-col items-center gap-2 px-4 text-center">
                <span className="text-4xl"><FiX className="text-white text-4xl" /></span>
                <p className="drop-shadow-lg font-bold text-white text-sm md:text-base leading-relaxed">
                  يصديقي المنتج ده خلص حالياً
                </p>
                <p className="text-white/70 text-xs md:text-sm">
                  هيتم توفيره قريب...
                </p>
              </div>
            </div>
          )}

          {/* Discount Badge */}
          {book.discount > 0 && (
            <div className="top-2 right-2 z-40 absolute flex justify-center items-center drop-shadow-xl w-14 md:w-16 h-14 md:h-16 group-hover:scale-110 transition-transform duration-300 pointer-events-none">
              <img src={discountSvg} alt="Discount" className="w-full h-full object-contain animate-pulse-slow" />
              <div className="absolute flex flex-col justify-center items-center text-white text-center leading-tight">
                <span className="font-heading font-black text-[10px] md:text-xs tracking-tighter">خصم</span>
                <span className="font-heading font-black text-xs md:text-sm">%{book.discount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col px-1 text-center">
          <h3 className="mb-3 font-bold text-[#ffffff] text-xl md:text-2xl leading-tight">
            {book.title}
          </h3>

          {teacherName && (
            <p className="mb-2 font-medium text-[#4FD1C5] text-base">
              {teacherName}
            </p>
          )}

          {book.description && (
            <div className="mb-4">
              <p className="font-normal text-white/60 text-sm line-clamp-2 leading-relaxed">
                {book.description}
              </p>
              <div className="mt-2 font-bold text-[#ffffff] text-xs hover:underline transition-all group-hover:translate-x-[-4px]">
                عرض مزيد من التفاصيل ←
              </div>
            </div>
          )}

          {/* Divider with Glow */}
          <div className="relative flex justify-center items-center mb-5 h-1">
            <div className="bg-gradient-to-r from-transparent via-[#4FD1C5]/30 to-transparent w-full h-[1px]" />
            <div className="absolute bg-[#4FD1C5] shadow-[0_0_8px_rgba(79,209,197,0.8)] rounded-full w-1.5 h-1.5" />
          </div>

          <div className="flex justify-center items-center gap-2 mb-8 font-medium text-white/50 text-xs uppercase tracking-wider">
            <span>{book.category_ar || 'تاريخ'}</span>
            <span className="text-[#4FD1C5]/40">•</span>
            <span>{book.grade || '٣ ث'}</span>
          </div>

          {book.triggersFreeShipping && (
            <div className="flex justify-center items-center gap-2 bg-emerald-500/20 group-hover:bg-emerald-500/30 shadow-inner mb-4 p-3 border border-emerald-500/30 rounded-2xl transition-all">
              <span className="font-black text-emerald-400 text-sm text-center">
                شحن مجاني عند إضافة هذا الكتاب للسلة
              </span>
            </div>
          )}

          {/* Bottom Actions Area */}
          <div className="mt-auto">
            <div className="flex flex-col gap-4">
              {/* Main Price Tag (Prominent) */}
              <div className="flex flex-col items-center bg-white/5 group-hover:bg-[#4FD1C5]/10 backdrop-blur-md py-4 border border-white/10 group-hover:border-[#4FD1C5]/30 rounded-2xl transition-all">
                <div className="flex flex-col items-center gap-2">
                  {book.discount > 0 && (
                    <span className="mb-1 font-black text-[#CBDDD3] text-sm md:text-base">
                      خصم لفترة محدودة {book.discount}%
                    </span>
                  )}

                  <div className="flex flex-wrap justify-center items-center gap-3">
                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-white text-2xl md:text-4xl tracking-tight">
                        {book.discount > 0 ? book.priceAfterDiscount : book.price}
                      </span>
                      <span className="font-bold text-white/80 text-base">جنيهًا</span>
                    </div>

                    {book.discount > 0 && (
                      <div className="flex items-center gap-2 text-white/40">
                        <span className="font-bold text-sm">بدلاً من</span>
                        <span className="font-black text-lg md:text-xl decoration-red-500/50 line-through">
                          {book.price}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Controls - Redesigned */}
              {book.stock <= 0 ? (
                <div className="bg-[#F84F3B]/20 shadow-inner backdrop-blur-md p-4 border border-red-500/30 rounded-2xl transition-all">
                  <p className="font-bold text-red-300 text-sm md:text-base text-center leading-relaxed">
                    المنتج ده خلص حالياً هيتم توفيره قريب...
                  </p>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-black/20 p-1.5 border border-white/5 rounded-full" dir="ltr">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDecrement}
                    className="flex justify-center items-center bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 rounded-full w-9 h-9 text-white/70 hover:text-red-400 transition-all"
                  >
                    <FiMinus className="w-4 h-4" />
                  </motion.button>

                  <div className="flex flex-col items-center px-4">
                    <span className="font-black text-white text-lg leading-none">
                      {quantity}
                    </span>
                    <span className="font-bold text-[10px] text-white/30 uppercase">الكمية</span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleIncrement}
                    className="flex justify-center items-center bg-white/5 hover:bg-[#4FD1C5]/20 border border-white/10 hover:border-[#4FD1C5]/50 rounded-full w-9 h-9 text-white/70 hover:text-[#4FD1C5] transition-all"
                  >
                    <FiPlus className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default BookCard;
