import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import BookCard from '../components/BookCard';
import BookLoader from '../components/BookLoader';

const BestSellersPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const res = await api.get('/cms/best-sellers/all');
        setBooks(res.data.books);
      } catch (err) {
        console.error(err);
        toast.error('فشل في تحميل الكتب الأكثر مبيعاً');
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  if (loading) return <BookLoader />;

  return (
    <div className="mx-auto px-4 py-12 max-w-7xl" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center mb-16 text-center"
      >
        <div className="flex justify-center items-center bg-primary/10 shadow-lg mb-6 rounded-3xl w-24 h-24 text-primary">
          <FiTrendingUp className="w-12 h-12" />
        </div>
        <h1 className="mb-4 font-black text-gradient text-5xl">الكتب الأكثر مبيعاً</h1>
        <p className="max-w-xl text-text-secondary text-xl">اكتشف الكتب التي لا يستغني عنها الطلاب والمعلمون، واطلع على الترشيحات الأعلى مبيعاً</p>
      </motion.div>

      <div className="gap-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {books.map((book, index) => (
          <motion.div
            key={book._id}
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ 
              delay: (index % 4) * 0.1, 
              type: "spring", 
              stiffness: 100,
              bounce: 0.4
            }}
            className="relative bg-white shadow-sm hover:shadow-[#31605F]/15 hover:shadow-2xl border border-white/80 rounded-[2.5rem] h-fit overflow-hidden transition-all duration-300"
          >
            {/* Rank Badge */}
            <div className="top-4 right-4 z-10 absolute flex justify-center items-center bg-gradient-to-br from-primary to-primary-dark shadow-lg rounded-full w-10 h-10 font-black text-white text-sm">
              #{index + 1}
            </div>
            <BookCard book={book} />
          </motion.div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-text-secondary text-xl">لا توجد كتب في قائمة الأكثر مبيعاً حالياً</p>
        </div>
      )}
    </div>
  );
};

export default BestSellersPage;
