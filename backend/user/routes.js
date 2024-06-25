const router = require('express').Router();
const controller = require('./controller')

router.post('/login',controller.login)
router.get('/',controller.list)

router.post('/',controller.register)


module.exports= router