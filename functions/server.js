const functions = require('firebase-functions'); // Import Firebase Functions
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

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

// Route: Home Page
app.get('/', (req, res) => {
  if (req.session.user) {
    res.send(`
      <h1>Welcome, ${req.session.user.username}!</h1>
      <a href="/logout">Logout</a>
    `);
  } else {
    res.sendFile(__dirname + '/public/index.html');
  }
});

// Route: Sign-Up
app.post('/signup', async (req, res) => {
  console.log('Received sign-up request:', req.body); // Debugging log

  const { username, password } = req.body;

  try {
    // Check if the user already exists
    const userRef = db.collection('users').doc(username);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.send('User already exists! Please log in.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user info in Firestore
    await userRef.set({
      username,
      password: hashedPassword
    });

    res.send('User registered successfully! Please log in.');
  } catch (error) {
    console.error('Error during sign-up:', error.message);
    res.send('Failed to sign up.');
  }
});

// Route: Login
app.post('/login', async (req, res) => {
  console.log('Received login request:', req.body); // Debugging log

  const { username, password } = req.body;

  try {
    // Check if the user exists in Firestore
    const userRef = db.collection('users').doc(username);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.send('User not found! Please sign up.');
    }

    const userData = userDoc.data();
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res.send('Invalid password! Please try again.');
    }

    // Set user session
    req.session.user = { username };
    res.redirect('/base.html');
  } catch (error) {
    console.error('Error during login:', error.message);
    res.send('Failed to log in.');
  }
});

// Route: Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Error handling for unmatched routes
app.use((req, res) => {
  res.status(404).send('404: Page not found');
});

// Export the app as a Firebase Function
exports.server = functions.https.onRequest(app);
