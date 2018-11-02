'use strict';
module.exports = (sequelize, DataTypes) => {
  const Patron = sequelize.define('Patron', {
    id:{
      type: DataTypes.INTEGER,
      primaryKey: true
    }, 
    first_name:{
      type:DataTypes.STRING,
      validate:{
        notEmpty:{
          msg: 'First name must be specified'
        }
      }
    },
    last_name:{
      type:DataTypes.STRING,
      validate:{
        notEmpty:{
          msg: 'Last name must be specified'
        }
      }
    },
    address:{
      type:DataTypes.STRING,
      validate:{
        notEmpty:{
          msg: 'Address must be specified'
        }
      }
    },
    email:{
      type:DataTypes.STRING,
      validate:{
        notEmpty:{
          msg: 'E-mail must be specified'
        },
        isEmail:{
          msg: 'Please submit a valid email'
        }
      }
    },
    library_id:{
      type:DataTypes.STRING,
      validate:{
        notEmpty:{
          msg: 'Library ID must be specified'
        }
      }
    },
    zip_code:{
      type: DataTypes.INTEGER,
      validate:{
        notEmpty:{
          msg: 'Zip code must be specified'
        },
        isInt:{
          msg: 'Zip code must be a valid number'
        }
      }
    } 
  }, {
    timestamps: false
  });
  Patron.associate = function(models) {
    // associations can be defined here
    Patron.hasMany(models.Loan, {
      foreignKey: 'patron_id'
    })
  };
  return Patron;
};