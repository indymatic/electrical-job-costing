// We’re getting our magic helpers to make the app work
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = express();

// This helper lets us understand messages from the app
app.use(express.json());

// This is the special line that talks to the toy box (MongoDB)
// We’ll change the secret code in a minute!
mongoose.connect('mongodb+srv://admin:MySecurePass123@cluster0.mongodb.net/electrical-job-costing?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));// This is a little test to see if our magic door works
app.get('/api', (req, res) => {
  res.send('Backend is running!');
});

// This opens the magic door at a special number (5000)
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});