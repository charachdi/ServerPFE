const express = require('express')
const Router = express.Router()
const db = require("../models");
const bycrpt = require("bcryptjs");
const Jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const upload = require('./../store/userprofile')
const authentification = require('./../midellware/authentification')
const Mailer = require('./../midellware/Mailer')
const { promisify } = require('util')
const fs = require("fs")
const unlink = promisify(fs.unlink)

Router.use(authentification)
//get all users
Router.get('/', async (req, res) => {
  const users = await db.User.findAll({ include: [{model : db.Equipe , include :[{model : db.Service}]} ,{model: db.Chefs , include :[{model:db.Service}]}] })
  res.send(users)


})


//get one user by email
Router.get('/:id', async (req, res) => {


  const user = await db.User.findOne({ where: { id: req.params.id }, include: [{model: db.Chefs, include:{model : db.Service}},{ model: db.Equipe, include: [{ model: db.Service }, { model: db.CompteClient, include: [{ model: db.Clientimg }, { model: db.Theme }, { model: db.Auth, where: { UserId: req.userData.userId }, include: { model: db.Permission } }] }] }] });
  console.log(user)
  if (!user) res.status(201).json({
    message: "user not found"
  })
  res.status(200).json({
    user
  })
})


// add user
Router.post('/', async (req, res) => {


  const { email } = req.body
  const pwd =  uuidv4()
  const { domaine } = req.body
  const { level } = req.body
  const { equipe_id } = req.body  
  const { ServiceId } = req.body

  //check if user exists
  const emailexist = await db.User.findOne({ where: { user_email: email+domaine } });
  if (emailexist) return res.status(201).json({
    message: "Email exists try another one"
  })


  //Hash password
  const salt = await bycrpt.genSalt(10);
  const hashpassword = await bycrpt.hash(pwd, salt);

  // Create new user
  const NewUser = {
    user_email: email+domaine,
    pwd: hashpassword,
    user_level: level,
    //  activation_code : uuidv4()
  }

  console.log(NewUser)

  if (equipe_id !== "") {
    NewUser.EquipeId = equipe_id
  }

  // saving the new user
  try {

    const newuser = await db.User.create(NewUser)
      .then(async(user) => {
        const content = `Email : ${user.user_email}
        password : ${pwd}`
        Mailer("aminehaboubi00@gmail.com",content)

        if(level === "Chef Service"){
          const chefs = {
            UserId : user.id,
            ServiceId : ServiceId
          }
          await db.Chefs.create(chefs)
        }

        // auth and permission
        if (equipe_id !== "") {
          const equipe = await db.Equipe.findOne({ where: { id: equipe_id }, include: [{ model: db.CompteClient }] });

          //creating new auth for each client account
          equipe.CompteClients.forEach(async(cl) => {
            const newAuth = {
              UserId: user.id,
              CompteClientId: cl.id
            }

             //saving the auth
          const savedauth = await db.Auth.create(newAuth)

            //creating new premission for each auth
          const newpermission = {
            AuthId: savedauth.id
          }

          //saving the permissions
          await db.Permission.create(newpermission)
          });
        }
        res.status(200).json({
          message: "user added",
          user,
        })
      })
  } catch (error) {
    console.log(error)
  }



})



