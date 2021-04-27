module.exports = (sequelize, DataTypes) => {
    const Archive  = sequelize.define("Archive", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
    Prog:{
        allowNull: false,
        defaultValue: 80,
        type: DataTypes.INTEGER
        },
    requete:{
        allowNull: false,
        defaultValue: 100 ,
        type: DataTypes.INTEGER
        },
    });

    Archive.associate = function(models) { 
            Archive.belongsTo(models.Equipe) 
    };
   
    return Archive;
  };