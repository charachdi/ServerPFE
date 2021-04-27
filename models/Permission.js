module.exports = (sequelize, DataTypes) => {
    const Permission  = sequelize.define("Permission", {
    id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
        },

    Read : {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "true",
    },
    Write : {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "true",
    },
    import : {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "false",
    },
    export : {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "false",
    }

    });

    Permission.associate = function(models) { 
        Permission.belongsTo(models.Auth  , { onDelete: 'cascade', 
        foreignKey: { allowNull: false }  })
    };
   
    return Permission;
  };