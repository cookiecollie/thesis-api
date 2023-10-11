const express = require("express")
const cors = require("cors")
const axios = require("axios")
const { auth, db, storage } = require("./firebase")
const { signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail } = require("firebase/auth")
const { ref: dbRef, get, child, set } = require("firebase/database")
const { ref: stRef, uploadBytes, uploadString } = require("firebase/storage")
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

const storageRef = stRef(storage)
const databaseRef = dbRef(db)

app.post("/api/users", async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const base64Email = req.body.base64Email

    await set(dbRef(db, `users/${base64Email}`), {
        email: email,
        password: password
    })

    await createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
        res.json({code: axios.HttpStatusCode.Ok})
    }).catch((error) => {
        res.json({errorCode: error.code, message: error.message})
    })
})

app.post("/api/user/:email", async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    await signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        const user = userCredential.user
        user.getIdToken(true).then(token => {
            res.json({code: axios.HttpStatusCode.Ok, userToken: token})
        })
    }).catch((error) => {
        res.json({code: error.code, message: error.message})
    })
})

app.get("/api/users/:email", async (req, res) => {
    const base64Email = req.params.email
    const email = Buffer.from(base64Email, "base64").toString("utf-8")

    await get(child(databaseRef, `users/${base64Email}`)).then((value) => {
        if (value.exists()) {
            res.json({code: axios.HttpStatusCode.Ok, message: `User existed! | ${email}`})
        } else {
            res.json({code: axios.HttpStatusCode.NotFound, message: `User not existed! | ${email}`})
        }
    }).catch(error => res.json({code: error.code, message: error.message, fullError: error}))
})

app.post("/api/user/:email/project/:project", async (req, res) => {
    const base64Email = req.params.email
    const projName = req.params.project

    const saveLocationRef = stRef(storage, `${base64Email}/${projName}.json`)

    uploadString(saveLocationRef, JSON.stringify(req.body.project)).then(() => {
        res.json({code: axios.HttpStatusCode.Ok, message: "Upload successfully!"})
    }).catch((error) => {
        res.json({code: error.code, message: error.message})
    })
})

app.listen(process.env.PORT)

module.exports = app