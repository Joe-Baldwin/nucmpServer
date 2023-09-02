const express = require('express');
const partnerRouter = express.Router();
const Partner = require('../models/partner');
const Promotion = require('../models/promotion');
const authenticate = require('../authenticate');

partnerRouter.route('/')
    
    .get((req, res, next) => {
        Partner.find({})
            .then(partners => {
                res.status(200).json(partners);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
        Partner.create(req.body)
            .then(partner => {
                console.log('Partner Created: ', partner);
                res.status(201).json(partner);
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser,(req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /partners');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
        Partner.deleteMany({})
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => next(err));
    });

partnerRouter.route('/:partnerId')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res, next) => {
        Partner.findById(req.params.partnerId)
            .then(partner => {
                res.status(200).json(partner);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser,(req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /partners/${req.params.partnerId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
        Partner.findByIdAndUpdate(req.params.partnerId, { $set: req.body }, { new: true })
            .then(partner => {
                res.status(200).json(partner);
            })
            .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
        Partner.findByIdAndDelete(req.params.partnerId)
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => next(err));
    });

module.exports = partnerRouter;
