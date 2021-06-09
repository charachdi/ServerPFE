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

Router.get('/equipe/prime/:id' , async (req , res)=>{
   
  
    const data  = new Date().toLocaleDateString('en-US')
    const demandes = {
        New : true,
        eqid : req.params.id,
        "waiting": true,
        "Approved": false,
        "M": data.split('/')[0],
        "Y": data.split('/')[2],
        SPrimes : []
    }

    // await db.Equipe.findOne({where : {id : req.params.id } , include : [{model : db.Prime , where : {M : data.split('/')[0] , Y : data.split('/')[2] } }]}).then((resl)=>{
    //     res.json({
    //         resl,
    //       M:  data.split('/')[0],
    //       Y : data.split('/')[2], {model : db.Requete , where : {Check : 0}}
    //     })
    // })

   await db.Equipe.findOne({ where :{ id : req.params.id} , include : [{model : db.User , include : [{model : db.Presance},]}, {model : db.Prime , include : [{model : db.SPrime , include : db.User}]}]}).then((eq)=>{
     

       if(eq.Primes.length === 0){
        eq.Users.forEach(u => {
            const demande = {
                Bonus: eq.bonus,
                Prime: eq.Prime,
                Comment: "commentaire",
                User: {
                    id: u.id,
                    full_name: u.full_name,
                    user_img: u.user_img,
                }
            }

            demandes.SPrimes.push(demande)
        });
        res.status(200).json({
            demandes
          })
       }else{
        res.status(200).json({
            demandes : eq.Primes
          })
       }
        
    
   
   })


})

Router.post('/equipe/prime' , async (req , res)=>{


const {Prime} = req.body
const {Sprime} = req.body

const  NewPrime = {
    EquipeId:Prime.eqId,
    M:Prime.M,
    Y:Prime.Y,
}

const SP = []

await db.Prime.create(NewPrime).then(async(pr)=>{
    Sprime.forEach(async(S) =>{
        const NewSprime = {
            date:new Date().toLocaleDateString('en-US'),
            Bonus:S.Bonus,
            Prime:S.Prime,
            Comment:S.Comment,
            PrimeId:pr.id,
            UserId:S.User.id,
        }
     await db.SPrime.create(NewSprime).then((newS)=>{
        SP.push(newS)
     })
    })

  
})

setTimeout(async() => {
const data  = new Date().toLocaleDateString('en-US')
await db.Equipe.findOne({ where :{id : Prime.eqId}, include:[{model :  db.User},{model : db.Service},{model : db.Prime , where : {M : data.split('/')[0] , Y : data.split('/')[2] } , include : [{model : db.SPrime , include : [{model : db.User}]}] }] }).then((result)=>{
    res.status(200).json({
     eq :   result
 })
})
}, 3000);

// await db.Prime.findOne({ where : {EquipeId : Prime.eqId , M:Prime.M , Y:Prime.Y }, include : [{model :db.SPrime ,include : [{model : db.User}]}]}).then((result)=>{
    
// })
})


Router.get('/Prime/RH', async(req,res)=>{
    await db.Prime.findAll({include : [{model :db.SPrime , include:[{model :db.User}]}, {model : db.Equipe , include:{model : db.Service}}]}).then((result)=>{
        res.status(200).json({
            prime : result
        })
    })
})

Router.put('/Prime/Approved/:id', async(req,res)=>{


    const {Approved} = req.body
    await db.Prime.findOne({ where : {id : req.params.id},include : [{model :db.SPrime , include:[{model :db.User}]}, {model : db.Equipe , include:{model : db.Service}}]}).then(async(result)=>{
     
        result.Approved = Approved
        result.waiting = false
        await result.save()
            console.log(result)
        result.SPrimes.forEach(async(S) => {
            await db.SPrime.findOne({where : {id : S.id}}).then(async(Sp)=>{
                   Sp.Approved = Approved
                   Sp.waiting = false

                  await Sp.save()
            })
        });
        
        await db.Prime.findOne({ where : {id : req.params.id},include : [{model :db.SPrime , include:[{model :db.User}]}]}).then(async(result)=>{
            res.status(200).json({
                updateddem : result
            })
        })
    })
})


module.exports = Router;