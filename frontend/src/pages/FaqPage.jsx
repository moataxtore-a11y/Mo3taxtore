import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus, FiHelpCircle, FiChevronDown, FiMessageCircle } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import BookLoader from '../components/BookLoader';

const FaqPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await api.get('/cms/faq');
        const list = res.data?.content?.content;
        setFaqs(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
        if (err?.response?.status !== 404) {
          toast.error('فشل في تحميل الأسئلة الشائعة');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const defaultFaqs = [
    { question: 'كيف يمكنني الحصول على الكتب؟', answer: 'يمكنك طلب الكتب مباشرة من الموقع وسيتم توصيلها لك في أسرع وقت ممكن.' },
    { question: 'هل تتوفر خدمة التوصيل لكل المحافظات؟', answer: 'نعم، نوفر خدمة التوصيل لجميع محافظات جمهورية مصر العربية بأسعار شحن تنافسية.' },
    { question: 'كيف يمكنني تتبع طلبي؟', answer: 'بمجرد شحن الطلب، يمكنك متابعة حالته من خلال لوحة التحكم الخاصة بك في قسم الطلبات.' },
  ];

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;

  if (loading) return <BookLoader />;

  return (
    <div className="mx-auto px-4 pt-40 pb-12 max-w-4xl" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center"
      >
        <div className="flex justify-center items-center bg-primary/10 mx-auto mb-6 rounded-3xl w-24 h-24 text-primary">
          <FiHelpCircle className="w-12 h-12" />
        </div>
        <h1 className="mb-4 py-1 font-black text-gradient text-5xl leading-tight">الأسئلة الشائعة</h1>
        <div className="bg-primary mx-auto mb-8 rounded-full w-24 h-2"></div>
        <p className="mx-auto max-w-xl text-text-secondary text-lg">كل ما تحتاج لمعرفته حول خدماتنا وكيفية البدء في رحلة تعليمية مثمرة</p>
      </motion.div>

      <div className="space-y-6">
        {displayFaqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white/70 shadow-2xl backdrop-blur-xl border border-white/20 hover:border-primary/20 rounded-[2rem] overflow-hidden transition-all duration-300"
          >
            <button
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              className="flex justify-between items-center px-8 py-6 w-full text-right"
            >
              <h3 className="font-black text-text-primary group-hover:text-primary text-lg transition-colors">{faq.question}</h3>
              <div className={`flex justify-center items-center bg-primary/10 rounded-full w-10 h-10 text-primary transition-transform duration-500 ${activeIndex === index ? 'rotate-180 bg-primary/20' : ''}`}>
                <FiChevronDown className="w-6 h-6" />
              </div>
            </button>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                >
                  <div className="px-8 pb-8 text-text-secondary text-lg leading-loose">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-20 p-8 text-center"
      >
        <div className="inline-flex flex-col items-center bg-bg shadow-sm p-8 border border-border rounded-[3rem] max-w-lg">
          <FiMessageCircle className="mb-4 w-12 h-12 text-primary" />
          <h2 className="mb-4 font-black text-2xl">لم تجد إجابتك؟</h2>
          <p className="mb-8 text-text-muted text-lg">فريق الدعم لدينا متاح دائماً لمساعدتك في أي استفسار</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-primary hover:bg-primary-dark shadow-primary/20 shadow-xl px-10 py-4 rounded-2xl font-black text-white text-lg transition-all"
          >
            تواصل معنا
          </motion.button>

        </div>
      </motion.div>
    </div>
  );
};

export default FaqPage;
