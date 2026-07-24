const CmsContent = require('../models/CmsContent');
const Book = require('../models/Book');

// Get CMS Content by Key
exports.getCmsContent = async(req, res) => {
    try {
        const { key } = req.params;
        const content = await CmsContent.findOne({ key });
        if (!content) {
            if (key === 'footer-settings') {
                return res.json({
                    content: {
                        key: 'footer-settings',
                        content: { facebook: '#', instagram: '#', whatsapp: '#', tiktok: '#', developerName: 'Moataz', developerLink: '#' }
                    }
                });
            }
            return res.status(404).json({ message: 'Content not found' });
        }
        res.json({ content });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update CMS Content
exports.updateCmsContent = async(req, res) => {
    try {
        const { key } = req.params;
        const { title } = req.body;
        let content = req.body.content;

        // Content might be a string if sent via FormData
        if (typeof content === 'string') {
            try {
                content = JSON.parse(content);
            } catch (e) {
                // Keep as string if not JSON
            }
        }

        // If an image was uploaded, add it to the content object
        if (req.file) {
            if (typeof content === 'object' && content !== null) {
                content.image = req.file.path;
            } else {
                content = { image: req.file.path };
            }
        }

        const updatedContent = await CmsContent.findOneAndUpdate({ key }, { title, content }, { new: true, upsert: true });

        res.json({ message: 'Content updated successfully', content: updatedContent });
    } catch (err) {
        console.error('Update CMS Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All CMS Content (for Admin)
exports.getAllCmsContent = async(req, res) => {
    try {
        const requiredKeys = [{
                key: 'about-us',
                title: 'من نحن',
                content: {
                    subtitle: '',
                    vision: '',
                    values: '',
                    mission: '',
                    featureCards: [
                        { icon: 'FiTarget', title: 'رؤيتنا', description: 'نطمح لأن نكون المنصة الأولى في الوطن العربي التي تجمع بين سهولة الوصول للكتاب وبين جودة المحتوى التعليمي.' },
                        { icon: 'FiHeart', title: 'قيمنا', description: 'الأمانة في تقديم المحتوى، السرعة في التوصيل، ودعم المعلمين المبدعين هم الأعمدة التي قمنا ببناء معتز ستور عليها.' },
                        { icon: 'FiSmile', title: 'مهمتنا', description: 'تمكين كل طالب عربي من الوصول إلى المعرفة بكل يسر وتوفير بيئة تعليمية متكاملة تساعده على التفوق والنجاح.' }
                    ],
                    story: '',
                    statsCards: [
                        { icon: 'FiUsers', title: '+10,000', label: 'طالب سعيد' },
                        { icon: 'FiBookOpen', title: '+5,000', label: 'كتاب ومصدر' },
                        { icon: 'FiAward', title: '+5', label: 'سنوات خبرة' },
                        { icon: 'FiActivity', title: '99%', label: 'معدل رضا' }
                    ],
                    image: '',
                    showTeachers: true,
                    showCTA: true,
                    ctaTitle: 'ابدأ رحلة التعلم اليوم',
                    ctaButtonText: 'تصفح المكتبة الآن',
                    ctaLink: '/marketplace'
                }
            },
            {
                key: 'faq',
                title: 'الأسئلة الشائعة',
                content: []
            },
            {
                key: 'footer-settings',
                title: 'إعدادات الفوتر والروابط',
                content: { facebook: '#', instagram: '#', whatsapp: '#', tiktok: '#', developerName: 'Moataz', developerLink: '#' }
            }
        ];

        for (const item of requiredKeys) {
            await CmsContent.updateOne({ key: item.key }, { $setOnInsert: item }, { upsert: true });
        }

        const contents = await CmsContent.find();
        res.json({ contents });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Best Sellers Books
exports.getBestSellers = async(req, res) => {
    try {
        const books = await Book.find({ status: 'approved', isStoreProduct: false });
        books.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
        res.json({ books: books.slice(0, 10) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};