/**
 * Created by OliveTech on 10/26/2017.
 */
const config = require('../config/config')
const common = require("../config/common")
const db = require('../config/database')
const axios = require('axios')
const btoa = require('btoa')
const jwt = require("jsonwebtoken")
const _ = require("underscore")
const path = require("path")
const randomString = require('random-string')

var bad_result = {}
var message = ""

save_scraped_data = async (data) => {
    // console.log("data.mlsId")
    // console.log(data.mlsId)
    add_listings(data)
    add_jsons(data)
    if(data.property) add_properties(data.listingId, data.property)
    if(data.property.rooms) add_rooms(data.listingId, data.property.rooms)
    if(data.address) add_addresses(data.listingId, data.address)
    if(data.agent) add_agents(data.listingId, data.agent)
    if(data.coAgent) add_coagents(data.listingId, data.coAgent)
    if(data.geo) add_geofences(data.listingId, data.geo)
    if(data.mls) add_mls(data.listingId, data.mls)
    if(data.office) add_offices(data.listingId, data.office)
    if(data.photos) add_photos(data.listingId, data.photos)
    if(data.sales) add_sales(data.listingId, data.sales)
    
    if(data.sales) add_sales(data.listingId, data.sales)
}

add_listings = async (data) => {
    var sql = 'INSERT INTO listings(mlsId, listingId, privateRemarks, showingInstructions, showingContactName, showingContactPhone, leaseTerm, '
    sql += 'disclaimer, listDate, modified, middleSchool, highSchool, elementarySchool, districtSchool, listPrice, taxYear, taxAnnualAmount, ';
    sql += 'tax_id, leaseType, virtualTourUrl, remarks, association_fee, association_name, association_amenities) VALUES ( ? ) ';
    var values = [ data.mlsId, data.listingId, data.privateRemarks, data.showingInstructions, data.showingContactName, data.showingContactPhone, data.leaseTerm, 
        data.disclaimer, data.listDate, data.modified, data.school === null ? null : data.school.middleSchool, data.school === null ? null : data.school.highSchool, 
        data.school === null ? null : data.school.elementarySchool, data.school === null ? null : data.school.districtSchool, data.listPrice, 
        data.tax === null ? null : data.tax.taxYear, data.tax === null ? null : data.tax.taxAnnualAmount, data.tax === null ? null : data.tax.id, 
        data.leaseType, data.virtualTourUrl, data.remarks, data.association === null ? null : data.association.fee, 
        data.association === null ? null : data.association.name, data.association === null ? null : data.association.amenities];
    try {
        const response = await db.query( sql, [values], function(err, result){
            if (err){
                var message = "Sorry! Error occurred in Database(listings).";
                return false
            }
            if(result){
                var new_id = result.insertId
                return true;
            }
        })
        return response
    }catch(error) {
        console.log("error_listings");
        return false;
    }
}

add_properties = async (listingId, data) => {
    var sql = 'INSERT INTO properties(listingId, roof, cooling, style, area, bathsFull, bathsHalf, stories, fireplaces, flooring, '
    sql += 'heating, foundation, pool, laundryFeatures, occupantName, ownerName, lotDescription, subType, bedrooms, ';
    sql += 'interiorFeatures, lotSize, areaSource, maintenanceExpense, additionalRooms, exteriorFeatures, water, ';
    sql += 'view, lotSizeArea, subdivision, construction, subTypeText, parking_leased, parking_spaces, parking_description, lotSizeAreaUnits, '
    sql += 'type, garageSpaces, bathsThreeQuarter, accessibility, occupantType, yearBuilt) VALUES ( ? ) ';
    var values = [ listingId, data.roof, data.cooling, data.style, data.area, data.bathsFull, data.bathsHalf, data.stories, data.fireplaces, data.flooring, 
        data.heating, data.foundation, data.pool, data.laundryFeatures, data.occupantName, data.ownerName, data.lotDescription, data.subType, data.bedrooms, 
        data.interiorFeatures, data.lotSize, data.areaSource, data.maintenanceExpense, data.additionalRooms, data.exteriorFeatures, data.water, 
        data.view, data.lotSizeArea, data.subdivision, data.construction, data.subTypeText, data.parking == null ? null : data.parking.leased, 
        data.parking == null ? null : data.parking.spaces, data.parking == null ? null : data.parking.description, data.lotSizeAreaUnits, 
        data.type, data.garageSpaces, data.bathsThreeQuarter, data.accessibility, data.occupantType, data.yearBuilt];
    try {
        const response = await db.query( sql, [values], function(err, result){
            if (err){
                var message = "Sorry! Error occurred in Database (properties).";
                return message
            }
            if(result){
                var new_id = result.insertId
                return new_id;
            }
            
        })
    }catch(error) {
        console.log("error_properties");
    }
}

