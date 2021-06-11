const server =  require('./../Server')
const db = require("../models");
const Op = require('sequelize').Op



const AdminNotif = (req , Roomid) =>{
  server.socket.broadcast.emit(`${Roomid}`, {userimg : req.User.user_img, full_name :req.User.full_name , reqid :req.Numero_de_la_requete , text:"Modifier Requtete N°" });
}


  const importfiles = async ( data , body ) =>{
   
  //   const body ={
  //     Roomid : Newfile.Roomid,
  //     ServiceId : ServiceId ,
  //     EquipeId : equipeid ,
  //     Fileid : file.id
  // }

     
      var rowvalue = (1/ data.length)*100
      var upload = 0
      var num_to_check = 10
     
      for (i = 0; i < data.length; i++) {
      
        upload = upload + rowvalue  


       

        if(i === data.length - 1){
          server.io.emit(`${body.Roomid}uploadended`, {id : body.Fileid});
          const file = await db.Files.findOne({ where: {id : body.Fileid} });
          file.complete = true
          await file.save()
        }
       
       
        if(data[i].Name){
          await db.User.findOne({ where: { full_name: data[i].Name }}).then(async (user)=>{
            if(user){

              const newrequete = {
                          Proprietaire_de_la_requete : data[i].Name,
                          Statut : data[i].status,
                          Origine_de_la_requete : data[i].origin,
                          Heure_douverture: data[i].Houverture,
                          heure_de_derniere_modification_de_la_requete : data[i].modification,
                          Heure_de_fermeture : data[i].Hfermeture,
                          Objet: data[i].objet,
                          Numero_de_la_requete: data[i].numero,
                          Type_de_la_demande: data[i].type,
                          Famille_de_demande: data[i].famille,
                          Motifs_de_resiliation: data[i].Motifs,
                          Sous_motif_de_resiliation: data[i].sousmotif,
                          Autre_motif_de_resiliation: data[i].autremotif,
                          date_ouverture: data[i].ouverture,
                          date_de_fermeture: data[i].fermeture,
                          Famille_de_demande_RC: data[i].familleRC,
                          Type_de_la_demande_RC: data[i].typeRC,
                          Raison_sociale_du_compte: data[i].Raison,
                          Anciennete : data[i].Anicennete,
                          CompteClientId: 0,
                          UserId: user.id,
                          FileId : body.Fileid,
                          Check : 1
                        }
                        // RequeteCkeck
                        const Reqcheck = {
                          Compteclinamecheck : 0,
                          Statuscheck : 0,
                          Originecheck : 0,
                          RequeteId	: 0
                        }

              if(data[i].Raison === ""){
                newrequete.Check = 0
                Reqcheck.Compteclinamecheck = 1
              }
              if(data[i].status === ""){
                newrequete.Check = 0
                Reqcheck.Statuscheck = 1
              }
              if(data[i].origin === ""){
                newrequete.Check = 0
                Reqcheck.Originecheck = 1
              }


              if(data[i].Raison !== ""){
                await db.CompteClient.findOne({ where : { Nom_compteCli : { [ Op.like]: `%${data[i].Raison.split(" ")[0]}%`  } , EquipeId : body.EquipeId } }).then(async (cli)=>{
                  if(cli){
                        newrequete.CompteClientId = cli.id
                        await db.Requete.create(newrequete).then(async(req)=>{
                          // Reqcheck.RequeteId = req.id
                          // await db.RequeteCkeck.create(Reqcheck)
                          if(upload.toFixed(0) === `${num_to_check}` ){
                            server.io.emit(`${body.Roomid}`, {value : upload.toFixed(0) , Rid : body.Roomid});
                            num_to_check = num_to_check + 10
                          }
                        })

                      }else{

                                      // Create new compte client
                      const NewCompteCli = {
                        Nom_compteCli : data[i].Raison,
                        ServiceId :body.ServiceId ,
                        EquipeId :body.EquipeId 
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

                      newrequete.CompteClientId = savedcompte.id
                      await db.Requete.create(newrequete).then(async(req)=>{
                        // Reqcheck.RequeteId = req.id
                        // await db.RequeteCkeck.create(Reqcheck)
                        if(upload.toFixed(0) === `${num_to_check}` ){
                          server.io.emit(`${body.Roomid}`, {value : upload.toFixed(0) , Rid : body.Roomid});
                          num_to_check = num_to_check + 10
                        }
                      })

                             // auth and permission
                      const equipe = await db.Equipe.findOne({ where: {id : body.EquipeId} , include:[{model :  db.User}] });
  
  
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
                      num_to_check = num_to_check + 10
                      } catch (error) {
                      console.log(error)
                      }

                      }

                    })
              }else if(newrequete.Check === 0){
                newrequete.CompteClientId	= null
                await db.Requete.create(newrequete).then(async (req)=>{
                  // Reqcheck.RequeteId = req.id
                  // await db.RequeteCkeck.create(Reqcheck)
                  if(upload.toFixed(0) === `${num_to_check}` ){
                    server.io.emit(`${body.Roomid}`, {value : upload.toFixed(0) , Rid : body.Roomid});
                    num_to_check = num_to_check + 10
                  }
                })
              }
                
               
                    
                
                   
                    
            
              
            }
          })
        }
        
            
     
      }
      

  

  
  

     
      
  }


  


module.exports ={
    importfiles,
    AdminNotif
  }