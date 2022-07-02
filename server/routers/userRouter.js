const router = require("express").Router();
const User = require("../models/userModel")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// register
router.post("/", async (req, res) => {

    try {
        console.log(req.body);
        const { email, password, passwordVerify } = req.body;

        // validation

        if (!email || !password || !passwordVerify)
            return res.status(400).json({
                errorMessage: "please enter all requiered fields"
            });

        if (password.length < 6)
            return res.status(400).json({
                errorMessage: "please enter password with at least 6 characteres"
            });

        if (password !== passwordVerify)
            return res.status(400).json({
                errorMessage: "passwords don't match"
            });

        const existingUser = await User.findOne({ email }).then();
        if (existingUser)
            return res.status(400).json({
                errorMessage: "User already exists"
            });

        // hash passwords
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        // save user to DB
        const newUser = new User({
            email, passwordHash
        });
        const savedUser = await newUser.save();

        // log user in process : browser makes request to log in (with cookie and token),
        // the server detect it and validate it 

        // sign token 
        const token = jwt.sign({
            user: savedUser._id
        },
            process.env.JWT_SECRET
        );
        console.log(token);

        // cookie is a string which contains the token : a cookie is sent from server to the browser (client)
        // which automatically save it and send it back to the server on back requests

        // send token (in a HTTP only cookie)
        res.cookie("token", token, {
            httpOnly: true
        }).send();

    } catch (error) {
        console.log(error);
        res.status(500).send();
    }

});

// login
router.post("/login", async (req, res) => {

    try {
        console.log(req.body);
        const { email, password } = req.body;

        // validation
        if (!email || !password)
            return res.status(400).json({
                errorMessage: "please enter all requiered fields"
            });

        const existingUser = await User.findOne({ email });
        if (!existingUser)
            return res.status(401).json({ // 401 : unauthorized
                errorMessage: "Wrong email or password!"
            });

        // user exists; verify correct password
        const passwordCorrect = bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect)
            return res.status(401).json({
                errorMessage: "Wrong email or password!"
            });

        // sign token 
        const token = jwt.sign({
            user: existingUser._id
        },
            process.env.JWT_SECRET
        );
        console.log(token);


        // send token (in a HTTP only cookie)
        res.cookie("token", token, {
            httpOnly: true
        }).send();


    } catch (error) {
        console.log(error);
        res.status(500).send();
    }

});


// log out : tell browser to clear cookie
router.get("/logout", (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    }).send();
})

module.exports = router;