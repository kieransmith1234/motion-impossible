// ./routes/sessions.js
const express = require('express');
const router = express.Router();
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

router.get('/create', (req, res) => {
  const userId = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
  req.session.userId = userId;
  
  res.status(200).json({
    message: 'New session created successfully',
    userId: userId,
  });
});

router.get('/destroy', (req, res) => {
  req.session.destroy();
  res.send('Session deleted');
});

module.exports = router;
