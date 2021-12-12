const express = require('express');
const Movies = require('../../models/movies/movieModel');
const Events = require('../../models/cinema/eventModel');
const router = express.Router();

const getMoviesWithEvents = async (req, res) => {
  const movies = await Movies.findAll();
  const events = await Events.findAll();

  const moviesWithEvents = movies
    .map((movie) => ({
      ...movie.dataValues,
      movieEvents: events.filter((event) => event.movieId === movie.id),
    }))
    .filter((movie) => movie.movieEvents.length);

  res.status(200).send(moviesWithEvents);
};

router.get('/', getMoviesWithEvents);

module.exports = router;
