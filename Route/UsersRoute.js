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


  const user = await db.User.findOne({ where: { id: req.params.id }, include: [{model: db.Chefs, include:{model : db.Service}},{ model: db.Equipe, include: [{ model: db.Service }, { model: db.CompteClient, include: [{model : db.Requete , where : {UserId : req.params.id}},{ model: db.Clientimg }, { model: db.Theme }, { model: db.Auth, where: { UserId: req.userData.userId }, include: { model: db.Permission } }] }] }] });
  console.log(user)
  if (!user) res.status(201).json({
    message: "user not found"
  })
  res.status(200).json({
    user
  })
})

//get user equipe client
Router.get('/equipecli/:id', async (req, res) => {


  const user = await db.User.findOne({ where: { id: req.params.id }, include: [{ model: db.Equipe, include: [{ model: db.Service }, { model: db.CompteClient, include: [{model : db.Requete , where : {UserId : req.params.id}},{ model: db.Clientimg }, { model: db.Theme }, { model: db.Auth, where: { UserId: req.userData.userId }, include: { model: db.Permission } }] }] }] });
  if (!user) res.status(201).json({
    message: "user not found"
  })


  res.status(200).json({
    clients : user.Equipe.CompteClients.sort(function(a, b){return b.Requetes.length - a.Requetes.length})
  
  })
})

// add user
Router.post('/', async (req, res) => {


  const { email } = req.body
  const pwd =  uuidv4()
  const { domaine } = req.body
  const { level } = req.body
  const { equipe_id } = req.body  
  const { fullname } = req.body  

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
    full_name : fullname ,
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
        const uuser = await db.User.findOne({ where: { id: user.id }, include: [{model: db.Chefs, include:{model : db.Service}},{ model: db.Equipe, include: [{ model: db.Service } ] }]})
        res.status(200).json({
          message: "user added",
          uuser,
        })
      })
  } catch (error) {
    console.log(error)
  }



})

Router.put('/update/profile/', async (req, res) => {


  
  const { address } = req.body
  const { country } = req.body
  const { sex } = req.body
  const { tel } = req.body
  const { fax } = req.body
  const { website } = req.body



  const user = await db.User.findOne({ where: { id: req.userData.userId } })
  if (!user) res.status(201).json({
    message: 'user not found'
  })

  

  
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
  // if (user.img_path != null) {
  //   await unlink(user.img_path)
  // }

  // if (pwd != "") {
  //   //Hash password
  //   const salt = await bycrpt.genSalt(10);
  //   const hashpassword = await bycrpt.hash(pwd, salt);
  //   user.pwd = hashpassword
  // }

  
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
  const updateduser = await db.User.findOne({ where: { id: user.id }, include: [{model: db.Chefs, include:{model : db.Service}},{ model: db.Equipe, include: [{ model: db.Service }, { model: db.CompteClient, include: [{ model: db.Clientimg }, { model: db.Theme }, { model: db.Auth, where: { UserId: req.userData.userId }, include: { model: db.Permission } }] }] }] })
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

Router.get('/stat/line/:id', async (req, res)=>{

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  var date  = []
  var date_value = []

  await db.Requete.findAll({where : { UserId : req.params.id}}).then((reqs)=>{
    
   
    reqs.forEach(req => {
      date.push(req.Heure_douverture.split(" ")[0])
  });

    var Trim_date = date.filter(onlyUnique);
    Trim_date.forEach(newdate => {
      const result = reqs.filter(req => req.Heure_douverture.split(" ")[0] === newdate);
      date_value.push(result.length)
  });
     
    res.status(200).json({
      date : Trim_date,
      value : date_value
    })
  })
})

Router.get('/stat/pie/:id', async (req, res)=>{
  const Clients = []
  const Requetes = []
   
    await db.User.findOne({ where : { id :req.params.id } , include : [{model : db.Equipe , include: [{model :db.CompteClient , where : { Archive : 0} , include : [{model : db.Requete , where : { UserId : req.params.id}}]}]}]}).then((user)=>{
     
      user.Equipe.CompteClients.forEach(cli => {
       Clients.push(cli.Nom_compteCli)
       Requetes.push(cli.Requetes.length)
     });
     
     
      res.status(200).json({
       client :  Clients.slice(0, 5),
       value : Requetes.slice(0, 5)
      })
    })
})

Router.get('/stat/clients/:id' ,async (req,res)=>{

  const Clients = []
  // const result = compteClient.Requetes.filter(req => req.UserId === id);

  await db.User.findOne({ where : { id :req.params.id } , include : [{model : db.Equipe , include: [{model :db.CompteClient , where : {Archive : 0 } , include : [{model : db.Requete , where : { UserId : req.params.id}} , {model : db.Theme},{model : db.Clientimg}]}]}]}).then((user)=>{
     
    user.Equipe.CompteClients.forEach(cli => {

      const data = {
        client : cli.Nom_compteCli,
        profile : cli.Clientimg.img_profile,
        background : cli.Clientimg.img_background,
        color : cli.Theme.Color,
        total_Requetes : cli.Requetes.length,
        ok :  cli.Requetes.filter(req => req.Statut === "Clôturé").length ,
        ko : cli.Requetes.filter(req => req.Statut !== "Clôturé").length,
        prog_value : ((cli.Requetes.filter(req => req.Statut === "Clôturé").length /cli.Requetes.length )*100).toFixed(0),
      }

   
     Clients.push(data)
    
   });
   
   const Sorted =  Clients.sort(function(a, b){return b.ok - a.ok})
    res.status(200).json({
      Clients :  Sorted
    })
  })
})

Router.get('/stat/bar/:id' ,async (req,res)=>{

  const Origine = []
  const origine_value = []
  // const result = compteClient.Requetes.filter(req => req.UserId === id);
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }


  await db.User.findOne({ where : { id :req.params.id } , include : [{model : db.Requete}]}).then((user)=>{
    user.Requetes.forEach(req => {
        Origine.push(req.Origine_de_la_requete)
     });

     var Trim_Origine = Origine.filter(onlyUnique);
     Trim_Origine.forEach(orig => {
      const result = user.Requetes.filter(req => req.Origine_de_la_requete === orig);
      origine_value.push(result.length)
     });


    res.status(200).json({
      Origine : Trim_Origine , 
      value : origine_value
    })
  })
})

Router.get('/Requete/false/:id' ,async (req,res)=>{

  await db.Requete.findAll({ where : { UserId : req.params.id, Check : 0 } , include : {model :  db.User}}).then(listreq =>{
    res.status(200).json({
      listreq,
      Count : listreq.length
    })
  })

})


module.exports = Router;