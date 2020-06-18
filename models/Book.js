const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    ownerId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    author: String,
    year: Number,
    cover: String
});

module.exports = mongoose.model('book', BookSchema);