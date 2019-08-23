/**
 * Created by OliveTech on 10/26/2017.
 */
var express = require('express');
var router = express.Router();

var scraping = require('../controllers/scraping');

/* account */
router.get("/test", scraping.test);
router.get("/main", scraping.main);

module.exports = router;