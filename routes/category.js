const router = require('express').Router()
const Category = require('../models/Category')


router.get('/', async (req, res) => {

    try {

        const categories = await Category.find();

        return res.status(200).json(categories)

    } catch (err) {

        return res.status(500).json(err)
    }
})


module.exports = router