add_rooms = async (listingId, arr) => {
    for(var data of arr) {
        var sql = 'INSERT INTO rooms(listingId, length, features, area, width, typeText, type, dimensions, description ) VALUES ( ? ) ';
        var values = [ listingId, data.length, data.features, data.area, data.width, data.typeText, data.type, data.dimensions, data.description];
        try {
            const response = await db.query( sql, [values], function(err, result){
                if (err){
                    var message = "Sorry! Error occurred in Database (rooms).";
                    return message
                }
                if(result){
                    var new_id = result.insertId
                    return new_id;
                }
                
            })
        }catch(error) {
            console.log("error_rooms");
        }
    }
}

add_addresses = async (listingId, data) => {
    var sql = 'INSERT INTO addresses(listingId, crossStreet, state, country, postalCode, streetName, streetNumberText, '
    sql += ' city, streetNumber, full, unit) VALUES ( ? ) ';
    var values = [ listingId, data.crossStreet, data.state, data.country, data.postalCode, data.streetName, data.streetNumberText, 
     data.city, data.streetNumber, data.full, data.unit];
    try {
        const response = await db.query( sql, [values], function(err, result){
            if (err){
                var message = "Sorry! Error occurred in Database (addresses).";
                return message
            }
            if(result){
                var new_id = result.insertId
                return new_id;
            }
            
        })
    }catch(error) {
        console.log("error_addresses");
    }
}

add_agents = async (listingId, data) => {
    var sql = 'INSERT INTO agents(listingId, firstName, lastName, agent_id, contact_email, contact_office, contact_cell) VALUES ( ? ) ';
    var values = [ listingId, data.firstName, data.lastName, data.id, data.contact == null ? null : data.contact.email, 
        data.contact == null ? null : data.contact.office, data.contact == null ? null : data.contact.cell];
    try {
        const response = await db.query( sql, [values], function(err, result){
            if (err){
                var message = "Sorry! Error occurred in Database (agents).";
                return message
            }
            if(result){
                var new_id = result.insertId
                return new_id;
            }
            
        })
    }catch(error) {
        console.log("error_agents");
    }
}

add_coagents = async (listingId, data) => {
    var sql = 'INSERT INTO coagents(listingId, firstName, lastName, agent_id, contact_email, contact_office, contact_cell) VALUES ( ? ) ';
    var values = [ listingId, data.firstName, data.lastName, data.id, data.contact == null ? null :  data.contact.email, 
        data.contact == null ? null : data.contact.office, data.contact == null ? null : data.contact.cell];
    try {
        const response = await db.query( sql, [values], function(err, result){
            if (err){
                var message = "Sorry! Error occurred in Database (coagents).";
                return message
            }
            if(result){
                var new_id = result.insertId
                return new_id;
            }
            
        })
    }catch(error) {
        console.log("error_coagents");
    }
}

add_geofences = async (listingId, data) => {
    var sql = 'INSERT INTO geofences(listingId, county, marketArea, directions, lat, lng) VALUES ( ? ) ';
    var values = [ listingId, data.county, data.marketArea, data.directions, data.lat, data.lng];
    try {
        const response = await db.query( sql, [values], function(err, result){
            if (err){
                var message = "Sorry! Error occurred in Database (geofences).";
                return message
            }
            if(result){
                var new_id = result.insertId
                return new_id;
            }
            
        })
    }catch(error) {
        console.log("error_geofences");
    }
}

add_jsons = async (data) => {
    var sql = 'INSERT INTO jsons(listingId, json_object) VALUES ( ? ) ';
    var values = [ data.listingId, JSON.stringify(data)];
    try {
        const response = await db.query( sql, [values], function(err, result){
            if (err){
                var message = "Sorry! Error occurred in Database (jsons).";
                return message
            }
            if(result){
                var new_id = result.insertId
                return new_id;
            }
            
        })
    }catch(error) {
        console.log("error_jsons");
    }
}

add_mls = async (listingId, data) => {
    var sql = 'INSERT INTO mls(listingId, areaMinor, statusText, originatingSystemName, '
    sql += ' daysOnMarket, area, status) VALUES ( ? ) ';
    var values = [ listingId, data.areaMinor, data.statusText, data.originatingSystemName, data.daysOnMarket, data.area, data.status];
    try {
        const response = await db.query( sql, [values], function(err, result){
            if (err){
                var message = "Sorry! Error occurred in Database (mls).";
                return message
            }
            if(result){
                var new_id = result.insertId
                return new_id;
            }
            
        })
    }catch(error) {
        console.log("error_mls");
    }
}

