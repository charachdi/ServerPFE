module.exports = (sequelize, DataTypes) => {
    const RequeteCkeck  = sequelize.define("RequeteCkeck", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
    Compteclinamecheck:{
        allowNull: false,
        type: DataTypes.BOOLEAN
        },
    Statuscheck:{
        allowNull: false,
        type: DataTypes.BOOLEAN
        },
    Originecheck:{
        allowNull: false,
        type: DataTypes.BOOLEAN
        },
    });
   
    RequeteCkeck.associate = function(models) { 
        RequeteCkeck.belongsTo(models.Requete) 
    };
   
    return RequeteCkeck;
  };