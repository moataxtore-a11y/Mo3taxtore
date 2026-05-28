import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowLeft, FiStar, FiBookOpen, FiShoppingCart } from 'react-icons/fi';
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';
import api from '../services/api';
import BookCard from '../components/BookCard';
import { getIcon } from '../utils/icons';
import BookLoader from '../components/BookLoader';
import Logo from '../assets/LOGO.svg';
import mainImage from '../assets/main.webp';
import HomeAnnouncements from '../components/HomeAnnouncements';

const FloatingBlob = ({ color, size, top, left, opacity = 0.25 }) => (
  <div
    className="z-0 absolute blur-[60px] md:blur-[100px] rounded-full pointer-events-none filter"
    style={{ backgroundColor: color, width: size, height: size, top, left, opacity }}
  />
);

const LandingPage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await api.get('/books/featured?limit=8');
        setFeaturedBooks(res.data.books);
      } catch (err) { console.error(err); } finally { setBooksLoading(false); }
    };
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories?type=book');
        setCategories(res.data.categories);
      } catch (err) { console.error(err); } finally { setCatsLoading(false); }
    };
    const fetchProducts = async () => {
      try {
        const res = await api.get('/books?isStoreProduct=true&limit=4&select=title,coverImage,price,discount,priceAfterDiscount,teacher,category,grade');
        setFeaturedProducts(res.data.books);
      } catch (err) { console.error(err); } finally { setProductsLoading(false); }
    };

    fetchBooks();
    fetchCats();
    fetchProducts();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: "easeOut" },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, scale: 0.85, y: 60, transition: { duration: 0.4 } },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        type: "spring", 
        bounce: 0.4 
      } 
    }
  };

  return (
    <div className="bg-transparent selection:bg-primary min-h-screen selection:text-white" ref={containerRef}>

      {/* Dynamic Background Blobs */}
      <FloatingBlob color="#31605F" size="45vw" top="-10%" left="-10%" delay={0} />
      <FloatingBlob color="#8FA7A6" size="35vw" top="15%" left="60%" delay={2} />
      <FloatingBlob color="#D6E4E3" size="50vw" top="55%" left="-5%" delay={1} duration={10} />
      <FloatingBlob color="#5F7A79" size="40vw" top="80%" left="50%" delay={3} duration={9} />

      {/* Hero Interactive Flow */}
      <div className="z-10 relative flex flex-col justify-center pt-24 pb-16 min-h-[90svh] overflow-visible">
        <div className="flex lg:flex-row flex-col items-center gap-6 lg:gap-8 mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-7xl">

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
            className="flex-1 text-center lg:text-right">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center">
              <FiStar className="fill-warning text-warning" />
            </motion.div>

            <h1 className="drop-shadow-sm mb-4 font-heading font-black text-[#1E2F2E] text-5xl md:text-6xl lg:text-7xl leading-[1.2]">
              <span className="inline-block bg-clip-text bg-gradient-to-l from-primary to-secondary pb-2 text-transparent">
                معتز -
              </span>
              <span className="inline-block bg-[#8FA7A6] bg-clip-text from-primary to-secondary pb-2 text-transparent">
                ستور
              </span>
            </h1>

            <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mb-8">
              <span
                className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl transition-all duration-300"
                style={{ WebkitTextStroke: '1px #31605F', color: 'transparent' }}
              >
                اطلب
              </span>
              <span
                className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl transition-all duration-300"
                style={{ WebkitTextStroke: '1px #31605F', color: 'transparent' }}
              >
                استلم
              </span>
              <span
                className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl transition-all duration-300"
                style={{ WebkitTextStroke: '1px #31605F', color: 'transparent' }}
              >
                ذاكر
              </span>
            </div>

            <p className="mx-auto lg:mx-0 mb-2 md:mb-10 max-w-2xl font-medium text-[#31605F] text-lg md:text-xl leading-relaxed">
              وفرنالك كل اللي تحتاجه من كتب و  منتجات غيرها. و سهلنا عليك كل اللي انت شايل همه من ادوات اللي تساعدك على الانتاج.
            </p>

            <div className="hidden lg:flex flex-wrap justify-center lg:justify-start gap-4">
              <Link to="/marketplace">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    y: -4
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex items-center gap-5 bg-[#31605F]/40 shadow-2xl backdrop-blur-[32px] px-8 md:px-12 py-4 md:py-6 border border-white/20 rounded-full overflow-hidden font-heading font-black text-white text-xl md:text-2xl transition-all duration-500"
                >
                  {/* Premium iOS Glossy Overlays */}
                  <div className="top-0 absolute inset-x-0 bg-gradient-to-b from-white/20 to-transparent h-1/2 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none" />

                  {/* Content with Depth */}
                  <span className="z-10 relative flex items-center gap-3 md:gap-4 drop-shadow-md">
                    الكتب الأكثر مبيعاً
                    <div className="bg-white/20 group-hover:bg-white/30 backdrop-blur-sm p-1.5 md:p-2 rounded-full transition-colors">
                      <FiArrowLeft className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:-translate-x-1" />
                    </div>
                  </span>

                  {/* Interaction Liquid Flow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-all -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out pointer-events-none" />

                  {/* Subtle Inner Glow Border */}
                  <div className="absolute inset-0 rounded-full ring-1 ring-white/20 ring-inset pointer-events-none" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Abstract Hero Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative flex flex-1 justify-center lg:justify-end mt-2 md:mt-6 lg:mt-0 w-full"
          >
            <div className="relative w-72 md:w-[400px] h-72 md:h-[400px]">
              {/* Dynamic flowing shapes replacing rigid images */}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-tr from-accent/90 to-primary/20 shadow-xl border border-white/30 rounded-[40%] rotate-12 transform" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-bl from-white/60 to-transparent shadow-lg border border-white/20 rounded-[45%] -rotate-12 scale-90 transform" />

              <motion.div
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 flex justify-center items-center drop-shadow-2xl rounded-[40%] overflow-hidden"
              >
                <img src={mainImage} alt="Moatax Store" className="w-full h-full object-cover scale-110" fetchPriority="high" loading="eager" decoding="sync" />
              </motion.div>
            </div>
          </motion.div>

          {/* Mobile Button - Visible only on small screens */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex lg:hidden justify-center mt-6 mb-2 w-full z-20"
          >
            <Link to="/marketplace">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  y: -4
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-5 bg-[#31605F]/40 shadow-2xl backdrop-blur-[32px] px-8 py-4 border border-white/20 rounded-full overflow-hidden font-heading font-black text-white text-xl transition-all duration-500"
              >
                <div className="top-0 absolute inset-x-0 bg-gradient-to-b from-white/20 to-transparent h-1/2 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none" />
                <span className="z-10 relative flex items-center gap-3 drop-shadow-md">
                  الكتب الأكثر مبيعاً
                  <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-1.5 rounded-full transition-colors">
                    <FiArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  </div>
                </span>
                <div className="absolute inset-0 ring-1 ring-white/20 ring-inset rounded-full pointer-events-none" />
              </motion.button>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Discovery Flow */}
      <div className="z-10 relative pt-16 pb-24">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

          <motion.div {...fadeInUp} className="flex flex-col justify-center items-center gap-6 mb-16 text-center">
            <div>
              <h2 className="mb-4 font-heading font-black text-[#1E2F2E] text-4xl md:text-5xl">
                الكتب <span className="text-primary">المميزة..</span>
              </h2>
              <p className="max-w-2xl font-medium text-text-secondary text-lg">كتبك و ملازمك كلها مكان واحد.</p>
            </div>
          </motion.div>

          {booksLoading ? (
            <div className="flex flex-col justify-center items-center py-10 animate-pulse">
              <FiBookOpen className="mb-4 w-12 h-12 text-primary/30" />
              <p className="font-bold text-primary/60 text-lg">جاري تحميل الكتب المميزة...</p>
            </div>
          ) : featuredBooks.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="gap-6 md:gap-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            >
              {featuredBooks.map((book) => (
                <motion.div
                  key={book._id}
                  variants={itemAnim}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className="bg-white shadow-sm hover:shadow-2xl hover:shadow-primary/15 border border-white/80 rounded-[2.5rem] h-fit overflow-hidden transition-all duration-300"
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="bg-white/50 shadow-sm backdrop-blur p-16 border border-white/60 rounded-[3rem] text-center">
              <FiBookOpen className="mx-auto mb-6 w-20 h-20 text-primary/30" />
              <p className="font-heading font-bold text-text-secondary text-2xl">لا توجد كتب متميزة حالياً. عد قريباً!</p>
            </div>
          )}

          <div className="flex justify-center mt-12 scale-100 md:scale-110">
            <Link to="/marketplace">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  y: -4
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-4 bg-[#31605F]/40 shadow-2xl backdrop-blur-[32px] px-10 py-5 border border-white/20 rounded-full overflow-hidden font-heading font-black text-white text-xl transition-all duration-500"
              >
                {/* Premium iOS Glossy Overlays */}
                <div className="top-0 absolute inset-x-0 bg-gradient-to-b from-white/20 to-transparent h-1/2 pointer-events-none" />

                <span className="z-10 relative flex items-center gap-3">
                  عرض المزيد <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </span>

                {/* Interaction Liquid Flow */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-all -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out pointer-events-none" />
              </motion.button>
            </Link>
          </div>

        </div>
      </div>

      {/* Categories Playful Exploration */}
      <div className="z-10 relative pt-10 pb-32">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

          <motion.div {...fadeInUp} className="mb-16 text-center">
            <h2 className="mb-4 font-heading font-black text-[#1E2F2E] text-4xl md:text-5xl">
              وفرنا عليك <span className="text-secondary">الوقت.</span>
            </h2>
            <div className="flex justify-center mt-6">
              <div className="bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full w-24 h-2" />
            </div>
          </motion.div>

          {catsLoading ? (
            <div className="flex flex-wrap justify-center items-center gap-4 py-10 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="bg-white/50 border border-white/80 rounded-[3rem] w-40 h-40" />)}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="show"
              animate="show"
              className="flex flex-wrap justify-center gap-5 md:gap-8"
            >
              {categories.map((cat, i) => (
                <motion.div key={cat.slug} variants={itemAnim}>
                  <Link to={`/marketplace?category=${cat.slug}`}>
                    <motion.div
                      whileHover={{ scale: 1.08, rotate: i % 2 === 0 ? 3 : -3, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="group flex flex-col justify-center items-center bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:shadow-primary/20 backdrop-blur-md border border-white rounded-[3rem] w-36 md:w-44 h-36 md:h-44 transition-all cursor-pointer"
                    >
                      <div className="flex justify-center items-center bg-primary/5 group-hover:bg-primary mb-4 rounded-full w-16 md:w-20 h-16 md:h-20 text-primary group-hover:text-white transition-colors duration-300">
                        {(() => {
                          const IconComponent = getIcon(cat.icon);
                          return <IconComponent className="w-8 md:w-10 h-8 md:h-10" />;
                        })()}
                      </div>
                      <p className="font-heading font-bold text-[#1E2F2E] group-hover:text-primary text-base md:text-lg transition-colors">{cat.name}</p>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

        </div>
      </div>

      {/* Store Products Section */}
      <div className="z-10 relative pt-10 pb-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div {...fadeInUp} className="mb-12 text-center">
            <h2 className="mb-4 font-heading font-black text-[#1E2F2E] text-4xl md:text-5xl">
              دلع <span className="text-primary">نفسك..</span>
            </h2>
            <p className="mx-auto max-w-2xl font-medium text-text-secondary text-lg">جمعنالك منتجات تدلع بيها نفسك في رحلتك.</p>
          </motion.div>

          {productsLoading ? (
            <div className="flex flex-col justify-center items-center py-10 animate-pulse">
              <FiShoppingCart className="mb-4 w-12 h-12 text-primary/30" />
              <p className="font-bold text-primary/60 text-lg">جاري تحميل المنتجات...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-50px" }}
              className="gap-6 md:gap-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            >
              {featuredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  variants={itemAnim}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className="bg-white shadow-sm hover:shadow-2xl hover:shadow-primary/15 border border-white/80 rounded-[2.5rem] h-fit overflow-hidden transition-all duration-300"
                >
                  <BookCard book={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-text-secondary">لا توجد منتجات حالياً.</p>
            </div>
          )}
        </div>

        {/* New Show More Button for Products */}
        <div className="flex justify-center mt-12 scale-100 md:scale-110">
          <Link to="/store">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                y: -4
              }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center gap-4 bg-[#31605F]/40 shadow-2xl backdrop-blur-[32px] px-10 py-5 border border-white/20 rounded-full overflow-hidden font-heading font-black text-white text-xl transition-all duration-500"
            >
              <div className="top-0 absolute inset-x-0 bg-gradient-to-b from-white/20 to-transparent h-1/2 pointer-events-none" />
              <span className="z-10 relative flex items-center gap-3">
                عرض المزيد <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-all -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out pointer-events-none" />
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Soft Interactive Teacher Highlight */}
      <div className="z-10 relative pb-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, type: "spring" }}
            className="relative flex md:flex-row flex-col justify-between items-center gap-12 bg-gradient-to-l from-primary to-[#8FA7A6] shadow-2xl shadow-primary/30 p-10 md:p-16 rounded-[3.5rem] overflow-hidden"
          >
            {/* Soft Flowing Background Overlays inside the card */}
            <div className="top-0 right-0 absolute w-full h-full overflow-hidden pointer-events-none">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} className="-top-[60%] -right-[30%] absolute bg-white/5 rounded-[45%] w-[100%] h-[200%]" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 110, repeat: Infinity, ease: "linear" }} className="-bottom-[50%] -left-[20%] absolute bg-accent/20 rounded-[40%] w-[80%] h-[150%]" />
            </div>

            <div className="z-10 relative max-w-xl text-center md:text-right">
              <h2 className="mb-6 font-heading font-black text-white text-4xl md:text-5xl leading-tight">
                اكتشف منتجات.. <br />
                <span className="inline-block mt-2 text-accent">معتز ستور</span>
              </h2>
              <p className="mb-10 font-medium text-white/90 text-xl leading-relaxed">
                كل ما تحتاجه من أدوات وأقلام ومستلزمات دراسية بجودة عالية لتكملة رحلتك نحو التفوق.
              </p>

              <Link to="/store">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    y: -4
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative flex items-center gap-4 bg-white/20 shadow-2xl backdrop-blur-[32px] px-10 py-5 border border-white/20 rounded-full overflow-hidden font-heading font-black text-[#1E2F2E] text-xl transition-all duration-500"
                >
                  <div className="top-0 absolute inset-x-0 bg-gradient-to-b from-white/30 to-transparent h-1/2 pointer-events-none" />
                  <span className="z-10 relative flex items-center gap-3">
                    تسوق الآن <FiShoppingCart className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-all -translate-x-full group-hover:translate-x-full duration-1000 ease-in-out pointer-events-none" />
                </motion.button>
              </Link>
            </div>

            <div className="hidden z-10 relative md:flex justify-center items-center">
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white/10 shadow-2xl backdrop-blur-xl p-8 border border-white/30 rounded-[3rem]"
              >
                <img src={Logo} alt="Logo" className="brightness-100 w-40 h-40 object-contain" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
