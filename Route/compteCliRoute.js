const express = require('express')
const Router = express.Router()
const db = require("../models");
const upload =  require('./../store/clientprofile') 
const authentification = require('./../midellware/authentification')
const { promisify } = require('util')
const fs = require("fs")
const unlink = promisify(fs.unlink)
const {AdminNotif} = require('./../Socket/socket')


Router.use(authentification)
//get all compte client
Router.get('/', async(req,res)=>{
 const compteCli = await db.CompteClient.findAll({include:[{model : db.Requete},{model :  db.Equipe},{model : db.Service}, {model : db.Clientimg}, {model : db.Theme}]})
 
 var cli = compteCli.sort(function(a, b){
     return b.Requetes.length - a.Requetes.length
    })
 
 res.send(cli)


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


//get all requetes of one client
Router.get('/requete/:id',async (req,res)=>{

  const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id } , include:[{model : db.Requete , include:[{model : db.Modirequete},{model : db.User}]}] })
  if (!compteCli) res.status(201).json({
    message : "compte client not found"
  }) 

  res.status(200).json({
    compteCli
  })
})

//get all Historique of one client
Router.get('/Historique/:id',async (req,res)=>{

  const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id } , include:[{model : db.Historique , include:[{model : db.User},{model : db.Requete , include:[{model : db.Modirequete}]}]}] })
  if (!compteCli) res.status(201).json({
    message : "compte client not found"
  }) 

  res.status(200).json({
    Historique : compteCli.Historiques.reverse()
  })
})

//get all requetes of one collab
Router.get('/requete/collab/:id',async (req,res)=>{

  const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id } , include:[{model : db.Requete , where : { UserId : req.userData.userId} , include:[{model : db.User}]}] })
  if (!compteCli) res.status(201).json({
    message : "compte client not found"
  }) 

  res.status(200).json({
    compteCli
  })
})

  //update comptecli requete
  Router.put('/requete/:id', async (req,res)=>{

  

    await db.Requete.findOne({ where : {id : req.params.id } , include:[{model : db.Modirequete},{model : db.User},{model : db.CompteClient , include : [{model : db.Service}]}] }).then(async (requete)=>{
      if(!requete) res.status(201).json({
        message : 'requete not found'
      })

      if(requete.Modirequete){

        await db.Modirequete.findOne({where : {RequeteId : requete.id}}).then((modif)=>{

          modif.Proprietaire_de_la_requete = requete.Proprietaire_de_la_requete,
          modif.Statut =  requete.Statut,
          modif.Origine_de_la_requete =  requete.Origine_de_la_requete,
          modif.Heure_douverture =  requete.Heure_douverture,
          modif.Heure_de_fermeture =  requete.Heure_de_fermeture,
          modif.Objet =  requete.Objet,
          modif.Numero_de_la_requete =  requete.Numero_de_la_requete,
          modif.Motifs_de_resiliation =  requete.Motifs_de_resiliation,
          modif.date_ouverture =  requete.date_ouverture,
          modif.date_de_fermeture =  requete.date_de_fermeture,
          modif.Famille_de_demande_RC =  requete.Famille_de_demande_RC,
          modif.Type_de_la_demande_RC =  requete.Type_de_la_demande_RC,
          modif.Raison_sociale_du_compte =  requete.Raison_sociale_du_compte,
          modif.Anciennete =  requete.Anciennete
        })

      }else{
        await db.Modirequete.create({
                Proprietaire_de_la_requete: requete.Proprietaire_de_la_requete,
                Statut:  requete.Statut,
                Origine_de_la_requete:  requete.Origine_de_la_requete,
                Heure_douverture:  requete.Heure_douverture,
                Heure_de_fermeture:  requete.Heure_de_fermeture,
                Objet:  requete.Objet,
                Numero_de_la_requete:  requete.Numero_de_la_requete,
                Motifs_de_resiliation:  requete.Motifs_de_resiliation,
                date_ouverture:  requete.date_ouverture,
                date_de_fermeture:  requete.date_de_fermeture,
                Famille_de_demande_RC:  requete.Famille_de_demande_RC,
                Type_de_la_demande_RC:  requete.Type_de_la_demande_RC,
                Raison_sociale_du_compte:  requete.Raison_sociale_du_compte,
                Anciennete:  requete.Anciennete,
                CompteClientId: 5,
                FileId: 1,
                UserId: 6,
                RequeteId : requete.id
        })
      }
      requete.Statut = req.body.Statut
      requete.Origine_de_la_requete = req.body.Origine_de_la_requete
      requete.Motifs_de_resiliation = req.body.Motifs_de_resiliation
      requete.Heure_de_fermeture = req.body.Heure_de_fermeture
      requete.Famille_de_demande_RC = req.body.Famille_de_demande_RC

      await requete.save().then( async (updatedreq)=>{
       const His = {
        CompteClientId :updatedreq.CompteClientId, 
        UserId : req.userData.userId,
        RequeteId	: updatedreq.id,
       }
       await db.Historique.create(His)
       AdminNotif(updatedreq , updatedreq.CompteClient.Service.Roomid)
        res.status(200).json({
          requete :updatedreq
        })
       
      })
    
      
    })
    
    })

    Router.post('/add/requete' , async (req,res)=>{


      await db.Requete.create(req.body).then( async (reqe)=>{
        await db.Requete.findOne({ where : {id : reqe.id } , include:[{model : db.Modirequete},{model : db.User}] }).then((result)=>{
          res.status(200).json({
            req : result
          })
        })
        
      })
      
    })


//update comptecli archive
Router.put('/archive/:id', async (req,res)=>{

  

  await db.CompteClient.findOne({ where : {id : req.params.id}}).then(async (cl)=>{
    if(!cl) res.status(201).json({
      message : 'client not found'
    })
  
   
    cl.Archive = 1
    await cl.save().then( async (newcl)=>{
     
      await db.CompteClient.findOne({ where : {id : newcl.id } , include:[{model : db.Requete}, {model : db.Clientimg}, {model : db.Theme}] }).then((cli)=>{
        res.status(200).json({
          cli
        })
      })

      
    })
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

    if(EquipeId !== `${compteCli.EquipeId}` ){
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
      // console.log("1")

      const updateprofimg = async() =>{

        if(compteCli.Clientimg.img_profile_path !== null){
          await unlink(compteCli.Clientimg.img_profile_path)
        }
      comImg.img_profile = `http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[0].filename}`
      comImg.img_profile_path = req.files[0].path
      await comImg.save()
      }
      updateprofimg()
    }
    if(req.files[1]){
      const updateprofbg = async() =>{

        if(compteCli.Clientimg.img_background_path !== null){
          await unlink(compteCli.Clientimg.img_background_path)
        }
        
        comImg.img_background = `http://${req.hostname}:${process.env.PORT || 3001}/clientimg/${req.files[1].filename}`
        comImg.img_background_path = req.files[1].path
        await comImg.save()
      }
      // console.log("2")
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
if(EquipeId !== `${compteCli.EquipeId}`){
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
if(EquipeId !== `${compteCli.EquipeId}`){
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
if(EquipeId !== `${compteCli.EquipeId}`){
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

  // await unlink(compteCli.Clientimg.img_profile_path)
  // await unlink(compteCli.Clientimg.img_background_path)
 

  compteCli.destroy();
  res.status(200).json({
    message : "compte client deleted",
    compteCli
  })
})




module.exports = Router;