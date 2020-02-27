const router = require("express").Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const Users = require("../users/users-model")
const { jwtSecret } = require("../config/secrets.js")

router.post("/register", (req, res) => {
    let user = req.body;
    const hash = bcrypt.hashSync(user.password, 10);
    user.password = hash;

    Users.add(user)
    .then(saved => {
        res.status(200).json(saved);
    })
    .catch(error => {
        res.status(500).json(error)
    })
})

router.post("/login", (req, res) => {
    let {username, password} = req.body;

    Users.findBy({ username })
    .first()
    .then(user => {
        if(user && bcrypt.compareSync(password, user.password)) {
            const token = generateToken(user) //token
            
            res.status(200).json({
                message: `Hello ${user.username}!`,
                token
            })
        } else {
            res.status(401).json({ message: 'Invalid credentials'})
        }
    })
    .catch(error => {
        console.log("ERROR: ", error)
        res.status(500).json({ error: "cannot login"})
    })
})

function generateToken(user) {
    const payload ={ 
        subject: user.id,
        username: user.username,
    }

    const options = {
        expiresIn: "1h",
    };

    return jwt.sign(payload, jwtSecret, options)
}

module.exports = router;

