module.exports = (sequelize, DataTypes) => {
    const Equipe  = sequelize.define("Equipe", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
      Nom_equipe: {
        type: DataTypes.STRING,
        allowNull: true
      },
      Roomid: {
        type: DataTypes.STRING,
        allowNull: true
      },
    });

    Equipe.associate = function(models) { 
        Equipe.hasMany(models.User , {foreignKey: {
          allowNull: true
        }})
        Equipe.hasMany(models.CompteClient)
        Equipe.hasMany(models.Files)
        Equipe.belongsTo(models.Service)
    };
   
    return Equipe;
  };