'use strict';
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    id:{
      type: DataTypes.INTEGER,
      primaryKey: true
    }, 
    title:{
      type: DataTypes.STRING,
      validate: {
        notEmpty:{
          msg: 'Title must be specified'
        }
      }
    },
    author:{
      type: DataTypes.STRING,
      validate: {
        notEmpty:{
          msg: 'Author must be specified'
        }
      }
    },
    genre:{
      type: DataTypes.STRING,
      validate: {
        notEmpty:{
          msg: 'Genre must be specified'
        }
      }
    },
    first_published:{
      type: DataTypes.INTEGER,
      validate: {
        notEmpty:{
          msg: 'Publishing year must be specified'
        }
      }
    } 
  }, {
    timestamps: false
  });
  Book.associate = function(models) {
    Book.hasMany(models.Loan, {
      foreignKey: 'book_id'
    })
  };
  return Book;
};