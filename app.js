const express = require('express');
const bodyParser = require('body-parser');

const Book = require('./models').Book;
const Loan = require('./models').Loan
const Patron = require('./models').Patron

const app = express();

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

    today = yyyy + '-' + mm + '-' + dd;

    return today;
}


//Setting body-parser, pug as view engine
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'pug')

app.get('/', (req, res) => {
    res.render('index');
    createToday()
})

// Book routes
app.get('/books/all', (req, res) => {
    Book.findAll()
    .then( books => {
        res.render('allBooks', {books: books});
    })
    .catch( error => {
        console.log(error);
    })
})
app.get('/books/new', (req, res) => {
    res.render('newBook', {book: Book.build() });
})

app.get('/books/overdue', (req, res) =>{
    Book.findAll({
        include: [Loan]
    })
    .then( books => {
        res.render('allBooks', {books: books, overdueFilter: true, today: createToday()})
    })
})

app.get('/books/checkout', (req, res) =>{
    Book.findAll({
        include: [Loan]
    })
    .then( books => {
        res.render('allBooks', {books: books, checkoutFilter: true, today: createToday()})
    })
})

//Figure out how to add the Patron data along with including the loan
app.get('/books/:id', (req, res) => {
    Book.findByPk(req.params.id, {
        include: [Loan]
    })
    .then( book => {
        res.render('bookDetails', {book: book})
    })
    .catch( error => {
        console.log(error);
    })
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
    Loan.findAll({
        include: [Book, Patron]
    })
    .then( loans => {
        console.log(loans[0].Patron.dataValues);
        res.render('allLoans', {loans: loans})
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

app.get('/patrons/:id', (req, res) => {
    Patron.findByPk(req.params.id, {
        include: [Loan]
    })
    .then( patron => {
        console.log(patron.Loans);
        res.render('patronDetails', {patron: patron})
    })

})

app.post('/patrons/new', (req, res) => {
    Patron.create(req.body)
    .then( patron => {
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
