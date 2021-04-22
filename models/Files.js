module.exports = (sequelize, DataTypes) => {
    const Files  = sequelize.define("Files", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
      Nom_file: {
        type: DataTypes.STRING,
        allowNull: true
      },
      url_file: {
        type: DataTypes.STRING,
        allowNull: true
      },
      path_file: {
        type: DataTypes.STRING,
        allowNull: true
      },
      Roomid :{
        type: DataTypes.STRING,
        allowNull: true
      },
      complete :{
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      sussces :{
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      error :{
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      }

    });


    Files.associate = function(models) { 
        Files.belongsTo(models.Equipe)
        Files.belongsTo(models.User)
        Files.hasMany(models.Requete ,  { onDelete: 'cascade' })

    };
   

   
    return Files;
  };