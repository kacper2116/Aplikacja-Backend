const router = require('express').Router()
const User = require('../models/User')



//Aktualizacja użytkownika

router.put('/:id', async (req, res) => {

    if (req.body.password) {

        req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString()
    }

    try {

        const updatedUser = await User.findByIdAndUpdate(req.params.id, {

            $set: req.body,

        }, { new: true })

       return res.status(200).json(updatedUser)

    } catch (err) {

        return res.status(500).json(err)

    }
})

//Usuwanie użytkownika po id

router.delete('/"id', async (req, res) => {
    try {

        await User.findByIdAndDelete(req.params.id)
        return res.status(200).json('User has been deleted')

    } catch (err) {

       return res.status(500).json(err)
    }
})

//GET USER

router.get('/find/:id', async (req, res) => {
    try {

        const user = await User.findById(req.params.id)
        const { password, ...others } = user._doc

        return res.status(200).json({ others })


    } catch (err) {

        return res.status(500).json(err)
    }
})

//Pozyskanie wszystkich użytkowników

router.get('/', async (req, res) => {

    const query = req.query.new

    try {

        const users = query ? await User.find().sort({ _id: -1 }).limit(5) : await User.find()
        return res.status(200).json(users)


    } catch (err) {

       return res.status(500).json(err)
    }
})



module.exports = router
