const express = require('express')
const Router = express.Router()
const db = require("../models");



//get all equipes
Router.get('/', async(req,res)=>{
 const equipe = await db.Equipe.findAll({ include:[{model :  db.User},{model : db.Service}] })
 

 res.send(equipe)


})


//get one equipe by id
Router.get('/:id',async (req,res)=>{


  const equipe = await db.Equipe.findOne({ where: {id : req.params.id} , include:[{model :  db.User},{model : db.Service}] });
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


// add equipe
Router.post('/',async (req,res)=>{


        const {ServiceID} = req.body
        const {nomEquipe} = req.body
      

      // Create new equipe
      const NewEquipe = {
        Nom_equipe : nomEquipe,
        ServiceId : ServiceID,
        
         }

         console.log(NewEquipe)

       // saving the new user
       try {

      const newequipe =   await  db.Equipe.create(NewEquipe)
      .then(async(eq)=>{
        const equipe = await db.Equipe.findOne({ where: {id : eq.id} , include:[{model :  db.User},{model : db.Service}] });
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