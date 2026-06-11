const jwt = require('jsonwebtoken');

function authenticator(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.SECRET_TOKEN, (err, data) => {
            if (err) {
                res.status(403).json({ err: 'Invalid token' });
            } else {
                req.user = data;
                next();
            }
        });
    } else {
        res.status(403).json({ err: 'Missing token' });
    }
}

module.exports = authenticator;