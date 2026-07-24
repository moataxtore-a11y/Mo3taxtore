const { supabase } = require('../config/db');
const User = require('./User');
const { createChainable, createSingleChainable } = require('../utils/queryHelpers');

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
        save: async function () {
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
        },
        deleteOne: async function () {
            const { error } = await supabase.from('orders').delete().eq('id', this.id);
            if (error) throw error;
            return this;
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

    static find(query = {}) {
        return createChainable(async () => {
            let builder = supabase.from('orders').select('*');
            if (query.user) builder = builder.eq('user_id', query.user);
            if (query.orderStatus) {
                if (typeof query.orderStatus === 'object' && query.orderStatus.$in) {
                    builder = builder.in('order_status', query.orderStatus.$in);
                } else if (typeof query.orderStatus !== 'object') {
                    builder = builder.eq('order_status', query.orderStatus);
                }
            }
            if (query.isArchived !== undefined) {
                if (typeof query.isArchived === 'object' && query.isArchived.$ne !== undefined) {
                    builder = builder.neq('is_archived', query.isArchived.$ne);
                } else if (typeof query.isArchived !== 'object') {
                    builder = builder.eq('is_archived', query.isArchived);
                }
            }

            builder = builder.order('created_at', { ascending: false });

            const { data, error } = await builder;
            if (error) throw error;

            const results = [];
            for (const o of (data || [])) {
                results.push(await mapOrderFromPg(o, true));
            }

            results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return results;
        });
    }

    static async findById(id) {
        if (!id) return null;
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        if (!data) return null;

        const orderObj = await mapOrderFromPg(data, true);

        orderObj.populate = async function (field, selectStr) {
            if (field === 'user' && this.user) {
                const u = await User.findById(this.user);
                this.user = u;
            }
            return this;
        };

        return withChainSingle(orderObj, { table: 'orders', idField: 'id' });
    }

    static async countDocuments(query = {}) {
        let builder = supabase.from('orders').select('id', { count: 'exact', head: true });
        if (query.orderStatus !== undefined) {
            if (typeof query.orderStatus === 'object' && query.orderStatus.$in) {
                builder = builder.in('order_status', query.orderStatus.$in);
            } else if (typeof query.orderStatus !== 'object') {
                builder = builder.eq('order_status', query.orderStatus);
            }
        }
        if (query.isArchived !== undefined) {
            if (typeof query.isArchived === 'object' && query.isArchived.$ne !== undefined) {
                builder = builder.neq('is_archived', query.isArchived.$ne);
            } else if (typeof query.isArchived !== 'object') {
                builder = builder.eq('is_archived', query.isArchived);
            }
        }
        if (query.user) builder = builder.eq('user_id', query.user);
        const { count, error } = await builder;
        if (error) throw error;
        return count || 0;
    }

    static async updateMany(filter, update) {
        const payload = {};
        if (update.isArchived !== undefined) payload.is_archived = update.isArchived;
        if (update.orderStatus !== undefined) payload.order_status = update.orderStatus;
        if (update.paymentStatus !== undefined) payload.payment_status = update.paymentStatus;
        payload.updated_at = new Date().toISOString();

        let builder = supabase.from('orders').update(payload);
        if (filter.isArchived !== undefined && filter.isArchived.$ne !== undefined) {
            builder = builder.neq('is_archived', filter.isArchived.$ne);
        } else if (filter.isArchived !== undefined) {
            builder = builder.eq('is_archived', filter.isArchived);
        }
        if (filter._id && filter._id.$in) {
            builder = builder.in('id', filter._id.$in);
        }
        const { error } = await builder;
        if (error) throw error;
    }

    static async deleteMany(filter) {
        let builder = supabase.from('orders').delete();
        if (filter._id && filter._id.$in) {
            builder = builder.in('id', filter._id.$in);
        }
        const { error } = await builder;
        if (error) throw error;
    }

    static aggregate(pipeline) {
        const exec = async () => {
            if (!pipeline || !pipeline.length) return [];
            let builder = supabase.from('orders').select('*');
            const firstStage = pipeline[0];
            if (firstStage && firstStage.$match) {
                const m = firstStage.$match;
                if (m.orderStatus) {
                    if (m.orderStatus.$ne !== undefined) builder = builder.neq('order_status', m.orderStatus.$ne);
                    else if (m.orderStatus.$in) builder = builder.in('order_status', m.orderStatus.$in);
                    else builder = builder.eq('order_status', m.orderStatus);
                }
                if (m.isArchived !== undefined) {
                    if (m.isArchived.$ne !== undefined) builder = builder.neq('is_archived', m.isArchived.$ne);
                    else builder = builder.eq('is_archived', m.isArchived);
                }
            }
            const { data, error } = await builder;
            if (error) throw error;
            const rows = (data || []).map(r => ({
                orderStatus: r.order_status,
                isArchived: r.is_archived,
                total: Number(r.total || 0),
                createdAt: r.created_at,
            }));

            const facetStage = pipeline.find(s => s.$facet);
            if (!facetStage) return rows;

            const results = [{}];
            for (const [facetName, facetPipeline] of Object.entries(facetStage.$facet)) {
                let facetData = [...rows];
                for (const stage of facetPipeline) {
                    if (stage.$match) {
                        facetData = facetData.filter(doc => {
                            return Object.entries(stage.$match).every(([k, v]) => {
                                const val = k === 'createdAt' ? new Date(doc[k]) : doc[k];
                                if (v && typeof v === 'object') {
                                    if (v.$ne !== undefined) return doc[k] !== v.$ne;
                                    if (v.$gte !== undefined) return new Date(val) >= new Date(v.$gte);
                                    if (v.$lte !== undefined) return new Date(val) <= new Date(v.$lte);
                                }
                                return doc[k] === v;
                            });
                        });
                    } else if (stage.$group) {
                        const groups = {};
                        for (const doc of facetData) {
                            let groupKey;
                            if (stage.$group._id === null) {
                                groupKey = '__null__';
                            } else {
                                const parts = {};
                                for (const [gk, gv] of Object.entries(stage.$group._id)) {
                                    if (gv.$year) parts[gk] = new Date(doc[gv.$year.replace('$', '')]).getFullYear();
                                    else if (gv.$month) parts[gk] = new Date(doc[gv.$month.replace('$', '')]).getMonth() + 1;
                                    else if (gv.$dayOfMonth) parts[gk] = new Date(doc[gv.$dayOfMonth.replace('$', '')]).getDate();
                                    else parts[gk] = doc[gv.replace ? gv.replace('$', '') : gv];
                                }
                                groupKey = JSON.stringify(parts);
                            }
                            if (!groups[groupKey]) {
                                groups[groupKey] = { docs: [], _id: groupKey === '__null__' ? null : JSON.parse(groupKey) };
                            }
                            groups[groupKey].docs.push(doc);
                        }
                        facetData = Object.values(groups).map(g => {
                            const row = { _id: g._id };
                            for (const [field, expr] of Object.entries(stage.$group)) {
                                if (field === '_id') continue;
                                if (expr.$sum !== undefined) {
                                    if (typeof expr.$sum === 'number') row[field] = g.docs.length * expr.$sum;
                                    else {
                                        const col = expr.$sum.replace('$', '');
                                        if (col === 'total') row[field] = g.docs.reduce((s, d) => s + (d.total || 0), 0);
                                        else if (col === '1') row[field] = g.docs.length;
                                        else row[field] = g.docs.reduce((s, d) => s + (Number(d[col]) || 0), 0);
                                    }
                                }
                                if (expr.$first) {
                                    const col = expr.$first.replace('$', '');
                                    row[field] = g.docs[0] ? g.docs[0][col] : null;
                                }
                            }
                            return row;
                        });
                    } else if (stage.$sort) {
                        const key = Object.keys(stage.$sort)[0];
                        const dir = stage.$sort[key];
                        facetData.sort((a, b) => {
                            const va = a[key] instanceof Date ? a[key] : new Date(a[key] || 0);
                            const vb = b[key] instanceof Date ? b[key] : new Date(b[key] || 0);
                            return dir === -1 ? vb - va : va - vb;
                        });
                    } else if (stage.$limit) {
                        facetData = facetData.slice(0, stage.$limit);
                    } else if (stage.$count) {
                        facetData = [{ [stage.$count]: facetData.length }];
                    }
                }
                results[0][facetName] = facetData;
            }
            return results;
        };
        return { exec, then: (resolve, reject) => exec().then(resolve, reject), catch: (fn) => ({ then: (resolve, reject) => exec().then(resolve, reject).catch(fn) }) };
    }
}

module.exports = Order;