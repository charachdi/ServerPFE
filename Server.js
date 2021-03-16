const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const app = express()
const Port = process.env.PORT || 3001
const db = require('./models')
const dotenv = require("dotenv");
app.use(express.static('uploads/'));


// midellware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'))
dotenv.config();
app.use(cors())


//Router 
const userRouter = require('./Route/UsersRoute')
const authRouter = require('./Route/authRoute')
const equipeRoute = require('./Route/equipeRoute')
const serviceRoute = require('./Route/serviceRoute')
const compteCliRoute = require('./Route/compteCliRoute')


app.use('/user',userRouter)
app.use('/auth',authRouter)
app.use('/equipe',equipeRoute)
app.use('/service',serviceRoute)
app.use('/clients',compteCliRoute)

db.sequelize.sync().then(() => {
    app.listen(Port , ()=>{
        console.log(`server is running on ${Port}`)
    })
  });




