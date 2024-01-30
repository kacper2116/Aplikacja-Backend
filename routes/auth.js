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
        
            return res.status(409).json({ message: 'Ten adres email jest już zajęty' })
        }

        if (existingUserLogin) {
         
            return res.status(409).json({ message: 'Ten login jest już zajęty' })
        }


        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword

        })

        await newUser.save()
        return res.status(201).json({ message: 'Pomyślnie zarejestrowano użytkownika' })

    } catch (error) {
        return res.status(500).json(error)
    }

})


//LOGIN
router.post('/login', async (req, res) => {

    try {

        const username = req.body.username
        const password = req.body.password

        const user = await User.findOne({ username: username })

        if (user) {

            const isPasswordCorrect = await user.comparePassword(password)

            if (!isPasswordCorrect) {
                return res.status(401).json({ message: 'Nieprawidłowy login i/lub hasło' });

            }

            const token = generateToken(user);
            const decodedToken = jwt.decode(token);

            return res.status(201).json({ token: token, username: decodedToken.username });

        } else {
            return res.status(401).json({ message: 'Nieprawidłowy login i/lub hasło' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera' });
    }

})






module.exports = router