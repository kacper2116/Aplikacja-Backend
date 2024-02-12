const DigitalKey = require('./models/DigitalKey')
const Product = require('./models/Product')

//Skrypt pomocniczy do generowania kluczy

const generateKeys = async () => {

    function generateRandomKey(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let key = '';

        for (let i = 0; i < length; i++) {
            const index = Math.floor(Math.random() * characters.length);
            key += characters.charAt(index);

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

    const generatedKeys = generateRandomKeys(10);

    const games = await Product.find()

    let gamesId = []
    
    games.map((game)=>{
        gamesId.push(game._id)
    })

    gamesId.forEach(gameId => {

        for(let i=0;i<5;i++){

            const newKey = new DigitalKey({
                gameId: gameId,
                platform: 'PS5',
                key: generatedKeys[i]
    
            })
    
             newKey.save()
    
        }
        
    })
 
}



module.exports = generateKeys;