const router = require('express').Router()
const stripe = require('stripe')(process.env.STRIPE_KEY)
const DigitalKey = require('../models/DigitalKey');
const Order = require('../models/Order')
const Product = require('../models/Product')
const User = require('../models/User')
const { authenticateToken } = require('./authMiddleware')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv')
dotenv.config()

//Konfiguracja transportera do wysyłania maili

const transporter = nodemailer.createTransport({
  host: 'smtp.wp.pl',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  }
});


//Funkcja sprawdzająca wartość zamówienia

const calculateOrderAmount = async (products) => {

  let totalPrice = 0;

  for (const item of products) {

    try {
      const product = await Product.findOne({ _id: item.productId })

      if (product) {


        totalPrice += parseFloat((product.price * item.quantity).toFixed(2));

      }
    } catch (error) {
      console.error("Błąd podczas pobierania produktu")
    }
  }


  return totalPrice * 100;

};

//Tworzenie intencji płatności stripe

router.post("/payment", async (req, res) => {

  const { products } = req.body;


  const paymentIntent = await stripe.paymentIntents.create({
    amount: await calculateOrderAmount(products),
    currency: "pln",
    
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});


//Potwierdzanie płatności i tworzenie zamówienia
router.post('/', authenticateToken, async (req, res) => {

  try {

    const { paymentIntentId, products } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if(!paymentIntent)return res.status(500).json({message:'Nie znaleziono identyfikatora płatności'})

    if (paymentIntent.status === 'succeeded') {

      const paymentMethodData = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
      const paymentMethod = paymentMethodData.type

      const userId = req.user.sub

      const newOrder = new Order();

      newOrder.userInfo = {
        userId: userId
      }

      for (const product of products) {


        const productPrice = (await Product.findById(product._id)).price
        const productPublisher = (await Product.findById(product._id)).publisher
        const productImg = (await Product.findById(product._id)).coverImg

    
        for (let i = 0; i < product.quantity; i++) {
          const newProduct = {
            _id: new mongoose.Types.ObjectId(),
            coverImg: productImg,
            title: product.title,
            publisher: productPublisher,
            platform: product.selectedPlatform,
            price: productPrice,
            key: null,
            received:false,
          };

         
          const digitalKey = await DigitalKey.findOne({
            gameId: product._id,
            platform: product.selectedPlatform,
            orderId: { $exists: false },
          });

       
          if (!digitalKey) {
            return res.status(400).json({ error: 'Brak dostępnych kluczy dla tego produktu.' });
          }

          
          newProduct.key = digitalKey.key;

          await DigitalKey.updateOne(
            { _id: digitalKey._id },
            {
              orderId: newOrder._id,
              productId: newProduct._id
            }
          );

    
          newOrder.products.push(newProduct);

        }

      }


      //Pobieranie ceny produktu

      const getProductPrice = async (productId) => {
        try {

          const product = await Product.findById(productId);


          if (!product) {
            throw new Error('Produkt nie został znaleziony');
          }

          return { price: product.price };
        } catch (error) {
          console.error(`Błąd pobierania ceny produktu: ${error.message}`);
          throw error;
        }
      };
      

      //Sprawdzenie ilości produktów w zamówieniu

      const getTotalQuantity = async (products) => {
        try {
          const totalQuantity = await products.reduce(async (quantityPromise, product) => {
            const currentQuantity = await quantityPromise;
            return currentQuantity + product.quantity;
          }, Promise.resolve(0));

          return totalQuantity;
        } catch (error) {
          console.error(`Błąd obliczania całkowitej ilości produktów: ${error.message}`);
          throw error;
        }
      };

      //Sprawdzanie wartości zamówienia

      const getOrdervalue = async (products) => {
        try {
          const orderValue = await products.reduce(async (valuePromise, product) => {
            const currentValue = await valuePromise;
            const productInfo = await getProductPrice(product._id);
            return currentValue + productInfo.price * product.quantity;
          }, Promise.resolve(0));

          return orderValue;
        } catch (error) {
          console.error(`Błąd obliczania wartości zamówienia: ${error.message}`);
          throw error;
        }
      };
      const orderQuantity = await getTotalQuantity(products);
      const orderValue = await getOrdervalue(products);

      newOrder.paymentMethod = paymentMethod;
      newOrder.currency = paymentIntent.currency;
      newOrder.quantity = orderQuantity;
      newOrder.orderValue = orderValue;

      const savedOrder = await newOrder.save()

      return res.status(201).json({ success: true })
    } else return res.status(201).json({success:false})
  } catch (error) {
    console.error(error)

    return res.status(500).json({ success: false, paymentStatus: "error" });

  }

})

//////////////////////////////////////////////////////
//Obsługa płatności w przypadku gościa

router.post('/guest', async (req, res) => {

  try {

    const { paymentIntentId, products } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const guestEmail = req.params.guestEmail
    

    if (paymentIntent.status === 'succeeded') {

      const paymentMethodData = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
      const paymentMethod = paymentMethodData.type
      const newOrder = new Order();

      newOrder.userInfo = {
        guestEmail: guestEmail
      }


      for (const product of products) {

        const productPrice = (await Product.findById(product._id)).price
        const productPublisher = (await Product.findById(product._id)).publisher


        for (let i = 0; i < product.quantity; i++) {
          const newProduct = {
            _id: new mongoose.Types.ObjectId(),
            title: product.title,
            publisher: productPublisher,
            platform: product.selectedPlatform,
            price: productPrice,
            key: null,
            received:false,
          };

         

          const digitalKey = await DigitalKey.findOne({
            gameId: product._id,
            platform: product.selectedPlatform,
            orderId: { $exists: false },
          });

    
          if (!digitalKey) {
            return res.status(400).json({ error: 'Brak dostępnych kluczy dla tego produktu.' });
          }

          newProduct.key = digitalKey.key;
         

          await DigitalKey.updateOne(
            { _id: digitalKey._id },
            {
              orderId: newOrder._id,
              productId: newProduct._id
            }
          );

    
          newOrder.products.push(newProduct);

        }

      }


      const getProductPrice = async (productId) => {
        try {

          const product = await Product.findById(productId);


          if (!product) {
            throw new Error('Produkt nie został znaleziony');
          }

          return { price: product.price };
        } catch (error) {
          console.error(`Błąd pobierania ceny produktu: ${error.message}`);
          throw error;
        }
      };

      const calculateTotalQuantity = async (products) => {
        try {
          const totalQuantity = await products.reduce(async (quantityPromise, product) => {
            const currentQuantity = await quantityPromise;
            return currentQuantity + product.quantity;
          }, Promise.resolve(0));

          return totalQuantity;
        } catch (error) {
          console.error(`Błąd obliczania całkowitej ilości produktów: ${error.message}`);
          throw error;
        }
      };


      const calculateOrderValue = async (products) => {
        try {
          const orderValue = await products.reduce(async (valuePromise, product) => {
            const currentValue = await valuePromise;
            const productInfo = await getProductPrice(product._id);
            return currentValue + productInfo.price * product.quantity;
          }, Promise.resolve(0));

          return orderValue;
        } catch (error) {
          console.error(`Błąd obliczania wartości zamówienia: ${error.message}`);
          throw error;
        }
      };
      const orderQuantity = await calculateTotalQuantity(products);
      const orderValue = await calculateOrderValue(products);

      newOrder.paymentMethod = paymentMethod;
      newOrder.currency = paymentIntent.currency;
      newOrder.quantity = orderQuantity;
      newOrder.orderValue = orderValue;


      const savedOrder = await newOrder.save()

      const keysToSend = newOrder.products.map(product => {
        return `${product.title}: ${product.key}`;
      }).join('\n');

  
      const mailOptions = {
        from: 'bestgames',
        to: guestEmail,
        subject: 'Odbierz swój klucz - Best Games',
        text: `Zamówienie nr: ${newOrder._id} \n ${keysToSend}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          restart.status(500).josn({success: false})
        }  
        console.log('E-mail wysłany: ' + info.response);
      })

      
      res.status(201).json({ success: true })

      
    } else return res.status(201).json({success:false})
  } catch (error) {
    console.error(error)

    return res.status(500).json({ success: false, paymentStatus: "error" });

  }

})


module.exports = router
