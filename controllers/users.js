// create an indtance of express routers
const express = require('express')
const db = require('../models')
const router = express.Router()
// mount out routs on the router
// GET / users/new -- serves a form to create new user
router.get('/new', (req, res)=>{
    res.render('users/new.ejs')
})
// POST/users -- creates a new user form from the 
router.post('/', async (req, res) =>{
    try {
        // based on the info in the req.body, find or create a user
        const [newUser, creater] = await db.user.findOrCreate({
            where: {
                email: req.body.email
            }, 
            // TODO dont add plaintext passwords to the db
            defaults: {
                password: req.body.password
            }
            
        })
        // TODO: redirect to the login page if the user is found
        // log the user in (store the useer id as a cooki in the browser)
        res.cookie('userId', newUser.id)
        // redirect to the homepage (for now)
        res.redirect('/')
    } catch (err) {
        console.log(err)
        res.status(500).send('server error')

    }
})

// GET /users.login -- render a login form that POSTs to /users/login
router.get('/login', (req, res) => {
    res.render('users/login.ejs', {
        message: req.query.message ? req.query.message : null
    })
})
//POST /users/login -- ingest data from rendered @ GET /users/login
router.post('/login', async (req, res)=>{
    try {
        //look up the user based on their email
        const user = await db.user.findOne({
            where: {
                email: req.body.email
            }
        })
        //boilerplate message if loging dails
        const badCredentialMessage = 'username or password incorrect'
        if (!user) {
            // if the user isnt found in the db
            res.redirect('/users/login?message=' + badCredentialMessage)
        } else if (user.password !== req.body.password) {
           // if the users supplied password is incorrect
           res.redirect('/users/login?message=' +badCredentialMessage)
        }else {
             //if the user 
             console.log('loggin user in!')
             res.cookie('userId', user.id)
             res.redirect('/')
        }

    } catch (err) {
        console.log(err)
        res.status(500).send('server error')
    }
})

// GET /users/logout --clear any cookies and redirect to homepage
router.get('/logout', (req, res) => {
    // og the user out by removing the cookie
    // make a get req to /
    res.clearCookie('userId')
    res.redirect('/')
})


//export the router
module.exports = router