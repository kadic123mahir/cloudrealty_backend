/**
 * Created by OliveTech on 10/26/2017.
 */
var config = require('../config/config')
var db = require('../config/database')
var Password = require("node-php-password")
var jwt = require("jsonwebtoken")
var _ = require("underscore")
var path = require("path")
var randomString = require('random-string')

function sendFullResponse(res, code, data, message){
    var result = {
        code: code,
        data: data,
        message: message
    };
    res.send(result);
}

getFileName = (filename) => {
    var ext = path.extname(filename)
    var newFileName = randomString({
        length: 8,
        numeric: true,
        letters: true,
        special: false
    })
    newFileName += ext
    return newFileName
}

exports.getFileName = (filename) => {
    var ext = path.extname(filename)
    var newFileName = randomString({
        length: 8,
        numeric: true,
        letters: true,
        special: false
    })
    newFileName += ext
    return newFileName
}

exports.checkAudentication = (req, res, callback) => {
    if(!req.headers['token']) {
        var message = 'There is no authenticate token.'
        sendFullResponse(res, 300,{}, message)
    }
    var token = req.headers['token']
    if (token) {
        jwt.verify(token, config.server_secret_key, function(err, decoded) {
            if (err) {
                var message = 'There is invalid authenticate token.' + err
                sendFullResponse(res, 300, bad_result, message)
            } else {
                db.query('SELECT * FROM users WHERE id = ?', decoded.user_id, function(err, userdata) {
                    if (err){
                        var message = "Your token expired, Please login again."
                        console.log(message)
                        sendFullResponse(res, 300,bad_result, message)
                    }
                    if(userdata.length == 0){
                        var message = "Your token expired, Please login again."
                        console.log(message)
                        sendFullResponse(res, 300, bad_result, message)
                    }else{
                        // return user_id
                        return callback(userdata[0])
                    }
                })

            }
        })

    } else {
        var message = 'No token provided.'
        sendFullResponse(res, 300,{}, message)
    }
}

exports.get_setting = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM settings WHERE state = 1", function(err, data){
            if (err){
                var message = "Sorry! Error occurred in accept phone request.";
                return reject(null)
            }
            return resolve(data);
        })
    })
}

exports.update_setting = (setting) => {
    return new Promise((resolve, reject) => {
        var sql = "UPDATE settings SET state = ?, search_key = ?, last_mls_id = ? WHERE id = ?"
        var values = [ setting.state, setting.search_key, setting.last_mls_id, setting.id]
        db.query(sql, values, function(err, data) {
            if (err){
                var message = "Sorry! Error occurred in update setting.";
                console.log(message + err)
                return reject(null)
            }
            return resolve(data);
        })
    })
}

exports.sendFullResponse = function(res, code, data, message){
    var result = {
        code: code,
        data: data,
        message: message
    };
    res.send(result);
}

exports.upload = function (req, res) {
    if (!req.files){
        var message = 'No files were uploaded.';
        return common.sendFullResponse(res, 300,{}, message);
    }
    var photo = req.files.photo;
    var newFileName = getFileName(req.files.photo.name);
    photo.mv('./public/images/'+newFileName, function(err) {
        if (err){
            var message = 'File Upload Error.';
            return sendFullResponse(res, 300,{}, message);
        }
        // file uploaded
        db.query("UPDATE settings SET photo = '"+ newFileName +"' WHERE id = ?", user.id, function(err) {
            if (err){
                var message = "Sorry! Error occurred in update profile.";
                common.sendFullResponse(res, 300, bad_result, message);
            }
            var photo_url = config.server_image_path + newFileName;
            var good_result = {
                photo: photo_url
            };
            var message = "update user profile successfully.";
            common.sendFullResponse(res, 200, good_result, message);
        });
    });
}