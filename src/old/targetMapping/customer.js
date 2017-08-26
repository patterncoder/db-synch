"use strict";

var mapping = {
    bookshelfModel: "Customer",
    mongooseModel: "Customer",
    target: {
        firstName: null,
        lastName: null,
        addresses: [
            {
                address1: null,
                address2: null,
                city: null,
                state: null,
                zip: null,
            }
        ]
    },
    columns: [
        { source: "CFirstName", target: "firstName", normalizers: ["fixNull('FirstName')", "trim"] },
        { source: "CLastName", target: "lastName", normalizers: ["fixNull('LastName')", "trim"] },
        { source: "CAddress", target: "addresses[0].address1", normalizers: ["fixNull('1111 some st.')", "trim"] },
        { source: "CAddress2", target: "addresses[0].address2", normalizers: ["fixNull('null')", "trim"] },
        { source: "CCity", target: "addresses[0].city", normalizers: ["fixNull('Some City')", "trim"] },
        { source: "CState", target: "addresses[0].state", normalizers: ["fixNull('CA')", "trim"] },
        { source: "CZip", target: "addresses[0].zip", normalizers: ["fixNull('12345')", "trim"] }
    ]
}


module.exports = mapping;


