
// required packages
require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const db = require('./models')
const crypto = require('crypto-js')
const methodOverride = require('method-override')
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
app.use(methodOverride('_method'))

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
  
    console.log(`incoming request: ${req.method} - ${req.url}`)
   
    next()
})

// routes and controllers
 app.get('/', (req, res) => {
    console.log(res.locals.user)
    res.render('home.ejs', {
        user: res.locals.user,
    })
}) 
// GET movie from the search form
app.get('/movies', async (req, res) => {
    try {
        // api key with the query that shows the title typed in the search form
        const url = `https://www.omdbapi.com/?apikey=${process.env.API_KEY}&s=${req.query.title}`

        const response = await axios.get(url)
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
        const url = `https://www.omdbapi.com/?apikey=${process.env.API_KEY}&i=${req.params.imdbID}`
        console.log(req.params)
        const response = await axios.get(url)
        const movie = await db.movie.findOne({
            where: {imdbID: response.data.imdbID},
            include: [{model:db.comment, 
            include:db.user}]
        })
        console.log('🥰movies', movie)
        res.render('movies/detail.ejs', {
            foundMovie: movie, movie: response.data,
            
        })
    }catch (err) {
        console.log('🤡🤡🤡🤡🤡', err)
        res.status(500).send('API error', err)
    }    
})

//Delete comment
// I finished this with Devin and didn't have time to add comments but I'll do it tomorrow so I can remember what I did and how I did
 app.delete('/movies/:imdbID/comments/:commentId', async function (req, res) {
    const user = res.locals.user
    console.log('🥰😘', req.params.commentId)
    try {
        const deleteComment = await db.comment.destroy({
            where: {
                id: req.params.commentId,
                userId: user.id
                
            }
        })
        res.redirect(`/movies/${req.params.imdbID}`)
    } catch (error) {
        console.error(error)
    }
}) 

//Edit comment
app.put('/movies/:imdbID/comments/:commentId', async function (req, res) {
    try {
        const user = res.locals.user
        const imdbId = req.params.imdbID
        const commentId = req.params.commentId
        console.log('🥳', commentId)
        const url = `https://www.omdbapi.com/?apikey=${process.env.API_KEY}&i=${imdbId}`
        const up = await db.comment.update({
            content: req.body.editContent
        }, {
            where: {
                id: commentId,
                userId: user.id
            }
        }
        )

        res.redirect(`/movies/${imdbId}`)
    } catch (err) {
        console.log(err)
    }
})     

app.use('/users', require('./controllers/users'))

// listen on a port
app.listen(PORT, () => {
    console.log(`authenticating users on PORT ${PORT} 🔐`)
})