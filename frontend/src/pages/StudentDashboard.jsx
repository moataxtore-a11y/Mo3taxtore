import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiPackage, FiStar, FiBook, FiBookOpen, FiTruck, FiCheck, FiClock, FiFileText, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import BookLoader from '../components/BookLoader';
import ModalPortal from '../components/ModalPortal';
import Footer from '../components/Footer';

const ORDER_STATUS_MAP = {
  placed: { label: 'تم الطلب', color: 'text-blue-500', step: 1, icon: <FiFileText className="inline" /> },
  confirmed: { label: 'تم التأكيد', color: 'text-indigo-500', step: 2, icon: <FiCheckCircle className="inline" /> },
  processing: { label: 'قيد التجهيز', color: 'text-yellow-500', step: 3, icon: <FiPackage className="inline" /> },
  shipped: { label: 'تم الشحن', color: 'text-orange-500', step: 4, icon: <FiTruck className="inline" /> },
  delivered: { label: 'تم التسليم', color: 'text-green-500', step: 5, icon: <FiStar className="inline" /> },
  cancelled: { label: 'ملغي', color: 'text-red-500', step: 0, icon: <FiXCircle className="inline" /> },
};

const STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [reviewData, setReviewData] = useState({ bookId: '', rating: 5, comment: '' });
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    setCancelLoading(true);
    try {
      await api.put(`/orders/${cancellingOrder._id}/cancel`, { reason: cancelReason });
      toast.success('تم إلغاء الطلب بنجاح');
      setCancellingOrder(null);
      setCancelReason('');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل إلغاء الطلب');
    } finally {
      setCancelLoading(false);
    }
  };

  const submitReview = async () => {
    try {
      if (!reviewData.bookId) return;
      await api.post(`/reviews/${reviewData.bookId}`, {
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      toast.success('تم إرسال التقييم بنجاح! ⭐');
      setShowReviewModal(false);
      setReviewData({ bookId: '', rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const tabs = [
    { id: 'orders', label: 'الطلبات', count: orders.length },
    { id: 'books', label: 'مكتبي', count: orders.filter(o => o.orderStatus === 'delivered').reduce((s, o) => s + o.items.length, 0) },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-body selection:bg-primary/10" dir="rtl">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-6xl">
        {/* Cleaner Header */}
        <header className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="font-black text-[#1E2F2E] text-3xl md:text-4xl">
              أهلاً، <span className="text-primary">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="font-bold text-[#8FA7A6] text-sm mt-1">سجل نشاطك وكتبك المفضلة في مكان واحد</p>
          </div>
          <Link to="/marketplace">
             <button className="flex items-center gap-2 bg-primary hover:bg-[#244948] shadow-lg shadow-primary/10 px-8 py-3 rounded-2xl font-black text-white text-sm transition-all active:scale-95">
               <FiShoppingBag /> اطلب كتب جديدة
             </button>
          </Link>
        </header>

        {/* Square Stats Tiles Row - Forced 3 Grid */}
        <div className="gap-3 md:gap-6 grid grid-cols-3 mb-10 text-center">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
             className="bg-white p-4 md:p-8 border border-[#E5E7EB] rounded-2xl md:rounded-[3rem] shadow-sm flex flex-col items-center justify-center group hover:border-primary/20 transition-all"
           >
              <div className="bg-primary/5 mb-2 md:mb-4 p-3 md:p-5 rounded-xl md:rounded-3xl group-hover:scale-110 transition-transform">
                 <FiPackage className="w-5 h-5 md:w-8 md:h-8 text-primary" />
              </div>
              <p className="font-black text-xl md:text-4xl text-text-primary mb-1 tracking-tighter">{orders.length}</p>
              <span className="block font-bold text-[#8FA7A6] text-[8px] md:text-[11px] uppercase tracking-tighter md:tracking-widest">الطلبات</span>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
             className="bg-white p-4 md:p-8 border border-[#E5E7EB] rounded-2xl md:rounded-[3rem] shadow-sm flex flex-col items-center justify-center group hover:border-blue-500/20 transition-all"
           >
              <div className="bg-blue-50 mb-2 md:mb-4 p-3 md:p-5 rounded-xl md:rounded-3xl group-hover:scale-110 transition-transform">
                 <FiTruck className="w-5 h-5 md:w-8 md:h-8 text-blue-600" />
              </div>
              <p className="font-black text-xl md:text-4xl text-blue-600 mb-1 tracking-tighter">{orders.filter(o => ['shipped', 'processing', 'confirmed', 'placed'].includes(o.orderStatus)).length}</p>
              <span className="block font-bold text-[#8FA7A6] text-[8px] md:text-[11px] uppercase tracking-tighter md:tracking-widest">توصيل</span>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
             className="bg-white p-4 md:p-8 border border-[#E5E7EB] rounded-2xl md:rounded-[3rem] shadow-sm flex flex-col items-center justify-center group hover:border-emerald-500/20 transition-all"
           >
              <div className="bg-emerald-50 mb-2 md:mb-4 p-3 md:p-5 rounded-xl md:rounded-3xl group-hover:scale-110 transition-transform">
                 <FiBookOpen className="w-5 h-5 md:w-8 md:h-8 text-emerald-600" />
              </div>
              <p className="font-black text-xl md:text-4xl text-emerald-600 mb-1 tracking-tighter">{orders.filter(o => o.orderStatus === 'delivered').reduce((s, o) => s + o.items.length, 0)}</p>
              <span className="block font-bold text-[#8FA7A6] text-[8px] md:text-[11px] uppercase tracking-tighter md:tracking-widest">امتلاك</span>
           </motion.div>
        </div>

        {/* Unified Dashboard Grid */}
        <div className="gap-8 grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Side: Navigation */}
          <div className="lg:col-span-3">
             <nav className="flex lg:flex-col gap-2 bg-[#F3F4F6] p-1.5 rounded-[1.5rem] overflow-x-auto no-scrollbar lg:sticky lg:top-24">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl text-sm font-black transition-all flex-1 lg:flex-none ${
                        activeTab === tab.id 
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-[#8FA7A6] hover:text-text-primary hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       {tab.id === 'orders' ? <FiPackage className="w-4 h-4" /> : <FiBook className="w-4 h-4" />}
                       <span>{tab.label}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] ${activeTab === tab.id ? 'bg-primary/10' : 'bg-gray-200 text-gray-500'}`}>{tab.count}</span>
                  </button>
                ))}
             </nav>
          </div>

          {/* Right Side: Main Content */}
          <div className="lg:col-span-9">
             <div className="transition-all duration-300">
                {activeTab === 'orders' ? (
                  <div className="space-y-5">
                    {loading ? (
                      <div className="flex justify-center items-center py-24"><BookLoader /></div>
                    ) : orders.length === 0 ? (
                      <div className="bg-white py-24 border border-[#E5E7EB] border-dashed rounded-[3rem] text-center">
                         <FiPackage className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                         <p className="font-black text-text-muted">لم تبدأ رحلتك بعد..</p>
                      </div>
                    ) : (
                      orders.map((order, idx) => (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white hover:border-primary/20 border border-[#E5E7EB] rounded-[2rem] overflow-hidden transition-all shadow-sm group"
                        >
                          <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 bg-[#F9FBFA] px-6 md:px-8 py-5 border-b border-[#E5E7EB]">
                             <div className="flex items-center gap-4">
                                <div className={`flex justify-center items-center rounded-xl w-10 h-10 ${
                                   order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                                   order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-primary text-white'
                                }`}>
                                   {ORDER_STATUS_MAP[order.orderStatus]?.icon || <FiPackage />}
                                </div>
                                <div>
                                   <p className="font-black text-sm text-text-primary">طلب #{order._id.slice(-8).toUpperCase()}</p>
                                   <p className="font-bold text-[#8FA7A6] text-[11px]">{new Date(order.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</p>
                                </div>
                             </div>
                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                    order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                                    order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                                 }`}>
                                    {ORDER_STATUS_MAP[order.orderStatus]?.label || order.orderStatus}
                                 </span>
                                 {['placed', 'confirmed', 'processing'].includes(order.orderStatus) && (
                                   <button
                                      onClick={() => { setCancellingOrder(order); setCancelReason(''); }}
                                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-full font-black text-[11px] transition-all active:scale-95 flex items-center gap-1 border border-red-100"
                                   >
                                      <FiXCircle className="w-3.5 h-3.5" /> إلغاء الطلب
                                   </button>
                                 )}
                                 <Link to={`/invoice-preview/${order._id}`} className="mr-auto sm:mr-0 bg-white hover:bg-white shadow-sm px-4 py-2 border border-[#E5E7EB] rounded-full font-black text-primary text-xs transition-all active:scale-95">👀 الفاتورة</Link>
                              </div>
                          </div>
                          
                          <div className="px-6 md:px-8 py-6">
                             <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                {order.items.map((item, j) => (
                                  <div key={j} className="flex items-center gap-4 bg-[#fcfdfe] p-3 border border-[#F3F4F6] rounded-2xl transition-colors hover:bg-white hover:border-primary/10">
                                     <div className="flex-shrink-0 bg-white shadow-sm border border-gray-100 rounded-lg w-12 h-16 overflow-hidden">
                                        {item.coverImage ? <img src={item.coverImage} className="w-full h-full object-cover" /> : <div className="flex justify-center items-center h-full text-gray-200"><FiBook /></div>}
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <Link to={`/books/${item.book}`} className="hover:text-primary transition-colors">
                                           <h4 className="font-black text-[#1E2F2E] text-xs leading-relaxed">{item.title}</h4>
                                        </Link>
                                        <p className="font-bold text-[#8FA7A6] text-[10px]">الكمية: {item.quantity}</p>
                                     </div>
                                     {order.orderStatus === 'delivered' && (
                                       <button 
                                          onClick={() => { setReviewData({ ...reviewData, bookId: item.book }); setShowReviewModal(true); }}
                                          className="text-amber-500 hover:text-amber-600 font-black text-[10px] underline underline-offset-4"
                                       >
                                          قيم الكتاب
                                       </button>
                                     )}
                                  </div>
                                ))}
                             </div>
                             <div className="flex justify-between items-center mt-6 pt-6 border-t border-[#F3F4F6]">
                                <span className="font-bold text-[#8FA7A6] text-xs underline decoration-dotted underline-offset-4 tracking-tight">طريقة الدفع: {order.paymentStatus === 'paid' ? 'مدفوع مسبقاً' : 'الدفع عند الاستلام'}</span>
                                <div className="text-left font-black text-primary text-xl tracking-tighter">{order.total} <span className="text-[10px] opacity-40">ج.م</span></div>
                             </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                     {orders
                        .filter(o => o.orderStatus === 'delivered')
                        .flatMap(o => o.items)
                        .map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="group bg-white hover:border-primary/30 border border-[#E5E7EB] rounded-[1.5rem] overflow-hidden transition-all shadow-sm"
                          >
                             <div className="relative aspect-[3/4] overflow-hidden">
                                {item.coverImage ? <img src={item.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="flex justify-center items-center h-full bg-gray-50 text-gray-200 text-4xl"><FiBook /></div>}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="bottom-2 right-2 absolute bg-white/90 backdrop-blur-sm p-1.5 rounded-lg opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all">
                                   <FiBookOpen className="text-primary" />
                                </div>
                             </div>
                             <div className="p-3">
                                <Link to={`/books/${item.book}`} className="hover:text-primary transition-colors">
                                   <h4 className="font-black text-[#1E2F2E] text-[11px] leading-tight">{item.title}</h4>
                                </Link>
                             </div>
                          </motion.div>
                        ))
                     }
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Simplified Review Modal */}
      <ModalPortal isOpen={showReviewModal || !!cancellingOrder}>
      {showReviewModal && (
        <div className="z-[100] fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setShowReviewModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
               <h3 className="font-black text-[#1E2F2E] text-2xl">تقييمك يهمنا</h3>
               <p className="text-[#8FA7A6] text-sm mt-1">اختر النجيمات المناسبة لهذا الكتاب</p>
            </div>
            
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setReviewData({ ...reviewData, rating: star })} className="text-3xl transition-transform active:scale-90">
                  {star <= reviewData.rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            <textarea
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              placeholder="هل تريد قول شيء آخر عن الكتاب؟"
              className="bg-[#F9FBFA] p-5 border border-transparent focus:border-primary/30 rounded-2xl outline-none w-full h-32 text-sm font-bold resize-none transition-all"
            />

            <div className="flex flex-col gap-2 mt-8">
              <button 
                onClick={submitReview}
                className="bg-primary py-4 rounded-2xl font-black text-white shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                تأكيد التقييم
              </button>
              <button onClick={() => setShowReviewModal(false)} className="py-2.5 font-bold text-[#8FA7A6] text-sm hover:text-red-500 transition-colors">إغلاق</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div className="z-[100] fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setCancellingOrder(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
               <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500">
                 <FiXCircle className="w-6 h-6" />
               </div>
               <h3 className="font-black text-[#1E2F2E] text-2xl">تأكيد إلغاء الطلب</h3>
               <p className="text-[#8FA7A6] text-sm mt-1">هل أنت تأكد من رغبتك في إلغاء الطلب #{cancellingOrder._id.slice(-8).toUpperCase()}؟</p>
            </div>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="سبب الإلغاء (اختياري)..."
              className="bg-[#F9FBFA] p-4 border border-transparent focus:border-red-300 rounded-2xl outline-none w-full h-24 text-sm font-bold resize-none transition-all"
            />

            <div className="flex flex-col gap-2 mt-6">
              <button 
                onClick={handleCancelOrder}
                disabled={cancelLoading}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 py-3.5 rounded-2xl font-black text-white shadow-xl shadow-red-500/20 transition-all active:scale-95 cursor-pointer"
              >
                {cancelLoading ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
              </button>
              <button onClick={() => setCancellingOrder(null)} className="py-2.5 font-bold text-[#8FA7A6] text-sm hover:text-gray-700 transition-colors">تراجع</button>
            </div>
          </motion.div>
        </div>
      )}
      </ModalPortal>
    </div>
  );
};

export default StudentDashboard;
