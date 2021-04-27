const server =  require('./../Server')
const db = require("../models");
const Op = require('sequelize').Op



  const connection = () =>{
    server.io.on("connection", (socket) => {
        console.log("hamdoula")
    })
  
  }


  const importfiles = async ( data , body ) =>{
   
  //   const body ={
  //     Roomid : Newfile.Roomid,
  //     ServiceId : ServiceId ,
  //     EquipeId : equipeid ,
  //     Fileid : file.id
  // }

  // {
  //   Name: 'Amira KHEZAMI',
  //   status: 'Nouveau',
  //   origin: 'Adresse e-mail',
  //   Houverture: '16/07/2020 08:18',
  //   modification: '16/07/2020 08:22',
  //   objet: 'PRELEVEMENTS REJETES JUSQU AU 05/06/20',
  //   numero: '00312483',
  //   type: '',
  //   famille: '',
  //   Motifs: '',
  //   sousmotif: '',
  //   autremotif: '',
  //   ouverture: '16/07/2020',
  //   familleRC: '',
  //   typeRC: '',
  //   Raison: '',
  //   Anicennete: 7
  // },

  // Règle de trois x = a * b /c

    //  data.length -> 100%
    //    1          -> (1/ data.length)
      // console.log(data.length)
     
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
              if(data[i].Raison !== ""){
                await db.CompteClient.findOne({ where : { Nom_compteCli : { [ Op.like]: `%${data[i].Raison.split(" ")[0]}%`  } , EquipeId : body.EquipeId } }).then(async (cli)=>{
                  if(cli){
                    // await db.Requete.findOne({ where : { Numero_de_la_requete   :  data[i].numero} }).then(async(req)=>{
                    //   if(!req){
                    //     const newrequete = {
                    //       Proprietaire_de_la_requete : data[i].Name,
                    //       Statut : data[i].status,
                    //       Origine_de_la_requete : data[i].origin,
                    //       Heure_douverture: data[i].Houverture,
                    //       heure_de_derniere_modification_de_la_requete : data[i].modification,
                    //       Heure_de_fermeture : data[i].Hfermeture,
                    //       Objet: data[i].objet,
                    //       Numero_de_la_requete: data[i].numero,
                    //       Type_de_la_demande: data[i].type,
                    //       Famille_de_demande: data[i].famille,
                    //       Motifs_de_resiliation: data[i].Motifs,
                    //       Sous_motif_de_resiliation: data[i].sousmotif,
                    //       Autre_motif_de_resiliation: data[i].autremotif,
                    //       date_ouverture: data[i].ouverture,
                    //       date_de_fermeture: data[i].fermeture,
                    //       Famille_de_demande_RC: data[i].familleRC,
                    //       Type_de_la_demande_RC: data[i].typeRC,
                    //       Raison_sociale_du_compte: data[i].Raison,
                    //       Anciennete : data[i].Anicennete,
                    //       CompteClientId: cli.id,
                    //       UserId: user.id,
                    //       FileId : body.Fileid
                    //     }
                    //     await db.Requete.create(newrequete).then(()=>{
                    //       if(upload.toFixed(0) === `${num_to_check}` ){
                    //         server.io.emit(`${body.Roomid}`, {value : upload.toFixed(0) , Rid : body.Roomid});
                    //         num_to_check = num_to_check + 10
                    //       }
                    //     })
                    //   }
                    // })

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
                          CompteClientId: cli.id,
                          UserId: user.id,
                          FileId : body.Fileid
                        }
                        await db.Requete.create(newrequete).then(()=>{
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
  
  
                      //  // saving the new compte client  
                      try {
  
                      const savedcompte =  await  db.CompteClient.create(NewCompteCli)
                      Newclientimg.CompteClientId = savedcompte.id
                      newtheme.CompteClientId = savedcompte.id

                      // await db.Requete.findOne({ where : { Numero_de_la_requete   :  data[i].numero} }).then(async(req)=>{
                      //   if(!req){
                      //     const newrequete = {
                      //       Proprietaire_de_la_requete : data[i].Name,
                      //       Statut : data[i].status,
                      //       Origine_de_la_requete : data[i].origin,
                      //       Heure_douverture: data[i].Houverture,
                      //       heure_de_derniere_modification_de_la_requete : data[i].modification,
                      //       Heure_de_fermeture : data[i].Hfermeture,
                      //       Objet: data[i].objet,
                      //       Numero_de_la_requete: data[i].numero,
                      //       Type_de_la_demande: data[i].type,
                      //       Famille_de_demande: data[i].famille,
                      //       Motifs_de_resiliation: data[i].Motifs,
                      //       Sous_motif_de_resiliation: data[i].sousmotif,
                      //       Autre_motif_de_resiliation: data[i].autremotif,
                      //       date_ouverture: data[i].ouverture,
                      //       date_de_fermeture: data[i].fermeture,
                      //       Famille_de_demande_RC: data[i].familleRC,
                      //       Type_de_la_demande_RC: data[i].typeRC,
                      //       Raison_sociale_du_compte: data[i].Raison,
                      //       Anciennete : data[i].Anicennete,
                      //       CompteClientId: savedcompte.id,
                      //       UserId: user.id,
                      //       FileId : body.Fileid
                      //     }
      
    
    
                      //     await db.Requete.create(newrequete).then(()=>{
                      //       if(upload.toFixed(0) === `${num_to_check}` ){
                      //         server.io.emit(`${body.Roomid}`, {value : upload.toFixed(0) , Rid : body.Roomid});
                      //         num_to_check = num_to_check + 10
                      //       }
                      //     })
      
                      //   }
                      // })

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
                            CompteClientId: savedcompte.id,
                            UserId: user.id,
                            FileId : body.Fileid
                          }
      
    
    
                          await db.Requete.create(newrequete).then(()=>{
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
                .catch((err)=>{
                  console.log(err)
                })
                
              }
            }
          })
        }
        
            
     
      }
      

  

  
  

     
      
  }



module.exports ={
    connection,
    importfiles
  }