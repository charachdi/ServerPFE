module.exports = (sequelize, DataTypes) => {
    const Presance  = sequelize.define("Presance", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
    Present:{
        allowNull: false,
        type: DataTypes.BOOLEAN
        },
    Absent:{
        allowNull: false,
        type: DataTypes.BOOLEAN
        },
    Conge:{
        allowNull: false,
        type: DataTypes.BOOLEAN
        },
    Retard:{
        allowNull: false,
        type: DataTypes.BOOLEAN
        },
    date:{
        allowNull: false,
        type: DataTypes.STRING
        },
    Comment:{
        allowNull: false,
        type: DataTypes.STRING
        },


        
    });

    Presance.associate = function(models) { 
        Presance.belongsTo(models.User) 
    };
   
    return Presance;
  };