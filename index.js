const express = require("express")
const cors = require("cors")
const axios = require("axios")
const { auth } = require("./firebase")
const { signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } = require("firebase/auth")
require("dotenv").config()

const app = express()

const corsOptions = {
    origin: process.env.ORIGIN_URL,
    credenial: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get("/", (req, res) => {
    res.json({result: res.statusCode, message: "Success!"})
})

app.post("/api/users", async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    await createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
        const user = userCredential.user
        res.json({code: res.statusCode, user: user})
    }).catch((error) => {
        res.json({errorCode: error.code, message: error.message})
    })
})

app.post("/api/user/:username", async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    await signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        const user = userCredential.user
        res.json({code: res.statusCode, user: user})
    }).catch((error) => {
        res.json({errorCode: error.code, message: error.message})
    })
})

app.get("/api/users/:email", async (req, res) => {
    const email = req.params.email

    await fetchSignInMethodsForEmail(auth, email).then((fetchedEmails) => {
        res.json({code: axios.HttpStatusCode.Ok, fetchedEmails: fetchedEmails})
    }).catch((error) => {
        res.json({errorCode: error.code, message: error.message})
    })
})

app.listen(process.env.PORT)

module.exports = app