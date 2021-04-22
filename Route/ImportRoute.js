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
const authentification = require('./../midellware/authentification')



Router.use(authentification)
Router.post("/csv", upload.single("csv"), async (req,res)=>{

    const { equipeid } = req.body
    const {ServiceId} = req.body


    const equipe = await db.Equipe.findOne({ where: {id : equipeid} });
   
    const url = `http://${req.hostname}:${process.env.PORT || 3001}/csv/${req.file.filename}`
    const path = req.file.path

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

// Router.get("/comptetest/", async (req,res)=>{
   
//     await db.CompteClient.findOne({ where : { Nom_compteCli :  } }).then(async (cli)=>{
//         res.send(cli)
//     })
// })

// get one file by id

// Router.get("/compte/request/:id", async (req,res)=>{
//     const Compte = await db.CompteClient.findAll({ where: {id : req.params.id} , include : [{model : db.Requete}] });
//     res.send(Compte)
// })




//update complete
Router.put("/file/complete/:id", async (req,res)=>{
    const file = await db.Files.findOne({ where: {id : req.params.id} });
    file.complete = 1
    await file.save()

    res.status(200).json({
        message : "file complete"
    })
})

module.exports = Router;