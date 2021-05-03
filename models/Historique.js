module.exports = (sequelize, DataTypes) => {
    const Historique  = sequelize.define("Historique", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
    Text:{
        allowNull: false,
        defaultValue: "Modifier",
        type: DataTypes.STRING
        },
    // Type:{
    //     allowNull: false,
    //     type: DataTypes.STRING
    //     },
    });

    Historique.associate = function(models) { 
        Historique.belongsTo(models.CompteClient) 
        Historique.belongsTo(models.User)
        Historique.belongsTo(models.Requete) 
    };
   
    return Historique;
  };