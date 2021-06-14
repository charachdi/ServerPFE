const express = require('express')
const Router = express.Router()
const db = require("../models");
const upload =  require('./../store/clientprofile') 
const authentification = require('./../midellware/authentification')
const { promisify } = require('util')
const fs = require("fs")
const unlink = promisify(fs.unlink)
const {AdminNotif} = require('./../Socket/socket')
const Op = require('sequelize').Op
const Ar = require('./../midellware/Archivage')


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

  const compteCli = await db.CompteClient.findOne({ where : {id : req.params.id } , include:[{model : db.Historique , include:[{model : db.User},{model : db.Requete },{model : db.Before},{model : db.After}]}] })
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
      const his = {
        CompteClientId :requete.CompteClientId,
        UserId : req.userData.userId,
        RequeteId :requete.id,
      }
      await db.Historique.create(his).then(async(savedhis)=>{
        const Before = {
          Proprietaire_de_la_requete : requete.Proprietaire_de_la_requete,
          Statut :  requete.Statut,
          Origine_de_la_requete :  requete.Origine_de_la_requete,
          Heure_douverture :  requete.Heure_douverture,
          Heure_de_fermeture :  requete.Heure_de_fermeture,
          Objet :  requete.Objet,
          Numero_de_la_requete :  requete.Numero_de_la_requete,
          Motifs_de_resiliation :  requete.Motifs_de_resiliation,
          date_ouverture :  requete.date_ouverture,
          date_de_fermeture :  requete.date_de_fermeture,
          Famille_de_demande_RC :  requete.Famille_de_demande_RC,
          Type_de_la_demande_RC :  requete.Type_de_la_demande_RC,
          Raison_sociale_du_compte :  requete.Raison_sociale_du_compte,
          Anciennete :  requete.Anciennete,
          RequeteId : requete.id,
          CompteClientId : requete.CompteClientId,
          HistoriqueId : savedhis.id
           }
 
           const after = {
             Proprietaire_de_la_requete : requete.Proprietaire_de_la_requete,
             Statut :  req.body.Statut,
             Origine_de_la_requete :  req.body.Origine_de_la_requete,
             Heure_douverture :  requete.Heure_douverture,
             Heure_de_fermeture :  req.body.Heure_de_fermeture,
             Objet :  requete.Objet,
             Numero_de_la_requete :  requete.Numero_de_la_requete,
             Motifs_de_resiliation :  req.body.Motifs_de_resiliation,
             date_ouverture :  requete.date_ouverture,
             date_de_fermeture :  requete.date_de_fermeture,
             Famille_de_demande_RC :  req.body.Famille_de_demande_RC,
             Type_de_la_demande_RC :  requete.Type_de_la_demande_RC,
             Raison_sociale_du_compte :  requete.Raison_sociale_du_compte,
             Anciennete :  requete.Anciennete,
             RequeteId : requete.id,
             CompteClientId : requete.CompteClientId,
             HistoriqueId : savedhis.id
           }

           await db.Before.create(Before)
           await db.After.create(after)
           requete.Statut = req.body.Statut
           requete.Motifs_de_resiliation = req.body.Motifs_de_resiliation
           requete.Heure_de_fermeture = req.body.Heure_de_fermeture
           requete.Famille_de_demande_RC = req.body.Famille_de_demande_RC
           requete.Origine_de_la_requete = req.body.Origine_de_la_requete
           await  requete.save().then((saved)=>{
            res.status(200).json({
              requete : saved
             })
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

        Ar(cli)
      })

      
    })
  })
  
  
  
  
  })


Router.put('/Requete/update/false',async(req,res)=>{

 const {Comptecli} = req.body
 const {Famille_de_demande_RC} = req.body
 const {Heure_de_fermeture} = req.body
 const {Motifs_de_resiliation} = req.body
 const {Origine_de_la_requete} = req.body
 const {Statut} = req.body
 const {comptecliid} = req.body
 const {Type_de_la_demande_RC} = req.body
 const {id} = req.body
  

 
    // "Statut": "En cours",
    // "Origine_de_la_requete": "Adresse e-mail",
    // "Motifs_de_resiliation": "azeae",
    // "Heure_de_fermeture": "2021-05-07T03:49",
    // "Famille_de_demande_RC": "azeaze",
    // "Comptecli": "aeazea"

    // await db.CompteClient.findOne({ where :{ id : }})
    const user = await db.User.findOne({ where: { id: req.userData.userId } , include : [{model : db.Equipe , include : [{model : db.Service}]}]})

    await db.Requete.findOne({ where : { id: id}}).then( async (reque)=>{
      if(!comptecliid && Comptecli !== ""){
        await db.CompteClient.findOne({ where : { Nom_compteCli : { [ Op.like]: `%${Comptecli.split(" ")[0]}%`  }} }).then(async (cli)=>{
          if(cli){

            reque.CompteClientId = cli.id
            reque.Statut = Statut
            reque.Famille_de_demande_RC = Famille_de_demande_RC
            reque.Heure_de_fermeture = Heure_de_fermeture
            reque.Motifs_de_resiliation = Motifs_de_resiliation
            reque.Origine_de_la_requete = Origine_de_la_requete
            reque.Raison_sociale_du_compte = cli.Nom_compteCli
            reque.Type_de_la_demande_RC = Type_de_la_demande_RC
            reque.Check = 1
            await reque.save().then( async ()=>{
              await db.Requete.findOne({ where : { id: id}}).then( async (updatedreq)=>{
                res.status(200).json({
                  updatedreq
                })
              })

            })
          }else{

            const NewCompteCli = {
              Nom_compteCli : Comptecli,
              ServiceId :user.Equipe.Service.id ,
              EquipeId :user.Equipe.id 
            }

              const Newclientimg = {
                CompteClientId : ""
              }

              const newtheme = {
                Color : "#000000",
                CompteClientId : ""
              }

              try {
              // saving the new compte client  
           
              
            const savedcompte =  await  db.CompteClient.create(NewCompteCli)
            Newclientimg.CompteClientId = savedcompte.id
            newtheme.CompteClientId = savedcompte.id


            reque.CompteClientId = savedcompte.id
            reque.Statut = Statut
            reque.Famille_de_demande_RC = Famille_de_demande_RC
            reque.Heure_de_fermeture = Heure_de_fermeture
            reque.Motifs_de_resiliation = Motifs_de_resiliation
            reque.Origine_de_la_requete = Origine_de_la_requete
            reque.Raison_sociale_du_compte = savedcompte.Nom_compteCli
            reque.Type_de_la_demande_RC = Type_de_la_demande_RC
            reque.Check = 1
            await reque.save().then( async ()=>{
              await db.Requete.findOne({ where : { id: id}}).then( async (updatedreq)=>{
                res.status(200).json({
                  updatedreq
                })
              })

            })

                   // auth and permission
            const equipe = await db.Equipe.findOne({ where: {id : user.Equipe.id} , include:[{model :  db.User}] });


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
            } catch (error) {
            console.log(error)
            }
          }
    
        })
    
    
      }else{
        res.status(201).json({
          message : "error"
        })
      }
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



Router.delete('/Requete/:id' , async (req , res)=>{

  await db.Requete.findOne({ where : {id : req.params.id}}).then((reqe =>{
    reqe.destroy().then(()=>{
      res.status(200).json({
      id :  reqe.id
      })
    })
    
  }))
})


module.exports = Router;