import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMapPin, FiPhone, FiMail, FiSave, FiEdit2, FiPackage, FiClock, FiCheckCircle, FiTruck, FiX, FiBook, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
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

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      governorate: '',
      postalCode: '',
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          governorate: user.address?.governorate || '',
          postalCode: user.address?.postalCode || '',
        },
      });
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', formData);
      updateUser(res.data.user);
      setEditing(false);
      toast.success('تم تحديث البيانات بنجاح!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed': return <FiClock className="text-blue-500" />;
      case 'processing': return <FiPackage className="text-orange-500" />;
      case 'shipped': return <FiTruck className="text-purple-500" />;
      case 'delivered': return <FiCheckCircle className="text-green-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    const map = {
      placed: 'تم الطلب',
      processing: 'جاري التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي'
    };
    return map[status] || status;
  };

  if (!user) return null;

  return (
    <div className="bg-transparent min-h-screen relative selection:bg-[#31605F] selection:text-white pb-20">
      {/* Background blobs */}
      <motion.div animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute rounded-full mix-blend-multiply filter blur-[80px] opacity-30 bg-[#31605F] w-[40vw] h-[40vw] top-[-10%] left-[-10%] pointer-events-none z-0" />
      <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute rounded-full mix-blend-multiply filter blur-[80px] opacity-30 bg-[#D6E4E3] w-[45vw] h-[45vw] bottom-[-10%] right-[-10%] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto px-4 pt-40 pb-12 max-w-[1400px]">
        <div className="gap-6 grid grid-cols-1 lg:grid-cols-12">

          {/* Left Column: Profile Info */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="top-24 sticky bg-white/60 backdrop-blur-xl shadow-lg shadow-[#31605F]/5 border border-white/60 rounded-[2.5rem] overflow-hidden"
            >
              <div className="h-24 bg-gradient-to-r from-[#31605F] to-[#244948]" />
              <div className="px-6 pb-8">
                <div className="relative flex justify-center -mt-12 mb-4">
                  <div className="flex justify-center items-center bg-white shadow-xl border-[#EEF4F3] border-4 rounded-full w-24 h-24 overflow-hidden font-bold text-[#31605F] text-3xl">
                    <FiUser className="w-10 h-10" />
                  </div>
                </div>
                <div className="mb-6 text-center">
                  <h1 className="font-heading font-black text-[#1E2F2E] text-xl">{user.name}</h1>
                  <p className="text-[#8FA7A6] font-medium text-xs mt-1">{user.email}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="font-black text-[#31605F] text-sm">المعلومات الشخصية</label>
                      {!editing && (
                        <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-1 text-[#31605F] text-xs font-bold hover:underline">
                          <FiEdit2 /> تعديل
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="relative">
                        <FiUser className="top-1/2 right-3 absolute text-[#8FA7A6] -translate-y-1/2" />
                        <input
                          type="text"
                          disabled={!editing}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="الاسم"
                          className="bg-white disabled:opacity-60 py-3 pr-10 pl-4 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none w-full text-sm font-medium transition-all shadow-sm"
                        />
                      </div>
                      <div className="relative">
                        <FiPhone className="top-1/2 right-3 absolute text-[#8FA7A6] -translate-y-1/2" />
                        <input
                          type="text"
                          disabled={!editing}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="رقم الهاتف"
                          className="bg-white disabled:opacity-60 py-3 pr-10 pl-4 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none w-full text-sm font-medium transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block mb-3 font-black text-[#31605F] text-sm">عنوان التوصيل</label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        disabled={!editing}
                        value={formData.address.street}
                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                        placeholder="الشارع / المبنى"
                        className="bg-white disabled:opacity-60 px-4 py-3 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none w-full text-sm font-medium transition-all shadow-sm"
                      />
                      <div className="gap-2 grid grid-cols-2">
                        <input
                          type="text"
                          disabled={!editing}
                          value={formData.address.city}
                          onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                          placeholder="المدينة"
                          className="bg-white disabled:opacity-60 px-4 py-3 border border-white/60 focus:border-[#31605F]/40 rounded-2xl outline-none w-full text-sm font-medium transition-all shadow-sm"
                        />
                        <CustomSelect
                          value={formData.address.governorate}
                          onChange={(val) => setFormData({ ...formData, address: { ...formData.address, governorate: val } })}
                          placeholder="المحافظة"
                          disabled={!editing}
                          options={GOVERNORATES.map(g => ({ label: g, value: g }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {editing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2 pt-2"
                      >
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex flex-1 justify-center items-center gap-2 bg-gradient-to-r from-[#31605F] to-[#244948] shadow-lg shadow-[#31605F]/25 py-3 rounded-2xl font-bold text-white text-sm"
                        >
                          {loading ? '...' : <><FiSave /> حفظ</>}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="bg-white/60 hover:bg-white px-4 py-3 rounded-2xl font-bold text-[#8FA7A6] text-sm transition-all border border-white"
                        >
                          إلغاء
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Orders */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="flex items-center gap-3 font-heading font-black text-[#1E2F2E] text-2xl">
                  {user.role === 'admin' ? (
                    <>
                      <span className="p-2 bg-gradient-to-br from-[#EEF4F3] to-[#D6E4E3] rounded-xl text-[#31605F]"><FiEdit2 /></span>
                      دير موقعك بسهوله من هنا...
                    </>
                  ) : (
                    <>
                      <span className="p-2 bg-gradient-to-br from-[#EEF4F3] to-[#D6E4E3] rounded-xl text-[#31605F]"><FiPackage /></span>
                      طلباتي الأخيرة
                    </>
                  )}
                </h2>
                {user.role !== 'admin' && (
                  <span className="bg-[#31605F]/10 px-4 py-1.5 rounded-full font-black text-[#31605F] text-sm">
                    {orders.length} طلب
                  </span>
                )}
              </div>

              {user.role === 'admin' ? (
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                  <Link to="/admin?tab=books" className="group flex items-center gap-6 bg-white/60 hover:bg-white backdrop-blur-xl p-8 border border-white/80 rounded-[2.5rem] transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                    <div className="flex justify-center items-center bg-gradient-to-br from-[#31605F] to-[#244948] rounded-3xl w-20 h-20 text-white text-3xl group-hover:scale-110 transition-transform">
                      <FiBook />
                    </div>
                    <div>
                      <h3 className="mb-1 font-heading font-black text-[#1E2F2E] text-xl transition-colors group-hover:text-[#31605F]">إدارة الكتب</h3>
                      <p className="font-bold text-[#8FA7A6] text-sm">تعديل الأسعار والمحتوى</p>
                    </div>
                  </Link>

                  <Link to="/admin?tab=store_products" className="group flex items-center gap-6 bg-white/60 hover:bg-white backdrop-blur-xl p-8 border border-white/80 rounded-[2.5rem] transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                    <div className="flex justify-center items-center bg-gradient-to-br from-[#31605F] to-[#244948] rounded-3xl w-20 h-20 text-white text-3xl group-hover:scale-110 transition-transform">
                      <FiShoppingCart />
                    </div>
                    <div>
                      <h3 className="mb-1 font-heading font-black text-[#1E2F2E] text-xl transition-colors group-hover:text-[#31605F]">إدارة المنتجات</h3>
                      <p className="font-bold text-[#8FA7A6] text-sm">تحديث مخزون المتجر</p>
                    </div>
                  </Link>

                  <Link to="/admin?tab=orders" className="group flex items-center gap-6 bg-white/60 hover:bg-white backdrop-blur-xl p-8 border border-white/80 rounded-[2.5rem] transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                    <div className="flex justify-center items-center bg-gradient-to-br from-[#31605F] to-[#244948] rounded-3xl w-20 h-20 text-white text-3xl group-hover:scale-110 transition-transform">
                      <FiPackage />
                    </div>
                    <div>
                      <h3 className="mb-1 font-heading font-black text-[#1E2F2E] text-xl transition-colors group-hover:text-[#31605F]">متابعة الطلبات</h3>
                      <p className="font-bold text-[#8FA7A6] text-sm">تحديث حالات التوصيل</p>
                    </div>
                  </Link>

                  <Link to="/admin?tab=categories" className="group flex items-center gap-6 bg-white/60 hover:bg-white backdrop-blur-xl p-8 border border-white/80 rounded-[2.5rem] transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                    <div className="flex justify-center items-center bg-gradient-to-br from-[#31605F] to-[#244948] rounded-3xl w-20 h-20 text-white text-3xl group-hover:scale-110 transition-transform">
                      <FiEdit2 />
                    </div>
                    <div>
                      <h3 className="mb-1 font-heading font-black text-[#1E2F2E] text-xl transition-colors group-hover:text-[#31605F]">إدارة الأقسام</h3>
                      <p className="font-bold text-[#8FA7A6] text-sm">تنظيم تصنيفات المتجر</p>
                    </div>
                  </Link>
                </div>
              ) : (
                <>
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map(i => <div key={i} className="bg-white/50 backdrop-blur-md border border-white/60 rounded-[2rem] h-32 animate-pulse" />)}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-xl p-12 border border-white/60 rounded-[2.5rem] text-center shadow-sm">
                      <FiPackage className="mx-auto mb-4 text-[#8FA7A6] text-5xl" />
                      <h3 className="mb-2 font-heading font-black text-[#1E2F2E] text-lg">لا توجد طلبات بعد</h3>
                      <p className="mb-6 text-[#5F7A79] font-medium">لم تقم بإجراء أي طلبات حتى الآن.</p>
                      <a href="/marketplace" className="inline-block bg-gradient-to-r from-[#31605F] to-[#244948] shadow-lg shadow-[#31605F]/25 px-8 py-3 rounded-2xl font-bold text-white hover:shadow-xl transition-all hover:-translate-y-1">
                        تصفح الكتب الآن
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <motion.div
                          key={order._id}
                          whileHover={{ y: -4 }}
                          onClick={() => setSelectedOrder(order)}
                          className="bg-white/70 backdrop-blur-xl shadow-sm hover:shadow-lg hover:shadow-[#31605F]/10 p-6 border border-white/80 rounded-[2rem] transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-black text-[#31605F] text-sm">#{order._id.slice(-8).toUpperCase()}</span>
                                <div className="flex items-center gap-1 bg-[#EEF4F3] px-3 py-1 rounded-full font-medium text-[#5F7A79] text-xs">
                                  {getStatusIcon(order.orderStatus)}
                                  <span className="mr-1">{getStatusText(order.orderStatus)}</span>
                                </div>
                              </div>
                              <p className="text-[#8FA7A6] font-medium text-xs">
                                {new Date(order.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}
                              </p>
                            </div>
                            <div className="text-left">
                              <p className="font-black text-transparent bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] text-xl">{order.total} ج.م</p>
                              <p className="text-[#8FA7A6] font-medium text-xs">{order.items.length} كتب</p>
                            </div>
                          </div>

                          <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex-shrink-0 bg-[#EEF4F3] border border-white rounded-xl w-12 h-16 overflow-hidden shadow-sm">
                                {item.coverImage ? (
                                  <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="flex justify-center items-center w-full h-full text-[#8FA7A6]">📚</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>

        </div>

        {/* Order Tracking Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setSelectedOrder(null)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-2xl w-full max-w-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="flex items-center gap-3 font-heading font-black text-[#1E2F2E] text-2xl">
                    تتبع الطلب <span className="font-mono text-[#31605F] text-lg">#{selectedOrder._id.slice(-8).toUpperCase()}</span>
                  </h2>
                  <button onClick={() => setSelectedOrder(null)} className="hover:bg-[#EEF4F3] p-2 rounded-xl transition-colors text-[#8FA7A6] hover:text-[#1E2F2E]"><FiX className="w-6 h-6" /></button>
                </div>

                {/* Progress Stepper */}
                <div className="relative flex justify-between mb-12 px-4">
                  <div className="top-1/2 right-0 left-0 absolute bg-[#EEF4F3] h-1 -translate-y-1/2 rounded-full" />
                  <div
                    className="top-1/2 right-0 absolute bg-gradient-to-l from-[#31605F] to-[#244948] h-1 transition-all -translate-y-1/2 duration-500 rounded-full"
                    style={{
                      width: selectedOrder.orderStatus === 'placed' ? '0%' :
                        selectedOrder.orderStatus === 'processing' ? '33%' :
                          selectedOrder.orderStatus === 'shipped' ? '66%' : '100%'
                    }}
                  />

                  {[
                    { status: 'placed', icon: FiClock, label: 'تم الطلب' },
                    { status: 'processing', icon: FiPackage, label: 'التجهيز' },
                    { status: 'shipped', icon: FiTruck, label: 'الشحن' },
                    { status: 'delivered', icon: FiCheckCircle, label: 'التوصيل' }
                  ].map((step, idx) => {
                    const statuses = ['placed', 'processing', 'shipped', 'delivered'];
                    const currentIndex = statuses.indexOf(selectedOrder.orderStatus);
                    const stepIndex = statuses.indexOf(step.status);
                    const isCompleted = stepIndex <= currentIndex;
                    const isCurrent = stepIndex === currentIndex;

                    return (
                      <div key={step.status} className="z-10 relative flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${isCompleted ? 'bg-gradient-to-r from-[#31605F] to-[#244948] border-[#31605F] text-white shadow-lg shadow-[#31605F]/30' : 'bg-white border-[#EEF4F3] text-[#8FA7A6]'
                          } ${isCurrent ? 'ring-4 ring-[#31605F]/20 scale-110' : ''}`}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <span className={`absolute -bottom-8 whitespace-nowrap text-xs font-black ${isCompleted ? 'text-[#31605F]' : 'text-[#8FA7A6]'
                          }`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Order Details */}
                <div className="bg-[#EEF4F3]/60 mt-16 p-6 border border-white rounded-3xl">
                  <h3 className="mb-4 font-black text-[#1E2F2E] text-lg">تفاصيل المحتوى</h3>
                  <div className="space-y-4 pr-2 max-h-48 overflow-y-auto">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white/80 p-3 rounded-2xl">
                        <div className="flex-shrink-0 bg-[#EEF4F3] border border-white rounded-xl w-12 h-16 overflow-hidden">
                          {item.coverImage ? (
                            <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex justify-center items-center w-full h-full text-[#8FA7A6] text-xl">📚</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[#1E2F2E] text-sm truncate">{item.title}</p>
                          <p className="text-[#8FA7A6] font-medium text-xs">الكمية: {item.quantity}</p>
                        </div>
                        <p className="font-black text-[#31605F] text-sm">{item.price} ج.م</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-[#D6E4E3] border-t">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[#1E2F2E] text-lg">الإجمالي النهائي</span>
                      <span className="font-black text-transparent bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] text-2xl">{selectedOrder.total} ج.م</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
