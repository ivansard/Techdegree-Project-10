'use strict';

const dateFormat= require('dateformat');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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
      [Op.and]:{
        [Op.lt]: moment().add(1, 'year'),
        [Op.gt]: moment().subtract(1, 'year')
      },
      validate:{
        isDate:{
          msg: 'Loaned on must be a valid date'
        }
      }
    },
    return_by:{
      type: DataTypes.DATE,
      [Op.and]:{
        [Op.lt]: moment().add(1, 'year').add(7, 'days'),
        [Op.gt]: moment().subtract(1, 'year').add(7, 'days')
      },
      validate:{
        isDate:{
          msg: 'Return by must be a valid date'
        }
      }
    },
    returned_on:{
      type: DataTypes.DATE,
      // [Op.and]:{
      //   [Op.lt]: moment().add(1, 'year').add(7, 'days'),
      //   [Op.gt]: moment().subtract(1, 'year').add(7, 'days'),
      //   [Op.ne]: ''
      // },
      // validate:{
      //   isDate:{
      //     msg: 'Returned on must be a valid date'
      //   }
      // }
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
    console.log('executing loanedOn');
    return dateFormat(this.loaned_on, "YYYY-mm-dd");
  };

  Loan.prototype.returnedOn = function() {
    console.log('executing returnedOn');
    return dateFormat(this.returned_on , "YYYY-mm-dd");
  };

  Loan.prototype.returnBy = function() {
    return dateFormat(this.return_by, "YYYY-mm-dd");
  };

  return Loan;
};