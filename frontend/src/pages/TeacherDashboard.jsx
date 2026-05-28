import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiUpload, FiImage, FiX, FiCheck, FiBook, FiDollarSign, FiPrinter, FiMapPin, FiPackage, FiBarChart2, FiShoppingCart } from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import imageCompression from 'browser-image-compression';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import CustomSelect from '../components/CustomSelect';
import ConfirmModal from '../components/ConfirmModal';
import Footer from '../components/Footer';


const COLORS = ['#31605F', '#5F7A79', '#8FA7A6', '#244948', '#193534', '#1E2F2E'];

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [teacherNames, setTeacherNames] = useState([]);
  const [teacherNameInput, setTeacherNameInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'danger'
  });

  const showConfirm = (config) => {
    setConfirmConfig({
      ...config,
      isOpen: true,
      onConfirm: async () => {
        await config.onConfirm();
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const [bookForm, setBookForm] = useState({
    title: '', description: '', price: '', discount: 0, category: 'mathematics',
    stock: '', isbn: '', pages: '', grade: '', teacherName: '',
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [booksRes, ordersRes, categoriesRes] = await Promise.all([
        api.get('/books/teacher/my-books'),
        api.get('/orders/teacher'),
        api.get('/categories?type=book'),
      ]);
      setBooks(booksRes.data.books);
      setOrders(ordersRes.data.orders);
      setCategories(categoriesRes.data.categories.map(c => ({ label: c.name, value: c.slug })) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherNames = async () => {
    try {
      const res = await api.get('/teacher-names');
      setTeacherNames(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeacherNames();
  }, []);

  const handleAddTeacherName = async (e) => {
    e.preventDefault();
    const name = teacherNameInput.trim();
    if (!name) return;
    try {
      await api.post('/teacher-names', { name });
      setTeacherNameInput('');
      fetchTeacherNames();
      toast.success('تمت إضافة المدرس');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleDeleteTeacherName = async (id) => {
    try {
      await api.delete(`/teacher-names/${id}`);
      fetchTeacherNames();
      toast.success('تم حذف المدرس');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const openAddModal = () => {
    setEditingBook(null);
    setBookForm({ title: '', description: '', price: '', category: 'mathematics', stock: '', isbn: '', pages: '', grade: '', teacherName: '' });
    setCoverFile(null);
    setCoverPreview(null);
    setUploadProgress(0);
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title, description: book.description, price: book.price,
      category: book.category,
      stock: (Number(book.stock) || 0) + (Number(book.totalSold) || 0),
      isbn: book.isbn || '',
      pages: book.pages || '', grade: book.grade || '',
      teacherName: book.teacherName || '',
      discount: book.discount || 0,
    });
    setCoverFile(null);
    setCoverPreview(book.coverImage || null);
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);

    // Compress image
    try {
      toast.loading('جاري ضغط الصورة...', { id: 'compress' });
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        onProgress: (p) => setUploadProgress(Math.round(p * 0.3)), // 0-30%
      };
      const compressed = await imageCompression(file, options);
      setCoverFile(compressed);
      toast.success(`تم ضغط الصورة: ${(compressed.size / 1024).toFixed(0)} KB`, { id: 'compress' });
    } catch {
      setCoverFile(file);
      toast.dismiss('compress');
    }
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setUploadProgress(30);
    try {
      const formData = new FormData();
      Object.entries(bookForm).forEach(([key, val]) => {
        if (key === 'stock' && editingBook) {
          // New remaining = UI_total - sold
          const newTotal = Number(val);
          const sold = Number(editingBook.totalSold) || 0;
          formData.append('stock', Math.max(0, newTotal - sold));
        } else if (val !== '' && val !== undefined) {
          formData.append(key, val);
        }
      });
      if (coverFile) formData.append('coverImage', coverFile);

      const config = {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            30 + (progressEvent.loaded / progressEvent.total) * 70
          );
          setUploadProgress(Math.min(percent, 99));
        },
      };

      if (editingBook) {
        await api.put(`/books/${editingBook._id}`, formData, config);
        toast.success('تم تعديل الكتاب بنجاح! 📝');
      } else {
        await api.post('/books', formData, config);
        toast.success('تم رفع الكتاب بنجاح! 📚');
      }
      setUploadProgress(100);
      setTimeout(() => {
        setShowModal(false);
        setUploadProgress(0);
        fetchData();
      }, 500);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0] || 'حدث خطأ');
      setUploadProgress(0);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (bookId) => {
    showConfirm({
      title: 'حذف كتاب',
      message: 'هل أنت متأكد من حذف هذا الكتاب؟ سيتم إزالته من المتجر نهائياً.',
      onConfirm: async () => {
        try {
          await api.delete(`/books/${bookId}`);
          toast.success('تم حذف الكتاب بنجاح');
          fetchData();
        } catch (err) {
          toast.error('حدث خطأ أثناء الحذف');
        }
      }
    });
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const [selectedOrders, setSelectedOrders] = useState([]);

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSelectAllOrders = (e) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map(o => o._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handlePrintBulkInvoices = () => {
    const selectedData = orders.filter(o => selectedOrders.includes(o._id));
    if (selectedData.length === 0) {
      toast.error('يرجى اختيار طلب واحد على الأقل للطباعة');
      return;
    }

    const ids = selectedData.map(o => o._id).join(',');
    window.open(`/invoice-preview/bulk?ids=${ids}`, '_blank');
  };

  const handlePrintInvoice = (order) => {
    window.open(`/invoice-preview/${order._id}`, '_blank');
  };

  // Stats
  const totalEarnings = orders.reduce((sum, o) => sum + o.total, 0);
  const totalSold = books.reduce((sum, b) => sum + b.totalSold, 0);
  const approvedBooks = books.filter(b => b.status === 'approved').length;
  const pendingBooks = books.filter(b => b.status === 'pending').length;

  // Chart data
  const categoryData = categories.map(cat => ({
    name: cat.label,
    value: books.filter(b => b.category === cat.value).length,
  })).filter(d => d.value > 0);

  const salesData = books
    .filter(b => b.totalSold > 0)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 6)
    .map(b => ({ name: b.title.slice(0, 15), sold: b.totalSold, revenue: b.totalSold * b.price }));

  const tabs = [
    { id: 'books', label: 'كتبي', icon: FiBook },
    { id: 'orders', label: 'الطلبات', icon: FiPackage },
    { id: 'stats', label: 'الإحصائيات', icon: FiBarChart2 },
  ];

  const statusBadge = (status) => {
    const map = {
      approved: { label: 'معتمد', cls: 'bg-green-100 text-green-700' },
      pending: { label: 'قيد المراجعة', cls: 'bg-yellow-100 text-yellow-700' },
      rejected: { label: 'مرفوض', cls: 'bg-red-100 text-red-700' },
    };
    const s = map[status] || { label: status, cls: 'bg-gray-100' };
    return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div className="bg-transparent min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="flex items-center gap-3 font-heading font-bold text-3xl">
              مرحباً، <span className="text-gradient">{user?.name}</span>
              <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="inline-block"><FaChalkboardTeacher className="text-primary" /></motion.span>
            </h1>
            <p className="text-text-secondary">إدارة كتبك ومبيعاتك</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddModal}
            className="flex items-center gap-2 shadow-lg shadow-primary/25 px-6 py-3 rounded-xl font-semibold text-white gradient-primary"
          >
            <FiPlus /> إضافة كتاب جديد
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <div className="gap-4 grid grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: 'إجمالي الكتب', value: books.length, icon: FiBook, color: 'primary' },
            { label: 'كتب مباعة', value: totalSold, icon: FiPackage, color: 'accent' },
            { label: 'الأرباح', value: `${totalEarnings} جنيه`, icon: FiDollarSign, color: 'success' },
            { label: 'قيد المراجعة', value: pendingBooks, icon: FiBarChart2, color: 'warning' },
          ].map((stat, i) => (
            <motion.div
              key={`stat-card-${stat.label}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-5 border border-border rounded-2xl"
            >
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
              <p className="font-heading font-bold text-2xl">{stat.value}</p>
              <p className="text-text-muted text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-card mb-6 p-1 border border-border rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? 'gradient-primary text-white shadow-md' : 'text-text-secondary hover:text-primary'
                }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-10">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-1 gap-2 bg-white/60 shadow-2xl shadow-primary/5 backdrop-blur-xl p-2 border border-white/80 rounded-[2.5rem] overflow-x-auto scroll-smooth no-scrollbar">
                {['', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((f) => {
                  const labels = { '': 'الكل', placed: 'جديد', confirmed: 'مؤكد', processing: 'تجهيز', shipped: 'شحن', delivered: 'مكتمل', cancelled: 'ملغي' };
                  return (
                    <button
                      key={f || 'all'}
                      onClick={() => setOrderFilter(f)}
                      className={`px-8 py-3 rounded-full font-black text-sm transition-all whitespace-nowrap ${orderFilter === f
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                        : 'text-text-muted hover:bg-primary/5'
                        }`}
                    >
                      {labels[f]}
                    </button>
                  );
                })}
              </div>

              {selectedOrders.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={handlePrintBulkInvoices}
                  className="flex items-center gap-2 bg-emerald-600 shadow-emerald-600/20 shadow-xl px-8 py-4 rounded-[2rem] font-black text-white text-sm hover:scale-105 transition-all"
                >
                  <FiPrinter className="w-5 h-5" /> طباعة المختار ({selectedOrders.length})
                </motion.button>
              )}
            </div>

            {/* Selection Header */}
            <div className="flex justify-between items-center mb-4 px-8">
              <label className="group flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={handleSelectAllOrders}
                    className="peer hidden"
                  />
                  <div className="flex justify-center items-center peer-checked:bg-primary border-2 border-primary/20 group-hover:border-primary peer-checked:border-primary rounded-lg w-6 h-6 transition-all">
                    <FiCheck className="opacity-0 peer-checked:opacity-100 w-4 h-4 text-white transition-opacity" />
                  </div>
                </div>
                <span className="font-black text-text-muted group-hover:text-primary text-sm transition-colors">تحديد الكل</span>
              </label>

              <div className="flex items-center gap-4 font-bold text-text-muted text-sm">
                <span>إجمالي الطلبات: {orders.length}</span>
              </div>
            </div>

            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-white/40 backdrop-blur-md py-20 border-2 border-white/60 rounded-[3.5rem] text-center">
                  <div className="flex justify-center items-center bg-primary/5 mx-auto mb-6 rounded-full w-24 h-24">
                    <FiShoppingCart className="w-10 h-10 text-primary/30" />
                  </div>
                  <h3 className="mb-2 font-black text-text-primary text-2xl">لا يوجد طلبات</h3>
                  <p className="text-text-muted text-sm">ستظهر الطلبات هنا عندما يشتري الطلاب كتبك</p>
                </div>
              ) : (
                orders
                  .filter((o) => !orderFilter || o.orderStatus === orderFilter)
                  .map((order, idx) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{ zIndex: orders.length - idx }}
                      className={`group relative p-8 border rounded-[2.5rem] overflow-hidden transition-all ${selectedOrders.includes(order._id)
                        ? 'bg-primary/5 border-primary shadow-2xl shadow-primary/10'
                        : 'bg-card border-border shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10'
                        }`}
                    >
                      <div className="top-0 right-0 z-0 absolute bg-primary w-1.5 h-full" />

                      <div className="z-10 relative flex flex-col gap-6">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                            {/* Checkbox */}
                            <div className="z-30 relative">
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order._id)}
                                onChange={() => handleSelectOrder(order._id)}
                                className="peer hidden"
                              />
                              <div
                                className="flex justify-center items-center peer-checked:bg-primary shadow-sm border-2 border-primary/20 peer-checked:border-primary rounded-xl w-7 h-7 transition-all cursor-pointer"
                                onClick={() => handleSelectOrder(order._id)}
                              >
                                <FiCheck className="opacity-0 peer-checked:opacity-100 w-4 h-4 text-white transition-opacity" />
                              </div>
                            </div>

                            <span className="bg-primary/5 px-3 py-1 rounded-lg font-mono font-black text-primary text-sm">
                              #{order._id.slice(-8).toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {order.paymentStatus === 'paid' ? 'تم الدفع' : 'الدفع عند الاستلام'}
                            </span>
                            <button
                              onClick={() => openOrderDetails(order)}
                              className="flex items-center gap-2 bg-primary/10 hover:bg-primary px-4 py-1.5 rounded-full font-black text-primary hover:text-white text-xs transition-all"
                            >
                              <FiEye className="w-3.5 h-3.5" /> تفاصيل الطلب
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-between items-end gap-6 pb-6 border-border border-b">
                          <div className="flex-1 min-w-[200px]">
                            <h3 className="mb-1 font-black text-text-primary text-2xl">{order.user?.name}</h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-bold text-text-muted text-xs">
                              <span>{order.user?.email}</span>
                              <span className="opacity-20">|</span>
                              <span className="text-primary">{order.user?.phone || 'بدون رقم'}</span>
                            </div>
                          </div>

                          <div className="text-left">
                            <p className="mb-1 font-black text-[10px] text-text-muted uppercase tracking-wider">إجمالي الطلب</p>
                            <p className="font-black text-primary text-4xl tracking-tighter">
                              {order.total} <span className="opacity-40 font-bold text-base">ج.م</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap justify-between items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="text-left">
                              <p className="mb-1 font-black text-[10px] text-text-muted">المكان</p>
                              <p className="font-black text-text-primary text-sm leading-relaxed">
                                {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.governorate}
                              </p>
                            </div>
                            <div className="flex justify-center items-center bg-primary/5 rounded-2xl w-14 h-14 text-primary shrink-0">
                              <FiMapPin className="w-7 h-7" />
                            </div>
                          </div>

                          <div className="flex flex-wrap justify-end gap-2 max-w-2xl">
                            {order.items.map((item, j) => (
                              <div key={j} className="flex items-center gap-2 bg-bg px-3 py-1.5 border border-border/50 rounded-xl font-black text-[11px] text-text-secondary">
                                <span className="flex justify-center items-center bg-primary rounded-md w-5 h-5 text-[9px] text-white shrink-0">{item.quantity}</span>
                                <span className="">{item.title}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 font-bold text-[10px] text-text-muted">
                            <FiCalendar className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
            {/* Sales Bar Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 border border-border rounded-2xl">
              <h3 className="mb-4 font-heading font-semibold">أكثر الكتب مبيعاً</h3>
              {salesData.length > 0 ? (
                <div className="relative h-[300px] min-w-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#DCE6E5" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #DCE6E5' }}
                        formatter={(val, name) => [name === 'sold' ? `${val} نسخة` : `${val} جنيه`, name === 'sold' ? 'المبيعات' : 'الإيرادات']}
                      />
                      <Bar dataKey="sold" fill="#31605F" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-[300px] text-text-muted">
                  <p>لا توجد بيانات كافية بعد</p>
                </div>
              )}
            </motion.div>

            {/* Category Pie Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card p-6 border border-border rounded-2xl">
              <h3 className="mb-4 font-heading font-semibold">توزيع المواد</h3>
              {categoryData.length > 0 ? (
                <div className="relative h-[300px] min-w-0">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-[300px] text-text-muted">
                  <p>لا توجد بيانات كافية بعد</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Add/Edit Book Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="z-50 fixed inset-0 flex justify-center items-start bg-black/50 backdrop-blur-sm px-4 py-8 overflow-auto" onClick={() => setShowModal(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-card my-auto p-6 rounded-2xl w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="flex items-center gap-2 font-heading font-bold text-xl">{editingBook ? 'تعديل الكتاب' : 'إضافة كتاب جديد'} <FiBook className="text-primary" /></h2>
                  <button onClick={() => setShowModal(false)} className="hover:bg-bg p-2 rounded-lg"><FiX className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Cover Upload */}
                  <div>
                    <label className="block mb-1.5 font-medium text-text-secondary text-sm">صورة الغلاف</label>
                    <label className="relative flex flex-col justify-center items-center bg-bg border-2 border-border hover:border-primary border-dashed rounded-xl h-36 overflow-hidden transition-colors cursor-pointer">
                      {coverPreview ? (
                        <>
                          <img src={coverPreview} alt="preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex justify-center items-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                            <FiImage className="w-6 h-6 text-white" />
                            <span className="mr-2 text-white text-sm">تغيير الصورة</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <FiUpload className="mb-2 w-6 h-6 text-text-muted" />
                          <span className="text-text-muted text-sm">اختر صورة الغلاف</span>
                          <span className="mt-1 text-text-muted text-xs">JPG, PNG, WebP حتى 9MB</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    {/* Upload Progress */}
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-2">
                        <div className="flex justify-between mb-1 text-text-muted text-xs">
                          <span>جاري الرفع إلى Cloudinary...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="bg-border rounded-full w-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="rounded-full h-full gradient-primary"
                          />
                        </div>
                      </div>
                    )}
                    {uploadProgress === 100 && (
                      <p className="flex items-center gap-1 mt-1 text-success text-xs">
                        <FiCheck className="w-3 h-3" /> تم الرفع بنجاح!
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1.5 font-medium text-text-secondary text-sm">عنوان الكتاب *</label>
                    <input type="text" value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                      className="bg-bg px-4 py-3 border border-border focus:border-primary rounded-xl outline-none focus:ring-2 focus:ring-primary/20 w-full text-sm" required />
                  </div>

                  <div>
                    <label className="block mb-1.5 font-medium text-text-secondary text-sm">اسم المدرس (يظهر للطلاب) *</label>
                    <CustomSelect
                      value={bookForm.teacherName}
                      onChange={(val) => setBookForm({ ...bookForm, teacherName: val })}
                      options={teacherNames.map(t => ({ label: t.name, value: t.name }))}
                      placeholder="اختر المدرس"
                    />

                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={teacherNameInput}
                        onChange={(e) => setTeacherNameInput(e.target.value)}
                        placeholder="أضف اسم مدرس جديد"
                        className="flex-1 bg-bg px-4 py-2 border border-border focus:border-primary rounded-xl outline-none text-sm"
                      />
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddTeacherName}
                        className="px-4 py-2 rounded-xl font-semibold text-white gradient-primary"
                      >
                        إضافة
                      </motion.button>
                    </div>

                    {teacherNames.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {teacherNames.slice(0, 8).map((t) => (
                          <button
                            key={t._id}
                            type="button"
                            onClick={() => handleDeleteTeacherName(t._id)}
                            className="bg-bg hover:bg-danger/10 px-3 py-1.5 border border-border rounded-full text-text-secondary text-xs transition-colors"
                            title="حذف"
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1.5 font-medium text-text-secondary text-sm">الوصف *</label>
                    <textarea value={bookForm.description} onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                      className="bg-bg px-4 py-3 border border-border focus:border-primary rounded-xl outline-none w-full h-24 text-sm resize-none" required />
                  </div>

                  <div className="gap-4 grid grid-cols-2">
                    <div>
                      <label className="block mb-1.5 font-medium text-text-secondary text-sm">السعر بالجنيه *</label>
                      <input type="number" min="0" value={bookForm.price} onChange={(e) => setBookForm({ ...bookForm, price: e.target.value })}
                        className={`bg-bg px-4 py-3 border ${bookForm.discount > 0 ? 'border-primary/30' : 'border-border'} focus:border-primary rounded-xl outline-none w-full text-sm`} required />
                    </div>
                    <div>
                      <label className="block mb-1.5 font-medium text-text-secondary text-sm">الخصم (%)</label>
                      <input type="number" min="0" max="100" value={bookForm.discount} onChange={(e) => setBookForm({ ...bookForm, discount: e.target.value })}
                        className={`bg-bg px-4 py-3 border ${bookForm.discount > 0 ? 'border-red-200' : 'border-border'} focus:border-primary rounded-xl outline-none w-full text-sm`} />
                    </div>
                  </div>

                  {bookForm.price > 0 && bookForm.discount > 0 && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                      <p className="text-center font-bold text-primary text-sm flex justify-center items-center gap-2">
                        <span>السعر بعد الخصم:</span>
                        <span className="text-lg">{Math.round(bookForm.price - (bookForm.price * (bookForm.discount / 100)))}</span>
                        <span>ج.م</span>
                      </p>
                    </motion.div>
                  )}

                  <div>
                    <label className="block mb-1.5 font-medium text-text-secondary text-sm">إجمالي الاستوك (الكمية الكلية) *</label>
                    <input type="number" min="0" value={bookForm.stock} onChange={(e) => setBookForm({ ...bookForm, stock: e.target.value })}
                      className="bg-bg px-4 py-3 border border-border focus:border-primary rounded-xl outline-none w-full text-sm" required />
                    <p className="mt-1 font-medium text-[10px] text-text-muted text-center">الكمية الكلية (المباعة + المتاحة في المخزن حالياً)</p>
                  </div>

                  <div>
                    <label className="block mb-1.5 font-medium text-text-secondary text-sm">المادة *</label>
                    <CustomSelect
                      value={bookForm.category}
                      onChange={(val) => setBookForm({ ...bookForm, category: val })}
                      options={categories}
                      placeholder="اختر المادة"
                    />
                  </div>

                  <div className="gap-4 grid grid-cols-2">
                    <div>
                      <label className="block mb-1.5 font-medium text-text-secondary text-sm">عدد الصفحات</label>
                      <input type="number" min="1" value={bookForm.pages} onChange={(e) => setBookForm({ ...bookForm, pages: e.target.value })}
                        className="bg-bg px-4 py-3 border border-border focus:border-primary rounded-xl outline-none w-full text-sm" />
                    </div>
                    <div>
                      <label className="block mb-1.5 font-medium text-text-secondary text-sm">الصف الدراسي</label>
                      <input type="text" value={bookForm.grade} onChange={(e) => setBookForm({ ...bookForm, grade: e.target.value })}
                        className="bg-bg px-4 py-3 border border-border focus:border-primary rounded-xl outline-none w-full text-sm" />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={formLoading}
                    className="flex justify-center items-center gap-2 disabled:opacity-60 shadow-lg shadow-primary/25 py-3.5 rounded-xl w-full font-semibold text-white gradient-primary"
                  >
                    {formLoading ? (
                      <><div className="border-2 border-white/30 border-t-white rounded-full w-5 h-5 animate-spin" /> جاري الحفظ...</>
                    ) : (
                      editingBook ? 'حفظ التعديلات' : 'رفع الكتاب'
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}

          {showOrderModal && selectedOrder && (
            <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm px-4 py-8 overflow-auto" onClick={() => setShowOrderModal(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-card my-auto p-8 rounded-2xl w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="flex items-center gap-3 font-heading font-bold text-2xl">
                    تفاصيل الطلب <span className="font-mono text-primary text-lg">#{selectedOrder._id.slice(-8).toUpperCase()}</span>
                  </h2>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePrintInvoice(selectedOrder)}
                      className="flex items-center gap-2 bg-primary shadow-lg shadow-primary/30 px-5 py-3 rounded-2xl font-black text-white text-sm"
                    >
                      <FiPrinter className="w-4 h-4" /> طباعة الفاتورة
                    </motion.button>
                    <button onClick={() => setShowOrderModal(false)} className="hover:bg-bg p-2 rounded-lg">
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                    <div className="bg-bg/50 p-4 border border-border rounded-xl">
                      <h3 className="mb-3 font-bold text-primary">بيانات المشتري</h3>
                      <p className="font-bold text-sm">{selectedOrder.user?.name}</p>
                      <p className="mt-1 text-text-muted text-xs">{selectedOrder.user?.email}</p>
                      <p className="mt-1 text-text-muted text-xs">{selectedOrder.user?.phone || 'بدون رقم هاتف'}</p>
                    </div>

                    <div className="bg-bg/50 p-4 border border-border rounded-xl">
                      <h3 className="mb-3 font-bold text-primary">عنوان الشحن</h3>
                      <p className="font-bold text-sm">{selectedOrder.shippingAddress?.governorate}</p>
                      <div className="space-y-1 mt-2 text-right">
                        <span className="block font-bold text-[10px] text-text-muted">العنوان بالتفصيل:</span>
                        <p className="bg-white/50 p-3 border border-border rounded-lg font-black text-text-primary text-xs leading-relaxed">
                          {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.governorate}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bg/30 p-4 border border-border rounded-xl">
                    <h3 className="mb-3 font-bold text-text-primary">المنتجات</h3>
                    <div className="space-y-3 pr-2 max-h-[200px] overflow-y-auto no-scrollbar">
                      {selectedOrder.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center pb-2 last:pb-0 border-border last:border-0 border-b">
                          <div className="flex items-center gap-3">
                            <span className="flex justify-center items-center bg-primary/10 rounded-lg w-6 h-6 font-black text-primary text-xs">{item.quantity}</span>
                            <span className="font-bold text-sm">{item.title}</span>
                          </div>
                          <span className="font-black text-primary text-sm">{item.price} ج.م</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-primary shadow-lg shadow-primary/20 p-6 rounded-xl text-white">
                    <div className="flex justify-between items-center opacity-90 mb-2 text-sm">
                      <span>المجموع الفرعي</span>
                      <span>{selectedOrder.subtotal} ج.م</span>
                    </div>
                    <div className="flex justify-between items-center opacity-90 mb-2 text-sm">
                      <span>الشحن</span>
                      <span>{selectedOrder.deliveryFee} ج.م</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between items-center mb-2 font-bold text-yellow-300 text-sm">
                        <span>خصم ({selectedOrder.couponCode})</span>
                        <span>-{selectedOrder.discount} ج.م</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-3 pt-3 border-white/20 border-t">
                      <span className="font-bold text-lg">الإجمالي</span>
                      <span className="font-black text-2xl">{selectedOrder.total} ج.م</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          <ConfirmModal
            {...confirmConfig}
            onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
          />
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

export default TeacherDashboard;
