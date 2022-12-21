// required packages
require('dotenv').config()
const express = require('express')
// app cinfig
const app = express()
const PORT = process.env.PORT || 8000
app.set('view engine', 'ejs')
// parse request body from html forms
app.use(express.urlencoded({extended:false}))
// routes and controllers
app.get('/', (req, res) =>{
    res.render('home.ejs')
})
app.use('/users', require('./controllers/users'))
//listen on a port
app.listen(PORT, () => {
    console.log(`authentication users on port ${PORT}`)
})