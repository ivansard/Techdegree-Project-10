const express = require('express');
const router = express.Router();

const Sequelize = require('sequelize');
//This is for performing raw queries for updating the date fields in the loans table
const sequelize = new Sequelize('library.db', '', '', {
    dialect: 'sqlite',
    storage: './db/library.db'
});

const Book = require('../models').Book
const Loan = require('../models').Loan
const Patron = require('../models').Patron

//Functions for formatting and creating needed dates
const createFormattedDate = date =>{
    
    let dd = date.getDate();
    let mm = date.getMonth() + 1; 
    let yyyy = date.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    let formattedDate = yyyy + '-' + mm + '-' + dd;

    return formattedDate;
}

const addDays = (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return createFormattedDate(result);
}

const createToday = () => {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; 
    let yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    today = yyyy +  '-' + mm + '-' + dd;

    return today;
}

//Loans routes

//Route displaying all loans
router.get('/all', (req, res) => {
    //Updating the date fields, not to have timestamps
    sequelize.query(`UPDATE loans SET loaned_on = DATE(loaned_on), return_by = DATE(return_by), returned_on = DATE(returned_on)`) 
    .then(
        Loan.findAll({
            include: [Book, Patron]
        })
        .then( loans => {
            res.render('allLoans', {loans: loans})
        })
    )
    .catch( error => {
        console.log(error);
    })
})

//Route displaying page to reate new loan
router.get('/new', (req, res) => {
    //Promise.all to wait for two queries to the database to finish before moving on
    Promise.all([Book.findAll(), Patron.findAll()])
    .then( values => {
        res.render('newLoan', {loan: Loan.build(), allBooks: values[0], allPatrons: values[1], today: createToday(), weekFromToday: addDays(createToday(), 7), addDays: addDays})
    })
    .catch( error => {
        console.log(error);
    })
})

//Overdue loans
router.get('/overdue', (req, res) =>{
    Loan.findAll({
        include: [Book, Patron]
    })
    .then( loans => {
        res.render('allLoans', {loans: loans, overdueFilter: true, today: createToday()})
    })
    .catch( error => {
        console.log(error);
    })
})

//Checked out loans
router.get('/checkout', (req, res) =>{
    Loan.findAll({
        include: [Book, Patron]
    })
    .then( loans => {
        res.render('allLoans', {loans: loans, checkoutFilter: true, today: createToday()})
    })
    .catch( error => {
        console.log(error);
    })
})

//Route to which is posted after creating new loan
router.post('/new', (req, res) => {
    console.log(req.body);
    Loan.create(req.body)
    .then( loan => {
        sequelize.query(`UPDATE loans SET loaned_on = DATE(loaned_on), return_by = DATE(return_by)`) 
        res.redirect('/loans/all')
    })
    .catch( error => {
        if( error.name === 'SequelizeValidationError'){
            Promise.all([Book.findAll(), Patron.findAll()])
            .then( values => {
                res.render('newLoan', {loan: Loan.build(req.body), allBooks: values[0], allPatrons: values[1], today: createToday(), weekFromToday: addDays(createToday(), 7), addDays: addDays, errors: error.errors})
            })
        } else {
            //This error will be caught by the final catch block
            throw error
        }
    })
    .catch( error => {
        console.log(error);
    })
})

module.exports = router;