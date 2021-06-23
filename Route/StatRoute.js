const express = require('express')
const Router = express.Router()
const db = require("../models");
const Op = require('sequelize').Op
const check = require('./../midellware/Checkdate')


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
var Trim = date.filter(onlyUnique);
var Trim_date = Trim.slice().sort((a, b) =>  new Date(a) - new Date(b))
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


//equipe origin bar
Router.get('/equipe/origin/bar/:id', async(req,res)=>{
  var userId=[]

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  var origin = []
  var Origine_value = []
  await db.User.findAll({where:{EquipeId:req.params.id}}).then(async(eq)=>{
    eq.forEach(user => {
      userId.push(user.id)
    });
  await db.Requete.findAll({where:{UserId:userId}}).then(async(reqet)=>{
   
    reqet.forEach(ele => {

      origin.push(ele.Origine_de_la_requete)
    });
    origin = origin.filter(onlyUnique);

    origin.forEach(ori => {
      const result = reqet.filter(req => req.Origine_de_la_requete === ori);
      Origine_value.push(result.length)
      
    });
    res.status(200).json({
      origin,
      Origine_value
    })
  })
  })
 })
//stat equipe origin 
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
// compte cli data 
 Router.get('/comptcli/origin/bar/:id', async(req,res)=>{
  

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  var origin = []
  var Origine_value = []
  
  await db.Requete.findAll({where:{CompteClientId:req.params.id}}).then(async(reqet)=>{
   
    reqet.forEach(ele => {

      origin.push(ele.Origine_de_la_requete)
    });
    origin = origin.filter(onlyUnique);

    origin.forEach(ori => {
      const result = reqet.filter(req => req.Origine_de_la_requete === ori);
      Origine_value.push(result.length)
      
    });
    res.status(200).json({
      origin,
      Origine_value
    })
  })
  })



  ////////////////////////////////////////equipe filter/////////////////////////////

//statget  equipe pie
Router.post('/stat/pie/date/:id', async(req,res)=>{

    const {startdate} = req.body
    const {enddate} = req.body
    
    const equipe = await db.Equipe.findOne({ where: {id : req.params.id} , include:[{model : db.CompteClient , include :[{model : db.Clientimg}, {model : db.Theme},{model : db.Requete}] }] });
    if (!equipe) res.status(201).json({
      message : "equipe not found"
    }) 
    const cli = equipe.CompteClients
    
    var cliname = []
    var clilength = []
    cli.sort(function(a, b){return b.Requetes.length - a.Requetes.length}).slice(0, 5).forEach(element => {
      cliname.push(element.Nom_compteCli)
      // clilength.push(element.Requetes.length)
      var reqcount = 0
      element.Requetes.forEach(req => {

      var  reqdate = req.Heure_douverture.split(" ")[0]
      if(check(startdate , enddate , reqdate)){
        reqcount++
      }
      });
      clilength.push(reqcount)
    });
    res.json({
      cliname,
      clilength
    })
   
   })
   //equipe origin bar
Router.post('/equipe/origin/bar/date/:id', async(req,res)=>{
  var userId=[]
  const {startdate} = req.body
  const {enddate} = req.body


  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  
  var filtredreq = []
  var origin = []
  var Origine_value = []
  await db.User.findAll({where:{EquipeId:req.params.id}}).then(async(eq)=>{
    eq.forEach(user => {
      userId.push(user.id)
    });
  await db.Requete.findAll({where:{UserId:userId}}).then(async(reqet)=>{
   
    reqet.forEach(ele => {
      if(check(startdate , enddate , ele.Heure_douverture.split(" ")[0])){
        origin.push(ele.Origine_de_la_requete)
        filtredreq.push(ele)
      }
     
    });
    origin = origin.filter(onlyUnique);

    origin.forEach(ori => {
      const result = filtredreq.filter(req => req.Origine_de_la_requete === ori);
      Origine_value.push(result.length)
      
    });
    res.status(200).json({
      origin,
      Origine_value
    })
  })
  })
 })

  //line
Router.post('/line/date/:id', async(req,res)=>{
    var userid =[]
    const {startdate} = req.body
    const {enddate} = req.body
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

      if(check(startdate , enddate ,req.Heure_douverture.split(" ")[0])){
        date.push(req.Heure_douverture.split(" ")[0])
        requetes.push(req)
      }
       });
       
   });
var Trim = date.filter(onlyUnique)
var Trim_date = Trim.slice().sort((a, b) =>  new Date(a) - new Date(b))
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

