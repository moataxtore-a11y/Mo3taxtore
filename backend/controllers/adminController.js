const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const AdminTeacherName = require('../models/AdminTeacherName');
const Visitor = require('../models/Visitor');

// @desc    Create user (Admin)
// @route   POST /api/admin/users
exports.createUser = async(req, res) => {
    try {
        console.log('[createUser] body received:', JSON.stringify(req.body));
        const { name, email, password, role, phone } = req.body;

        // Manual validation for required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'الاسم مطلوب' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
        }
        const phoneClean = phone ? phone.trim() : '';
        const phoneRegex = /^\d{11}$/;
        if (!phoneClean || !phoneRegex.test(phoneClean)) {
            return res.status(400).json({ message: 'رقم الهاتف يجب أن يتكون من 11 رقم بالضبط' });
        }

        // Email validation if provided
        let finalEmail = email ? email.toLowerCase().trim() : undefined;
        if (finalEmail) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(finalEmail)) {
                return res.status(400).json({ message: 'البريد الإلكتروني غير صحيح (مثال: user@gmail.com)' });
            }
            const existingEmail = await User.findOne({ email: finalEmail });
            if (existingEmail) {
                return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
            }
        }

        const existingPhone = await User.findOne({ phone: phoneClean });
        if (existingPhone) {
            return res.status(400).json({ message: 'رقم الهاتف مستخدم بالفعل' });
        }

        const user = await User.create({ name: name.trim(), email: finalEmail, password, role, phone: phoneClean });
        res.status(201).json({ message: 'تم إنشاء الحساب بنجاح', user });
    } catch (error) {
        console.error('[createUser] ERROR name:', error.name);
        console.error('[createUser] ERROR code:', error.code);
        console.error('[createUser] ERROR message:', error.message);
        console.error('[createUser] ERROR stack:', error.stack);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            if (field === 'phone') return res.status(400).json({ message: 'رقم الهاتف مستخدم بالفعل' });
            if (field === 'email') return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
            return res.status(400).json({ message: 'بيانات مكررة - يرجى المراجعة' });
        }
        res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
    }
};

// @desc    Update user (Admin)
// @route   PUT /api/admin/users/:id
exports.updateUser = async(req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, password, role, phone } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        const updates = {};

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ message: 'الاسم مطلوب' });
            }
            updates.name = name.trim();
        }

        if (phone !== undefined) {
            const phoneClean = phone.trim();
            const phoneRegex = /^\d{11}$/;
            if (!phoneRegex.test(phoneClean)) {
                return res.status(400).json({ message: 'رقم الهاتف يجب أن يتكون من 11 رقم بالضبط' });
            }
            if (phoneClean !== user.phone) {
                const existingPhone = await User.findOne({ phone: phoneClean });
                if (existingPhone && (existingPhone._id || existingPhone.id) !== userId) {
                    return res.status(400).json({ message: 'رقم الهاتف مستخدم بالفعل' });
                }
            }
            updates.phone = phoneClean;
        }

        if (email !== undefined) {
            let finalEmail = email ? email.toLowerCase().trim() : undefined;
            if (finalEmail) {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(finalEmail)) {
                    return res.status(400).json({ message: 'البريد الإلكتروني غير صحيح (مثال: user@gmail.com)' });
                }
                if (finalEmail !== user.email) {
                    const existingEmail = await User.findOne({ email: finalEmail });
                    if (existingEmail && (existingEmail._id || existingEmail.id) !== userId) {
                        return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
                    }
                }
            }
            updates.email = finalEmail;
        }

        if (role !== undefined) {
            updates.role = role;
        }

        if (password && password.trim() !== '') {
            if (password.length < 6) {
                return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
            }
            updates.password = password;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
        res.json({ message: 'تم تحديث بيانات المستخدم بنجاح', user: updatedUser });
    } catch (error) {
        console.error('updateUser Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'رقم الهاتف أو البريد مستخدم بالفعل' });
        }
        res.status(500).json({ message: error.message || 'خطأ في الخادم أثناء تحديث المستخدم' });
    }
};

// @desc    Get admin teacher names list
// @route   GET /api/admin/teacher-names

