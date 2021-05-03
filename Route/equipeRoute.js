const express = require('express')
const Router = express.Router()
const db = require("../models");
const Op = require('sequelize').Op
const { v4: uuidv4 } = require('uuid');

//get all equipes
Router.get('/', async(req,res)=>{
 const equipe = await db.Equipe.findAll({ include:[{model :  db.User},{model : db.Service},{model : db.CompteClient}] })
 

 res.send(equipe)


})






//get one equipe by id
Router.get('/:id',async (req,res)=>{


  const equipe = await db.Equipe.findOne({ where: {id : req.params.id} , include:[{model :  db.User},{model : db.Archive},{model : db.Service}, {model : db.Files , include :[{model : db.User}]}] });
  if (!equipe) res.status(201).json({
    message : "equipe not found"
  }) 


  var chefE = []
  var collab = []


  equipe.Users.forEach(user => {
    if(user.user_level === "Chef equipe"){
      chefE.push(user)
    }else if (user.user_level === "Collaborateur"){
         collab.push(user)
    }
  });


  console.log(equipe.Users)

  res.status(200).json({
    equipe,
    chefE,
    collab,
  })
})


//get one equipe by id
Router.get('/compte/:id',async (req,res)=>{


  const equipe_Non_archive = await db.Equipe.findOne({ where: {id : req.params.id} , include:[{model : db.CompteClient , where : {Archive : false} , include :[{model : db.Clientimg}, {model : db.Theme},{model : db.Requete}] }] });
  const equipe_archive = await db.Equipe.findOne({ where: {id : req.params.id} , include:[{model : db.CompteClient , where : {Archive : true} , include :[{model : db.Clientimg}, {model : db.Theme},{model : db.Requete}] }] });

  if (!equipe_Non_archive) res.status(201).json({
    message : "equipe not found"
  }) 

   var cli_non_archive = equipe_Non_archive.CompteClients.sort(function(a, b){
     return b.Requetes.length - a.Requetes.length
    })

  var cli_archive = []

    if(equipe_archive){
      var cli_archive =  equipe_archive.CompteClients.sort(function(a, b){
        return b.Requetes.length - a.Requetes.length
       })
    }
   

  res.status(200).json({
    clients : cli_non_archive,
    archive : cli_archive
  })

})


// add equipe
Router.post('/',async (req,res)=>{


        const {ServiceID} = req.body
        const {nomEquipe} = req.body
      

      // Create new equipe
      const NewEquipe = {
        Nom_equipe : nomEquipe,
        ServiceId : ServiceID,
        Roomid : uuidv4()

        
         }

         console.log(NewEquipe)

       // saving the new user
       try {

      const newequipe =   await  db.Equipe.create(NewEquipe)
      .then(async(eq)=>{
        const equipe = await db.Equipe.findOne({ where: {id : eq.id} , include:[{model :  db.User},{model : db.Service}] });
        db.Archive.create({
          EquipeId : equipe.id
        })
        res.status(200).json({
          message : "equipe added",
          equipe,
        })
      })
       } catch (error) {
       console.log(error)
       }
 
  
    
})


//update equipe
Router.put('/update/equipe/:id', async (req,res)=>{


  const {ServiceID} = req.body
  const {nomEquipe} = req.body
  
    
 

    const equipe = await db.Equipe.findOne({ where : {id : req.params.id} ,include:[{model :  db.User},{model : db.Service}]})
    if(!equipe) res.status(201).json({
      message : 'equipe not found'
    })

    equipe.Nom_equipe = nomEquipe
    equipe.ServiceId =  ServiceID
    

   await equipe.save()
   .then(async()=>{
    const equipe = await db.Equipe.findOne({ where : {id : req.params.id} ,include:[{model :  db.User},{model : db.Service}]})
    res.status(200).json({
      message :' equipe updated',
      equipe
    })
   })
  
  })


//update equipe setting
Router.put('/setting/:id', async (req,res)=>{

    const {prog} = req.body
    const {reqete} = req.body

 await db.Archive.findOne({ where : {id : req.params.id}}).then(async (ar)=>{
    if(!ar) res.status(201).json({
      message : 'equipe not found'
    })

    ar.Prog = prog
    ar.requete = reqete

    await ar.save().then((newar)=>{
      res.status(200).json({
        newar
      })
    })
  })
  

  
  
})





//delete equipe
Router.delete('/:id', async (req,res)=>{
  const equipe = await db.Equipe.findOne({ where : {id : req.params.id}})
  if(!equipe) res.status(201).json({
    message : 'equipe not found'
  })

  equipe.destroy();
  res.status(200).json({
    message : "equipe deleted",
    equipe
  })
})




module.exports = Router;