const express = require('express')
const Router = express.Router()
const db = require("../models");
const authentification = require('./../midellware/authentification')

Router.get('/database', async (req,res)=>{
    await db.Database.findAll({}).then((data)=>{
        res.status(200).json({
            data
        })
    })
})


Router.post('/database', async (req, res)=>{

    const {Username} = req.body
    const {Password} = req.body
    const {Host} = req.body
    const {Database} = req.body

    if( !Username || !Host || !Database){

        res.status(201).json({
            message : "empty field"
        })

    }else {
        const newdatabase = {
            Username : Username,
            Password : Password,
            Host : Host,
            Database : Database,
        }
    
        await db.Database.create(newdatabase).then((data)=>{
            res.status(200).json({
                data
            })
        })
    }

   

   
})


Router.put('/database/:id', async (req, res)=>{

    const {Username} = req.body
    const {Password} = req.body
    const {Host} = req.body
    const {Database} = req.body

    await db.Database.findOne({where : { id : req.params.id}}).then( async (base)=>{
        if(!base) res.status(201).json({
            message : "base not found"
        })
        base.Username = Username
        base.Password = Password
        base.Host = Host
        base.Database = Database

        await base.save().then((data)=>{
            res.status(200).json({
                data
            })
        })



    })

   
})


Router.put('/database/status/:id', async (req, res)=>{


    await db.Database.findOne({where : { Active : 1}}).then((result)=>{
        if(result){
            result.Active = false
            result.save()
        }
      
    })

    await db.Database.findOne({where : { id : req.params.id}}).then( async (base)=>{
        if(!base) res.status(201).json({
            message : "base not found"
        })
        base.Active = !base.Active
      
        await base.save().then( async (data)=>{
            await db.Database.findAll({}).then((all)=>{
                res.status(200).json({
                    all
                })
            })
           
        })



    })

   
})


Router.delete('/database/:id', async (req,res)=>{
    await db.Database.findOne({where : {id : req.params.id}}).then( async (data)=>{
       await data.destroy().then(()=>{
           res.status(200).json({
               message : "ok"
           })
       })
    })
})



//get all equipes
Router.get('/equipe', async(req,res)=>{
  await db.Equipe.findAll({ include:[{model :  db.User},{model : db.Service}] }).then((equipe)=>{
      res.status(200).json({
          equipe
      })
  })
   
   })

   Router.put('/equipe/prime/:id', async (req,res)=>{

    const {Prime} = req.body
    const {bonus} = req.body

    await db.Equipe.findOne({ where : {id: req.params.id }}).then(async(equipe)=>{

        if(Prime !== ""){
            equipe.Prime = Prime
        }

        if(bonus !== ""){
            equipe.bonus = bonus
        }
       
     


        equipe.save().then(()=>{
            res.status(200).send("ok")
        })
    })
   })
   


module.exports = Router;