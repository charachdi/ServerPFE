const express = require('express')
const Router = express.Router()
const db = require("../models");



//get all compte client
Router.get('/', async(req,res)=>{
 const compteCli = await db.CompteCli.findAll()
 res.send(compteCli)


})


//get one compte client by id
Router.get('/:id',async (req,res)=>{


  const compteCli = await db.CompteCli.findOne({ where: {id : req.params.id}});
  if (!compteCli) res.status(201).json({
    message : "compte client not found"
  }) 

  res.status(200).json({
    compteCli
  })
})


// add compte client
Router.post('/',async (req,res)=>{


        const {nomCompteCli} = req.body

      

      // Create new compte client
      const NewCompteCli = {
        Nom_compteCli : nomCompteCli,
  
        
         }

       // saving the new compte client
       try {

      const newcompteCli =   await  db.CompteCli.create(NewCompteCli)
      .then((compteCli)=>{
        res.status(200).json({
          message : "compte client added",
          compteCli,
        })
      })
       } catch (error) {
       console.log(error)
       }
 
  
    
})


//update compte client
Router.put('/update/compteCli/:id', async (req,res)=>{


    const {nomCompteCli} = req.body
    
  
    
 

    const compteCli = await db.CompteCli.findOne({ where : {id : req.params.id}})
    if(!compteCli) res.status(201).json({
      message : 'compte client not found'
    })

    compteCli.Nom_compteCli = nomCompteCli
   
    


   await compteCli.save()
   .then((compteCli)=>{
    res.status(200).json({
      message :' compte client updated',
      compteCli
    })
   })
  
  })




//delete compte client
Router.delete('/:id', async (req,res)=>{
  const compteCli = await db.CompteCli.findOne({ where : {id : req.params.id}})
  if(!compteCli) res.status(201).json({
    message : 'compte client not found'
  })

  compteCli.destroy();
  res.status(200).json({
    message : "compte client deleted",
    compteCli
  })
})




module.exports = Router;