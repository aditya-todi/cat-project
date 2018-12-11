const mongoose = require('mongoose')
const Schema = mongoose.Schema

let quiz = new Schema({
    id: { type: Schema.Types.ObjectId },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionAnswered: {
        type: [Number],
        required: true,
        default: []
    },
    responses: {
        type: [Boolean],
        required: true,
        default: []
    },
    estTheta: {
        type: mongoose.Decimal128,
        default: Math.random
    },
    questionBank: {
        type: [Schema.Types.ObjectId],
        required: true
    },
    maxLimit: {
        type: Number,
        required: true,
        default: 0
    }
})

module.exports = mongoose.model('Quiz', quiz)