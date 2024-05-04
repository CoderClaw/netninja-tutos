require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');

const connectDB = require('./server/config/db.js')

const app = express();
const PORT = 5000 || process.env.PORT;

app.use(express.static('public'))

//connect to db

connectDB();

app.use(express.urlencoded({extended:true}))
app.use(express.json())


//templating engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.use('/', require('./server/routes/main.js'));
app.use('/', require('./server/routes/admin.js'));


app.listen(PORT,()=>{
    console.log(`App listening on port ${PORT}`)
})