const express = require('express');
const routes = require('./routes');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const db = require('./config/db')

let app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({
    secret: 'session-key',
    resave: false,
    saveUninitialized: true,
}))

require('./config/passport/passport')(app)

routes(app)

db.once('open', () => {
    console.log('db connected successfully')
})

let port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('server running on PORT: ', port)
})