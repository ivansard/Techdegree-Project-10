const express = require('express');
const router = express.Router();

const Book = require('../models').Book;
const Loan = require('../models').Loan
const Patron = require('../models').Patron

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

// Book routes
router.get('/all', (req, res) => {
    Book.findAll()
    .then( books => {
        res.render('allBooks', {books: books});
    })
    .catch( error => {
        console.log(error);
    })
})
router.get('/new', (req, res) => {
    res.render('newBook', {book: Book.build() });
})

router.get('/overdue', (req, res) =>{
    Book.findAll({
        include: [Loan]
    })
    .then( books => {
        res.render('allBooks', {books: books, overdueFilter: true, today: createToday()})
    })
    .catch( error => {
        console.log(error);
    })
})

router.get('/checkout', (req, res) =>{
    Book.findAll({
        include: [Loan]
    })
    .then( books => {
        res.render('allBooks', {books: books, checkoutFilter: true, today: createToday()})
    })
    .catch( error => {
        console.log(error);
    })
})

router.get('/:id', (req, res) => {
    Book.findByPk(req.params.id, {
        include: [
            {
                model: Loan,
                include: [
                    Patron
                ]
            }
        ]
    })
    .then( book => {
        if(book){
            res.render('bookDetails', {book: book})
        } else {
            res.send(404)
        }
    })
    .catch( error => {
        console.log(error);
    })
})

router.get('/return/:id', (req, res) => {
    Loan.findByPk(req.params.id, {
        include: [Book, Patron]
    })
    .then( loan => {
        res.render('returnBook', {loan:loan, today: createToday()})
    })
    .catch( error => {
        console.log(error);
    })

})

router.post('/return/:id', (req, res) => {
    Loan.findByPk(req.params.id)
    .then( loan => {
       loan.update(req.body);
    })
    .then( () => {
        Loan.findAll({
            include: [Book, Patron]
        }).then( loans => {
            res.render('allLoans', {loans:loans})
        })
    })
    .catch( error => {
        if( error.name === 'SequelizeValidationError'){
            Loan.findByPk(req.params.id, {
                include: [Book, Patron]
            })
            .then( loan => {
                res.render('returnBook', {loan:loan, today: createToday(), errors: error.errors})
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

router.post('/new', (req, res) => {
    Book.create(req.body)
    .then( () => {
        Book.findAll()
        .then( books => {
            res.render('allBooks', {books: books})
        })
    })
    .catch( error => {
        if( error.name === 'SequelizeValidationError'){
            res.render('newBook', {book: Book.build(req.body), errors: error.errors})
        } else {
            //This error will be caught by the final catch block
            throw error
        }
    })
    .catch( error => {
        console.log(error);
    })
})

router.post('/:id', (req, res) => {
    Book.findByPk(req.params.id)
    .then( book => {
      return book.update(req.body)
    })
    .then( updatedBook => {
        res.redirect('/books/all')
    })
    .catch( error => {
        if( error.name === 'SequelizeValidationError'){
            let book = Book.build(req.body);
            book.id = req.params.id;
            res.render('bookDetails', {book: book, errors: error.errors})
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