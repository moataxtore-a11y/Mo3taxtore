import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiPhone, FiUser, FiCreditCard, FiCheck, FiArrowLeft, FiShoppingCart, FiBook, FiCheckCircle, FiDollarSign, FiSmartphone } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import CustomSelect from '../components/CustomSelect';

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية',
  'الغربية', 'كفر الشيخ', 'البحيرة', 'المنيا', 'أسيوط', 'سوهاج',
  'قنا', 'الأقصر', 'أسوان', 'الفيوم', 'بني سويف', 'بورسعيد',
  'دمياط', 'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء',
  'الوادي الجديد', 'مطروح', 'البحر الأحمر',
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, shippingSettings, hasFreeShippingItem } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [localSettings, setLocalSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings/shipping');
        setLocalSettings(data.settings);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    governorate: user?.address?.governorate || '',
    postalCode: user?.address?.postalCode || '',
    paymentMethod: 'cod',
  });

  // Sync form with user data if it changes (e.g., after login or profile update)
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        street: user.address?.street || prev.street,
        city: user.address?.city || prev.city,
        governorate: user.address?.governorate || prev.governorate,
        postalCode: user.address?.postalCode || prev.postalCode,
      }));
    }
  }, [user]);

  // Calculate dynamic delivery fee
  let deliveryFee = 0; // Starts at 0
  let freeThreshold = 500;
  let hasFreeShipping = false;

  const activeSettings = localSettings || shippingSettings;

  if (activeSettings) {
    freeThreshold = activeSettings.freeShippingThreshold;
    if (form.governorate) {
      const gov = activeSettings.governorates.find(
        (g) => g.name.trim() === form.governorate.trim()
      );
      if (gov) {
        deliveryFee = Number(gov.price) || 0;
      }
    }
  }

  if (subtotal >= freeThreshold || hasFreeShippingItem) {
    deliveryFee = 0;
    hasFreeShipping = true;
  }

  const total = subtotal + deliveryFee - (appliedCoupon?.calculatedDiscount || 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode,
        orderAmount: subtotal,
      });
      setAppliedCoupon(res.data);
      toast.success('تم تطبيق كود الخصم بنجاح! ');
    } catch (err) {
      toast.error(err.response?.data?.message || 'كود خصم غير صالح');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error('العربة فارغة');

    setLoading(true);
    try {
      const orderData = {
        items: items.map((item) => ({ book: item._id, quantity: item.quantity })),
        shippingAddress: {
          name: form.name,
          phone: form.phone,
          street: form.street,
          city: form.city,
          governorate: form.governorate,
          postalCode: form.postalCode,
        },
        paymentMethod: form.paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      const res = await api.post('/orders', orderData);
      setPlacedOrder(res.data.order);
      setOrderPlaced(true);
      clearCart();
      toast.success('تم إتمام الطلب بنجاح! ');
    } catch (err) {
      const errData = err.response?.data;
      console.error('Order error full:', JSON.stringify(errData));
      const msg = errData?.errors?.[0] || errData?.message || 'حدث خطأ أثناء إتمام الطلب';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Order Confirmation Screen
  if (orderPlaced) {
    return (
      <div className="relative flex justify-center items-center bg-transparent px-4 pt-20 min-h-screen">
        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="top-[-10%] left-[-10%] absolute bg-[#31605F] opacity-40 blur-[80px] rounded-full w-[50vw] h-[50vw] pointer-events-none mix-blend-multiply filter"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="right-[-10%] bottom-[-10%] absolute bg-[#D6E4E3] opacity-40 blur-[80px] rounded-full w-[40vw] h-[40vw] pointer-events-none mix-blend-multiply filter"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="z-10 relative bg-white/60 shadow-[#31605F]/10 shadow-2xl backdrop-blur-xl p-10 border border-white/60 rounded-[3rem] max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex justify-center items-center bg-gradient-to-r from-[#31605F] to-[#244948] shadow-[#31605F]/30 shadow-xl mx-auto mb-6 rounded-full w-24 h-24"
          >
            <FiCheck className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="mb-3 font-heading font-black text-[#1E2F2E] text-3xl">تم الطلب بنجاح! </h1>
          <p className="mb-2 font-medium text-[#5F7A79] text-lg">شكراً لك! طلبك قيد المعالجة.</p>
          {placedOrder && (
            <p className="mb-6 text-[#8FA7A6] text-sm">
              رقم الطلب: <span className="font-mono font-bold text-[#31605F]">{placedOrder._id?.slice(-8).toUpperCase()}</span>
            </p>
          )}

          <div className="space-y-3 bg-white/70 mb-8 p-6 border border-white rounded-2xl text-right">
            <div className="flex justify-between text-sm">
              <span className="font-black text-[#31605F]">{placedOrder?.total?.toFixed(0)} جنيه</span>
              <span className="font-medium text-[#8FA7A6]">الإجمالي النهائي</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-[#1E2F2E]">{form.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : form.paymentMethod}</span>
              <span className="font-medium text-[#8FA7A6]">طريقة الدفع</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-[#1E2F2E]">{form.governorate}، {form.city}</span>
              <span className="font-medium text-[#8FA7A6]">العنوان</span>
            </div>
          </div>

          {placedOrder?._id && (
            <Link to={`/invoice-preview/${placedOrder._id}`} className="block mb-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/80 py-4 border border-white hover:border-[#31605F]/30 rounded-2xl w-[120px] font-bold text-[#31605F] transition-all"
              >
                 👀 الفاتورة
              </motion.button>
            </Link>
          )}

          <div className="flex sm:flex-row flex-col gap-3">
            <Link to="/student/dashboard" className="flex-1">
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="bg-gradient-to-r from-[#31605F] to-[#244948] shadow-[#31605F]/25 shadow-lg py-4 rounded-2xl w-full font-bold text-white transition-all">
                تتبع طلبك
              </motion.button>
            </Link>
            <Link to="/marketplace" className="flex-1">
              <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="bg-white/80 py-4 border border-white hover:border-[#31605F]/30 rounded-2xl w-full font-bold text-[#1E2F2E] transition-all">
                متابعة التسوق
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center bg-transparent min-h-screen">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="flex justify-center mb-4 text-text-muted text-6xl">
          <FiShoppingCart />
        </motion.div>
        <h2 className="mb-2 font-heading font-bold text-xl">العربة فارغة</h2>
        <Link to="/marketplace" className="text-primary hover:underline">تصفح الكتب</Link>
      </div>
    );
  }

  return (
    <div className="relative bg-transparent selection:bg-[#31605F] pb-20 min-h-screen selection:text-white">
      {/* Background Blobs */}
      <motion.div animate={{ y: [0, -20, 0], x: [0, 15, 0], scale: [1, 1.05, 1] }} transition={{ duration: 8, repeat: Infinity }} className="top-[-10%] left-[-10%] z-0 absolute bg-[#31605F] opacity-40 blur-[80px] rounded-full w-[40vw] h-[40vw] pointer-events-none mix-blend-multiply filter" />
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity }} className="top-[20%] left-[75%] z-0 absolute bg-[#8FA7A6] opacity-40 blur-[80px] rounded-full w-[30vw] h-[30vw] pointer-events-none mix-blend-multiply filter" />
      <motion.div animate={{ y: [0, -15, 0], x: [0, -10, 0] }} transition={{ duration: 12, repeat: Infinity }} className="top-[60%] left-[-5%] z-0 absolute bg-[#D6E4E3] opacity-40 blur-[80px] rounded-full w-[45vw] h-[45vw] pointer-events-none mix-blend-multiply filter" />

      <div className="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-40 pb-12 max-w-7xl">
        <Link to="/cart" className="inline-flex items-center gap-2 mb-8 font-medium text-[#5F7A79] hover:text-[#31605F] text-sm transition-colors hover:-translate-x-1 duration-300">
          <FiArrowLeft /> العودة للعربة
        </Link>

        <h1 className="mb-10 font-heading font-black text-[#1E2F2E] text-4xl md:text-5xl">
          إتمام <span className="bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] text-transparent">الشراء</span>
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
            {/* Shipping Form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-20 relative bg-white/60 shadow-sm backdrop-blur-xl p-6 md:p-8 border border-white/60 rounded-[2.5rem]"
              >
                <h2 className="flex items-center gap-3 mb-6 font-heading font-black text-[#1E2F2E] text-xl">
                  <span className="bg-gradient-to-br from-[#EEF4F3] to-[#D6E4E3] p-3 rounded-xl text-[#31605F]"><FiMapPin /></span> عنوان الشحن
                </h2>

                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 font-bold text-[#5F7A79] text-sm">الاسم بالكامل</label>
                    <div className="relative">
                      <FiUser className="top-1/2 left-4 absolute text-[#8FA7A6] -translate-y-1/2" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="bg-white shadow-sm hover:shadow-md py-4 pr-4 pl-12 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none focus:ring-[#31605F]/10 focus:ring-4 w-full font-medium text-[#1E2F2E] transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 font-bold text-[#5F7A79] text-sm">رقم الهاتف</label>
                    <div className="relative">
                      <FiPhone className="top-1/2 left-4 absolute text-[#8FA7A6] -translate-y-1/2" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="01XXXXXXXXX"
                        className="bg-white shadow-sm hover:shadow-md py-4 pr-4 pl-12 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none focus:ring-[#31605F]/10 focus:ring-4 w-full font-medium text-[#1E2F2E] transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 font-bold text-[#5F7A79] text-sm">العنوان التفصيلي</label>
                    <input
                      type="text"
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      placeholder="الشارع، المنطقة، رقم المبنى..."
                      className="bg-white shadow-sm hover:shadow-md px-5 py-4 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none focus:ring-[#31605F]/10 focus:ring-4 w-full font-medium text-[#1E2F2E] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-bold text-[#5F7A79] text-sm">المحافظة</label>
                    <CustomSelect
                      value={form.governorate}
                      onChange={(val) => setForm({ ...form, governorate: val })}
                      placeholder="اختر المحافظة"
                      options={(activeSettings?.governorates || GOVERNORATES).map(g => ({
                        label: g.name || g,
                        value: g.name || g
                      }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-bold text-[#5F7A79] text-sm">المدينة</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="bg-white shadow-sm hover:shadow-md px-5 py-4 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none focus:ring-[#31605F]/10 focus:ring-4 w-full font-medium text-[#1E2F2E] transition-all"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="z-10 relative bg-white/60 shadow-sm backdrop-blur-xl p-6 md:p-8 border border-white/60 rounded-[2.5rem]"
              >
                <h2 className="flex items-center gap-3 mb-6 font-heading font-black text-[#1E2F2E] text-xl">
                  <span className="bg-gradient-to-br from-[#EEF4F3] to-[#D6E4E3] p-3 rounded-xl text-[#31605F]"><FiCreditCard /></span> طريقة الدفع
                </h2>

                <div className="space-y-3">
                  {[
                    { value: 'cod', label: 'الدفع عند الاستلام', icon: <FiDollarSign />, desc: 'ادفع نقداً عند استلام الكتب', color: 'text-amber-500', bg: 'bg-amber-50' },
                    { value: 'stripe', label: 'بطاقة ائتمان (Stripe)', icon: <FiCreditCard />, desc: 'Visa / Mastercard', color: 'text-blue-500', bg: 'bg-blue-50' },
                    { value: 'paymob', label: 'Paymob', icon: <FiSmartphone />, desc: 'دفع إلكتروني محلي', color: 'text-purple-500', bg: 'bg-purple-50' },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${form.paymentMethod === method.value
                          ? 'border-[#31605F] bg-[#31605F]/5 shadow-md shadow-[#31605F]/10'
                          : 'border-white/80 bg-white hover:border-[#31605F]/30 hover:shadow-sm'
                        }`}
                    >
                      <input type="radio" name="paymentMethod" value={method.value} checked={form.paymentMethod === method.value} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="sr-only" />
                      <span className={`p-3 rounded-xl ${method.bg} ${method.color} text-xl`}>{method.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-[#1E2F2E] text-sm">{method.label}</p>
                        <p className="font-medium text-[#8FA7A6] text-xs">{method.desc}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${form.paymentMethod === method.value ? 'border-[#31605F]' : 'border-[#D6E4E3]'
                        }`}>
                        {form.paymentMethod === method.value && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-gradient-to-r from-[#31605F] to-[#244948] rounded-full w-3 h-3" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="top-24 sticky bg-white/70 shadow-[#31605F]/5 shadow-lg backdrop-blur-xl p-6 md:p-8 border border-white/60 rounded-[2.5rem]">
                <h3 className="mb-6 font-heading font-black text-[#1E2F2E] text-xl">ملخص الطلب</h3>

                <div className="space-y-3 mb-6 max-h-52 overflow-auto scrollbar-thin">
                  {items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 bg-white/60 p-2 rounded-2xl">
                      <div className="flex-shrink-0 bg-[#EEF4F3] rounded-xl w-12 h-14 overflow-hidden">
                        {item.coverImage ? (
                          <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex justify-center items-center w-full h-full text-[#8FA7A6] text-lg"><FiBook /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1E2F2E] text-xs truncate">{item.title}</p>
                        <p className="font-medium text-[#8FA7A6] text-xs">x{item.quantity}</p>
                      </div>
                      <p className="font-black text-[#31605F] text-sm">
                        {((item.discount > 0 ? item.priceAfterDiscount : item.price) * item.quantity).toFixed(0)} ج
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-[#EEF4F3] border-t-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-[#1E2F2E]">{subtotal.toFixed(0)} جنيه</span>
                    <span className="font-medium text-[#8FA7A6]">المجموع</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-bold">-{appliedCoupon.calculatedDiscount.toFixed(0)} جنيه</span>
                      <span className="font-medium">خصم ({appliedCoupon.code})</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    {deliveryFee === 0 && !form.governorate && subtotal < freeThreshold ? (
                      <span className="font-medium text-[#8FA7A6] text-sm">اختر المحافظة لحسابها</span>
                    ) : (
                      <span className="font-bold text-[#1E2F2E]">{deliveryFee === 0 ? <span className="bg-green-50 px-2 py-0.5 rounded-full text-green-600 text-sm">مجاني ✓</span> : `${deliveryFee} جنيه`}</span>
                    )}
                    <span className="font-medium text-[#8FA7A6]">الشحن</span>
                  </div>
                  <div className="flex justify-between pt-3 border-[#EEF4F3] border-t-2">
                    <span className="bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] font-black text-transparent text-2xl">{total.toFixed(0)} جنيه</span>
                    <span className="font-heading font-black text-[#1E2F2E] text-xl">الإجمالي</span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-[#EEF4F3] border-t-2">
                  <label className="block mb-3 font-bold text-[#5F7A79] text-sm">كود الخصم</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="أدخل الكود..."
                      className="flex-1 bg-white shadow-sm px-4 py-3 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none font-mono text-sm uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-[#31605F]/10 hover:bg-[#31605F]/20 disabled:opacity-50 px-4 py-3 rounded-2xl font-bold text-[#31605F] text-sm transition-colors"
                    >
                      {couponLoading ? '...' : 'تطبيق'}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex justify-center items-center gap-2 bg-gradient-to-r from-[#31605F] to-[#244948] disabled:opacity-60 shadow-[#31605F]/25 shadow-lg hover:shadow-[#31605F]/40 hover:shadow-xl mt-6 py-4 rounded-2xl w-full font-bold text-white text-lg transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="border-2 border-white/30 border-t-white rounded-full w-5 h-5 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      تأكيد الطلب <FiCheck />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
