/* -------IMPORTS-------*/
import MongoStore from 'connect-mongo';
import express from 'express'
import exphbs from "express-handlebars";
import session from 'express-session';
import morgan from "morgan";
import { Server as SocketServer } from "socket.io";
import http from "http";
import viewsRouter from "./routes/view.routes.js";
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import chatRouter from "./routes/chat.routes.js"
import sessionsRouter from "./routes/sessions.routes.js";
import websockets from "./websockets/websockets.js";
import { connectMongo } from "./config/configMongoDB.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import initPassport from "./config/passport.config.js";
import "./config/passport.config.js";
import { __dirname } from "./config.js";

/*-------CONFIG BASICAS Y CONEXION A BD-------*/
const app = express();
const PORT = 8080;
connectMongo();

/*-------SETTING MIDDLEWARES-------*/
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

/*-------SETTING HANDLEBARS-------*/
app.engine ('handlebars', exphbs.engine());
app.set('views',__dirname + "/views");
app.set("view engine", "handlebars");

/*-------SERVIDORES-------*/
const httpServer = http.createServer(app);
const io = new SocketServer(httpServer);
websockets(io);
const server = httpServer.listen(PORT, () =>
  console.log(
    `Server started on port ${PORT}. at ${new Date().toLocaleString()}`
  )
);
server.on("error", (err) => console.log(err));

/*-------SESSION-------------*/
app.use(cookieParser("mySecret"));

app.use(
  session({
    store: MongoStore.create({  
       mongoUrl: 'mongodb+srv://martinwittmann90:iC00uo5o@projectmartinwittmann.l8a7l5b.mongodb.net/ecommerce?retryWrites=true&w=majority', 
       mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
       ttl: 7200 
      }),
    secret: 'secretCoder',
    resave: true,
    saveUninitialized:true
})
);
/*-------PASSPORT-------------*/
initPassport();
app.use(passport.initialize());
app.use(passport.session());

/*-------PLANTILLAS-------*/
app.use('/', viewsRouter); 
app.use('/realtimeproducts', viewsRouter); 
app.use('/products', viewsRouter);
app.use("/chat", chatRouter);
/*-------END POINTS-------*/
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.get('/*', async (req, res) => {
  res.render("notfound");
})