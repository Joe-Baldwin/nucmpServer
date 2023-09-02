const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();


favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, async (req, res, next) => {
    try {
        const favorite = await Favorite.findOne({ user: req.user._id }).populate('user').populate('campsites');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    } catch (err) {
        next(err);
    }
})
.post(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
        let favorite = await Favorite.findOne({ user: req.user._id });
        if (favorite) {
            req.body.forEach(campsite => {
                if (!favorite.campsites.includes(campsite._id)) {
                    favorite.campsites.push(campsite._id);
                }
            });
            await favorite.save();
        } else {
            favorite = await Favorite.create({ user: req.user._id, campsites: req.body.map(campsite => campsite._id) });
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    } catch (err) {
        next(err);
    }
})
.delete(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
        const favorite = await Favorite.findOneAndDelete({ user: req.user._id });
        if (favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.');
        }
    } catch (err) {
        next(err);
    }
});


favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorites/' + req.params.campsiteId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
        let favorite = await Favorite.findOne({ user: req.user._id });
        if (favorite) {
            if (favorite.campsites.includes(req.params.campsiteId)) {
                res.statusCode = 200;
                res.end('That campsite is already in the list of favorites!');
                return;
            }
            favorite.campsites.push(req.params.campsiteId);
            await favorite.save();
        } else {
            favorite = await Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] });
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    } catch (err) {
        next(err);
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/' + req.params.campsiteId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, async (req, res, next) => {
    try {
        const favorite = await Favorite.findOne({ user: req.user._id });
        if (favorite) {
            const index = favorite.campsites.indexOf(req.params.campsiteId);
            if (index >= 0) {
                favorite.campsites.splice(index, 1);
                await favorite.save();
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.');
        }
    } catch (err) {
        next(err);
    }
});

module.exports = favoriteRouter;
