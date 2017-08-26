

// "select top 25 CustomerID, CFirstName, CLastName from tblCustomers where CustomerID = 294"

const Contract = {
    sql: "select BidID from tblBids",
    mapping: {
        otdId: {
            column: "BidID", normalizers: []
        }
        
        

    }
}

export { Contract };