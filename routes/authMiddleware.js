const jwt = require('jsonwebtoken');

//Funkcja generująca tonek jwt
function generateToken(user) {
  const payload = {
    sub: user._id,
    username:user.username,
    iat: Date.now()
  };

  const options = {
    expiresIn: '1h' // Czas ważności tokena
  };

  return jwt.sign(payload, 'secret-key', options);
}

//Funkcja potwierdzająca poprawnośc tokenu jwt
function authenticateToken(req, res, next) {

  const token = req.header("Authorization")?.split(" ")[1];  

  if (!token) {
    return res.status(401).json({ message: 'Brak tokena uwierzytelniającego.' });
  }

  jwt.verify(token, 'secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Nieprawidłowy token uwierzytelniający.' });
    }

    req.user = user;
    next();
  });
}

module.exports = { generateToken, authenticateToken };