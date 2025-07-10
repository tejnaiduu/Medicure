const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


function verify(req, res, next) {
    const auth = req.headers['authorization'];
    try{
        if(!auth) {
            return res.status(401).json({ message: "Header is missing" });
        }
        const token = auth.split(' ')[1];
        if(!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        jwt.verify(token, process.env.TOKEN, (err, decoded) => {
            if(err) {
                return res.status(403).json({ message: "Invalid token" });
            }
            else{
                req.user = decoded;
                next();
                
            }
        });
    }
    catch (error) {
        console.error("Error in token verification:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
    
}
module.exports = verify;