const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');
const serverless = require('serverless-http');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Serve static files from the "public" folder
app.use(express.static('public'));

// Define your routes
app.get('/', (req, res) => {
  if (req.session.user) {
    res.send(`
      <h1>Welcome, ${req.session.user.username}!</h1>
      <a href="/logout">Logout</a>
    `);
  } else {
    res.sendFile(__dirname + '/index.html');
  }
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userRef = db.collection('users').doc(username);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.json({ success: false, message: 'User already exists!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userRef.set({
      username,
      password: hashedPassword
    });

    res.json({ success: true, message: 'User registered successfully!' });
  } catch (error) {
    res.json({ success: false, message: 'Failed to sign up.' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userRef = db.collection('users').doc(username);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.json({ success: false, message: 'User not found!' });
    }

    const userData = userDoc.data();
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res.json({ success: false, message: 'Invalid password!' });
    }

    req.session.user = { username };
    res.json({ success: true, message: 'Login successful!' });
  } catch (error) {
    res.json({ success: false, message: 'Failed to log in.' });
  }
});

// Export the serverless function
module.exports.handler = serverless(app);
