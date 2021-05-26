var mysql = require('mysql');
const db = require("../models");


module.exports = async (Client)=>{


    await db.Database.findOne({where :{ Active : 1}}).then((database)=>{

        var con = mysql.createConnection({
            host: database.Host,
            user: database.Username,
            password: database.Password,
            database: database.Database
          });
          
          con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
            // var sql = "CREATE TABLE `compteclients` (`id` int(11) NOT NULL,`Nom_compteCli` varchar(255) DEFAULT NULL,`description` varchar(255) DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
            // var Requete = "CREATE TABLE `requetes` (`id` int(11) NOT NULL,`Proprietaire_de_la_requete` varchar(255) DEFAULT NULL,`Statut` varchar(255) DEFAULT NULL,`Origine_de_la_requete` varchar(255) DEFAULT NULL,`Heure_douverture` varchar(255) DEFAULT NULL,`heure_de_derniere_modification_de_la_requete` datetime DEFAULT NULL,`Heure_de_fermeture` datetime DEFAULT NULL,`Objet` varchar(255) DEFAULT NULL,`Numero_de_la_requete` int(11) DEFAULT NULL,`Type_de_la_demande` varchar(255) DEFAULT NULL,`Famille_de_demande` varchar(255) DEFAULT NULL,`Motifs_de_resiliation` varchar(255) DEFAULT NULL,`Autre_motif_de_resiliation` varchar(255) DEFAULT NULL,`date_ouverture` datetime DEFAULT NULL,`date_de_fermeture` datetime DEFAULT NULL,`Famille_de_demande_RC` varchar(255) DEFAULT NULL,`Type_de_la_demande_RC` varchar(255) DEFAULT NULL,`Raison_sociale_du_compte` varchar(255) DEFAULT NULL,`Anciennete` varchar(255) DEFAULT NULL,`CompteClientId` int(11) DEFAULT NULL,) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
            // con.query(sql, function (err, result) {
            //   if (err) throw err;
            //   console.log("Table Client created");
            // });
            // con.query(Requete, function (err, result) {
            //   if (err) throw err;
            //   console.log("Table Requete created");
            // });

            // var Clientinsert = `INSERT INTO compteclients ( Nom_compteCli, description) VALUES( ${Client.Nom_compteCli}, ${Client.description}),`;
            // con.query(Clientinsert, function (err, result) {
            //   if (err) throw err;
            //   console.log("line inserted");
            // });


            // Client.Requete.forEach(req => {
            // var requeteinsert = `INSERT INTO requetes (id, Proprietaire_de_la_requete, Statut, Origine_de_la_requete, Heure_douverture, heure_de_derniere_modification_de_la_requete, Heure_de_fermeture, Objet, Numero_de_la_requete, Type_de_la_demande, Famille_de_demande, Motifs_de_resiliation, Sous_motif_de_resiliation, Autre_motif_de_resiliation, date_ouverture, date_de_fermeture, Famille_de_demande_RC, Type_de_la_demande_RC, Raison_sociale_du_compte, Anciennete,CompteClientId) VALUES
            //   (${req.id}, ${req.Proprietaire_de_la_requete}, ${req.Statut}, ${req.Origine_de_la_requete}, ${req.Heure_douverture}, ${req.heure_de_derniere_modification_de_la_requete}, ${req.Heure_de_fermeture}, ${req.Objet}, ${req.Numero_de_la_requete}, ${req.Type_de_la_demande},  ${req.Famille_de_demande}, ${req.Motifs_de_resiliation}, ${req.Sous_motif_de_resiliation}, ${req.date_ouverture}, ${req.date_de_fermeture}, ${req.Famille_de_demande_RC}, ${req.Type_de_la_demande_RC}, ${req.Raison_sociale_du_compte}, ${req.Anciennete}, ${req.CompteClientId}),`
            //   con.query(requeteinsert, function (err, result) {
            //     if (err) throw err;
            //     console.log("line inserted");
            //   });
            // });
          });
    })
    
}