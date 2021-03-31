const Router = require("express").Router();
const jwt = require("jsonwebtoken");
const bycrpt = require("bcryptjs");
const db = require("../models");



Router.post("/login", async (req, res) => {
  const {email} = req.body
  const {pwd} = req.body

  //check if user exists
const user = await db.User.findOne({ where: {user_email : email}, include: [{ model: db.Equipe, include: [{ model: db.Service }, { model: db.CompteClient, include: [{ model: db.Clientimg }, { model: db.Theme }] }] }]});
if (!user) return res.status(201).json({
    message : "email incorrect"
})


//Passwor incorrect
const validpassword = await bycrpt.compare(pwd,user.pwd)
if (!validpassword) return res.status(201).json({
    message :"password incorrect"
  })
  
//create Token
const Token = jwt.sign({id: user.id , user_level : user.user_level},process.env.SECRET_CODE);
res.status(200).json({
  token : Token,
  user

})
});



Router.put('/update/:id',async (req , res)=>{

  const password = req.body.password;

  //check if user exists
const user = await User.findOne({_id: req.params.id});
if (!user) return res.status(201).json({
    message : "user not here"
})

//Passwor incorrect
const validpassword = await bycrpt.compare(password,user.password)
if (!validpassword) return res.status(201).json({
    message :"password incorrect"
  })

  const filter = { _id: req.params.id };
  const update = {
    name : req.body.name,
    lastname : req.body.lastname ,
    email : req.body.email ,
    phone : req.body.phone ,
  };
  //find user BY _id and Update
  await User.findOneAndUpdate(filter, update)
  .catch(err =>{
    res.status(201).json({
        message : "try again"
    })
  })
const updateduser =  await User.findOne(filter)
res.status(200).json({
    message : "user updated",
    updateduser
})


})

module.exports = Router;
