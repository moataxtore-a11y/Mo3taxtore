const { supabase } = require('../config/db');
const { createChainable } = require('../utils/queryHelpers');

const mapGradeFromPg = (data) => {
    if (!data) return null;
    return {
        _id: data.id,
        id: data.id,
        name: data.name,
        order: Number(data.order_num || 0),
        isActive: Boolean(data.is_active),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        deleteOne: async function() {
            return await Grade.findByIdAndDelete(this.id);
        },
        save: async function() {
            return await Grade.findByIdAndUpdate(this.id, this);
        }
    };
};

class Grade {
    static find(query = {}) {
        return createChainable(async () => {
            let builder = supabase.from('grades').select('*');
            if (query.isActive !== undefined) builder = builder.eq('is_active', query.isActive);
            builder = builder.order('order_num', { ascending: true }).order('created_at', { ascending: false });

            const { data, error } = await builder;
            if (error) throw error;
            return (data || []).map(mapGradeFromPg);
        });
    }

    static async findOne(query) {
        let builder = supabase.from('grades').select('*');
        if (query.name) builder = builder.eq('name', query.name.trim());
        if (query._id) builder = builder.eq('id', query._id);
        const { data, error } = await builder.maybeSingle();
        if (error) throw error;
        return mapGradeFromPg(data);
    }

    static async create(gradeData) {
        const payload = {
            name: gradeData.name,
            order_num: gradeData.order || 0,
            is_active: gradeData.isActive !== undefined ? gradeData.isActive : true,
        };
        const { data, error } = await supabase.from('grades').insert(payload).select().single();
        if (error) throw error;
        return mapGradeFromPg(data);
    }

    static async findByIdAndUpdate(id, updateData, options = {}) {
        const update = updateData.$set || updateData;
        const payload = {};
        if (update.name !== undefined) payload.name = update.name;
        if (update.order !== undefined) payload.order_num = update.order;
        if (update.isActive !== undefined) payload.is_active = update.isActive;
        payload.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('grades').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return mapGradeFromPg(data);
    }

    static async findByIdAndDelete(id) {
        const { data, error } = await supabase.from('grades').delete().eq('id', id).select().single();
        if (error) throw error;
        return mapGradeFromPg(data);
    }
}

module.exports = Grade;
