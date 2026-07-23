const { supabase } = require('../config/db');

const mapVisitorFromPg = (data) => {
    if (!data) return null;
    return {
        _id: data.id,
        id: data.id,
        identifier: data.identifier,
        lastActive: data.last_active,
        isUser: Boolean(data.is_user),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

class Visitor {
    static async findOneAndUpdate(filter, updateData, options = {}) {
        const update = updateData.$set || updateData;
        const payload = {
            identifier: filter.identifier,
            last_active: update.lastActive || new Date().toISOString(),
            is_user: update.isUser !== undefined ? update.isUser : false,
            updated_at: new Date().toISOString()
        };

        const { data: existing } = await supabase.from('visitors').select('*').eq('identifier', filter.identifier).maybeSingle();
        if (existing) {
            const { data, error } = await supabase.from('visitors').update(payload).eq('identifier', filter.identifier).select().single();
            if (error) throw error;
            return mapVisitorFromPg(data);
        } else {
            const { data, error } = await supabase.from('visitors').insert(payload).select().single();
            if (error) throw error;
            return mapVisitorFromPg(data);
        }
    }

    static async countDocuments(query = {}) {
        let builder = supabase.from('visitors').select('id', { count: 'exact', head: true });
        if (query.lastActive && query.lastActive.$gte) {
            builder = builder.gte('last_active', query.lastActive.$gte.toISOString());
        }
        if (query.isUser !== undefined) {
            builder = builder.eq('is_user', query.isUser);
        }

        const { count, error } = await builder;
        if (error) throw error;
        return count || 0;
    }

    static async deleteMany(query = {}) {
        let builder = supabase.from('visitors').delete();
        if (query.lastActive && query.lastActive.$lt) {
            builder = builder.lt('last_active', query.lastActive.$lt.toISOString());
        }
        await builder;
    }
}

module.exports = Visitor;
