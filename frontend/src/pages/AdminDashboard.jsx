import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiBook, FiBookOpen, FiShoppingCart, FiDollarSign, FiCheck, FiX, FiTrash2, FiEye, FiSearch, FiFilter, FiShield, FiEdit, FiPlus, FiUpload, FiImage, FiSettings, FiCalendar, FiPrinter, FiTrendingUp, FiPackage, FiList, FiCamera, FiGrid, FiTruck, FiLayers, FiMapPin, FiChevronDown, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';
import CustomSelect from '../components/CustomSelect';
import ConfirmModal from '../components/ConfirmModal';
import { getIcon } from '../utils/icons';
import { useAuth } from '../context/AuthContext';
import BookLoader from '../components/BookLoader';
import ModalPortal from '../components/ModalPortal';
import logo from '../assets/LOGO.svg';

const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const StatusHistoryItem = ({ status, date, note }) => {
  const statusLabels = { placed: 'جديد', confirmed: 'مؤكد', processing: 'تجهيز', shipped: 'شحن', delivered: 'مكتمل', cancelled: 'ملغي' };
  const statusColors = { placed: 'bg-blue-500', confirmed: 'bg-emerald-500', processing: 'bg-amber-500', shipped: 'bg-purple-500', delivered: 'bg-green-600', cancelled: 'bg-red-500' };

  return (
    <div className="relative pr-8 pb-6 last:pb-0 border-primary/10 last:border-0 border-r">
      <div className={`absolute -right-2 top-0 w-4 h-4 rounded-full border-4 border-white ${statusColors[status] || 'bg-gray-400'} shadow-sm`} />
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <span className="font-black text-text-primary text-sm">{statusLabels[status] || status}</span>
          <span className="font-bold text-[10px] text-text-muted">{new Date(date).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {note && <p className="bg-bg/50 px-3 py-1.5 border border-primary/5 rounded-xl font-bold text-text-secondary text-xs">{note}</p>}
      </div>
    </div>
  );
};

const ADMIN_DASHBOARD_TABS = [
  { id: 'overview', label: 'نظرة عامة', icon: FiEye },
  { id: 'users', label: 'المستخدمون', icon: FiUsers },
  { id: 'books', label: 'الكتب والملازم', icon: FiBook },
  { id: 'store_products', label: 'منتجات المتجر', icon: FiGrid },
  { id: 'orders', label: 'الطلبات', icon: FiShoppingCart },
  { id: 'categories', label: 'المواد الدراسية', icon: FiList },
  { id: 'store_categories', label: 'أقسام المتجر', icon: FiGrid },
  { id: 'grades', label: 'الصفوف الدراسية', icon: FiTrendingUp },
  { id: 'cms', label: 'المحتوى العام', icon: FiLayers },
  { id: 'announcements', label: 'الرسائل والإعلانات', icon: FiAlertCircle },
  { id: 'logistics', label: 'اللوجستيات والشحن', icon: FiTruck },
  { id: 'teachers_list', label: 'إدارة المدرسين', icon: FiUsers },
  { id: 'coupons', label: 'الكوبونات', icon: FiDollarSign },
];

const AdminSidebar = ({
  activeTab,
  handleTabChange,
  orders,
  openAddBookModal,
  user
}) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{ width: isSidebarExpanded ? 280 : 84 }}
      transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
      onHoverStart={() => setIsSidebarExpanded(true)}
      onHoverEnd={() => setIsSidebarExpanded(false)}
      className="hidden top-[120px] right-4 bottom-4 z-50 fixed lg:flex flex-col bg-white/85 shadow-[0_20px_50px_rgba(30,47,46,0.08)] backdrop-blur-xl border border-white/60 rounded-[2.5rem]"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-center py-6 border-b border-primary/5 px-4">
        <img src={logo} className="w-20 h-20 object-contain shrink-0" alt="Logo" />
      </div>

      {/* Dynamic Scrollable Area */}
      <div className="flex-1 px-3 overflow-y-auto custom-sidebar-scroll" style={{ direction: 'ltr' }}>
        <div style={{ direction: 'rtl' }} className="flex flex-col pt-6 pb-16 min-h-[50vh]">
          <style>
            {`
              .custom-sidebar-scroll::-webkit-scrollbar {
                width: 0px;
              }
              .custom-sidebar-scroll {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }
            `}
          </style>

          {[
            { title: 'القائمة', count: '5', items: ['overview', 'users', 'books', 'store_products', 'orders'] },
            { title: 'الخدمات', count: '5', items: ['categories', 'store_categories', 'grades', 'cms', 'announcements'] },
            { title: 'الإعدادات', count: '3', items: ['logistics', 'teachers_list', 'coupons'] }
          ].map((group) => (
            <div key={group.title} className="mb-6">
              {isSidebarExpanded && (
                <p className="mb-3 px-3 font-black text-text-muted/50 text-[9px] uppercase tracking-[0.2em]">{group.title}</p>
              )}
              <div className="flex flex-col gap-1.5">
                {ADMIN_DASHBOARD_TABS.filter(t => group.items.includes(t.id)).map((tab) => {
                  const isActive = activeTab === tab.id;
                  const pendingCount = tab.id === 'orders' ? orders.filter(o => o.status === 'placed').length : 0;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`group relative flex items-center transition-all duration-300 cursor-pointer
                        ${isSidebarExpanded
                          ? isActive
                            ? 'bg-primary text-white rounded-r-2xl rounded-l-none ml-[-12px] pl-6 pr-4 py-3.5 w-[calc(100%+12px)] z-10 shadow-lg after:content-[""] after:absolute after:left-0 after:bottom-full after:w-4 after:h-4 after:bg-transparent after:rounded-bl-[16px] after:shadow-[0_8px_0_0_#31605F] after:pointer-events-none before:content-[""] before:absolute before:left-0 before:top-full before:w-4 before:h-4 before:bg-transparent before:rounded-tl-[16px] before:shadow-[0_-8px_0_0_#31605F] before:pointer-events-none'
                            : 'rounded-2xl px-4 py-3 text-text-secondary hover:bg-primary/5 hover:text-primary w-full'
                          : isActive
                            ? 'bg-primary text-white rounded-full w-12 h-12 justify-center mx-auto shadow-md z-10 scale-105'
                            : 'rounded-full w-12 h-12 justify-center mx-auto text-text-secondary hover:bg-primary/5 hover:text-primary w-full'
                        }`}
                    >
                      <div className="relative flex justify-center items-center w-5 h-5 shrink-0">
                        <tab.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-primary/70 group-hover:text-primary'}`} />
                        {pendingCount > 0 && (
                          <span className="-top-1.5 -right-1.5 absolute flex justify-center items-center bg-red-500 shadow-md rounded-full w-3.5 h-3.5 font-black text-[8px] text-white animate-bounce">
                            {pendingCount}
                          </span>
                        )}
                      </div>

                      {isSidebarExpanded && (
                        <div className="flex flex-1 justify-between items-center ml-1">
                          <span className={`mr-3 overflow-hidden font-heading text-[12px] whitespace-nowrap transition-all ${isActive ? 'font-black' : 'font-bold'}`}>{tab.label}</span>
                          {pendingCount > 0 && (
                            <span className="bg-red-500 shadow-sm px-1.5 py-0.5 rounded-full font-bold text-[9px] text-white">
                              {pendingCount}
                            </span>
                          )}
                        </div>
                      )}

                      {!isSidebarExpanded && (
                        <div className={`absolute right-0 w-1 rounded-l-full bg-primary transition-all duration-200 ${isActive ? 'h-6' : 'h-0 group-hover:h-3'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Persistent Action & Profile Footer */}
      <div className="bg-gradient-to-t from-primary/5 to-transparent px-4 pt-4 pb-8 border-primary/5 border-t">
        <div className="mb-4">
          {isSidebarExpanded ? (
            <button
              onClick={openAddBookModal}
              className="flex justify-center items-center gap-2.5 bg-primary/10 hover:bg-primary/15 border border-primary/10 shadow-sm py-3.5 rounded-2xl w-full text-primary transition-all duration-300 cursor-pointer"
            >
              <FiPlus className="w-5 h-5 shrink-0" />
              <span className="font-heading font-black text-xs whitespace-nowrap">إضافة كتاب / ملزمة</span>
            </button>
          ) : (
            <button
              onClick={openAddBookModal}
              className="flex justify-center items-center mx-auto bg-primary/10 hover:bg-primary/15 border border-primary/10 shadow-sm w-12 h-12 rounded-full text-primary transition-all duration-300 cursor-pointer"
              title="إضافة كتاب / ملزمة"
            >
              <FiPlus className="w-5 h-5" />
            </button>
          )}
        </div>

        <Link
          to="/profile"
          className={`flex items-center transition-all duration-300 hover:bg-primary/5 border border-transparent hover:border-primary/10 shadow-sm rounded-2xl group relative ${isSidebarExpanded ? 'px-3 py-3 bg-primary/5' : 'justify-center p-1.5 bg-transparent shadow-none'
            }`}
        >
          <div className={`shrink-0 flex justify-center items-center bg-primary/10 border border-primary/10 shadow-sm transition-all duration-300 ${isSidebarExpanded ? 'w-10 h-10 rounded-xl' : 'w-11 h-11 rounded-full'
            } font-black text-primary text-base group-hover:rotate-6`}>
            {user?.name?.charAt(0) || 'A'}
          </div>
          {isSidebarExpanded && (
            <motion.div
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              exit={{ opacity: 0, x: 5 }}
              className="flex-1 mr-3 min-w-0 text-right"
            >
              <p className="font-heading font-black text-text-primary text-xs truncate leading-tight">{user?.name}</p>
              <p className="font-bold text-text-muted text-[10px] mt-0.5">{user?.role === 'admin' ? 'مدير المنصة' : 'مدرس'}</p>
            </motion.div>
          )}

          {isSidebarExpanded && (
            <div className="bg-primary/5 opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-opacity duration-200 ml-1">
              <FiSettings className="w-4 h-4 text-primary" />
            </div>
          )}
        </Link>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [chartView, setChartView] = useState('daily');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [teacherNames, setTeacherNames] = useState([]);
  const [teacherNameInput, setTeacherNameInput] = useState('');
  const [teacherPhotoFile, setTeacherPhotoFile] = useState(null);
  const [teacherPhotoPreview, setTeacherPhotoPreview] = useState(null);
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [shippingSettings, setShippingSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
      loadTabData(tab);
    }
  }, [searchParams]);

  // Unified data loader for tabs - Optimized for speed
  const loadTabData = async (tabId) => {
    try {
      // First load or if the tab data is missing
      if (!stats) setLoading(true);
      else setBackgroundLoading(true);

      const critical = [];
      const background = [];

      // PRIORITY 1: Current Tab Data (Blocker)
      if (tabId === 'overview') critical.push(fetchStats());
      else if (tabId === 'users') critical.push(fetchUsers());
      else if (tabId === 'books' || tabId === 'store_products') {
        critical.push(fetchBooks());
        // The Create/Edit Book modal needs categories, teachers, and grades for its selects
        if (categories.length === 0) critical.push(fetchCategories());
        if (teacherNames.length === 0) critical.push(fetchTeacherNames());
        if (grades.length === 0) critical.push(fetchGrades());
      }
      else if (tabId === 'orders') critical.push(fetchOrders());
      else if (tabId === 'teacher_names') critical.push(fetchTeacherNames());
      else if (tabId === 'logistics') critical.push(fetchSettings());
      else if (tabId === 'coupons') critical.push(fetchCoupons());
      else if (tabId === 'categories' || tabId === 'store_categories') critical.push(fetchCategories());
      else if (tabId === 'cms') critical.push(fetchCms());
      else if (tabId === 'grades') critical.push(fetchGrades());
      else if (tabId === 'announcements') critical.push(fetchAnnouncements());

      // PRIORITY 2: Universal background data (Non-blocker)
      if (!stats) {
        if (tabId !== 'overview') background.push(fetchStats());
        if (tabId !== 'books') background.push(fetchBooks());
        if (tabId !== 'orders') background.push(fetchOrders());
      }

      // Step 1: Wait for what we need NOW
      await Promise.all(critical);
      setLoading(false); // Success! Show the dashboard immediately.

      // Step 2: Load the rest silently in the background
      if (background.length > 0) {
        Promise.all(background).finally(() => setBackgroundLoading(false));
      } else {
        setBackgroundLoading(false);
      }
    } catch (err) {
      console.error('Error loading tab data:', err);
    } finally {
      setLoading(false);
      setBackgroundLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    loadTabData(tabId);
  };
  const [userFilter, setUserFilter] = useState('');
  const [bookFilter, setBookFilter] = useState('all');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountAmount: '',
    minPurchase: 0,
    expiryDate: '',
    usageLimit: '',
  });
  const [bookForm, setBookForm] = useState({ title: '', description: '', price: '', discount: 0, triggersFreeShipping: false, category: 'mathematics', stock: '', isbn: '', pages: '', grade: '', teacherName: '', isStoreProduct: false, startNewCycle: false });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'admin', phone: '' });
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', icon: 'FaBook', color: '#31605F', order: 0, isActive: true });
  const [grades, setGrades] = useState([]);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeForm, setGradeForm] = useState({ name: '', order: 0, isActive: true });
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'danger',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء'
  });
  const [showMobileMoreTabs, setShowMobileMoreTabs] = useState(false);
  const [cmsData, setCmsData] = useState([]);
  const [editingCms, setEditingCms] = useState(null);
  const [cmsForm, setCmsForm] = useState({ key: '', title: '', content: {} });
  const [cmsFile, setCmsFile] = useState(null);
  const [cmsPreview, setCmsPreview] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({ text: '', link: '', isActive: true, priority: 0, displayType: 'static', icon: 'FiAlertCircle' });
  const [openIconPicker, setOpenIconPicker] = useState(null);

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

  useEffect(() => {
    // Initial data load for whatever tab we are on
    loadTabData(activeTab);

    // Periodically refresh orders count for the badge (silent)
    const interval = setInterval(fetchPendingOrdersCount, 30000);

    // Periodically refresh stats for real-time "active users" (silent)
    const statsInterval = setInterval(() => {
      if (activeTab === 'overview') fetchStats();
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
    };
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) { console.error(err); }
  };

  const fetchBooks = async () => {
    try {
      const res = await api.get('/admin/books');
      setBooks(res.data.books);
    } catch (err) { console.error(err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/admin/all');
      setOrders(res.data.orders);
    } catch (err) { console.error(err); }
  };

  const fetchPendingOrdersCount = fetchOrders; // Unified for now as the dashboard uses orders global state

  const fetchTeacherNames = async () => {
    try {
      const res = await api.get('/admin/teacher-names');
      setTeacherNames(res.data.items || []);
    } catch (err) { console.error(err); }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings/shipping');
      setShippingSettings(res.data.settings);
    } catch (err) { console.error(err); }
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons/admin');
      setCoupons(res.data.coupons || []);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/admin');
      setCategories(res.data.categories || []);
    } catch (err) { console.error(err); }
  };

  const fetchCms = async () => {
    try {
      const res = await api.get('/cms');
      setCmsData(res.data.contents || []);
    } catch (err) { console.error(err); }
  };

  const fetchGrades = async () => {
    try {
      const res = await api.get('/grades/admin');
      setGrades(res.data.grades || []);
    } catch (err) { console.error(err); }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements/admin');
      setAnnouncements(res.data.announcements || []);
    } catch (err) { console.error(err); }
  };

  const fetchAll = async (isInitial = false) => {
    if (isInitial || !stats) setLoading(true);
    try {
      if (!stats || activeTab === 'overview') await fetchStats();
      if (isInitial || !stats) setLoading(false);

      setBackgroundLoading(true);
      const promises = [];

      // Always fetch books and orders for sidebar badges / overview cards
      promises.push(fetchBooks());
      promises.push(fetchOrders());

      // The books tab also needs categories, grades, and teachers for the Create/Edit Modal
      if (activeTab === 'books' || activeTab === 'store_products') {
        if (categories.length === 0) promises.push(fetchCategories());
        if (teacherNames.length === 0) promises.push(fetchTeacherNames());
        if (grades.length === 0) promises.push(fetchGrades());
      }

      // Only fetch other heavy tabs if we are actively looking at them
      if (activeTab === 'users') promises.push(fetchUsers());
      if (activeTab === 'teachers_list') promises.push(fetchTeacherNames());
      if (activeTab === 'logistics') promises.push(fetchSettings());
      if (activeTab === 'coupons') promises.push(fetchCoupons());
      if (activeTab === 'categories' || activeTab === 'store_categories') promises.push(fetchCategories());
      if (activeTab === 'cms') promises.push(fetchCms());
      if (activeTab === 'grades') promises.push(fetchGrades());
      if (activeTab === 'announcements') promises.push(fetchAnnouncements());

      await Promise.all(promises);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setBackgroundLoading(false);
    }
  };

  const handleTeacherPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTeacherPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setTeacherPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddTeacherName = async () => {
    console.log('handleAddTeacherName clicked, current input:', teacherNameInput);
    const name = teacherNameInput.trim();
    if (!name) return;
    try {
      setFormLoading(true);
      const formData = new FormData();
      formData.append('name', name);
      if (teacherPhotoFile) {
        formData.append('photo', teacherPhotoFile);
      }

      const res = await api.post('/admin/teacher-names', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Teacher addition response:', res.data);
      setTeacherNameInput('');
      setTeacherPhotoFile(null);
      setTeacherPhotoPreview(null);
      fetchAll();
      toast.success('تمت إضافة المدرس');
    } catch (err) {
      console.error('Error adding teacher:', err);
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء إضافة المدرس');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTeacherName = async (id) => {
    try {
      await api.delete(`/admin/teacher-names/${id}`);
      fetchAll();
      toast.success('تم حذف المدرس');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleApproveBook = async (bookId, status) => {
    try {
      await api.put(`/admin/books/${bookId}/approve`, { status });
      toast.success(status === 'approved' ? 'تم اعتماد الكتاب ✅' : 'تم رفض الكتاب ❌');
      fetchAll();
    } catch (err) {
      toast.error('حدث خطأ');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, categoryForm);
        toast.success('تم تحديث القسم بنجاح');
      } else {
        await api.post('/categories', categoryForm);
        toast.success('تم إنشاء القسم بنجاح');
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', slug: '', icon: 'FaBook', color: '#31605F', order: 0, isActive: true });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ في الحفظ');
    }
  };

  const handleDeleteCategory = async (id) => {
    showConfirm({
      title: 'حذف القسم',
      message: 'هل أنت متأكد من حذف هذا القسم؟ قد يؤدي هذا لاختفاء بعض الكتب المرتبطة به.',
      onConfirm: async () => {
        try {
          await api.delete(`/categories/${id}`);
          toast.success('تم حذف القسم بنجاح');
          fetchAll();
        } catch (err) {
          toast.error(err.response?.data?.message || 'فشل الحذف');
        }
      }
    });
  };

  const handleDeleteUser = async (userId) => {
    showConfirm({
      title: 'حذف المستخدم',
      message: 'هل أنت متأكد من حذف هذا المستخدم نهائياً؟ ستفقد كل بياناته وحساباته.',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/admin/users/${userId}`);
          toast.success(res.data?.message || 'تم حذف المستخدم بنجاح');
          fetchAll();
        } catch (err) {
          toast.error(err.response?.data?.message || 'حدث خطأ أثناء الحذف');
        }
      }
    });
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (editingAnnouncement) {
        await api.put(`/announcements/${editingAnnouncement._id}`, announcementForm);
        toast.success('تم تحديث الإعلان بنجاح');
      } else {
        await api.post('/announcements', announcementForm);
        toast.success('تمت إضافة الإعلان بنجاح');
      }
      setShowAnnouncementModal(false);
      setEditingAnnouncement(null);
      setAnnouncementForm({ text: '', link: '', isActive: true, priority: 0, displayType: 'static', icon: 'FiAlertCircle' });
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    showConfirm({
      title: 'حذف الإعلان',
      message: 'هل أنت متأكد من حذف هذا الإعلان نهائياً؟',
      onConfirm: async () => {
        try {
          await api.delete(`/announcements/${id}`);
          toast.success('تم حذف الإعلان بنجاح');
          fetchAnnouncements();
        } catch (err) {
          toast.error(err.response?.data?.message || 'فشل الحذف');
        }
      }
    });
  };

  const handleToggleAnnouncement = async (id) => {
    try {
      await api.put(`/announcements/${id}/toggle`);
      fetchAnnouncements();
    } catch (err) {
      toast.error('حدث خطأ');
    }
  };

  const handleEditAnnouncement = (ann) => {
    setEditingAnnouncement(ann);
    setAnnouncementForm({
      text: ann.text,
      link: ann.link || '',
      isActive: ann.isActive,
      priority: ann.priority || 0,
      displayType: ann.displayType || 'static',
      icon: ann.icon || 'FiAlertCircle'
    });
    setShowAnnouncementModal(true);
  };


  const openAddBookModal = async () => {
    const isStore = activeTab === 'store_products';

    try {
      setBackgroundLoading(true);
      const preload = [];
      if (categories.length === 0) preload.push(fetchCategories());
      if (!isStore) {
        if (teacherNames.length === 0) preload.push(fetchTeacherNames());
        if (grades.length === 0) preload.push(fetchGrades());
      }
      if (preload.length) await Promise.all(preload);
    } finally {
      setBackgroundLoading(false);
    }

    const firstCat = categories.find(c => (c.categoryType || 'book') === (isStore ? 'store' : 'book'))?.slug || '';

    setEditingBook(null);
    setBookForm({
      title: '',
      description: '',
      price: '',
      discount: 0,
      triggersFreeShipping: false,
      category: firstCat || (isStore ? '' : 'mathematics'),
      stock: '',
      isbn: '',
      pages: '',
      grade: '',
      teacherName: '',
      isStoreProduct: isStore,
      startNewCycle: false
    });
    setCoverFile(null);
    setCoverPreview(null);
    setUploadProgress(0);
    setShowBookModal(true);
  };

  const openEditBookModal = async (book) => {
    const isStore = !!book?.isStoreProduct;

    try {
      setBackgroundLoading(true);
      const preload = [];
      if (categories.length === 0) preload.push(fetchCategories());
      if (!isStore) {
        if (teacherNames.length === 0) preload.push(fetchTeacherNames());
        if (grades.length === 0) preload.push(fetchGrades());
      }
      if (preload.length) await Promise.all(preload);
    } finally {
      setBackgroundLoading(false);
    }

    setEditingBook(book);
    setBookForm({
      title: book.title, description: book.description, price: book.price,
      discount: book.discount || 0,
      triggersFreeShipping: book.triggersFreeShipping || false,
      category: book.category,
      stock: (Number(book.stock) || 0) + (Number(book.totalSold) || 0),
      isbn: book.isbn || '',
      pages: book.pages || '', grade: book.grade || '',
      teacherName: book.teacherName || '',
      isStoreProduct: book.isStoreProduct || false,
      startNewCycle: false
    });
    setCoverFile(null);
    setCoverPreview(book.coverImage || null);
    setUploadProgress(0);
    setShowBookModal(true);
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
    try {
      const imageCompression = (await import('browser-image-compression')).default;
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true, onProgress: (p) => setUploadProgress(Math.round(p * 0.3)) };
      const compressed = await imageCompression(file, options);
      setCoverFile(compressed);
    } catch {
      setCoverFile(file);
    }
    setUploadProgress(0);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setUploadProgress(30);
    try {
      const finalForm = { ...bookForm };
      if (finalForm.isStoreProduct) {
        if (!finalForm.teacherName) finalForm.teacherName = 'متجر معتز';
      }

      const formData = new FormData();
      Object.entries(finalForm).forEach(([key, val]) => {
        if (key === 'stock' && editingBook) {
          if (finalForm.startNewCycle) {
            // NEW CYCLE: Take the input as the absolute stock, and reset sales
            formData.append('stock', Number(val) || 0);
            formData.append('totalSold', 0);
          } else {
            // NORMAL EDIT: Keep calculating as (Total - Already Sold)
            const newTotal = Number(val);
            const sold = Number(editingBook.totalSold) || 0;
            formData.append('stock', Math.max(0, newTotal - sold));
          }
        } else if (key === 'startNewCycle') {
          // Don't send the flag directly to model
          return;
        } else if (val !== '' && val !== undefined) {
          formData.append(key, val);
        }
      });

      if (coverFile) formData.append('coverImage', coverFile);
      const config = { onUploadProgress: (pe) => setUploadProgress(Math.min(Math.round(30 + (pe.loaded / pe.total) * 70), 99)) };

      if (editingBook) {
        await api.put(`/books/${editingBook._id}`, formData, config);
        toast.success(editingBook.isStoreProduct ? 'تم تعديل المنتج بنجاح' : 'تم تعديل الكتاب بنجاح');
      } else {
        await api.post('/books', formData, config);
        toast.success(finalForm.isStoreProduct ? 'تم رفع المنتج بنجاح' : 'تم رفع الكتاب بنجاح');
      }
      setUploadProgress(100);
      setTimeout(() => { setShowBookModal(false); setUploadProgress(0); fetchAll(); }, 500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
      setUploadProgress(0);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    showConfirm({
      title: 'حذف الكتاب',
      message: 'هل أنت متأكد من حذف هذا الكتاب؟ سيتم إزالته تماماً من المتجر.',
      onConfirm: async () => {
        try {
          await api.delete(`/books/${bookId}`);
          toast.success('تم حذف الكتاب بنجاح');
          fetchAll();
        } catch (err) {
          toast.error('حدث خطأ أثناء الحذف');
        }
      }
    });
  };

  const openUserModal = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'admin', phone: '' });
    setShowUserModal(true);
  };

  const openEditUserModal = (userData) => {
    setEditingUser(userData);
    setUserForm({
      name: userData.name || '',
      email: userData.email || '',
      password: '',
      role: userData.role || 'student',
      phone: userData.phone || ''
    });
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = (userForm.phone || '').trim();
    if (!cleanPhone || cleanPhone.length !== 11 || !/^\d{11}$/.test(cleanPhone)) {
      return toast.error('رقم الهاتف يجب أن يتكون من 11 رقم بالضبط');
    }

    const cleanEmail = (userForm.email || '').trim();
    if (cleanEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanEmail)) {
        return toast.error('البريد الإلكتروني غير صحيح (مثال: user@gmail.com)');
      }
    }

    if (!editingUser && (!userForm.password || userForm.password.length < 6)) {
      return toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    }

    setFormLoading(true);
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser._id}`, userForm);
        toast.success('تم تحديث بيانات المستخدم بنجاح');
      } else {
        await api.post('/admin/users', userForm);
        toast.success('تم إنشاء الحساب بنجاح');
      }
      setShowUserModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء حفظ المستخدم');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, orderStatus) => {
    const previousOrders = [...orders];

    // 1. Optimistic UI Update (Instant Feedback)
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: orderStatus } : o));

    // 2. Dispatch custom event to tell Navbar to update its badge
    if (orderStatus !== 'placed') {
      window.dispatchEvent(new Event('orderStatusUpdated'));
    }

    try {
      // 3. API Background Call
      await api.put(`/orders/${orderId}/status`, { orderStatus });
      toast.success('تم تحديث حالة الطلب');
    } catch (err) {
      // 4. Rollback on failure
      setOrders(previousOrders);
      toast.error('حدث خطأ والتحديث فشل');
    }
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

  const handlePrintBulkInvoices = (targetOrders = null) => {
    const isEventArg = !!(targetOrders && typeof targetOrders.preventDefault === 'function');
    const normalizedTargetOrders = isEventArg ? null : targetOrders;
    const selectedData = Array.isArray(normalizedTargetOrders)
      ? normalizedTargetOrders
      : orders.filter(o => selectedOrders.includes(o._id));

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



  const revenueChartData = (chartView === 'daily' ? stats?.dailyRevenue : stats?.monthlyRevenue)?.map((m) => {
    if (chartView === 'daily') {
      return {
        name: `${m._id.day}/${m._id.month}`,
        revenue: m.revenue,
        orders: m.orders,
        fullDate: `${m._id.day} ${monthNames[m._id.month - 1]} ${m._id.year}`
      };
    }
    return {
      name: monthNames[(m._id.month - 1)] || m._id.month,
      revenue: m.revenue,
      orders: m.orders,
      fullDate: `${monthNames[m._id.month - 1]} ${m._id.year}`
    };
  }) || [];

  const handleResetStats = () => {
    showConfirm({
      title: '🚨 تصفير الإحصائيات',
      message: 'هل أنت متأكد من أرشفة جميع الإحصائيات الحالية؟ سيتم بدء فترة مبيعات جديدة من الصفر مع الحفاظ على سجلات الطلاب.',
      type: 'warning',
      onConfirm: async () => {
        try {
          await api.delete('/admin/reset-stats');
          toast.success('تم تصفير الإحصائيات بنجاح ✨');
          setOrders([]);
          setSelectedOrders([]);
          fetchStats();
        } catch (error) {
          toast.error('فشل تصفير الإحصائيات');
        }
      }
    });
  };

  const handleDeleteOrder = (id) => {
    showConfirm({
      title: 'حذف طلب نهائياً',
      message: 'هل أنت متأكد من حذف هذا الطلب؟ لن تتمكن من استعادة البيانات بعد الحذف.',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/orders/${id}`);
          toast.success('تم حذف الطلب بنجاح');
          fetchAll();
        } catch (error) {
          toast.error('فشل حذف الطلب');
        }
      }
    });
  };

  const handleBulkDeleteOrders = () => {
    showConfirm({
      title: `حذف ${selectedOrders.length} طلبات`,
      message: 'هل أنت متأكد من حذف الطلبات المحددة نهائياً؟ ستفقد كافة البيانات المرتبطة بها.',
      onConfirm: async () => {
        try {
          await api.post('/admin/orders/bulk-delete', { orderIds: selectedOrders });
          toast.success('تم حذف الطلبات بنجاح');
          setSelectedOrders([]);
          fetchAll();
        } catch (error) {
          toast.error('فشل حذف الطلبات المحددة');
        }
      }
    });
  };

  const tabs = ADMIN_DASHBOARD_TABS;

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons/admin', couponForm);
      toast.success('تم إنشاء الكوبون بنجاح');
      setShowCouponModal(false);
      setCouponForm({
        code: '',
        discountType: 'percentage',
        discountAmount: '',
        minPurchase: 0,
        expiryDate: '',
        usageLimit: '',
      });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء إنشاء الكوبون');
    }
  };

  const handleDeleteCoupon = (id) => {
    showConfirm({
      title: 'حذف كوبون',
      message: 'هل أنت متأكد من حذف هذا الكوبون؟ لن يتمكن الطلاب من استخدامه بعد الآن.',
      onConfirm: async () => {
        try {
          await api.delete(`/coupons/admin/${id}`);
          toast.success('تم حذف الكوبون');
          fetchAll();
        } catch (err) {
          toast.error('حدث خطأ أثناء الحذف');
        }
      }
    });
  };

  const handleToggleCoupon = async (id) => {
    try {
      await api.put(`/coupons/admin/${id}/toggle`);
      fetchAll();
    } catch (err) {
      toast.error('حدث خطأ أثناء التعديل');
    }
  };

  const handleUpdateShipping = async (e) => {
    e.preventDefault();
    try {
      await api.put('/settings/shipping', shippingSettings);
      toast.success('تم حفظ إعدادات الشحن بنجاح');
      fetchAll();
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  const openAddGradeModal = () => {
    setEditingGrade(null);
    setGradeForm({ name: '', order: 0, isActive: true });
    setShowGradeModal(true);
  };

  const openEditGradeModal = (grade) => {
    setEditingGrade(grade);
    setGradeForm({ name: grade.name, order: grade.order, isActive: grade.isActive });
    setShowGradeModal(true);
  };

  const handleCreateGrade = async (e) => {
    e.preventDefault();
    try {
      if (editingGrade) {
        await api.put(`/grades/admin/${editingGrade._id}`, gradeForm);
        toast.success('تم التحديث بنجاح');
      } else {
        await api.post('/grades/admin', gradeForm);
        toast.success('تمت الإضافة بنجاح');
      }
      setShowGradeModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleDeleteGrade = (id) => {
    showConfirm({
      title: 'حذف الصف الدراسي',
      message: 'هل أنت متأكد من حذف هذا الصف؟',
      onConfirm: async () => {
        try {
          await api.delete(`/grades/admin/${id}`);
          toast.success('تم الحذف');
          fetchAll();
        } catch (err) {
          toast.error('فشل الحذف');
        }
      }
    });
  };

  const addGovernorate = (e) => {
    if (e) e.preventDefault();
    setShippingSettings(prev => ({
      ...prev,
      governorates: [...(prev?.governorates || []), { name: '', price: '0' }]
    }));
  };

  const updateGovernorate = (index, field, value) => {
    setShippingSettings(prev => {
      const newGovs = [...(prev?.governorates || [])];
      newGovs[index] = { ...newGovs[index], [field]: value };
      return { ...prev, governorates: newGovs };
    });
  };

  const removeGovernorate = (index) => {
    showConfirm({
      title: 'إزالة المنطقة',
      message: 'هل أنت متأكد من رغبتك في إزالة هذه المنطقة من خيارات الشحن؟',
      onConfirm: () => {
        setShippingSettings(prev => {
          const newGovs = prev.governorates.filter((_, i) => i !== index);
          return { ...prev, governorates: newGovs };
        });
        toast.success('تمت إزالة المنطقة من القائمة');
      }
    });
  };

  const handleSelectBook = (bookId) => {
    setSelectedBooks(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const handleSelectAllBooks = (e, filteredBooks) => {
    if (e.target.checked) {
      setSelectedBooks(filteredBooks.map(b => b._id));
    } else {
      setSelectedBooks([]);
    }
  };

  const handleApplyBulkDiscount = async (e) => {
    e.preventDefault();
    if (selectedBooks.length === 0) return toast.error('يرجى اختيار كتاب واحد على الأقل');
    setFormLoading(true);
    try {
      console.log('Applying discount to books:', selectedBooks, 'Value:', discountValue);
      const response = await api.post('/admin/books/discount', { bookIds: selectedBooks, discount: Number(discountValue) });
      console.log('Discount response:', response.data);
      toast.success(response.data.message || 'تم تطبيق الخصم بنجاح! ');
      setShowDiscountModal(false);
      setSelectedBooks([]);
      setDiscountValue(0);
      fetchBooks();
    } catch (err) {
      console.error('Discount error:', err);
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء تطبيق الخصم');
    } finally {
      setFormLoading(false);
    }
  };


  const isAnyModalOpen = showAnnouncementModal || showBookModal || showUserModal || showCouponModal || showOrderModal || showCategoryModal || showDiscountModal || showGradeModal || confirmConfig.isOpen;

  if (loading) return <BookLoader />;

  return (
    <div className="relative selection:bg-primary pr-0 lg:pr-24 min-h-screen selection:text-white transition-all duration-500" dir="rtl">
      {/* Dynamic Background Elements */}
      <div className="hidden lg:block z-0 fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="-top-20 -right-20 absolute bg-primary/5 blur-[50px] md:blur-[100px] rounded-full w-[40vw] h-[40vw]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 50, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="top-1/2 -left-20 absolute bg-secondary/5 blur-[50px] md:blur-[80px] rounded-full w-[35vw] h-[35vw]"
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="right-1/4 bottom-0 absolute blur-[50px] md:blur-[70px] rounded-full w-[30vw] h-[30vw] bg-accent-dark/10"
        />
      </div>

      {/* Super Snappy Premium Floating Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        orders={orders}
        openAddBookModal={openAddBookModal}
        user={user}
      />



      <div className="z-10 relative mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 pb-32 max-w-7xl">
        {/* Modern Header Area */}
        <div className="relative mb-12 md:mb-20 overflow-visible">
          {/* Header Glow */}
          <div className="absolute -top-20 -right-10 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex md:flex-row flex-col justify-between items-start md:items-end gap-12">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1"
            >
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary/5 border border-primary/10 rounded-2xl">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
              <h1 className="font-heading font-black text-text-primary text-3xl md:text-5xl leading-[1.1]">
                مرحباً، <span className="text-gradient leading-relaxed">{user?.name?.split(' ')[0] || 'أدمن'}</span>
              </h1>
              <p className="mt-4 max-w-xl font-bold text-[#5F7A79] text-base md:text-xl leading-relaxed opacity-80">تحكم في كل تفصيلة في ستورك من مكان واحد ذكي.</p>
            </motion.div>

            {/* Date Area (Clean & RTL Fixed) */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="hidden md:flex flex-col items-end text-right bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-xl shadow-black/5"
            >
              <p className="opacity-60 mb-2 font-black text-[#8FA7A6] text-xs uppercase tracking-[0.3em]">التوقيت الحالي للتقرير</p>
              <p className="font-heading font-black text-primary text-3xl">
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Comprehensive Stats Grid */}
            <div className="gap-4 md:gap-5 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[
                { label: 'المستخدمين الموثقين', value: stats?.totalUsers || 0, icon: FiUsers, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', sub: `${stats?.totalStudents || 0} طالب | ${stats?.totalTeachers || 0} مدرس`, accent: 'bg-[#3B82F6]' },
                {
                  label: 'المستخدمين النشطين', value: (
                    <div className="flex items-center gap-2">
                      {stats?.activeUsers || 0}
                      {stats?.activeUsers > 0 && (
                        <span className="relative flex w-2 h-2">
                          <span className="absolute inline-flex bg-red-400 opacity-75 rounded-full w-full h-full animate-ping"></span>
                          <span className="relative inline-flex bg-red-500 rounded-full w-2 h-2"></span>
                        </span>
                      )}
                    </div>
                  ), icon: FiAlertCircle, color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', sub: 'حركة الزوار المباشرة الآن', accent: 'bg-[#EF4444]'
                },
                { label: 'الإيرادات الإجمالية', value: `${(stats?.totalRevenue ?? 0).toLocaleString()} ج.م`, icon: FiDollarSign, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', sub: 'إجمالي حركة المبيعات الناجحة', accent: 'bg-[#10B981]' },

                { label: 'الملازم والكتب', value: stats?.totalBooks ?? 0, icon: FiBookOpen, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', sub: `${stats?.pendingBooks ?? 0} بانتظار المراجعة`, accent: 'bg-[#F59E0B]' },
                { label: 'منتجات الستور', value: stats?.totalStoreProducts ?? 0, icon: FiGrid, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', sub: `${stats?.outOfStockCount || 0} منتجات نفذت`, accent: 'bg-[#8B5CF6]' },
                { label: 'النسخ المباعة', value: stats?.totalItemsSold || 0, icon: FiTrendingUp, color: 'text-[#06B6D4]', bg: 'bg-[#06B6D4]/10', sub: 'إجمالي الملازم والمنتجات', accent: 'bg-[#06B6D4]' },

                { label: 'إجمالي الطلبيات', value: stats?.totalOrders ?? 0, icon: FiShoppingCart, color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10', sub: 'لكافة فترات المتجر', accent: 'bg-[#6366F1]' },
                { label: 'طلبات معلقة', value: stats?.activeOrdersCount || 0, icon: FiClock, color: 'text-[#F97316]', bg: 'bg-[#F97316]/10', sub: 'بانتظار التأكيد أو قيد التجهيز', accent: 'bg-[#F97316]' },
                { label: 'طلبات مكتملة', value: stats?.completedOrdersCount || 0, icon: FiCheckCircle, color: 'text-[#31605F]', bg: 'bg-[#31605F]/10', sub: 'طلبات تم توصيلها بنجاح', accent: 'bg-[#31605F]' },
              ].map((stat, i) => (
                <motion.div
                  key={`stat-card-${stat.label}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="group relative overflow-hidden bg-white/90 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.06)] backdrop-blur-xl p-4 md:p-5 border border-white/80 rounded-[1.5rem] md:rounded-[2rem] transition-all duration-500"
                >
                  {/* Decorative Background Icon */}
                  <stat.icon className={`absolute -bottom-4 -left-4 w-24 h-24 opacity-[0.015] transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${stat.color} pointer-events-none`} />

                  <div className="relative z-10 flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-4">
                      <div className={`shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl ${stat.bg} flex items-center justify-center transition-all duration-500 group-hover:scale-105 shadow-sm shadow-black/5`}>
                        <stat.icon className={`w-6 h-6 md:w-7 md:h-7 ${stat.color} transition-transform duration-500 group-hover:rotate-6`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#5F7A79] text-[10px] md:text-xs uppercase tracking-wide opacity-70 mb-0.5 md:mb-1">{stat.label}</p>
                        <h4 className="font-heading font-black text-text-primary text-lg md:text-xl tracking-tight leading-none">
                          {stat.value}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-primary/[0.02] mt-auto px-4 py-2 border border-primary/[0.03] rounded-xl w-full transition-all group-hover:bg-primary/[0.04] group-hover:border-primary/[0.08]">
                      <div className={`w-1 h-1 rounded-full ${stat.accent} opacity-40`} />
                      <p className="flex-1 font-bold text-[#5F7A79] text-[9px] md:text-[10px] leading-none truncate">{stat.sub}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
              {/* Massive Chart Card */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 relative overflow-hidden bg-white/90 shadow-2xl shadow-primary/5 backdrop-blur-3xl p-6 md:p-10 border border-white/80 rounded-[2.5rem] md:rounded-[3rem] min-w-0"
              >
                {/* Background Glow for Chart */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex lg:flex-row flex-col justify-between items-center gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <div className="flex justify-center items-center bg-primary shadow-md rounded-xl w-12 h-12 text-white">
                      <FiTrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-2xl">نبض الأرباح</h3>
                      <p className="font-bold text-[#8FA7A6] text-xs">متابعة دقيقة لحركة السيولة المالية</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex bg-primary/5 p-1 rounded-xl border border-primary/5">
                      <button
                        onClick={() => setChartView('daily')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-black transition-all ${chartView === 'daily' ? 'bg-primary text-white shadow-md' : 'text-[#8FA7A6] hover:text-primary'}`}
                      >
                        آخر 30 يوم
                      </button>
                      <button
                        onClick={() => setChartView('monthly')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-black transition-all ${chartView === 'monthly' ? 'bg-primary text-white shadow-md' : 'text-[#8FA7A6] hover:text-primary'}`}
                      >
                        آخر 12 شهر
                      </button>
                    </div>
                    <button
                      onClick={handleResetStats}
                      className="flex justify-center items-center bg-red-50 hover:bg-red-500 rounded-2xl w-14 h-14 text-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                      title="تصفير الإحصائيات"
                    >
                      <FiTrash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                {revenueChartData.length > 0 ? (
                  <div className="relative min-w-0 h-[400px] overflow-hidden">
                    <ResponsiveContainer
                      key={`chart-${activeTab}-${chartView}-${revenueChartData.length}`}
                      width="100%"
                      height={400}
                      minWidth={0}
                    >
                      <AreaChart data={revenueChartData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#31605F" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#31605F" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="10 10" stroke="#EEF4F3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8FA7A6', fontSize: 12, fontWeight: 700 }} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8FA7A6', fontSize: 12, fontWeight: 700 }} dx={-10} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '24px',
                            border: 'none',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            padding: '15px'
                          }}
                          formatter={(val) => [`${val} جنيه`, 'الأرباح']}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#31605F"
                          strokeWidth={4}
                          fill="url(#colorRevenue)"
                          animationDuration={2500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center gap-4 h-[400px] text-text-muted">
                    <FiDollarSign className="opacity-20 w-16 h-16" />
                    <p className="font-bold">بياناتك المالية ستظهر هنا قريباً...</p>
                  </div>
                )}
              </motion.div>

              {/* Dynamic Notification/Queue Section */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ delay: 0.5 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark shadow-[0_20px_50px_rgba(49,96,95,0.25)] p-7 md:p-8 rounded-[2.5rem] text-white transition-all duration-500"
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-[50px] rounded-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 blur-[30px] rounded-full pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-heading font-black text-xl">أداء المتجر اليوم</h3>
                      <div className="flex justify-center items-center bg-white/20 backdrop-blur-md rounded-xl w-10 h-10">
                        <FiShoppingCart className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="flex items-end gap-3 mb-6">
                      <span className="font-heading font-black text-4xl md:text-5xl">+{stats?.todayOrders || 0}</span>
                      <div className="flex flex-col pb-1">
                        <span className="font-black text-white/90 text-sm leading-none">طلب جديد</span>
                        <span className="mt-1 font-bold text-white/40 text-[9px] uppercase tracking-widest leading-none">تحديث لحظي</span>
                      </div>
                    </div>

                    <p className="mb-3 font-bold text-white/60 text-xs text-right">معدل الإنجاز مقارنة بالأهداف</p>
                    <div className="bg-white/10 rounded-full w-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(((stats?.todayOrders || 0) / 10) * 100, 100)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="bg-gradient-to-r from-white/60 to-white shadow-[0_0_15px_rgba(255,255,255,0.4)] h-full"
                      />
                    </div>
                  </div>
                </motion.div>

                {books.filter(b => b.status === 'pending').length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex-1 relative overflow-hidden bg-white/80 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.04)] backdrop-blur-3xl p-6 md:p-8 border border-white/90 rounded-[2.5rem]"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3">
                        <div className="flex justify-center items-center bg-amber-100 rounded-xl w-10 h-10 text-amber-600">
                          <FiAlertCircle className="w-5 h-5" />
                        </div>
                        <h3 className="font-heading font-black text-xl">تحتاج لقرارك</h3>
                      </div>
                      <span className="relative flex w-2.5 h-2.5">
                        <span className="absolute inline-flex bg-red-400 opacity-75 rounded-full w-full h-full animate-ping"></span>
                        <span className="relative inline-flex bg-red-500 rounded-full w-2.5 h-2.5"></span>
                      </span>
                    </div>

                    <div className="space-y-4">
                      {books.filter(b => b.status === 'pending').slice(0, 3).map((book) => (
                        <div key={book._id} className="group flex items-center gap-4 p-3 bg-primary/[0.02] hover:bg-primary/[0.05] border border-primary/[0.03] rounded-2xl transition-all duration-300">
                          <div className="relative flex-shrink-0 shadow-md border border-white/20 rounded-xl w-14 h-18 overflow-hidden">
                            {book.coverImage ? (
                              <img src={book.coverImage} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" alt="" />
                            ) : (
                              <div className="flex justify-center items-center bg-primary/10 w-full h-full text-primary/30 text-2xl"><FiBook /></div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-black text-text-primary text-base truncate mb-1">{book.title}</p>
                            <div className="flex items-center gap-2 whitespace-nowrap overflow-x-auto no-scrollbar">
                              <span className="bg-white/60 px-2 py-0.5 rounded-lg font-bold text-[#5F7A79] text-[9px] truncate">{book.teacherName}</span>
                              <div className="flex items-center gap-1 bg-white/60 px-2 py-0.5 rounded-lg">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                                <span className="font-black text-[9px] text-primary">المخزون: {book.stock}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveBook(book._id, 'approved')}
                              className="flex justify-center items-center bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 rounded-xl w-10 h-10 text-white hover:scale-110 active:scale-95 transition-all"
                              title="اعتماد"
                            >
                              <FiCheck className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleApproveBook(book._id, 'rejected')}
                              className="flex justify-center items-center bg-white hover:bg-red-50 border border-red-100 shadow-sm rounded-xl w-10 h-10 text-red-500 hover:scale-110 active:scale-95 transition-all"
                              title="رفض"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Management Tab Content */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-10">
            <div className="flex md:flex-row flex-col justify-between items-center gap-6 bg-white/40 backdrop-blur-md p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-white/60">
              <div className="text-center md:text-right">
                <h2 className="mb-2 font-heading font-black text-text-primary text-2xl md:text-4xl">إدارة الأعضاء</h2>
                <p className="font-bold text-text-secondary text-xs md:text-sm">تحكم في صلاحيات المستخدمين والطلاب (إجمالي: {users.length})</p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="bg-primary/10 px-4 py-2 rounded-xl font-bold text-primary text-xs">أدمن: {users.filter(u => u.role === 'admin').length}</span>
                  <span className="bg-blue-100 px-4 py-2 rounded-xl font-bold text-blue-600 text-xs">مدرس: {users.filter(u => u.role === 'teacher').length}</span>
                  <span className="bg-green-100 px-4 py-2 rounded-xl font-bold text-green-600 text-xs">طالب: {users.filter(u => u.role === 'student' || !u.role).length}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openUserModal}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-6 py-3 rounded-2xl font-black text-white text-sm transition-all"
                >
                  <FiPlus className="w-5 h-5" />
                  إضافة مستخدم
                </motion.button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو البريد أو رقم الهاتف..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="bg-white/60 backdrop-blur-md px-14 py-4 border border-white/80 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold text-text-primary placeholder:text-text-muted/50"
              />
            </div>

            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden lg:block bg-white/80 shadow-2xl shadow-primary/5 backdrop-blur-2xl border border-white/80 rounded-[3rem] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-primary/5">
                        <th className="px-10 py-8 font-heading font-black text-text-secondary uppercase">المستخدم</th>
                        <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">بيانات الاتصال</th>
                        <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">الصلاحية</th>
                        <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">تاريخ الانضمام</th>
                        <th className="px-10 py-8 font-heading font-black text-text-secondary text-center uppercase">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {users
                        .filter(u => !userFilter || u.name?.toLowerCase().includes(userFilter.toLowerCase()) || u.email?.toLowerCase().includes(userFilter.toLowerCase()) || u.phone?.includes(userFilter))
                        .map((u) => (
                          <tr key={u._id} className="group hover:bg-primary/[0.02] transition-colors">
                            <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                <div className="flex justify-center items-center bg-[#31605F] shadow-lg shadow-primary/20 rounded-2xl w-12 h-12 text-white">
                                  <FiUsers className="opacity-90 w-6 h-6" />
                                </div>
                                <div>
                                  <p className="font-black text-text-primary text-lg">{u.name}</p>
                                  <p className="text-text-muted text-sm">ID: {u._id.slice(-6).toUpperCase()}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <p className="font-bold text-text-secondary">{u.email}</p>
                              <p className="mt-1 text-text-muted text-sm">{u.phone || 'بدون هاتف'}</p>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-4 py-2 rounded-2xl font-black text-xs inline-block ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                                u.role === 'teacher' ? 'bg-blue-100 text-blue-600' :
                                  'bg-green-100 text-green-600'
                                }`}>
                                {u.role === 'admin' ? 'أدمن' : u.role === 'teacher' ? 'مدرس' : 'طالب'}
                              </span>
                            </td>
                            <td className="px-8 py-6 font-bold text-text-muted">
                              {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                            </td>
                            <td className="px-10 py-6">
                              <div className="flex items-center justify-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openEditUserModal(u)}
                                  className="flex justify-center items-center bg-blue-50 hover:bg-blue-500 rounded-2xl w-10 h-10 text-blue-600 hover:text-white transition-all"
                                  title="تعديل المستخدم"
                                >
                                  <FiEdit className="w-4 h-4" />
                                </motion.button>
                                {u._id !== user._id && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDeleteUser(u._id)}
                                    className="flex justify-center items-center bg-red-50 hover:bg-red-500 rounded-2xl w-10 h-10 text-red-500 hover:text-white transition-all"
                                    title="حذف المستخدم"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </motion.button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {users
                  .filter(u => !userFilter || u.name?.toLowerCase().includes(userFilter.toLowerCase()) || u.email?.toLowerCase().includes(userFilter.toLowerCase()) || u.phone?.includes(userFilter))
                  .map((u, idx) => (
                    <motion.div
                      key={u._id || idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white/60 backdrop-blur-md p-5 border border-white/80 rounded-3xl shadow-sm"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-primary/10 rounded-2xl w-14 h-14 shrink-0 font-black text-primary text-xl flex items-center justify-center overflow-hidden">
                          {u.photo ? <img src={u.photo} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-text-primary text-lg truncate">{u.name}</h3>
                          <span className={`px-3 py-1 rounded-full font-black text-[10px] inline-block ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : u.role === 'teacher' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                            {u.role === 'admin' ? 'أدمن' : u.role === 'teacher' ? 'مدرس' : 'طالب'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditUserModal(u)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl active:scale-95 transition-all" title="تعديل"><FiEdit className="w-5 h-5" /></button>
                          {u._id !== user._id && (
                            <button onClick={() => handleDeleteUser(u._id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl active:scale-95 transition-all" title="حذف"><FiTrash2 className="w-5 h-5" /></button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-3 border-t border-primary/5">
                        <div className="flex items-center gap-2 text-text-secondary text-xs font-bold">
                          <span className="opacity-50">البريد:</span> {u.email}
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary text-xs font-bold">
                          <span className="opacity-50">الهاتف:</span> {u.phone || 'بدون هاتف'}
                        </div>
                        <div className="flex items-center gap-2 text-text-muted text-[10px] font-bold">
                          <span className="opacity-50">انضم في:</span> {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Books Tab Content */}
        {(activeTab === 'books' || activeTab === 'store_products') && (() => {
          const isStoreMode = activeTab === 'store_products';
          const bookCounts = {
            all: books.filter(b => isStoreMode ? b.isStoreProduct : !b.isStoreProduct).length,
            pending: books.filter(b => b.status === 'pending' && (isStoreMode ? b.isStoreProduct : !b.isStoreProduct)).length,
            approved: books.filter(b => b.status === 'approved' && (isStoreMode ? b.isStoreProduct : !b.isStoreProduct)).length,
            rejected: books.filter(b => b.status === 'rejected' && (isStoreMode ? b.isStoreProduct : !b.isStoreProduct)).length,
          };
          return (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div className="flex md:flex-row flex-col justify-between items-center gap-6 mb-4">
                <div>
                  <h2 className="font-heading font-black text-text-primary text-4xl">{isStoreMode ? 'منتجات المتجر' : 'إدارة الكتب والملازم'}</h2>
                  <p className="font-bold text-text-secondary">{isStoreMode ? 'تحكم في الأدوات والمستلزمات التي تعرضها في ستورك' : 'إدارة ومراجعة الكتب الدراسية المرفوعة للمنصة'}</p>
                </div>
                <motion.button
                  onClick={openAddBookModal}
                  whileHover={{ scale: 1.05 }}
                  className="flex justify-center items-center gap-3 shadow-primary/20 shadow-xl px-8 py-4 rounded-3xl w-full md:w-auto font-black text-white text-lg gradient-primary"
                >
                  <FiPlus className="w-6 h-6" /> {isStoreMode ? 'إضافة منتج جديد' : 'إضافة كتاب جديد'}
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-primary/5 shadow-xl p-6 md:p-12 border border-white/80 rounded-[2.5rem] md:rounded-[3.5rem]"
              >
                <h3 className="mb-6 md:mb-10 font-heading font-black text-text-primary text-xl md:text-2xl text-right">الحالات</h3>
                <div className="gap-4 md:gap-8 grid grid-cols-2 sm:grid-cols-4">
                  {[
                    { key: 'all', label: 'الجميع', count: bookCounts.all, color: 'bg-primary', ring: 'ring-primary/20', textColor: 'text-primary' },
                    { key: 'pending', label: 'بانتظار المراجعة', count: bookCounts.pending, color: 'bg-amber-500', ring: 'ring-amber-500/20', textColor: 'text-amber-500' },
                    { key: 'approved', label: 'المعتمدة', count: bookCounts.approved, color: 'bg-emerald-500', ring: 'ring-emerald-500/20', textColor: 'text-emerald-500' },
                    { key: 'rejected', label: 'المرفوضة', count: bookCounts.rejected, color: 'bg-red-500', ring: 'ring-red-500/20', textColor: 'text-red-500' }
                  ].map(({ key, label, count, color, ring, textColor }) => (
                    <div
                      key={key}
                      onClick={() => setBookFilter(key)}
                      className={`flex flex-col items-center cursor-pointer transition-all hover:scale-105 ${bookFilter === key ? 'opacity-100 scale-105' : 'opacity-50 hover:opacity-100'}`}
                    >
                      <div className={`relative flex justify-center items-center bg-bg shadow-inner mb-3 md:mb-4 rounded-2xl md:rounded-3xl w-16 h-16 md:w-24 md:h-24 ${bookFilter === key || (bookFilter === '' && key === 'all') ? `ring-4 ${ring}` : ''}`}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: count > 0 || key === 'all' ? 1 : 0.8 }}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${count > 0 || key === 'all' ? color : 'bg-gray-200'} flex items-center justify-center shadow-lg`}
                        >
                          <span className="font-black text-white text-base md:text-xl">{count}</span>
                        </motion.div>
                      </div>
                      <p className={`font-black text-[10px] md:text-sm text-center ${bookFilter === key ? textColor : 'text-text-muted'}`}>{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="flex justify-between items-center mb-6 px-4">
                <label className="group flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedBooks.length > 0 && selectedBooks.length === books.filter(b => {
                        const matchStore = isStoreMode ? b.isStoreProduct : !b.isStoreProduct;
                        if (!matchStore) return false;
                        if (!bookFilter || bookFilter === 'all') return true;
                        return b.status === bookFilter;
                      }).length}
                      onChange={(e) => handleSelectAllBooks(e, books.filter(b => {
                        const matchStore = isStoreMode ? b.isStoreProduct : !b.isStoreProduct;
                        if (!matchStore) return false;
                        if (!bookFilter || bookFilter === 'all') return true;
                        return b.status === bookFilter;
                      }))}
                      className="peer hidden"
                    />
                    <div className="flex justify-center items-center peer-checked:bg-primary border-2 border-primary/20 group-hover:border-primary peer-checked:border-primary rounded-lg w-6 h-6 transition-all">
                      <FiCheck className="opacity-0 peer-checked:opacity-100 w-4 h-4 text-white transition-opacity" />
                    </div>
                  </div>
                  <span className="font-black text-text-muted group-hover:text-primary text-sm transition-colors">تحديد الكل</span>
                </label>

                {selectedBooks.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setShowDiscountModal(true)}
                    className="flex items-center gap-2 bg-rose-600 shadow-rose-600/20 shadow-xl px-6 py-3 rounded-[2rem] font-black text-white text-sm hover:scale-105 transition-all"
                  >
                    <FiDollarSign className="w-5 h-5" /> عمل خصم ({selectedBooks.length})
                  </motion.button>
                )}
              </div>

              <div className="gap-4 md:gap-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {backgroundLoading && books.length === 0 ? (
                  <div className="col-span-full py-24 text-center">
                    <div className="flex justify-center mb-6">
                      <FiBookOpen className="w-16 h-16 text-primary/20 animate-pulse" />
                    </div>
                    <p className="font-heading font-black text-text-secondary text-2xl">جاري تحميل قائمة المنتجات والمواد...</p>
                    <p className="mt-2 font-bold text-text-muted">نجهز لك أحدث البيانات الآن</p>
                  </div>
                ) : books
                  .filter(b => {
                    const matchStore = isStoreMode ? b.isStoreProduct : !b.isStoreProduct;
                    if (!matchStore) return false;
                    if (!bookFilter || bookFilter === 'all') return true;
                    return b.status === bookFilter;
                  })
                  .map((book, i) => (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -8, scale: 1.01 }}
                      className="group relative flex flex-col bg-[#31605F]/80 backdrop-blur-xl p-3 md:p-4 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] transition-all"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-[2rem] md:rounded-[2.5rem] pointer-events-none" />
                      <div className="relative shadow-2xl mb-4 md:mb-6 border border-white/5 rounded-2xl md:rounded-[2rem] aspect-square overflow-hidden">
                        {/* Checkbox */}
                        <div className="top-3 right-3 md:top-4 md:right-4 z-30 absolute">
                          <input
                            type="checkbox"
                            checked={selectedBooks.includes(book._id)}
                            onChange={() => handleSelectBook(book._id)}
                            className="peer hidden"
                            id={`book-check-${book._id}`}
                          />
                          <label htmlFor={`book-check-${book._id}`} className="flex justify-center items-center bg-white/80 peer-checked:bg-[#4FD1C5] shadow-lg backdrop-blur-md border-[#4FD1C5]/20 border-2 peer-checked:border-[#4FD1C5] rounded-lg md:rounded-xl w-7 h-7 md:w-8 md:h-8 transition-all cursor-pointer">
                            <FiCheck className="opacity-0 peer-checked:opacity-100 w-4 h-4 md:w-5 md:h-5 text-white transition-opacity" />
                          </label>
                        </div>

                        {book.coverImage ? (
                          <img src={book.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="flex justify-center items-center bg-gradient-to-br from-white/5 to-white/10 w-full h-full text-white/20 text-5xl md:text-7xl"><FiBook /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#31605F]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>

                      <div className="z-10 relative flex flex-col flex-grow px-1 text-center">
                        <h3 className="mb-2 md:mb-3 font-bold text-[#ffffff] text-lg md:text-2xl truncate leading-tight">{book.title}</h3>

                        {!isStoreMode && book.teacherName && (
                          <p className="mb-2 font-medium text-[#4FD1C5] text-sm md:text-base">{book.teacherName}</p>
                        )}

                        {/* Divider with Glow */}
                        <div className="relative flex justify-center items-center mb-4 md:mb-5 h-1">
                          <div className="bg-gradient-to-r from-transparent via-[#4FD1C5]/30 to-transparent w-full h-[1px]" />
                          <div className="absolute bg-[#4FD1C5] shadow-[0_0_8px_rgba(79,209,197,0.8)] rounded-full w-1 md:w-1.5 h-1 md:h-1.5" />
                        </div>

                        <div className="flex flex-col gap-2 md:gap-3 mb-4 md:mb-6 w-full">
                          <div className="flex flex-wrap justify-center items-center gap-x-3 md:gap-x-4 gap-y-1 md:gap-y-2 font-medium text-white/70 text-[10px] sm:text-sm">
                            <div className="flex items-center gap-1" title="الكمية المباعة">
                              <FiShoppingCart className="w-3 h-3 md:w-4 md:h-4 text-[#4FD1C5]" />
                              <span>المباع: <span className="font-black text-white">{book.totalSold || 0}</span></span>
                            </div>
                            <span className="text-[#4FD1C5]/40">•</span>
                            <div className="flex items-center gap-1" title="إجمالي المخزون المرفوع">
                              <FiPackage className="w-3 h-3 md:w-4 md:h-4 text-[#4FD1C5]" />
                              <span>الاستوك: <span className="font-black text-white">{(book.totalSold || 0) + (book.stock || 0)}</span></span>
                            </div>
                            <span className="text-[#4FD1C5]/40 text-xs">•</span>
                            <div className="flex items-center gap-1" title="الكمية المتاحة حالياً">
                              <FiPackage className="w-3 h-3 md:w-4 md:h-4 text-[#4FD1C5]" />
                              <span>المتبقي: <span className="font-black text-white">{book.stock}</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 md:gap-4 mt-auto">
                          {/* Price */}
                          <div className="flex flex-col items-center bg-white/5 group-hover:bg-[#4FD1C5]/10 backdrop-blur-md py-3 md:py-4 border border-white/10 group-hover:border-[#4FD1C5]/30 rounded-xl md:rounded-2xl transition-all">
                            {book.discount > 0 ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="mb-0.5 font-black text-[#CBDDD3] text-[10px] md:text-sm">خصم {book.discount}%</span>
                                <div className="flex items-baseline gap-1">
                                  <span className="font-black text-white text-xl md:text-3xl">{book.priceAfterDiscount}</span>
                                  <span className="font-bold text-white/80 text-xs md:text-sm">ج.م</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-white/40">
                                  <span className="font-bold text-[9px]">بدلاً من</span>
                                  <span className="font-bold text-xs md:text-base decoration-red-500/50 line-through">{book.price}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-baseline gap-1">
                                  <span className="font-black text-white text-xl md:text-3xl">{book.price}</span>
                                  <span className="font-bold text-white/80 text-xs md:text-sm">ج.م</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <motion.button onClick={() => openEditBookModal(book)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex flex-1 justify-center items-center gap-2 bg-white/5 hover:bg-[#4FD1C5]/20 border border-white/10 hover:border-[#4FD1C5]/50 rounded-xl md:rounded-2xl h-10 md:h-11 text-white/70 hover:text-[#4FD1C5] transition-all">
                              <FiEdit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </motion.button>
                            <motion.button onClick={() => handleDeleteBook(book._id)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex flex-1 justify-center items-center gap-2 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 rounded-xl md:rounded-2xl h-10 md:h-11 text-white/70 hover:text-red-400 transition-all">
                              <FiTrash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </motion.button>
                          </div>

                          {/* Approve / Reject */}
                          {book.status === 'pending' && (
                            <div className="flex gap-2 shrink-0">
                              <motion.button onClick={() => handleApproveBook(book._id, 'approved')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 bg-[#4FD1C5] hover:bg-[#38b2a6] shadow-[0_0_15px_rgba(79,209,197,0.3)] hover:shadow-[0_0_20px_rgba(79,209,197,0.5)] py-2 md:py-2.5 border border-[#4FD1C5]/20 rounded-xl md:rounded-2xl font-black text-black text-xs md:text-sm transition-all">
                                اعتماد
                              </motion.button>
                              <motion.button onClick={() => handleApproveBook(book._id, 'rejected')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 bg-transparent hover:bg-red-500/10 py-2 md:py-2.5 border border-red-500/30 hover:border-red-500 rounded-xl md:rounded-2xl font-black text-red-400 text-xs md:text-sm transition-all">
                                رفض
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          );
        })()}

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (() => {
          // ---- Calculations ----
          const totalOrdersRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

          // Per-status counts
          const statusCounts = { placed: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
          orders.forEach(o => { if (statusCounts[o.orderStatus] !== undefined) statusCounts[o.orderStatus]++; });

          return (
            <div className="space-y-10">
              {/* ===== STATUS BREAKDOWN & FILTER ===== */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-primary/5 shadow-xl p-6 md:p-12 border border-white/80 rounded-[2.5rem] md:rounded-[3.5rem]"
              >
                <h3 className="mb-6 md:mb-10 font-heading font-black text-text-primary text-xl md:text-2xl text-right">توزيع حالات الطلبات</h3>
                <div className="gap-4 md:gap-8 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7">
                  {[
                    { key: 'all', label: 'الكل', count: orders.length, color: 'bg-primary', ring: 'ring-primary/20', textColor: 'text-primary' },
                    { key: 'placed', label: 'جديد', count: statusCounts.placed, color: 'bg-blue-500', ring: 'ring-blue-500/20', textColor: 'text-blue-500' },
                    { key: 'confirmed', label: 'مؤكد', count: statusCounts.confirmed, color: 'bg-indigo-500', ring: 'ring-indigo-500/20', textColor: 'text-indigo-500' },
                    { key: 'processing', label: 'تجهيز', count: statusCounts.processing, color: 'bg-amber-500', ring: 'ring-amber-500/20', textColor: 'text-amber-500' },
                    { key: 'shipped', label: 'شحن', count: statusCounts.shipped, color: 'bg-orange-500', ring: 'ring-orange-500/20', textColor: 'text-orange-500' },
                    { key: 'delivered', label: 'مكتمل', count: statusCounts.delivered, color: 'bg-emerald-500', ring: 'ring-emerald-500/20', textColor: 'text-emerald-500' },
                    { key: 'cancelled', label: 'ملغي', count: statusCounts.cancelled, color: 'bg-red-500', ring: 'ring-red-500/20', textColor: 'text-red-500' }
                  ].map(({ key, label, count, color, ring, textColor }) => (
                    <div
                      key={label}
                      onClick={() => setOrderFilter(key)}
                      className={`flex flex-col items-center cursor-pointer transition-all hover:scale-105 ${orderFilter === key ? 'opacity-100 scale-105' : 'opacity-50 hover:opacity-100'}`}
                    >
                      <div className={`relative flex justify-center items-center bg-bg shadow-inner mb-3 md:mb-4 rounded-2xl md:rounded-3xl w-16 h-16 md:w-24 md:h-24 ${orderFilter === key || (orderFilter === '' && key === 'all') ? `ring-4 ${ring}` : ''}`}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: count > 0 || key === 'all' ? 1 : 0.8 }}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${count > 0 || key === 'all' ? color : 'bg-gray-200'} flex items-center justify-center shadow-lg`}
                        >
                          <span className="font-black text-white text-base md:text-xl">{count}</span>
                        </motion.div>
                      </div>
                      <p className={`font-black text-[10px] md:text-sm text-center ${orderFilter === key ? textColor : 'text-text-muted'}`}>{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Action Buttons (if any orders selected) */}
              <div className="flex flex-wrap justify-center md:justify-end gap-3 px-4 md:px-0">
                {selectedOrders.length > 0 && (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={handleBulkDeleteOrders}
                      className="flex items-center gap-2 bg-red-600 shadow-red-600/20 shadow-xl px-5 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-[2rem] font-black text-[10px] text-white md:text-sm hover:scale-105 transition-all"
                    >
                      <FiTrash2 className="w-4 md:w-5 h-4 md:h-5" /> حذف المحدد ({selectedOrders.length})
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={handlePrintBulkInvoices}
                      className="flex items-center gap-2 bg-emerald-600 shadow-emerald-600/20 shadow-xl px-5 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-[2rem] font-black text-[10px] text-white md:text-sm hover:scale-105 transition-all"
                    >
                      <FiPrinter className="w-4 md:w-5 h-4 md:h-5" /> طباعة الفواتير ({selectedOrders.length})
                    </motion.button>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center mb-6 px-4 md:px-8">
                <label className="group flex items-center gap-2 md:gap-3 cursor-pointer">
                  <div className="relative shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={handleSelectAllOrders}
                      className="peer hidden"
                      id="select-all-orders"
                    />
                    <div className="flex justify-center items-center peer-checked:bg-primary border-2 border-primary/20 group-hover:border-primary peer-checked:border-primary rounded-lg w-5 md:w-6 h-5 md:h-6 transition-all">
                      <FiCheck className="opacity-0 peer-checked:opacity-100 w-3.5 md:w-4 h-3.5 md:h-4 text-white transition-opacity" />
                    </div>
                  </div>
                  <span className="font-black text-[10px] text-text-muted group-hover:text-primary md:text-sm transition-colors">تحديد الكل</span>
                </label>

                <div className="flex items-center gap-4 font-bold text-[10px] text-text-muted md:text-sm">
                  <span>إجمالي الطلبات: {orders.length}</span>
                </div>
              </div>

              <div className="space-y-6 pb-64 min-h-[500px]">
                {backgroundLoading && orders.length === 0 ? (
                  <div className="bg-white/50 backdrop-blur py-24 border border-white/80 border-dashed rounded-[3.5rem] text-center">
                    <div className="flex justify-center mb-6">
                      <FiShoppingCart className="w-16 h-16 text-primary/20 animate-pulse" />
                    </div>
                    <p className="font-heading font-black text-text-secondary text-2xl">جاري جلب أحدث الطلبات...</p>
                    <p className="mt-2 font-bold text-text-muted">ثواني وهتكون كل الطلبات قدامك</p>
                  </div>
                ) : orders
                  .filter(o => !orderFilter || orderFilter === 'all' || o.orderStatus === orderFilter)
                  .map((order, idx) => (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{ zIndex: orders.length - idx }}
                      className={`group relative p-6 md:p-10 border rounded-[2.5rem] md:rounded-[3.5rem] transition-all ${selectedOrders.includes(order._id)
                        ? 'bg-primary/5 border-primary shadow-2xl shadow-primary/10'
                        : 'bg-white/90 shadow-2xl shadow-primary/5 backdrop-blur-2xl border-white/80'
                        }`}
                    >
                      <div className="top-0 right-0 -z-10 absolute bg-primary rounded-r-[2.5rem] md:rounded-r-[3.5rem] w-2 h-full" />

                      <div className="z-10 relative flex flex-col gap-6 md:gap-8">
                        {/* Top Row: Selection, ID, Badges, Details Button */}
                        <div className="flex flex-wrap justify-between items-center gap-4">
                          <div className="flex flex-wrap items-center gap-3 md:gap-4">
                            {/* Checkbox */}
                            <div className="z-30 relative shrink-0">
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order._id)}
                                onChange={() => handleSelectOrder(order._id)}
                                className="peer hidden"
                                id={`order-check-${order._id}`}
                              />
                              <label
                                htmlFor={`order-check-${order._id}`}
                                className="flex justify-center items-center bg-white/80 peer-checked:bg-primary shadow-sm border-2 border-primary/20 peer-checked:border-primary rounded-xl w-8 h-8 transition-all cursor-pointer"
                              >
                                <FiCheck className="opacity-0 peer-checked:opacity-100 w-5 h-5 text-white transition-opacity" />
                              </label>
                            </div>

                            <span className="bg-primary/5 px-3 py-1 rounded-lg font-mono font-black text-primary text-base md:text-lg">#{order._id.slice(-8).toUpperCase()}</span>

                            <span className={`px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black text-center ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {order.paymentStatus === 'paid' ? 'تم الدفع' : 'الدفع عند الاستلام'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openOrderDetails(order)}
                              className="flex items-center gap-2 bg-primary/10 hover:bg-primary px-3 md:px-4 py-1.5 rounded-full font-black text-[9px] text-primary md:text-[10px] hover:text-white transition-all"
                            >
                              <FiEye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">تفاصيل الطلب</span>
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              className="flex items-center gap-2 bg-red-50 hover:bg-red-500 shadow-sm hover:shadow-red-500/25 px-3 md:px-4 py-1.5 rounded-full font-black text-[9px] text-red-600 md:text-[10px] hover:text-white transition-all"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">حذف</span>
                            </button>
                          </div>
                        </div>

                        {/* Middle Row: User Info and Total Price */}
                        <div className="flex lg:flex-row flex-col justify-between items-start lg:items-end gap-6 md:gap-8 pb-6 md:pb-8 border-primary/5 border-b">
                          <div className="flex-1 space-y-2">
                            <h3 className="font-black text-text-primary text-2xl md:text-4xl">{order.user?.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 font-bold text-[#5F7A79] text-xs md:sm">
                              <span className="inline-block max-w-[200px] truncate">{order.user?.email}</span>
                              <span className="opacity-30">|</span>
                              <span className="text-primary">{order.user?.phone || 'بدون رقم'}</span>
                            </div>
                          </div>

                          <div className="w-full md:w-auto min-w-0 md:min-w-[200px] md:text-left text-right">
                            <p className="mb-1 font-black text-[9px] text-text-muted md:text-[10px] uppercase tracking-wider">إجمالي الطلب</p>
                            <p className="font-black text-primary text-4xl md:text-6xl leading-none tracking-tighter">
                              {order.total} <span className="opacity-40 font-bold text-lg md:text-xl">ج.م</span>
                            </p>
                          </div>
                        </div>

                        {/* Bottom Row: Items and Date */}
                        <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-4">
                          <div className="flex flex-wrap justify-start gap-2 max-w-2xl">
                            {order.items.map((item, j) => (
                              <div key={j} className="flex items-center gap-2 bg-bg/50 shadow-sm backdrop-blur px-3 py-1.5 border border-white/60 rounded-xl hover:scale-105 transition-transform">
                                <div className="flex justify-center items-center rounded-lg w-6 h-6 font-black text-[9px] text-white gradient-primary shrink-0">{item.quantity}</div>
                                <span className="font-black text-[10px] text-text-secondary md:text-xs">{item.title}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 bg-bg px-3 py-1.5 rounded-full font-bold text-[10px] text-text-muted md:text-[11px] shrink-0">
                            <FiCalendar className="w-3 md:w-3.5 h-3 md:h-3.5" />
                            {new Date(order.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      <div className="relative flex md:flex-row flex-col justify-between items-center gap-6 mt-8 md:mt-10 pt-6 md:pt-8 border-primary/5 border-t">
                        <div className="flex sm:flex-row flex-col items-start sm:items-center gap-3 md:gap-4 w-full md:w-auto">
                          <span className="font-black text-text-muted text-xs whitespace-nowrap md:sm">تغيير حالة الطلب:</span>
                          <CustomSelect
                            value={order.orderStatus}
                            onChange={(val) => handleUpdateOrderStatus(order._id, val)}
                            options={[
                              { label: 'جديد', value: 'placed' },
                              { label: 'مؤكد', value: 'confirmed' },
                              { label: 'قيد التجهيز', value: 'processing' },
                              { label: 'تم الشحن', value: 'shipped' },
                              { label: 'مكتمل', value: 'delivered' },
                              { label: 'ملغي', value: 'cancelled' },
                            ]}
                            className="w-full sm:min-w-[200px]"
                          />
                        </div>

                        <div className="flex justify-end items-center gap-4 w-full md:w-auto">
                          <div className="text-left">
                            <p className="mb-1 font-black text-[9px] text-text-muted md:text-[10px] text-left uppercase">العنوان</p>
                            <p className="font-black text-text-primary text-xs md:text-sm text-left leading-relaxed">
                              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.governorate}
                            </p>
                          </div>
                          <div className="flex justify-center items-center bg-primary/5 rounded-2xl w-12 md:w-14 h-12 md:h-14 text-primary shrink-0">
                            <FiMapPin className="w-6 md:w-7 h-6 md:h-7" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          );
        })()}

        {/* Logistics Tab */}
        {activeTab === 'logistics' && shippingSettings && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-10">
            <div className="bg-white/40 backdrop-blur-md p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] border border-white/60">
              <div className="text-center md:text-right mb-8">
                <h2 className="mb-2 font-heading font-black text-text-primary text-2xl md:text-4xl">اللوجستيات</h2>
                <p className="font-bold text-text-secondary text-sm md:text-base">تحكم في مناطق التوصيل وأسعار الشحن بكل سلاسة</p>
              </div>

              <form onSubmit={handleUpdateShipping} className="space-y-8 md:space-y-12">
                <div className="flex flex-col md:flex-row items-end gap-6 md:gap-12">
                  <div className="space-y-4 w-full md:flex-1">
                    <label className="block font-black text-text-primary text-lg md:text-xl">الحد الأدنى للشحن المجاني</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        value={shippingSettings.freeShippingThreshold}
                        onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: e.target.value })}
                        className="bg-primary/5 py-5 md:py-6 pr-6 md:pr-8 pl-16 md:pl-24 border-none rounded-2xl md:rounded-[2rem] outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary text-2xl md:text-4xl text-right transition-all"
                      />
                      <span className="left-4 md:left-6 absolute bg-primary/10 px-3 md:px-4 py-1.5 md:py-2 rounded-xl font-bold text-primary text-xs md:text-base">ج.م</span>
                    </div>
                    <p className="font-bold text-text-muted text-xs md:text-sm">عندما يتخطى الطالب هذا المبلغ، يصبح الشحن هدية منا</p>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex justify-center items-center gap-3 bg-primary shadow-xl shadow-primary/30 px-8 md:px-12 py-4 md:py-5 rounded-2xl md:rounded-[2rem] w-full md:w-auto font-black text-white text-base md:text-xl"
                  >
                    <FiCheck className="w-5 h-5 md:w-6 md:h-6" /> حفظ التغييرات
                  </motion.button>
                </div>

                <div className="space-y-6 md:space-y-8 pt-8 md:pt-10 border-primary/5 border-t">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="flex items-center gap-3 font-heading font-black text-xl md:text-2xl">
                      <div className="flex justify-center items-center bg-accent/20 rounded-xl w-8 h-8 md:w-10 md:h-10 text-accent"><FiFilter /></div>
                      تخصيص أسعار المحافظات
                    </h3>
                    <motion.button
                      type="button"
                      onClick={addGovernorate}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex justify-center items-center gap-2 bg-[#31605F] hover:bg-[#31605F]/80 p-3 md:px-6 md:py-3 rounded-xl md:rounded-2xl w-full sm:w-auto font-black text-accent text-xs md:text-sm"
                    >
                      <FiPlus /> إضافة منطقة جديدة
                    </motion.button>
                  </div>

                  <div className="gap-4 md:gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {shippingSettings.governorates && shippingSettings.governorates.map((gov, idx) => (
                      <motion.div
                        layout
                        key={`gov-${idx}`}
                        className="group flex flex-col gap-3 bg-gray-50/50 hover:bg-white p-5 md:p-6 border border-transparent hover:border-primary/20 rounded-2xl md:rounded-3xl transition-all shadow-sm"
                      >
                        <input
                          type="text"
                          placeholder="اسم المحافظة"
                          value={gov.name}
                          onChange={(e) => updateGovernorate(idx, 'name', e.target.value)}
                          className="bg-transparent px-2 border-none rounded-none outline-none focus:ring-0 font-black text-base md:text-lg"
                          required
                        />
                        <div className="flex justify-between items-center gap-4">
                          <div className="relative flex-1">
                            <input
                              type="number"
                              placeholder="السعر"
                              value={gov.price}
                              onChange={(e) => updateGovernorate(idx, 'price', e.target.value)}
                              className="bg-primary/5 py-2.5 md:py-3 pr-4 pl-12 md:pl-16 border-none rounded-xl md:rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary text-right"
                              required
                            />
                            <span className="top-1/2 left-3 absolute font-bold text-primary text-[10px] md:text-xs -translate-y-1/2">ج.م</span>
                          </div>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeGovernorate(idx)}
                            className="bg-red-50 hover:bg-red-500 shadow-sm p-3 rounded-xl text-red-500 hover:text-white transition-all"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                    {(!shippingSettings.governorates || shippingSettings.governorates.length === 0) && (
                      <div className="col-span-full opacity-30 p-10 border-2 border-primary/10 border-dashed rounded-[2.5rem] text-center">
                        <p className="font-black text-sm md:text-base">لا توجد مناطق مخصصة بعد. السعر الافتراضي سيعتمد على الأمانات</p>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
        {/* Teachers Management Tab */}
        {activeTab === 'teachers_list' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 md:space-y-12">
            <div className="text-center md:text-right">
              <h2 className="mb-2 font-heading font-black text-text-primary text-2xl md:text-4xl">أسماء مدرسينا</h2>
              <p className="font-bold text-text-secondary text-sm md:text-base">إدارة قائمة المدرسين والأسماء التي تظهر في كتب المنصة</p>
            </div>

            <div className="bg-white/80 shadow-2xl shadow-primary/5 backdrop-blur-3xl p-6 md:p-12 border border-white/80 rounded-3xl md:rounded-[4rem]">
              <div className="flex flex-col md:flex-row items-stretch md:items-end gap-6 md:gap-8 mb-10 md:mb-16">
                <div className="flex-1 space-y-3 md:space-y-4">
                  <label className="block font-black text-text-secondary text-xs md:text-sm uppercase tracking-wider">اسم المدرس الجديد</label>
                  <input
                    type="text"
                    value={teacherNameInput}
                    onChange={(e) => setTeacherNameInput(e.target.value)}
                    placeholder="مثلاً: مستر محمد صلاح..."
                    className="bg-primary/5 px-6 md:px-8 py-4 md:py-5 border-none rounded-2xl md:rounded-[2.5rem] outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary text-base md:text-xl transition-all"
                  />
                </div>
                <div className="flex items-center gap-4 md:flex-col md:shrink-0">
                  <div className="hidden md:block">
                    <label className="block mb-3 font-black text-text-secondary text-sm text-center uppercase">صورة</label>
                  </div>
                  <label className="group relative flex justify-center items-center bg-primary/5 shadow-inner border-2 border-primary/20 hover:border-primary border-dashed rounded-2xl md:rounded-[2rem] w-20 md:w-24 h-20 md:h-24 overflow-hidden transition-all cursor-pointer">
                    {teacherPhotoPreview ? (
                      <img src={teacherPhotoPreview} alt="teacher preview" className="w-full h-full object-cover" />
                    ) : (
                      <FiCamera className="opacity-30 group-hover:opacity-100 w-6 md:w-8 h-6 md:h-8 text-primary" />
                    )}
                    <input type="file" accept="image/*" onChange={handleTeacherPhotoChange} className="hidden" />
                  </label>
                  <div className="md:hidden flex-1">
                    <span className="block mb-1 font-black text-text-secondary text-xs uppercase">صورة تعريفية</span>
                    <span className="font-bold text-[10px] text-text-muted">اضغط لاختيار صورة</span>
                  </div>
                </div>
                <motion.button
                  onClick={handleAddTeacherName}
                  disabled={formLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex justify-center items-center gap-3 bg-primary disabled:opacity-50 shadow-xl shadow-primary/30 px-6 py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] md:h-24 font-black text-white text-base md:text-xl transition-all"
                >
                  {formLoading ? 'جاري الإضافة...' : <><FiPlus className="w-5 h-5 md:w-6 md:h-6" /> إضافة للقائمة</>}
                </motion.button>
              </div>

              <div className="gap-4 md:gap-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {teacherNames.map((teacher, idx) => (
                  <motion.div
                    key={teacher._id || idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -8, scale: 1.01 }}
                    className="group relative bg-white shadow-xl shadow-primary/5 p-5 md:p-8 border border-primary/5 rounded-[2.5rem] md:rounded-[3rem] text-center"
                  >
                    <div className="bg-primary/5 mx-auto mb-4 md:mb-6 p-1 md:p-2 rounded-2xl md:rounded-[2rem] w-20 h-20 md:w-28 md:h-28 overflow-hidden group-hover:rotate-3 transition-transform">
                      {teacher.photo ? (
                        <img src={teacher.photo} alt={teacher.name} className="bg-white rounded-xl md:rounded-[1.5rem] w-full h-full object-cover" />
                      ) : (
                        <div className="flex justify-center items-center bg-white rounded-xl md:rounded-[1.5rem] w-full h-full font-black text-primary/20 text-4xl md:text-6xl">
                          {teacher.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h4 className="mb-4 md:mb-6 font-black text-text-primary group-hover:text-primary text-sm md:text-lg transition-colors leading-tight">{teacher.name}</h4>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteTeacherName(teacher._id)}
                      className="flex justify-center items-center bg-red-50 hover:bg-red-500 shadow-md shadow-red-500/10 mx-auto rounded-xl md:rounded-2xl w-10 h-10 md:w-12 md:h-12 text-red-500 hover:text-white transition-all"
                    >
                      <FiTrash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Coupons Tab Content */}
        {activeTab === 'coupons' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-10">
            <div className="flex md:flex-row flex-col justify-between items-center bg-white/40 backdrop-blur-md p-6 md:p-10 rounded-3xl md:rounded-[2rem] border border-white/60 gap-6">
              <div className="text-center md:text-right">
                <h2 className="mb-2 font-heading font-black text-text-primary text-2xl md:text-4xl">أكواد الخصم</h2>
                <p className="font-bold text-text-secondary text-xs md:text-sm">أنشئ أكواد خصم لتشجيع الطلاب على المذاكرة</p>
              </div>
              <motion.button
                onClick={() => setShowCouponModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-3 bg-primary shadow-xl shadow-primary/30 px-6 md:px-10 py-3.5 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-white w-full md:w-auto text-sm md:text-lg"
              >
                <FiPlus className="w-5 h-5 md:w-7 md:h-7" /> إضافة كوبون جديد
              </motion.button>
            </div>

            <div className="space-y-4">
              {/* Desktop View */}
              <div className="hidden lg:block bg-white/80 shadow-2xl shadow-primary/5 backdrop-blur-2xl border border-white/80 rounded-[3.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-primary/5">
                        <th className="px-10 py-8 font-heading font-black text-text-secondary uppercase">الكود</th>
                        <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">الخصم</th>
                        <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">الحد الأدنى</th>
                        <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">صلاحية العرض</th>
                        <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">الاستخدام</th>
                        <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">الحالة</th>
                        <th className="px-10 py-8 font-heading font-black text-text-secondary text-center uppercase">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {coupons.map((coupon) => (
                        <tr key={coupon._id} className="group hover:bg-primary/[0.02] transition-colors">
                          <td className="px-10 py-8">
                            <div className="inline-block bg-primary/5 group-hover:bg-primary shadow-sm px-5 py-2.5 border border-primary/10 rounded-2xl font-mono font-black text-primary group-hover:text-white text-xl group-hover:scale-110 transition-all">
                              {coupon.code}
                            </div>
                          </td>
                          <td className="px-8 py-8">
                            <span className="bg-accent/30 px-4 py-2 rounded-xl font-black text-text-primary text-lg">
                              {coupon.discountType === 'percentage' ? `${coupon.discountAmount}%` : `${coupon.discountAmount} ج.م`}
                            </span>
                          </td>
                          <td className="px-8 py-8 font-bold text-text-secondary">{coupon.minPurchase} ج.م</td>
                          <td className="px-8 py-8 font-bold">
                            <div className="flex items-center gap-2 text-text-muted">
                              <FiCalendar className="w-4 h-4" />
                              {new Date(coupon.expiryDate).toLocaleDateString('ar-EG')}
                            </div>
                          </td>
                          <td className="px-8 py-8 font-black text-primary">
                            {coupon.usedCount} من {coupon.usageLimit || '∞'}
                          </td>
                          <td className="px-8 py-8">
                            <button
                              onClick={() => handleToggleCoupon(coupon._id)}
                              className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all shadow-sm ${coupon.isActive
                                ? 'bg-green-100 text-green-600 hover:bg-green-500 hover:text-white'
                                : 'bg-red-100 text-red-600 hover:bg-red-500 hover:text-white'
                                }`}
                            >
                              {coupon.isActive ? 'مفعل الآن' : 'متوقف حالياً'}
                            </button>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: -10 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteCoupon(coupon._id)}
                              className="flex justify-center items-center bg-red-50 hover:bg-red-500 shadow-sm m-auto rounded-2xl w-12 h-12 text-red-500 hover:text-white transition-all"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </motion.button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {coupons.map((coupon) => (
                  <motion.div
                    key={coupon._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/60 backdrop-blur-md p-5 border border-white/80 rounded-3xl shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="inline-block bg-primary/5 px-4 py-1.5 border border-primary/20 rounded-xl font-mono font-black text-primary text-lg">
                        {coupon.code}
                      </div>
                      <button
                        onClick={() => handleToggleCoupon(coupon._id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${coupon.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                      >
                        {coupon.isActive ? 'نشط' : 'معطل'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-accent/10 p-3 rounded-2xl">
                        <p className="text-[9px] font-bold text-text-muted mb-0.5 uppercase">الخصم</p>
                        <p className="font-black text-text-primary text-base">{coupon.discountType === 'percentage' ? `${coupon.discountAmount}%` : `${coupon.discountAmount} ج.م`}</p>
                      </div>
                      <div className="bg-primary/5 p-3 rounded-2xl">
                        <p className="text-[9px] font-bold text-text-muted mb-0.5 uppercase">الاستخدام</p>
                        <p className="font-black text-primary text-base">{coupon.usedCount} / {coupon.usageLimit || '∞'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-primary/5">
                      <div className="flex items-center gap-2 text-text-muted text-[10px] font-bold">
                        <FiCalendar className="w-3.5 h-3.5" />
                        انتهاء: {new Date(coupon.expiryDate).toLocaleDateString('ar-EG')}
                      </div>
                      <button onClick={() => handleDeleteCoupon(coupon._id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl active:scale-95 transition-all"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {coupons.length === 0 && (
                <div className="px-10 py-32 text-center bg-white/40 border border-white/60 rounded-[3.5rem]">
                  <div className="flex flex-col items-center gap-6 opacity-30">
                    <FiDollarSign className="w-16 h-16 md:w-24 md:h-24" />
                    <p className="font-black text-xl md:text-2xl">لا توجد محركات خصم حالياً. ابدأ بإضافة الأول!</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CMS Tab Content */}
        {activeTab === 'cms' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <div className="flex md:flex-row flex-col justify-between items-center gap-6">
              <div>
                <h2 className="mb-2 font-heading font-black text-text-primary text-4xl">إدارة محتوى الصفحات</h2>
                <p className="font-bold text-text-secondary">تحكم في نصوص صفحات "من نحن" والأسئلة الشائعة بكل سهولة</p>
              </div>
            </div>

            <div className="gap-8 grid grid-cols-1 md:grid-cols-2">
              {cmsData.map((item, idx) => (
                <motion.div
                  key={item.key || item._id || idx}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group bg-white/80 shadow-2xl p-10 border border-white/80 rounded-[3rem]"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex justify-center items-center bg-primary/10 rounded-2xl w-16 h-16 text-primary">
                      <FiList className="w-8 h-8" />
                    </div>
                    <button
                      onClick={() => {
                        setEditingCms(item);
                        setCmsForm({ key: item.key, title: item.title, content: item.content });
                        setCmsFile(null);
                        setCmsPreview(item.content?.image || null);
                      }}
                      className="bg-primary hover:bg-primary-dark shadow-primary/20 shadow-xl px-8 py-3 rounded-2xl font-black text-white text-sm transition-all"
                    >
                      تعديل البيانات
                    </button>
                  </div>
                  <h3 className="mb-2 font-black text-text-primary text-2xl">{item.title}</h3>
                  <p className="font-bold text-[#8FA7A6] text-sm italic">معرف النظام: {item.key}</p>
                </motion.div>
              ))}

              {cmsData.length === 0 && (
                <div className="md:col-span-2 opacity-30 py-20 text-center">
                  <FiList className="mx-auto mb-4 w-20 h-20" />
                  <p className="font-black text-xl">لا يوجد محتوى مدرج حالياً</p>
                </div>
              )}
            </div>

            {/* Content Editor Panel */}
            {editingCms && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-2xl mt-12 p-12 border border-primary/20 rounded-[4rem]"
              >
                <div className="flex justify-between items-center mb-12 pb-8 border-primary/5 border-b">
                  <h2 className="font-heading font-black text-text-primary text-3xl">تعديل: {editingCms.title}</h2>
                  <button onClick={() => setEditingCms(null)} className="hover:bg-red-50 p-2.5 rounded-2xl text-red-500 transition-all">
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-10">
                  {editingCms.key === 'about-us' && (
                    <div className="gap-10 grid grid-cols-1 md:grid-cols-3">
                      <div className="md:col-span-1">
                        <label className="block mb-4 font-black text-text-secondary text-sm uppercase">العنوان الرئيسي</label>
                        <input type="text" value={cmsForm.title} onChange={(e) => setCmsForm({ ...cmsForm, title: e.target.value })} className="bg-primary/5 px-8 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary text-xl" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block mb-4 font-black text-text-secondary text-sm uppercase">العنوان الفرعي (Subtitle)</label>
                        <input type="text" value={cmsForm.content?.subtitle || ''} onChange={(e) => setCmsForm({ ...cmsForm, content: { ...cmsForm.content, subtitle: e.target.value } })} className="bg-primary/5 px-8 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold text-text-secondary text-lg" />
                      </div>


                      <div className="md:col-span-3 pb-6 border-primary/10 border-b">
                        <div className="flex justify-between items-center mb-8">
                          <h4 className="font-black text-primary text-xl">بطاقات المميزات (Vision, Values, Mission)</h4>
                          <button
                            onClick={() => {
                              const cards = [...(cmsForm.content?.featureCards || [])];
                              cards.push({ icon: 'FiTarget', title: 'عنوان جديد', description: 'وصف قصير للبطاقة...' });
                              setCmsForm({ ...cmsForm, content: { ...cmsForm.content, featureCards: cards } });
                            }}
                            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 px-6 py-2 rounded-xl font-black text-primary text-sm transition-all"
                          >
                            <FiPlus /> إضافة بطاقة مميزات
                          </button>
                        </div>

                        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
                          {(cmsForm.content?.featureCards || []).map((card, idx) => (
                            <div key={idx} className="group relative bg-primary/5 p-6 border border-primary/10 rounded-[2rem]">
                              <button
                                onClick={() => {
                                  const cards = cmsForm.content.featureCards.filter((_, i) => i !== idx);
                                  setCmsForm({ ...cmsForm, content: { ...cmsForm.content, featureCards: cards } });
                                }}
                                className="-top-3 -left-3 absolute bg-white opacity-0 group-hover:opacity-100 shadow-xl p-2 rounded-full text-red-500 transition-opacity"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>

                              <div className="space-y-4">
                                <div>
                                  <label className="block mb-2 font-black text-[10px] text-text-secondary text-right uppercase">الأيقونة</label>
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() => setOpenIconPicker(openIconPicker === `feat-${idx}` ? null : `feat-${idx}`)}
                                      className="flex items-center gap-3 bg-white hover:bg-primary/5 p-2 border border-primary/5 rounded-2xl w-full transition-all"
                                    >
                                      <div className="flex justify-center items-center bg-primary/10 rounded-xl w-10 h-10 text-primary">
                                        {(() => {
                                          const Icon = getIcon(card.icon || 'FiTarget');
                                          return <Icon className="w-5 h-5" />;
                                        })()}
                                      </div>
                                      <span className="flex-1 font-black text-primary text-xs text-right">{card.icon}</span>
                                      <FiChevronDown className={`w-4 h-4 text-primary transition-transform ${openIconPicker === `feat-${idx}` ? 'rotate-180' : ''}`} />
                                    </button>

                                    {openIconPicker === `feat-${idx}` && (
                                      <>
                                        <div className="z-[90] fixed inset-0" onClick={() => setOpenIconPicker(null)}></div>
                                        <div className="right-0 bottom-full z-[100] absolute bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] mb-2 p-4 border border-primary/10 rounded-[2rem] w-[280px] max-h-[300px] overflow-y-auto glass-effect scrollbar-hide">
                                          <div className="gap-2 grid grid-cols-4">
                                            {[
                                              'FiUsers', 'FiBookOpen', 'FiAward', 'FiActivity', 'FiSmile', 'FiHeart',
                                              'FiTrendingUp', 'FiDollarSign', 'FiPackage', 'FiZap', 'FiStar', 'FiCpu',
                                              'FiGrid', 'FiLayers', 'FiTarget', 'FiFeather', 'FiFlag', 'FiHome',
                                              'FiInfo', 'FiKey', 'FiLaptop', 'FiLink', 'FiLock', 'FiMap', 'FiMapPin',
                                              'FiPhone', 'FiPlay', 'FiPrinter', 'FiSearch', 'FiSend', 'FiSettings',
                                              'FiShield', 'FiShoppingCart', 'FiSmartphone', 'FiTag', 'FiThumbsUp',
                                              'FiTool', 'FiTruck', 'FiVideo', 'FiAnchor', 'FiBell', 'FiBox', 'FiBriefcase',
                                              'FiCamera', 'FiCheckCircle', 'FiClock', 'FiCloud', 'FiCompass', 'FiCreditCard',
                                              'FiDownload', 'FiEdit', 'FiEye', 'FiGift', 'FiGlobe', 'FiHelpCircle'
                                            ].sort().map(ic => {
                                              const Icon = getIcon(ic);
                                              return (
                                                <button
                                                  key={ic}
                                                  type="button"
                                                  onClick={() => {
                                                    const cards = [...cmsForm.content.featureCards];
                                                    cards[idx].icon = ic;
                                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, featureCards: cards } });
                                                    setOpenIconPicker(null);
                                                  }}
                                                  className={`flex items-center justify-center p-3 rounded-xl transition-all ${card.icon === ic ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
                                                  title={ic}
                                                >
                                                  <Icon className="w-5 h-5" />
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="block mb-2 font-black text-[10px] text-text-secondary uppercase">العنوان</label>
                                  <input
                                    type="text"
                                    value={card.title}
                                    onChange={(e) => {
                                      const cards = [...cmsForm.content.featureCards];
                                      cards[idx].title = e.target.value;
                                      setCmsForm({ ...cmsForm, content: { ...cmsForm.content, featureCards: cards } });
                                    }}
                                    className="bg-white px-4 py-2 border-none rounded-xl w-full font-black text-primary"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-2 font-black text-[10px] text-text-secondary uppercase">الوصف</label>
                                  <textarea
                                    value={card.description}
                                    onChange={(e) => {
                                      const cards = [...cmsForm.content.featureCards];
                                      cards[idx].description = e.target.value;
                                      setCmsForm({ ...cmsForm, content: { ...cmsForm.content, featureCards: cards } });
                                    }}
                                    className="bg-white px-4 py-3 border-none rounded-xl w-full h-24 font-bold text-text-secondary text-xs resize-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block mb-4 font-black text-text-secondary text-sm uppercase">قصتنا (Story)</label>
                        <textarea value={cmsForm.content?.story || ''} onChange={(e) => setCmsForm({ ...cmsForm, content: { ...cmsForm.content, story: e.target.value } })} className="bg-primary/5 p-6 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full h-48 font-medium leading-relaxed resize-none" />
                      </div>

                      <div className="md:col-span-3 pb-6 border-primary/10 border-b">
                        <div className="flex justify-between items-center mb-8">
                          <h4 className="font-black text-primary text-xl">بطاقات الإحصائيات (Stats Cards)</h4>
                          <button
                            onClick={() => {
                              const cards = [...(cmsForm.content?.statsCards || [])];
                              cards.push({ icon: 'FiUsers', title: '0', label: 'عنوان فرعي' });
                              setCmsForm({ ...cmsForm, content: { ...cmsForm.content, statsCards: cards } });
                            }}
                            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 px-6 py-2 rounded-xl font-black text-primary text-sm transition-all"
                          >
                            <FiPlus /> إضافة بطاقة جديدة
                          </button>
                        </div>

                        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                          {(cmsForm.content?.statsCards || []).map((card, idx) => (
                            <div key={idx} className="group relative bg-primary/5 p-6 border border-primary/10 rounded-[2rem]">
                              <button
                                onClick={() => {
                                  const cards = cmsForm.content.statsCards.filter((_, i) => i !== idx);
                                  setCmsForm({ ...cmsForm, content: { ...cmsForm.content, statsCards: cards } });
                                }}
                                className="-top-3 -left-3 absolute bg-white opacity-0 group-hover:opacity-100 shadow-xl p-2 rounded-full text-red-500 transition-opacity"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>

                              <div className="space-y-4">
                                <div>
                                  <label className="block mb-2 font-black text-[10px] text-text-secondary text-right uppercase">الأيقونة</label>
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() => setOpenIconPicker(openIconPicker === idx ? null : idx)}
                                      className="flex items-center gap-3 bg-white hover:bg-primary/5 p-2 border border-primary/5 rounded-2xl w-full transition-all"
                                    >
                                      <div className="flex justify-center items-center bg-primary/10 rounded-xl w-10 h-10 text-primary">
                                        {(() => {
                                          const Icon = getIcon(card.icon || 'FiUsers');
                                          return <Icon className="w-5 h-5" />;
                                        })()}
                                      </div>
                                      <span className="flex-1 font-black text-primary text-xs text-right">{card.icon || 'اختر أيقونة'}</span>
                                      <FiChevronDown className={`w-4 h-4 text-primary transition-transform ${openIconPicker === idx ? 'rotate-180' : ''}`} />
                                    </button>

                                    {openIconPicker === idx && (
                                      <>
                                        <div className="z-[90] fixed inset-0" onClick={() => setOpenIconPicker(null)}></div>
                                        <div className="right-0 bottom-full z-[100] absolute bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] mb-2 p-4 border border-primary/10 rounded-[2rem] w-[280px] max-h-[300px] overflow-y-auto glass-effect scrollbar-hide">
                                          <div className="gap-2 grid grid-cols-4">
                                            {[
                                              'FiUsers', 'FiBookOpen', 'FiAward', 'FiActivity', 'FiSmile', 'FiHeart',
                                              'FiTrendingUp', 'FiDollarSign', 'FiPackage', 'FiZap', 'FiStar', 'FiCpu',
                                              'FiGrid', 'FiLayers', 'FiTarget', 'FiFeather', 'FiFlag', 'FiHome',
                                              'FiInfo', 'FiKey', 'FiLaptop', 'FiLink', 'FiLock', 'FiMap', 'FiMapPin',
                                              'FiPhone', 'FiPlay', 'FiPrinter', 'FiSearch', 'FiSend', 'FiSettings',
                                              'FiShield', 'FiShoppingCart', 'FiSmartphone', 'FiTag', 'FiThumbsUp',
                                              'FiTool', 'FiTruck', 'FiVideo', 'FiAnchor', 'FiBell', 'FiBox', 'FiBriefcase',
                                              'FiCamera', 'FiCheckCircle', 'FiClock', 'FiCloud', 'FiCompass', 'FiCreditCard',
                                              'FiDownload', 'FiEdit', 'FiEye', 'FiGift', 'FiGlobe', 'FiHelpCircle'
                                            ].sort().map(ic => {
                                              const Icon = getIcon(ic);
                                              return (
                                                <button
                                                  key={ic}
                                                  type="button"
                                                  onClick={() => {
                                                    const cards = [...cmsForm.content.statsCards];
                                                    cards[idx].icon = ic;
                                                    setCmsForm({ ...cmsForm, content: { ...cmsForm.content, statsCards: cards } });
                                                    setOpenIconPicker(null);
                                                  }}
                                                  className={`flex items-center justify-center p-3 rounded-xl transition-all ${card.icon === ic ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
                                                  title={ic}
                                                >
                                                  <Icon className="w-5 h-5" />
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="block mb-2 font-black text-[10px] text-text-secondary uppercase">العنوان (Title)</label>
                                  <input
                                    type="text"
                                    placeholder="+10k"
                                    value={card.title}
                                    onChange={(e) => {
                                      const cards = [...cmsForm.content.statsCards];
                                      cards[idx].title = e.target.value;
                                      setCmsForm({ ...cmsForm, content: { ...cmsForm.content, statsCards: cards } });
                                    }}
                                    className="bg-white px-4 py-2 border-none rounded-xl w-full font-black text-primary text-center"
                                  />
                                </div>
                                <div>
                                  <label className="block mb-2 font-black text-[10px] text-text-secondary uppercase">التسمية (Subtitle)</label>
                                  <input
                                    type="text"
                                    placeholder="طالب سعيد"
                                    value={card.label}
                                    onChange={(e) => {
                                      const cards = [...cmsForm.content.statsCards];
                                      cards[idx].label = e.target.value;
                                      setCmsForm({ ...cmsForm, content: { ...cmsForm.content, statsCards: cards } });
                                    }}
                                    className="bg-white px-4 py-2 border-none rounded-xl w-full font-bold text-text-secondary text-xs text-center"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <label className="flex items-center gap-3 bg-primary/5 mb-4 p-4 rounded-2xl cursor-pointer">
                          <input type="checkbox" className="w-5 h-5 accent-primary" checked={cmsForm.content?.showTeachers || false} onChange={(e) => setCmsForm({ ...cmsForm, content: { ...cmsForm.content, showTeachers: e.target.checked } })} />
                          <span className="font-black text-text-primary">إظهار فريق المدرسين</span>
                        </label>
                        <label className="flex items-center gap-3 bg-primary/5 p-4 rounded-2xl cursor-pointer">
                          <input type="checkbox" className="w-5 h-5 accent-primary" checked={cmsForm.content?.showCTA || false} onChange={(e) => setCmsForm({ ...cmsForm, content: { ...cmsForm.content, showCTA: e.target.checked } })} />
                          <span className="font-black text-text-primary">إظهار قسم (Call to Action)</span>
                        </label>
                      </div>

                      <div className="md:col-span-2">
                        {cmsForm.content?.showCTA && (
                          <div className="gap-4 grid grid-cols-1 md:grid-cols-3 bg-bg shadow-inner p-6 border border-primary/10 rounded-3xl">
                            <div className="md:col-span-3">
                              <label className="block mb-2 font-black text-text-secondary text-xs uppercase">عنوان القسم (CTA Title)</label>
                              <input type="text" value={cmsForm.content?.ctaTitle || ''} onChange={(e) => setCmsForm({ ...cmsForm, content: { ...cmsForm.content, ctaTitle: e.target.value } })} className="bg-white px-4 py-2 border-none rounded-xl w-full font-bold" />
                            </div>
                            <div>
                              <label className="block mb-2 font-black text-text-secondary text-xs uppercase">نص الزر</label>
                              <input type="text" value={cmsForm.content?.ctaButtonText || ''} onChange={(e) => setCmsForm({ ...cmsForm, content: { ...cmsForm.content, ctaButtonText: e.target.value } })} className="bg-white px-4 py-2 border-none rounded-xl w-full font-bold" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block mb-2 font-black text-text-secondary text-xs uppercase">رابط الزر (أو صفحة)</label>
                              <input type="text" value={cmsForm.content?.ctaLink || ''} onChange={(e) => setCmsForm({ ...cmsForm, content: { ...cmsForm.content, ctaLink: e.target.value } })} className="bg-white px-4 py-2 border-none rounded-xl w-full font-bold" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-3">
                        <label className="block mb-4 font-black text-text-secondary text-sm uppercase">صورة القسم (تعرض بعرض كامل)</label>
                        <label className="group relative flex flex-col justify-center items-center bg-primary/5 border-2 border-primary/20 hover:border-primary border-dashed rounded-[2rem] w-full h-[300px] overflow-hidden transition-all cursor-pointer">
                          {cmsPreview ? (
                            <>
                              <img src={cmsPreview} alt="preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 flex flex-col justify-center items-center bg-primary/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all">
                                <FiImage className="mb-2 w-10 h-10 text-white" />
                                <span className="font-black text-white">تغيير الصورة</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <FiUpload className="opacity-30 group-hover:opacity-100 mb-4 w-10 h-10 text-primary transition-all" />
                              <span className="font-black text-text-muted">اختر صورة عريضة للصفحة</span>
                            </>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setCmsFile(file);
                              setCmsPreview(URL.createObjectURL(file));
                            }
                          }} className="hidden" />
                        </label>
                      </div>
                    </div>
                  ) || ''}

                  {editingCms.key === 'faq' && (
                    <div className="space-y-8">
                      <div className="mb-10">
                        <label className="block mb-4 font-black text-text-secondary text-sm uppercase">عنوان الصفحة</label>
                        <input type="text" value={cmsForm.title} onChange={(e) => setCmsForm({ ...cmsForm, title: e.target.value })} className="bg-primary/5 px-10 py-5 border-none rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary text-2xl" />
                      </div>
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-heading font-black text-text-primary text-2xl">الأسئلة والأجوبة</h4>
                        <button
                          onClick={() => {
                            const newList = Array.isArray(cmsForm.content) ? [...cmsForm.content] : [];
                            newList.push({ question: '', answer: '' });
                            setCmsForm({ ...cmsForm, content: newList });
                          }}
                          className="flex items-center gap-2 bg-emerald-500 shadow-emerald-500/20 shadow-xl px-8 py-3 rounded-2xl font-black text-white hover:scale-105 transition-all"
                        >
                          <FiPlus className="w-5 h-5" /> إضافة سؤال جديد
                        </button>
                      </div>
                      <div className="space-y-8 px-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        {(Array.isArray(cmsForm.content) ? cmsForm.content : []).map((faq, idx) => (
                          <div key={idx} className="group/faq relative bg-primary/5 p-10 border border-primary/10 rounded-[2.5rem]">
                            <button
                              onClick={() => {
                                const newList = cmsForm.content.filter((_, i) => i !== idx);
                                setCmsForm({ ...cmsForm, content: newList });
                              }}
                              className="top-6 left-6 absolute bg-white opacity-0 group-hover/faq:opacity-100 shadow-xl p-3 rounded-2xl text-red-500 transition-opacity"
                            >
                              <FiTrash2 className="w-6 h-6" />
                            </button>
                            <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                <div className="bg-primary/20 p-2 rounded-xl font-black text-primary">؟</div>
                                <input
                                  placeholder="ماذا يدور في ذهن الطالب؟ (السؤال)"
                                  value={faq.question}
                                  onChange={(e) => {
                                    const newList = [...cmsForm.content];
                                    newList[idx].question = e.target.value;
                                    setCmsForm({ ...cmsForm, content: newList });
                                  }}
                                  className="bg-white px-8 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-lg"
                                />
                              </div>
                              <textarea
                                placeholder="الإجابة الشافية والوافية..."
                                value={faq.answer}
                                onChange={(e) => {
                                  const newList = [...cmsForm.content];
                                  newList[idx].answer = e.target.value;
                                  setCmsForm({ ...cmsForm, content: newList });
                                }}
                                className="bg-white p-8 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full h-32 font-medium leading-relaxed resize-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {editingCms.key === 'footer-settings' && (
                    <div className="gap-10 grid grid-cols-1 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="block mb-4 font-black text-text-secondary text-sm uppercase">اسم المطوّر والشركة</label>
                        <div className="flex gap-4">
                          <input placeholder="الاسم (مثلاً: Moataz)" type="text" value={cmsForm.content?.developerName || ''} onChange={(e) => setCmsForm({ ...cmsForm, content: { ...cmsForm.content, developerName: e.target.value } })} className="bg-primary/5 px-8 py-5 border-none rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary text-xl" />
                          <input placeholder="رابط الموقع الخاص بك" type="text" value={cmsForm.content?.developerLink || ''} onChange={(e) => setCmsForm({ ...cmsForm, content: { ...cmsForm.content, developerLink: e.target.value } })} className="bg-primary/5 px-8 py-5 border-none rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary text-xl" />
                        </div>
                      </div>
                      <div>
                        <label className="block mb-4 font-black text-text-secondary text-sm uppercase">رابط فيسبوك</label>
                        <input type="text" value={cmsForm.content?.facebook || ''} onChange={(e) => setCmsForm({ ...cmsForm, content: { ...cmsForm.content, facebook: e.target.value } })} className="bg-primary/5 px-8 py-5 border-none rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary text-xl" />
                      </div>
                      <div>
                        <label className="block mb-4 font-black text-text-secondary text-sm uppercase">رابط انستجرام</label>
                        <input type="text" value={cmsForm.content?.instagram || ''} onChange={(e) => setCmsForm({ ...cmsForm, content: { ...cmsForm.content, instagram: e.target.value } })} className="bg-primary/5 px-8 py-5 border-none rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary text-xl" />
                      </div>
                      <div>
                        <label className="block mb-4 font-black text-text-secondary text-sm uppercase">رابط واتساب</label>
                        <input type="text" value={cmsForm.content?.whatsapp || ''} onChange={(e) => setCmsForm({ ...cmsForm, content: { ...cmsForm.content, whatsapp: e.target.value } })} className="bg-primary/5 px-8 py-5 border-none rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary text-xl" />
                      </div>
                      <div>
                        <label className="block mb-4 font-black text-text-secondary text-sm uppercase">رابط تيك توك</label>
                        <input type="text" value={cmsForm.content?.tiktok || ''} onChange={(e) => setCmsForm({ ...cmsForm, content: { ...cmsForm.content, tiktok: e.target.value } })} className="bg-primary/5 px-8 py-5 border-none rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary text-xl" />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-6 bg-primary/5 mt-16 p-8 rounded-[3rem]">
                    <button onClick={() => setEditingCms(null)} className="px-14 py-5 font-black text-text-secondary hover:text-red-500 uppercase transition-colors">إلغاء التعديل</button>
                    <button
                      onClick={async () => {
                        try {
                          setFormLoading(true);

                          const formData = new FormData();
                          formData.append('title', cmsForm.title);
                          formData.append('content', JSON.stringify(cmsForm.content));
                          if (cmsFile) {
                            formData.append('image', cmsFile);
                          }

                          await api.put(`/cms/${cmsForm.key}`, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                            timeout: 0 // Disable timeout for large uploads
                          });

                          toast.success('تم تحديث المحتوى بنجاح! الرؤية الآن واضحة للجميع');
                          setEditingCms(null);
                          fetchCms();
                        } catch (err) {
                          toast.error('حدث عائق أثناء الحفظ، جرب مرة أخرى');
                        } finally {
                          setFormLoading(false);
                        }
                      }}
                      disabled={formLoading}
                      className="bg-primary shadow-2xl shadow-primary/30 px-20 py-5 rounded-[2rem] font-black text-white text-xl transition-all"
                    >
                      {formLoading ? 'جاري تثبيت البيانات...' : 'حفظ التعديلات النهائية'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Categories Tab Content */}
        {activeTab === 'categories' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-10">
            <div className="flex md:flex-row flex-col justify-between items-center bg-white/40 backdrop-blur-md p-6 md:p-8 rounded-3xl md:rounded-[2rem] border border-white/60 gap-6">
              <div className="text-center md:text-right">
                <h2 className="mb-1 font-heading font-black text-text-primary text-2xl md:text-4xl">المكتبة والمواد</h2>
                <p className="font-bold text-text-secondary text-xs md:text-sm">تصنيف الكتب والمواد الدراسية (رياضيات، كيمياء.. إلخ)</p>
              </div>
              <motion.button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', slug: '', icon: 'FaBook', color: '#31605F', order: 0, isActive: true, categoryType: 'book' });
                  setShowCategoryModal(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-3 bg-primary shadow-xl shadow-primary/30 px-6 md:px-10 py-3.5 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-white w-full md:w-auto text-sm md:text-lg"
              >
                <FiPlus className="w-5 h-5 md:w-7 md:h-7" /> إضافة مادة جديدة
              </motion.button>
            </div>

            <div className="bg-white/80 shadow-2xl shadow-primary/5 backdrop-blur-2xl border border-white/80 rounded-[3.5rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-primary/5">
                      <th className="px-10 py-8 font-heading font-black text-text-secondary uppercase">الأيقونة</th>
                      <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">اسم المادة</th>
                      <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">الترتيب</th>
                      <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">الحالة</th>
                      <th className="px-10 py-8 font-heading font-black text-text-secondary text-center uppercase">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {categories.filter(c => c.categoryType === 'book' || !c.categoryType).map((cat, idx) => (
                      <tr key={cat._id || idx} className="group hover:bg-primary/[0.02] transition-colors">
                        <td className="px-10 py-8">
                          <div className="flex justify-center items-center bg-primary/10 rounded-2xl w-14 h-14 font-black text-primary text-2xl" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                            {(() => {
                              const Icon = getIcon(cat.icon);
                              return <Icon className="w-7 h-7" />;
                            })()}
                          </div>
                        </td>
                        <td className="px-8 py-8 font-heading font-black text-text-primary text-lg">{cat.name}</td>
                        <td className="px-8 py-8 font-black text-primary text-lg">{cat.order}</td>
                        <td className="px-8 py-8">
                          <span className={`px-4 py-2 rounded-xl text-xs font-black ${cat.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {cat.isActive ? 'ظاهرة' : 'مخفية'}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-center">
                          <div className="flex justify-center items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setEditingCategory(cat);
                                setCategoryForm({ ...cat, categoryType: 'book' });
                                setShowCategoryModal(true);
                              }}
                              className="flex justify-center items-center bg-primary/5 hover:bg-primary rounded-2xl w-11 h-11 text-primary hover:text-white transition-all"
                            >
                              <FiEdit className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: -10 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteCategory(cat._id)}
                              className="flex justify-center items-center bg-red-50 hover:bg-red-500 rounded-2xl w-11 h-11 text-red-500 hover:text-white transition-all"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden space-y-4">
              {categories.filter(c => c.categoryType === 'book' || !c.categoryType).map((cat, idx) => (
                <div key={cat._id || idx} className="bg-white/60 backdrop-blur-md p-5 border border-white/80 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="flex justify-center items-center rounded-2xl w-14 h-14 shrink-0" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                    {(() => {
                      const Icon = getIcon(cat.icon);
                      return <Icon className="w-7 h-7" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-text-primary text-base mb-0.5 truncate">{cat.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-muted text-[10px]">ترتيب: {cat.order}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${cat.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {cat.isActive ? 'ظاهرة' : 'مخفية'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => { setEditingCategory(cat); setCategoryForm({ ...cat, categoryType: 'book' }); setShowCategoryModal(true); }} className="p-2.5 bg-primary/5 text-primary rounded-xl active:scale-95 transition-all"><FiEdit className="w-5 h-5" /></button>
                    <button onClick={() => handleDeleteCategory(cat._id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl active:scale-95 transition-all"><FiTrash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Store Categories Tab Content */}
        {activeTab === 'store_categories' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-10">
            <div className="flex md:flex-row flex-col justify-between items-center bg-white/40 backdrop-blur-md p-6 md:p-8 rounded-3xl md:rounded-[2rem] border border-white/60 gap-6">
              <div className="text-center md:text-right">
                <h2 className="mb-1 font-heading font-black text-text-primary text-2xl md:text-4xl">أقسام المتجر</h2>
                <p className="font-bold text-text-secondary text-xs md:text-sm">إدارة أنواع المنتجات (مجات، نوت بوك، أقلام.. إلخ)</p>
              </div>
              <motion.button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: '', slug: '', icon: 'FiShoppingCart', color: '#456F6E', order: 0, isActive: true, categoryType: 'store' });
                  setShowCategoryModal(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-3 bg-[#456F6E] shadow-xl shadow-[#456F6E]/30 px-6 md:px-10 py-3.5 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-white w-full md:w-auto text-sm md:text-lg"
              >
                <FiPlus className="w-5 h-5 md:w-7 md:h-7" /> إضافة قسم للمتجر
              </motion.button>
            </div>

            <div className="space-y-4">
              {/* Desktop View */}
              <div className="hidden lg:block bg-white/80 shadow-2xl shadow-primary/5 backdrop-blur-2xl border border-white/80 rounded-[3.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-[#456F6E]/5">
                        <th className="px-10 py-8 font-heading font-black text-text-secondary uppercase">الأيقونة</th>
                        <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">اسم القسم</th>
                        <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">الترتيب</th>
                        <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">الحالة</th>
                        <th className="px-10 py-8 font-heading font-black text-text-secondary text-center uppercase">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {categories.filter(c => c.categoryType === 'store').map((cat, idx) => (
                        <tr key={cat._id || idx} className="group hover:bg-[#456F6E]/[0.02] transition-colors">
                          <td className="px-10 py-8">
                            <div className="flex justify-center items-center bg-[#456F6E]/10 rounded-2xl w-14 h-14 font-black transition-colors" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                              {(() => {
                                const Icon = getIcon(cat.icon);
                                return <Icon className="w-7 h-7" />;
                              })()}
                            </div>
                          </td>
                          <td className="px-8 py-8 font-heading font-black text-text-primary text-lg">{cat.name}</td>
                          <td className="px-8 py-8 font-black text-[#456F6E] text-lg">{cat.order}</td>
                          <td className="px-8 py-8">
                            <span className={`px-4 py-2 rounded-xl text-xs font-black ${cat.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {cat.isActive ? 'نشط' : 'مخفي'}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <div className="flex justify-center items-center gap-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setCategoryForm({ ...cat, categoryType: 'store' });
                                  setShowCategoryModal(true);
                                }}
                                className="flex justify-center items-center bg-[#456F6E]/5 hover:bg-[#456F6E] rounded-2xl w-11 h-11 text-[#456F6E] hover:text-white transition-all"
                              >
                                <FiEdit className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1, rotate: -10 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteCategory(cat._id)}
                                className="flex justify-center items-center bg-red-50 hover:bg-red-500 rounded-2xl w-11 h-11 text-red-500 hover:text-white transition-all"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View */}
              <div className="lg:hidden space-y-4">
                {categories.filter(c => c.categoryType === 'store').map((cat, idx) => (
                  <div key={cat._id || idx} className="bg-white/60 backdrop-blur-md p-5 border border-white/80 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="flex justify-center items-center rounded-2xl w-14 h-14 shrink-0" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                      {(() => {
                        const Icon = getIcon(cat.icon);
                        return <Icon className="w-7 h-7" />;
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-text-primary text-base mb-0.5 truncate">{cat.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-muted text-[10px]">ترتيب: {cat.order}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${cat.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {cat.isActive ? 'نشط' : 'مخفي'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => { setEditingCategory(cat); setCategoryForm({ ...cat, categoryType: 'store' }); setShowCategoryModal(true); }} className="p-2.5 bg-[#456F6E]/5 text-[#456F6E] rounded-xl active:scale-95 transition-all"><FiEdit className="w-5 h-5" /></button>
                      <button onClick={() => handleDeleteCategory(cat._id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl active:scale-95 transition-all"><FiTrash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Grades Tab Content */}
        {activeTab === 'grades' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-10">
            <div className="flex md:flex-row flex-col justify-between items-center bg-white/40 backdrop-blur-md p-6 md:p-8 rounded-3xl md:rounded-[2rem] border border-white/60 gap-6">
              <div className="text-center md:text-right">
                <h2 className="mb-1 font-heading font-black text-text-primary text-2xl md:text-4xl">الصفوف الدراسية</h2>
                <p className="font-bold text-text-secondary text-xs md:text-sm">إدارة قائمة الصفوف والمراحل الدراسية المعروضة في الموقع</p>
              </div>
              <motion.button
                onClick={openAddGradeModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-3 bg-primary shadow-xl shadow-primary/30 px-6 md:px-10 py-3.5 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-white w-full md:w-auto text-sm md:text-lg"
              >
                <FiPlus className="w-5 h-5 md:w-7 md:h-7" /> إضافة صف جديد
              </motion.button>
            </div>

            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden lg:block bg-white/80 shadow-2xl shadow-primary/5 backdrop-blur-2xl border border-white/80 rounded-[3.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-primary/5">
                        <th className="px-10 py-8 font-heading font-black text-text-secondary uppercase">اسم الصف</th>
                        <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">الترتيب</th>
                        <th className="px-8 py-8 font-heading font-black text-text-secondary uppercase">الحالة</th>
                        <th className="px-10 py-8 font-heading font-black text-text-secondary text-center uppercase">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {grades.map((grade, idx) => (
                        <tr key={grade._id || idx} className="group hover:bg-primary/[0.02] transition-colors">
                          <td className="px-10 py-8 font-heading font-black text-text-primary text-lg">{grade.name}</td>
                          <td className="px-8 py-8 font-black text-primary text-lg">{grade.order}</td>
                          <td className="px-8 py-8">
                            <span className={`px-4 py-2 rounded-xl text-xs font-black ${grade.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {grade.isActive ? 'مفعل' : 'مخفي'}
                            </span>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <div className="flex justify-center items-center gap-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openEditGradeModal(grade)}
                                className="flex justify-center items-center bg-primary/5 hover:bg-primary rounded-2xl w-11 h-11 text-primary hover:text-white transition-all"
                              >
                                <FiEdit className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1, rotate: -10 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteGrade(grade._id)}
                                className="flex justify-center items-center bg-red-50 hover:bg-red-500 rounded-2xl w-11 h-11 text-red-500 hover:text-white transition-all"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {grades.map((grade, idx) => (
                  <div key={grade._id || idx} className="bg-white/60 backdrop-blur-md p-5 border border-white/80 rounded-3xl shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-text-primary text-lg mb-1">{grade.name}</h3>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary text-xs">ترتيب: {grade.order}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${grade.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {grade.isActive ? 'مفعل' : 'مخفي'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditGradeModal(grade)} className="p-3 bg-primary/5 text-primary rounded-xl transition-all active:scale-95"><FiEdit className="w-5 h-5" /></button>
                      <button onClick={() => handleDeleteGrade(grade._id)} className="p-3 bg-red-50 text-red-500 rounded-xl transition-all active:scale-95"><FiTrash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {grades.length === 0 && (
                <div className="bg-white/40 p-20 rounded-[2.5rem] text-center border border-white/60">
                  <p className="opacity-30 font-bold italic text-lg">لا توجد صفوف مضافة بعد.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === 'announcements' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-10">
            {/* Header section - Responsive */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white/40 backdrop-blur-md p-6 md:p-8 rounded-3xl md:rounded-[2rem] border border-white/60">
              <div className="space-y-1">
                <h2 className="font-heading font-black text-primary text-2xl md:text-3xl">الرسائل والإعلانات</h2>
                <p className="text-text-muted text-xs md:text-sm font-bold">إدارة رسائل الشريط العلوي والإعلانات الترويجية</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingAnnouncement(null);
                  setAnnouncementForm({ text: '', link: '', isActive: true, priority: 0, displayType: 'static', icon: 'FiAlertCircle' });
                  setShowAnnouncementModal(true);
                }}
                className="flex items-center justify-center gap-3 bg-primary shadow-xl shadow-primary/30 px-6 md:px-8 py-3.5 md:py-4 rounded-2xl w-full sm:w-auto font-heading font-black text-white transition-all text-sm md:text-base"
              >
                <FiPlus className="w-5 h-5 md:w-6 md:h-6" />
                <span>إضافة إعلان جديد</span>
              </motion.button>
            </div>

            {/* Content section - Desktop Table / Mobile Cards */}
            <div className="space-y-4">
              {/* Desktop Table - Hidden on tiny screens */}
              <div className="hidden lg:block bg-white/40 backdrop-blur-md border border-white/60 shadow-xl rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-primary/5">
                        <th className="px-10 py-6 font-heading font-black text-text-secondary uppercase">محتوى الرسالة</th>
                        <th className="px-8 py-6 font-heading font-black text-text-secondary uppercase">نوع العرض</th>
                        <th className="px-8 py-6 font-heading font-black text-text-secondary uppercase">الحالة</th>
                        <th className="px-10 py-6 font-heading font-black text-text-secondary text-center uppercase">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {announcements.map((ann, idx) => (
                        <tr key={ann._id || idx} className="group hover:bg-primary/[0.02] transition-colors">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="flex justify-center items-center bg-primary/10 rounded-xl min-w-[40px] h-10 text-primary">
                                {(() => {
                                  const Icon = getIcon(ann.icon || 'FiAlertCircle');
                                  return <Icon className="w-5 h-5" />;
                                })()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-text-primary text-lg truncate max-w-[400px]">{ann.text}</p>
                                {ann.link && <p className="mt-1 text-primary text-xs truncate max-w-[300px] opacity-60 font-mono" dir="ltr">{ann.link}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="bg-primary/5 px-3 py-1 rounded-lg font-bold text-primary text-xs uppercase tracking-wider">
                              {ann.displayType === 'marquee' ? 'متحرك (Marquee)' : ann.displayType === 'carousel' ? 'كاروسيل' : 'ثابت'}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <button
                              onClick={() => handleToggleAnnouncement(ann._id)}
                              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${ann.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                            >
                              {ann.isActive ? 'نشط' : 'معطل'}
                            </button>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <div className="flex justify-center items-center gap-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEditAnnouncement(ann)}
                                className="flex justify-center items-center bg-primary/5 hover:bg-primary rounded-2xl w-11 h-11 text-primary hover:text-white transition-all"
                              >
                                <FiEdit className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1, rotate: -10 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteAnnouncement(ann._id)}
                                className="flex justify-center items-center bg-red-50 hover:bg-red-500 rounded-2xl w-11 h-11 text-red-500 hover:text-white transition-all"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card List - Hidden on large screens */}
              <div className="lg:hidden space-y-4">
                {announcements.map((ann, idx) => (
                  <motion.div
                    key={ann._id || idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/50 backdrop-blur-md p-5 border border-white/60 rounded-3xl shadow-sm"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex justify-center items-center bg-primary/10 rounded-2xl min-w-[48px] h-12 text-primary">
                        {(() => {
                          const Icon = getIcon(ann.icon || 'FiAlertCircle');
                          return <Icon className="w-6 h-6" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-text-primary text-base leading-snug line-clamp-2 mb-1">{ann.text}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-primary/5 px-2 py-0.5 rounded-lg font-bold text-primary text-[10px] uppercase">
                            {ann.displayType === 'marquee' ? 'متحرك' : ann.displayType === 'carousel' ? 'كاروسيل' : 'ثابت'}
                          </span>
                          {ann.link && <span className="text-text-muted text-[10px] font-mono truncate max-w-[120px]" dir="ltr">{ann.link}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleAnnouncement(ann._id)}
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${ann.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                      >
                        {ann.isActive ? 'نشط' : 'معطل'}
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary/5">
                      <button
                        onClick={() => handleEditAnnouncement(ann)}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 py-3 rounded-2xl text-primary font-black text-xs transition-all"
                      >
                        <FiEdit className="w-4 h-4" /> تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 py-3 rounded-2xl text-red-500 font-black text-xs transition-all"
                      >
                        <FiTrash2 className="w-4 h-4" /> حذف
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {announcements.length === 0 && (
                <div className="bg-white/40 backdrop-blur-md border border-white/60 p-20 rounded-[2.5rem] text-center">
                  <p className="opacity-30 font-bold italic text-lg leading-relaxed">
                    لا توجد إعلانات حالياً.<br />
                    ابدأ بإضافة أول رسالة ترحيبية أو إعلان لعملائك!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}





        {/* Modals placed globally for better layout */}
        <ModalPortal isOpen={isAnyModalOpen}>
          <AnimatePresence>
          {showAnnouncementModal && (
            <div key="announcement-modal" className="z-[999] fixed inset-0 flex justify-center items-center bg-[#1E2F2E]/40 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setShowAnnouncementModal(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative bg-white shadow-2xl border border-white/60 rounded-[3rem] w-full max-w-xl max-h-[85vh] overflow-y-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center bg-primary/5 px-8 pt-8 pb-6 border-b border-primary/5">
                  <h2 className="flex items-center gap-3 font-heading font-black text-primary text-2xl">
                    <div className="flex justify-center items-center bg-primary/10 rounded-xl w-10 h-10 text-primary">
                      <FiAlertCircle className="w-6 h-6" />
                    </div>
                    {editingAnnouncement ? 'تعديل الإعلان' : 'إعلان جديد'}
                  </h2>
                  <button onClick={() => setShowAnnouncementModal(false)} className="hover:bg-red-50 p-2 rounded-xl text-red-500 transition-all">
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8">
                  <form onSubmit={handleSaveAnnouncement} className="space-y-6">
                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">نص الرسالة</label>
                      <textarea
                        value={announcementForm.text}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, text: e.target.value })}
                        placeholder="اكتب رسالتك الجذابة هنا..."
                        className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full min-h-[120px] font-bold transition-all"
                        required
                      />
                    </div>

                    <div className="gap-6 grid grid-cols-2">
                      <div>
                        <label className="block mb-2 font-black text-text-secondary text-sm uppercase text-right">نوع العرض</label>
                        <CustomSelect
                          value={announcementForm.displayType}
                          onChange={(val) => setAnnouncementForm({ ...announcementForm, displayType: val })}
                          options={[
                            { label: 'ثابت (Static)', value: 'static' },
                            { label: 'متحرك (Marquee)', value: 'marquee' },
                            { label: 'كاروسيل (Carousel)', value: 'carousel' },
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-black text-text-secondary text-sm uppercase text-right">الأولوية</label>
                        <input
                          type="number"
                          value={announcementForm.priority}
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: parseInt(e.target.value) })}
                          placeholder="0"
                          className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold transition-all"
                        />
                      </div>
                    </div>

                    <div className="gap-6 grid grid-cols-1">
                      <div>
                        <label className="block mb-2 font-black text-text-secondary text-sm uppercase text-right">أيقونة الإعلان</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenIconPicker(openIconPicker === 'announcement' ? null : 'announcement')}
                            className="flex items-center gap-4 bg-primary/5 hover:bg-primary/10 p-4 border border-primary/10 rounded-2xl w-full transition-all"
                          >
                            <div className="flex justify-center items-center bg-primary/20 rounded-xl w-12 h-12 text-primary">
                              {(() => {
                                const Icon = getIcon(announcementForm.icon || 'FiAlertCircle');
                                return <Icon className="w-6 h-6" />;
                              })()}
                            </div>
                            <span className="flex-1 font-black text-primary text-lg text-right">{announcementForm.icon || 'اختر أيقونة'}</span>
                            <FiChevronDown className={`w-6 h-6 text-primary transition-transform ${openIconPicker === 'announcement' ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {openIconPicker === 'announcement' && (
                              <>
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="z-[90] fixed inset-0"
                                  onClick={() => setOpenIconPicker(null)}
                                />
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  className="right-0 top-full z-[100] absolute bg-white shadow-2xl mt-4 p-6 border border-primary/10 rounded-[2.5rem] w-full max-h-[350px] overflow-y-auto glass-effect scrollbar-hide"
                                >
                                  <div className="gap-3 grid grid-cols-4 sm:grid-cols-6">
                                    {[
                                      'FiAlertCircle', 'FiBell', 'FiStar', 'FiInfo', 'FiAward', 'FiGift',
                                      'FiZap', 'FiSmile', 'FiHeart', 'FiShoppingCart', 'FiDollarSign',
                                      'FiClock', 'FiCheckCircle', 'FiTruck', 'FiTarget', 'FiTag',
                                      'FiBookOpen', 'FiUsers', 'FiActivity', 'FiSmartphone', 'FiMail',
                                      'FiMapPin', 'FiTrendingUp', 'FiMessageCircle', 'FiCamera', 'FiFeather'
                                    ].sort().map(ic => {
                                      const Icon = getIcon(ic);
                                      return (
                                        <button
                                          key={ic}
                                          type="button"
                                          onClick={() => {
                                            setAnnouncementForm({ ...announcementForm, icon: ic });
                                            setOpenIconPicker(null);
                                          }}
                                          className={`flex items-center justify-center p-4 rounded-2xl transition-all ${announcementForm.icon === ic ? 'bg-primary text-white shadow-lg' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
                                          title={ic}
                                        >
                                          <Icon className="w-6 h-6" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">رابط التحويل (اختياري)</label>
                      <input
                        type="url"
                        value={announcementForm.link}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, link: e.target.value })}
                        placeholder="https://..."
                        className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold transition-all text-left"
                      />
                    </div>

                    <div className="flex items-center gap-4 bg-primary/5 p-5 border border-primary/5 rounded-[2rem]">
                      <span className="font-bold text-primary flex-1">تنشيط الإعلان فوراً</span>
                      <label className="relative flex items-center cursor-pointer">
                        <input type="checkbox" className="opacity-0 w-0 h-0" checked={announcementForm.isActive} onChange={(e) => setAnnouncementForm({ ...announcementForm, isActive: e.target.checked })} />
                        <div dir="ltr" className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${announcementForm.isActive ? 'bg-primary' : 'bg-gray-300'}`}>
                          <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${announcementForm.isActive ? 'translate-x-[24px]' : 'translate-x-0'}`} />
                        </div>
                      </label>
                    </div>

                    <button
                      disabled={formLoading}
                      className="flex justify-center items-center gap-3 bg-primary shadow-xl shadow-primary/30 mt-4 px-10 py-5 rounded-3xl w-full font-heading font-black text-white text-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                      {formLoading ? 'جاري الحفظ...' : (editingAnnouncement ? 'حفظ التغييرات' : 'نشر الإعلان')}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}

          {showBookModal && (
            <div key="book-modal" className="z-[999] fixed inset-0 flex justify-center items-center bg-[#1E2F2E]/40 backdrop-blur-md px-2 sm:px-4 py-4 md:py-8 overflow-y-auto custom-scrollbar" onClick={() => setShowBookModal(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative bg-white shadow-[0_30px_100px_rgba(0,0,0,0.12)] my-auto border border-white/60 rounded-[2.5rem] md:rounded-[3rem] w-full max-w-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center bg-primary/5 px-6 md:px-10 py-6 md:py-8 border-primary/5 border-b">
                  <h2 className="flex items-center gap-3 md:gap-4 font-heading font-black text-primary text-lg md:text-2xl">
                    <div className="flex justify-center items-center bg-primary shadow-lg rounded-xl md:rounded-2xl w-10 md:w-12 h-10 md:h-12 text-white">
                      {bookForm.isStoreProduct ? <FiGrid className="w-5 md:w-6 h-5 md:h-6" /> : <FiBook className="w-5 md:w-6 h-5 md:h-6" />}
                    </div>
                    <span className="line-clamp-1">
                      {bookForm.isStoreProduct
                        ? (editingBook ? 'تعديل المنتج' : 'إضافة منتج للمتجر')
                        : (editingBook ? 'تعديل الكتاب' : 'إضافة كتاب جديد')}
                    </span>
                  </h2>
                  <button onClick={() => setShowBookModal(false)} className="hover:bg-red-50 p-2 rounded-xl md:rounded-2xl text-red-500 transition-all">
                    <FiX className="w-5 md:w-6 h-5 md:h-6" />
                  </button>
                </div>

                <div className="p-6 md:p-10">
                  <form onSubmit={handleBookSubmit} className="space-y-5 md:space-y-6">
                    <div className="gap-6 md:gap-8 grid grid-cols-1 md:grid-cols-2">
                      <div className="space-y-6">
                        <div>
                          <label className="block mb-2 font-black text-text-secondary text-sm uppercase">
                            {bookForm.isStoreProduct ? 'اسم المنتج' : 'عنوان الكتاب'}
                          </label>
                          <input type="text" value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                            placeholder={bookForm.isStoreProduct ? "مثلاً: طقم أقلام سنون زيبرا" : "مثلاً: كتاب العمالقة في اللغة الإنجليزية"}
                            className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold transition-all" required />
                        </div>
                        {!bookForm.isStoreProduct && (
                          <>
                            <div>
                              <label className="block mb-2 font-black text-text-secondary text-sm uppercase">المدرس</label>
                              <CustomSelect
                                value={bookForm.teacherName}
                                onChange={(val) => setBookForm({ ...bookForm, teacherName: val })}
                                options={teacherNames.map(t => ({ label: t.name, value: t.name }))}
                                placeholder="اختر المدرس"
                              />
                            </div>
                            <div>
                              <label className="block mb-2 font-black text-text-secondary text-sm uppercase">الصف الدراسي</label>
                              <CustomSelect
                                value={bookForm.grade}
                                onChange={(val) => setBookForm({ ...bookForm, grade: val })}
                                options={grades.map(g => ({ label: g.name, value: g.name }))}
                                placeholder="اختر الصف الدراسي"
                              />
                            </div>
                          </>
                        )}

                        <div>
                          <label className="block mb-2 font-black text-text-secondary text-sm uppercase">
                            {bookForm.isStoreProduct ? "قسم المتجر" : "المادة / القسم"}
                          </label>
                          {categories.filter(c => (c.categoryType || 'book') === (bookForm.isStoreProduct ? 'store' : 'book')).length > 0 ? (
                            <CustomSelect
                              value={bookForm.category}
                              onChange={(val) => setBookForm({ ...bookForm, category: val })}
                              options={categories
                                .filter(c => (c.categoryType || 'book') === (bookForm.isStoreProduct ? 'store' : 'book'))
                                .map(c => ({ label: c.name, value: c.slug }))
                              }
                              placeholder={bookForm.isStoreProduct ? "اختر قسم المنتج" : "اختر المادة"}
                            />
                          ) : (
                            <p className="bg-amber-50 p-4 border border-amber-200 rounded-2xl font-bold text-amber-700 text-sm">
                              لا يوجد أقسام لهذا النوع، يرجى إنشاء قسم أولاً من تبويب {bookForm.isStoreProduct ? 'أقسام المتجر' : 'المواد الدراسية'}
                            </p>
                          )}
                        </div>
                        <div className="gap-3 grid grid-cols-3">
                          <div>
                            <label className="block mb-2 font-black text-[10px] text-text-secondary uppercase">السعر</label>
                            <input type="number" value={bookForm.price} onChange={(e) => setBookForm({ ...bookForm, price: e.target.value })}
                              className={`bg-primary/5 px-2 py-3 border-2 ${bookForm.discount > 0 ? 'border-primary/20' : 'border-transparent'} rounded-xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary text-sm text-center transition-all`} required />
                          </div>
                          <div>
                            <label className="block mb-2 font-black text-[10px] text-text-secondary uppercase">الخصم (%)</label>
                            <input type="number" value={bookForm.discount} onChange={(e) => setBookForm({ ...bookForm, discount: e.target.value })}
                              className={`bg-primary/5 px-2 py-3 border-2 ${bookForm.discount > 0 ? 'border-red-200' : 'border-transparent'} rounded-xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-[#F84F3B] text-sm text-center transition-all`} />
                          </div>
                          <div>
                            <label className="block mb-2 font-black text-[10px] text-text-secondary uppercase">الاستوك</label>
                            <input type="number"
                              title="أدخل الكمية الإجمالية التي قمت بتوفيرها (المباع + الباقي حالياً)"
                              value={bookForm.stock} onChange={(e) => setBookForm({ ...bookForm, stock: e.target.value })}
                              className="bg-primary/5 px-2 py-3 border-none rounded-xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-sm text-center" required />
                            <p className="mt-1 text-[8px] text-text-muted text-center leading-tight"></p>
                          </div>
                        </div>

                        {bookForm.price > 0 && bookForm.discount > 0 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-primary/5 p-4 border border-primary/10 rounded-2xl text-center">
                            <span className="font-black text-primary text-sm">السعر النهائي بعد خصم {bookForm.discount}% هو: </span>
                            <span className="mx-1 font-black text-primary text-2xl">{Math.round(bookForm.price - (bookForm.price * (bookForm.discount / 100)))}</span>
                            <span className="font-bold text-primary text-xs">ج.م</span>
                          </motion.div>
                        )}
                        <div className="space-y-4">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                              <input type="checkbox" className="opacity-0 w-0 h-0"
                                checked={bookForm.isStoreProduct}
                                onChange={(e) => {
                                  const isStore = e.target.checked;
                                  const firstCat = categories.find(c => (c.categoryType || 'book') === (isStore ? 'store' : 'book'))?.slug || '';
                                  setBookForm({ ...bookForm, isStoreProduct: isStore, category: firstCat });
                                }}
                              />
                              <div dir="ltr" className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${bookForm.isStoreProduct ? 'bg-primary' : 'bg-gray-300'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${bookForm.isStoreProduct ? 'translate-x-[24px]' : 'translate-x-0'}`} />
                              </div>
                            </div>
                            <span className="font-bold text-text-primary text-lg">منتج متجر</span>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                              <input type="checkbox" className="opacity-0 w-0 h-0" checked={bookForm.triggersFreeShipping} onChange={(e) => setBookForm({ ...bookForm, triggersFreeShipping: e.target.checked })} />
                              <div dir="ltr" className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${bookForm.triggersFreeShipping ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${bookForm.triggersFreeShipping ? 'translate-x-[24px]' : 'translate-x-0'}`} />
                              </div>
                            </div>
                            <span className="font-bold text-emerald-600 text-lg">شحن مجاني عند الشراء </span>
                          </label>

                          {editingBook && (
                            <label className="flex items-center gap-3 bg-primary/10 hover:bg-primary/20 p-4 border border-primary/20 rounded-2xl transition-all cursor-pointer">
                              <div className="relative">
                                <input type="checkbox" className="opacity-0 w-0 h-0" checked={bookForm.startNewCycle} onChange={(e) => setBookForm({ ...bookForm, startNewCycle: e.target.checked })} />
                                <div dir="ltr" className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${bookForm.startNewCycle ? 'bg-amber-500' : 'bg-gray-300'}`}>
                                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${bookForm.startNewCycle ? 'translate-x-[24px]' : 'translate-x-0'}`} />
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-amber-600 text-lg">بدء دورة مبيعات جديدة</span>
                                <span className="font-bold text-amber-500/80 text-xs">سيتم تصفير عداد المبيعات لهذه الدفعة وبدء الحساب من الصفر</span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <label className="block mb-2 w-full font-black text-text-secondary text-xs md:text-sm text-right uppercase">صورة الغلاف</label>
                        <label className="group relative flex flex-col justify-center items-center bg-primary/5 shadow-inner border-2 border-primary/20 hover:border-primary border-dashed rounded-[2rem] md:rounded-[2.5rem] w-full max-w-[200px] md:max-w-[280px] h-[280px] md:h-[380px] overflow-hidden transition-all cursor-pointer">
                          {coverPreview ? (
                            <>
                              <img src={coverPreview} alt="preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 flex flex-col justify-center items-center bg-primary/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all">
                                <FiImage className="mb-2 w-8 md:w-10 h-8 md:h-10 text-white" />
                                <span className="font-black text-white text-xs md:text-sm">تغيير الصورة</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <FiUpload className="opacity-30 group-hover:opacity-100 mb-2 md:mb-4 w-8 md:w-10 h-8 md:h-10 text-primary transition-all" />
                              <span className="font-black text-text-muted text-xs md:text-sm">اختر صورة الغلاف</span>
                              <span className="mt-1 md:mt-2 font-bold text-[10px] text-text-muted md:text-xs">حتى 9 ميجا</span>
                            </>
                          )}
                          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="mt-8">
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">
                        {bookForm.isStoreProduct ? 'وصف المنتج' : 'وصف الكتاب'}
                      </label>
                      <textarea value={bookForm.description} onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                        placeholder={bookForm.isStoreProduct ? "اكتب تفاصيل المنتج ومميزاته هنا..." : "اكتب نبذة عن محتوى الكتاب..."}
                        className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full h-32 font-medium transition-all resize-none" required />
                    </div>

                    <motion.button type="submit" disabled={formLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex justify-center items-center gap-3 disabled:opacity-50 shadow-2xl shadow-primary/30 mt-8 md:mt-10 py-4 md:py-6 rounded-2xl md:rounded-3xl w-full font-black text-white text-lg md:text-xl gradient-primary">
                      {formLoading ? ' جاري الرفع...' : (editingBook ? 'حفظ التغييرات' : (bookForm.isStoreProduct ? 'عرض في المتجر الآن' : 'نشر الكتاب الآن'))}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}

          {showUserModal && (
            <div key="user-modal" className="z-[999] fixed inset-0 flex justify-center items-center bg-[#1E2F2E]/40 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setShowUserModal(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white/95 shadow-[0_30px_100px_rgba(0,0,0,0.1)] backdrop-blur-2xl p-8 md:p-12 border border-white/60 rounded-[2.5rem] md:rounded-[3.5rem] w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-10">
                  <h2 className="font-heading font-black text-text-primary text-3xl">بروفايل جديد</h2>
                  <button onClick={() => setShowUserModal(false)} className="hover:bg-primary/5 p-3 rounded-2xl transition-all"><FiX className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleUserSubmit} className="space-y-6">
                  <div className="space-y-6">
                    <input type="text" placeholder="الاسم الكامل" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} className="bg-primary/5 px-8 py-5 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold" required />
                    <input type="email" placeholder="البريد الإلكتروني" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="bg-primary/5 px-8 py-5 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold text-left" required />
                    <input type="password" placeholder="كلمة المرور" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="bg-primary/5 px-8 py-5 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold" required />
                    <div className="flex sm:flex-row flex-col gap-4">
                      <input type="text" placeholder="رقم الهاتف" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} className="flex-1 bg-primary/5 px-8 py-5 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold text-left" required />
                      <CustomSelect
                        value={userForm.role}
                        onChange={(val) => setUserForm({ ...userForm, role: val })}
                        options={[
                          { label: 'طالب', value: 'student' },
                          { label: 'مدرس', value: 'teacher' },
                          { label: 'أدمن', value: 'admin' }
                        ]}
                        className="flex-shrink-0 min-w-[140px]"
                      />
                    </div>
                  </div>

                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-primary shadow-2xl shadow-primary/30 mt-8 py-6 rounded-[2rem] w-full font-black text-white text-xl uppercase">تفعيل العضوية</motion.button>
                </form>
              </motion.div>
            </div>
          )}

          {showCouponModal && (
            <div key="coupon-modal" className="z-[60] fixed inset-0 flex justify-center items-center bg-[#31605F]/20 backdrop-blur-xl p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-white/95 shadow-[0_30px_100px_rgba(0,0,0,0.1)] backdrop-blur-2xl p-12 border border-white/60 rounded-[3.5rem] w-full max-w-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-10">
                  <h2 className="font-heading font-black text-text-primary text-3xl">سعر الخصم</h2>
                  <button onClick={() => setShowCouponModal(false)} className="hover:bg-primary/5 p-3 rounded-2xl transition-all">
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateCoupon} className="space-y-6">
                  <div>
                    <label className="block mb-3 font-black text-text-secondary text-sm uppercase">كود الخصم الفعال</label>
                    <input
                      type="text"
                      placeholder="SUMMER25"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      className="bg-primary/5 placeholder:opacity-20 px-8 py-5 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-mono font-black text-primary text-2xl text-center uppercase tracking-widest"
                      required
                    />
                  </div>

                  <div className="gap-6 grid grid-cols-2">
                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">نوع الخصم</label>
                      <CustomSelect
                        value={couponForm.discountType}
                        onChange={(val) => setCouponForm({ ...couponForm, discountType: val })}
                        options={[
                          { label: 'نسبة مئوية (%)', value: 'percentage' },
                          { label: 'مبلغ ثابت (جنيه)', value: 'fixed' }
                        ]}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">القيمة</label>
                      <input
                        type="number"
                        value={couponForm.discountAmount}
                        onChange={(e) => setCouponForm({ ...couponForm, discountAmount: e.target.value })}
                        className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="gap-6 grid grid-cols-2">
                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">الحد الأدنى</label>
                      <input
                        type="number"
                        value={couponForm.minPurchase}
                        onChange={(e) => setCouponForm({ ...couponForm, minPurchase: e.target.value })}
                        className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">تاريخ الانتهاء</label>
                      <input
                        type="date"
                        value={couponForm.expiryDate}
                        onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                        className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold"
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-primary shadow-2xl shadow-primary/30 mt-6 py-6 rounded-[2rem] w-full font-black text-white text-xl uppercase"
                  >
                    إطلاق العرض الآن
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}

          {showOrderModal && selectedOrder && (
            <div key="order-modal" className="z-[100] fixed inset-0 flex justify-center items-center bg-[#1E2F2E]/40 backdrop-blur-md p-2 md:p-4" onClick={() => setShowOrderModal(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative flex flex-col bg-white shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-white/60 rounded-[2.5rem] md:rounded-[3.5rem] w-full max-w-5xl max-h-[95vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sticky Header */}
                <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 bg-primary/5 px-6 md:px-10 py-6 md:py-8 border-primary/5 border-b shrink-0">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-heading font-black text-text-primary text-xl md:text-3xl">
                      تفاصيل الطلب
                    </h2>
                    <span className="opacity-70 font-mono font-black text-primary text-xs md:text-lg">#{selectedOrder._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-end items-center gap-2 md:gap-3 w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePrintInvoice(selectedOrder)}
                      className="flex flex-1 sm:flex-none justify-center items-center gap-2 bg-primary shadow-lg shadow-primary/30 px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-black text-[10px] text-white md:text-sm"
                    >
                      <FiPrinter className="w-3.5 md:w-4 h-3.5 md:h-4" /> طباعة الفاتورة
                    </motion.button>
                    <button onClick={() => setShowOrderModal(false)} className="hover:bg-red-50 p-2.5 rounded-xl md:rounded-2xl text-red-500 transition-all">
                      <FiX className="w-5 md:w-6 h-5 md:h-6" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
                  <div className="gap-6 md:gap-10 grid grid-cols-1 lg:grid-cols-2">
                    <div className="space-y-6 md:space-y-8">
                      <div className="bg-primary/5 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
                        <h3 className="mb-4 md:mb-6 font-black text-primary text-lg md:text-xl">معلومات العميل</h3>
                        <div className="space-y-3 md:space-y-4">
                          <div className="flex justify-between pb-3 border-primary/10 border-b">
                            <span className="font-bold text-text-muted text-xs md:text-sm">الاسم</span>
                            <span className="font-black text-text-primary text-xs md:text-sm">{selectedOrder.user?.name}</span>
                          </div>
                          <div className="flex justify-between pb-3 border-primary/10 border-b">
                            <span className="font-bold text-text-muted text-xs md:text-sm">البريد الإلكتروني</span>
                            <span className="max-w-[150px] md:max-w-none font-black text-text-primary text-xs md:text-sm truncate">{selectedOrder.user?.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold text-text-muted text-xs md:text-sm">رقم الهاتف</span>
                            <span className="font-black text-text-primary text-xs md:text-sm">{selectedOrder.user?.phone || 'غير مسجل'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-accent/5 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
                        <h3 className="mb-4 md:mb-6 font-black text-lg md:text-xl text-accent-dark">عنوان الشحن</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between pb-3 border-accent/10 border-b">
                            <span className="font-bold text-text-muted text-xs md:text-sm">المحافظة</span>
                            <span className="font-black text-text-primary text-xs md:text-sm">{selectedOrder.shippingAddress?.governorate}</span>
                          </div>
                          <div className="space-y-2 text-right">
                            <span className="block font-bold text-text-muted text-xs md:text-sm">العنوان بالتفصيل</span>
                            <p className="bg-white/50 p-4 border border-accent/10 rounded-2xl font-black text-text-primary text-xs md:text-sm leading-relaxed">
                              {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.governorate}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-primary/5 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
                        <h3 className="mb-4 md:mb-6 font-black text-primary text-lg md:text-xl">تتبع الحالة</h3>
                        <div className="mt-4 pr-1 md:pr-4">
                          {selectedOrder.statusHistory?.map((h, i) => (
                            <StatusHistoryItem key={i} status={h.status} date={h.date} note={h.note} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                      <div className="bg-white shadow-primary/5 shadow-xl p-5 md:p-8 border border-primary/5 rounded-[2rem] md:rounded-[2.5rem]">
                        <h3 className="mb-4 md:mb-6 font-black text-text-primary text-lg md:text-xl">المنتجات</h3>
                        <div className="space-y-4 pr-2 max-h-[300px] md:max-h-[400px] overflow-y-auto no-scrollbar">
                          {selectedOrder.items?.map((item, i) => (
                            <div key={i} className="flex gap-4 bg-bg/30 p-3 md:p-4 border border-white/60 rounded-xl md:rounded-2xl">
                              <div className="flex-shrink-0 bg-primary/10 shadow-sm rounded-lg md:rounded-xl w-14 md:w-16 h-16 md:h-20 overflow-hidden">
                                {item.coverImage ? (
                                  <img src={item.coverImage} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <FiBook className="m-auto mt-4 md:mt-6 text-primary/30" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="mb-1 font-black text-text-primary text-xs md:text-sm line-clamp-2">{item.title}</p>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-[10px] text-text-muted md:text-xs">الكمية: {item.quantity}</span>
                                  <span className="font-black text-primary text-xs md:text-sm">{item.price} ج.م</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-primary shadow-2xl shadow-primary/30 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white">
                        <h3 className="opacity-80 mb-4 md:mb-6 font-black text-lg md:text-xl">تفاصيل الدفع</h3>
                        <div className="space-y-3 md:space-y-4 text-xs md:text-sm">
                          <div className="flex justify-between opacity-80 font-bold">
                            <span>المجموع الفرعي</span>
                            <span>{selectedOrder.subtotal} ج.م</span>
                          </div>
                          <div className="flex justify-between opacity-80 font-bold">
                            <span>مصاريف الشحن</span>
                            <span>{selectedOrder.deliveryFee} ج.م</span>
                          </div>
                          {selectedOrder.discount > 0 && (
                            <div className="flex justify-between font-black text-accent">
                              <span>خصم الكوبون ({selectedOrder.couponCode})</span>
                              <span>-{selectedOrder.discount} ج.م</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-4 border-white/20 border-t">
                            <span className="font-black text-lg md:text-xl">الإجمالي</span>
                            <span className="font-black text-3xl md:text-4xl">{selectedOrder.total} <span className="opacity-70 text-base">ج.م</span></span>
                          </div>
                          <div className="bg-white/10 mt-6 p-4 rounded-2xl text-center">
                            <p className="opacity-70 font-black text-[10px] md:text-sm uppercase tracking-widest">طريقة الدفع</p>
                            <p className="mt-1 font-black text-lg md:text-xl">
                              {selectedOrder.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'دفع إلكتروني'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          {showCategoryModal && (
            <div key="category-modal" className="z-[1000] fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-xl p-4 overflow-y-auto" onClick={() => setShowCategoryModal(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white/95 shadow-[0_30px_100px_rgba(0,0,0,0.1)] backdrop-blur-2xl p-10 border border-white/60 rounded-[3.5rem] w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-10">
                  <h2 className="font-heading font-black text-text-primary text-3xl">
                    {categoryForm.categoryType === 'store'
                      ? (editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد للستور')
                      : (editingCategory ? 'تعديل المادة التعليمية' : 'إضافة مادة جديدة للمكتبة')}
                  </h2>
                  <button onClick={() => setShowCategoryModal(false)} className="hover:bg-primary/5 p-3 rounded-2xl transition-all"><FiX className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleCreateCategory} className="space-y-6">
                  <div className="space-y-5">
                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">
                        {categoryForm.categoryType === 'store' ? 'اسم القسم' : 'اسم المادة التعليمية'}
                      </label>
                      <input
                        type="text"
                        placeholder={categoryForm.categoryType === 'store' ? "مثال: مجات، نوت بوك، أقلام" : "مثال: لغة فرنسية، تاريخ"}
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold"
                        required
                      />
                    </div>
                    <div className="gap-4 grid grid-cols-2">
                      <div className="relative">
                        <label className="block mb-2 font-black text-text-secondary text-sm uppercase">كود الأيقونة</label>
                        <button
                          type="button"
                          onClick={() => setOpenIconPicker(openIconPicker === 'category-icon' ? null : 'category-icon')}
                          className="flex items-center gap-3 bg-primary/5 hover:bg-primary/10 px-4 py-3 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full transition-all"
                        >
                          <div className="flex justify-center items-center bg-white shadow-sm rounded-xl w-10 h-10 text-primary">
                            {(() => {
                              const Icon = getIcon(categoryForm.icon || 'FaBook');
                              return <Icon className="w-5 h-5" />;
                            })()}
                          </div>
                          <span className="flex-1 font-bold text-primary text-right text-xs truncate">{categoryForm.icon || 'اختر...'}</span>
                          <FiChevronDown className={`w-4 h-4 text-primary transition-transform ${openIconPicker === 'category-icon' ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {openIconPicker === 'category-icon' && (
                            <>
                              <div className="z-[90] fixed inset-0" onClick={() => setOpenIconPicker(null)}></div>
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="right-0 z-[100] absolute bg-white shadow-[0_30px_70px_rgba(0,0,0,0.2)] mt-2 p-3 border border-primary/10 rounded-[2.8rem] w-[350px] max-w-[calc(100vw-40px)] glass-effect"
                              >
                                <div className="p-4 max-h-[320px] overflow-y-auto custom-scrollbar">
                                  <div className="gap-4 grid grid-cols-4 sm:grid-cols-5">
                                    {[
                                      'FaBook', 'FaBookOpen', 'FaCalculator', 'FaFlask', 'FaGlobeAmericas', 'FaHistory',
                                      'FaAtom', 'FaDna', 'FaLaptopCode', 'FaPenNib', 'FaBrain', 'FaMosque',
                                      'FaPalette', 'FaMusic', 'FaLanguage', 'FaMicroscope', 'FaUniversity',
                                      'FaSchool', 'FaScroll', 'FaChalkboardTeacher', 'FaAward', 'FaMedal',
                                      'FaMicrochip', 'FaCubes', 'FaPuzzlePiece', 'FaShapes', 'FaMapMarkedAlt',
                                      'FiGrid', 'FiList', 'FiShoppingCart', 'FiPackage', 'FiStar', 'FiZap'
                                    ].map(ic => {
                                      const Icon = getIcon(ic);
                                      const isActive = categoryForm.icon === ic;
                                      return (
                                        <button
                                          key={ic}
                                          type="button"
                                          onClick={() => {
                                            setCategoryForm({ ...categoryForm, icon: ic });
                                            setOpenIconPicker(null);
                                          }}
                                          className={`flex flex-col items-center justify-center p-2 pt-3 aspect-square rounded-2xl transition-all ${isActive
                                            ? 'bg-primary text-white shadow-xl scale-110 z-10'
                                            : 'bg-primary/5 text-primary hover:bg-primary/10 hover:scale-105'
                                            }`}
                                          title={ic}
                                        >
                                          <Icon className="w-6 h-6 mb-1" />
                                          <span className={`text-[8px] font-bold truncate w-full text-center px-1 opacity-70 ${isActive ? 'text-white' : 'text-primary'}`}>
                                            {ic.replace('Fa', '').replace('Fi', '')}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                      <div>
                        <label className="block mb-2 font-black text-text-secondary text-sm uppercase">الترتيب</label>
                        <input
                          type="number"
                          value={categoryForm.order}
                          onChange={(e) => setCategoryForm({ ...categoryForm, order: e.target.value })}
                          className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">
                        {categoryForm.categoryType === 'store' ? 'لون القسم المميز' : 'لون المادة'}
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                          className="bg-transparent border-none rounded-xl w-16 h-14 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={categoryForm.color}
                          onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                          className="flex-1 bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-2xl">
                      <input
                        type="checkbox"
                        id="catActive"
                        checked={categoryForm.isActive}
                        onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                        className="rounded w-5 h-5 accent-primary cursor-pointer"
                      />
                      <label htmlFor="catActive" className="font-bold text-text-primary cursor-pointer select-none">
                        {categoryForm.categoryType === 'store' ? 'تفعيل هذا القسم في الستور' : 'تفعيل المادة (تظهر في الواجهة)'}
                      </label>
                    </div>
                  </div>

                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-primary shadow-2xl shadow-primary/30 mt-8 py-6 rounded-[2rem] w-full font-black text-white text-xl uppercase">
                    {editingCategory ? 'حفظ التعديلات' : (categoryForm.categoryType === 'store' ? 'إضافة القسم للمتجر الآن' : 'إضافة المادة للمكتبة الآن')}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}

          {showUserModal && (
            <div key="user-modal" className="z-[999] fixed inset-0 flex justify-center items-center bg-[#1E2F2E]/40 backdrop-blur-md px-4 py-8 overflow-y-auto" onClick={() => { setShowUserModal(false); setEditingUser(null); }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative bg-white shadow-2xl border border-white/60 rounded-[3rem] w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center bg-primary/5 px-8 py-6 border-b border-primary/5">
                  <h2 className="flex items-center gap-3 font-heading font-black text-primary text-xl md:text-2xl">
                    <div className="flex justify-center items-center bg-primary shadow-md rounded-2xl w-10 h-10 text-white">
                      <FiUsers className="w-5 h-5" />
                    </div>
                    <span>{editingUser ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</span>
                  </h2>
                  <button onClick={() => { setShowUserModal(false); setEditingUser(null); }} className="hover:bg-red-50 p-2 rounded-xl text-red-500 transition-all">
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8">
                  <form onSubmit={handleUserSubmit} className="space-y-5">
                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">الاسم الكامل *</label>
                      <input
                        type="text"
                        placeholder="مثال: أحمد محمد"
                        value={userForm.name}
                        onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                        className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold text-text-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">رقم الهاتف (11 رقم) *</label>
                      <input
                        type="tel"
                        placeholder="مثال: 01012345678"
                        value={userForm.phone}
                        onChange={(e) => setUserForm({ ...userForm, phone: e.target.value.replace(/\D/g, '') })}
                        maxLength={11}
                        className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold text-text-primary text-left"
                        required
                      />
                      {userForm.phone && userForm.phone.length !== 11 && (
                        <p className="mt-1 font-bold text-amber-600 text-xs text-right">رقم الهاتف يجب أن يتكون من 11 رقم بالضبط (الحالي: {userForm.phone.length})</p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">البريد الإلكتروني (الجيميل)</label>
                      <input
                        type="email"
                        placeholder="مثال: example@gmail.com"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold text-text-primary text-left"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">الصلاحية *</label>
                      <CustomSelect
                        value={userForm.role}
                        onChange={(val) => setUserForm({ ...userForm, role: val })}
                        options={[
                          { label: 'أدمن (مدير)', value: 'admin' },
                          { label: 'مدرس', value: 'teacher' },
                          { label: 'طالب', value: 'student' }
                        ]}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">
                        كلمة المرور {editingUser ? '(اتركها فارغة إذا لم ترد التغيير)' : '*'}
                      </label>
                      <input
                        type="password"
                        placeholder={editingUser ? 'أدخل كلمة مرور جديدة للتعيين...' : '6 أحرف على الأقل'}
                        value={userForm.password}
                        onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                        className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold text-text-primary"
                        required={!editingUser}
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={formLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-primary disabled:opacity-50 shadow-2xl shadow-primary/30 mt-6 py-5 rounded-[2rem] w-full font-black text-white text-lg"
                    >
                      {formLoading ? 'جاري الحفظ...' : (editingUser ? 'حفظ التعديلات' : 'إنشاء الحساب الآن')}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}

          {showDiscountModal && (
            <div key="discount-modal" className="z-[70] fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white/95 shadow-[0_30px_100px_rgba(0,0,0,0.1)] backdrop-blur-2xl p-10 border border-white/60 rounded-[3rem] w-full max-w-md"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-heading font-black text-text-primary text-2xl">تطبيق خصم</h2>
                  <button onClick={() => setShowDiscountModal(false)} className="hover:bg-primary/5 p-2 rounded-xl transition-all"><FiX className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleApplyBulkDiscount} className="space-y-6">
                  <div>
                    <label className="block mb-2 font-black text-text-secondary text-sm uppercase">نسبة الخصم (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="bg-primary/5 placeholder:opacity-40 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-black text-primary text-2xl text-center"
                      required
                    />
                    <p className="mt-2 text-text-muted text-xs text-center">أدخل 0 لإلغاء أي خصم سابق موجود على هذه الكتب.</p>
                  </div>

                  <motion.button type="submit" disabled={formLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-primary disabled:opacity-50 shadow-2xl shadow-primary/30 py-5 rounded-[2rem] w-full font-black text-white text-lg">
                    {formLoading ? 'جاري التنفيذ...' : 'تأكيد الخصم'}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}

          <ConfirmModal
            {...confirmConfig}
            onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
          />
          {showGradeModal && (
            <div key="grade-modal" className="z-[999] fixed inset-0 flex justify-center items-center bg-[#1E2F2E]/40 backdrop-blur-md px-4 py-8 overflow-y-auto" onClick={() => setShowGradeModal(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative bg-white shadow-2xl border border-white/60 rounded-[3rem] w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center bg-primary/5 px-10 py-8 border-primary/5 border-b rounded-t-[3rem]">
                  <h2 className="font-heading font-black text-primary text-2xl">
                    {editingGrade ? 'تعديل الصف الدراسي' : 'إضافة صف دراسي جديد'}
                  </h2>
                  <button onClick={() => setShowGradeModal(false)} className="hover:bg-red-50 p-2.5 rounded-2xl text-red-500 transition-all">
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-10">
                  <form onSubmit={handleCreateGrade} className="space-y-6">
                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">اسم الصف</label>
                      <input type="text" placeholder="مثال: الصف الثالث الثانوي" value={gradeForm.name} onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })} className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold" required />
                    </div>
                    <div>
                      <label className="block mb-2 font-black text-text-secondary text-sm uppercase">الترتيب في القائمة</label>
                      <input type="number" value={gradeForm.order} onChange={(e) => setGradeForm({ ...gradeForm, order: e.target.value })} className="bg-primary/5 px-6 py-4 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 w-full font-bold" required />
                    </div>
                    <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-2xl">
                      <input type="checkbox" id="gradeActive" checked={gradeForm.isActive} onChange={(e) => setGradeForm({ ...gradeForm, isActive: e.target.checked })} className="w-5 h-5 accent-primary cursor-pointer" />
                      <label htmlFor="gradeActive" className="font-bold text-text-primary cursor-pointer select-none">تفعيل الصف (يظهر للطلاب)</label>
                    </div>
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="bg-primary shadow-2xl shadow-primary/30 mt-8 py-6 rounded-3xl w-full font-black text-white text-xl uppercase">
                      {editingGrade ? 'حفظ التعديلات' : 'إضافة الصف الآن'}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
          <ConfirmModal
            {...confirmConfig}
            onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
          />
          {/* End of Modals */}
          </AnimatePresence>
        </ModalPortal>
      </div>
    </div>
  );
};

export default AdminDashboard;