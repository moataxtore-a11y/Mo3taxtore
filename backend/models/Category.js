const { supabase } = require('../config/db');
const { createChainable, createSingleChainable } = require('../utils/queryHelpers');

const mapCategoryFromPg = (data) => {
    if (!data) return null;
    return {
        _id: data.id,
        id: data.id,
        name: data.name,
        slug: data.slug,
        icon: data.icon || 'FaBook',
        color: data.color || '#31605F',
        isActive: Boolean(data.is_active),
        categoryType: data.category_type || 'book',
        order: Number(data.order_num || 0),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        deleteOne: async function() {
            return await Category.findByIdAndDelete(this.id);
        },
        save: async function() {
            return await Category.findByIdAndUpdate(this.id, this);
        }
    };
};

const mapCategoryToPg = (data) => {
    const pg = {};
    if (data.name !== undefined) pg.name = data.name;
    if (data.slug !== undefined) pg.slug = data.slug;
    if (data.icon !== undefined) pg.icon = data.icon;
    if (data.color !== undefined) pg.color = data.color;
    if (data.isActive !== undefined) pg.is_active = data.isActive;
    if (data.categoryType !== undefined) pg.category_type = data.categoryType;
    if (data.order !== undefined) pg.order_num = data.order;
    return pg;
};

class Category {
    static find(query = {}) {
        return createChainable(async () => {
            let builder = supabase.from('categories').select('*');
            if (query.isActive !== undefined) builder = builder.eq('is_active', query.isActive);
            if (query.categoryType) builder = builder.eq('category_type', query.categoryType);

            builder = builder.order('order_num', { ascending: true }).order('created_at', { ascending: false });

            const { data, error } = await builder;
            if (error) throw error;
            return (data || []).map(mapCategoryFromPg);
        });
    }

    static async findById(id) {
        if (!id) return null;
        const { data, error } = await supabase.from('categories').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        return withChainSingle(mapCategoryFromPg(data), { table: 'categories', idField: 'id' });
    }

    static async findOne(query) {
        let builder = supabase.from('categories').select('*');
        if (query.slug) builder = builder.eq('slug', query.slug);
        if (query.name) builder = builder.eq('name', query.name);
        if (query._id) builder = builder.eq('id', query._id);

        const { data, error } = await builder.maybeSingle();
        if (error) throw error;
        return withChainSingle(mapCategoryFromPg(data), { table: 'categories', idField: 'id' });
    }

    static async create(categoryData) {
        const payload = mapCategoryToPg(categoryData);
        const { data, error } = await supabase.from('categories').insert(payload).select().single();
        if (error) throw error;
        return mapCategoryFromPg(data);
    }

    static async findByIdAndUpdate(id, updateData, options = {}) {
        const payload = mapCategoryToPg(updateData.$set || updateData);
        payload.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return mapCategoryFromPg(data);
    }

    static async findByIdAndDelete(id) {
        const { data, error } = await supabase.from('categories').delete().eq('id', id).select().single();
        if (error) throw error;
        return mapCategoryFromPg(data);
    }
}

module.exports = Category;
