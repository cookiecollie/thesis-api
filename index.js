const express = require("express")
const cors = require("cors")
const axios = require("axios")
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

app.post("/api/user", (req, res) => {
    res.json({code: res.statusCode, data: req.body})
})

app.listen(process.env.PORT)

module.exports = app