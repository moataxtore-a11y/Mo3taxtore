const { supabase } = require('../config/db');
const { createChainable, createSingleChainable } = require('../utils/queryHelpers');

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
        if (query && query.key) builder = builder.eq('key', query.key);
        const { data, error } = await builder.maybeSingle();
        if (error) throw error;
        return mapCmsFromPg(data);
    }

    static async find(query = {}) {
        let builder = supabase.from('cms_content').select('*');
        if (query && query.key) builder = builder.eq('key', query.key);
        const { data, error } = await builder;
        if (error) throw error;
        return (data || []).map(mapCmsFromPg);
    }

    static async updateOne(filter, updateData, options = {}) {
        const update = updateData.$set || updateData.$setOnInsert || updateData;
        const existing = filter && filter.key ? await CmsContent.findOne({ key: filter.key }) : null;
        if (existing) {
            const payload = { ...update, updated_at: new Date().toISOString() };
            const { data, error } = await supabase.from('cms_content').update(payload).eq('key', filter.key).select().single();
            if (error) throw error;
            return mapCmsFromPg(data);
        } else if (options.upsert) {
            const payload = { key: filter.key, ...update, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            const { data, error } = await supabase.from('cms_content').insert(payload).select().single();
            if (error) throw error;
            return mapCmsFromPg(data);
        }
        return null;
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
        } else if (options.upsert) {
            const { data, error } = await supabase.from('cms_content').insert(payload).select().single();
            if (error) throw error;
            return mapCmsFromPg(data);
        }
        return null;
    }
}

module.exports = CmsContent;
