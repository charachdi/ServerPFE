module.exports = (sequelize, DataTypes) => {
    const CompteClient  = sequelize.define("CompteClient", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
      Nom_compteCli: {
        type: DataTypes.STRING,
        allowNull: true
      },
    
      
      
      
    });

    // Equipe.associate = function(models) { 
    //     Equipe.hasMany(models.User)
    // };
   
    return CompteClient;
  };