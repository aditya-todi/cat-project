const mongoose = require('mongoose')
const path = require('path')
const { spawn } = require('child_process')
const QuestionData = require('../../models/question')
const QuizData = require('../../models/quiz')
const config = require('../../config/config')

const checkAuthor = (req, res, next) => {
    if (req.user.author) {
        next()
    } else {
        return res.status(401).json({
            message: 'user is not author'
        })
    }
}

const checkQuizUser = (req, res, next) => {
    QuizData.findById(req.body.quizId).then((quiz) => {
        if (req.user._id === quiz.user) {
            next()
        } else {
            return res.status(401).json({
                message: 'user not authorised for the quiz'
            })
        }
    })
}

const getQuestion = (req, res) => {
    QuestionData.findById(req.params.quesId)
        .then((docs) => {
            res.json({
                question: docs
            })
        })
        .catch((err) => {
            res.status(500).json({
                error: err
            })
        })
}

const getNextQuestion = (req, res) => {
    QuizData.findById(req.body.quizId).then((quiz) => {
        getString(quiz).then((str) => {
            pythonProcess(path.join(config.pycat.dirname, config.pycat.select), [str])
                .then((message) => {
                    QuestionData.findById(message.toString()).then((doc) => {
                        return res.json({
                            question: doc
                        })
                    }).catch((err) => {
                        return res.status(500).json({
                            error: err.toString()
                        })
                    })
                }).catch((err) => {
                    console.log(err.toString())
                    return res.status(500).json({
                        error: err.toString()
                    })
                })
        })
    }).catch((err) => {
        console.log(err)
        return res.status(500).json({
            error: err.toString()
        })
    })
}

const getString = (quiz) => {
    return Promise.all((quiz.questionBank.map((item, _) => {
        return QuestionData.findById(item)
            .then((doc) => {
                return {
                    id: doc._id,
                    difficulty: doc.difficulty
                }
            })
    })))
        .then((items) => {
            return JSON.stringify({
                items,
                administered_items: quiz.questionAnswered,
                est_theta: quiz.estTheta * 1,
                response_vector: quiz.responses
            })
        })
}

const updateQuiz = (quiz, questionId = null, answer = null, estTheta = null) => {
    let updateObj = {}
    if (estTheta) {
        updateObj.estTheta = estTheta
    }
    else {
        updateObj = {
            questionAnswered: quiz.questionAnswered.concat([quiz.questionBank.indexOf(questionId)]),
            responses: quiz.responses.concat([answer])
        }
    }
    return QuizData.findOneAndUpdate({ _id: quiz._id }, updateObj, { new: true }).then((doc) => {
        return doc
    })
}

const getEstTheta = (req, res) => {
    QuizData.findById(req.body.quizId).then((quiz) => {
        updateQuiz(quiz, req.body.questionId, JSON.parse(req.body.answer)).then((quiz) => {
            getString(quiz).then((str) => {
                pythonProcess(path.join(config.pycat.dirname, config.pycat.response), [str])
                    .then((message) => {
                        updateQuiz(quiz, null, null, parseFloat(message.toString())).then((quiz) => {
                            res.json({
                                quiz
                            })
                        })
                    })
                    .catch((err) => {
                        console.log(err.toString())
                        return res.status(500).json({
                            error: err.toString()
                        })
                    })
            }).catch((err) => {
                return res.status(500).json({
                    error: err.toString()
                })
            })
        })
    })
}

const pythonProcess = (path, args) => {
    return new Promise((success, reject) => {
        const pyProc = spawn('python', [path, ...args])
        pyProc.stdout.on('data', (data) => {
            success(data);
        });

        pyProc.stderr.on('data', (data) => {
            reject(data);
        });
    })
}

const addQuestion = (req, res) => {
    console.log(req.user.id)
    let ques = new QuestionData({
        question: req.body.question,
        difficulty: parseFloat(req.body.difficulty),
        options: [req.body.option_a, req.body.option_b, req.body.option_c, req.body.option_d],
        answer: parseInt(req.body.answer),
        author: mongoose.Types.ObjectId(req.user.id),
        category: req.body.category
    })
    ques.save()
        .then((doc) => {
            res.json({
                message: 'question added successfully',
                question: doc
            })
        })
        .catch((err) => {
            res.status(500).json({
                error: err.message
            })
        })
}

const startQuiz = (req, res) => {
    QuestionData.find({
        category: req.body.category
    })
        .then((docs) => {
            let quiz = new QuizData({
                user: mongoose.Types.ObjectId(req.user._id),
                questionBank: docs.map((item, _) => {
                    return item._id
                })
            })
            quiz.save()
                .then((doc) => {
                    res.json({
                        message: 'quiz started',
                        quiz: doc
                    })
                })
                .catch((err) => {
                    res.status(500).json({
                        message: 'cannot start quiz',
                        error: err
                    })
                })
        })
}

const stopQuiz = (req, res, next) => {
    QuizData.findById(req.body.quizId).then((quiz) => {
        if (quiz.questionAnswered.length === quiz.MaxLimit) {
            return res.json({
                message: 'quiz has ended'
            })
        } else {
            next()
        }
    })
}

module.exports = {
    checkAuthor,
    checkQuizUser,
    getQuestion,
    addQuestion,
    getNextQuestion,
    getEstTheta,
    startQuiz,
    stopQuiz
}