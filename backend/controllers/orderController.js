const Order = require('../models/Order');
const Book = require('../models/Book');
const ShippingSettings = require('../models/ShippingSettings');
const Coupon = require('../models/Coupon');

// @desc    Create new order (Student checkout)
// @route   POST /api/orders
exports.createOrder = async(req, res) => {
    try {
        const { items, shippingAddress, paymentMethod, couponCode } = req.body;

        // Validate books and calculate totals
        let subtotal = 0;
        const orderItems = [];

        const bookIds = items.map(item => item.book);
        const books = await Book.find({ _id: { $in: bookIds }, status: 'approved' }).lean();

        if (books.length !== items.length) {
            return res.status(400).json({ message: 'One or more books are unavailable or not approved.' });
        }

        // Step 1: Pre-validate all stock
        for (const item of items) {
            const book = books.find(b => b._id.toString() === item.book.toString());
            if (book.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for "${book.title}". Available: ${book.stock}`,
                });
            }
        }

        // Step 2: Atomic Bulk Update to prevent Race Conditions
        const bulkOperations = items.map(item => ({
            updateOne: {
                filter: { _id: item.book, stock: { $gte: item.quantity } },
                update: { $inc: { stock: -item.quantity, totalSold: item.quantity } }
            }
        }));

        const bulkResult = await Book.bulkWrite(bulkOperations);

        // If modifiedCount doesn't match items length, it means a race condition happened and a book went out of stock exactly when this request fired
        if (bulkResult.modifiedCount !== items.length) {
            return res.status(409).json({ message: 'A concurrent checkout modified the stock. Please try again.' });
        }

        // Step 3: Populate Order Items and Totals
        for (const item of items) {
            const book = books.find(b => b._id.toString() === item.book.toString());
            const itemPrice = book.discount > 0 ? book.priceAfterDiscount : book.price;

            orderItems.push({
                book: book._id,
                title: book.title,
                price: itemPrice,
                originalPrice: book.price,
                discount: book.discount,
                quantity: item.quantity,
                coverImage: book.coverImage,
            });

            subtotal += itemPrice * item.quantity;
        }

        const settings = await ShippingSettings.findOne();
        let shippingCost = 0; // dynamic based on governorate
        let freeThreshold = 500; // default free shipping threshold

        if (settings) {
            freeThreshold = settings.freeShippingThreshold;
            if (shippingAddress && shippingAddress.governorate) {
                const gov = settings.governorates.find(
                    (g) => g.name.trim() === shippingAddress.governorate.trim()
                );
                if (gov) {
                    shippingCost = gov.price;
                }
            }
        }

        const deliveryFee = subtotal >= freeThreshold ? 0 : shippingCost;

        // Apply Coupon if provided
        let discount = 0;
        let couponDoc = null;
        if (couponCode) {
            couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
            if (couponDoc) {
                const { valid } = couponDoc.isValid(subtotal);
                if (valid) {
                    if (couponDoc.discountType === 'percentage') {
                        discount = (subtotal * couponDoc.discountAmount) / 100;
                    } else {
                        discount = couponDoc.discountAmount;
                    }
                    discount = Math.min(discount, subtotal);
                }
            }
        }

        const total = subtotal + deliveryFee - discount;

        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            subtotal,
            discount,
            couponCode: couponDoc ? couponDoc.code : undefined,
            deliveryFee,
            total,
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
            statusHistory: [{ status: 'placed', note: 'Order placed successfully' }],
        });

        // Increment coupon usage if applied
        if (couponDoc) {
            couponDoc.usedCount += 1;
            await couponDoc.save();
        }

        res.status(201).json({ order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's orders (Student)
// @route   GET /api/orders
exports.getMyOrders = async(req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only the owner or admin can view.
        // order.user can be null if the user account was deleted (orphaned order).
        const isOwner = order.user && order.user._id.toString() === req.user._id.toString();
        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json({ order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get teacher orders (books sold by this teacher)
// @route   GET /api/orders/teacher
exports.getTeacherOrders = async(req, res) => {
    try {
        const teacherBooks = await Book.find({ teacher: req.user._id }).select('_id');
        const bookIds = teacherBooks.map((b) => b._id);

        const orders = await Order.find({
                'items.book': { $in: bookIds },
            })
            .populate('user', 'name email address phone')
            .sort({ createdAt: -1 })
            .lean();

        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
exports.getAllOrders = async(req, res) => {
    try {
        const orders = await Order.find()
            .select('_id total orderStatus paymentMethod paymentStatus createdAt shippingAddress user items statusHistory subtotal deliveryFee discount couponCode trackingNumber note')
            .populate('user', 'name email address phone')
            .sort({ createdAt: -1 })
            .lean();
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async(req, res) => {
    try {
        const { orderStatus, paymentStatus, trackingNumber, note } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (orderStatus) {
            order.orderStatus = orderStatus;
            order.statusHistory.push({
                status: orderStatus,
                note: note || `Status updated to ${orderStatus}`,
                date: new Date()
            });
        }

        if (paymentStatus) order.paymentStatus = paymentStatus;
        if (trackingNumber) order.trackingNumber = trackingNumber;

        await order.save();

        // Return populated order to ensure frontend has all data
        const updatedOrder = await Order.findById(order._id).populate('user', 'name email address phone');
        res.json({ order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};