exports.getTeacherNames = async(req, res) => {
    try {
        const items = await AdminTeacherName.find({}).sort({ name: 1 }).select('name photo');
        res.json({ items });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add teacher name (with optional photo)
// @route   POST /api/admin/teacher-names
exports.createTeacherName = async(req, res) => {
    try {
        console.log('Create Teacher Name Request:', { body: req.body, file: req.file });
        const name = (req.body.name || '').trim();
        if (!name) {
            console.warn('Teacher creation failed: Name is empty');
            return res.status(400).json({ message: 'الاسم مطلوب' });
        }
        const photo = req.file ? req.file.path : '';
        const item = await AdminTeacherName.create({ name, photo });
        res.status(201).json({ item });
    } catch (error) {
        console.error('Create Teacher Name Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'هذا الاسم موجود بالفعل في القائمة' });
        }
        res.status(500).json({ message: 'فشل في إضافة المدرس', error: error.message });
    }
};

// @desc    Update teacher name/photo
// @route   PUT /api/admin/teacher-names/:id
exports.updateTeacherName = async(req, res) => {
    try {
        const item = await AdminTeacherName.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        if (req.body.name) item.name = req.body.name.trim();
        if (req.file) item.photo = req.file.path;
        await item.save();
        res.json({ item });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Name already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete teacher name
// @route   DELETE /api/admin/teacher-names/:id
exports.deleteTeacherName = async(req, res) => {
    try {
        const item = await AdminTeacherName.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        await item.deleteOne();
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
exports.getUsers = async(req, res) => {
    try {
        const { role, search } = req.query;
        const filter = {};

        if (role) filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(filter)
            .select('_id name email phone role createdAt')
            .sort({ createdAt: -1 })
            .lean();
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/admin/users/:id
exports.getUser = async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async(req, res) => {
    try {
        const targetId = req.params.id;
        const user = await User.findById(targetId);
        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        // Prevent self-deletion if logged in
        if (req.user && (req.user.id === targetId || req.user._id === targetId)) {
            return res.status(400).json({ message: 'لا يمكن حذف حسابك الحاضر أثناء تسجيل الدخول' });
        }

        // Check if we are trying to delete the last admin
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'لا يمكن حذف آخر مسؤول في النظام' });
            }
        }

        await user.deleteOne();
        res.json({ message: 'تم حذف المستخدم بنجاح' });
    } catch (error) {
        console.error('deleteUser Error:', error);
        res.status(500).json({ message: error.message || 'خطأ في الخادم أثناء حذف المستخدم' });
    }
};

// @desc    Get all books for admin (including pending)
// @route   GET /api/admin/books
exports.getAllBooks = async(req, res) => {
    try {
        const { status, search } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
            ];
        }

        const books = await Book.find(filter)
            .select('_id title coverImage status teacherName teacher price priceAfterDiscount discount stock totalSold isStoreProduct description category isbn pages grade triggersFreeShipping')
            .populate('teacher', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        res.json({ books });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Approve/reject book
// @route   PUT /api/admin/books/:id/approve
exports.approveBook = async(req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const book = await Book.findByIdAndUpdate(
            req.params.id, { status }, { new: true }
        ).populate('teacher', 'name email');

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.json({ book, message: `Book ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Apply discount to books
// @route   POST /api/admin/books/discount
exports.applyDiscount = async(req, res) => {
    try {
        const { bookIds, discount } = req.body; // discount is a percentage

        if (!Array.isArray(bookIds) || bookIds.length === 0) {
            return res.status(400).json({ message: 'No books selected' });
        }

        if (discount < 0 || discount > 100) {
            return res.status(400).json({ message: 'Discount must be between 0 and 100' });
        }

        const books = await Book.find({ _id: { $in: bookIds } });

        let successCount = 0;
        for (const book of books) {
            try {
                const currentPrice = Number(book.price);
                if (isNaN(currentPrice) || book.price === undefined || book.price === null) {
                    console.error(`Book Discount Failure: Book ${book._id} has invalid price. Raw value: ${book.price}, Number conversion: ${currentPrice}`);
                    continue;
                }
                book.discount = discount;
                await book.save();
                successCount++;
            } catch (err) {
                console.error(`Error saving book ${book._id} during discount:`, err.message);
            }
        }

        res.json({ message: `تم تطبيق الخصم على ${successCount} من أصل ${books.length} كتب`, count: successCount });
    } catch (error) {
        console.error('Apply discount main error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
exports.getAllOrders = async(req, res) => {
    try {
        const { status } = req.query;
        const filter = { isArchived: { $ne: true } };
        if (status) filter.orderStatus = status;

        const orders = await Order.find(filter)
            .select('_id total orderStatus paymentMethod paymentStatus createdAt shippingAddress user items')
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        res.json({ orders });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
exports.getStats = async(req, res) => {
    try {
        const statsBasePromise = Promise.all([
            User.countDocuments() || 0,
            User.countDocuments({ role: 'student' }) || 0,
            User.countDocuments({ role: 'teacher' }) || 0,
            Book.countDocuments({ status: 'approved', isStoreProduct: { $ne: true } }) || 0,
            Book.countDocuments({ status: 'approved', isStoreProduct: true }) || 0,
            Book.countDocuments({ status: 'pending' }) || 0,
            Order.countDocuments({ isArchived: { $ne: true } }) || 0,
            Visitor.countDocuments({ lastActive: { $gte: new Date(Date.now() - 3 * 60 * 1000) } }) || 0,
            Book.countDocuments({ stock: { $lte: 0 } }) || 0,
            Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed', 'processing'] }, isArchived: { $ne: true } }) || 0,
            Order.countDocuments({ orderStatus: 'delivered', isArchived: { $ne: true } }) || 0,
            Book.aggregate([{ $group: { _id: null, total: { $sum: '$totalSold' } } }]).then(res => res[0]?.total || 0)
        ]);

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const revenueAggPromise = Order.aggregate([
            { $match: { orderStatus: { $ne: 'cancelled' }, isArchived: { $ne: true } } },
            {
                $facet: {
                    totalRevenue: [{ $group: { _id: null, total: { $sum: '$total' } } }],
                    todayOrders: [{ $match: { createdAt: { $gte: startOfToday } } }, { $count: 'count' }],
                    revenueAnalysis: [
                        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 }, timestamp: { $first: '$createdAt' } } },
                        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
                        { $limit: 30 }
                    ],
                    monthlyAnalysis: [
                        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
                        { $sort: { '_id.year': -1, '_id.month': -1 } },
                        { $limit: 12 }
                    ]
                }
            }
        ]).exec();

        let countsResults, aggregateResults;
        try {
            [countsResults, aggregateResults] = await Promise.all([statsBasePromise, revenueAggPromise]);
        } catch (err) {
            console.error('Promise block error in getStats:', err);
            throw new Error(`Data fetching failed: ${err.message}`);
        }

        const countsSafe = countsResults || [0,0,0,0,0,0,0,0];
        const revData = (aggregateResults && aggregateResults[0]) ? aggregateResults[0] : {};

        res.json({
            totalUsers: countsSafe[0] || 0,
            totalStudents: countsSafe[1] || 0,
            totalTeachers: countsSafe[2] || 0,
            totalBooks: countsSafe[3] || 0,
            totalStoreProducts: countsSafe[4] || 0,
            pendingBooks: countsSafe[5] || 0,
            totalOrders: countsSafe[6] || 0,
            activeUsers: countsSafe[7] || 0,
            outOfStockCount: countsSafe[8] || 0,
            activeOrdersCount: countsSafe[9] || 0,
            completedOrdersCount: countsSafe[10] || 0,
            totalItemsSold: countsSafe[11] || 0,
            todayOrders: (revData.todayOrders && revData.todayOrders[0]?.count) || 0,
            totalRevenue: (revData.totalRevenue && revData.totalRevenue[0]?.total) || 0,
            dailyRevenue: Array.isArray(revData.revenueAnalysis) ? [...revData.revenueAnalysis].reverse() : [],
            monthlyRevenue: Array.isArray(revData.monthlyAnalysis) ? [...revData.monthlyAnalysis].reverse() : [],
        });
    } catch (error) {
        console.error('getStats FATAL error:', error);
        res.status(500).json({ message: 'خطأ في جلب الإحصائيات', error: error.message });
    }
};

exports.resetAllStats = async(req, res) => {
    try {
        // We ARCHIVE instead of delete to keep users' history
        await Order.updateMany({ isArchived: { $ne: true } }, { isArchived: true });
        res.json({ message: 'Stats reset' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete single order
// @route   DELETE /api/admin/orders/:id
exports.deleteOrder = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        await order.deleteOne();
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get count of pending orders (placed status)
// @route   GET /api/admin/orders/pending-count
exports.getPendingOrdersCount = async(req, res) => {
    try {
        const count = await Order.countDocuments({ orderStatus: 'placed', isArchived: { $ne: true } });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete single order
// @route   DELETE /api/admin/orders/:id
exports.deleteOrder = async(req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        await order.deleteOne();
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Bulk delete orders
// @route   POST /api/admin/orders/bulk-delete
exports.bulkDeleteOrders = async(req, res) => {
    try {
        const { orderIds } = req.body;
        if (!Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ message: 'Invalid order IDs' });
        }
        await Order.deleteMany({ _id: { $in: orderIds } });
        res.json({ message: 'Orders deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};