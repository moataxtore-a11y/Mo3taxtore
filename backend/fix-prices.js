const mongoose = require('mongoose');
const Book = require('./models/Book');
const dotenv = require('dotenv');

dotenv.config();

const fixPrices = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const books = await Book.find({ discount: { $gt: 0 } });
        console.log(`Found ${books.length} books with discount`);

        let count = 0;
        for (const book of books) {
            const calculatedPrice = Math.round(book.price - (book.price * (book.discount / 100)));
            if (book.priceAfterDiscount !== calculatedPrice) {
                book.priceAfterDiscount = calculatedPrice;
                await book.save();
                count++;
            }
        }

        console.log(`Updated ${count} books`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixPrices();
