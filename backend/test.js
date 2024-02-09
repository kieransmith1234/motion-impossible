const session = require('express-session');
const MongoStore = require('connect-mongo');
const express = require('express');
const mongoose = require('mongoose');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const app = express();
const port = 5000;

mongoose.connect('mongodb+srv://admin:Charlie.2022@cluster82431.owxe6ji.mongodb.net/sessions', {});

const mongoStore = MongoStore.create({
  mongoUrl: 'mongodb+srv://admin:Charlie.2022@cluster82431.owxe6ji.mongodb.net/sessions'
});

const sessionRouter = require('./routes/sessions');

app.use('/sessions', sessionRouter);

app.use(session({
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://admin:Charlie.2022@cluster82431.owxe6ji.mongodb.net/sessions'}),
    secret: 'Charlie.2022'
}));

app.get('/new-session', (req, res) => {
  req.session.userId = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
  res.send('New session created');
});

app.get('/delete-session', (req, res) => {
  req.session.destroy();
  res.send('Session deleted');
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Garbage collection
setInterval(() => {
  mongoStore.all((err, sessions) => {
    if (err) {
      console.error('Error while running garbage collection:', err);
      return;
    }
    sessions.forEach((session) => {
      if (session.expires < Date.now()) {
        mongoStore.destroy(session.id);
      }
    });
  });
}, 60 * 60 * 1000); // Run garbage collection every hour