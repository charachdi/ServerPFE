const express = require('express')
const Router = express.Router()
const db = require("../models");
const upload =  require('./../store/clientprofile') 
const authentification = require('./../midellware/authentification')
const { promisify } = require('util')
const fs = require("fs")
const unlink = promisify(fs.unlink)


// Router.use(authentification)
//get all compte client
Router.get('/', async(req,res)=>{
 const compteCli = await db.CompteClient.findAll({include:[{model :  db.Equipe},{model : db.Service}, {model : db.Clientimg}, {model : db.Theme}]})
 res.send(compteCli)


})


//get one compte client by id
Router.get('/:id',async (req,res)=>{

  const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id } , include:[{model :  db.Equipe , include : [{model : db.User}] },{model : db.Service}, {model : db.Clientimg}, {model : db.Theme},{model : db.Auth  , include :[{model : db.Permission},{model : db.User}]}] })
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
        const {color} = req.body
       
       
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

         const newtheme = {
           Color : color,
           CompteClientId : ""
         }
         
       
      //  // saving the new compte client  
       try {

  const savedcompte =  await  db.CompteClient.create(NewCompteCli)
  Newclientimg.CompteClientId = savedcompte.id
  newtheme.CompteClientId = savedcompte.id


  // auth and permission
 const equipe = await db.Equipe.findOne({ where: {id : EquipeId} , include:[{model :  db.User}] });


 equipe.Users.forEach(async(user) => {
  const newAuth = {
    UserId :user.id ,
    CompteClientId : savedcompte.id
  }
  const savedauth = await db.Auth.create(newAuth)
  
   const newpermission = {
    AuthId : savedauth.id
   }
   await db.Permission.create(newpermission)
 });


  await db.Theme.create(newtheme)
  await  db.Clientimg.create(Newclientimg)
  .then(async()=>{
       const client = await db.CompteClient.findOne({ where: {id : savedcompte.id} , include:[{model :  db.Equipe},{model : db.Service}, {model : db.Clientimg}, {model : db.Theme}]});
         res.status(200).json({
          message : "compte client added",
          client,
        })
  })
       } catch (error) {
       console.log(error)
       }
 
  
    
})



// add compte client
Router.post('/Empty',async (req,res)=>{
 


  const {Nom_compteCli} = req.body
  const {ServiceId} = req.body
  const {EquipeId} = req.body
  const {description} = req.body
  const {color} = req.body
 
 
// Create new compte client
const NewCompteCli = {
  Nom_compteCli : Nom_compteCli,
  ServiceId :ServiceId ,
  EquipeId :EquipeId ,
  description : description
   }

   const Newclientimg = {
    CompteClientId : ""
   }

   const newtheme = {
     Color : color,
     CompteClientId : ""
   }
   
 
//  // saving the new compte client  
 try {

const savedcompte =  await  db.CompteClient.create(NewCompteCli)
Newclientimg.CompteClientId = savedcompte.id
newtheme.CompteClientId = savedcompte.id


// auth and permission
const equipe = await db.Equipe.findOne({ where: {id : EquipeId} , include:[{model :  db.User}] });


equipe.Users.forEach(async(user) => {
const newAuth = {
UserId :user.id ,
CompteClientId : savedcompte.id
}
const savedauth = await db.Auth.create(newAuth)

const newpermission = {
AuthId : savedauth.id
}
await db.Permission.create(newpermission)
});


await db.Theme.create(newtheme)
await  db.Clientimg.create(Newclientimg)
.then(async()=>{
 const client = await db.CompteClient.findOne({ where: {id : savedcompte.id} , include:[{model :  db.Equipe},{model : db.Service}, {model : db.Clientimg}, {model : db.Theme}]});
   res.status(200).json({
    message : "compte client added",
    client,
  })
})
 } catch (error) {
 console.log(error)
 }



})


