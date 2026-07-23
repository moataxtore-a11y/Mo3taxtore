const { supabase } = require('../config/db');

const mapCmsFromPg = (data) => {
    if (!data) return null;
    return {
        _id: data.id,
        id: data.id,
        key: data.key,
        title: data.title,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

class CmsContent {
    static async findOne(query) {
        let builder = supabase.from('cms_content').select('*');
        if (query.key) builder = builder.eq('key', query.key);
        const { data, error } = await builder.maybeSingle();
        if (error) throw error;
        return mapCmsFromPg(data);
    }

    static async findOneAndUpdate(filter, updateData, options = {}) {
        const update = updateData.$set || updateData;
        const payload = {
            key: filter.key || update.key,
            title: update.title,
            content: update.content,
            updated_at: new Date().toISOString()
        };

        const existing = await CmsContent.findOne({ key: filter.key });
        if (existing) {
            const { data, error } = await supabase.from('cms_content').update(payload).eq('key', filter.key).select().single();
            if (error) throw error;
            return mapCmsFromPg(data);
        } else {
            const { data, error } = await supabase.from('cms_content').insert(payload).select().single();
            if (error) throw error;
            return mapCmsFromPg(data);
        }
    }
}

module.exports = CmsContent;
