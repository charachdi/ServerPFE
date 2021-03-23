const express = require('express')
const Router = express.Router()
const db = require("../models");



//get all service
Router.get('/', async(req,res)=>{
 const service = await db.Service.findAll({ include: [{model :  db.Equipe }]})
 console.log(service)
 res.send(service)


})


//get one service by id
Router.get('/:id',async (req,res)=>{


  const service = await db.Service.findOne({ where: {id : req.params.id} , include: [{model :  db.Equipe }]});
  if (!service) res.status(201).json({
    message : "service not found"
  }) 

  res.status(200).json({
    service
  })
})


// add service
Router.post('/',async (req,res)=>{


        const {nomService} = req.body
        
      

      // Create new service
      const NewService = {
        Nom_service : nomService,
        
        
         }

       // saving the new service
       try {

      const newservice =   await  db.Service.create(NewService)
      .then((service)=>{
        res.status(200).json({
          message : "service added",
          service,
        })
      })
       } catch (error) {
       console.log(error)
       }
 
  
    
})


//update service
Router.put('/update/service/:id', async (req,res)=>{


    const {nomService} = req.body
 
  

    const service = await db.Service.findOne({ where : {id : req.params.id} , include: [{model :  db.Equipe }]})
    if(!service) res.status(201).json({
      message : 'service not found'
    })

    service.Nom_service =  nomService
    


   await service.save()
   .then((service)=>{
    res.status(200).json({
      message :' service updated',
      service
    })
   })
  
  })




//delete service
Router.delete('/:id', async (req,res)=>{
  const service = await db.Service.findOne({ where : {id : req.params.id}})
  if(!service) res.status(201).json({
    message : 'service not found'
  })

  service.destroy();
  res.status(200).json({
    message : "service deleted",
    service
  })
})




module.exports = Router;