// add compte client
Router.post('/img', upload.array('clientimg[]'),async (req,res)=>{
 


  const {Nom_compteCli} = req.body
  const {ServiceId} = req.body
  const {EquipeId} = req.body
  const {description} = req.body
  const {color} = req.body
 
 
// Create new compte client
const NewCompteCli = {
  Nom_compteCli : Nom_compteCli,
  ServiceId :ServiceId ,
  EquipeId :EquipeId ,
  description : description
   }

   const Newclientimg = {
    img_profile:`http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[0].filename}`,
    img_profile_path : req.files[0].path,
    CompteClientId : ""
   }

   const newtheme = {
     Color : color,
     CompteClientId : ""
   }
   
 
//  // saving the new compte client  
 try {

const savedcompte =  await  db.CompteClient.create(NewCompteCli)
Newclientimg.CompteClientId = savedcompte.id
newtheme.CompteClientId = savedcompte.id


// auth and permission
const equipe = await db.Equipe.findOne({ where: {id : EquipeId} , include:[{model :  db.User}] });


equipe.Users.forEach(async(user) => {
const newAuth = {
UserId :user.id ,
CompteClientId : savedcompte.id
}
const savedauth = await db.Auth.create(newAuth)

const newpermission = {
AuthId : savedauth.id
}
await db.Permission.create(newpermission)
});


await db.Theme.create(newtheme)
await  db.Clientimg.create(Newclientimg)
.then(async()=>{
 const client = await db.CompteClient.findOne({ where: {id : savedcompte.id} , include:[{model :  db.Equipe},{model : db.Service}, {model : db.Clientimg}, {model : db.Theme}]});
   res.status(200).json({
    message : "compte client added",
    client,
  })
})
 } catch (error) {
 console.log(error)
 }



})


// add compte client
Router.post('/bg', upload.array('clientimg[]'),async (req,res)=>{
 


  const {Nom_compteCli} = req.body
  const {ServiceId} = req.body
  const {EquipeId} = req.body
  const {description} = req.body
  const {color} = req.body
 
 
// Create new compte client
const NewCompteCli = {
  Nom_compteCli : Nom_compteCli,
  ServiceId :ServiceId ,
  EquipeId :EquipeId ,
  description : description
   }

   const Newclientimg = {
    img_background:`http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[0].filename}`,
    img_background_path :req.files[0].path,
    CompteClientId : ""
   }


   const newtheme = {
     Color : color,
     CompteClientId : ""
   }
   
 
//  // saving the new compte client  
 try {

const savedcompte =  await  db.CompteClient.create(NewCompteCli)
Newclientimg.CompteClientId = savedcompte.id
newtheme.CompteClientId = savedcompte.id


// auth and permission
const equipe = await db.Equipe.findOne({ where: {id : EquipeId} , include:[{model :  db.User}] });


equipe.Users.forEach(async(user) => {
const newAuth = {
UserId :user.id ,
CompteClientId : savedcompte.id
}
const savedauth = await db.Auth.create(newAuth)

const newpermission = {
AuthId : savedauth.id
}
await db.Permission.create(newpermission)
});


await db.Theme.create(newtheme)
await  db.Clientimg.create(Newclientimg)
.then(async()=>{
 const client = await db.CompteClient.findOne({ where: {id : savedcompte.id} , include:[{model :  db.Equipe},{model : db.Service}, {model : db.Clientimg}, {model : db.Theme}]});
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
        const {color} = req.body

    const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id } , include:[{model :  db.Equipe },{model : db.Service}, {model : db.Clientimg}, {model : db.Theme}] })
    const auth = await db.Auth.findAll({ where : {CompteClientId : compteCli.id }})
    const equipe = await db.Equipe.findOne({ where: {id : EquipeId} , include:[{model :  db.User}] });
   
    if(!compteCli) res.status(201).json({
      message : 'compte client not found'
    })
   
    const comImg =   await  db.Clientimg.findOne({ where : {CompteClientId : compteCli.id }})
     const theme =   await  db.Theme.findOne({ where : {CompteClientId : compteCli.id }})
     theme.Color = color

     await theme.save()
    compteCli.Nom_compteCli = Nom_compteCli
    compteCli.description = description
    if(ServiceId !== ""){
      compteCli.ServiceId = ServiceId 
    }
    if(EquipeId !== compteCli.EquipeId ){
      compteCli.EquipeId  = EquipeId
      auth.forEach(A => {
        A.destroy()
      });
      equipe.Users.forEach(async(user) => {
        const newAuth = {
          UserId :user.id ,
          CompteClientId : savedcompte.id
        }
        const savedauth = await db.Auth.create(newAuth)
        
         const newpermission = {
          AuthId : savedauth.id
         }
         await db.Permission.create(newpermission)
       });
     

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
 
    const client = await db.CompteClient.findOne({ where : {id : cli.id } , include:[{model :  db.Equipe },{model : db.Service},{model : db.Clientimg}, {model : db.Theme}] })
    res.status(200).json({
      message :' compte client updated',
      client
    })
   
   })
  
  })



  //update compte client
