const express = require("express");
const Router = express.Router();
const db = require("../models");

//get all service
Router.put("/Read/:id", async (req, res) => {


    const { Read } = req.body
    

    const Permission = await db.Permission.findOne({ where :{id : req.params.id}});
    Permission.Read = Read
    await Permission.save().then(async(per)=>{
        const auth = await db.Auth.findOne({where : {id : per.AuthId} , include : [{model : db.Permission}, {model : db.User}]});
        res.send(auth);
    })
   

});

Router.put("/Write/:id", async (req, res) => {


    
    const { Write } = req.body
    

  const Permission = await db.Permission.findOne({ where :{id : req.params.id}});
  Permission.Write = Write
  await Permission.save().then(async(per)=>{
    const auth = await db.Auth.findOne({where : {id : per.AuthId} , include : [{model : db.Permission}, {model : db.User}]});
    res.send(auth);
})
});

Router.put("/import/:id", async (req, res) => {


   
    const { Import } = req.body
  

  const Permission = await db.Permission.findOne({ where :{id : req.params.id}});
  Permission.import = Import
  await Permission.save().then(async(per)=>{
    const auth = await db.Auth.findOne({where : {id : per.AuthId} , include : [{model : db.Permission}, {model : db.User}]});
    res.send(auth);
})
});

Router.put("/export/:id", async (req, res) => {

    const { Export } = req.body

  const Permission = await db.Permission.findOne({ where :{id : req.params.id}});
  Permission.export = Export
  await Permission.save().then(async(per)=>{
    const auth = await db.Auth.findOne({where : {id : per.AuthId} , include : [{model : db.Permission}, {model : db.User}]});
    res.send(auth);
})
});



module.exports = Router;
