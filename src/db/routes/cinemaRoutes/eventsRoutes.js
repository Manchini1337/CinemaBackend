const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const Events = require('../../models/cinema/eventModel');
const Movies = require('../../models/movies/movieModel');
const Genres = require('../../models/movies/genreModel');
const userTypes = require('../../../../consts');
const { Op } = require('sequelize');
const { verifyAccess } = require('../../../../jwtTokens/verifyToken');

router.get('/', (req, res) => {
  async function myFunc() {
    let newEvents = [];
    try {
      const events = await Events.findAll();
      const movies = await Movies.findAll();
      for (let i = 0; i < events.length; i++) {
        for (let j = 0; j < movies.length; j++) {
          const event = events[i].dataValues;
          const movie = movies[j].dataValues;
          if (event.movieId === movie.id) {
            const genre = await Genres.findOne({
              where: { id: movie.genreId },
            });

            delete event['movieId'];
            const newMovie = { ...movie, genre: genre.dataValues };
            delete newMovie.genreId;
            console.log(newMovie);
            newEvents.push({ ...event, movie: newMovie });
          }
        }
      }

      console.log(newEvents);
      res.statusCode = 200;
      res.json(newEvents);
    } catch (err) {
      console.log(err);
    }
  }
  myFunc();
});

router.post('/', (req, res) => {
  const data = verifyAccess(req, res);
  if (
    data &&
    (data.type === userTypes.ADMIN || data.type === userTypes.PERSONEL)
  ) {
    const startDate = Date.parse(req.body.startDate);
    const endDate = Date.parse(req.body.endDate);

    Events.create({
      movieId: req.body.movieId,
      startDate: startDate,
      endDate: endDate,
      seats: req.body.seats,
    })
      .then((result) => {
        res.statusCode = 200;
        res.json(result);
      })
      .catch((err) => {
        res.statusCode = 500;
        res.json({ ...err, message: 'Błąd jakiś' });
      });
  } else {
    res.sendStatus(403);
  }
});

router.put('/', (req, res) => {
  const data = verifyAccess(req, res);
  if (
    data &&
    (data.type === userTypes.ADMIN || data.type === userTypes.PERSONEL)
  ) {
    const startDate = Date.parse(req.body.startDate);
    const endDate = Date.parse(req.body.endDate);
    console.log(req.body, startDate, endDate);
    Events.update(
      {
        movieId: req.body.movieId,
        startDate,
        endDate,
        seats: req.body.seats,
      },
      { where: { id: req.body.id } }
    )
      .then((result) => {
        res.statusCode = 200;
        res.json(result);
      })
      .catch((err) => {
        res.statusCode = 500;
        res.json({ ...err, message: 'Błąd serwera' });
      });
  } else {
    res.sendStatus(403);
  }
});

router.delete('/', (req, res) => {
  const data = verifyAccess(req, res);
  if (
    data &&
    (data.type === userTypes.ADMIN || data.type === userTypes.PERSONEL)
  ) {
    Events.destroy({ where: { id: req.body.id } })
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        res.statusCode = 500;
        res.send(err);
      });
  }
});
module.exports = router;
