import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import api from '../services/api';
import BookCard from '../components/BookCard';
import CustomSelect from '../components/CustomSelect';

const FloatingBlob = ({ color, size, top, left, opacity = 0.25 }) => (
  <div
    className="absolute rounded-full filter blur-[100px] z-0 pointer-events-none"
    style={{ backgroundColor: color, width: size, height: size, top, left, opacity }}
  />
);

const SORT_OPTIONS = [
  { label: 'الأحدث', value: '' },
  { label: 'السعر: من الأقل للأعلى', value: 'price_asc' },
  { label: 'السعر: من الأعلى للأقل', value: 'price_desc' },
  { label: 'الأكثر شعبية', value: 'popular' },
  { label: 'الأعلى تقييماً', value: 'rating' },
];

const StorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (sort) params.append('sort', sort);
      params.append('page', page);
      params.append('limit', 12);
      params.append('isStoreProduct', 'true');

      const res = await api.get(`/books?${params.toString()}`);
      setBooks(res.data.books);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, category, sort]);

  useEffect(() => {
    // Fetch categories specific to store products
    api.get('/categories?type=store')
      .then((res) => setCategories([{ label: 'الكل', value: '' }, ...res.data.categories.map(c => ({ label: c.name, value: c.slug }))]))
      .catch((err) => console.error(err));

    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    if (cat) setCategory(cat);
    if (q) setSearch(q);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  return (
    <div className="bg-transparent min-h-screen relative selection:bg-[#31605F] selection:text-white">
      <FloatingBlob color="#31605F" size="40vw" top="-5%" left="-10%" delay={0} />
      <FloatingBlob color="#8FA7A6" size="30vw" top="20%" left="70%" delay={2} />
      <FloatingBlob color="#D6E4E3" size="45vw" top="60%" left="-5%" delay={1} duration={10} />

      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 font-heading font-black text-4xl md:text-5xl lg:text-6xl text-[#1E2F2E]">
            منتجات <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948]">معتز ستور</span>
          </h1>
          <p className="text-[#5F7A79] text-lg max-w-xl mx-auto font-medium">
            اكتشف أفضل المنتجات والأدوات التي يوفرها متجرنا لخدمة رحلتك التعليمية.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-50 bg-white/70 backdrop-blur-xl shadow-lg shadow-[#31605F]/5 mb-10 p-4 border border-white/50 rounded-[2rem]"
        >
          <div className="flex xl:flex-row flex-col gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <FiSearch className="top-1/2 right-5 absolute text-[#31605F]/50 w-5 h-5 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="عن ماذا تبحث اليوم؟..."
                  className="bg-white py-4 pr-14 pl-6 border border-white/60 focus:border-[#31605F]/30 rounded-full outline-none focus:ring-4 focus:ring-[#31605F]/10 w-full transition-all text-[#1E2F2E] font-medium shadow-sm hover:shadow-md"
                />
              </div>
            </form>

            <div className="flex gap-3">
              <CustomSelect
                value={sort}
                onChange={(val) => { setSort(val); setPage(1); }}
                options={SORT_OPTIONS}
                placeholder="ترتيب حسب"
                className="w-48"
              />

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-4 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-bold hover:-translate-y-0.5 ${showFilters ? 'bg-[#31605F] text-white' : 'bg-white text-[#31605F] border border-white/60'
                  }`}
              >
                <FiFilter className="w-5 h-5" /> تصفية
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-white/40 border-t">
                  {categories.map((cat, idx) => (
                    <button
                      key={cat.value || `cat-all-${idx}`}
                      onClick={() => { setCategory(cat.value); setPage(1); }}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:-translate-y-1 ${category === cat.value
                        ? 'bg-gradient-to-r from-[#31605F] to-[#244948] text-white shadow-lg shadow-[#31605F]/30'
                        : 'bg-white/80 text-[#5F7A79] border border-white hover:bg-white hover:text-[#31605F] shadow-sm'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {(category || search) && (
          <div className="flex flex-wrap gap-3 mb-8">
            {category && (
              <span className="inline-flex items-center gap-2 bg-[#31605F]/10 px-4 py-2 rounded-full font-bold text-[#31605F] text-sm shadow-sm backdrop-blur-sm">
                القسم: {categories.find(c => c.value === category)?.label}
                <button onClick={() => setCategory('')} className="mr-2 hover:bg-[#31605F]/20 p-1 rounded-full transition-colors"><FiX className="w-4 h-4" /></button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-2 bg-[#8FA7A6]/20 px-4 py-2 rounded-full font-bold text-[#1E2F2E] text-sm shadow-sm backdrop-blur-sm">
                البحث: "{search}"
                <button onClick={() => { setSearch(''); setPage(1); fetchBooks(); }} className="mr-2 hover:bg-[#8FA7A6]/30 p-1 rounded-full transition-colors"><FiX className="w-4 h-4" /></button>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="gap-6 md:gap-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/50 backdrop-blur-md border border-white/60 p-4 rounded-[2.5rem] h-96 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : books.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="gap-6 md:gap-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 focus:outline-none"
            >
              {books.map((book, i) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, scale: 0.85, y: 50 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    delay: (i % 4) * 0.1, 
                    type: "spring", 
                    stiffness: 100,
                    bounce: 0.4
                  }}
                  className="rounded-[2.5rem] transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-[#31605F]/15 bg-white overflow-hidden border border-white/80 h-fit"
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-16" dir="ltr">
                {[...Array(totalPages)].map((_, i) => (
                  <motion.button
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-12 h-12 rounded-full font-bold transition-all flex justify-center items-center shadow-sm ${page === i + 1
                      ? 'bg-[#31605F] text-white shadow-lg shadow-[#31605F]/30'
                      : 'bg-white/80 border border-white hover:border-[#31605F]/20 text-[#5F7A79] backdrop-blur-sm hover:bg-white'
                      }`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-32 text-center bg-white/50 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-lg shadow-[#31605F]/5 mt-10"
          >
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="flex justify-center mb-6 text-[#8FA7A6] text-7xl drop-shadow-sm">
              <FiSearch />
            </motion.div>
            <h3 className="mb-4 font-heading font-black text-[#1E2F2E] text-2xl md:text-3xl">عفواً، لم نجد أية منتجات.</h3>
            <p className="text-[#5F7A79] text-lg font-medium max-w-sm mx-auto p-4">
              لم نستطع العثور على أي منتج. يرجى المحاولة بوقت لاحق.
            </p>
            <button
              onClick={() => { setSearch(''); setCategory(''); setPage(1); fetchBooks(); }}
              className="mt-4 bg-white shadow-sm border border-[#31605F]/20 text-[#31605F] font-bold px-8 py-3 rounded-full hover:bg-[#31605F] hover:text-white transition-colors"
            >
              عرض جميع المنتجات
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StorePage;
