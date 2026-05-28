import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiUser, FiBookOpen, FiArrowRight, FiMinus, FiPlus, FiFrown, FiBook, FiCheck, FiX } from 'react-icons/fi';
import Slider from 'react-slick';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import BookCard from '../components/BookCard';
import BookLoader from '../components/BookLoader';
import discountSvg from '../assets/discount.svg';

const FloatingBlob = ({ color, size, top, left, delay, duration }) => (
  <motion.div
    animate={{
      y: [0, -20, 0],
      x: [0, 15, 0],
      scale: [1, 1.05, 1],
      rotate: [0, 5, -5, 0]
    }}
    transition={{ duration: duration || 8, repeat: Infinity, ease: 'easeInOut', delay: delay || 0 }}
    className="z-0 absolute opacity-40 blur-[80px] rounded-full pointer-events-none mix-blend-multiply filter"
    style={{ backgroundColor: color, width: size, height: size, top, left }}
  />
);

const BookDetailsPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [book, setBook] = useState(null);

  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const bookRes = await api.get(`/books/${id}`);
        setBook(bookRes.data.book);

        // Fetch recommended books
        let recBooks = [];
        if (bookRes.data.book.category) {
          try {
            const recRes = await api.get(`/books?category=${bookRes.data.book.category}&limit=6`);
            recBooks = recRes.data.books.filter(b => b._id !== id);
          } catch (e) { console.error(e) }
        }

        if (recBooks.length === 0) {
          try {
            const fallbackRes = await api.get(`/books?limit=6`);
            recBooks = fallbackRes.data.books.filter(b => b._id !== id);
          } catch (e) { console.error(e) }
        }
        setRecommended(recBooks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (!book) return;
    setIsAdding(true);
    addToCart(book, quantity);
    setTimeout(() => setIsAdding(false), 600);
  };

  const recSliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    rtl: true, // Use RTL mode for RTL site
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1.2, // Show a peek of the next card
          centerMode: false,
          dots: false,
        }
      }
    ],
  };

  if (loading) return <BookLoader />;

  if (!book) {
    return (
      <div className="flex flex-col justify-center items-center bg-transparent min-h-screen">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="flex justify-center mb-4 text-text-muted text-6xl">
          <FiFrown />
        </motion.div>
        <h2 className="mb-2 font-heading font-bold text-2xl">هذا الكتاب غير موجود</h2>
        <Link to="/marketplace" className="font-medium text-primary hover:underline">العودة للمكتبة →</Link>
      </div>
    );
  }

  return (
    <div className="relative bg-transparent selection:bg-[#31605F] pb-20 min-h-screen selection:text-white">
      {/* Background Blobs */}
      <FloatingBlob color="#31605F" size="40vw" top="-10%" left="-10%" delay={0} />
      <FloatingBlob color="#8FA7A6" size="35vw" top="50%" left="80%" delay={2} />
      <FloatingBlob color="#D6E4E3" size="50vw" top="20%" left="30%" delay={1} duration={12} />

      <div className="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-7xl">
        {/* Back Button */}
        <Link to="/marketplace" className="inline-flex items-center gap-2 mb-8 font-medium text-[#5F7A79] hover:text-[#31605F] transition-colors hover:-translate-x-1 duration-300">
          <FiArrowRight /> العودة للمكتبة
        </Link>

        <div className="gap-8 lg:gap-12 grid grid-cols-1 lg:grid-cols-2 bg-white/40 shadow-[#31605F]/5 shadow-lg backdrop-blur-xl p-5 sm:p-6 md:p-10 border border-white/60 rounded-3xl md:rounded-[3rem]">
          {/* Book Cover */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <div className="group relative flex justify-center items-center bg-white shadow-md hover:shadow-[#31605F]/20 hover:shadow-2xl border border-white/80 rounded-[2.5rem] w-full aspect-square overflow-hidden transition-all duration-500">
              {/* Out of Stock Overlay */}
              {book.stock <= 0 && (
                <div className="z-30 absolute inset-0 flex flex-col justify-center items-center bg-black/10 backdrop-blur-[2px] rounded-[2.5rem]">
                  <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <span className="text-4xl"><FiX className="text-[#104E4E] text-4xl" /></span>
                    <p className="drop-shadow-lg font-bold text-[#104E4E] text-sm md:text-base leading-relaxed">
                      {book.isStoreProduct ? 'يصديقي المنتج ده خلص حالياََ' : 'يصديقي الكتاب ده خلص حالياََ'}
                    </p>
                    <p className="text-[#104E4E]/120 text-xs md:text-sm">
                      هيتم توفيره قريب...
                    </p>
                  </div>
                </div>
              )}

              {/* Discount Badge */}
              {book.discount > 0 && (
                <div className="top-4 right-4 z-40 absolute flex justify-center items-center drop-shadow-xl w-20 md:w-24 h-20 md:h-24 hover:scale-105 transition-transform duration-300 pointer-events-none">
                  <img src={discountSvg} alt="Discount" className="w-full h-full object-contain animate-pulse-slow" />
                  <div className="absolute flex flex-col justify-center items-center text-white text-center leading-tight">
                    <span className="font-heading font-black text-xs md:text-sm tracking-tighter">خصم</span>
                    <span className="font-heading font-black text-sm md:text-lg">%{book.discount}</span>
                  </div>
                </div>
              )}
              {book.coverImage ? (
                <img src={book.coverImage.includes('cloudinary.com') && !book.coverImage.includes('q_auto') ? book.coverImage.replace('/upload/', '/upload/w_1200,q_auto,f_auto/') : book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="flex justify-center items-center bg-gradient-to-br from-[#D6E4E3] to-[#EEF4F3] w-full h-full">
                  <FiBook className="text-[#8FA7A6]/50 text-9xl" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Book Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
            className="flex flex-col"
          >
            <h1 className="mt-2 lg:mt-0 mb-3 md:mb-4 font-heading font-black text-[#1E2F2E] text-3xl sm:text-4xl md:text-5xl leading-tight">{book.title}</h1>

            {/* Description */}
            <p className="mb-6 md:mb-8 font-medium text-[#5F7A79] text-base md:text-lg leading-relaxed">{book.description}</p>

            {/* Details Tags */}
            <div className="gap-3 md:gap-4 grid grid-cols-1 sm:grid-cols-2 mb-6 md:mb-8">
              {book.pages && (
                <div className="flex items-center gap-3 md:gap-4 bg-white/60 backdrop-blur-md px-4 md:px-5 py-3 md:py-4 border border-white rounded-2xl text-[#1E2F2E]">
                  <div className="bg-gradient-to-br from-[#EEF4F3] to-[#D6E4E3] p-3 rounded-xl text-[#31605F]">
                    <FiBookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-[#8FA7A6] text-xs">الصفحات</p>
                    <p className="font-bold text-base">{book.pages} صفحة</p>
                  </div>
                </div>
              )}
              {book.grade && (
                <div className="flex items-center gap-3 md:gap-4 bg-white/60 backdrop-blur-md px-4 md:px-5 py-3 md:py-4 border border-white rounded-2xl text-[#1E2F2E]">
                  <div className="bg-gradient-to-br from-[#EEF4F3] to-[#D6E4E3] p-3 rounded-xl text-[#244948]">
                    <FiUser className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="mb-1 font-medium text-[#8FA7A6] text-xs">المرحلة الدراسية</p>
                    <p className="font-bold text-base">{book.grade}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Premium Stock Badge */}
            {book.stock === 0 ? (
              <div className="inline-flex items-center gap-3 mb-6 px-5 py-2.5 rounded-2xl">
                <div className="flex justify-center items-center rounded-xl w-8 h-8 text-[#EF4444]">
                  <FiFrown className="w-5 h-5" />
                </div>
                <span className="font-bold text-[#DC2626] text-sm leading-none">
                  {book.isStoreProduct ? 'المنتج ده خلص يصديقي...' : 'الكتاب خلص حالياََ يصديقي..'}
                </span>
              </div>
            ) : book.stock <= 3 ? (
              <div className="inline-flex items-center gap-3 bg-[#FFFBEB] shadow-amber-500/5 shadow-sm backdrop-blur-md mb-6 px-5 py-2.5 border border-[#FEF3C7] rounded-2xl">
                <div className="relative flex justify-center items-center bg-[#FEF3C7] rounded-xl w-8 h-8 text-[#F59E0B]">
                  <span className="top-0 right-0 absolute flex -mt-1 -mr-1 w-2.5 h-2.5">
                    <span className="inline-flex absolute bg-[#F59E0B] opacity-75 rounded-full w-full h-full animate-ping"></span>
                    <span className="inline-flex relative bg-[#F59E0B] rounded-full w-2.5 h-2.5"></span>
                  </span>
                  <FiCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-[#D97706] text-sm leading-tight"> خليها بتاعتك!</p>
                  <p className="mt-0.5 font-bold text-[#D97706]/80 text-[11px]">باقي {book.stock === 1 ? 'نسخة واحدة' : book.stock === 2 ? 'نسختين' : book.stock + ' نسخ'} فقط</p>
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 bg-[#ECFDF5] shadow-emerald-500/5 shadow-sm backdrop-blur-md mb-6 px-5 py-2.5 border border-[#D1FAE5] rounded-2xl">
                <div className="flex justify-center items-center bg-[#D1FAE5] rounded-xl w-8 h-8 text-[#10B981]">
                  <FiCheck className="w-5 h-5" />
                </div>
                <span className="font-bold text-[#059669] text-sm leading-none">تقدر تطلب دلوقتي </span>
              </div>
            )}

            {/* Price & Actions Box */}
            <div className="bg-white/80 shadow-[#31605F]/5 shadow-md backdrop-blur-md mt-auto p-5 sm:p-6 md:p-8 border border-white rounded-[1.5rem] md:rounded-[2rem]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  {book.discount > 0 ? (
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] mr-1 font-black text-transparent text-3xl md:text-4xl">{book.priceAfterDiscount}</span>
                        <span className="font-bold text-[#8FA7A6] text-lg md:text-xl">جنيه</span>
                      </div>
                      <span className="font-bold text-[#8FA7A6] text-xl line-through">{book.price} جنيه</span>
                    </div>
                  ) : (
                    <div>
                      <span className="bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] mr-1 font-black text-transparent text-3xl md:text-4xl">{book.price}</span>
                      <span className="font-bold text-[#8FA7A6] text-lg md:text-xl">جنيه</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex justify-between items-center bg-[#EEF4F3]/50 mb-6 p-2 border border-white rounded-2xl">
                <span className="px-3 font-bold text-[#5F7A79] text-base">الكمية:</span>
                <div className="flex items-center gap-1 bg-white shadow-sm p-1 rounded-xl" dir="ltr">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex justify-center items-center bg-[#EEF4F3] hover:bg-[#31605F] rounded-lg w-10 h-10 font-bold text-[#31605F] hover:text-white transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-12 font-bold text-[#1E2F2E] text-lg text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                    className="flex justify-center items-center bg-[#EEF4F3] hover:bg-[#31605F] rounded-lg w-10 h-10 font-bold text-[#31605F] hover:text-white transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Btn */}
              <motion.button
                onClick={handleAddToCart}
                whileHover={book.stock > 0 ? { scale: 1.02, y: -2 } : {}}
                whileTap={book.stock > 0 ? { scale: 0.95 } : {}}
                animate={isAdding ? { scale: [1, 1.05, 0.95, 1] } : {}}
                disabled={book.stock === 0}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm ${book.stock === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                  : isAdding
                    ? 'bg-green-500 text-white shadow-green-500/30'
                    : 'bg-gradient-to-r from-[#31605F] to-[#244948] text-white hover:shadow-lg hover:shadow-[#31605F]/30'
                  }`}
              >
                {isAdding ? <FiCheck className="w-6 h-6" /> : <FiShoppingCart className="w-6 h-6" />}
                {isAdding ? 'تمت الإضافة بنجاح!' : 'أضف إلى العربة'}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Recommended Books */}
        {recommended.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-10 font-heading font-black text-[#1E2F2E] text-2xl md:text-3xl text-center">
              كتب <span className="bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] text-transparent">رشحنهالك</span>
            </h2>

            {/* Horizontal Scroll Area (Mobile-First Replacement for Slick) */}
            <div className="group relative">
              <div
                className="flex gap-4 md:gap-8 px-2 pb-8 overflow-x-auto scroll-smooth snap-mandatory snap-x no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {recommended.map((b, i) => (
                  <motion.div
                    key={b._id}
                    initial={{ opacity: 0, scale: 0.85, y: 50 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      delay: i * 0.1, 
                      type: "spring", 
                      stiffness: 100,
                      bounce: 0.4
                    }}
                    className="flex-shrink-0 first:mr-2 last:ml-2 w-[85%] sm:w-[50%] md:w-[33.333%] lg:w-[25%] snap-center"
                  >
                    <BookCard book={b} />
                  </motion.div>
                ))}
              </div>

              {/* Decorative Scroll Hints on Mobile */}
              <div className="md:hidden flex justify-center gap-1.5 mt-2">
                {recommended.slice(0, 4).map((_, i) => (
                  <div key={i} className="bg-[#31605F]/20 rounded-full w-1.5 h-1.5" />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BookDetailsPage;
