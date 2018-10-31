const express = require('express');
const bodyParser = require('body-parser');

const Book = require('./models').Book;

const app = express();

//Setting body-parser, pug as view engine
app.use(bodyParser.urlencoded({extended: false}));
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
    console.log(req.body);
    Book.create(req.body).then( book => {
        res.render('bookDetails', {book:book})
    }).catch( error => {
        console.log(error);
    })
})

//Kreiraj POST za novu knjigu
//Kreiraj renderovanje svih knjiga u GET za sve knjige
//Obrisi default tekst u pug fajlovima i probaj da l' radi


app.listen(3000, () => {

    console.log('Server running on port 3000');
})
