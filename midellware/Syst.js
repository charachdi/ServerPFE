const db = require("../models");


function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }


  
const SysClient = async  (eqid)=>{

    await db.CompteClient.findAll({ where : {EquipeId : eqid} ,  include :[{model : db.Requete}]}).then(async(compte)=>{
   

        compte.forEach(async(compte) => {
          var Clientname = []
        var Requete = compte.Requetes
    
        
        compte.Requetes.forEach(req => {
            const Client = {
                Name : req.Raison_sociale_du_compte,
                RequeteCount : 0 , 
                percent : 0
            }
            var result = Requete.filter(req => Client.Name === req.Raison_sociale_du_compte);
            Client.RequeteCount = result.length
    
            var clientresult = Clientname.filter(cli => cli.Name === req.Raison_sociale_du_compte)
            if(clientresult.length === 0){
                Clientname.push(Client)
            }
        });
      var FinaleResult =   Clientname.sort((a, b) =>  b.RequeteCount - a.RequeteCount)
    
      var HundredPercent = Requete.length
    
        for (let index = 0; index < FinaleResult.length; index++){
          FinaleResult[index].percent = ((FinaleResult[index].RequeteCount / HundredPercent)*100).toFixed(0)
        }
        
        for (let index = 0; index < FinaleResult.length; index++){
          if(FinaleResult[index].Name !== compte.Nom_compteCli){
              if(FinaleResult[index].RequeteCount >= 50){
                   // Create new compte client
                   const NewCompteCli = {
                    Nom_compteCli : FinaleResult[index].Name,
                    ServiceId :compte.ServiceId ,
                    EquipeId :compte.EquipeId 
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
                    
    
                           // auth and permission
                    const equipe = await db.Equipe.findOne({ where: {id : compte.EquipeId} , include:[{model :  db.User}] });
    
    
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
          }
    
        }
        });
        
    })
}



module.exports = {
    SysClient
}