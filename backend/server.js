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

const mongoStore = MongoStore.create({
  mongoUrl: mongoUri,
});

// Middleware
app.use(
  cors({
    origin: `${process.env.ORIGIN}`,
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    store: mongoStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 1000,
    },
  })
);

// Routes
app.use('/sessions', sessionRouter);

app.get('/', (req, res) => {
  const userId = req.session.userId;
  res.send(userId || null);
});

app.get('/get_expiry', (req, res) => {
  const expiry = req.session.cookie._expires;
  res.send(expiry || null);
})

function get_host(env) {
  var host = '';
  if (env === 'development') {
    host = `${process.env.HOST_DEV}`;
  }
  
  if (env === 'production') {
    host = `${process.env.HOST_PRODUCTION}`;
  }

  console.log(host, env);
  return host;
}

// MongoDB Connection and Server Start
const startServer = async () => {
  try {
    const mongoClient = new MongoClient(mongoUri, {});
    await mongoClient.connect();

    console.log("Connected to MongoDB");

    const host = get_host(process.env.NODE_ENV);

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
