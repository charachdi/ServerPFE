const express = require('express')
const Router = express.Router()
const db = require("../models");
const Op = require('sequelize').Op
const authentification = require('./../midellware/authentification')
const { v4: uuidv4 } = require('uuid');
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);


Router.use(authentification)

Router.get('/', async (req, res)=>{
            await db.Demande.findAll({ include :[{model :db.User}]}).then((demandes)=>{
                res.status(200).json({
                    demandes
                })
            })
})

Router.get('/:id', async (req, res)=>{
    await db.Demande.findAll({ where : {UserId : req.params.id} , include : [{model : db.User}]}).then((demandes)=>{
        res.status(200).json({
            demandes
        })
    })
})


Router.post('/', async (req,res)=>{
  
    const {startDate} =req.body
    const {endDate} = req.body
    const {type} = req.body	
    

    const newdemande = {
        Startdate : startDate ,
        enddate : endDate,
        Type :type,
        UserId : req.userData.userId,
    }

    await db.Demande.create(newdemande).then( async (result)=>{
        await db.Demande.findOne({ where : {id : result.id} , include : [{model : db.User}]}).then((Newdemande)=>{
            res.status(200).json({
                Newdemande
            })
        })
      
    })

})

Router.put('/:id', async (req, res)=>{


    const {startDate} =req.body
    const {endDate} = req.body


    await db.Demande.findOne({ where : {id : req.params.id}}).then( async (dem)=>{
        dem.Startdate = startDate 
        dem.enddate = endDate

        await dem.save().then( async ()=>{
            await  db.Demande.findOne({ where : {id : req.params.id} , include : { model :db.User}}).then((updateddem)=>{
                res.status(200).json({
                    updateddem
                })
            })
        })
    })
})

Router.put('/Approved/:id', async (req, res)=>{

    const {Approved} = req.body

   
    await db.Demande.findOne({ where : {id : req.params.id}}).then( async (dem)=>{
        dem.Approved = Approved
        dem.waiting = false

      
        
        const start = new Date(dem.Startdate)
        const end = new Date(dem.enddate)
        const range = moment.range(moment(start), moment(end))
        const array =  Array.from(range.by('day'))

      

        if(Approved){
           
            array.forEach( async (date) => {
                const Presance = {
                    Present : false,
                    Absent : false,
                    Retard : false,
                    Conge : true ,
                    Comment : "",
                    date : new Date(date).toLocaleDateString("en-US"),
                    UserId : dem.UserId,
                }

                await db.Presance.create(Presance)
            });
            
        }
        else {
            array.forEach( async (date) => {
                await db.Presance.destroy({ where : {date : new Date(date).toLocaleDateString("en-US") , UserId : dem.UserId}})
            })
           
        }
    
        await dem.save().then( async ()=>{
            await  db.Demande.findOne({ where : {id : req.params.id} , include : { model :db.User}}).then((updateddem)=>{
                res.status(200).json({
                    updateddem
                })
            })
        })
    })
})





module.exports = Router;