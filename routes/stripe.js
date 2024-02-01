const router = require('express').Router()
const stripe = require('stripe')(process.env.STRIPE_KEY)
const DigitalKey = require('../models/DigitalKey');
const Order = require('../models/Order')
const Product = require('../models/Product')
const User = require('../models/User')
const { authenticateToken } = require('./authMiddleware')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

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


          // Pobierz odpowiednią ilość kluczy z DigitalKeySchema dla danej gry i platformy
          const digitalKey = await DigitalKey.findOne({
            gameId: product._id,
            platform: product.selectedPlatform,
            orderId: { $exists: false },
          });

          // Sprawdź czy znaleziono wystarczającą ilość kluczy
          if (!digitalKey) {
            return res.status(400).json({ error: 'Brak dostępnych kluczy dla tego produktu.' });
          }

          // Dodaj klucze do zamówienia
          newProduct.key = digitalKey.key;


          console.log(newProduct._id)

          await DigitalKey.updateOne(
            { _id: digitalKey._id },
            {
              orderId: newOrder._id,
              productId: newProduct._id
            }
          );

          // Dodaj produkt do zamówienia

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

      return res.status(201).json({ success: true })
    } else return res.status(201).json({success:false})
  } catch (error) {
    console.error(error)

    return res.status(500).json({ success: false, paymentStatus: "error" });

  }

})

//////////////////////////////////////////////////////

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

          console.log(newProduct)

          const digitalKey = await DigitalKey.findOne({
            gameId: product._id,
            platform: product.selectedPlatform,
            orderId: { $exists: false },
          });

    
          if (!digitalKey) {
            return res.status(400).json({ error: 'Brak dostępnych kluczy dla tego produktu.' });
          }

          newProduct.key = digitalKey.key;

          console.log(newProduct._id)

          await DigitalKey.updateOne(
            { _id: digitalKey._id },
            {
              orderId: newOrder._id,
              productId: newProduct._id
            }
          );

          // Dodaj produkt do zamówienia

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

      res.status(201).json({ success: true })
    } else return res.status(201).json({success:false})
  } catch (error) {
    console.error(error)

    return res.status(500).json({ success: false, paymentStatus: "error" });

  }



})


module.exports = router
