import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import api from '../services/api';
import BookCard from '../components/BookCard';
import CustomSelect from '../components/CustomSelect';

const FloatingBlob = ({ color, size, top, left, opacity = 0.25 }) => (
  <div
    className="z-0 absolute blur-[100px] rounded-full pointer-events-none filter"
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

const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [grades, setGrades] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [grade, setGrade] = useState(searchParams.get('grade') || '');
  const [teacherName, setTeacherName] = useState(searchParams.get('teacherName') || '');
  const [sort, setSort] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (grade) params.append('grade', grade);
      if (teacherName) params.append('teacherName', teacherName);
      if (sort) params.append('sort', sort);
      params.append('page', page);
      params.append('limit', 12);

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
  }, [page, category, grade, teacherName, sort]);

  useEffect(() => {
    // Fetch categories
    api.get('/categories?type=book')
      .then((res) => setCategories([{ label: 'الكل', value: '' }, ...res.data.categories.map(c => ({ label: c.name, value: c.slug }))]))
      .catch((err) => console.error(err));

    // Fetch grades
    api.get('/grades')
      .then((res) => {
        const gradesData = Array.isArray(res.data) ? res.data : (res.data.grades || []);
        setGrades([{ label: 'جميع الصفوف', value: '' }, ...gradesData.map(g => ({ label: g.name, value: g.name }))]);
      })
      .catch((err) => console.error(err));

    // Fetch teachers
    api.get('/teachers')
      .then((res) => {
        const teachersData = Array.isArray(res.data) ? res.data : (res.data.items || []);
        setTeachers([{ label: 'الكل', value: '' }, ...teachersData.map(t => ({ label: t.name, value: t.name }))]);
      })
      .catch((err) => console.error(err));

    const cat = searchParams.get('category');
    const grd = searchParams.get('grade');
    const teach = searchParams.get('teacherName');
    const q = searchParams.get('search');
    if (cat) setCategory(cat);
    if (grd) setGrade(grd);
    if (teach) setTeacherName(teach);
    if (q) setSearch(q);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  return (
    <div className="relative bg-transparent selection:bg-[#31605F] min-h-screen selection:text-white">
      {/* Dynamic Background Blobs */}
      <FloatingBlob color="#31605F" size="40vw" top="-5%" left="-10%" delay={0} />
      <FloatingBlob color="#8FA7A6" size="30vw" top="20%" left="70%" delay={2} />
      <FloatingBlob color="#D6E4E3" size="45vw" top="60%" left="-5%" delay={1} duration={10} />

      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-12 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 font-heading font-black text-[#1E2F2E] text-4xl md:text-5xl lg:text-6xl">
            <span className="bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] text-transparent">كُتبك</span> هنا
          </h1>
          <p className="mx-auto max-w-xl font-medium text-[#5F7A79] text-lg">
            جمعنالك كل اللي الكتب اللي هتحتاجها في رحلتك.
          </p>
        </motion.div>

        {/* Search & Filters Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="z-50 relative bg-white/70 shadow-[#31605F]/5 shadow-lg backdrop-blur-xl mb-10 p-4 border border-white/50 rounded-[2rem]"
        >
          <div className="flex xl:flex-row flex-col gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <FiSearch className="top-1/2 right-5 absolute w-5 h-5 text-[#31605F]/50 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="عن ماذا تبحث اليوم؟..."
                  className="bg-white shadow-sm hover:shadow-md py-4 pr-14 pl-6 border border-white/60 focus:border-[#31605F]/30 rounded-full outline-none focus:ring-[#31605F]/10 focus:ring-4 w-full font-medium text-[#1E2F2E] transition-all"
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

          {/* Category Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-6 mt-6 pt-6 border-white/40 border-t">
                  <div>
                    <h3 className="mb-4 font-black text-[#1E2F2E] text-sm uppercase">المواد الدراسية</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat, idx) => (
                        <button
                          key={cat.value || `cat-all-${idx}`}
                          onClick={() => { setCategory(cat.value); setPage(1); }}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${category === cat.value
                            ? 'bg-[#31605F] text-white shadow-lg'
                            : 'bg-white/50 text-[#5F7A79] hover:bg-white'
                            }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 font-black text-[#1E2F2E] text-sm uppercase">الصفوف الدراسية</h3>
                    <div className="flex flex-wrap gap-2">
                      {grades.map((g, idx) => (
                        <button
                          key={g.value || `grade-all-${idx}`}
                          onClick={() => { setGrade(g.value); setPage(1); }}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${grade === g.value
                            ? 'bg-[#1D3534] text-white shadow-lg'
                            : 'bg-white/50 text-[#5F7A79] hover:bg-white'
                            }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 font-black text-[#1E2F2E] text-sm uppercase">اسماء المدرسين</h3>
                    <div className="flex flex-wrap gap-2">
                       {teachers.map((t, idx) => (
                         <button
                           key={t.value || `teacher-all-${idx}`}
                           onClick={() => { setTeacherName(t.value); setPage(1); }}
                           className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${teacherName === t.value
                             ? 'bg-[#31605F] text-white shadow-lg'
                             : 'bg-white/50 text-[#5F7A79] hover:bg-white'
                             }`}
                         >
                           {t.label}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Active Filters */}
        {(category || grade || teacherName || search) && (
          <div className="flex flex-wrap gap-3 mb-8">
            {category && (
              <span className="inline-flex items-center gap-2 bg-[#31605F]/10 shadow-sm backdrop-blur-sm px-4 py-2 rounded-full font-bold text-[#31605F] text-sm">
                المادة: {categories.find(c => c.value === category)?.label}
                <button onClick={() => setCategory('')} className="hover:bg-[#31605F]/20 mr-2 p-1 rounded-full transition-colors"><FiX className="w-4 h-4" /></button>
              </span>
            )}
            {grade && (
              <span className="inline-flex items-center gap-2 bg-[#1D3534]/10 shadow-sm backdrop-blur-sm px-4 py-2 rounded-full font-bold text-[#1D3534] text-sm">
                الصف: {grade}
                <button onClick={() => setGrade('')} className="hover:bg-[#1D3534]/20 mr-2 p-1 rounded-full transition-colors"><FiX className="w-4 h-4" /></button>
              </span>
            )}
            {teacherName && (
              <span className="inline-flex items-center gap-2 bg-[#172e2d]/10 shadow-sm backdrop-blur-sm px-4 py-2 rounded-full font-bold text-[#172e2d] text-sm">
                المدرس: {teacherName}
                <button onClick={() => setTeacherName('')} className="hover:bg-[#172e2d]/20 mr-2 p-1 rounded-full transition-colors"><FiX className="w-4 h-4" /></button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-2 bg-[#8FA7A6]/20 shadow-sm backdrop-blur-sm px-4 py-2 rounded-full font-bold text-[#1E2F2E] text-sm">
                البحث: "{search}"
                <button onClick={() => { setSearch(''); setPage(1); fetchBooks(); }} className="hover:bg-[#8FA7A6]/30 mr-2 p-1 rounded-full transition-colors"><FiX className="w-4 h-4" /></button>
              </span>
            )}
          </div>
        )}

        {/* Books Grid */}
        {loading ? (
          <div className="gap-6 md:gap-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/50 shadow-sm backdrop-blur-md p-4 border border-white/60 rounded-[2.5rem] h-96 animate-pulse" />
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
                  className="bg-white shadow-sm hover:shadow-[#31605F]/15 hover:shadow-2xl border border-white/80 rounded-[2.5rem] h-fit overflow-hidden transition-all duration-300"
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
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
            className="bg-white/50 shadow-[#31605F]/5 shadow-lg backdrop-blur-xl mt-10 py-32 border border-white/60 rounded-[3rem] text-center"
          >
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="flex justify-center drop-shadow-sm mb-6 text-[#8FA7A6] text-7xl">
              <FiSearch />
            </motion.div>
            <h3 className="mb-4 font-heading font-black text-[#1E2F2E] text-2xl md:text-3xl">عفواً، لم نجد ما تبحث عنه</h3>
            <p className="mx-auto p-4 max-w-sm font-medium text-[#5F7A79] text-lg">
              حاول تغيير كلمات البحث، إزالة بعض الفلاتر، أو استكشاف أقسام أخرى.
            </p>
            <button
              onClick={() => { setSearch(''); setCategory(''); setGrade(''); setTeacherName(''); setPage(1); fetchBooks(); }}
              className="bg-white hover:bg-[#31605F] shadow-sm mt-4 px-8 py-3 border border-[#31605F]/20 rounded-full font-bold text-[#31605F] hover:text-white transition-colors"
            >
              عرض جميع الكتب
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;