//barchats
Router.post('/bar/date/:id', async(req,res)=>{
  var userid =[]
  const {startdate} = req.body
  const {enddate} = req.body

  const equipe = await db.Equipe.findOne({ where: {id : req.params.id} , include:[{model :  db.User , attributes: ['id']}]}).then(async(eq)=>{
    eq.Users.forEach(user => {
      userid.push(user.id)
    });
  const Users = await db.User.findAll({where: {id : userid} , include : [{model : db.Requete}]})
 

  var users = []
  var requetes =[]

  Users.forEach(user => {
      var reqcount = 0
      user.Requetes.forEach(req => {
          if(check(startdate , enddate , req.Heure_douverture.split(" ")[0])){
            reqcount++
          }
        });
      users.push(user.full_name)
      requetes.push(reqcount)
  });

  res.status(200).json({
      users,
      requetes
  })
  })

 })   

 //get equipe requetes by date
Router.post('/requets/date/:id',async (req,res)=>{

  var userid =[]
  const {startdate} = req.body
  const {enddate} = req.body

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
        if(check(startdate , enddate , element.Heure_douverture.split(" ")[0])){
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


  ////////////////////////////////////////Compte client  filter/////////////////////////////

Router.post('/comptcli/pie/date/:id', async(req,res)=>{


    var userid = []
    var username = []
    var user_value = []
    var reque = []
    const {startdate} = req.body
    const {enddate} = req.body
    
    const compteClient = await db.CompteClient.findOne({ where: {id : req.params.id} , include:[{model : db.Requete},{model:db.Equipe , include : [{model : db.User}]}] });
    if (!compteClient) res.status(201).json({
      message : "equipe not found"
    }) 

    compteClient.Equipe.Users.forEach(user => {
      userid.push(user.id)
      username.push(user.full_name)
    });

    
    compteClient.Requetes.forEach(req => {
      if(check(startdate , enddate , req.Heure_douverture.split(" ")[0])){
        reque.push(req)
      }
    });
    userid.forEach(id => {
      const result = reque.filter(req => req.UserId === id);
      user_value.push(result.length)
    });
    res.status(200).json({
      userid,
      user_value,
      username
    })

    
   })

 //Compte cli line
Router.post('/comptcli/Line/date/:id', async(req,res)=>{
  var userid =[]
  var users = []

  const {startdate} = req.body
  const {enddate} = req.body

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
  if(check(startdate , enddate , req.Heure_douverture.split(" ")[0])){
    date.push(req.Heure_douverture.split(" ")[0])
    requetes.push(req)
  }
  
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

// compte cli data 
Router.post('/comptcli/origin/bar/date/:id', async(req,res)=>{
  
  const {startdate} = req.body
  const {enddate} = req.body

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  var origin = []
  var Origine_value = []
  var reque = []
  await db.Requete.findAll({where:{CompteClientId:req.params.id}}).then(async(reqet)=>{
   
    reqet.forEach(ele => {
      if(check(startdate , enddate , ele.Heure_douverture.split(" ")[0])){
        origin.push(ele.Origine_de_la_requete)
        reque.push(ele)
      }
     
    });
    origin = origin.filter(onlyUnique);

    origin.forEach(ori => {
      const result = reque.filter(req => req.Origine_de_la_requete === ori);
      Origine_value.push(result.length)
      
    });
    res.status(200).json({
      origin,
      Origine_value
    })
  })
  })

  //bar
Router.post('/comptcli/bar/date/:id', async(req,res)=>{

  const {startdate} = req.body
  const {enddate} = req.body

  function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
await db.CompteClient.findOne({ where: {id : req.params.id} , include:[{model : db.Equipe },{model : db.Requete}]}).then(async(cl)=>{

 
 var date  = []
 var requetes =[]
 var date_value = []

 cl.Requetes.forEach(req => {
  if(check(startdate , enddate , req.Heure_douverture.split(" ")[0])){
    date.push(req.Heure_douverture.split(" ")[0])
    requetes.push(req)  
  } 
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

Router.post('/comptcli/header/date/:id', async(req,res)=>{

  var col = 0
  var encours = 0
  var neww =  0

  const {startdate} = req.body
  const {enddate} = req.body

  const compteClient = await db.CompteClient.findOne({ where: {id : req.params.id} , include:[{model : db.Requete}] });
  if (!compteClient) res.status(201).json({
    message : "equipe not found"
  }) 

  compteClient.Requetes.forEach(req => {
    if(check(startdate , enddate , req.Heure_douverture.split(" ")[0])){
      if(req.Statut === "Nouveau"){
        neww++
      }else if (req.Statut === "Clôturé"){
        col++
      }else{
        encours++
      }
    }
    });

  res.status(200).json({
    col,
    neww,
    encours
  })

  
 })
module.exports = Router;