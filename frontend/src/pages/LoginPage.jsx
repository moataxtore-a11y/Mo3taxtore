import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import loginBg from '../assets/booktaz1.webp';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(formData.phone, formData.password);
      toast.success(`مرحباً بعودتك، ${data.user.name}! `);
      const dest = data.user.role === 'admin' ? '/admin' :
        data.user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
      navigate(dest);
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col bg-transparent min-h-screen" dir="rtl">
      <AnimatedBackground />
      <Navbar />
      <main className="z-10 relative flex md:flex-row-reverse flex-col flex-1 bg-transparent font-body">
        {/* Right Side - Image Background  */}
        <div className="hidden md:block relative w-2/5 overflow-hidden">
          <img 
            src={loginBg} 
            alt="Login Background" 
            className="w-full h-full object-cover"
          />
          {/* Overlay Blob */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#EEF4F3]/60 to-transparent" />
        </div>

        {/* Form Side */}
        <div className="relative flex justify-center items-center p-8 pt-32 md:pt-32 lg:p-16 w-full md:w-3/5 overflow-hidden">
          {/* Subtle blob in bg */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="top-1/3 right-1/2 absolute bg-[#31605F]/8 blur-[100px] rounded-full w-[60vw] h-[60vw] -translate-y-1/2 translate-x-1/2 pointer-events-none filter"
          />
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="z-10 w-full max-w-lg"
          >
            <h1 className="mb-3 font-heading font-black text-[#1E2F2E] text-4xl">مرحباً بعودتك</h1>
            <p className="mb-10 font-medium text-[#5F7A79] text-lg">
              ادخل رقم هاتفك وكلمة السر للدخول لحسابك
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group relative">
                <div className="right-4 absolute inset-y-0 flex items-center text-[#8FA7A6] group-focus-within:text-[#31605F] transition-colors pointer-events-none">
                  <FiPhone className="text-xl" />
                </div>
                <input
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="رقم الهاتف"
                  className="bg-white/80 shadow-sm hover:shadow-md backdrop-blur-sm py-4 pr-12 pl-4 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none focus:ring-[#31605F]/10 focus:ring-4 w-full font-medium text-[#1E2F2E] placeholder:text-[#8FA7A6] text-right transition-all"
                  required
                />
              </div>

              <div className="group relative">
                <div className="right-4 absolute inset-y-0 flex items-center text-[#8FA7A6] group-focus-within:text-[#31605F] transition-colors pointer-events-none">
                  <FiLock className="text-xl" />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  dir="rtl"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="كلمة السر"
                  className="bg-white/80 shadow-sm hover:shadow-md backdrop-blur-sm py-4 pr-12 pl-12 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none focus:ring-[#31605F]/10 focus:ring-4 w-full font-medium text-[#1E2F2E] placeholder:text-[#8FA7A6] text-right transition-all"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="top-1/2 left-4 absolute text-[#8FA7A6] hover:text-[#31605F] transition-colors -translate-y-1/2"
                >
                  {showPass ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#31605F] to-[#244948] disabled:opacity-70 shadow-[#31605F]/25 shadow-lg hover:shadow-[#31605F]/35 hover:shadow-xl mt-4 py-4 rounded-2xl w-full font-bold text-white text-xl transition-all"
              >
                {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
              </motion.button>
            </form>

            <div className="mt-10 text-center">
              <p className="font-medium text-[#5F7A79]">
                لا يوجد لديك حساب؟{' '}
                <Link to="/register" className="font-bold text-[#31605F] hover:underline">انشئ حسابك الآن !</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
