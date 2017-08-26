"use strict";

let mongoose = require("mongoose");
let schemas = require("./../../NinjaSchemas");

let models = {
    "Customer":  mongoose.model('Customer', schemas.customer.Customer)
}

module.exports = models;