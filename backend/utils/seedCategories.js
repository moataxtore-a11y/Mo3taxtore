const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');

const categories = [
    { name: 'الرياضيات', slug: 'mathematics', icon: 'FaCalculator', color: '#31605F', order: 1 },
    { name: 'العلوم', slug: 'science', icon: 'FaFlask', color: '#31605F', order: 2 },
    { name: 'اللغة العربية', slug: 'arabic', icon: 'FaLanguage', color: '#31605F', order: 3 },
    { name: 'اللغة الإنجليزية', slug: 'english', icon: 'FaGlobeAmericas', color: '#31605F', order: 4 },
    { name: 'الفنون', slug: 'art', icon: 'FaPalette', color: '#31605F', order: 5 },
    { name: 'الحاسب الآلي', slug: 'computer-science', icon: 'FaLaptopCode', color: '#31605F', order: 6 },
    { name: 'التاريخ', slug: 'history', icon: 'FaBook', color: '#31605F', order: 7 },
    { name: 'الجغرافيا', slug: 'geography', icon: 'FaMapMarkerAlt', color: '#31605F', order: 8 },
    { name: 'الفيزياء', slug: 'physics', icon: 'FaBolt', color: '#31605F', order: 9 },
    { name: 'الكيمياء', slug: 'chemistry', icon: 'FaVial', color: '#31605F', order: 10 },
    { name: 'الأحياء', slug: 'biology', icon: 'FaDna', color: '#31605F', order: 11 },
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if categories already exist
        const count = await Category.countDocuments();
        if (count > 0) {
            console.log('Categories already exist. Use clean-up if you want to re-seed.');
            // Update icons for existing ones to match Fa names
            for (const cat of categories) {
                await Category.findOneAndUpdate({ slug: cat.slug }, { icon: cat.icon }, { upsert: true });
            }
            console.log('Icons updated.');
        } else {
            await Category.insertMany(categories);
            console.log('Categories seeded!');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedCategories();
