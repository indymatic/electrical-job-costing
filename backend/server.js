// We’re getting our magic helpers to make the app work
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

// Add CORS helper to let the playhouse talk to the magic door
app.use(cors());

// This helper lets us understand messages from the app
app.use(express.json());

// This is the special line that talks to the toy box (MongoDB)
mongoose.connect('mongodb+srv://indymatic:Charly7231!@cluster0.qf37zwn.mongodb.net/electrical-job-costing?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// This is a blueprint for a friend in the MongoDB toy box
const friendSchema = new mongoose.Schema({
  username: String,
  password: String
});
const Friend = mongoose.model('Friend', friendSchema);

// This is a little test to see if our magic door works
app.get('/api', (req, res) => {
  res.send('Backend is running!');
});

// This is a trick to let friends log in by checking the toy box
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("Received from playhouse:", { username, password });

  // Look in the toy box for a friend with this username and password
  const friend = await Friend.findOne({ username: username, password: password });
  console.log("Found friend in toy box:", friend);

  if (friend) {
    res.send('Welcome, friend! You can come in! 🎉');
  } else {
    res.status(401).send('Sorry, I don’t know you! Try again.');
  }
});

// This opens the magic door at a special number (5000)
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});