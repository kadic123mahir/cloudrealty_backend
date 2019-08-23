    /**
 * Created by OliveTech on 10/26/2017.
 */
    var config = require('./app/config/config')
    var debug = require('debug')(config.app_name)
    var express = require('express')
    var http = require('http')
    var path = require('path')
    var fs = require("fs")
    var logger = require('morgan')
    var cookieParser = require('cookie-parser')
    var bodyParser = require('body-parser')
    var favicon = require('serve-favicon')
    var fileUpload = require('express-fileupload')
    const axios = require('axios');

    var app = express();
    app.use(fileUpload({limits: { fileSize: 50 * 1024 * 1024, preserveExtension: true }}));

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(logger('dev'));
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

    var scraping = require('./app/routes/scraping');
    var api = require('./app/routes/api');

    app.get('/', function(req, res) {
        var result = {
            code: 200,
            data: 'express'
        };
        console.log(result);
        res.send(result);
    });
    app.use('/scraping', scraping);
    app.use('/api', api);

    /// catch 404 and forwarding to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        var result = {
            code: 300,
            data: {},
            message: "something error"
        };
        res.send(result);
    });

    app.set('port', process.env.PORT || config.serverPort);

    call_scraping_api = async () => {
        try {
            const response = await axios.request({
                method: 'get',
                url: config.server_url + "scraping/main",
                responseType: 'json'
            });

            if(response.data.code == 200){
                console.log(response.data.data)
            }else{
                console.log(response.data.message)
            }
        } catch (error) {
            var message = "Sorry! Error occurred in main thread.";
            console.log(error);
        }
    }
    var server = http.createServer(app).listen(config.serverPort, function () {
            debug('Express server listening on port ' + server.address().port);
            console.log('Express server listening on port ' + server.address().port);
        // call_scraping_api()
        setInterval(() => {
            call_scraping_api()
        }, 900000)
    });
