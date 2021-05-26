module.exports = (sequelize, DataTypes) => {
    const Plan  = sequelize.define("Plan", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
    Text:{
        allowNull: false,
        type: DataTypes.STRING
        },
    })

    Plan.associate = function(models) { 
        Plan.belongsTo(models.User)
    };
   
    return Plan;
  };