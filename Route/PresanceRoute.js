const express = require('express')
const Router = express.Router()
const db = require("../models");
const Op = require('sequelize').Op
const { v4: uuidv4 } = require('uuid');
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);


Router.get('/user/attend/', async (req , res)=>{

    var total = 0
    var Present = 0
    var Absent = 0
    var Conge = 0 
    var Retard = 0


    await db.User.findAll({ where : { user_level : ['Collaborateur','Chef equipe']}, include : { model : db.Presance , limit : 1 ,order: [['date','DESC']] , where : { date : new Date().toLocaleDateString("en-US") }}}).then((user)=>{
       
    //     user.forEach(u => {

    //         if(u.Presances[0].Present){Present++}
    //         if(u.Presances[0].Absent){Absent++}
    //         if(u.Presances[0].Conge){Conge++}
    //         if(u.Presances[0].Retard){Retard++}
    //    });

   
       
        res.status(200).json({
            user,
            Present,
            Absent,
            Conge,
            Retard,
        })
    })
})


Router.put('/:id', async (req, res)=>{

    const  {Present} = req.body
    const  {Absent} = req.body
    const  {Retard} = req.body
    // const  Conge = req.body
    const  Comment = ""

    

            await db.User.findOne({ where : { id : req.params.id}}).then( async (user)=>{

                    await db.Presance.findOne({ where : {UserId : user.id , date : new Date().toLocaleDateString("en-US")}}).then( async (pres)=>{
                        if(pres){
                            pres.Present = Present
                            pres.Absent = Absent
                            pres.Retard = Retard
                            pres.Conge = false
                            pres.Comment = Comment
                           

                           await pres.save().then( async (Presance)=>{
                               await db.Presance.findOne({ where : { id : Presance.id} }).then((result)=>{
                                res.status(200).json({
                                    result
                                })
                               })
                             
                           })

                        }else{
                            const Presance = {
                                Present : Present,
                                Absent : Absent,
                                Retard : Retard,
                                Conge : false ,
                                date : new Date().toLocaleDateString("en-US"),
                                Comment : Comment,
                                UserId : user.id,
                            }

                            await db.Presance.create(Presance).then(result =>{
                                res.status(200).json({
                                    result
                                })
                            })
                        }
                    })
                    

            })
})


Router.put('/comment/:id', async (req,res)=>{


    const {Comment} = req.body

    await db.Presance.findOne({ where : {UserId : req.params.id , date : new Date().toLocaleDateString("en-US")}}).then( async (pres)=>{
        if(pres){
            pres.Comment = Comment
            await pres.save().then(()=>{
                res.status(200).json({
                    Comment
                })
            })
        }

    })
})

module.exports = Router;
