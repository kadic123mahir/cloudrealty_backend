/**
 * Created by OliveTech on 10/26/2017.
 */
var common = require("../config/common")
var config = require('../config/config')
var db = require('../config/database')
var Password = require("node-php-password")
var jwt = require("jsonwebtoken")
var _ = require("underscore")
var path = require("path")
var randomString = require('random-string')

var bad_result = {}

function checkPassword(password, userData) {
    if(Password.verify(password, userData.password)){
        console.log("password matched")
        return true
    }else{
        return false
    }
}

exports.checkToken = function (req, res) {
    common.checkAudentication(req, res, function(user) {
        var good_result = {
            user_id: user.id,
            is_validToken : 1
        }
        var message = "Valid Token"
        common.sendFullResponse(res, 200, good_result, message)
    })
}

exports.login = function(req, res) {
    if (req.body.username == undefined) {
        var message = "Sorry! Error occurred in login1."
        console.log(message)
        common.sendFullResponse(res, 300,bad_result, message)
    }
    if (req.body.password == undefined) {
        var message = "Sorry! Error occurred in login1."
        console.log(message)
        common.sendFullResponse(res, 300,bad_result, message)
    }
    var param = req.body
    db.query('SELECT * FROM users WHERE username = ? or email = ?', [param.username, param.username], function(err, userdata) {
        if (err){
            var message = "Sorry! Error occurred in login2."
            // console.log(message)
            common.sendFullResponse(res, 300,bad_result, message)
        }
        if(userdata.length == 0){
            var message = "Sorry! Error occurred in login3."
            // console.log(message)
            common.sendFullResponse(res, 300, bad_result, message)
        }else{
            if (checkPassword(param.password, userdata[0])) {
                // get token
                const payload = {
                    user_id: userdata[0].id
                }
                var token = jwt.sign(payload, config.server_secret_key, {
                    expiresIn: 60*24*1 // expires in a day
                });
                // save token to database
                db.query("UPDATE users SET mobileToken = '"+ token+"' WHERE id = ?", userdata[0].id, function(err) {
                    if (err){
                        var message = "Sorry! Error occurred in update mobileToken.";
                        common.sendFullResponse(res, 300, bad_result, message);
                    }
                    var photo_url = config.server_image_path;
                    if(userdata[0].picture == undefined){
                        photo_url += "avatar.png";
                    }else{
                        photo_url += userdata[0].picture;
                    }
                    var phone = "";
                    if(!userdata[0].phone){
                        phone = "";
                    }else{
                        phone = userdata[0].phone;
                    }

                    var good_result = {
                        username : userdata[0].username,
                        user_id: userdata[0].id,
                        token : token,
                        photo : photo_url,
                        phone : phone
                    };
                    var message = "User login successfully.";
                    common.sendFullResponse(res, 200, good_result, message);

                });


            } else {
                var message = "Security info is incorrect.";
                console.log(message);
                common.sendFullResponse(res, 300,bad_result, message);
            }
        }
    });

};

exports.setting = function(req, res) {
    common.checkAudentication(req, res, function(user) {
        common.get_setting()
        db.query('SELECT *, (SELECT COUNT(*) FROM bz_show_phone WHERE sender_id = ? and receiver_id = ? and state = 1) as is_show FROM users WHERE id = ?', [user.id, req.body.user_id,req.body.user_id], function(err, userdata) {
            if (err){
                var message = "Sorry! Error occurred in getProfile2.";
                common.sendFullResponse(res, 300, bad_result, message);
            }
            if(userdata.length == 0){
                var message = "Sorry! Error occurred in getProfile3.";
                common.sendFullResponse(res, 300,bad_result, message);
            }else{
                var photo_url = config.server_image_path;
                if(userdata[0].picture == undefined){
                    photo_url += "avatar.png";
                }else{
                    photo_url += userdata[0].picture;
                }
                var phone = "";
                if(!userdata[0].phone){
                    phone = "";
                }else{
                    phone = userdata[0].area_code + userdata[0].phone
                }

                if(userdata[0].is_show == 0){
                    phone = "phone number not allowed"
                }

                var good_result = {
                    username : userdata[0].username,
                    phone : phone,
                    user_id: userdata[0].id,
                    state: userdata[0].state,
                    user_status : userdata[0].user_status,
                    about_me : userdata[0].about_me,
                    photo: photo_url
                };
                var message = "get user profile successfully.";
                common.sendFullResponse(res, 200, good_result, message);
            }
        });
    })
}

