module.exports = (sequelize, DataTypes) => {
    const Theme  = sequelize.define("Theme", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
      Color: {
        type: DataTypes.STRING,
        allowNull: true
      },
    });

   
    return Theme;
  };