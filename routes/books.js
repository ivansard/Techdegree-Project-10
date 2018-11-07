const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const sequelize = new Sequelize('library.db', '', '', {
    dialect: 'sqlite',
    storage: './db/library.db'
});
const Op = Sequelize.Op;

const Book = require('../models').Book;
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
    Loan.findAll({
        include: [Book],
            where:{
                returned_on: null,
                return_by:{
                    lt: new Date()
                }
            }
    })
    .then( loans => {
        let books = [];
        loans.forEach(loan => {
            books.push(loan.Book)
        });
        console.log(books);
        res.render('allBooks', {books: books,
                                today: createToday(),
                                path: req.route.path,
                                offsetIndex: 0})
    })
    .catch( error => {
        console.log(error);
    })
})

router.get('/checkout', (req, res) =>{
    Loan.findAll({
        include: [{model : Book,}],
        where: {
            returned_on: null
        }
    })
    .then( loans => {
        let books = [];
        loans.forEach(loan => {
            books.push(loan.Book)
        });
        console.log(books);
        res.render('allBooks', {books: books,
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
        res.render('returnBook', {loan:loan, today: createToday(), addDays: addDays})
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
        sequelize.query(`UPDATE loans SET returned_on = DATE(returned_on) WHERE id=${req.params.id}`)
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
                res.render('returnBook', {loan:loan, today: createToday(), addDays: addDays, errors: error.errors})
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
            res.render('allBooks', {books: books, path:'/all', offsetIndex:0})
        })
    })
    .catch( error => {
        if( error.name === 'SequelizeValidationError'){
            console.log(error.errors);
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
        res.render('allBooks', {books: books, path: '/all', offsetIndex: 0});
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

router.get('/all/pagination/:index', (req, res) => {
    const offsetIndex = req.params.index - 1;
    Book.findAll().then( books => {
        console.log(offsetIndex);
        res.render('allBooks', {books:books, path:'/all', offsetIndex: offsetIndex})
    })
})

module.exports = router;