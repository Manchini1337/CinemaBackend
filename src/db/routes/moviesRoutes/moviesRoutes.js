const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const Movies = require('../../models/movies/movieModel');
const Genres = require('../../models/movies/genreModel');
const { verifyAccess } = require('../../../../jwtTokens/verifyToken');
const userTypes = require('../../../../consts');

router.get('/', (req, res) => {
  async function myFunc() {
    let newMovies = [];
    try {
      const movies = await Movies.findAll();
      movies.reverse();

      for (let i = 0; i < movies.length; i++) {
        console.log('movies: ', movies[i].dataValues);
        const genre = await Genres.findOne({
          where: { id: movies[i].dataValues.genreId },
        });
        // if genre else res.statuscode 500 brak filmu
        console.log('genre: ', genre);
        delete movies[i].dataValues['genreId'];

        const newMovie = {
          ...movies[i].dataValues,
          genre: genre.dataValues,
        };
        newMovies.push(newMovie);
      }

      console.log(newMovies);
      res.statusCode = 200;
      res.json(newMovies);
    } catch (error) {
      res.statusCode = 500;
      res.send('Unallowed');
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
    Movies.create({
      name: req.body.name,
      description: req.body.description,
      trailerUrl: req.body.trailerUrl,
      genreId: req.body.genreId,
      poster: req.body.poster,
      background: req.body.background,
    })
      .then((movie) => {
        res.statusCode = 201;
        res.json(movie);
      })
      .catch((err) => {
        res.statusCode = 500;
        res.json(err);
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
    Movies.update(
      {
        name: req.body.name,
        description: req.body.description,
        trailerUrl: req.body.trailerUrl,
        genreId: req.body.genreId,
        poster: req.body.poster,
        background: req.body.background,
      },
      { where: { id: req.body.id } }
    )
      .then(() => {
        res.statusCode = 200;
        res.send('Edycja zakończona poprawnie');
      })
      .catch(() => {
        res.statusCode = 500;
        res.send('Edycja nie udała się');
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
    Movies.destroy({ where: { id: req.body.id } })
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        res.statusCode = 500;
        res.send(err);
      });
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;
