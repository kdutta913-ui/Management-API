const express = require("express");
const router = require("./routes/index")
const errorHandler = require('../src/middleware/error.middleware')

const app = express();

app.use(express.json());

app.use((req,res,next)=>{
    console.log(`${req.method} ${req.path}`)
    next()
})

app.use("/", router)

app.use(errorHandler)
module.exports = app;