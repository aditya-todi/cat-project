const express = require('express')
const userController = require('./controllers/user')
const quizController = require('./controllers/quiz')

let router = express.Router()

router.post('/start', [
    userController.authUser,
    quizController.startQuiz
])
router.post('/add', [
    userController.authUser,
    quizController.checkAuthor,
    quizController.addQuestion
])
router.post('/next', [
    userController.authUser,
    quizController.checkQuizUser,
    quizController.stopQuiz,
    quizController.getNextQuestion
])
router.post('/answer', [
    userController.authUser,
    quizController.checkQuizUser,
    quizController.getEstTheta
])

module.exports = router