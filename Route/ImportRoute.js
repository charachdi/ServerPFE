const Router = require("express").Router();
const db = require("../models");
const upload = require('./../store/csv')
const { v4: uuidv4 } = require('uuid');
const { promisify } = require('util')
const fs = require("fs")
const unlink = promisify(fs.unlink)
const excelToJson = require('convert-excel-to-json');
const { importfiles }= require('./../Socket/socket')
const server =  require('./../Server')
const path = require('path');
const csv = require('fast-csv');
const authentification = require('./../midellware/authentification')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const check = require('./../midellware/Checkdate')

Router.use(authentification)
Router.post("/csv", upload.single("csv"), async (req,res)=>{

    const { equipeid } = req.body
    const {ServiceId} = req.body


    const equipe = await db.Equipe.findOne({ where: {id : equipeid} });
   
    const url = `http://${req.hostname}:${process.env.PORT || 3001}/csv/${req.file.filename}`
    const path = req.file.path

    //array[req,req,req]

    
    const Cleanfile = excelToJson({
        sourceFile: path,
        
        header:{
            // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
            rows: 14 // 2, 3, 4, etc.
        },
        columnToKey: {
            B : 'Name',
            D : 'status',
            E : 'origin',
            F : 'Houverture',
            G : 'modification',
            H : 'Hfermeture',
            I : 'objet',
            J : 'numero',
            K : 'type',
            L:  'famille',
            M : 'Motifs',
            N : 'sousmotif',
            O : 'autremotif',
            P : 'ouverture',
            Q : 'fermeture',
            R : 'familleRC',
            S : 'typeRC',
            T : 'Raison',
            U : 'Anicennete',
        }
    });

   
   

    const Newfile = {
            Nom_file: req.file.originalname,
            url_file: url,
            path_file:path,
            EquipeId : equipeid,
            complete : false,
            UserId: req.userData.userId,
            Roomid : uuidv4()
        }
console.log(req.userData.userId)

        db.Files.create(Newfile).then( async (file)=>{
            res.status(200).json({
                message : "file saved",
            })
        const savedfile = await db.Files.findOne({ where: {id : file.id} , include: [{ model: db.User }] });
        server.io.emit(`${equipe.Roomid}`, {file: savedfile});

      
            
            const body ={
                Roomid : file.Roomid,
                ServiceId : ServiceId ,
                EquipeId : equipeid ,
                Fileid : savedfile.id ,
            }

            importfiles(Object.values(Cleanfile)[0],  body)
       
    
        })

    
      


})

// get one file by id

Router.get("/file/:id", async (req,res)=>{
    const file = await db.Files.findOne({ where: {id : req.params.id} , include : [{model : db.Requete , include:[{model : db.User}]}] });
    if(file){
        res.status(200).json({
            file
        })
    }else{
        res.status(201).json({
            message : "file not found"
        })
    }
})

//update complete
Router.put("/file/complete/:id", async (req,res)=>{
    const file = await db.Files.findOne({ where: {id : req.params.id} });
    file.complete = 1
    await file.save()

    res.status(200).json({
        message : "file complete"
    })
})

Router.get('/export/excel/:id', async(req , res)=>{

    await db.CompteClient.findOne({ where : {id : req.params.id} , include : [{model : db.Requete}]}).then(async(result)=>{
        
   
   var head = []
   var record = []

   var Pr = {
    id: 'Proprietaire_de_la_requête',
    title: 'Proprietaire de la requête',
   }
   var stat = {
    id: 'Statut',
    title: 'Statut',
   }
   var ori = {
    id: 'Origine_de_la_requête',
    title: 'Origine de la requête'
   }
   var Ob = {
    id: 'Objet',
    title: 'Objet'
   }
   var Ra = {
    id: 'Raison_sociale_du_compte',
    title: 'Raison sociale du compte',
   }

   head.push(Pr)
   head.push(stat)
   head.push(ori)
   head.push(Ob)
   head.push(Ra)

   result.Requetes.forEach(req => {
        var rec = {
            Proprietaire_de_la_requête : req.Proprietaire_de_la_requete,  
            Statut : req.Statut ,
            Origine_de_la_requête : req.Origine_de_la_requete, 
            Objet : req.Objet , 
            Raison_sociale_du_compte : req.Raison_sociale_du_compte ,
        }
       record.push(rec)
   });
   
var  clientname = result.Nom_compteCli.replace(" ","_")
fs.writeFile(`./uploads/Export/${clientname}.csv`,'','utf8', function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });

  const csvWriter = createCsvWriter({
    path: `./uploads/Export/${clientname}.csv`,
    header: head
});
await csvWriter.writeRecords(record)  
        .then(() => {
            console.log('...Done');
        }).catch((er)=>{
            console.log(er)
        })
        res.status(200).json({
            link : `http://localhost:3001/Export/${clientname}.csv`,
            clientname : clientname
        })
    })


})
Router.post('/export/excel/date/:id', async(req , res)=>{

    const {startdate} = req.body
    const {enddate} = req.body 

    await db.CompteClient.findOne({ where : {id : req.params.id} , include : [{model : db.Requete}]}).then(async(result)=>{
        
   
   var head = []
   var record = []

   var Pr = {
    id: 'Proprietaire_de_la_requête',
    title: 'Proprietaire de la requête',
   }
   var stat = {
    id: 'Statut',
    title: 'Statut',
   }
   var ori = {
    id: 'Origine_de_la_requête',
    title: 'Origine de la requête'
   }
   var Ob = {
    id: 'Objet',
    title: 'Objet'
   }
   var Ra = {
    id: 'Raison_sociale_du_compte',
    title: 'Raison sociale du compte',
   }

   head.push(Pr)
   head.push(stat)
   head.push(ori)
   head.push(Ob)
   head.push(Ra)

   result.Requetes.forEach(req => {

    if(check(startdate , enddate ,req.Heure_douverture.split(" ")[0])){
        var rec = {
            Proprietaire_de_la_requête : req.Proprietaire_de_la_requete,  
            Statut : req.Statut ,
            Origine_de_la_requête : req.Origine_de_la_requete, 
            Objet : req.Objet , 
            Raison_sociale_du_compte : req.Raison_sociale_du_compte ,
        }
        record.push(rec)
    }
   });
   
var  clientname = result.Nom_compteCli.replace(" ","_")
fs.writeFile(`./uploads/Export/${clientname}.csv`,'','utf8', function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });

  const csvWriter = createCsvWriter({
    path: `./uploads/Export/${clientname}.csv`,
    header: head
});
await csvWriter.writeRecords(record)  
        .then(() => {
            console.log('...Done');
        }).catch((er)=>{
            console.log(er)
        })
        res.status(200).json({
            link : `http://localhost:3001/Export/${clientname}.csv`,
            clientname : clientname
        })
    })


})

module.exports = Router;