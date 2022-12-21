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
//export the router
module.exports = router