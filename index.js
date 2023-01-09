
// required packages
require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const db = require('./models')
const crypto = require('crypto-js')
const axios = require('axios')
const { response } = require('express')

// app config
const app = express()
const PORT = process.env.PORT || 8000
const API_KEY = process.env.API_KEY
app.set('view engine', 'ejs')
// parse request bodies from html forms
app.use(express.urlencoded({ extended: false }))
// tell express to parse incoming cookies
app.use(cookieParser())

// custom auth middleware that checks the cookies for a user id
// and it finds one, look up the user in the db
// tell all downstream routes about this user
app.use(async (req, res, next) => {
    try {
        if (req.cookies.userId) {
            // decrypt the user id and turn it into a string
            const decryptedId = crypto.AES.decrypt(req.cookies.userId, process.env.SECRET)
            const decryptedString = decryptedId.toString(crypto.enc.Utf8)
            // the user is logged in, lets find them in the db
            const user = await db.user.findByPk(decryptedString)
            // mount the logged in user on the res.locals
            res.locals.user = user
        } else {
            // set the logged in user to be null for conditional rendering
            res.locals.user = null
        }

        // move on the the next middleware/route
        next()
    } catch (err) {
        console.log('error in auth middleware: 🔥🔥🔥🔥', err)
        // explicity set user to null if there is an error
        res.locals.user = null
        next() // go to the next thing
    }
})
// example custom middleware (incoming request logger)
app.use((req, res, next) => {
    // our code goes here
    // console.log('hello from inside of the middleware!')
    console.log(`incoming request: ${req.method} - ${req.url}`)
    // res.locals are a place that we can put data to share with 'downstream routes'
    // res.locals.myData = 'hello I am data'
    // invoke next to tell express to go to the next route or middle
    next()
})

// routes and controllers
app.get('/', (req, res) => {
    console.log(res.locals.user)
    res.render('home.ejs', {
        user: res.locals.user
    })
})

// GET movie from the search form
app.get('/movies', async (req, res) => {
    try {
        // api key with the query that shows the title typed in the search form
        const url = `https://www.omdbapi.com/?apikey=${process.env.API_KEY}&s=${req.query.title}`

        const response = await axios.get(url)
        //console.log(response.data.Search[0])
        // giving (responding) back movies.ejs
        res.render('movies/movies.ejs', {
            movies: response.data
        })  
       
    }catch (err) {
        // If there is any error the user should get a message
        console.log('🤡🤡🤡🤡🤡', err)
        res.status(500).send('API error')
    }    
})


// Route to see comments


// route to CREATE a new comment
app.post('/movies', async (req, res) => {
    try{
        const [movie, create] = await db.movie.findOrCreate({
            where: {title: req.body.title,
                year: req.body.year,
                imdbID: req.body.imdbID}
            
        })
        const newComment = await db.comment.create({userId: res.locals.user.id,
        movieId:movie.id,
        content:req.body.comment
        })
        res.redirect(`/movies/${req.body.imdbID}`)
    }catch(err){
        res.send(err)
    }
})







// GET route that renders a single movie details and comments
app.get('/movies/:imdbID', async (req, res) => {
    try {
        // url route patameters
        const url = `https://www.omdbapi.com/?apikey=${process.env.API_KEY}&i=${req.params.imdbID}`
        console.log(req.params)
        const response = await axios.get(url)
        //res.json(response.data)
        // responding with that specific movie details page(detail.ejs)
        const movie = await db.movie.findOne({
            where: {imdbID: response.data.imdbID},
            include: [{model:db.comment, 
            include:db.user}]
            
                /* year: response.data.Year,
                imdbID: response.data.imdbID}
             */
        })
       /*  const comments = await db.comment.findAll({
            where: {imdbID}
        }) */
        console.log(movie)
        console.log(response.data)
        
        res.render('movies/detail.ejs', {
            foundMovie: movie, movie: response.data,
            
        })
        
        /*  if (!create){
            const comments = await movie.getComments()
            res.render('movies/detail.ejs', {
                movie: response.data,
                comment: comments
            })
        }  */
        
        /* res.render('movies/detail.ejs', {
            movie: response.data
        }) */
    }catch (err) {
        console.log('🤡🤡🤡🤡🤡', err)
        res.status(500).send('API error', err)
    }    
})


// This tests my api
 app.get('/api', async (req, res) => { //async the route use the await keyword
try {
    const baseUrl = `https://omdbapi.com/?apikey=${API_KEY}&t=star+wars`
    console.log(baseUrl)
    const response = await axios.get(baseUrl)
    res.json(response.data)
 } catch (error) {
    //console log the especifics of the error, but keep them private
    console.log('👹👹👹👹👹👹')
    // generic internal server error code
    res.status(500).send('Internal server error')
}
}) 

app.use('/users', require('./controllers/users'))

// listen on a port
app.listen(PORT, () => {
    console.log(`authenticating users on PORT ${PORT} 🔐`)
})