const router = require('express').Router()
const Language = require('../models/Language')

//Endpoint służący do pobierania języków
router.get('/', async (req, res) => {

    try {

        const languages = await Language.find();

        return res.status(200).json(languages)

    } catch (error) {

        return res.status(500).json(error)
    }
})


module.exports = router