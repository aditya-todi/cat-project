const passport = require('passport');
const UserData = require('../../models/user');
const GoogleUserData = require('../../models/googleUser')

const authUser = async (req, res, next) => {
    if (req.user) {
        next()
    } else {
        res.status(401).json({
            message: 'user is not logged in'
        })
    }
}

const googleAuth = async (req, res, next) => {
    if (req.user) {
        if (next) {
            next()
        } else {
            res.json({
                message: 'user is already logged in'
            })
        }
    } else {
        passport.authenticate('google', {
            scope: ['profile']
        })(req, res, next)
    }
}

const googleAuthCallback = async (req, res) => {
    passport.authenticate('google', (err, user) => {
        if (err) {
            return res.status(500).json({
                message: 'cannot authorise google+',
                error: err
            })
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.json(
                    {
                        message: 'login unsuccessfull',
                        error: err
                    })
            }
            return res.json(
                {
                    message: 'login successfull',
                    user: req.user
                })
        })
    })(req, res)
}

const login = async (req, res, next) => {
    if (req.user) {
        if (next) {
            next()
        } else {
            res.json({
                message: 'user is already logged in'
            })
        }
    } else {
        passport.authenticate('local', function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'login error',
                    error: err
                })
            }
            if (!user) {
                return res.status(401).json({
                    message: 'invalid credentials'
                })
            }
            req.logIn(user, function (err) {
                if (err) {
                    return res.json({
                        message: 'login unsuccessfull',
                        error: err
                    })
                }
                return res.json({
                    message: 'login successfull',
                    user: req.user
                })
            })
        })(req, res, next)
    }
}

const loginCallback = async (req, res) => {
    return res.json({
        user: req.user
    })
}

const logout = async (req, res) => {
    req.logout()
    res.json({
        message: 'logged out successfully'
    })
}

const signUp = async (req, res) => {
    if (req.user) {
        res.status(403).json({
            message: 'user already logged in'
        })
    } else {
        let user = new UserData({
            ...req.body,
            author: (req.body.author === "true"),
            admin: (req.body.admin === "true"),
        })
        user.setPassword(req.body.password)
        user.save()
            .then((doc) => {
                req.login(doc, () => {
                    res.json({
                        message: 'user created successfully',
                        user: user.name
                    })
                })
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                    auth: false
                })
            })
    }
}

const getUser = async (req, res) => {
    getUserHandler(req.user)
        .then((doc) => {
            if (doc) {
                res.json({
                    user: doc
                })
            }
        })
        .catch((err) => {
            res.status(500).json({
                err: err
            })
        })
}

const getUserHandler = (user) => {
    if (user.google) {
        return GoogleUserData.findOne({
            googleId: user.googleId
        })
    }
    return UserData.findOne({
        username: user.username
    }).
        select({
            name: 1,
            username: 1,
        })
}

module.exports = {
    authUser,
    googleAuth,
    googleAuthCallback,
    login,
    loginCallback,
    logout,
    signUp,
    getUser
}