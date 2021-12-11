const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const Users = require('../../models/accounts/userModel');
const bcrypt = require('bcrypt');
const saltRounds = 2;
const userTypes = require('../../../../consts');
const {
  createAccessToken,
  createRefreshToken,
} = require('../../../../jwtTokens/createToken');
const {
  verifyAccess,
  checkCookies,
  invalidateTokens,
} = require('../../../../jwtTokens/verifyToken');

router.get('/', (req, res) => {
  const data = verifyAccess(req, res);

  if (data) {
    Users.findAll()
      .then((users) => {
        res.statusCode = 200;
        res.json(users);
      })
      .catch((err) => res.json({ ...err, message: 'Błąd serwera' }));
  } else {
    checkCookies(req, res);
  }
});

router.get('/data', (req, res) => {
  const data = verifyAccess(req, res);

  if (data) {
    Users.findOne({ where: { id: data?.id } })
      .then((user) => {
        res.statusCode = 200;
        delete user.dataValues['password'];
        res.json(user.dataValues);
      })
      .catch((err) => {
        res.statusCode = 500;
        res.json({ ...err, message: 'Błąd serwera1' });
      });
  } else {
    checkCookies(req, res);
  }
});

router.post('/', (req, res) => {
  Users.findOne({ where: { username: req.body.username } })
    .then((user) => {
      if (user) {
        res.statusCode = 400;
        res.json({ message: 'Nazwa uzytkownika jest zajęta' });
      } else {
        bcrypt
          .hash(req.body.password, saltRounds)
          .then((hash) => {
            if (!req.body.type) {
              Users.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
                username: req.body.username,
                password: hash,
                type: userTypes.USER,
              })
                .then((result) => {
                  res.statusCode = 201;
                  delete result.dataValues['password'];

                  res.send(result.dataValues);
                })
                .catch((err) => {
                  res.statusCode = 500;
                  res.json({ ...err, message: 'Błąd serwera1' });
                });
            } else {
              Users.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
                username: req.body.username,
                password: hash,
                type: req.body.type.toUpperCase(),
              })
                .then((result) => {
                  res.statusCode = 201;
                  delete result.dataValues['password'];

                  res.send(result.dataValues);
                })
                .catch((err) => {
                  res.statusCode = 500;
                  res.json({ ...err, message: 'Błąd serwera2' });
                });
            }
          })
          .catch((err) => {
            res.statusCode = 500;
            res.json({ ...err, message: 'Błąd serwera3' });
          });
      }
    })
    .catch((err) => {
      res.statusCode = 500;
      res.json({ ...err, message: 'Błąd serwera' });
    });
});

router.put('/', (req, res) => {
  const data = verifyAccess(req, res);
  if (!data) {
    checkCookies(res, req);
  }
  if (data && data.id === req.body.id) {
    if (req.body.password) {
      bcrypt
        .hash(req.body.password, saltRounds)
        .then((hash) => {
          Users.update(
            {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              phoneNumber: req.body.phoneNumber,
              email: req.body.email,
              username: req.body.username,
              password: hash,
            },
            { where: { id: req.body.id } }
          )
            .then((result) => {
              console.log('console log result: ', result);
              res.statusCode = 200;
              res.send('Pomyślnie zaaktualizowano dane.');
            })
            .catch((err) => {
              console.log('blad console log error: ', err);
              res.statusCode = 500;
              res.json({ ...err, message: 'Błąd serwera' });
            });
        })
        .catch((err) => {
          console.log('blad hashu update', err);
        });
    } else {
      Users.update(
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          email: req.body.email,
          username: req.body.username,
        },
        { where: { id: req.body.id } }
      )
        .then((result) => {
          console.log('console log result: ', result);
          res.statusCode = 200;

          res.send('Pomyślnie zaaktualizowano dane.');
        })
        .catch((err) => {
          console.log('blad console log error: ', err);
          res.statusCode = 500;
          res.json({ ...err, message: 'Błąd serwera' });
        });
    }
  } else {
    checkCookies(req, res);
  }
});

router.post('/login', (req, res) => {
  Users.findOne({ where: { username: req.body.username } })
    .then((data) => {
      bcrypt
        .compare(req.body.password, data.password)
        .then((result) => {
          if (result === true) {
            console.log(data);
            const accessToken = createAccessToken(data.id, data.type);
            const refreshToken = createRefreshToken(data.id, data.type);
            res.statusCode = 200;
            res.cookie('access-token', accessToken, {
              expires: new Date(Date.now() + 900000),
              httpOnly: true,
            });
            res.cookie('refresh-token', refreshToken, {
              expires: new Date(Date.now() + 604800000),
              httpOnly: true,
            });
            delete data.dataValues['password'];

            res.send(data.dataValues);
          } else {
            res.statusCode = 401;
            res.json({ message: 'Nieprawidłowe dane logowania1' });
          }
        })
        .catch(() => {
          res.statusCode = 401;
          res.json({ message: 'Nieprawidłowe dane logowania2' });
        });
    })
    .catch(() => {
      res.statusCode = 401;
      res.send('Nieprawidłowe dane logowania');
    });
});

router.post('/logout', (req, res) => {
  console.log(req.cookies['access-token']);
  checkCookies(req, res);
});

module.exports = router;
