const express = require('express')
const Router = express.Router()
const db = require("../models");
const bycrpt = require("bcryptjs");
const Jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const upload =  require('./../store/userprofile') 
const authentification = require('./../midellware/authentification')
const Mailer =  require('./../midellware/Mailer')


Router.use(authentification)
//get all users
Router.get('/', async(req,res)=>{
 const users = await db.User.findAll({ include: db.Equipe })
 console.log(users)
 res.send(users)


})


//get one user by email
Router.get('/:id',async (req,res)=>{


  const user = await db.User.findOne({ where: {id : req.params.id}});
  if (!user) res.status(201).json({
    message : "user not found"
  }) 

  res.status(200).json({
    user
  })
})


// add user
Router.post('/',async (req,res)=>{


        const {email} = req.body
        const {pwd} = req.body
        const {level} = req.body
        const { equipe_id } = req.body

      //check if user exists
      const emailexist = await db.User.findOne({ where: {user_email : email}});
      if (emailexist) return res.status(201).json({
        message : "Email exists try another one"
      })


      //Hash password
    const salt = await bycrpt.genSalt(10);
    const hashpassword = await bycrpt.hash(pwd,salt);

      // Create new user
      const NewUser = {
         user_email : email,
         pwd : hashpassword,
         user_level:level,
        //  activation_code : uuidv4()
         }

         if(equipe_id !== ""){
          NewUser.EquipeId = equipe_id
         }

       // saving the new user
       try {

      const newuser =   await  db.User.create(NewUser)
      .then((user)=>{
        // Mailer()
        res.status(200).json({
          message : "user added",
          user,
        })
      })
       } catch (error) {
       console.log(error)
       }
 
  
    
})



Router.put('/update/profile/', async(req, res)=>{
  
 
    const { fullName } = req.body
    const { address } = req.body
    const { country } = req.body
    const { sex } = req.body
    const { tel } = req.body
    const { fax } = req.body
    const { website } = req.body

   

    const user = await db.User.findOne({ where : {id : req.userData.userId}})
    if(!user) res.status(201).json({
      message : 'user not found'
    })

    user.full_name = fullName
    user.address = address
    user.tel = tel
    user.fax = fax
    user.Website = website
    user.user_sex = sex
    user.country = country
    user.ftime = "false"
    
console.log(req.body)

   await user.save()
   .then((user)=>{
    res.status(200).json({
      message :' user updated',
      user
    })
   })
  
})


//update user
Router.put('/update/profileimg',upload.single("myImage"), async (req,res)=>{


    const { fullName } = req.body
    const { address } = req.body
    const { country } = req.body
    const { sex } = req.body
    const { tel } = req.body
    const { fax } = req.body
    const { website } = req.body

    const url =`http://${req.hostname}:${process.env.PORT || 3001}/userimg/${req.file.filename}`

    const user = await db.User.findOne({ where : {id : req.userData.userId}})
    if(!user) res.status(201).json({
      message : 'user not found'
    })

    user.full_name = fullName
    user.address = address
    user.tel = tel
    user.fax = fax
    user.Website = website
    user.user_img = url
    user.user_sex = sex
    user.country = country
    user.ftime = "false"
    


   await user.save()
   .then((user)=>{
    res.status(200).json({
      message :' user updated',
      user
    })
   })
  
  })

//update level
Router.put('/level/:id', async (req,res)=>{

  const {role} = req.body
  const user = await db.User.findOne({ where : {user_email : email}})
  if(!user) res.status(201).json({
    message : 'user not found'
  })

  user.user_level = role;
  await user.save()
  res.status(200).json({
    message : "role updated",
    user
  })
})


//update auth
Router.put('/auth/:id', async (req,res)=>{

  const {role} = req.body
  const user = await db.User.findOne({ where : {user_email : email}})
  if(!user) res.status(201).json({
    message : 'user not found'
  })

  user.user_level = role;
  await user.save()
  res.status(200).json({
    message : "role updated",
    user
  })
})




//admin update 
//update user
Router.put('/update/profile/admin/:id', async (req,res)=>{


  const { full_name } = req.body
  const { email } = req.body
  const { pwd } = req.body
  const { level } = req.body
  const { equipe_id } = req.body

  


  const user = await db.User.findOne({ where : {id : req.params.id} , include: db.Equipe})
  if(!user) res.status(201).json({
    message : 'user not found'
  })
  if(pwd != ""){
    //Hash password
    const salt = await bycrpt.genSalt(10);
    const hashpassword = await bycrpt.hash(pwd,salt);
    user.pwd = hashpassword
  }
  user.full_name = full_name
  user.user_level = level
  user.user_email = email
  user.EquipeId = equipe_id

 await user.save()
 const updateduser = await db.User.findOne({ where : {id : user.id} , include: db.Equipe})
  res.status(200).json({
    message :' user updated',
    updateduser
  })

})

//delete user
Router.delete('/user/:id', async (req,res)=>{
  const user = await db.User.findOne({ where : {id : req.params.id}})
  if(!user) res.status(201).json({
    message : 'user not found'
  })

  user.destroy();
  res.status(200).json({
    message : "user deleted",
    user
  })
})




module.exports = Router;