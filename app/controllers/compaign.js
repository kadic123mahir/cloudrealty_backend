/**
 * Created by OliveTech on 10/26/2017.
 */
var common = require("../config/common")
var config = require('../config/config')
var SENDGRID_API_KEY = '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'
var LOB_API_KEY = 'test_eb02ae47e6babfa31f6f2fb158e19911f29'
const sgMail = require('@sendgrid/mail');
const Lob = require('lob')(LOB_API_KEY, { apiVersion: '2019-06-01' });
var fs = require("fs")

// var test_email = "alex@fullbarsmedia.com"
var test_email = "bluedreampro2017@gmail.com"
var bad_result = {}
var message = ""


exports.sendgrid = function(req, res) {
    // var param = req.body
    sgMail.setApiKey(SENDGRID_API_KEY);
    const msg = {
    to: test_email,
    from: 'admin@cloudrealty.com',
    subject: 'MLS news',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<p>and easy to do anywhere, even with Node.js</p><h6>and easy to do anywhere, even with Node.js</h6><h3>and easy to do anywhere, even with Node.js</h3>',
    };
    sgMail.send(msg);
    message = "successfully"
    common.sendFullResponse(res, 200, {}, message);
};

exports.lob = function(req, res) {

    var filename = "test.jpg"
    var dirname = "./public/images/postcards/";
    var file = fs.readFileSync(dirname + filename);
    // const file = fs.readFileSync('./public/images/postcards/test.html').toString();
    // common.sendFullResponse(res, 200, {}, "message");
    
    // Create the address
    Lob.addresses.create({
    name: 'Robin Joseph',
    email: test_email,
    phone: '123456789',
    address_line1: '5028',
    address_line2: 'West PENSACOLA Avenue',
    address_city: 'CHICAGO',
    address_state: 'IL',
    address_zip: '60641',
    address_country: 'US'
    }, (err, address) => {
    if (err) {
        console.log(err);
    } else {
        console.log("address created")
        Lob.postcards.create({
        description: 'My First Postcard',
        to: address.id,
        front: file,
        back: file,
        merge_variables: {
            name: 'Robin'
        }
        }, (err, postcard) => {
        if (err) {
            console.log(err);
            common.sendFullResponse(res, 300, {}, err);
        } else {
            message = "successfully"
            common.sendFullResponse(res, 200, {}, message);
        }
        });
    }
    });
    
}

