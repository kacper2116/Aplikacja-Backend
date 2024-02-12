const router = require('express').Router()
const DigitalKey = require('../models/DigitalKey')
const Order = require('../models/Order')
const { authenticateToken } = require('./authMiddleware')


<<<<<<< HEAD
=======
//Tworzenie zamówienia

router.post('/', async (req, res) => {

    console.log(req.body)

    try {
        return res.status(200).json()

    } catch (error) {
        return res.status(500).json(error)
    }
})

//////////////////////////////////////////////////////////////////////////////////////////

router.post('/create-order', async (req, res) => {
    try {
        const { transactionId, amount,} = req.body;

        
        const existingOrder = await Order.findOne({ transactionId });

        if (existingOrder) {
            return res.status(400).json({ error: 'Zamówienie już istnieje.' });
        }

       
        const newOrder = new Order({
            transactionId,
            amount,
           
        });

       
        await newOrder.save();

     
        res.status(201).json({ message: 'Zamówienie utworzone pomyślnie.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Wystąpił błąd serwera.' });
    }
})



>>>>>>> 3cc8f15ce39ee0f2d31b38257696889a10811e38
//Aktualizacja zamówienia

router.put('/:id', async (req, res) => {

    try {

        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {

            $set: req.body,

        }, { new: true })

        return res.status(200).json(updatedOrder)

    } catch (err) {

        return res.status(500).json(err)

    }
})

//Usuwanie zamówienia

router.delete('/"id', async (req, res) => {
    try {

        await Order.findByIdAndDelete(req.params.id)
        return res.status(200).json('Zamówienie zostało usunięte')

    } catch (err) {

        return res.status(500).json(err)
    }
})

<<<<<<< HEAD
//Pobieranie wszystkich zamówień
=======
//Pozyskanie wszystkich zamówień
>>>>>>> 3cc8f15ce39ee0f2d31b38257696889a10811e38
router.get('/', async (req, res) => {


    try {

        const orders = await order.find()

        return res.status(200).json(orders)


    } catch (err) {

        return res.status(500).json(err)
    }
})


<<<<<<< HEAD
// Pobieranie zamówień użytkownika o wskazanym id 
=======
// Pozyskanie zamówień użytkownika
>>>>>>> 3cc8f15ce39ee0f2d31b38257696889a10811e38

router.get('/:userId', authenticateToken, async (req, res) => {

    console.log(req.params.userId)

    try {

        const orders = await Order.find({ userInfo: { userId: req.params.userId } })
            .sort({ createdAt: 'desc' })
            .exec();

        
        if(orders.length < 1){
            return res.status(200).json({ message:"Brak dostępnych zamówień"})
        }

        return res.status(200).json({orders})

        


    } catch (err) {

        return res.status(500).json(err)
    }
})

<<<<<<< HEAD
// Pobieranie pojedynczego zamówienia o wskazanym id

=======
// Pozyskanie pojedynczego zamówienia
>>>>>>> 3cc8f15ce39ee0f2d31b38257696889a10811e38
router.get('/order/:orderId', authenticateToken, async (req, res) => {

    try {

        const orderId = req.params.orderId
        const order = await Order.findById(orderId)

        return res.status(201).json(order)

    } catch (error) {
        return res.status(404)
    }

})

//Pobieranie klucza przypisanego do produktu w zamówieniu

router.post('/order/:orderId/receive/:productId',authenticateToken, async (req, res) => {

    try {

        const orderId = req.params.orderId
        const order = await Order.findById(orderId)

        if (!order) return res.status(404).json({ message: "Nie znaleziono takiego zamówienia" })

        if (order.userInfo.userId !== req.user.sub) {
            return res.status(403).json({ message: 'Brak dostępu do tego zasobu.' });
        }

        const productId = req.params.productId
        const product = order.products.find(product => product._id.toString() === productId);

        if (product.received === false){
           
            product.received = true
            await order.save()
        }         

        const key = await DigitalKey.findOne({ productId: productId });

        if (!key) {
            return res.status(404).json({ message: 'Nie znaleziono dostępnego klucza dla tego produktu.' });
        }

        if (key.received === false) {
            key.received = true;
            await key.save();
        }

        return res.status(200).json({ key: key.key });

    } catch (error) {
        return res.status(500).json({ message: 'Wystąpił błąd podczas odbierania produktu.' });
    }

})



module.exports = router
