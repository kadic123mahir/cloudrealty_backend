/**
 * Created by OliveTech on 10/26/2017.
 */
var express = require('express')
var router = express.Router()

var common = require("../config/common")
var account = require('../controllers/account')
var compaign = require('../controllers/compaign')

/* account */
router.post("/user/login", account.login)
router.get("/setting/:server_type", account.setting)
router.post("/upload/file", common.upload)
router.get("/test/sendgrid", compaign.sendgrid)
router.get("/test/lob", compaign.lob)



module.exports = router
