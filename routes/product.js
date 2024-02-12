const router = require('express').Router()
const Product = require('../models/Product')
const DigitalKey = require('../models/DigitalKey')
const Platform = require('../models/Platform')
const Genre = require('../models/Genre')


// //Pobieranie produktu po id

router.get('/find/:id', async (req, res) => {
    try {

        const product = await Product.findById(req.params.id)

        const productKeys = await DigitalKey.find({ gameId: product._id,  orderId: { $exists: false }})
       
        const availablePlatforms = productKeys.reduce((total, key) => {
            const platform = key.platform;

            if(product.platforms.includes(platform)){

            if (total.hasOwnProperty(platform)) {
                total[platform]++;
            } else {
                total[platform] = 1;
            }
        }

            return total;
        }, {});


        const productData = {
            product: product,
            availablePlatforms: availablePlatforms,
        }

        return res.status(200).json(productData)

    } catch (err) {

        return res.status(500).json(err)
    }
})

//Pobieranie produktu z wyszukiwarki   

router.get('/search', async (req, res) => {

    const { query } = req.query

    try {
        const results = await Product.find({ title: { $regex: query, $options: 'i' } })

        if (results.length > 0) {

            return res.status(200).json(results)

        } else {

            res.status(404).json({ message: 'Nie znaleziono produktu o podanej frazie' })
        }

    } catch (error) {

        return res.status(500).json({ message: 'Błąd serwera' })
    }

})



//Pozyskanie produktów

router.get('/', async (req, res) => {
    
    try {

        const category = req.query.category

        if(category){

            if(category === 'All Games'){

                const products = await Product.find();
                return res.status(200).json(products);

            }else if (category === 'Latest Games'){
                
                const products = await Product.find().sort({'details.release_date': -1}).limit(10);
                
                return res.status(200).json(products);
            }
            
            else{

            const products = await Product.find({ category: category });
            return res.status(200).json(products);

            }

        }

        else{

            const page = parseInt(req.query.page) || 1
            const pageSize = 20
            const skip = (page - 1) * pageSize

            const filters = req.query;
            const filterConditions = {}
            let sortConditions = {}

            if (filters.price) {
                const priceRange = JSON.parse(filters.price);
                filterConditions.price = { $gte: priceRange[0], $lte: priceRange[1] };
            }

            if (filters.tags) {
                const tags = JSON.parse(filters.tags);
                if (tags.length > 0) {
                    filterConditions.tags = { $in: tags };
                }
            }

            if (filters.platforms) {
                const platforms = JSON.parse(filters.platforms);
                if (platforms.length > 0) {
                    filterConditions.platforms = { $in: platforms };
                }
            }

            if (filters.languages) {
                const languages = JSON.parse(filters.languages);
                if (languages.length > 0) {
                    filterConditions.details.languages = { $in: languages };
                }
            }

            if (filters.text) {
                const text = filters.text;

                if (text.length > 0) {
                    filterConditions.title = { $regex: new RegExp(text, 'i') };
                }
            }


            if (filters.sort) {

                let sort = JSON.parse(filters.sort)[0]

                switch (sort) {
                    case 'Price ascending': sortConditions = { price: 1 }; break;
                    case 'Price descending': sortConditions = { price: -1 }; break;
                    case 'Name A-Z': sortConditions = { title: 1 }; break;
                    case 'Name Z-A': sortConditions = { title: -1 }; break;
                    case 'Newest': sortConditions = { 'details.release_date': -1 }; break;
                    case 'Oldest': sortConditions = { 'details.release_date': 1 }; break;
                    default: sortConditions = {}
                }
            }

            const totalFilteredProducts = await Product.countDocuments(filterConditions);
            const totalPages = Math.ceil(totalFilteredProducts / pageSize)

            const filteredProducts = await Product.find(filterConditions)
                .sort(sortConditions)
                .skip(skip)
                .limit(pageSize)


            return res.status(200).json({
                filteredProducts,
                totalFilteredProducts,
                totalPages,
            })

        }

    } catch (error) {
        return res.status(500).json(error)
    }

}
)

//Pozyskanie produktów z konkretnego gatunku lub platformy
router.get('/:param', async (req, res) => {
   

    const param = req.params.param

    const platform = await Platform.find({name: param})
    const genre = await Genre.find({name: param})

    try {

        const page = parseInt(req.query.page) || 1
        const pageSize = 20
        const skip = (page - 1) * pageSize

        const filters = req.query;

        const filterConditions = {}
        let sortConditions = {}

    
    
        if(platform.length > 0)filterConditions.platforms = {$in: param}
        else if (genre.length > 0)filterConditions.tags = {$in: param}

        else {

            if(param === 'All Games') console.log('all games')
            else if(param === 'Latest Games')sortConditions = { 'details.release_date': -1 }
         
        }
    
    
        if (filters.price) {
            const priceRange = JSON.parse(filters.price);
            filterConditions.price = { $gte: priceRange[0], $lte: priceRange[1] };
        }

        if (filters.tags) {
            const tags = JSON.parse(filters.tags);
            if (tags.length > 0) {
                filterConditions.tags = { $in: tags };
            }
        }

        if (filters.platforms) {
            const platforms = JSON.parse(filters.platforms);
            if (platforms.length > 0) {
                filterConditions.platforms = { $in: platforms };
            }
        }

        if (filters.languages) {
            const languages = JSON.parse(filters.languages);
            if (languages.length > 0) {
                filterConditions.details.languages = { $in: languages };
            }
        }

        if (filters.text) {
            const text = filters.text;

            if (text.length > 0) {
                filterConditions.title = { $regex: new RegExp(text, 'i') };
            }
        }


        if (filters.sort) {

            let sort = JSON.parse(filters.sort)[0]

            switch (sort) {
                case 'Price ascending': sortConditions = { price: 1 }; break;
                case 'Price descending': sortConditions = { price: -1 }; break;
                case 'Name A-Z': sortConditions = { title: 1 }; break;
                case 'Name Z-A': sortConditions = { title: -1 }; break;
                case 'Newest': sortConditions = { 'details.release_date': 1 }; break;
                case 'Oldest': sortConditions = { 'details.release_date': -1 }; break;
                default: sortConditions = {}
            }
        }

        const totalFilteredProducts = await Product.countDocuments(filterConditions);
        const totalPages = Math.ceil(totalFilteredProducts / pageSize)

        const filteredProducts = await Product.find(filterConditions)
            .sort(sortConditions)
            .skip(skip)
            .limit(pageSize)


        return res.status(200).json({
            filteredProducts,
            totalFilteredProducts,
            totalPages,
        })
       
    } catch (error) {

        return res.status(500).json({ message: 'Błąd serwera' })
    }

})


//Sprawdzenie ilości dostępnych kluczy

router.get('/:gameId/:platform/quantity', async (req, res) => {

    try {
       
        const gameId = req.params.gameId
        const platform = req.params.platform
      

            const numberOfKeys = await DigitalKey.countDocuments({ gameId, platform, orderId:{$exists: false}, received:false});
            console.log(numberOfKeys)
    
            return res.status(200).json(numberOfKeys)
        

    } catch (error) {
        return res.status(500).json({ message: 'Błąd serwera' })
    }



})


//Sprawdzenie ceny produkty

router.get('/:gameId/price', async (req, res) => {

    try {
        const gameId = req.params.gameId
        
        const product = await Product.findById(gameId)
        const price = product.price
   

        return res.status(200).json(price)

    } catch (error) {
        return res.status(500).json({ message: 'Błąd serwera' })
    }



})





module.exports = router