const express = require('express')
const Router = express.Router()
const db = require("../models");
const Op = require('sequelize').Op
const authentification = require('./../midellware/authentification')
Router.use(authentification)


Router.get('/', async (req, res)=>{
  await db.Plan.findAll({}).then((result)=>{res.send(result)})
})


Router.get('/:id', async (req, res)=>{
    await db.Plan.findAll({ where : {UserId : req.params.id}}).then((result)=>{res.send(result)})
  })

Router.put('/:id', async(req , res)=>{
  const {text} = req.body
  await db.Plan.findOne({ where : {id : req.params.id}}).then(async(plan)=>{
  
      plan.Text = text
      await plan.save().then(()=>{
        res.status(200).json({
          Comment : text
        })
      })
})
})


Router.delete('/:id' , async (req , res)=>{
  await db.Plan.findOne({ where : {id : req.params.id}}).then(async(plan)=>{
    await plan.destroy().then(async()=>{
    await db.Plan.findAll({ where : {UserId :plan.UserId}}).then((result)=>{res.send(result)})
})
})
})


Router.post('/:id', async (req,res)=>{
  const {Text} = req.body
 const newplan = {
   Text: Text,
   UserId : req.params.id
 }


 await db.Plan.create(newplan).then((result)=>{
   res.status(200).send(result)
 })
})

module.exports = Router;