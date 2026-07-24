const express = require('express'); // Restart v2 - 2026-03-27
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

let compression;
try {
    compression = require('compression');
} catch (e) {
    console.warn('Compression module not found. Run "npm install compression" for better performance.');
}

const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherNameRoutes = require('./routes/teacherNameRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const couponRoutes = require('./routes/couponRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

// Compression (Gzip/Brotli)
if (compression) {
    app.use(compression());
}

// Security middleware (Helmet for headers)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

// ─── Security: NoSQL Injection Sanitization (Express 5 compatible) ───
// express-mongo-sanitize crashes on Express 5 because req.query is read-only
const sanitizeNoSQL = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    for (const key of Object.keys(obj)) {
        if (key.startsWith('$')) {
            delete obj[key];
        } else if (typeof obj[key] === 'object') {
            sanitizeNoSQL(obj[key]);
        }
    }
    return obj;
};

// ─── Security: XSS Sanitization ───
// Strip dangerous HTML/script tags from all string values
const stripXSS = (obj) => {
    if (typeof obj === 'string') {
        return obj
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<\/?[^>]+(>|$)/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }
    if (typeof obj !== 'object' || obj === null) return obj;
    for (const key of Object.keys(obj)) {
        obj[key] = stripXSS(obj[key]);
    }
    return obj;
};

app.use((req, res, next) => {
    if (req.body) {
        sanitizeNoSQL(req.body);
        stripXSS(req.body);
    }
    if (req.params) sanitizeNoSQL(req.params);
    next();
});

// ─── Security: Rate Limiting ───
// Global API rate limit
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 200 : 1000,
    message: { message: 'طلبات كثيرة جداً، حاول مرة أخرى لاحقاً.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Strict rate limit for all auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 20 : 100,
    message: { message: 'محاولات كثيرة جداً، حاول مرة أخرى بعد 15 دقيقة.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

// Ultra-strict: Brute-force protection for login specifically
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 5 : 50,
    message: { message: 'تم حظرك مؤقتاً بسبب محاولات تسجيل دخول كثيرة. حاول بعد 15 دقيقة.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Only count failed attempts
});
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', loginLimiter);

// CORS
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
    origin: (origin, callback) => {
        // In development, allow any origin form local network or tools
        if (!origin || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        if (defaultOrigins.indexOf(origin) !== -1 || origin === process.env.CLIENT_URL) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher-names', teacherNameRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/announcements', announcementRoutes);

// Health check & Welcome
app.get('/', (req, res) => {
    res.send('🚀 Moataxtore API is running! Site is on port 5173.');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ignore common browser noise
app.get(/^\/(\.well-known|favicon\.ico).*/, (req, res) => res.status(204).end());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'حجم الملف كبير جداً، يرجى اختيار ملف أصغر (بحد أقصى 10MB).' });
        }
        return res.status(400).json({ message: 'فشل في رفع الملف: ' + err.message });
    }

    // NEVER leak stack traces or internal error details in production
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
        message: isProduction ? 'حدث خطأ في السيرفر' : (err.message || 'Internal server error'),
        ...(!isProduction && { stack: err.stack }),
    });
});

// Connect to Database & Start Server
const startServer = async() => {
    try {
        if (!process.env.SUPABASE_URL) {
            console.warn('⚠️ Missing SUPABASE_URL in backend/.env. Using default configuration.');
        }

        await connectDB();

        const PORT = process.env.PORT || 5000;
        const SITE_PORT = 5173;

        const os = require('os');
        const networkInterfaces = os.networkInterfaces();
        let localIP = 'localhost';

        Object.keys(networkInterfaces).forEach((interfaceName) => {
            networkInterfaces[interfaceName].forEach((iface) => {
                if (iface.family === 'IPv4' && !iface.internal) {
                    localIP = iface.address;
                }
            });
        });

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Moataxtore running on:`);
            console.log(`   - Website (Local):   http://localhost:${SITE_PORT}`);
            console.log(`   - Website (Network): http://${localIP}:${SITE_PORT}`);
            console.log(`   - API Server:        http://${localIP}:${PORT}`);
            console.log(`   - API Health:        http://${localIP}:${PORT}/api/health`);
            console.log(`📚 Ready for connections!`);
        });
    } catch (err) {
        console.error('SERVER FAILED TO START:', err);
        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = app;