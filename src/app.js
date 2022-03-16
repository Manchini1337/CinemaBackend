const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db/config/database');
const cookieParser = require('cookie-parser');

//Body parser
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Db connection
// db.sync({ force: true })
//   .then(() => console.log('Authenticated'))
//   .catch((err) => console.log(err));

db.authenticate()
  .then(() => console.log('Authenticated'))
  .catch((err) => console.log(err));

//Routes
app.use('/users', require('./db/routes/accountRoutes/userRoutes'));
app.use('/orders', require('./db/routes/accountRoutes/orderRoutes'));

app.use('/movies', require('./db/routes/moviesRoutes/moviesRoutes'));
app.use('/genres', require('./db/routes/moviesRoutes/genresRoutes'));
app.use(
  '/moviesevents',
  require('./db/routes/moviesRoutes/moviesWithEventsRoutes')
);

app.use('/seats', require('./db/routes/cinemaRoutes/seatsRoutes'));
app.use('/events', require('./db/routes/cinemaRoutes/eventsRoutes'));
app.listen(8080, () => console.log('App is running...'));
