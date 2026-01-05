const express = require('express');
const session = require('express-session');
const cors = require('cors');

const authRoutes = require('./routes/Auth.routes');
const clientRoutes = require('./routes/client.routes');
const userRoutes = require('./routes/users.routes');
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false
}));

// static files
app.use(express.static('public'));
//cors
app.use(cors({
  origin: 'http://localhost:5500', // <-- frontend origin (Live Server port)
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true              // <-- allow cookies/session
}));
//session
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }      // set to true only on HTTPS
}));
// routes
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/users', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
