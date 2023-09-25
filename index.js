const express = require("express")
const cors = require("cors")
const axios = require("axios")
const { auth, db } = require("./firebase")
const { signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } = require("firebase/auth")
const { ref, get, child, set } = require("firebase/database")
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
    const base64Email = req.body.base64Email

    await set(ref(db, `users/${base64Email}`), {
        email: email
    })

    await createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
        const user = userCredential.user
        res.json({code: axios.HttpStatusCode.Ok})
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
        res.json({code: error.code, message: error.message})
    })
})

app.get("/api/users/:email", async (req, res) => {
    const base64Email = req.params.email
    const email = Buffer.from(base64Email, "base64").toString("utf-8")

    const dbRef = ref(db)
    await get(child(dbRef, `users/${base64Email}`)).then((value) => {
        if (value.exists()) {
            res.json({code: axios.HttpStatusCode.Ok, message: `User existed! | ${email}`})
        } else {
            res.json({code: axios.HttpStatusCode.NotFound, message: `User not existed! | ${email}`})
        }
    }).catch(error => res.json({code: error.code, message: error.message, fullError: error}))
})

app.listen(process.env.PORT)

module.exports = app