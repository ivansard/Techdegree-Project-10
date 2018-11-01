'use strict';
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define('Book', {
    id:{
      type: DataTypes.INTEGER,
      primaryKey: true
    }, 
    title:{
      type: DataTypes.STRING,
      allowNull: false
    },
    author:{
      type: DataTypes.STRING,
      allowNull: false
    },
    genre: DataTypes.STRING,
    first_published: DataTypes.INTEGER,
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