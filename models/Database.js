module.exports = (sequelize, DataTypes) => {
    const Database  = sequelize.define("Database", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
    Username:{
        allowNull: false,
        type: DataTypes.STRING
        },
    Password:{
        allowNull: false,
        type: DataTypes.STRING
        },
    Host:{
        allowNull: false,
        type: DataTypes.STRING
        },
    Database:{
        allowNull: false,
        type: DataTypes.STRING
        },
     Active:{
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN
        },
    });

    
   
    return Database;
  };