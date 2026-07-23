const { supabase } = require('../config/db');

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
    static async find(query = {}) {
        let builder = supabase.from('books').select('*');
        if (query.status) builder = builder.eq('status', query.status);
        if (query.category) builder = builder.eq('category', query.category);
        if (query.teacher) builder = builder.eq('teacher_id', query.teacher);
        if (query.isStoreProduct !== undefined) builder = builder.eq('is_store_product', query.isStoreProduct);
        if (query.grade) builder = builder.eq('grade', query.grade);
        if (query._id && Array.isArray(query._id.$in)) builder = builder.in('id', query._id.$in);

        // Search query
        if (query.$or) {
            const titleSearch = query.$or.find(o => o.title)?.$regex;
            if (titleSearch) {
                builder = builder.ilike('title', `%${titleSearch}%`);
            }
        }

        builder = builder.order('created_at', { ascending: false });

        const { data, error } = await builder;
        if (error) throw error;
        const mapped = (data || []).map(mapBookFromPg);

        // Allow chain helper .lean()
        mapped.lean = function() { return this; };
        return mapped;
    }

    static async findById(id) {
        if (!id) return null;
        const { data, error } = await supabase.from('books').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        const book = mapBookFromPg(data);
        if (book) book.populate = async function() { return this; };
        return book;
    }

    static async findOne(query) {
        let builder = supabase.from('books').select('*');
        if (query._id) builder = builder.eq('id', query._id);
        if (query.isbn) builder = builder.eq('isbn', query.isbn);
        const { data, error } = await builder.maybeSingle();
        if (error) throw error;
        return mapBookFromPg(data);
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
        if (query.isStoreProduct !== undefined) builder = builder.eq('is_store_product', query.isStoreProduct);
        const { count, error } = await builder;
        if (error) throw error;
        return count || 0;
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