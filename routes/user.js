const express = require('express')
const userController = require('./controllers/user')

let router = express.Router()

router.get('/', [userController.authUser, userController.getUser])
router.get('/google', [userController.googleAuth])
router.get('/google/callback', [userController.googleAuthCallback])
router.get('/logout', [userController.authUser, userController.logout])

router.post('/login', [userController.login, userController.loginCallback])
router.post('/signUp', [userController.signUp])

module.exports = router
