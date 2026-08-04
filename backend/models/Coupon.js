const { supabase } = require('../config/db');
const { createChainable, createSingleChainable, withChainSingle } = require('../utils/queryHelpers');

const mapCouponFromPg = (data) => {
    if (!data) return null;
    return {
        _id: data.id,
        id: data.id,
        code: data.code,
        discountType: data.discount_type || 'percentage',
        discountAmount: Number(data.discount_amount),
        minPurchase: Number(data.min_purchase || 0),
        expiryDate: data.expiry_date,
        usageLimit: data.usage_limit,
        usedCount: Number(data.used_count || 0),
        isActive: Boolean(data.is_active),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isValid: function(orderAmount) {
            const now = new Date();
            if (!this.isActive) return { valid: false, message: 'الكوبون غير مفعل' };
            if (now > new Date(this.expiryDate)) return { valid: false, message: 'الكوبون منتهي الصلاحية' };
            if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
                return { valid: false, message: 'وصل الكوبون للحد الأقصى للاستخدام' };
            }
            if (orderAmount < this.minPurchase) {
                return { valid: false, message: `الحد الأدنى لاستخدام الكوبون هو ${this.minPurchase} جنيه` };
            }
            return { valid: true };
        },
        save: async function() {
            const { data: updated, error } = await supabase.from('coupons').update({
                used_count: this.usedCount,
                is_active: this.isActive,
                updated_at: new Date().toISOString()
            }).eq('id', this.id).select().single();
            if (error) throw error;
            return mapCouponFromPg(updated);
        },
        deleteOne: async function() {
            return await Coupon.findByIdAndDelete(this.id);
        }
    };
};

const mapCouponToPg = (data) => {
    const pg = {};
    if (data.code !== undefined) pg.code = data.code.toUpperCase();
    if (data.discountType !== undefined) pg.discount_type = data.discountType;
    if (data.discountAmount !== undefined) pg.discount_amount = data.discountAmount;
    if (data.minPurchase !== undefined) pg.min_purchase = data.minPurchase;
    if (data.expiryDate !== undefined) pg.expiry_date = data.expiryDate;
    if (data.usageLimit !== undefined) pg.usage_limit = data.usageLimit;
    if (data.usedCount !== undefined) pg.used_count = data.usedCount;
    if (data.isActive !== undefined) pg.is_active = data.isActive;
    return pg;
};

class Coupon {
    static find(query = {}) {
        return createChainable(async () => {
            let builder = supabase.from('coupons').select('*').order('created_at', { ascending: false });
            const { data, error } = await builder;
            if (error) throw error;
            return (data || []).map(mapCouponFromPg);
        });
    }

    static async findById(id) {
        if (!id) return null;
        const { data, error } = await supabase.from('coupons').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        return withChainSingle(mapCouponFromPg(data), { table: 'coupons', idField: 'id' });
    }

    static async findOne(query) {
        let builder = supabase.from('coupons').select('*');
        if (query.code) builder = builder.eq('code', query.code.toUpperCase());
        if (query.isActive !== undefined) builder = builder.eq('is_active', query.isActive);
        const { data, error } = await builder.maybeSingle();
        if (error) throw error;
        return withChainSingle(mapCouponFromPg(data), { table: 'coupons', idField: 'id' });
    }

    static async create(couponData) {
        const payload = mapCouponToPg(couponData);
        const { data, error } = await supabase.from('coupons').insert(payload).select().single();
        if (error) throw error;
        return mapCouponFromPg(data);
    }

    static async findByIdAndUpdate(id, updateData, options = {}) {
        const payload = mapCouponToPg(updateData.$set || updateData);
        payload.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('coupons').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return mapCouponFromPg(data);
    }

    static async findByIdAndDelete(id) {
        const { data, error } = await supabase.from('coupons').delete().eq('id', id).select().single();
        if (error) throw error;
        return mapCouponFromPg(data);
    }

    static async updateOne(filter, update) {
        let builder = supabase.from('coupons').select('*');
        if (filter.code) builder = builder.eq('code', filter.code.toUpperCase());
        const { data: coupon } = await builder.maybeSingle();
        if (!coupon) return;

        let newUsedCount = coupon.used_count;
        if (update.$inc && update.$inc.usedCount) {
            newUsedCount = Math.max(0, coupon.used_count + update.$inc.usedCount);
        }

        await supabase.from('coupons').update({
            used_count: newUsedCount,
            updated_at: new Date().toISOString()
        }).eq('id', coupon.id);
    }
}

module.exports = Coupon;