/****************************** **********************************/
exports.findByUsername = function(req, res) {
    checkAudentication(req, res, function(user) {

        var bad_result = {};
        if (req.body.search_username == undefined) {
            var message = "Sorry! Error occurred in search user1.";
            console.log(message);
            common.sendFullResponse(res, 300,bad_result, message);
        }
        var param = req.body;
        db.query('SELECT * FROM users WHERE username = ?', param.search_username, function(err, userdata) {
            if (err){
                var message = "Sorry! Error occurred in search user2.";
                common.sendFullResponse(res, 300,bad_result, message);
            }
            if(userdata.length == 0){
                var message = "Sorry! Error occurred in search user3.";
                common.sendFullResponse(res, 300,bad_result, message);
            }else {
                var photo_url = config.server_image_path;
                if(userdata[0].picture == undefined){
                    photo_url += "avatar.png";
                }else{
                    photo_url += userdata[0].picture;
                }
                var good_result = {
                    username : userdata[0].username,
                    user_id: userdata[0].id,
                    state: userdata[0].state,
                    user_status : userdata[0].user_status,
                    about_me : userdata[0].about_me,
                    photo: photo_url
                };
                var message = "User finded successfully.";
                common.sendFullResponse(res, 200, good_result, message);
            }
        })
    })
}

exports.getProfile = function(req, res) {
    checkAudentication(req, res, function(user) {

        var bad_result = {};
        if (req.body.user_id == undefined) {
            var message = "Sorry! Error occurred in profile1.";
            console.log(message);
            common.sendFullResponse(res, 300, bad_result, message);
        }
        db.query('SELECT *, (SELECT COUNT(*) FROM bz_show_phone WHERE sender_id = ? and receiver_id = ? and state = 1) as is_show FROM users WHERE id = ?', [user.id, req.body.user_id,req.body.user_id], function(err, userdata) {
            if (err){
                var message = "Sorry! Error occurred in getProfile2.";
                common.sendFullResponse(res, 300, bad_result, message);
            }
            if(userdata.length == 0){
                var message = "Sorry! Error occurred in getProfile3.";
                common.sendFullResponse(res, 300,bad_result, message);
            }else{
                var photo_url = config.server_image_path;
                if(userdata[0].picture == undefined){
                    photo_url += "avatar.png";
                }else{
                    photo_url += userdata[0].picture;
                }
                var phone = "";
                if(!userdata[0].phone){
                    phone = "";
                }else{
                    phone = userdata[0].area_code + userdata[0].phone
                }

                if(userdata[0].is_show == 0){
                    phone = "phone number not allowed"
                }

                var good_result = {
                    username : userdata[0].username,
                    phone : phone,
                    user_id: userdata[0].id,
                    state: userdata[0].state,
                    user_status : userdata[0].user_status,
                    about_me : userdata[0].about_me,
                    photo: photo_url
                };
                var message = "get user profile successfully.";
                common.sendFullResponse(res, 200, good_result, message);
            }
        });
    })
}

exports.updateProfileAvatar = function (req, res) {
    checkAudentication(req, res, function(user) {
        if (!req.files){
            var message = 'No files were uploaded.';
            return common.sendFullResponse(res, 300,{}, message);
        }
        var photo = req.files.photo;
        var newFileName = common.getFileName(req.files.photo.name);
        photo.mv('./public/images/profile/'+newFileName, function(err) {
            if (err){
                var message = 'File Upload Error.';
                return common.sendFullResponse(res, 300,{}, message);
            }
            // file uploaded
            db.query("UPDATE users SET picture = '"+ newFileName+"' WHERE id = ?", user.id, function(err) {
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
    })
}


