const mongoose = require('mongoose');
const Schema = mongoose.Schema

let question = new Schema({
    id: { type: Schema.Types.ObjectId },
    question: { type: String },
    difficulty: {
        type: Number,
        min: 0,
        max: 1
    },
    options: { type: [String] },
    answer: { type: Number },
    category: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = mongoose.model('Question', question)