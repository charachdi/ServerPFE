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
     Prime: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        allowNull: true
      },
      bonus: {
        type: DataTypes.FLOAT,
        defaultValue: 120,
        allowNull: true
      },
      requete: {
        type: DataTypes.INTEGER,
        defaultValue: 20,
        allowNull: true
      },
    });

    Equipe.associate = function(models) { 
        Equipe.hasMany(models.User , {foreignKey: {
          allowNull: true
        }})
        Equipe.hasMany(models.CompteClient)
        Equipe.hasMany(models.Prime)
        Equipe.hasMany(models.Files)
        Equipe.hasOne(models.Archive)
        Equipe.belongsTo(models.Service)
    };
   
    return Equipe;
  };