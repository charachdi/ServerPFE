module.exports = (sequelize, DataTypes) => {
    const SPrime  = sequelize.define("SPrime", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
    date:{
        allowNull: false,
        type: DataTypes.DATE
    },
    Bonus :{
        allowNull: false,
        type: DataTypes.FLOAT
    },
    Prime :{
        allowNull: false,
        type: DataTypes.FLOAT
    },
    Comment :{
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

    SPrime.associate = function(models) { 
            SPrime.belongsTo(models.User)
    };
   
    return SPrime;
  };