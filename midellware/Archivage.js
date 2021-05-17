var mysql = require('mysql');
const db = require("../models");


module.exports = async (Client)=>{


    await db.Database.findOne({where :{ Active : 1}}).then((database)=>{

        var con = mysql.createConnection({
            host: database.Host,
            user: database.Username,
            password: database.Password,
            database: database.Database
          });
          
          con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
          });
    })
    
}