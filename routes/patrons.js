const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const Book = require('../models').Book
const Patron = require('../models').Patron
const Loan = require('../models').Loan


//All patrons route
router.get('/all', (req, res) => {
    Patron.findAll()
    .then( patrons => {
        res.render('allPatrons', {patrons: patrons, path: req.route.path, offsetIndex: 0});
    })
    .catch( error => {
        console.log(error);
    })
})

//New patron route
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

//Route to which is posted after creating new patron
router.post('/new', (req, res) => {
    Patron.create(req.body)
    .then( () => {
        Patron.findAll()
        .then( patrons => {
            res.render('allPatrons', {patrons: patrons, path: '/all', offsetIndex: 0})
        })
    })
    .catch( error => {
        if( error.name === 'SequelizeValidationError'){
            res.render('newPatron', {patron: Patron.build(req.body), errors: error.errors})
        } else {
            //This error will be caught by the final catch block
            throw error
        }
    })
    .catch( error => {
        console.log(error);
    })
})

//Route to which is posted a fter patron is updated
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

// Search Routes

router.post('/all/search', (req, res) => {
    const searchInput = req.body.searchInput;
    Patron.findAll({
        where: {
            [Op.or]:[
                {
                    first_name: {[Op.like]: `%${searchInput}%`}
                },
                {
                    last_name: {[Op.like]: `%${searchInput}%`}
                },
                {
                    email: {[Op.like]: `%${searchInput}%`}
                },
                {
                    address: {[Op.like]: `%${searchInput}%`}
                },
                {
                    library_id: {[Op.like]: `%${searchInput}%`}
                },
                {
                    zip_code: {[Op.like]: `%${searchInput}%`}
                }
            ]
        }
    })
    .then( patrons => {
        res.render('allPatrons', {patrons: patrons, path: '/all', offsetIndex: 0});
    })
    .catch( error => {
        console.log(error);
    })
})

//Pagination Routes

router.get('/all/pagination/:index', (req, res) => {
    const offsetIndex = req.params.index - 1;
    Patron.findAll().then( patrons => {
        console.log(offsetIndex);
        res.render('allPatrons', {patrons:patrons, path:'/all', offsetIndex: offsetIndex})
    })
})


module.exports = router;