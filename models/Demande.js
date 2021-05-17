module.exports = (sequelize, DataTypes) => {
    const Demande  = sequelize.define("Demande", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
    Type:{
        allowNull: false,
        type: DataTypes.STRING
        },
    Startdate:{
        allowNull: true,
        type: DataTypes.STRING
        },
    enddate:{
        allowNull: true,
        type: DataTypes.STRING
        },
     Approved:{
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        },
    waiting:{
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        },
    });

    Demande.associate = function(models) { 
        Demande.belongsTo(models.User)
    };
   
    return Demande;
  };