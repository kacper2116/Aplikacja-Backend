const express = require('express')
const app = express()

const mongoose = require('mongoose')

const dotenv = require('dotenv')
dotenv.config()

const cors = require('cors')

const authRoute = require('./routes/auth')
const productRoute = require('./routes/product')
const orderRoute = require('./routes/order')
const stripeRoute = require('./routes/stripe')
const platformRoute = require('./routes/platform')
const genreRoute = require('./routes/genre')
const languageRoute = require('./routes/language')

const generateKeys = require('./generateKeys');
const Product = require('./models/Product')


const passport = require('./passport');

mongoose.connect(process.env.MONGO_URL)

    .then(() => {
        console.log('DB connection successful');
    })
    .catch((err) => {
        console.log('DB connection failed', err);
    });

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoute)
app.use('/api/products', productRoute)
app.use('/api/orders', orderRoute)
app.use('/api/checkout', stripeRoute)
app.use('/api/platforms', platformRoute)
app.use('/api/genres', genreRoute)
app.use('/api/languages', languageRoute)

app.use(passport.initialize());


app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running")

})



//generateKeys()











