import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('يجب استخدام useCart داخل CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [shippingSettings, setShippingSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings/shipping');
        setShippingSettings(data.settings);
      } catch (err) {
        console.error('فشل تحميل اعدادات الشحن', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (book, quantity = 1) => {
    const existing = items.find((item) => item._id === book._id);

    if (existing) {
      toast.success(`تم تحديث الكمية بنجاح "${book.title}"`);
    } else {
      toast.success(`"${book.title}" تم الإضافه للعربة بنجاح! 🛒`);
    }

    setItems((prev) => {
      const isThere = prev.find((item) => item._id === book._id);
      if (isThere) {
        return prev.map((item) =>
          item._id === book._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...book, quantity }];
    });
  };

  const removeFromCart = (bookId) => {
    setItems((prev) => prev.filter((item) => item._id !== bookId));
    toast.success('تم حذف المنتج من العربة');
  };

  const updateQuantity = (bookId, quantity) => {
    if (quantity < 1) return removeFromCart(bookId);
    setItems((prev) =>
      prev.map((item) => (item._id === bookId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasFreeShippingItem = items.some(item => item.triggersFreeShipping === true);
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.discount > 0 ? item.priceAfterDiscount : item.price;
    return sum + itemPrice * item.quantity;
  }, 0);
  const total = subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        total,
        shippingSettings,
        hasFreeShippingItem
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
