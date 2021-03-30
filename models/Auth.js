module.exports = (sequelize, DataTypes) => {
    const Auth  = sequelize.define("Auth", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
    });

    Auth.associate = function(models) { 
            Auth.hasOne(models.Permission , { onDelete: 'cascade'})
            Auth.belongsTo(models.User)
            
    };
   
    return Auth;
  };