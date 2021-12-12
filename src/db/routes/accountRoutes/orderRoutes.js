const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const Orders = require('../../models/accounts/orderModel');
const Movies = require('../../models/movies/movieModel');
const Events = require('../../models/cinema/eventModel');
const Users = require('../../models/accounts/userModel');
const { verifyAccess } = require('../../../../jwtTokens/verifyToken');
const userTypes = require('../../../../consts');
const EventModel = require('../../models/cinema/eventModel');

router.get('/', (req, res) => {
  const data = verifyAccess(req, res);

  if (data && data.type === userTypes.USER) {
    async function myFunc() {
      let newOrders = [];
      try {
        const orders = await Orders.findAll({ where: { userId: data.id } });
        orders.reverse();

        for (let i = 0; i < orders.length; i++) {
          console.log('orders: ', orders[i].dataValues);
          const event = await Events.findOne({
            where: { id: orders[i].dataValues.eventId },
          });
          const user = await Users.findOne({
            where: { id: orders[i].dataValues.userId },
          });
          const movie = await Movies.findOne({
            where: { id: event.dataValues.movieId },
          });

          delete orders[i].dataValues['userId'];
          delete orders[i].dataValues['eventId'];

          const newEvent = { ...event.dataValues, movie };
          delete newEvent.movieId;
          console.log('New event:' + newEvent);

          const newOrder = {
            ...orders[i].dataValues,
            user: user?.dataValues || null,
            event: newEvent || null,
          };
          newOrders.push(newOrder);
        }

        console.log(newOrders);
        res.statusCode = 200;
        res.json(newOrders);
      } catch (error) {
        res.statusCode = 500;
        res.send('Unallowed');
      }
    }
    myFunc();
  }
  if (
    (data && data.type === userTypes.PERSONEL) ||
    (data && data.type === userTypes.ADMIN)
  ) {
    async function myFunc() {
      let newOrders = [];
      try {
        const orders = await Orders.findAll();
        orders.reverse();

        for (let i = 0; i < orders.length; i++) {
          console.log('orders: ', orders[i].dataValues);
          const event = await Events.findOne({
            where: { id: orders[i].dataValues.eventId },
          });
          const user = await Users.findOne({
            where: { id: orders[i].dataValues.userId },
          });
          const movie = await Movies.findOne({
            where: { id: event.dataValues.movieId },
          });

          delete orders[i].dataValues['userId'];
          delete orders[i].dataValues['eventId'];

          const newEvent = { ...event.dataValues, movie };
          delete newEvent.movieId;
          console.log('New event:' + newEvent);

          const newOrder = {
            ...orders[i].dataValues,
            user: user?.dataValues || null,
            event: newEvent || null,
          };
          newOrders.push(newOrder);
        }

        console.log(newOrders);
        res.statusCode = 200;
        res.json(newOrders);
      } catch (error) {
        res.statusCode = 500;
        res.send('Unallowed');
      }
    }
    myFunc();
  }
});

router.get('/:id/', (req, res) => {
  res.sendStatus(403);
});

router.get('/:id/:email', (req, res) => {
  console.log(req.params.id);
  console.log(req.params.email);
  if (req.params.id && req.params.email) {
    Orders.findOne({ where: { id: req.params.id, email: req.params.email } })
      .then((order) => {
        Events.findOne({ where: { id: order.dataValues.eventId } })
          .then((event) => {
            delete order.dataValues['userId'];
            delete order.dataValues['eventId'];
            const newOrder = {
              ...order.dataValues,
              event: event?.dataValues || null,
            };
            res.statusCode = 200;
            res.json(newOrder);
          })
          .catch((err) => {
            res.statusCode = 500;
            res.send('Unallowed');
          });
      })
      .catch((err) => {
        res.statusCode = 401;
        res.json(err);
      });
  } else {
    res.sendStatus(403);
  }
});

router.post('/', (req, res) => {
  Orders.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    userId: req.body.userId,
    eventId: req.body.eventId,
    isPaid: false,
    isCancelled: false,
    seatId: JSON.stringify(req.body.seatId),
  })
    .then((result) => {
      Events.findOne({ where: { id: req.body.eventId } })
        .then((event) => {
          const seats = JSON.parse(event.dataValues.seats);

          const orderSeats = req.body.seatId;

          let newSeats = seats;
          orderSeats.forEach((orderSeat) => {
            newSeats = newSeats.map((seat) =>
              seat.id === orderSeat.id ? { ...seat, isAvailable: false } : seat
            );
          });
          event.update({ ...event.dataValues, seats: newSeats });
          res.statusCode = 201;
          res.send(result);
        })
        .catch((err) => console.log(err));

      // res.statusCode = 201;
      // res.json(result);
    })
    .catch((err) => {
      res.statusCode = 500;
      res.json(err);
    });
});

router.put('/', (req, res) => {
  const data = verifyAccess(req, res);

  if (
    (data && data.type === userTypes.PERSONEL) ||
    (data && data.type === userTypes.ADMIN)
  ) {
    Orders.update(
      {
        isPaid: req.body.isPaid,
        isCancelled: req.body.isCancelled,
      },
      { where: { id: req.body.id } }
    )
      .then((result) => {
        res.statusCode = 200;
        res.json(result);
      })
      .catch((err) => {
        res.statusCode = 500;
        res.json(err);
      });
  } else {
    res.sendStatus(401);
  }
});

module.exports = router;
