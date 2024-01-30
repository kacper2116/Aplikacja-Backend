const router = require('express').Router()
const Language = require('../models/Language')


router.get('/', async (req, res) => {

    console.log('dsadass')

    try {

        const languages = await Language.find();

        return res.status(200).json(languages)

    } catch (error) {

        return res.status(500).json(error)
    }
})


module.exports = router