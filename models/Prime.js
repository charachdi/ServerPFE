module.exports = (sequelize, DataTypes) => {
    const Prime  = sequelize.define("Prime", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
    M:{
        allowNull: false,
        type: DataTypes.STRING
    },
    Y:{
        allowNull: false,
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

    Prime.associate = function(models) { 
            Prime.belongsTo(models.Equipe) 
            Prime.hasMany(models.SPrime)
    };
   
    return Prime;
  };