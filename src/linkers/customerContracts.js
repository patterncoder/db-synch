

// "select top 25 CustomerID, CFirstName, CLastName from tblCustomers where CustomerID = 294"

let mCustomer = require("../config/models")["Customer"];
const CustomerContracts = {
    model: mCustomer, 
    sql: "select BidID, CustomerID, BidEventName, BidEventDate from tblBids where CustomerID = 1000",
    mapping: {
        otdId: {
            column: "BidID", normalizers: []
        },
        customer: {
            // from mongoose get Collection:Key:WhereValue
            mlookup: "Customer:otdId:CustomerID"
        },
        eventName: {
            column: "BidEventName", normalizers: ["fixNull('no name entered')"]
        },
        eventDate: {
            column: "BidEventDate", normalizers: []
        }

    }
}

export { CustomerContracts };