const express = require('express')
const Router = express.Router()
const db = require("../models");
const upload =  require('./../store/clientprofile') 
const { promisify } = require('util')
const fs = require("fs")
const unlink = promisify(fs.unlink)



//get all compte client
Router.get('/', async(req,res)=>{
 const compteCli = await db.CompteClient.findAll({include:[{model :  db.Equipe},{model : db.Service}, {model : db.Clientimg}]})
 res.send(compteCli)


})


//get one compte client by id
Router.get('/:id',async (req,res)=>{


  const compteCli = await db.CompteClient.findOne({ where: {id : req.params.id} , include:[{model :  db.Equipe},{model : db.Service}, {model : db.Clientimg}]});
  if (!compteCli) res.status(201).json({
    message : "compte client not found"
  }) 

  res.status(200).json({
    compteCli
  })
})


// add compte client
Router.post('/', upload.array('clientimg[]'),async (req,res)=>{
 


        const {Nom_compteCli} = req.body
        const {ServiceId} = req.body
        const {EquipeId} = req.body
        const {description} = req.body
       
       
      // Create new compte client
      const NewCompteCli = {
        Nom_compteCli : Nom_compteCli,
        ServiceId :ServiceId ,
        EquipeId :EquipeId ,
        description : description
         }

         const Newclientimg = {
          img_profile:`http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[0].filename}`,
          img_background:`http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[1].filename}`,
          img_profile_path : req.files[0].path,
          img_background_path :req.files[1].path,
          CompteClientId : ""
         }
         
       
      //  // saving the new compte client  
       try {

  const savedcompte =  await  db.CompteClient.create(NewCompteCli)
  Newclientimg.CompteClientId = savedcompte.id

  await  db.Clientimg.create(Newclientimg)
  .then(async()=>{
       const client = await db.CompteClient.findOne({ where: {id : savedcompte.id} , include:[{model :  db.Equipe},{model : db.Service}, {model : db.Clientimg}]});
         res.status(200).json({
          message : "compte client added",
          client,
        })
  })
       } catch (error) {
       console.log(error)
       }
 
  
    
})


//update compte client
Router.put('/update/clients/:id', upload.array('clientimg[]'),async (req,res)=>{



  

        const {Nom_compteCli} = req.body
        const {ServiceId} = req.body
        const {EquipeId} = req.body
        const {description} = req.body

    const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id } , include:[{model :  db.Equipe },{model : db.Service}, {model : db.Clientimg}] })
    if(!compteCli) res.status(201).json({
      message : 'compte client not found'
    })
     const comImg =   await  db.Clientimg.findOne({ where : {CompteClientId : compteCli.id }})

    compteCli.Nom_compteCli = Nom_compteCli
    compteCli.description = description
    if(ServiceId !== ""){
      compteCli.ServiceId = ServiceId 
    }
    if(EquipeId !== ""){
      compteCli.EquipeId  = EquipeId
    }
   
    if(req.files[0]){
      console.log("1")

      const updateprofimg = async() =>{
        await unlink(compteCli.Clientimg.img_profile_path)
      comImg.img_profile = `http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[0].filename}`
      comImg.img_profile_path = req.files[0].path
      await comImg.save()
      }
      updateprofimg()
    }
    if(req.files[1]){
      const updateprofbg = async() =>{
        await unlink(compteCli.Clientimg.img_background_path)
        comImg.img_background = `http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[1].filename}`
        comImg.img_background_path = req.files[1].path
        await comImg.save()
      }
      console.log("2")
      updateprofbg()
    }
    
   
   await compteCli.save()
   .then(async(cli)=>{
 
    const client = await db.CompteClient.findOne({ where : {id : cli.id } , include:[{model :  db.Equipe },{model : db.Service},{model : db.Clientimg}] })
    res.status(200).json({
      message :' compte client updated',
      client
    })
   
   })
  
  })


  //update profile img only

  Router.put('/update/clients/prof/:id',upload.array('clientimg[]'), async (req,res)=>{

    const {Nom_compteCli} = req.body
    const {ServiceId} = req.body
    const {EquipeId} = req.body
    const {description} = req.body

const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id } , include:[{model :  db.Equipe },{model : db.Service}, {model : db.Clientimg}] })
if(!compteCli) res.status(201).json({
  message : 'compte client not found'
})
 const comImg =   await  db.Clientimg.findOne({ where : {CompteClientId : compteCli.id }})

compteCli.Nom_compteCli = Nom_compteCli
compteCli.description = description
if(ServiceId !== ""){
  compteCli.ServiceId = ServiceId 
}
if(EquipeId !== ""){
  compteCli.EquipeId  = EquipeId
}

if(req.files[0]){
  console.log("1")

  const updateprofimg = async() =>{
    await unlink(compteCli.Clientimg.img_profile_path)
  comImg.img_profile = `http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[0].filename}`
  comImg.img_profile_path = req.files[0].path
  await comImg.save()
  }
  updateprofimg()
}

await compteCli.save()
.then(async(cli)=>{

const client = await db.CompteClient.findOne({ where : {id : cli.id } , include:[{model :  db.Equipe },{model : db.Service},{model : db.Clientimg}] })
res.status(200).json({
  message :' compte client updated',
  client
})

})


  })


   //update bg img only
Router.put('/update/clients/bg/:id',upload.array('clientimg[]'), async (req,res)=>{

    const {Nom_compteCli} = req.body
    const {ServiceId} = req.body
    const {EquipeId} = req.body
    const {description} = req.body


const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id } , include:[{model :  db.Equipe },{model : db.Service}, {model : db.Clientimg}] })
if(!compteCli) res.status(201).json({
  message : 'compte client not found'
})
 const comImg =   await  db.Clientimg.findOne({ where : {CompteClientId : compteCli.id }})


compteCli.Nom_compteCli = Nom_compteCli
compteCli.description = description
if(ServiceId !== ""){
  compteCli.ServiceId = ServiceId 
}
if(EquipeId !== ""){
  compteCli.EquipeId  = EquipeId
}



if(req.files[0]){
  console.log("1")

  const updateprofimg = async() =>{
    await unlink(compteCli.Clientimg.img_background_path)
    comImg.img_background = `http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[0].filename}`
    comImg.img_background_path = req.files[0].path
    await comImg.save()
  }
  updateprofimg()
}

await compteCli.save()
.then(async(cli)=>{

const client = await db.CompteClient.findOne({ where : {id : cli.id } , include:[{model :  db.Equipe },{model : db.Service},{model : db.Clientimg}] })
res.status(200).json({
  message :' compte client updated',
  client
})

})


  })


//delete compte client
Router.delete('/:id', async (req,res)=>{
  const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id}})
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