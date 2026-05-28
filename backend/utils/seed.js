const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Book = require('../models/Book');

const seedDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB for seeding');

        // Clear existing data
        await User.deleteMany({});
        await Book.deleteMany({});
        console.log('🗑️ Cleared existing data');

        // Create admin
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@moataxtore.com',
            phone: '01000000000',
            password: 'admin123',
            role: 'admin',
            isVerified: true,
        });
        console.log('👑 Admin created: 01000000000 / admin123');

        // Create teachers
        const teachers = await User.create([
            { name: 'أ. محمد حسن', email: 'mohamed@moataxtore.com', phone: '01000000001', password: 'teacher123', role: 'teacher', isVerified: true, bio: 'مدرس رياضيات خبرة 15 سنة', subject: 'رياضيات' },
            { name: 'أ. سارة أحمد', email: 'sara@moataxtore.com', phone: '01000000002', password: 'teacher123', role: 'teacher', isVerified: true, bio: 'مدرسة علوم متخصصة في الفيزياء', subject: 'فيزياء' },
            { name: 'أ. عمر خالد', email: 'omar@moataxtore.com', phone: '01000000003', password: 'teacher123', role: 'teacher', isVerified: true, bio: 'مدرس لغة عربية وآدابها', subject: 'عربي' },
        ]);
        console.log('👩‍🏫 Teachers created');

        // Create students
        await User.create([
            { name: 'أحمد طارق', email: 'ahmed@student.com', phone: '01000000004', password: 'student123', role: 'student', isVerified: true },
            { name: 'نور الهدى', email: 'nour@student.com', phone: '01000000005', password: 'student123', role: 'student', isVerified: true },
        ]);
        console.log('🎓 Students created');

        // Create books
        const books = [
            { title: 'أساسيات الجبر والهندسة', description: 'كتاب شامل يغطي أساسيات الجبر والهندسة للصف الثالث الإعدادي. يحتوي على شرح مبسط وتمارين متنوعة وامتحانات تدريبية.', price: 85, category: 'mathematics', teacher: teachers[0]._id, stock: 50, pages: 320, grade: 'الثالث الإعدادي', status: 'approved', totalSold: 120 },
            { title: 'التفاضل والتكامل - شرح مبسط', description: 'شرح مبسط لمادة التفاضل والتكامل للصف الثالث الثانوي مع حلول نموذجية لامتحانات السنوات السابقة.', price: 120, category: 'mathematics', teacher: teachers[0]._id, stock: 30, pages: 450, grade: 'الثالث الثانوي', status: 'approved', totalSold: 85 },
            { title: 'الفيزياء الحديثة', description: 'مرجع شامل في الفيزياء الحديثة يتضمن النظرية النسبية وميكانيكا الكم والفيزياء النووية.', price: 150, category: 'physics', teacher: teachers[1]._id, stock: 25, pages: 380, grade: 'الثالث الثانوي', status: 'approved', totalSold: 65 },
            { title: 'مبادئ الكيمياء العضوية', description: 'كتاب متخصص في الكيمياء العضوية للثانوية العامة مع رسوم توضيحية وتجارب عملية.', price: 95, category: 'chemistry', teacher: teachers[1]._id, stock: 40, pages: 280, grade: 'الثاني الثانوي', status: 'approved', totalSold: 45 },
            { title: 'قواعد النحو والصرف', description: 'كتاب متكامل في قواعد النحو والصرف العربي مع أمثلة من القرآن الكريم والشعر العربي.', price: 70, category: 'arabic', teacher: teachers[2]._id, stock: 60, pages: 250, grade: 'جميع المراحل', status: 'approved', totalSold: 200 },
            { title: 'البلاغة العربية المبسطة', description: 'شرح مبسط لعلوم البلاغة: المعاني والبيان والبديع مع تدريبات شاملة.', price: 65, category: 'arabic', teacher: teachers[2]._id, stock: 45, pages: 200, grade: 'الثانوي', status: 'approved', totalSold: 90 },
            { title: 'English Grammar Masterclass', description: 'A comprehensive grammar guide for secondary school students covering all topics from basic to advanced.', price: 110, category: 'english', teacher: teachers[0]._id, stock: 35, pages: 300, grade: 'Secondary', status: 'approved', totalSold: 55 },
            { title: 'العلوم للمرحلة الإعدادية', description: 'كتاب شامل في العلوم يغطي الأحياء والكيمياء والفيزياء للمرحلة الإعدادية.', price: 80, category: 'science', teacher: teachers[1]._id, stock: 55, pages: 350, grade: 'الإعدادية', status: 'approved', totalSold: 75 },
            { title: 'مقدمة في البرمجة', description: 'تعلم أساسيات البرمجة بلغة Python مع مشاريع عملية وتمارين تطبيقية.', price: 130, category: 'computer-science', teacher: teachers[0]._id, stock: 20, pages: 400, grade: 'الثانوي', status: 'approved', totalSold: 40 },
            { title: 'تاريخ مصر القديمة', description: 'رحلة في تاريخ مصر الفرعونية من الأسرة الأولى حتى نهاية العصر البطلمي.', price: 75, category: 'history', teacher: teachers[2]._id, stock: 3, pages: 280, grade: 'الإعدادية', status: 'approved', totalSold: 30 },
            { title: 'الأحياء الدقيقة', description: 'كتاب في المراجعة النهائية للأحياء. كتاب جديد قيد المراجعة.', price: 90, category: 'biology', teacher: teachers[1]._id, stock: 15, pages: 220, grade: 'الثالث الثانوي', status: 'pending', totalSold: 0 },
        ];

        await Book.create(books);
        console.log(`📚 ${books.length} books created`);

        console.log('\n✨ Database seeded successfully!');
        console.log('\n📋 Login credentials:');
        console.log('   Admin:   01000000000 / admin123');
        console.log('   Teacher: 01000000001 / teacher123');
        console.log('   Teacher: 01000000002 / teacher123');
        console.log('   Student: 01000000004 / student123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedDB();