const express = require("express");
const router = require("./routes")

const app = express();

app.use(express.json());

app.use((req,res,next)=>{
    console.log(`${req.method} ${req.path}`)
    // console.log(req.path)
    next()
})

app.use("/", router)
// app.use("/test", router)
module.exports = app;