const { supabase } = require('../config/db');
const { createChainable, createSingleChainable } = require('../utils/queryHelpers');

const mapAdminTeacherFromPg = (data) => {
    if (!data) return null;
    return {
        _id: data.id,
        id: data.id,
        name: data.name,
        photo: data.photo || '',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

class AdminTeacherName {
    static find(query = {}) {
        return createChainable(async () => {
            let builder = supabase.from('admin_teacher_names').select('*').order('name', { ascending: true });
            const { data, error } = await builder;
            if (error) throw error;
            return (data || []).map(mapAdminTeacherFromPg);
        });
    }

    static async findOne(query) {
        let builder = supabase.from('admin_teacher_names').select('*');
        if (query.name) builder = builder.eq('name', query.name.trim());
        const { data, error } = await builder.maybeSingle();
        if (error) throw error;
        return mapAdminTeacherFromPg(data);
    }

    static async create(atData) {
        const payload = {
            name: atData.name,
            photo: atData.photo || '',
        };
        const { data, error } = await supabase.from('admin_teacher_names').insert(payload).select().single();
        if (error) throw error;
        return mapAdminTeacherFromPg(data);
    }

    static async findByIdAndUpdate(id, updateData, options = {}) {
        const update = updateData.$set || updateData;
        const payload = {};
        if (update.name !== undefined) payload.name = update.name;
        if (update.photo !== undefined) payload.photo = update.photo;
        payload.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('admin_teacher_names').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return mapAdminTeacherFromPg(data);
    }

    static async findByIdAndDelete(id) {
        const { data, error } = await supabase.from('admin_teacher_names').delete().eq('id', id).select().single();
        if (error) throw error;
        return mapAdminTeacherFromPg(data);
    }
}

module.exports = AdminTeacherName;
