const router = require('express').Router()
const Genre = require('../models/Genre')


//Endpoint służący do pobierania gatunków gier
router.get('/', async (req, res) => {

    try {

        const genres = await Genre.find();

        return res.status(200).json(genres)

    } catch (error) {

        return res.status(500).json(error)
    }
})


module.exports = router