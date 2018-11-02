const express = require('express');
const router = express.Router();

const Book = require('../models').Book
const Patron = require('../models').Patron
const Loan = require('../models').Loan



router.get('/all', (req, res) => {
    Patron.findAll()
    .then( patrons => {
        res.render('allPatrons', {patrons: patrons});
    })
    .catch( error => {
        console.log(error);
    })
})

router.get('/new', (req, res) => {
    res.render('newPatron', {patron: Patron.build() });
})

router.get('/:id', (req, res) => {
    Patron.findByPk(req.params.id, {
        include: [
            {
                model: Loan,
                include: [Book]
            }
        ]
    })
    .then( patron => {
        console.log(patron.Loans);
        res.render('patronDetails', {patron: patron})
    })
    .catch( error => {
        console.log(error);
    })
})

router.post('/new', (req, res) => {
    Patron.create(req.body)
    .then( patron => {
        res.render('patronDetails', {patron: patron})
    })
    .catch( error => {
        console.log(error);
    })
})

router.post('/:id', (req, res) => {
    Patron.findByPk(req.params.id,  {
        include: [
            {
                model: Loan,
                include: [Book]
            }
        ]
    })
    .then( patron => {
        return patron.update(req.body)
    })
    .then( updatedPatron => {
        res.redirect('/patrons/all')
    })
    .catch( error => {
        if( error.name === 'SequelizeValidationError'){
            let patron = Patron.build(req.body);
            patron.id = req.params.id;
            res.render('patronDetails', {patron: patron, errors: error.errors})
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