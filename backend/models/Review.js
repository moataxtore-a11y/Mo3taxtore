const { supabase } = require('../config/db');
const { createChainable, createSingleChainable } = require('../utils/queryHelpers');

const mapReviewFromPg = (data) => {
    if (!data) return null;
    return {
        _id: data.id,
        id: data.id,
        book: data.book_id,
        user: data.user_id,
        rating: Number(data.rating),
        comment: data.comment,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

class Review {
    static find(query = {}) {
        return createChainable(async () => {
            let builder = supabase.from('reviews').select('*');
            if (query.book) builder = builder.eq('book_id', query.book);
            if (query.user) builder = builder.eq('user_id', query.user);
            if (query.bookId) builder = builder.eq('book_id', query.bookId);

            builder = builder.order('created_at', { ascending: false });

            const { data, error } = await builder;
            if (error) throw error;
            return (data || []).map(mapReviewFromPg);
        });
    }

    static async findOne(query) {
        let builder = supabase.from('reviews').select('*');
        if (query.book) builder = builder.eq('book_id', query.book);
        if (query.user) builder = builder.eq('user_id', query.user);

        const { data, error } = await builder.maybeSingle();
        if (error) throw error;
        return mapReviewFromPg(data);
    }

    static async create(reviewData) {
        const payload = {
            book_id: reviewData.book,
            user_id: reviewData.user,
            rating: reviewData.rating,
            comment: reviewData.comment,
        };

        const { data, error } = await supabase.from('reviews').insert(payload).select().single();
        if (error) throw error;

        // Recalculate Book Average Rating
        await Review.calcAverageRating(reviewData.book);

        return mapReviewFromPg(data);
    }

    static async findByIdAndDelete(id) {
        const { data, error } = await supabase.from('reviews').delete().eq('id', id).select().single();
        if (error) throw error;
        if (data) {
            await Review.calcAverageRating(data.book_id);
        }
        return mapReviewFromPg(data);
    }

    static async calcAverageRating(bookId) {
        const { data, error } = await supabase.from('reviews').select('rating').eq('book_id', bookId);
        if (error || !data || data.length === 0) {
            await supabase.from('books').update({ average_rating: 0, total_reviews: 0 }).eq('id', bookId);
            return;
        }

        const totalReviews = data.length;
        const sum = data.reduce((acc, curr) => acc + Number(curr.rating), 0);
        const avg = Math.round((sum / totalReviews) * 10) / 10;

        await supabase.from('books').update({
            average_rating: avg,
            total_reviews: totalReviews
        }).eq('id', bookId);
    }
}

module.exports = Review;