Router.put('/update/clients/false/:id',async (req,res)=>{

  console.log(req.userData)
  const {Nom_compteCli} = req.body
  const {ServiceId} = req.body
  const {EquipeId} = req.body
  const {description} = req.body
  const {color} = req.body
  
  const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id } , include:[{model :  db.Equipe },{model : db.Service}, {model : db.Clientimg}, {model : db.Theme}] })
  const auth = await db.Auth.findAll({ where : {CompteClientId : compteCli.id }})
  const equipe = await db.Equipe.findOne({ where: {id : EquipeId} , include:[{model :  db.User}] });
if(!compteCli) res.status(201).json({
message : 'compte client not found'
})
const theme =   await  db.Theme.findOne({ where : {CompteClientId : compteCli.id }})
theme.Color = color

await theme.save()
compteCli.Nom_compteCli = Nom_compteCli
compteCli.description = description
if(ServiceId !== ""){
compteCli.ServiceId = ServiceId 
}
if(EquipeId !== compteCli.EquipeId){
compteCli.EquipeId  = EquipeId
auth.forEach(A => {
  A.destroy()
});
equipe.Users.forEach(async(user) => {
  const newAuth = {
    UserId :user.id ,
    CompteClientId : compteCli.id
  }
  const savedauth = await db.Auth.create(newAuth)
  
   const newpermission = {
    AuthId : savedauth.id
   }
   await db.Permission.create(newpermission)
 });
}



await compteCli.save()
.then(async(cli)=>{

const client = await db.CompteClient.findOne({ where : {id : cli.id } , include:[{model :  db.Equipe },{model : db.Service},{model : db.Clientimg}, {model : db.Theme}] })
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
    const {color} = req.body

    const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id } , include:[{model :  db.Equipe },{model : db.Service}, {model : db.Clientimg}, {model : db.Theme}] })
    const auth = await db.Auth.findAll({ where : {CompteClientId : compteCli.id }})
    const equipe = await db.Equipe.findOne({ where: {id : EquipeId} , include:[{model :  db.User}] });
if(!compteCli) res.status(201).json({
  message : 'compte client not found'
})
 const comImg =   await  db.Clientimg.findOne({ where : {CompteClientId : compteCli.id }})
 const theme =   await  db.Theme.findOne({ where : {CompteClientId : compteCli.id }})
 theme.Color = color

 await theme.save()
compteCli.Nom_compteCli = Nom_compteCli
compteCli.description = description
if(ServiceId !== ""){
  compteCli.ServiceId = ServiceId 
}
if(EquipeId !== compteCli.EquipeId){
  compteCli.EquipeId  = EquipeId
  auth.forEach(A => {
    A.destroy()
  });
  equipe.Users.forEach(async(user) => {
    const newAuth = {
      UserId :user.id ,
      CompteClientId : compteCli.id
    }
    const savedauth = await db.Auth.create(newAuth)
    
     const newpermission = {
      AuthId : savedauth.id
     }
     await db.Permission.create(newpermission)
   });
}

