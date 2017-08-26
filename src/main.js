


import * as mssql from "mssql";
import * as config from "./config/config";
import { Customer } from "./mappings/customers"; 
import { reduce } from "lodash";
import { normalize } from "./utils/normalizers"; 

let mongoose = require("./config/mongoose")(config);
let mCustomer = require("./config/models")["Customer"];
let connection;


let connPool;

mssql.connect(config.source).then(pool => {
    connPool = pool;
    return fillObjects(connPool, Customer);

}).then(result => {
    return sendObjects(result);
}).then((newObjects) => {
    console.log(newObjects);
    process.exit();
});

function sendObjects(objects) {
    var now = Date.now();
    var promises = [];
    var mongooseDocs = objects.forEach(function (obj) {
        var meta = { company: "59738208ffdf8b780d0cd1bc", dateCreated: now, dateLastMod: now };
        obj.meta = meta;
        var promise = new Promise(function (resolve, reject) {
            mCustomer.create(obj, function (err, insertedDoc) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(insertedDoc);
                    resolve(insertedDoc);
                }
            });
        });
        promises.push(promise);
    });
    return Promise.all(promises).then(function (values) {
        console.log("done sending new mongoose objects");
    }).catch(function (err) {
        console.log(err);
    });
}

function fillObjects(pool, mappingConfig, parentRow) {
    let sql = mappingConfig.sql.replace(/{(.*?)}/g, (match, innermatch) => {
        return parentRow[innermatch];
    });
    // inject tokens here...
    return pool.request().query(sql)
        .then(sqlResult => {
            return sqlResult.reduce((objAccPromise, currRow) => {
                return objAccPromise
                    .then((objListAcc) => {
                        return reduce(mappingConfig.mapping, (objProm, keyMapping, key) => {
                            return objProm
                                .then((obj) => {
                                    if (keyMapping.sql) {
                                        return fillObjects(pool, keyMapping, currRow)
                                            .then((rows) => {
                                                obj[key] = rows;
                                                return Promise.resolve(obj);
                                            })
                                            .catch((error) => {
                                                console.log(error);
                                            });
                                    }
                                    obj[key] = normalize(currRow[keyMapping.column], keyMapping.normalizers);
                                    return Promise.resolve(obj);
                                })
                                .catch((error) => { console.log(error); });
                        }, Promise.resolve({}))
                            .then((newObj) => {
                                objListAcc.push(newObj);
                                return Promise.resolve(objListAcc);
                            })
                            .catch((error) => {
                                console.log(error);
                            });

                    });
            }, Promise.resolve([]));
        })
        .catch((error) => {
            console.log(error);
        });
}



