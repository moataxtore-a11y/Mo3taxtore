const ShippingSettings = require('../models/ShippingSettings');

const defaultGovernorates = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية',
    'الغربية', 'كفر الشيخ', 'البحيرة', 'المنيا', 'أسيوط', 'سوهاج',
    'قنا', 'الأقصر', 'أسوان', 'الفيوم', 'بني سويف', 'بورسعيد',
    'دمياط', 'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء',
    'الوادي الجديد', 'مطروح', 'البحر الأحمر',
];

// @desc    Get shipping settings (Public)
// @route   GET /api/settings/shipping
exports.getShippingSettings = async(req, res) => {
    try {
        let settings = await ShippingSettings.findOne();
        let isNew = false;

        if (!settings) {
            settings = await ShippingSettings.findOneAndUpdate({}, {
                freeShippingThreshold: 500,
                governorates: [],
            }, { upsert: true });
            isNew = true;
        }

        // Sync missing default governorates
        let updated = false;
        let governorates = settings.governorates || [];

        const englishNames = ['Cairo', 'Giza', 'Alexandria'];
        if (governorates.some(g => englishNames.includes(g.name))) {
            governorates = governorates.filter(g => !englishNames.includes(g.name));
            updated = true;
        }

        defaultGovernorates.forEach((govName) => {
            const exists = governorates.find((g) => g.name === govName);
            if (!exists) {
                governorates.push({ name: govName, price: 30 }); // default price
                updated = true;
            }
        });

        // De-duplicate governorates by name (safety against historical bad data)
        if (governorates.length) {
            const seen = new Set();
            const deduped = [];
            governorates.forEach((g) => {
                const name = ((g && g.name) || '').trim();
                if (!name || seen.has(name)) return;
                seen.add(name);
                deduped.push({ name, price: Number(g && g.price) || 0 });
            });

            if (deduped.length !== governorates.length) {
                governorates = deduped;
                updated = true;
            }
        }

        if (isNew || updated) {
            settings = await ShippingSettings.findOneAndUpdate({}, {
                governorates,
            });
        }

        res.json({ settings });
    } catch (error) {
        console.error('getShippingSettings error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update shipping settings (Admin)
// @route   PUT /api/settings/shipping
exports.updateShippingSettings = async(req, res) => {
    try {
        const { freeShippingThreshold, governorates } = req.body;
        const updateData = {};

        if (freeShippingThreshold !== undefined) {
            updateData.freeShippingThreshold = freeShippingThreshold;
        }
        if (governorates && Array.isArray(governorates)) {
            updateData.governorates = governorates;
        }

        let settings = await ShippingSettings.findOneAndUpdate({}, updateData);
        res.json({ settings, message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};