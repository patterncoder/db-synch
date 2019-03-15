
import * as mssql from "mssql";
import * as config from "./config/config";
import { Customer } from "./mappings/customers";
import * as mappings from "./mappings";
import * as Linkers from "./linkers";
import { reduce } from "lodash";
import { normalize } from "./utils/normalizers";

let mongoose = require("./config/mongoose")(config);
let connection;

let maps = [
    mappings.Customer,
    mappings.Contract
];

let linkers = [
  Linkers.CustomerContracts
];


let connPool;

mssql.connect(config.source).then(async function (pool) {
    connPool = pool;
    let promises = [];
    for (let map of maps) {
        let objects = await fillObjects(connPool, map);
        console.log(objects);
        await sendObjects(objects, map.model)
    }

    // link mongo data after all sql data comes over

    // select all documents with linking fields
    // get 

    process.exit();
})

function fillObjects(pool, mappingConfig, parentRow) {
    console.log("in fill objects");
    let sql = mappingConfig.sql.replace(/{(.*?)}/g, (match, innermatch) => {
        return parentRow[innermatch];
    });
    // inject tokens here...
    return pool.request().query(sql)
        .then(sqlResult => {
            console.log(sqlResult);
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
                                    } else if (keyMapping.mlookup) {
                                        console.log("need to map a mongo key");
                                        let parts = keyMapping.mlookup.split(":");
                                        let value = currRow[parts[2]];
                                        return getMongoData(parts[0],parts[1],value).then((result)=>{
                                            obj[key] = result._id;
                                            return Promise.resolve(obj);
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

function getMongoData(collection, key, value) {
    return new Promise((resolve, reject) => {
        let model = require("./config/models")[collection];
        let search = { [key]: value };
        console.log(search);
        model.findOne(search, "_id", (err, result) => {
            if(err) {
                reject(err);
            }
            resolve(result);
        });
    });
}


function sendObjects(objects, model) {
    console.log("in sendobjects");
    var now = Date.now();
    var promises = [];
    var mongooseDocs = objects.forEach(function (obj) {
        var meta = { company: "59738208ffdf8b780d0cd1bc", dateCreated: now, dateLastMod: now };
        obj.meta = meta;
        var promise = new Promise(function (resolve, reject) {
            model.create(obj, function (err, insertedDoc) {
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
