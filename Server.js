const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const app = express()
const Port = process.env.PORT || 3001
const db = require('./models')
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
app.use(express.static('uploads/'));


const {connection} = require('./Socket/socket')


// midellware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'))
dotenv.config();
app.use(cors())

db.sequelize.sync()

const server = http.createServer(app);
const io = socketIo(server);
exports.server = server
exports.io = io

io.on("connection", (socket) => {
  console.log("New client connected");
  exports.socket = socket
  //Here we listen on a new namespace called "incoming data"
  // socket.on("incoming data", (data)=>{
  //     //Here we broadcast it out to all other sockets EXCLUDING the socket which sent us the data
  //    socket.broadcast.emit("outgoing data", {num: data});
  // });
  //A special namespace "disconnect" for when a client disconnects
  socket.on("disconnect", () => console.log("Client disconnected"));
});


//Router 
const userRouter = require('./Route/UsersRoute')
const authRouter = require('./Route/authRoute')
const equipeRoute = require('./Route/equipeRoute')
const serviceRoute = require('./Route/serviceRoute')
const compteCliRoute = require('./Route/compteCliRoute')
const PermissionRoute = require('./Route/PermissionRoute')
const ImportRoute = require('./Route/ImportRoute')
const StatRoute = require('./Route/StatRoute')


app.use('/user',userRouter)
app.use('/auth',authRouter)
app.use('/equipe',equipeRoute)
app.use('/service',serviceRoute)
app.use('/clients',compteCliRoute)
app.use('/permission',PermissionRoute)
app.use('/Import',ImportRoute)
app.use('/stat',StatRoute)


// connection()
server.listen(Port, () => console.log(`Listening on port ${Port}`));





