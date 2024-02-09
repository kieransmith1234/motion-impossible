const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const sessionRouter = require('./routes/sessions');

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || "mongodb+srv://admin:Charlie.2022@cluster82431.owxe6ji.mongodb.net/sessions";
const sessionSecret = process.env.SESSION_SECRET || 'secrecy';

const mongoStore = MongoStore.create({
  mongoUrl: mongoUri,
});

// Middleware
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json()); // Parse incoming JSON requests

app.use(
  session({
    store: mongoStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60 * 1000,
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
});

// MongoDB Connection and Server Start
const startServer = async () => {
  try {
    const mongoClient = new MongoClient(mongoUri, {});
    await mongoClient.connect();

    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
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
    }, 5000);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

startServer();