add_offices = async (listingId, data) => {
    var sql = 'INSERT INTO offices(listingId, contact_email, contact_office, contact_cell, name, servingName, brokerid) VALUES ( ? ) ';
    var values = [ listingId, data.contact == null ? null : data.contact.email, data.contact == null ? null : data.contact.office, 
        data.contact == null ? null : data.contact.cell, data.name, data.servingName, data.brokerid];
    try {
        const response = await db.query( sql, [values], function(err, result){
            if (err){
                var message = "Sorry! Error occurred in Database (offices).";
                return message
            }
            if(result){
                var new_id = result.insertId
                return new_id;
            }
            
        })
    }catch(error) {
        console.log("error_offices");
    }
}

add_photos = async (listingId, data) => {
    try {
        await db.query("DELETE FROM photos WHERE listingId = ? ", listingId, function(err, result_d) {
            if (err){
                var message = "Sorry! Error occurred in accept phone request.";
                return false
            }
            return true
        })
        for(var row of data) {
            var sql = 'INSERT INTO photos(listingId, photo ) VALUES ( ? ) ';
            var values = [ listingId, row];
            try {
                const response = await db.query( sql, [values], function(err, result){
                    if (err){
                        var message = "Sorry! Error occurred in Database (photos).";
                        return message
                    }
                    if(result){
                        var new_id = result.insertId
                        return new_id;
                    }
                    
                })
            }catch(error) {
                console.log("error_photos");
            }
        }
    }catch(error) {
        console.log("error_photos");
    }
    
    
}

save_sales = (listingId, data) => {
    return new Promise((resolve, reject) => {
        var sql = 'INSERT INTO sales(listingId, agent, office, closePrice, contractDate, closeDate) VALUES ( ? ) ';
        var values = [ listingId, data.agent, data.office, data.closePrice, data.contractDate, data.closeDate];
        db.query( sql, [values], function(err, result){
            if (err){
                var message = "Sorry! Error occurred in Database (sales).";
                return reject(message)
            }
            if(result){
                var new_id = result.insertId
                return resolve(new_id);
            }
            
        })
    })
}
add_sales = async (listingId, data) => {
    try {
        const response = await save_sales(listingId, data)
        return response;
    }catch(error) {
        // console.log("error_sales : " + error);
        return false;
    }
}

exports.test = async function(req, res) {
    // get data
    var auth = btoa(config.api_key + ":" + config.api_secret)

    try {
        const response = await axios.request({
            method: 'get',
            url: config.scraping_url + '/77500139',
            responseType: 'json',
            headers: {'Authorization':  "Basic " + auth },
            // params: {
            //     q: 'chicago',
            //     lastId: 0,
            //     limit: 5
            //   }
            
        });
        var message = "successfully.";
        var good_result = response.data;
        // save_scraped_data(good_result)
        common.sendFullResponse(res, 200, good_result, message);
    } catch (error) {
        var message = "Sorry! Error occurred in sample."
        console.log(error)
        common.sendFullResponse(res, 300, bad_result, message)
    }
}

get_MLS_data = async (setting) => {
    var auth = btoa(config.api_key + ":" + config.api_secret)
    try {
        const response = await axios.request({
            method: 'get',
            url: config.scraping_url,
            responseType: 'json',
            headers: {'Authorization':  "Basic " + auth },
            params: {
                q: setting.search_key,
                lastId: setting.last_mls_id,
                limit: 5
              }
        })
        var good_result = []
        var max_mls_id = setting.last_mls_id
        for(var row of response.data) {
            good_result.push(row.listingId)
            if(row.mlsId > max_mls_id){
                max_mls_id = row.mlsId
            }
            save_scraped_data(row)
        }
        setting.last_mls_id = max_mls_id
        await common.update_setting(setting)
        return good_result
    } catch (error) {
        var message = "Sorry! Error occurred in sample."
        console.log(error)
        return false
    }
}
exports.main = async function(req, res) {
    
    // get setting data 
    try {
        var setting_data = await common.get_setting()
    }catch(error){
        common.sendFullResponse(res, 300, bad_result, message)
    }
    
    var good_result = []
    for(var row of setting_data) {
        var response = await get_MLS_data(row)
        good_result.push({"server":row.server_type, "result": response})
    }
    common.sendFullResponse(res, 200, good_result, message)
}

