module.exports = (sequelize, DataTypes) => {
    const After  = sequelize.define("After", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
        Proprietaire_de_la_requete	: {
        type: DataTypes.STRING,
        allowNull: true
      },
        Statut: {
        type: DataTypes.STRING,
        allowNull: true
      },
      Origine_de_la_requete: {
        type: DataTypes.STRING,
        allowNull: true
      },
      Heure_douverture	: {
        type: DataTypes.STRING,
        allowNull: true
      },
      heure_de_derniere_modification_de_la_requete: {
        type: DataTypes.DATE                        ,
        allowNull: true
      },
      Heure_de_fermeture: {
        type: DataTypes.DATE                        ,
        allowNull: true
      },
      Objet: {
        type: DataTypes.STRING,
        allowNull: true
      },
      Numero_de_la_requete: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      Type_de_la_demande: {
        type: DataTypes.STRING,
        allowNull: true
      },
      Famille_de_demande: {
        type: DataTypes.STRING,
        allowNull: true
      },
      Motifs_de_resiliation	: {
        type: DataTypes.STRING,
        allowNull: true
      },
      Sous_motif_de_resiliation	: {
        type: DataTypes.STRING,
        allowNull: true
      },
      Autre_motif_de_resiliation	: {
        type: DataTypes.STRING,
        allowNull: true
      },
      date_ouverture: {
        type: DataTypes.DATE                        ,
        allowNull: true
      },
      date_de_fermeture	: {
        type: DataTypes.DATE                        ,
        allowNull: true
      },
      Famille_de_demande_RC	: {
        type: DataTypes.STRING,
        allowNull: true
      },
      Type_de_la_demande_RC	: {
        type: DataTypes.STRING,
        allowNull: true
      },
      Raison_sociale_du_compte	: {
        type: DataTypes.STRING,
        allowNull: true
      },
      Anciennete: {
        type: DataTypes.STRING,
        allowNull: true
      },


      
    });

   
    After.associate = function(models) { 
        After.belongsTo(models.Files)
        After.belongsTo(models.User)
        After.belongsTo(models.CompteClient)
        After.belongsTo(models.Requete)
        After.belongsTo(models.Historique)
  };
   
    return After;
  };