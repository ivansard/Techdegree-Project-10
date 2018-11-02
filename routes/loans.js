const express = require('express');
const router = express.Router();

const Book = require('../models').Book
const Loan = require('../models').Loan
const Patron = require('../models').Patron


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

router.get('/all', (req, res) => {
    Loan.findAll({
        include: [Book, Patron]
    })
    .then( loans => {
        res.render('allLoans', {loans: loans})
    })
    .catch( error => {
        console.log(error);
    })
})

router.get('/new', (req, res) => {
    Promise.all([Book.findAll(), Patron.findAll()])
    .then( values => {
        res.render('newLoan', {loan: Loan.build(), allBooks: values[0], allPatrons: values[1], today: createToday(), weekFromToday: addDays(createToday(), 7)})
    })
    .catch( error => {
        console.log(error);
    })
})

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

router.post('/new', (req, res) => {
    console.log(req.body);
    Loan.create(req.body)
    .then( loan => {
        res.redirect('/loans/all')
    })
    .catch( error => {
        if( error.name === 'SequelizeValidationError'){
            Promise.all([Book.findAll(), Patron.findAll()])
            .then( values => {
                res.render('newLoan', {loan: Loan.build(req.body), allBooks: values[0], allPatrons: values[1], today: createToday(), weekFromToday: addDays(createToday(), 7), errors: error.errors})
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