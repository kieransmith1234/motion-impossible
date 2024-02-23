// server.js
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const sessionRouter = require('./routes/sessions');
const port = 5000;
const app = express();
const mongoUri = "mongodb+srv://admin:Charlie.2022@cluster82431.owxe6ji.mongodb.net/sessions";
const sessionSecret = 'secrecy';
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const host = isProduction ? process.env.HOST_PRODUCTION : process.env.HOST_DEVELOPMENT;
const origin = isProduction ? process.env.ORIGIN_PRODUCTION : process.env.ORIGIN_DEVELOPMENT;

const mongoStore = MongoStore.create({
  mongoUrl: mongoUri,
});

// Middleware
app.use(
  cors({
    origin: origin,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: mongoStore,
    cookie: {
      originalMaxAge: 30 * 1000,
    },
  })
);

app.use((req, res, next) => {
  console.log(req.session);
  next();
});

// Routes
app.use('/sessions', sessionRouter);

app.get('/', (req, res) => {
  const userId = req.session.userId;
  res.send(userId || null);
});

app.get('/expiry', (req, res) => {
  const expiry = req.session.cookie._expires;
  res.send(expiry || null);
})

// MongoDB Connection and Server Start
const startServer = async () => {
  try {
    const mongoClient = new MongoClient(mongoUri, {});
    await mongoClient.connect();

    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server listening at ${host}`);
    });

    // Session Expiry Cleanup Logic
    setInterval(async () => {
      const currentTime = new Date();
      const sessions = await mongoClient
        .db()
        .collection('sessions')
        .find()
        .toArray();

      sessions.forEach((session) => {
        console.log(session);
        if (session.expires < currentTime) {
          mongoClient
            .db()
            .collection('sessions')
            .deleteOne({ _id: session._id });
        }
      });
    }, 30000);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

startServer();