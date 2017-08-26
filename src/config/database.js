var knex = require('knex')({
  client: 'mssql',
  connection: {
    host : 'mssql.oldtowndining.com',
    user : 'oldtowndining',
    password : 'y5EQJ5m7C3',
    database : 'oldtowndining'
  },
    debug: true
});

var bookshelf = require('bookshelf')(knex);
bookshelf.plugin("bookshelf-page");

module.exports = bookshelf;