if(req.files[0]){
  console.log("1")

  const updateprofimg = async() =>{
    await unlink(compteCli.Clientimg.img_profile_path)
  comImg.img_profile = `http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[0].filename}`
  comImg.img_profile_path = req.files[0].path
  await comImg.save()
  }

  const updateprofimgnull = async() =>{
  comImg.img_profile = `http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[0].filename}`
  comImg.img_profile_path = req.files[0].path
  await comImg.save()
  }

  if(compteCli.Clientimg.img_profile_path !== null){
    updateprofimg()
  }
  else {
    updateprofimgnull()
  }
 
}

await compteCli.save()
.then(async(cli)=>{

const client = await db.CompteClient.findOne({ where : {id : cli.id } , include:[{model :  db.Equipe },{model : db.Service},{model : db.Clientimg}, {model : db.Theme}] })
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
    const {color} = req.body

    const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id } , include:[{model :  db.Equipe },{model : db.Service}, {model : db.Clientimg}, {model : db.Theme}] })
    const auth = await db.Auth.findAll({ where : {CompteClientId : compteCli.id }})
    const equipe = await db.Equipe.findOne({ where: {id : EquipeId} , include:[{model :  db.User}] });

if(!compteCli) res.status(201).json({
  message : 'compte client not found'
})
 const comImg =   await  db.Clientimg.findOne({ where : {CompteClientId : compteCli.id }})
 const theme =   await  db.Theme.findOne({ where : {CompteClientId : compteCli.id }})
 theme.Color = color

 await theme.save()

compteCli.Nom_compteCli = Nom_compteCli
compteCli.description = description
if(ServiceId !== ""){
  compteCli.ServiceId = ServiceId 
}
if(EquipeId !== compteCli.EquipeId){
  compteCli.EquipeId  = EquipeId
  auth.forEach(A => {
    A.destroy()
  });
  equipe.Users.forEach(async(user) => {
    const newAuth = {
      UserId :user.id ,
      CompteClientId : compteCli.id
    }
    const savedauth = await db.Auth.create(newAuth)
    
     const newpermission = {
      AuthId : savedauth.id
     }
     await db.Permission.create(newpermission)
   });
}



if(req.files[0]){
  console.log("1")

  const updateprofimg = async() =>{
    await unlink(compteCli.Clientimg.img_background_path)
    comImg.img_background = `http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[0].filename}`
    comImg.img_background_path = req.files[0].path
    await comImg.save()
  }

  const updateprofimgnull = async() =>{
    comImg.img_background = `http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[0].filename}`
    comImg.img_background_path = req.files[0].path
    await comImg.save()
  }


  if(compteCli.Clientimg.img_background_path !== null){
    updateprofimg()
  }
  else {
    updateprofimgnull()
  }
 
 
}

await compteCli.save()
.then(async(cli)=>{

const client = await db.CompteClient.findOne({ where : {id : cli.id } , include:[{model :  db.Equipe },{model : db.Service},{model : db.Clientimg}, {model : db.Theme}] })
res.status(200).json({
  message :' compte client updated',
  client
})

})


  })


//delete compte client
Router.delete('/:id', async (req,res)=>{
  const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id} ,  include:[{model :  db.Clientimg }]})
  if(!compteCli) res.status(201).json({
    message : 'compte client not found'
  })

  await unlink(compteCli.Clientimg.img_profile_path)
  await unlink(compteCli.Clientimg.img_background_path)
 

  compteCli.destroy();
  res.status(200).json({
    message : "compte client deleted",
    compteCli
  })
})




module.exports = Router;