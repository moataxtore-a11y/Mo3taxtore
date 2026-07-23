const { supabase } = require('../config/db');

const mapSettingsFromPg = (data) => {
    if (!data) return null;
    return {
        _id: data.id,
        id: data.id,
        freeShippingThreshold: Number(data.free_shipping_threshold || 500),
        governorates: data.governorates || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

class ShippingSettings {
    static async findOne() {
        const { data, error } = await supabase.from('shipping_settings').select('*').limit(1).maybeSingle();
        if (error) throw error;
        return mapSettingsFromPg(data);
    }

    static async findOneAndUpdate(filter, updateData, options = {}) {
        const payload = {};
        const update = updateData.$set || updateData;
        if (update.freeShippingThreshold !== undefined) payload.free_shipping_threshold = update.freeShippingThreshold;
        if (update.governorates !== undefined) payload.governorates = update.governorates;
        payload.updated_at = new Date().toISOString();

        const current = await ShippingSettings.findOne();
        if (current) {
            const { data, error } = await supabase.from('shipping_settings').update(payload).eq('id', current.id).select().single();
            if (error) throw error;
            return mapSettingsFromPg(data);
        } else {
            const { data, error } = await supabase.from('shipping_settings').insert(payload).select().single();
            if (error) throw error;
            return mapSettingsFromPg(data);
        }
    }
}

module.exports = ShippingSettings;