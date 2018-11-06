'use strict';

const dateFormat= require('dateformat');

module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define('Loan', {
    id:{
      type: DataTypes.INTEGER,
      primaryKey: true
    }, 
    book_id:{
      type:DataTypes.INTEGER,
      validate:{
        notEmpty:{
          msg: 'Please select a book to loan out'
        }
      }
    }, 
    patron_id:{
      type:DataTypes.INTEGER,
      validate:{
        notEmpty:{
          msg: 'Please select a patron who will loan out the book'
        }
      }
    }, 
    loaned_on:{
      type: DataTypes.DATE,
      validate:{
        isDate:{
          msg: 'Loaned on must be a in a valid date format (e.g. YYYY-MM-DD)'
        }
      }
    },
    return_by:{
      type: DataTypes.DATE,
      validate:{
        isDate:{
          msg: 'Loaned on must be a in a valid date format (e.g. YYYY-MM-DD)'
        }
      }
    },
    returned_on:{
      type: DataTypes.DATE,
      validate:{
        isDate:{
          msg: 'Loaned on must be a in a valid date format (e.g. YYYY-MM-DD)'
        }
      }
    },
  }, {
    timestamps: false
  });


  Loan.associate = function(models) {
    Loan.belongsTo(models.Book, {
      foreignKey: 'book_id'
    }),
    Loan.belongsTo(models.Patron, {
      foreignKey: 'patron_id'
    })
  };

  Loan.prototype.loanedOn = function() {
    return dateFormat(this.loaned_on, "YYYY-mm-dd");
  };

  Loan.prototype.returnedOn = function() {
    return dateFormat(this.returned_on , "YYYY-mm-dd");
  };

  Loan.prototype.returnBy = function() {
    return dateFormat(this.return_by, "YYYY-mm-dd");
  };

  return Loan;
};