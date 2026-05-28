const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function test() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');
        const CmsContent = require('./backend/models/CmsContent');
        const contents = await CmsContent.find();
        console.log('CMS Contents count:', contents.length);
        if (contents.length === 0) {
            console.log('Seeding CMS data...');
            await CmsContent.create([
                {
                    key: 'about-us',
                    title: 'من نحن',
                    content: {
                        vision: 'رؤيتنا هي تبسيط الوصول للمحتوى التعليمي لكل طالب في مصر.',
                        values: 'الأمانة، الجودة، والسرعة هم محركنا الأساسي.',
                        story: 'بدأنا كفكرة صغيرة لتوفير كتب المدرسين المتميزين للجميع.'
                    }
                },
                {
                    key: 'faq',
                    title: 'الأسئلة الشائعة',
                    content: [
                        { question: 'كيف يمكنني الشراء؟', answer: 'ببساطة اضف الكتب للسلة وأتم الطلب.' },
                        { question: 'ما هي مدة التوصيل؟', answer: 'من ٢ إلى ٤ أيام عمل.' }
                    ]
                }
            ]);
            console.log('✅ Seeded');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed:', err.message);
        process.exit(1);
    }
}

test();
