import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff, FiPhone, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import registerBg from '../assets/booktaz3.webp';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnimatedBackground from '../components/AnimatedBackground';
import CustomSelect from '../components/CustomSelect';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'student';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    confirmPhone: '',
    grade: 'الصف الثالث الثانوي',
    password: '',
    confirmPassword: '',
    role: defaultRole,
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length < 10 || formData.phone.length > 15) {
      return toast.error('رقم الهاتف يجب أن يكون بين 10 إلى 15 رقم');
    }
    if (formData.phone !== formData.confirmPhone) {
      return toast.error('رقم الهاتف غير متطابق');
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error('كلمة السر غير متطابقة');
    }

    setLoading(true);
    try {
      const signupData = {
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        grade: formData.grade
      };
      const data = await register(signupData);
      toast.success(`مرحباً بك، ${data.user.name}! 🎉`);
      const dest = data.user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
      navigate(dest);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0] || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col bg-transparent min-h-screen" dir="rtl">
      <AnimatedBackground />
      <Navbar />
      <main className="z-10 relative flex md:flex-row-reverse flex-col flex-1 bg-transparent font-body">
        {/* Right Side - Image */}
        <div className="hidden md:block relative w-2/5 overflow-hidden">
          <img 
            src={registerBg} 
            alt="Register Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#EEF4F3]/60 to-transparent" />
        </div>

        {/* Form Side */}
        <div className="relative flex justify-center items-center p-8 pt-32 md:pt-32 lg:p-12 w-full md:w-3/5 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-1/3 right-1/2 translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-[#31605F]/8 filter blur-[100px] pointer-events-none"
          />
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="z-10 w-full max-w-2xl"
          >
            <h1 className="font-heading font-black text-[#1E2F2E] text-4xl mb-3">أنشئ حسابك الآن</h1>
            <p className="mb-8 text-[#5F7A79] font-medium text-lg">
              ادخل بياناتك بشكل صحيح للحصول علي أفضل تجربة داخل الموقع
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div className="group relative">
                  <div className="right-4 absolute inset-y-0 flex items-center text-[#8FA7A6] group-focus-within:text-[#31605F] transition-colors pointer-events-none">
                    <FiUser className="text-xl" />
                  </div>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="الاسم الأول"
                    className="bg-white/80 backdrop-blur-sm py-4 pr-12 pl-4 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none focus:ring-4 focus:ring-[#31605F]/10 w-full text-[#1E2F2E] placeholder:text-[#8FA7A6] font-medium shadow-sm hover:shadow-md transition-all text-right"
                    required
                  />
                </div>
                <div className="group relative">
                  <div className="right-4 absolute inset-y-0 flex items-center text-[#8FA7A6] group-focus-within:text-[#31605F] transition-colors pointer-events-none">
                    <FiUser className="text-xl" />
                  </div>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="الاسم الأخير"
                    className="bg-white/80 backdrop-blur-sm py-4 pr-12 pl-4 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none focus:ring-4 focus:ring-[#31605F]/10 w-full text-[#1E2F2E] placeholder:text-[#8FA7A6] font-medium shadow-sm hover:shadow-md transition-all text-right"
                    required
                  />
                </div>
              </div>

              <div className="group relative">
                <div className="right-4 absolute inset-y-0 flex items-center text-[#8FA7A6] group-focus-within:text-[#31605F] transition-colors pointer-events-none">
                  <FiPhone className="text-xl" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="رقم الهاتف"
                  className="bg-white/80 backdrop-blur-sm py-4 pr-12 pl-4 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none focus:ring-4 focus:ring-[#31605F]/10 w-full text-[#1E2F2E] placeholder:text-[#8FA7A6] font-medium shadow-sm hover:shadow-md transition-all text-right"
                  maxLength={15}
                  required
                />
              </div>

              <div className="group relative">
                <div className="right-4 absolute inset-y-0 flex items-center text-[#8FA7A6] group-focus-within:text-[#31605F] transition-colors pointer-events-none">
                  <FiPhone className="text-xl" />
                </div>
                <input
                  type="tel"
                  value={formData.confirmPhone}
                  onChange={(e) => setFormData({ ...formData, confirmPhone: e.target.value.replace(/\D/g, '') })}
                  placeholder="تأكيد رقم الهاتف"
                  className="bg-white/80 backdrop-blur-sm py-4 pr-12 pl-4 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none focus:ring-4 focus:ring-[#31605F]/10 w-full text-[#1E2F2E] placeholder:text-[#8FA7A6] font-medium shadow-sm hover:shadow-md transition-all text-right"
                  maxLength={15}
                  required
                />
              </div>

              <div>
                <CustomSelect
                  value={formData.grade}
                  onChange={(val) => setFormData({ ...formData, grade: val })}
                  options={[
                    { label: 'الصف الأول الثانوي', value: 'الصف الأول الثانوي' },
                    { label: 'الصف الثاني الثانوي', value: 'الصف الثاني الثانوي' },
                    { label: 'الصف الثالث الثانوي', value: 'الصف الثالث الثانوي' },
                  ]}
                  placeholder="اختر الصف الدراسي"
                />
              </div>

              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                <div className="group relative">
                  <div className="right-4 absolute inset-y-0 flex items-center text-[#8FA7A6] group-focus-within:text-[#31605F] transition-colors pointer-events-none">
                    <FiLock className="text-xl" />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="كلمة السر"
                    className="bg-white/80 backdrop-blur-sm py-4 pr-12 pl-12 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none focus:ring-4 focus:ring-[#31605F]/10 w-full text-[#1E2F2E] placeholder:text-[#8FA7A6] font-medium shadow-sm hover:shadow-md transition-all text-right"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="top-1/2 left-4 absolute text-[#8FA7A6] hover:text-[#31605F] -translate-y-1/2">
                    {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="group relative">
                  <div className="right-4 absolute inset-y-0 flex items-center text-[#8FA7A6] group-focus-within:text-[#31605F] transition-colors pointer-events-none">
                    <FiLock className="text-xl" />
                  </div>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="تأكيد كلمة السر"
                    className="bg-white/80 backdrop-blur-sm py-4 pr-12 pl-12 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none focus:ring-4 focus:ring-[#31605F]/10 w-full text-[#1E2F2E] placeholder:text-[#8FA7A6] font-medium shadow-sm hover:shadow-md transition-all text-right"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="top-1/2 left-4 absolute text-[#8FA7A6] hover:text-[#31605F] -translate-y-1/2">
                    {showConfirmPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#31605F] to-[#244948] disabled:opacity-70 shadow-lg shadow-[#31605F]/25 hover:shadow-xl hover:shadow-[#31605F]/35 mt-2 py-4 rounded-2xl w-full font-bold text-white text-xl transition-all"
              >
                {loading ? 'جاري التحميل...' : 'أنشئ الحساب !'}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#5F7A79] font-medium">
                يوجد لديك حساب بالفعل؟{' '}
                <Link to="/login" className="font-bold text-[#31605F] hover:underline">ادخل إلى حسابك الآن !</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
