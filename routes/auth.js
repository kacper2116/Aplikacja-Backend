const router = require('express').Router()
const User = require('../models/User')
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken');

const passport = require('../passport');
const { generateToken, authenticateToken } = require('./authMiddleware');
const bcrypt = require('bcryptjs');
const saltRounds = 10;


//REGISTER
router.post('/register', async (req, res) => {


    const email = req.body.email
    const username = req.body.username
    const password = req.body.password

   
    try {

        const existingUserEmail = await User.findOne({ email })
        const existingUserLogin = await User.findOne({ username })


        if (existingUserEmail) {
            console.log("this email exists")
            return res.status(409).json({ message: 'This email is already registered' })
        }

        if (existingUserLogin) {
            console.log("this login exists")
            return res.status(409).json({ message: 'This login is already registered' })
        }

     
       const hashedPassword = await bcrypt.hash(password, saltRounds);
       console.log("eeee")


            const newUser = new User({
                username: username,
                email: email,
                password: hashedPassword

            })


            await newUser.save()
            return res.status(201).json({ message: 'Successfully registered' })

    } catch (error) {
        return res.status(500).json(error)
    }

})


//LOGIN
router.post('/login', async (req, res) => {

    try {

        const username = req.body.username
        const password = req.body.password

       
        const user = await User.findOne({ username })
        

        if (!user) {
            return res.status(401).json({ message: 'Wrong username!' })
        }


        const isMatch = await user.comparePassword(password)
      

        if (!isMatch) {
            return res.status(401).json({ message: 'Wrong username or password!' });

        }

        const token = generateToken(user);
        const decodedToken = jwt.decode(token);

        console.log(decodedToken.sub)
        return res.status(201).json({ token: token, username:decodedToken.username });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }

})






module.exports = router