const mongoose = require('mongoose');
const Schema = mongoose.Schema

let googleUser = new Schema({
    googleId: { type: String },
    google: { type: Boolean, default: true }
})

module.exports = mongoose.model('GoogleUser', googleUser)
