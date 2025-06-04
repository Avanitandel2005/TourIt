const express = require('express');
const app = express();
const mongoose = require('mongoose');
const user = require('./schema');
const session = require('express-session');
const { initializePassport } = require('./passportconfigure');
const passport = require('passport');
const bcrypt = require('bcryptjs'); // For password hashing

mongoose.connect('mongodb://127.0.0.1:27017/Avani')
  .then(() => { console.log('MongoDB is Connected') })
  .catch((err) => { console.log('Problem connecting to MongoDB', err) });

const fs = require('fs');
const path = require('path');

// app.use(express.static('views'));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
initializePassport(passport);

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});


// 
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.get('/about', (req, res) => {
  res.sendFile(__dirname + '/views/about.html');
});

app.get('/home', checkAuthenticated, (req, res) => {
  res.sendFile(__dirname + '/views/index.html'); // Only show if logged in
});

app.use(express.urlencoded({ extended: true }));

// POST route for registering a new user
app.post('/about', (req, res) => {
  const { fullname, email, Username, password, mobilenumber } = req.body;

  // Check if all required fields are provided
  if (!fullname || !email || !Username || !password || !mobilenumber) {
    return res.status(400).send('All fields are required');
  }

  // Check if the mobile number already exists in the database
  user.findOne({ mobilenumber: mobilenumber })
    .then(existingUser => {
      if (existingUser) {
        // If the mobile number already exists, send an error message
        return res.status(400).send('Mobile number already exists');
      }

      // Hash the password before saving
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send('Error hashing password');

        // Proceed to create and save the new user
        const Newuser = new user({
          fullname: req.body.fullname,
          email: req.body.email,
          Username: req.body.Username,
          password: hashedPassword,
          mobilenumber: req.body.mobilenumber,
        });

        // Save the new user to the database
        Newuser.save()
          .then(() => {
            res.redirect('/login'); // Redirect to login after successful registration
          })
          .catch((err) => {
            res.status(500).send('Error saving data: ' + err.message); // Handle save errors
          });
      });
    })
    .catch(err => {
      res.status(500).send('Error checking mobile number: ' + err.message);
    });
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/views/login.html');
});
app.get('/contact', (req, res) => {
  res.sendFile(__dirname + '/views/contact.html');
});


app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // Show message from 'info.message'
      return res.send(`<h2>Login failed: ${info.message}</h2><a href="/login">Try again</a>`);
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/home');
    });
  })(req, res, next);
});

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log('Contact Form Data:', { name, email, message });
  res.send('Thank you for contacting us!');
});

// Start the server
app.listen(8000, () => {
  console.log("Server is running at http://localhost:8000");
});
