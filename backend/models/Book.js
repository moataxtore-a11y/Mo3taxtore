const { supabase } = require('../config/db');
const { createChainable, createSingleChainable } = require('../utils/queryHelpers');

const mapBookFromPg = (data) => {
    if (!data) return null;
    return {
        _id: data.id,
        id: data.id,
        title: data.title,
        description: data.description || '',
        price: Number(data.price),
        discount: Number(data.discount || 0),
        priceAfterDiscount: Number(data.price_after_discount ?? data.price),
        coverImage: data.cover_image || '',
        category: data.category,
        teacher: data.teacher_id,
        teacherName: data.teacher_name || '',
        stock: Number(data.stock || 0),
        isbn: data.isbn,
        pages: data.pages,
        grade: data.grade,
        status: data.status || 'pending',
        averageRating: Number(data.average_rating || 0),
        totalReviews: Number(data.total_reviews || 0),
        totalSold: Number(data.total_sold || 0),
        isStoreProduct: Boolean(data.is_store_product),
        triggersFreeShipping: Boolean(data.triggers_free_shipping),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        deleteOne: async function() {
            return await Book.findByIdAndDelete(this.id);
        },
        save: async function() {
            return await Book.findByIdAndUpdate(this.id, this);
        }
    };
};

const mapBookToPg = (data) => {
    const pg = {};
    if (data.title !== undefined) pg.title = data.title;
    if (data.description !== undefined) pg.description = data.description;
    if (data.price !== undefined) pg.price = data.price;
    if (data.discount !== undefined) pg.discount = data.discount;

    // Auto-calculate price after discount
    const price = data.price !== undefined ? Number(data.price) : undefined;
    const discount = data.discount !== undefined ? Number(data.discount) : undefined;
    if (price !== undefined || discount !== undefined) {
        const finalPrice = price !== undefined ? price : 0;
        const finalDiscount = discount !== undefined ? discount : 0;
        if (finalDiscount > 0) {
            pg.price_after_discount = Math.round(finalPrice - (finalPrice * (finalDiscount / 100)));
        } else {
            pg.price_after_discount = finalPrice;
        }
    }

    if (data.coverImage !== undefined) pg.cover_image = data.coverImage;
    if (data.category !== undefined) pg.category = data.category;
    if (data.teacher !== undefined) pg.teacher_id = data.teacher;
    if (data.teacherName !== undefined) pg.teacher_name = data.teacherName;
    if (data.stock !== undefined) pg.stock = data.stock;
    if (data.isbn !== undefined) pg.isbn = data.isbn;
    if (data.pages !== undefined) pg.pages = data.pages;
    if (data.grade !== undefined) pg.grade = data.grade;
    if (data.status !== undefined) pg.status = data.status;
    if (data.averageRating !== undefined) pg.average_rating = data.averageRating;
    if (data.totalReviews !== undefined) pg.total_reviews = data.totalReviews;
    if (data.totalSold !== undefined) pg.total_sold = data.totalSold;
    if (data.isStoreProduct !== undefined) pg.is_store_product = data.isStoreProduct;
    if (data.triggersFreeShipping !== undefined) pg.triggers_free_shipping = data.triggersFreeShipping;
    return pg;
};

class Book {
    static find(query = {}) {
        return createChainable(async () => {
            let builder = supabase.from('books').select('*');
            if (query.status) builder = builder.eq('status', query.status);
            if (query.category) builder = builder.eq('category', query.category);
            if (query.teacher) builder = builder.eq('teacher_id', query.teacher);
        if (query.isStoreProduct !== undefined) {
            if (typeof query.isStoreProduct === 'object' && query.isStoreProduct.$ne !== undefined) {
                builder = builder.neq('is_store_product', query.isStoreProduct.$ne);
            } else {
                builder = builder.eq('is_store_product', query.isStoreProduct);
            }
        }
            if (query.grade) builder = builder.eq('grade', query.grade);
            if (query._id && Array.isArray(query._id.$in)) builder = builder.in('id', query._id.$in);

            if (query.$or) {
                const titleSearch = query.$or.find(o => o.title)?.$regex;
                if (titleSearch) {
                    builder = builder.ilike('title', `%${titleSearch}%`);
                }
            }

            builder = builder.order('created_at', { ascending: false });

            const { data, error } = await builder;
            if (error) throw error;
            return (data || []).map(mapBookFromPg);
        });
    }

