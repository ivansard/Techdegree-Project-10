const express = require('express');
const bodyParser = require('body-parser');

const Book = require('./models').Book;
const Loan = require('./models').Loan
const Patron = require('./models').Patron

const app = express();

//Setting body-parser, pug as view engine
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'pug')

app.get('/', (req, res) => {
    res.render('index');
})

// Book routes
app.get('/books/all', (req, res) => {
    Book.findAll().then( books => {
        res.render('allBooks', {books: books});
    })
    .catch( error => {
        console.log(error);
    })
})
app.get('/books/new', (req, res) => {
    res.render('newBook', {book: Book.build() });
})

app.get('/books/:id', (req, res) => {
    //Zavrsi ovo
})

app.post('/books/new', (req, res) => {
    Book.create(req.body).then( book => {
        res.render('bookDetails', {book:book})
    }).catch( error => {
        console.log(error);
    })
})

//Loans routes

app.get('/loans/all', (req, res) => {
    Loan.findAll().then( loans => {
        loans.forEach(loan => {
            Book.findByPk(loan.book_id).then(book => {
                loan.book = book;
                console.log(loan.book + '\n');
                console.log(loan.book.id) + '\n';
            })
        });
        return loans;
    }).then( loans => {
        log()
        res.render('allLoans', {loans: loans});
    })
    .catch( error => {
        console.log(error);
    })
})

//Kreiraj POST za novu knjigu
//Kreiraj renderovanje svih knjiga u GET za sve knjige
//Obrisi default tekst u pug fajlovima i probaj da l' radi

//Patron routes

app.get('/patrons/all', (req, res) => {
    Patron.findAll()
    .then( patrons => {
        res.render('allPatrons', {patrons: patrons});
    })
    .catch( error => {
        console.log(error);
    })
})

app.get('/patrons/new', (req, res) => {
    res.render('newPatron', {patron: Patron.build() });
})

app.post('/patrons/new', (req, res) => {
    Patron.create(req.body)
    .then( patron => {
        console.log('Im here');
        res.render('patronDetails', {patron: patron})
    })
    .catch( error => {
        console.log(error);
    })
})

// app.post('/books/new', (req, res) => {
//     Book.create(req.body).then( book => {
//         res.render('bookDetails', {book:book})
//     }).catch( error => {
//         console.log(error);
//     })
// })


app.listen(3000, () => {

    console.log('Server running on port 3000');
})
