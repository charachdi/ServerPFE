module.exports = (sequelize, DataTypes) => {
    const Clientimg  = sequelize.define("Clientimg", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },
     img_profile: {
        type: DataTypes.STRING,
        allowNull: true
      },
      img_background: {
        type: DataTypes.STRING,
        allowNull: true
      },
    img_profile_path: {
       type: DataTypes.STRING,
       allowNull: true
     },
     img_background_path: {
       type: DataTypes.STRING,
       allowNull: true
     },
    
      
      
      
    });

    // Clientimg.associate = function(models) { 
    //     Clientimg.hasOne(models.User)
    // };
   
    return Clientimg;
  };