    static findById(id) {
        return createSingleChainable(async () => {
            if (!id) return null;
            const { data, error } = await supabase.from('books').select('*').eq('id', id).maybeSingle();
            if (error) throw error;
            const book = mapBookFromPg(data);
            if (!book) return null;
            if (book.teacher && typeof book.teacher === 'string') {
                const User = require('./User');
                const teacherDoc = await User.findById(book.teacher);
                if (teacherDoc) {
                    book.teacher = teacherDoc;
                }
            }
            return book;
        });
    }

    static findOne(query) {
        return createSingleChainable(async () => {
            let builder = supabase.from('books').select('*');
            if (query._id) builder = builder.eq('id', query._id);
            if (query.isbn) builder = builder.eq('isbn', query.isbn);
            const { data, error } = await builder.maybeSingle();
            if (error) throw error;
            const book = mapBookFromPg(data);
            if (book && book.teacher && typeof book.teacher === 'string') {
                const User = require('./User');
                const teacherDoc = await User.findById(book.teacher);
                if (teacherDoc) {
                    book.teacher = teacherDoc;
                }
            }
            return book;
        });
    }

    static async create(bookData) {
        const payload = mapBookToPg(bookData);
        const { data, error } = await supabase.from('books').insert(payload).select().single();
        if (error) throw error;
        return mapBookFromPg(data);
    }

    static async findByIdAndUpdate(id, updateData, options = {}) {
        const payload = mapBookToPg(updateData.$set || updateData);
        payload.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('books').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return mapBookFromPg(data);
    }

    static async findByIdAndDelete(id) {
        const { data, error } = await supabase.from('books').delete().eq('id', id).select().single();
        if (error) throw error;
        return mapBookFromPg(data);
    }

    static async countDocuments(query = {}) {
        let builder = supabase.from('books').select('id', { count: 'exact', head: true });
        if (query.status) builder = builder.eq('status', query.status);
        if (query.isStoreProduct !== undefined) {
            if (typeof query.isStoreProduct === 'object' && query.isStoreProduct.$ne !== undefined) {
                builder = builder.neq('is_store_product', query.isStoreProduct.$ne);
            } else {
                builder = builder.eq('is_store_product', query.isStoreProduct);
            }
        }
        if (query.stock !== undefined) {
            if (typeof query.stock === 'object' && query.stock.$lte !== undefined) {
                builder = builder.lte('stock', query.stock.$lte);
            } else if (typeof query.stock !== 'object') {
                builder = builder.eq('stock', query.stock);
            }
        }
        const { count, error } = await builder;
        if (error) throw error;
        return count || 0;
    }

