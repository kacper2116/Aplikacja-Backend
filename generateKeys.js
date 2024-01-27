const DigitalKey = require('./models/DigitalKey')
const Product = require('./models/Product')

const generateKeys = async () => {


    function generateRandomKey(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            key += characters.charAt(randomIndex);

            if ((i + 1) % 5 === 0 && i !== length - 1) {
                key += '-';
            }
        }

        return key;
    }

    function generateRandomKeys(quantity) {
        const keys = [];

        for (let i = 0; i < quantity; i++) {
            const key = generateRandomKey(15);
            keys.push(key);
        }

        return keys;
    }

    const generatedKeys = generateRandomKeys(20);

    const games = await Product.find()

    let gamesId = []
    
    games.map((game)=>{
        gamesId.push(game._id)
    })


    for(let i=0;i<5;i++){

        const newKey = new DigitalKey({
            gameId: gamesId[0],
            platform: 'PS5',
            key: generatedKeys[i]

        })

        console.log(newKey)

        await newKey.save()

    }
    
    
    


}



module.exports = generateKeys;