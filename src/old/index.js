"use strict";

let Customer = require("./sourceMapping/Customer");

var config = require("./config");
let mongoose = require("./mongoose")(config);
let mCustomer = require("./models")["Customer"];

let p = Promise.resolve();


Customer.query("where", "CAddress", "=", "1200 N East Street")
    //.orderBy("CLastName")
    .fetchPage({
        pageSize: 5,
        page: 1,
        withRelated: [{
            "contracts": function(qb){
                qb.column("BidID", "CustomerID")
            }
        }, {
            "addresses": function(qb){
                qb.column("CAddress", "CAddress2")
            }
        }],
        columns: ["CustomerID", "CFirstName as firstName", "CLastName as lastName"]
    })
    .then(function (rows) {
        rows.forEach((row) => {
            row.load(["addresses"]);
            console.log(row.toJSON());
            console.log(JSON.stringify(row.related("addresses")));
            console.log(row.related("addresses").attributes);
            row = row.serialize();
            delete row.CustomerID;
            var now = Date.now();
            var meta = { company: "58965a580bf269f834991d56", dateCreated: now, dateLastMod: now };
            row.meta = meta;
            //row = JSON.stringify(row);
            p = p.then(function () {
                return new Promise(function (resolve, reject) {
                    mCustomer.create(row, function(err, insertedDoc){
                        if(err){
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            }, function(err){
                console.log(err);
            });

        });
        p = p.then(function(){
            console.log("all done");
            process.exit();
        });
    });


