const express = require('express')
const Router = express.Router()
const db = require("../models");
const Op = require('sequelize').Op



//get equipe requetes
Router.get('/requets/:id',async (req,res)=>{

    var userid =[]
    const equipe = await db.Equipe.findOne({ where: {id : req.params.id} , include:[{model :  db.User , attributes: ['id']}]}).then(async(eq)=>{
      eq.Users.forEach(user => {
        userid.push(user.id)
      });
      const requete = await db.Requete.findAll({where: {UserId: userid }}).then(async(req)=>{
      
        var colture = 0
        var cours = 0
        var retour_client = 0
        var attente_interne = 0
        var Nouveau = 0
  
        req.forEach(element => {
          if(element.Statut === "Clôturé"){
            colture++
          }else if(element.Statut === "En cours"){
            cours++
          }
          else if(element.Statut === "En attente retour client"){
            retour_client++
          }
          else if(element.Statut === "En attente interne"){
            attente_interne++
          }
          else if(element.Statut === "Nouveau"){
            Nouveau++
          }
   
        });
        res.json({
          // data : req,
          colture,
          cours,
          retour_client,
          attente_interne,
          Nouveau,
        
        })
      })
     
    })
   
   
  })
  
  //statget
  Router.get('/stat/pie/:id', async(req,res)=>{
    const equipe = await db.Equipe.findOne({ where: {id : req.params.id} , include:[{model : db.CompteClient , include :[{model : db.Clientimg}, {model : db.Theme},{model : db.Requete}] }] });
    if (!equipe) res.status(201).json({
      message : "equipe not found"
    }) 
    const cli = equipe.CompteClients
    
    var cliname = []
    var clilength = []
    cli.sort(function(a, b){return b.Requetes.length - a.Requetes.length}).slice(0, 5).forEach(element => {
      cliname.push(element.Nom_compteCli)
      clilength.push(element.Requetes.length)
    });
    res.json({
      cliname,
      clilength
    })
   
   })

//barchats
   Router.get('/bar/:id', async(req,res)=>{
    var userid =[]
    const equipe = await db.Equipe.findOne({ where: {id : req.params.id} , include:[{model :  db.User , attributes: ['id']}]}).then(async(eq)=>{
      eq.Users.forEach(user => {
        userid.push(user.id)
      });
    const Users = await db.User.findAll({where: {id : userid} , include : [{model : db.Requete}]})
   

    var users = []
    var requetes =[]

    Users.forEach(user => {
        users.push(user.full_name)
        requetes.push(user.Requetes.length)
    });

    res.status(200).json({
        users,
        requetes
    })
    })
  
   })


   //line
   Router.get('/line/:id', async(req,res)=>{
    var userid =[]
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }
    const equipe = await db.Equipe.findOne({ where: {id : req.params.id} , include:[{model :  db.User , attributes: ['id']}]}).then(async(eq)=>{
      eq.Users.forEach(user => {
        userid.push(user.id)
      });
    const Users = await db.User.findAll({where: {id : userid} , include : [{model : db.Requete}]})
   var date  = []
   var requetes =[]
   var date_value = []

   Users.forEach(user => {
    user.Requetes.forEach(req => {
           date.push(req.Heure_douverture.split(" ")[0])
           requetes.push(req)
       });
       
   });
var Trim_date = date.filter(onlyUnique);
Trim_date.forEach(newdate => {
    const result = requetes.filter(req => req.Heure_douverture.split(" ")[0] === newdate);
    date_value.push(result.length)
});
   


      res.status(200).json({
        Trim_date,
        date_value
        
      })
    })
  
   })



   //stat comptcli get
  Router.get('/comptcli/pie/:id', async(req,res)=>{


    var userid = []
    var username = []
    var user_value = []

    const compteClient = await db.CompteClient.findOne({ where: {id : req.params.id} , include:[{model : db.Requete},{model:db.Equipe , include : [{model : db.User}]}] });
    if (!compteClient) res.status(201).json({
      message : "equipe not found"
    }) 

    compteClient.Equipe.Users.forEach(user => {
      userid.push(user.id)
      username.push(user.full_name)
    });


    userid.forEach(id => {
      const result = compteClient.Requetes.filter(req => req.UserId === id);
      user_value.push(result.length)
    });
    res.status(200).json({
      userid,
      user_value,
      username
    })

    
   })




    //stat comptcli get header
  Router.get('/comptcli/header/:id', async(req,res)=>{

    var col = 0
    var encours = 0
    var neww =  0
    const compteClient = await db.CompteClient.findOne({ where: {id : req.params.id} , include:[{model : db.Requete}] });
    if (!compteClient) res.status(201).json({
      message : "equipe not found"
    }) 

    compteClient.Requetes.forEach(req => {
          if(req.Statut === "Nouveau"){
            neww++
          }else if (req.Statut === "Clôturé"){
            col++
          }else{
            encours++
          }
      });

    res.status(200).json({
      col,
      neww,
      encours
    })

    
   })



//bar
Router.get('/comptcli/bar/:id', async(req,res)=>{
    
      function onlyUnique(value, index, self) {
          return self.indexOf(value) === index;
        }
await db.CompteClient.findOne({ where: {id : req.params.id} , include:[{model : db.Equipe },{model : db.Requete}]}).then(async(cl)=>{
 
     
     var date  = []
     var requetes =[]
     var date_value = []
  
     cl.Requetes.forEach(req => {
      date.push(req.Heure_douverture.split(" ")[0])
      requetes.push(req)   
     });


  var Trim_date = date.filter(onlyUnique);
  Trim_date.forEach(newdate => {
      const result = requetes.filter(req => req.Heure_douverture.split(" ")[0] === newdate);
      date_value.push(result.length)
  });
     
  
  
        res.status(200).json({
          Trim_date,
          date_value
          
          
        })
      })
    
     })
  //  

  //Compte cli line
Router.get('/comptcli/Line/:id', async(req,res)=>{
  var userid =[]
  var users = []


  function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }


  function random_rgba() {
      var o = Math.round, r = Math.random, s = 255;
      return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
  }

 const backgroundColor= [
    'rgb(255, 99, 132)',
    'rgb(54, 162, 235)',
    'rgb(255, 205, 86)',
    'rgb(218, 92, 250)',
    'rgb(43, 200, 145)',
    'rgb(244, 56, 56)',
    'rgb(224, 211, 69)',
    'rgb(71, 211, 200)',
    'rgb(234, 143, 46)',
    'rgb(242, 0, 149)',

  ]
  
await db.CompteClient.findOne({ where: {id : req.params.id} , include:[{model : db.Requete},{model : db.Equipe , include : {model :  db.User}}]}).then(async(cl)=>{
cl.Equipe.Users.forEach(user => {
      userid.push(user.id)
    });
  const Users = await db.User.findAll({where: {id : userid} })
 var date  = []
 var requetes =[]
 var date_value = []

 Users.forEach((user,index) => {
  var newuser = {
    id : user.id,
    label: user.full_name,
    fill: false,
    borderColor: backgroundColor[index],
    data: [],
    spanGaps: false
  }
  users.push(newuser)
  
     
 });

 cl.Requetes.forEach(req => {
  date.push(req.Heure_douverture.split(" ")[0])
  requetes.push(req)
});

var Trim_date = date.filter(onlyUnique);


Trim_date.forEach(newdate => {
  
  users.forEach(user => {
    const result = requetes.filter(req => req.Heure_douverture.split(" ")[0] === newdate && req.UserId === user.id);
    user.data.push(result.length)
  });
 
});
 
    res.status(200).json({
      users
    })
  })

 })



   module.exports = Router;