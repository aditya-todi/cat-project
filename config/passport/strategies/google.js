const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')
const config = require('../../config')
const GoogleUserData = require('../../../models/googleUser')

module.exports = () => {
    passport.use(new GoogleStrategy({
        clientID: config.google.client_id,
        clientSecret: config.google.client_secret,
        callbackURL: config.google.redirect_uri
    }, (accessToken, refreshToken, profile, done) => {
        GoogleUserData.findOne({
            googleId: profile.id
        })
            .then((user) => {
                if (!user) {
                    let newUser = new GoogleUserData({
                        googleId: profile.id,
                    })
                    newUser.save()
                    done(null, newUser)
                } else {
                    done(null, user)
                }
            })
            .catch((err) => {
                done(err, false)
            })
    }))
}
