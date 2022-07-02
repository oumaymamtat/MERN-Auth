const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// set up server 
const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`listening at ${PORT}`));

// parse json text in body requests into object  to use inside router.req
app.use(express.json())

//connect DB
mongoose.connect(process.env.MDB_CONNECT,{
    useNewUrlParser:true,
    useUnifiedTopology:true
},(err)=>{
    if(err) return console.error(err);
    console.log("connected to mongodb");
})

// setup routes
app.use("/auth",require("./routers/userRouter"));
app.use("/customer",require("./routers/customerRouter"));