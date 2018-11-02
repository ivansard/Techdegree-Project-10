const express = require('express');
const bodyParser = require('body-parser');

const Book = require('./models').Book;
const Loan = require('./models').Loan
const Patron = require('./models').Patron

const app = express();

//VALIDACIJA ZA BOOK_ID i PATRON_ID kada se kreira novi Loan
//VALIDACIJA ZA RETURNED_ON kod returnBook view-a, frka je sto moze da bude NULL, a mora i datum da bude

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


//Setting body-parser, pug as view engine
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('view engine', 'pug')

const bookRoutes = require('./routes/books.js');
const patronRoutes = require('./routes/patrons.js');
const loanRoutes = require('./routes/loans.js');

app.use('/books', bookRoutes);
app.use('/patrons', patronRoutes);
app.use('/loans', loanRoutes);

app.get('/', (req, res) => {
    res.render('index');
})


app.listen(3000, () => {
    console.log('Server running on port 3000');
})
