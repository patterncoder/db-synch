

// "select top 25 CustomerID, CFirstName, CLastName from tblCustomers where CustomerID = 294"

let mCustomer = require("../config/models")["Customer"];
const Customer = {
    model: mCustomer, 
    sql: "select CustomerID, CFirstName, CLastName from tblCustomers where CustomerID = 1000",
    mapping: {
        firstName: {
            column: "CFirstName", normalizers: ["fixNull('firstName')"]
        },
        lastName: {
            column: "CLastName", normalizers: ["fixNull('lastName')"]
        },
        otdId: {
            column: "CustomerID", normalizers: [] 
        },
        otdBids: {
            sql: `select BidID from tblBids where CustomerID = {CustomerID}`,
            mapping: {
                otdId: {
                    column: "BidID", normalizers: [] 
                }
            }
        },
        emails: {
            sql: `select CustomerID, CEmail, 'personal' as emailType from tblCustomers where
                    CEmail <> '' and
                    CustomerID = {CustomerID};`,
            mapping: {
                emailType: { column: "emailType", normalizers: [] },
                primary: { normalizers: ["returnTrue"] },
                email: { column: "CEmail", normalizers: ["emailValidator"] }
            }
        },
        addresses: {
            sql: `select CustomerID, CAddress as address, CCity as city, CState as state, CZip as zip 
                    from tblCustomers
                    where CAddress <> ''
                    and CCity <> ''
                    and CState <> ''
                    and CZip <> ''
                    and CustomerID = {CustomerID}`,
            mapping: {
                address1: {column: "address", normalizers: []},
                city: {column: "city", normalizers: []},
                state: {column: "state", normalizers: []},
                zip: {column: "zip", normalizers: []},
                primary: { normalizers: ["returnTrue"] },
                addressType: { normalizers: ["fixNull('home')"]}
            }
        },
        phoneNumbers: {
            sql: `select CustomerID, CPhoneH, 'home' as contactType  
                    from tblCustomers 
                    where CPhoneH <> ''
                    and CustomerID = {CustomerID}
                    union
                    select CustomerID, CPhoneW, 'work' as contactType  
                    from tblCustomers 
                    where CPhoneW <> ''
                    and CustomerID = {CustomerID};`,
            mapping: {
                contactType: {column: "contactType", normalizers: []},
                primary: { normalizers: ["returnTrue"] },
                number: {column: "CPhoneH", normalizers: []}
            }
        }

    }
}

export { Customer };