    static async aggregate(pipeline) {
        if (!pipeline || !pipeline.length) return [];
        const { data, error } = await supabase.from('books').select('total_sold');
        if (error) throw error;
        const books = (data || []).map(mapBookFromPg);
        let results = books;
        for (const stage of pipeline) {
            if (stage.$group) {
                const key = stage.$group._id;
                const sums = {};
                for (const [field, expr] of Object.entries(stage.$group)) {
                    if (field === '_id') continue;
                    if (expr.$sum) {
                        const src = typeof expr.$sum === 'string' ? expr.$sum.replace('$', '') : expr.$sum;
                        if (typeof src === 'number') {
                            sums[field] = results.length * src;
                        } else {
                            sums[field] = results.reduce((acc, r) => acc + (Number(r[src]) || 0), 0);
                        }
                    }
                }
                results = key === null ? [{ ...sums }] : [sums];
            } else if (stage.$sort) {
                const key = Object.keys(stage.$sort)[0];
                const dir = stage.$sort[key];
                results.sort((a, b) => {
                    const va = a[key] instanceof Date ? a[key] : new Date(a[key] || 0);
                    const vb = b[key] instanceof Date ? b[key] : new Date(b[key] || 0);
                    return dir === -1 ? vb - va : va - vb;
                });
            } else if (stage.$limit) {
                results = results.slice(0, stage.$limit);
            } else if (stage.$match) {
                results = results.filter(doc => {
                    return Object.entries(stage.$match).every(([k, v]) => {
                        if (v && typeof v === 'object') {
                            if (v.$ne !== undefined) return doc[k] !== v.$ne;
                            if (v.$gte !== undefined) return new Date(doc[k]) >= new Date(v.$gte);
                            if (v.$lte !== undefined) return new Date(doc[k]) <= new Date(v.$lte);
                            if (v.$in) return v.$in.includes(doc[k]);
                        }
                        return doc[k] === v;
                    });
                });
            } else if (stage.$facet) {
                const faceted = {};
                for (const [facetName, facetPipeline] of Object.entries(stage.$facet)) {
                    let facetResults = [...results];
                    for (const fStage of facetPipeline) {
                        if (fStage.$group) {
                            const sums = {};
                            for (const [field, expr] of Object.entries(fStage.$group)) {
                                if (field === '_id') continue;
                                if (expr.$sum) {
                                    const src = typeof expr.$sum === 'string' ? expr.$sum.replace('$', '') : expr.$sum;
                                    if (typeof src === 'number') {
                                        sums[field] = facetResults.length * src;
                                    } else {
                                        sums[field] = facetResults.reduce((acc, r) => acc + (Number(r[src]) || 0), 0);
                                    }
                                }
                            }
                            facetResults = [{ ...sums }];
                        } else if (fStage.$match) {
                            facetResults = facetResults.filter(doc => {
                                return Object.entries(fStage.$match).every(([k, v]) => {
                                    if (v && typeof v === 'object') {
                                        if (v.$ne !== undefined) return doc[k] !== v.$ne;
                                        if (v.$gte !== undefined) return new Date(doc[k]) >= new Date(v.$gte);
                                        if (v.$lte !== undefined) return new Date(doc[k]) <= new Date(v.$lte);
                                        if (v.$in) return v.$in.includes(doc[k]);
                                    }
                                    return doc[k] === v;
                                });
                            });
                        } else if (fStage.$count) {
                            facetResults = [{ [fStage.$count]: facetResults.length }];
                        } else if (fStage.$sort) {
                            const key = Object.keys(fStage.$sort)[0];
                            const dir = fStage.$sort[key];
                            facetResults.sort((a, b) => {
                                const va = a[key] instanceof Date ? a[key] : new Date(a[key] || 0);
                                const vb = b[key] instanceof Date ? b[key] : new Date(b[key] || 0);
                                return dir === -1 ? vb - va : va - vb;
                            });
                        } else if (fStage.$limit) {
                            facetResults = facetResults.slice(0, fStage.$limit);
                        }
                    }
                    faceted[facetName] = facetResults;
                }
                results = [faceted];
            }
        }
        return results;
    }

    static async bulkWrite(operations) {
        let modifiedCount = 0;
        for (const op of operations) {
            if (op.updateOne) {
                const { filter, update } = op.updateOne;
                const bookId = filter._id;

                // Handle stock increment/decrement
                if (update.$inc) {
                    const currentBook = await Book.findById(bookId);
                    if (currentBook) {
                        const newStock = currentBook.stock + (update.$inc.stock || 0);
                        const newTotalSold = currentBook.totalSold + (update.$inc.totalSold || 0);

                        // Check stock filter $gte if provided
                        if (filter.stock && filter.stock.$gte !== undefined && currentBook.stock < filter.stock.$gte) {
                            continue;
                        }

                        await supabase.from('books').update({
                            stock: Math.max(0, newStock),
                            total_sold: Math.max(0, newTotalSold),
                            updated_at: new Date().toISOString()
                        }).eq('id', bookId);
                        modifiedCount++;
                    }
                }
            }
        }
        return { modifiedCount };
    }
}

module.exports = Book;