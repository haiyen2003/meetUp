const express = require('express');

const { Group, Membership, User, Venue, GroupImage, sequelize, Event, EventImage } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const router = express.Router();
const { Op } = require('sequelize');
const { check } = require('express-validator');
//Validate Venue:

const validateVenue = [
    check('address')
        .exists({ checkFalsy: true })
        .withMessage('Street address is required'),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    check('lat')
        .exists({ checkFalsy: true })
        .isDecimal({ min: -90.0, max: 90.0 })
        .withMessage('Latitude is not valid'),
    check('lng')
        .exists({ checkFalsy: true })
        .isDecimal({ min: -180.0, max: 180.0 })
        .withMessage('Longitude is not valid'),
    handleValidationErrors
]
//Edit a venue specified by its id
router.put('/:venueId', requireAuth, validateVenue, async (req, res, next) => {
    const userId = req.user.id;
    const { venueId } = req.params;
    let { address, city, state, lat, lng } = req.body;

    const thisVenue = await Venue.findByPk(venueId);
    if (!thisVenue) {
        const error = new Error("Venue couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    const thisGroup = await Group.findByPk(thisVenue.groupId);
    const thisUserStatus = await Membership.findOne({
        where: {
            groupId: thisVenue.groupId,
            userId: req.user.id
        }
    });
    if (!thisUserStatus) {
        throw new Error('Unauthorized');
    }
    if (thisGroup.origanizerId === userId || thisUserStatus.status === 'co-host') {
        if (address) thisVenue.address = address;
        if (city) thisVenue.city = city;
        if (state) thisVenue.state = state;
        if (lat) { thisVenue.lat = lat }
        if (lng) { thisVenue.lng = lng }
        await thisVenue.save();
        return res.json(thisVenue);
    }
})
module.exports = router;
