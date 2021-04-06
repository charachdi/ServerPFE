module.exports = (sequelize, DataTypes) => {
    const Chefs  = sequelize.define("Chefs", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
    });

    Chefs.associate = function(models) { 
        Chefs.belongsTo(models.Service) 
        Chefs.belongsTo(models.User)   

};
    return Chefs;
  };