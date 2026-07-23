const { supabase } = require('../config/db');
const User = require('./User');

const fetchOrderItems = async (orderId) => {
    const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (error) return [];
    return (data || []).map(item => ({
        book: item.book_id,
        title: item.title,
        price: Number(item.price),
        originalPrice: Number(item.original_price || item.price),
        discount: Number(item.discount || 0),
        quantity: Number(item.quantity),
        coverImage: item.cover_image,
    }));
};

const mapOrderFromPg = async (data, fetchItems = true) => {
    if (!data) return null;
    const items = fetchItems ? await fetchOrderItems(data.id) : [];

    const orderObj = {
        _id: data.id,
        id: data.id,
        user: data.user_id,
        items,
        shippingAddress: data.shipping_address || {},
        subtotal: Number(data.subtotal),
        discount: Number(data.discount || 0),
        couponCode: data.coupon_code,
        deliveryFee: Number(data.delivery_fee || 30),
        total: Number(data.total),
        paymentMethod: data.payment_method || 'cod',
        paymentStatus: data.payment_status || 'pending',
        orderStatus: data.order_status || 'placed',
        trackingNumber: data.tracking_number,
        statusHistory: data.status_history || [],
        isArchived: Boolean(data.is_archived),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        save: async function() {
            const { data: updated, error } = await supabase.from('orders').update({
                order_status: this.orderStatus,
                payment_status: this.paymentStatus,
                tracking_number: this.trackingNumber,
                status_history: this.statusHistory,
                is_archived: this.isArchived,
                updated_at: new Date().toISOString()
            }).eq('id', this.id).select().single();
            if (error) throw error;
            return await mapOrderFromPg(updated, true);
        }
    };
    return orderObj;
};

class Order {
    static async create(orderData) {
        const { data: order, error } = await supabase.from('orders').insert({
            user_id: orderData.user,
            shipping_address: orderData.shippingAddress,
            subtotal: orderData.subtotal,
            discount: orderData.discount || 0,
            coupon_code: orderData.couponCode,
            delivery_fee: orderData.deliveryFee || 30,
            total: orderData.total,
            payment_method: orderData.paymentMethod || 'cod',
            payment_status: orderData.paymentStatus || 'pending',
            order_status: orderData.orderStatus || 'placed',
            status_history: orderData.statusHistory || [{ status: 'placed', note: 'Order placed successfully' }],
        }).select().single();

        if (error) throw error;

        // Insert Order Items
        if (orderData.items && orderData.items.length > 0) {
            const itemsPayload = orderData.items.map(item => ({
                order_id: order.id,
                book_id: item.book,
                title: item.title,
                price: item.price,
                original_price: item.originalPrice || item.price,
                discount: item.discount || 0,
                quantity: item.quantity,
                cover_image: item.coverImage,
            }));
            await supabase.from('order_items').insert(itemsPayload);
        }

        return await mapOrderFromPg(order, true);
    }

    static async find(query = {}) {
        let builder = supabase.from('orders').select('*');
        if (query.user) builder = builder.eq('user_id', query.user);
        if (query.orderStatus) builder = builder.eq('order_status', query.orderStatus);

        builder = builder.order('created_at', { ascending: false });

        const { data, error } = await builder;
        if (error) throw error;

        const results = [];
        for (const o of (data || [])) {
            results.push(await mapOrderFromPg(o, true));
        }

        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        results.lean = function() { return this; };
        return results;
    }

    static async findById(id) {
        if (!id) return null;
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        if (!data) return null;

        const orderObj = await mapOrderFromPg(data, true);

        // Chain helper for populate('user')
        orderObj.populate = async function(field, selectStr) {
            if (field === 'user' && this.user) {
                const u = await User.findById(this.user);
                this.user = u;
            }
            return this;
        };

        return orderObj;
    }
}

module.exports = Order;