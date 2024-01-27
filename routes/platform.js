const router = require('express').Router()
const Platform = require('../models/Platform')


router.get('/', async (req, res) => {

    try {

        const platforms = await Platform.find();

        return res.status(200).json(platforms)

    } catch (err) {

        return res.status(500).json(err)
    }
})



module.exports = router