Router.put('/update/profile/', async (req, res) => {


  const { fullName } = req.body
  const { address } = req.body
  const { country } = req.body
  const { sex } = req.body
  const { tel } = req.body
  const { fax } = req.body
  const { website } = req.body


  console.log(req.userData.userId)
  const user = await db.User.findOne({ where: { id: req.userData.userId } })
  if (!user) res.status(201).json({
    message: 'user not found'
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
    .then((user) => {
      res.status(200).json({
        message: ' user updated',
        user
      })
    })

})


//update user
Router.put('/update/profileimg', upload.single("myImage"), async (req, res) => {


  const { fullName } = req.body
  const { address } = req.body
  const { country } = req.body
  const { sex } = req.body
  const { tel } = req.body
  const { fax } = req.body
  const { website } = req.body
  const { pwd } = req.body

  const url = `http://${req.hostname}:${process.env.PORT || 3001}/userimg/${req.file.filename}`
  const path = req.file.path

  const user = await db.User.findOne({ where: { id: req.userData.userId } })
  if (!user) res.status(201).json({
    message: 'user not found'
  })
  if (user.img_path != null) {
    await unlink(user.img_path)
  }

  if (pwd != "") {
    //Hash password
    const salt = await bycrpt.genSalt(10);
    const hashpassword = await bycrpt.hash(pwd, salt);
    user.pwd = hashpassword
  }

  user.full_name = fullName
  user.address = address
  user.tel = tel
  user.fax = fax
  user.Website = website
  user.user_img = url
  user.img_path = path
  user.user_sex = sex
  user.country = country
  user.ftime = "false"



  await user.save()
    .then((user) => {
      res.status(200).json({
        message: ' user updated',
        user
      })
    })

})

//update level
Router.put('/Banned/:id', async (req, res) => {

  const {Banned} = req.body

  const user = await db.User.findOne({ where: { id: req.params.id } })
  if (!user) res.status(201).json({
    message: 'user not found'
  })

  user.banned = Banned;
  await user.save()
  res.status(200).json({
    message: "Banned updated",
    user
  })
})


//update auth
Router.put('/auth/:id', async (req, res) => {

  const { role } = req.body
  const user = await db.User.findOne({ where: { user_email: email } })
  if (!user) res.status(201).json({
    message: 'user not found'
  })

  user.user_level = role;
  await user.save()
  res.status(200).json({
    message: "role updated",
    user
  })
})




//admin update 
//update user
Router.put('/update/profile/admin/:id', async (req, res) => {


  const { full_name } = req.body
  const { email } = req.body
  const { pwd } = req.body
  const { level } = req.body
  const { equipe_id } = req.body  
  const { ServiceId } = req.body






  const user = await db.User.findOne({ where: { id: req.params.id }, include: [{model :db.Equipe} , {model : db.Auth},{model: db.Chefs}] })
  if (!user) res.status(201).json({
    message: 'user not found'
  })


  //checking for updation level from chef service

  if(ServiceId !== ""){
    if(user.Chef.ServiceId !== ServiceId){
      const chefs  = await db.Chefs.findOne({where : { UserId : req.params.id }})
       chefs.destroy()
        const chef = {
        UserId : user.id,
        ServiceId : ServiceId
      }
      await db.Chefs.create(chef)
    }
  }
  

  if (pwd != "") {
    //Hash password
    const salt = await bycrpt.genSalt(10);
    const hashpassword = await bycrpt.hash(pwd, salt);
    user.pwd = hashpassword
  }
  user.full_name = full_name
  user.user_level = level
  user.user_email = email

  if (equipe_id !== user.EquipeId && equipe_id !== "") {
      user.EquipeId = equipe_id
      const auth = await db.Auth.findAll({ where : {UserId : user.id }})
      auth.forEach(A => {
        A.destroy()
      });

      const equipe = await db.Equipe.findOne({ where: { id: equipe_id }, include: [{ model: db.CompteClient }] });

      //creating new auth for each client account
      equipe.CompteClients.forEach(async(cl) => {
        const newAuth = {
          UserId: user.id,
          CompteClientId: cl.id
        }

         //saving the auth
      const savedauth = await db.Auth.create(newAuth)

        //creating new premission for each auth
      const newpermission = {
        AuthId: savedauth.id
      }

      //saving the permissions
      await db.Permission.create(newpermission)
      });
  }


  await user.save()
  const updateduser = await db.User.findOne({ where: { id: user.id }, include: [{model : db.Equipe},{model: db.Chefs}] })
  res.status(200).json({
    message: ' user updated',
    updateduser
  })

})

//delete user
Router.delete('/user/:id', async (req, res) => {
  const user = await db.User.findOne({ where: { id: req.params.id } })
  if (!user) res.status(201).json({
    message: 'user not found'
  })

  // await unlink(user.img_path)

  user.destroy();
  res.status(200).json({
    message: "user deleted",
    user
  })
})




module.exports = Router;