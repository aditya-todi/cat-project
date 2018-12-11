const user = require('./user')
const quiz = require('./quiz')
const admin = require('./admin')

module.exports = (app) => {
    app.use('/user', user)
    app.use('/quiz', quiz)
    app.use('/admin', admin)
}