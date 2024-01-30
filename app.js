const express = require('express')
const app = express()

const mongoose = require('mongoose')

const dotenv = require('dotenv')
dotenv.config()

const cors = require('cors')

const userRoute = require('./routes/user')
const authRoute = require('./routes/auth')
const productRoute = require('./routes/product')
const orderRoute = require('./routes/order')
const cartRoute = require('./routes/cart')
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
app.use('/api/users', userRoute)
app.use('/api/products', productRoute)
app.use('/api/orders', orderRoute)
app.use('/api/carts', cartRoute)
app.use('/api/checkout', stripeRoute)
app.use('/api/platforms', platformRoute)
app.use('/api/genres', genreRoute)
app.use('/api/languages', languageRoute)

app.use(passport.initialize());


app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running")

})



//generateKeys()


const newProduct = new Product({
    title: "Witcher 3",
    coverImg: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg',
    wideImg: 'https://gaming-cdn.com/images/products/268/orig/the-witcher-3-wild-hunt-pc-game-gog-com-cover.jpg?v=1698413872',
    price: 59.99,
    publisher: "publisher",
    tags: ["MMORPG", "Multiplayer", "Action"],
    platforms: ["PC"],
    details: {
        description: "Witcher 3",
        gallery: ["img1", "img2"],
        requirements: {
            minimal: {
                Processor:
                    "Intel Core i5-2500K 3.3 GHz/AMD Phenom II X4 940 3.7 GHz",
                Memory:
                    "6 GB RAM",
                Graphics:
                    "2 GB GeForce GTX 660 / Radeon HD 7870",
                Storage:
                    "50 GB HDD",
                OS:
                    " Windows 7/8/8.1 64-bit",
            },

                recommended: {
                Processor:
                "Intel Core i5-2500K 3.3 GHz/AMD Phenom II X4 940 3.7 GHz",
                Memory:
                "6 GB RAM",
                Graphics:
                "2 GB GeForce GTX 660 / Radeon HD 7870",
                Storage:
                "50 GB HDD",
                OS:
                " Windows 7/8/8.1 64-bit",
                },

            release_date:"2015-11-21T16:10:12.790+00:00",
            languages:["Polish","English"]
        }
    }

})



const addProduct = async() => {

    await newProduct.save()
}

//addProduct()







