/**
 * Created by OliveTech on 10/26/2017.
 */

var config;
var APP_NAME = "Cloud Realty"
var DB_HOST, DB_USER, DB_PASS, DB_NAME
    DB_HOST = "localhost"
    DB_USER = "root"
    DB_PASS = ""
    DB_NAME = "cloudrealty"
    // DB_HOST = "185.19.28.220"
    // DB_USER = "dongjin"
    // DB_PASS = "chengge111"
    // DB_NAME = "happydemy"
    // port = 3000

var scraping_url = "https://api.simplyrets.com/properties"
var api_key = "steve_7r414505"
var api_secret = "k193226455491322"


var port = 3000
var server_url = "http://localhost:"+ port+ "/"
var server_secret_key = "cloud_realty"
    

config = {
    app_name: APP_NAME,
    db_host : DB_HOST,
    db_user : DB_USER,
    db_pass : DB_PASS,
    db_name : DB_NAME,
    scraping_url,
    api_key,
    api_secret,
    server_url,
    server_secret_key,
    serverPort : port,
    debugging_mode : true,
};

module.exports = config;