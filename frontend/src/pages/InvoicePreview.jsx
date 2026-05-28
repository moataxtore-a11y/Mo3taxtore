import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPrinter, FiDownload, FiArrowRight, FiLoader, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import Logo from '../assets/LOGO.svg';



const InvoicePreview = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const ids = searchParams.get('ids')?.split(',') || [];

  useEffect(() => {
    fetchOrders();
  }, [id, searchParams]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let fetchedOrders = [];
      
      if (id && id !== 'bulk') {
        const res = await api.get(`/orders/${id}`);
        fetchedOrders = [res.data.order];
      } else if (ids.length > 0) {
        // Fetch multiple orders - assuming there's an endpoint for this or fetch one by one
        const promises = ids.map(orderId => api.get(`/orders/${orderId}`));
        const responses = await Promise.all(promises);
        fetchedOrders = responses.map(r => r.data.order);
      } else {
        toast.error('لم يتم تحديد أي طلبات');
        navigate(-1);
        return;
      }
      
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      toast.error('فشل تحميل بيانات الفاتورة');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    // Give time for UI updates if any @media print depends on state
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const statusLabels = { 
    placed: 'جديد', 
    confirmed: 'مؤكد', 
    processing: 'تجهيز', 
    shipped: 'شحن', 
    delivered: 'مكتمل', 
    cancelled: 'ملغي' 
  };
  
  const paymentLabels = { 
    cod: 'الدفع عند الاستلام', 
    stripe: 'بطاقة بنكية', 
    paymob: 'Paymob' 
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center bg-transparent min-h-screen">
        <FiLoader className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 font-bold text-text-secondary">جاري تجهيز الفاتورة...</p>
      </div>
    );
  }

  return (
    <div className="bg-transparent print:bg-white print:p-0 min-h-screen invoice-preview-container">
      {/* UI Navigation - Hidden during print */}
      <div className="print:hidden top-0 z-50 fixed flex justify-between items-center bg-white/80 backdrop-blur-md px-4 md:px-8 border-border border-b w-full h-16">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-bold text-text-secondary hover:text-primary transition-colors"
        >
          <FiArrowRight /> عودة
        </button>
        
        <div className="flex items-center gap-2">
          <span className="hidden md:block bg-primary/5 px-3 py-1 rounded-full font-bold text-primary text-xs">
            {orders.length === 1 ? `فاتورة #${orders[0]._id.slice(-8).toUpperCase()}` : `${orders.length} فواتير مختارة`}
          </span>
          <button 
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-2 bg-primary shadow-lg shadow-primary/20 px-6 py-2 rounded-xl font-bold text-white hover:scale-105 active:scale-95 transition-all"
          >
            {isPrinting ? <FiLoader className="animate-spin" /> : <FiPrinter />} 
            <span>طباعة</span>
          </button>
        </div>
      </div>

      {/* Invoice Pages */}
      <div className="pt-24 print:pt-0 pb-12 print:pb-0">
        <div className="flex flex-col items-center gap-8 print:gap-0">
          {orders.map((order, index) => (
            <motion.div 
              key={order._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="box-border relative flex flex-col bg-white shadow-2xl print:shadow-none print:m-0 p-4 sm:p-6 md:p-[10mm] border border-border print:border-none w-full md:w-[210mm] print:w-full max-w-[210mm] print:h-screen min-h-0 md:min-h-[297mm] overflow-hidden page-break-after-always"
            >
              {/* Header */}
              <div className="sticky-header flex sm:flex-row flex-col justify-between items-start gap-6 sm:gap-4 mb-8 pb-4 border-primary/20 border-b-2">
                <div className="brand-section">
                  <div className="flex items-center gap-4">
                    <img src={Logo} alt="Moatax Store" className="w-auto h-12 object-contain" />

                    <div>
                      <p className="flex items-center gap-2 mt-1 font-bold text-[#8FA7A6] text-[10px] uppercase tracking-widest">
                         <span className="block bg-primary/40 rounded-full w-1.5 h-1.5" /> موجودين عشانك
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-left">
                  <h2 className="font-black text-primary text-xl uppercase tracking-wider">فاتورة ضريبية</h2>
                  <div className="flex flex-col items-end mt-2">
                    <span className="font-mono font-black text-text-primary text-lg">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className="font-bold text-[#8FA7A6] text-xs">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </span>
                    <span className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black ${
                      order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.paymentStatus === 'paid' ? 'تم الدفع' : 'الدفع عند الاستلام'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Info - Side-by-Side Compact */}
              <div className="gap-4 md:gap-6 grid grid-cols-2 mb-6">
                <div className="bg-bg/40 p-4 border border-border/50 rounded-2xl">
                  <h4 className="mb-3 pb-1.5 border-border/50 border-b font-black text-[10px] text-primary uppercase">بيانات العميل</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-right">
                      <span className="ml-4 font-bold text-[#8FA7A6] text-[10px] whitespace-nowrap">الاسم</span>
                      <span className="flex-1 font-black text-text-primary text-[11px] text-left">{order.shippingAddress?.name || order.user?.name}</span>
                    </div>

                    <div className="flex justify-between items-center text-right">
                      <span className="ml-4 font-bold text-[#8FA7A6] text-[10px] whitespace-nowrap">الهاتف</span>
                      <span className="flex-1 font-black text-primary text-[11px] text-left">{order.shippingAddress?.phone || order.user?.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-bg/40 p-4 border border-border/50 rounded-2xl">
                  <h4 className="mb-3 pb-1.5 border-border/50 border-b font-black text-[10px] text-primary uppercase">عنوان التوصيل</h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-right">
                      <span className="ml-2 font-bold text-[#8FA7A6] text-[10px] whitespace-nowrap">المحافظة/المدينة</span>
                      <span className="flex-1 font-black text-text-primary text-[11px] text-left line-clamp-1">
                        {order.shippingAddress?.governorate} - {order.shippingAddress?.city}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="font-bold text-[#8FA7A6] text-[9px] whitespace-nowrap">التفاصيل:</span>
                      <span className="font-bold text-text-secondary text-[10px] text-left leading-tight line-clamp-2">
                        {order.shippingAddress?.street}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="flex-1 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-right border-collapse">
                    <thead>
                      <tr className="bg-primary/90 text-white">
                        <th className="p-4 pr-6 rounded-tr-2xl font-black text-xs">#</th>
                        <th className="p-4 font-black text-xs text-right">وصف الكتاب/المنتج</th>
                        <th className="p-4 font-black text-xs text-center">الكمية</th>
                        <th className="p-4 font-black text-xs text-center">السعر</th>
                        <th className="p-4 pl-6 rounded-tl-2xl font-black text-xs text-left">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {order.items?.map((item, i) => (
                        <tr key={i} className="hover:bg-bg/20 transition-colors">
                          <td className="p-4 pr-5 font-bold text-[#8FA7A6] text-xs">{i + 1}</td>
                          <td className="p-4">
                            <p className="font-black text-text-primary text-sm">{item.title}</p>
                            {item.grade && <span className="text-[#8FA7A6] text-[10px]">الصف: {item.grade}</span>}
                          </td>
                          <td className="p-4 font-black text-text-primary text-sm text-center">x{item.quantity}</td>
                          <td className="p-4 font-bold text-text-secondary text-sm text-center">{item.price} ج.م</td>
                          <td className="p-4 pl-5 font-black text-primary text-sm text-left">{(item.price * item.quantity).toFixed(2)} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals & Footer */}
              <div className="mt-8 pt-6 border-border/60 border-t-2 border-dashed">
                <div className="flex md:flex-row flex-col justify-between items-stretch md:items-end gap-6">
                  <div className="max-w-none md:max-w-[300px]">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <FiCheckCircle className="w-4 h-4" />
                      <span className="font-black text-xs uppercase tracking-tighter">شروط الاسترجاع</span>
                    </div>
                    <p className="font-bold text-[#8FA7A6] text-[10px] leading-relaxed">
                      يُسمح بالاستبدال أو الاسترجاع خلال 14 يوماً من تاريخ الاستلام بشرط بقاء المنتج بحالته الأصلية. في حالة وجود عيب صناعة، يتم الاستبدال مجاناً.
                    </p>
                  </div>
                  
                  <div className="relative bg-primary shadow-primary/20 shadow-xl p-6 rounded-[2rem] w-full md:max-w-[280px] overflow-hidden text-white">
                    {/* Decorative bubble */}
                    <div className="top-0 right-0 absolute bg-white/10 rounded-full w-24 h-24 -translate-y-10 translate-x-10" />
                    
                    <div className="z-10 relative space-y-2">
                      <div className="flex justify-between items-center opacity-80 text-xs">
                        <span>المجموع الفرعي:</span>
                        <span className="font-black">{order.subtotal?.toFixed(2)} ج.م</span>
                      </div>
                      <div className="flex justify-between items-center opacity-80 text-xs">
                        <span>مصاريف الشحن:</span>
                        <span className="font-black">{order.deliveryFee?.toFixed(2)} ج.م</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between items-center text-emerald-300 text-xs">
                          <span>الخصم:</span>
                          <span className="font-black">-{order.discount?.toFixed(2)} ج.م</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-3 border-white/20 border-t">
                        <span className="font-bold text-sm">الإجمالي النهائي:</span>
                        <span className="font-black text-2xl">{order.total?.toFixed(2)} ج.م</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <p className="font-black text-[#31605F] text-[#8FA7A6] text-[11px] uppercase tracking-widest">شكراً لثقتكم في معتز ستور</p>

                  <p className="mt-1 text-border font-bold text-[9px]">تم إصدار هذه الفاتورة إلكترونياً ولا تحتاج لختم أو توقيع</p>
                </div>
              </div>
              
              {/* Sidebar decorative numbers */}
              <div className="right-10 bottom-10 absolute opacity-5 font-black text-8xl pointer-events-none">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media screen {
          .invoice-preview-container {
            overflow-x: hidden;
          }
        }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .invoice-preview-container {
            background-color: white !important;
            padding: 0 !important;
          }
          .page-break-after-always {
            page-break-after: always;
            break-after: page;
          }
          .print\\:hidden {
            display: none !important;
          }
          div[class*="pt-24"] {
            padding-top: 0 !important;
          }
          div[class*="w-[210mm]"] {
            width: 210mm !important;
            height: 297mm !important;
            border: none !important;
            box-shadow: none !important;
            padding: 10mm !important;
            margin: 0 !important;
          }
          /* Fix for some browsers not printing backgrounds */
          .bg-primary {
            background-color: #31605F !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .text-white {
            color: white !important;
          }
          tr.bg-primary th {
            background-color: #31605F !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .bg-bg\\/40 {
            background-color: #f8fafb !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePreview;
