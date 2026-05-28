const mongoose = require('mongoose');

const maskMongoUri = (uri) => {
    if (!uri) return uri;
    return uri.replace(/\/\/(.*?):(.*?)@/, '//***:***@');
};

const getMongoConnectOptions = () => ({
    family: 4, // Force IPv4 to prevent IPv6 DNS issues
    serverSelectionTimeoutMS: 5000,
});

const connectDB = async() => {
    try {
        const uri = process.env.MONGODB_URI;
        console.log('MongoDB URI:', maskMongoUri(uri));
        console.log('MongoDB URI scheme:', uri && uri.startsWith('mongodb+srv://') ? 'mongodb+srv (SRV lookup)' : 'mongodb (standard)');

        const conn = await mongoose.connect(uri, getMongoConnectOptions());
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        const primaryUri = process.env.MONGODB_URI;
        const fallbackUri = process.env.MONGODB_URI_FALLBACK;

        const isSrvNotFound =
            (error && (error.code === 'ENOTFOUND' || error.code === 'EREFUSED')) &&
            typeof error.message === 'string' &&
            error.message.includes('querySrv ENOTFOUND');

        if (isSrvNotFound && fallbackUri) {
            console.error(`MongoDB SRV lookup failed: ${error.message}`);
            console.warn('Trying MongoDB fallback URI:', maskMongoUri(fallbackUri));

            try {
                const conn = await mongoose.connect(fallbackUri, getMongoConnectOptions());
                console.log(`MongoDB Connected (fallback): ${conn.connection.host}`);
                return;
            } catch (fallbackError) {
                console.error(`MongoDB Fallback Connection Error: ${fallbackError.message}`);
                throw fallbackError;
            }
        }

        console.error(`MongoDB Connection Error: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;