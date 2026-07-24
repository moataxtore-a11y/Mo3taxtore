const { supabase } = require('../config/db');
const { createChainable, createSingleChainable } = require('../utils/queryHelpers');

const mapTeacherNameFromPg = (data) => {
    if (!data) return null;
    return {
        _id: data.id,
        id: data.id,
        owner: data.owner_id,
        name: data.name,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

class TeacherName {
    static find(query = {}) {
        return createChainable(async () => {
            let builder = supabase.from('teacher_names').select('*');
            if (query.owner) builder = builder.eq('owner_id', query.owner);
            builder = builder.order('created_at', { ascending: false });

            const { data, error } = await builder;
            if (error) throw error;
            return (data || []).map(mapTeacherNameFromPg);
        });
    }

    static async findOne(query) {
        let builder = supabase.from('teacher_names').select('*');
        if (query.owner) builder = builder.eq('owner_id', query.owner);
        if (query.name) builder = builder.eq('name', query.name.trim());
        const { data, error } = await builder.maybeSingle();
        if (error) throw error;
        return withChainSingle(mapTeacherNameFromPg(data), { table: 'teacher_names', idField: 'id' });
    }

    static async create(tnData) {
        const payload = {
            owner_id: tnData.owner,
            name: tnData.name,
        };
        const { data, error } = await supabase.from('teacher_names').insert(payload).select().single();
        if (error) throw error;
        return mapTeacherNameFromPg(data);
    }

    static async findByIdAndDelete(id) {
        const { data, error } = await supabase.from('teacher_names').delete().eq('id', id).select().single();
        if (error) throw error;
        return mapTeacherNameFromPg(data);
    }
}

module.exports = TeacherName;