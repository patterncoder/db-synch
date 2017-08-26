
"use strict";

let _ = require("lodash");
let bookshelf = require("../database");
var normalize = require("../normalizers").normalize;

var Customer = bookshelf.Model.extend({
    tableName: "tblCustomers",
    idAttribute: "CustomerID",
    contracts: function () {
        return this.hasMany(Contract, "CustomerID")
    },
    addresses: function () {
        return this.hasMany(Address, "CustomerID")
    },
    parse: function (rowObj) {
        let normalizers = {
            CustomerID: [],
            firstName: ["fixNull('firstName')"],
            lastName: ["fixNull('lastName')"]
        };
        return _.reduce(rowObj, function (memo, val, key) {
            memo[key] = normalize(val, normalizers[key]);
            return memo;
        }, {});
    }
});

var Contract = bookshelf.Model.extend({
    tableName: "tblBids",
    idAttribute: "BidID"
});


var Address = bookshelf.Model.extend({
    tableName: "tblCustomers",
    idAttribute: "CustomerID"
});

module.exports = Customer;