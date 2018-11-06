const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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

//Na svakoj ruti all, checkout, overdue, kada se klikne na pagination li

// Book routes

router.get('/new', (req, res) => {
    res.render('newBook', {book: Book.build() });
})

router.get('/all', (req, res) => {
    console.log(req.route.path);  
    Book.findAll()
    .then( books => {
        res.render('allBooks', {books: books, path: req.route.path, offsetIndex: 0});
    })
    .catch( error => {
        console.log(error);
    })
})

router.get('/overdue', (req, res) =>{
    Book.findAll({
        include: [Loan]
         //Figure out how to fufill this condition:
        //  if(book.Loans.length > 0 && !book.Loans[book.Loans.length - 1].dataValues.returned_on && book.Loans[book.Loans.length - 1].dataValues.return_by < today)
    })
    .then( books => {
        res.render('allBooks', {books: books,
                                overdueFilter: true,
                                today: createToday(),
                                path: req.route.path,
                                offsetIndex: 0})
    })
    .catch( error => {
        console.log(error);
    })
})

router.get('/checkout', (req, res) =>{
    Book.findAll({
        include: [Loan],
        // where: {
        //     [Op.and]:[
        //         {
        //             returned_on: {[Op.eq]: null }
        //         },
        //     ]
        // }
    })
    .then( books => {
        res.render('allBooks', {books: books,
                                checkoutFilter: true,
                                today: createToday(),
                                path: req.route.path,
                                offsetIndex: 0})
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

//Return book routes

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

//Search routes

router.post('/all/search', (req, res) => {
    const searchInput = req.body.searchInput;
    Book.findAll({
        include: [Loan],
        where: {
            [Op.or]:[
                {
                    title: {[Op.like]: `%${searchInput}%`}
                },
                {
                    author: {[Op.like]: `%${searchInput}%`}
                },
                {
                    genre: {[Op.like]: `%${searchInput}%`}
                },
                {
                    first_published: {[Op.like]: `%${searchInput}%`}
                }
            ]
        }
    })
    .then( books => {
        res.render('allBooks', {books: books, path: '/all'});
    })
    .catch( error => {
        console.log(error);
    })
})

router.post('/overdue/search', (req, res) =>{
    const searchInput = req.body.searchInput;
    Book.findAll({
        include: [Loan],
        where: {
            [Op.or]:[
                {
                    title: {[Op.like]: `%${searchInput}%`}
                },
                {
                    author: {[Op.like]: `%${searchInput}%`}
                },
                {
                    genre: {[Op.like]: `%${searchInput}%`}
                },
                {
                    first_published: {[Op.like]: `%${searchInput}%`}
                }
            ]
        }
    })
    .then( books => {
        res.render('allBooks', {books: books,
                                path: "/overdue",
                                overdueFilter: true,  
                                today: createToday()})
    })
    .catch( error => {
        console.log(error);
    })
})

router.post('/checkout/search', (req, res) =>{
    const searchInput = req.body.searchInput;
    Book.findAll({
        include: [Loan],
        where: {
            [Op.or]:[
                {
                    title: {[Op.like]: `%${searchInput}%`}
                },
                {
                    author: {[Op.like]: `%${searchInput}%`}
                },
                {
                    genre: {[Op.like]: `%${searchInput}%`}
                },
                {
                    first_published: {[Op.like]: `%${searchInput}%`}
                }
            ]
        }
    })
    .then( books => {
        console.log('Here');
        res.render('allBooks', {books: books,
                                checkoutFilter: true,
                                today: createToday(),
                                path: '/checkout'})
    })
    .catch( error => {
        console.log(error);
    })
})

//Pagination routes

// router.post('/all/pagination/:index', (req, res) => {
//     const offsetIndex = req.params.index - 1;
//     Book.findAll({
//         limit: 8,
//         offset: offsetIndex * 8
//     }).then( books => {
//         res.render('allBooks', {books:books, path:'/all'})
//     })
// })

router.post('/all/pagination/:index', (req, res) => {
    const offsetIndex = req.params.index - 1;
    Book.findAll().then( books => {
        console.log(offsetIndex);
        res.render('allBooks', {books:books, path:'/all', offsetIndex: offsetIndex})
    })
})

module.exports = router;