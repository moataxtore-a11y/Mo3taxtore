import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

import AnimatedBackground from '../components/AnimatedBackground';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-transparent px-4 py-12 min-h-screen relative selection:bg-[#31605F] selection:text-white">
      <AnimatedBackground />
      {/* Background blobs */}
      <motion.div
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute rounded-full mix-blend-multiply filter blur-[80px] opacity-40 bg-[#31605F] w-[50vw] h-[50vw] top-[-15%] left-[-15%] pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute rounded-full mix-blend-multiply filter blur-[80px] opacity-40 bg-[#D6E4E3] w-[40vw] h-[40vw] bottom-[-10%] right-[-10%] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <span className="font-heading font-black text-transparent bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] text-3xl group-hover:scale-105 transition-transform">Moataxtore</span>
          </Link>
          <h1 className="mb-3 font-heading font-black text-[#1E2F2E] text-3xl">نسيت كلمة المرور؟</h1>
          <p className="text-[#5F7A79] font-medium">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
        </div>

        <div className="bg-white/60 backdrop-blur-xl shadow-xl shadow-[#31605F]/5 p-8 border border-white/60 rounded-[2.5rem]">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="flex justify-center mb-6 text-[#31605F] text-7xl"
              >
                <FiCheckCircle />
              </motion.div>
              <h3 className="mb-3 font-heading font-black text-[#1E2F2E] text-2xl">تم الإرسال! </h3>
              <p className="mb-6 text-[#5F7A79] font-medium">
                تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#31605F] to-[#244948] text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-[#31605F]/25 hover:shadow-xl transition-all hover:-translate-y-1">
                العودة لتسجيل الدخول
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 font-bold text-[#5F7A79] text-sm">البريد الإلكتروني</label>
                <div className="relative">
                  <FiMail className="top-1/2 left-4 absolute text-[#8FA7A6] -translate-y-1/2 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-white py-4 pr-5 pl-12 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none focus:ring-4 focus:ring-[#31605F]/10 w-full text-[#1E2F2E] font-medium shadow-sm hover:shadow-md transition-all"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="disabled:opacity-60 bg-gradient-to-r from-[#31605F] to-[#244948] shadow-lg shadow-[#31605F]/25 hover:shadow-xl hover:shadow-[#31605F]/35 py-4 rounded-2xl w-full font-bold text-white text-lg transition-all"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال رابط التعيين'}
              </motion.button>
            </form>
          )}

          {!sent && (
            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-[#8FA7A6] hover:text-[#31605F] text-sm font-medium transition-colors hover:-translate-x-1 duration-300">
                <FiArrowLeft className="w-4 h-4" /> العودة لتسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
