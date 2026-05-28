import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiShoppingCart, FiBook, FiTruck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const FloatingBlob = ({ color, size, top, left, delay, duration }) => (
  <motion.div
    animate={{ y: [0, -20, 0], x: [0, 15, 0], scale: [1, 1.05, 1] }}
    transition={{ duration: duration || 8, repeat: Infinity, ease: 'easeInOut', delay: delay || 0 }}
    className="absolute rounded-full mix-blend-multiply filter blur-[80px] opacity-40 z-0 pointer-events-none"
    style={{ backgroundColor: color, width: size, height: size, top, left }}
  />
);

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, subtotal, deliveryFee, total, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center bg-transparent px-4 pt-20 min-h-screen relative">
        <FloatingBlob color="#31605F" size="40vw" top="-10%" left="-10%" delay={0} />
        <FloatingBlob color="#D6E4E3" size="50vw" top="50%" left="60%" delay={1} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center bg-white/50 backdrop-blur-xl p-12 rounded-[3rem] border border-white/60 shadow-lg shadow-[#31605F]/5"
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex justify-center mb-8 text-[#8FA7A6] text-9xl"
          >
            <FiShoppingCart />
          </motion.div>
          <h2 className="mb-3 font-heading font-black text-[#1E2F2E] text-3xl">عربتك فارغة حالياً!</h2>
          <p className="mb-8 text-[#5F7A79] font-medium text-lg">لم تضف أي كتب بعد. اكتشف مكتبتنا الرائعة الآن!</p>
          <Link to="/marketplace">
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#31605F] to-[#244948] shadow-lg shadow-[#31605F]/30 px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all"
            >
              تصفح الكتب <FiShoppingBag />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen relative selection:bg-[#31605F] selection:text-white pb-20">
      <FloatingBlob color="#31605F" size="40vw" top="-10%" left="-10%" delay={0} />
      <FloatingBlob color="#8FA7A6" size="30vw" top="60%" left="80%" delay={2} />
      <FloatingBlob color="#D6E4E3" size="45vw" top="30%" left="20%" delay={1} duration={12} />

      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-40 pb-12 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/marketplace" className="inline-flex items-center gap-2 mb-8 text-[#5F7A79] hover:text-[#31605F] text-sm font-medium transition-colors hover:-translate-x-1 duration-300">
            <FiArrowRight /> العودة للمكتبة
          </Link>
          <h1 className="mb-2 font-heading font-black text-4xl md:text-5xl text-[#1E2F2E]">
            عربة <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948]">التسوق</span>
          </h1>
          <p className="mb-10 text-[#5F7A79] font-medium text-lg">{totalItems} {totalItems === 1 ? 'كتاب' : 'كتب'} في العربة</p>
        </motion.div>

        <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                  transition={{ delay: idx * 0.05, type: 'spring', stiffness: 100 }}
                  className="bg-white/70 backdrop-blur-xl p-4 md:p-5 border border-white/80 rounded-[2rem] shadow-sm hover:shadow-lg hover:shadow-[#31605F]/10 transition-all group flex flex-col sm:flex-row items-center gap-4 md:gap-6"
                >
                  <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                    {/* Cover */}
                    <div className="flex-shrink-0 bg-gradient-to-br from-[#D6E4E3] to-[#EEF4F3] rounded-2xl w-24 h-32 md:w-24 md:h-26 overflow-hidden shadow-sm">
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="flex justify-center items-center w-full h-full text-[#8FA7A6] text-3xl"><FiBook /></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="mb-1 font-heading font-bold text-[#1E2F2E] text-base md:text-lg sm:truncate">{item.title}</h3>
                      <p className="mb-2 text-[#8FA7A6] text-xs md:sm font-medium">{item.teacher?.name || 'مدرس'}</p>
                      <div className="sm:hidden">
                        {item.discount > 0 ? (
                          <div className="flex items-center gap-2">
                            <p className="font-black text-transparent bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] text-lg">
                              {item.priceAfterDiscount} <span className="font-medium text-[#8FA7A6] text-sm">جنيه</span>
                            </p>
                            <p className="font-bold text-[#8FA7A6] text-xs line-through">{item.price}</p>
                          </div>
                        ) : (
                          <p className="font-black text-transparent bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] text-lg">
                            {item.price} <span className="font-medium text-[#8FA7A6] text-sm">جنيه</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Price Desktop */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 md:gap-6 border-t sm:border-0 pt-3 sm:pt-0 border-[#EEF4F3]">
                    {/* Price Desktop */}
                    <div className="hidden sm:block min-w-[100px]">
                      {item.discount > 0 ? (
                        <div className="flex flex-col">
                          <p className="font-black text-transparent bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] text-lg">
                            {item.priceAfterDiscount} <span className="font-medium text-[#8FA7A6] text-sm">جنيه</span>
                          </p>
                          <p className="font-bold text-[#8FA7A6] text-xs line-through">{item.price} جنيه</p>
                        </div>
                      ) : (
                        <p className="font-black text-transparent bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] text-lg">
                          {item.price} <span className="font-medium text-[#8FA7A6] text-sm">جنيه</span>
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-[#EEF4F3] p-1 rounded-xl shadow-sm">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="flex justify-center items-center bg-white text-[#31605F] hover:bg-[#31605F] hover:text-white rounded-lg w-8 h-8 transition-colors font-bold"
                      >
                        <FiMinus className="w-3 h-3" />
                      </motion.button>
                      <span className="w-8 font-bold text-[#1E2F2E] text-sm text-center">{item.quantity}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="flex justify-center items-center bg-white text-[#31605F] hover:bg-[#31605F] hover:text-white rounded-lg w-8 h-8 transition-colors font-bold"
                      >
                        <FiPlus className="w-3 h-3" />
                      </motion.button>
                    </div>

                    {/* Subtotal Desktop */}
                    <div className="hidden md:block min-w-[90px] text-right">
                      <p className="font-black text-[#1E2F2E]">
                        {((item.discount > 0 ? item.priceAfterDiscount : item.price) * item.quantity).toFixed(0)}
                      </p>
                      <p className="text-[#8FA7A6] text-xs font-medium">جنيه</p>
                    </div>

                    {/* Remove */}
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item._id)}
                      className="hover:bg-red-50 p-2.5 rounded-xl text-[#8FA7A6] hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="top-24 sticky bg-white/70 backdrop-blur-xl p-6 md:p-8 border border-white/80 rounded-[2.5rem] shadow-lg shadow-[#31605F]/5">
              <h3 className="mb-6 font-heading font-black text-[#1E2F2E] text-xl">ملخص الطلب</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[#5F7A79] font-medium">المجموع الفرعي</span>
                  <span className="font-bold text-[#1E2F2E]">{subtotal.toFixed(0)} جنيه</span>
                </div>
                <div className="bg-[#EEF4F3] px-4 py-3 rounded-xl flex items-center gap-3 border border-[#D6E4E3]">
                  <div className="bg-[#31605F]/10 p-2 rounded-lg text-[#31605F]">
                    <FiTruck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[#1E2F2E] text-sm font-bold">مصاريف الشحن</p>
                    <p className="text-[#5F7A79] text-xs font-medium">يتم الحساب في خطوة إتمام الشراء</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-[#EEF4F3] border-t-2">
                  <div>
                    <span className="font-heading font-black text-[#1E2F2E] text-xl block">الإجمالي الأساسي</span>
                  </div>
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-l from-[#31605F] to-[#244948] text-2xl">{total.toFixed(0)} جنيه</span>
                </div>
              </div>

              <Link to="/checkout">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex justify-center items-center gap-3 bg-gradient-to-r from-[#31605F] to-[#244948] shadow-lg shadow-[#31605F]/25 hover:shadow-xl hover:shadow-[#31605F]/40 py-4 rounded-2xl w-full font-bold text-white text-lg transition-all"
                >
                  إتمام الشراء <FiArrowRight />
                </motion.button>
              </Link>

              <Link to="/marketplace" className="block mt-4 text-[#8FA7A6] hover:text-[#31605F] text-sm text-center transition-colors font-medium">
                متابعة التسوق ←
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
