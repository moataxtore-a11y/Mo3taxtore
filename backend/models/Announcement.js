const { supabase } = require('../config/db');
const { createChainable, createSingleChainable } = require('../utils/queryHelpers');

const mapAnnouncementFromPg = (data) => {
    if (!data) return null;
    return {
        _id: data.id,
        id: data.id,
        text: data.text,
        link: data.link || '',
        isActive: Boolean(data.is_active),
        priority: Number(data.priority || 0),
        displayType: data.display_type || 'static',
        icon: data.icon || 'FiAlertCircle',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

class Announcement {
    static find(query = {}) {
        return createChainable(async () => {
            let builder = supabase.from('announcements').select('*');
            if (query.isActive !== undefined) builder = builder.eq('is_active', query.isActive);
            builder = builder.order('priority', { ascending: false }).order('created_at', { ascending: false });

            const { data, error } = await builder;
            if (error) throw error;
            return (data || []).map(mapAnnouncementFromPg);
        });
    }

    static async findById(id) {
        if (!id) return null;
        const { data, error } = await supabase.from('announcements').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        return withChainSingle(mapAnnouncementFromPg(data), { table: 'announcements', idField: 'id' });
    }

    static async create(ancData) {
        const payload = {
            text: ancData.text,
            link: ancData.link || '',
            is_active: ancData.isActive !== undefined ? ancData.isActive : true,
            priority: ancData.priority || 0,
            display_type: ancData.displayType || 'static',
            icon: ancData.icon || 'FiAlertCircle',
        };
        const { data, error } = await supabase.from('announcements').insert(payload).select().single();
        if (error) throw error;
        return withChainSingle(mapAnnouncementFromPg(data), { table: 'announcements', idField: 'id' });
    }

    static async findByIdAndUpdate(id, updateData, options = {}) {
        const update = updateData.$set || updateData;
        const payload = {};
        if (update.text !== undefined) payload.text = update.text;
        if (update.link !== undefined) payload.link = update.link;
        if (update.isActive !== undefined) payload.is_active = update.isActive;
        if (update.priority !== undefined) payload.priority = update.priority;
        if (update.displayType !== undefined) payload.display_type = update.displayType;
        if (update.icon !== undefined) payload.icon = update.icon;
        payload.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('announcements').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return mapAnnouncementFromPg(data);
    }

    static async findByIdAndDelete(id) {
        const { data, error } = await supabase.from('announcements').delete().eq('id', id).select().single();
        if (error) throw error;
        return mapAnnouncementFromPg(data);
    }
}

module.exports = Announcement;
