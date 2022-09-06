const express = require('express');

const { Group, Attendance, Membership, EventImage, User, Venue, GroupImage, sequelize, Event } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const router = express.Router();
const { Op } = require('sequelize');
const { check } = require('express-validator');

const validateEvent = [
    check('venueId')
        .exists({ checkFalsy: true })
        .withMessage('Venue does not exist'),
    check('name')
        .isLength({ min: 5 })
        .withMessage('Name must be at least 5 characters'),
    check('type')
        .exists({ checkFalsy: true })
        .isIn(['Online', 'In person'])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('capacity')
        .exists({ checkFalsy: true })
        .isInt()
        .withMessage("Capacity must be an integer"),
    check('price')
        .exists({ checkFalsy: true })
        .isDecimal()
        .withMessage("Price is invalid"),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage("Description is required"),
    check('startDate')
        .exists({ checkFalsy: true })
        .isAfter()
        .withMessage("Start date must be in the future"),
    check('endDate').custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
            throw new Error('End date is less than start date');
        }
        return true;
    }),
    handleValidationErrors
];

const validateQuery = [
    check('page')
        .isInt({ min: 1, max: 10 })
        .withMessage('Page must be greater than or equal to 0'),
    check('size')
        .isInt({ min: 1, max: 20 })
        .withMessage('Size must be greater than or equal to 0'),
    check('name')
        .isString()
        .optional()
        .withMessage('Name must be a string'),
    check('type')
        .isString()
        .optional()
        .withMessage("Type must be 'Online' or 'In Person'"),
    check('startDate')
        .isString()
        .optional()
        .withMessage("Start date must be a valid datetime"),
    handleValidationErrors
];
//get all Events
router.get('/', validateQuery, async (req, res, next) => {
    let pagination = {};
    let { page, size, name, type, startDate } = req.query;
    let where = {};

    if (name) where.name = name;
    if (type) where.type = type;
    if (startDate) where.startDate = startDate;
    page = page === undefined ? 0 : parseInt(page);
    size = size === undefined ? 20 : parseInt(size);
    if (size >= 1 && page >= 1) {
        pagination.limit = size;
        pagination.offset = size * (page - 1);
    }


    const allEvents = await Event.findAll({
        attributes: ['id', 'groupId', 'venueId', 'name', 'type', 'startDate', 'endDate'],
        include: [
            {
                model: Group,
                attributes: ['id', 'name', 'city', 'state'],

            },
            {
                model: Venue,
                attributes: ['id', 'city', 'state']
            }
        ],
        where,
        ...pagination,

    });

    for (let event of allEvents) {
        const attendant = await event.getAttendances({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'numAttending']
            ]
        });
        event.dataValues.numAttending = attendant[0].dataValues.numAttending;
        const previewImage = await EventImage.findOne({
            where: {
                [Op.and]: [
                    { eventId: event.id },
                    { preview: true }
                ]
            }
        });
        if (previewImage) {
            event.dataValues.previewImage = previewImage.dataValues.url
        }
    }
    return res.json({
        'Events': allEvents
    })
})

//get details of an Event specified by its id
router.get('/:eventId', async (req, res, next) => {
    const { eventId } = req.params;
    const thisEvent = await Event.findByPk(eventId, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        include: [
            {
                model: Group,
                attributes: ['id', 'name', 'private', 'city', 'state'],

            },
            {
                model: Venue,
                attributes: ['id', 'city', 'address', 'state', 'lat', 'lng']
            },
            {
                model: EventImage,
                attributes: ['id', 'url', 'preview']
            }
        ]
    })
    if (!thisEvent) {
        res.status(404);
        const error = new Error("Event couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }

    const attendant = await thisEvent.getAttendances({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'numAttending']
        ]
    });
    thisEvent.dataValues.numAttending = attendant[0].dataValues.numAttending;
    return res.json(
        thisEvent
    )
})

//Get all attendees of an Event specified by its id
router.get('/:eventId/attendees', async (req, res, next) => {
    const { eventId } = req.params;
    const thisEvent = await Event.findByPk(eventId);

    if (!thisEvent) {
        res.status(404);
        const error = new Error("Event couldnt be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    const thisGroupId = thisEvent.groupId;
    const thisGroup = await Group.findByPk(thisGroupId);

    if (!thisGroup) {
        res.status(404);
        const error = new Error("Group couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    if (req.user) {
        if (thisGroup.organizerId === req.user.id) {
            const thisEventAttendees = await User.findAll({
                attributes:
                    ['id', 'firstName', 'lastName'],
                include: {
                    model: Attendance,
                    as: 'Attendance',
                    where: { eventId },
                    attributes: ['status'],
                    required: true
                }
            });
            res.status(200);
            return res.json({
                'Attendees': thisEventAttendees
            })
        }
        else {
            const thisEventAttendees = await User.findAll({
                attributes: [
                    'id', 'firstName', 'lastName'
                ],
                include: {
                    model: Attendance,
                    as: 'Attendance',
                    where: {
                        eventId,
                        status: {
                            [Op.notIn]: ['pending']
                        }
                    },
                    attributes: ['status']
                }
            });
            res.status(200);
            return res.json({

                'Attendees': thisEventAttendees
            })
        }
    }
});

//add an image to event based on the event's id
router.post('/:eventId/images', requireAuth, async (req, res, next) => {
    let { eventId } = req.params;
    const thisUser = req.user;
    const userId = req.user.id;
    const { url, preview } = req.body;

    const thisEvent = await Event.findByPk(eventId);
    if (!thisEvent) {
        res.status(404);
        const error = new Error("Event couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    const validUser = await Attendance.findOne({
        where: { eventId: eventId, userId: req.user.id }
    })

    if (!validUser) {
        res.status(403);
        return res.json({
            "message": 'Forbidden - Unauthorized',
            "statusCode": 403
        })
    }
    if (validUser.status === 'member') {
        const newImage = await EventImage.create({
            eventId,
            url,
            preview
        });
        return res.json({
            'id': newImage.id,
            'url': newImage.url,
            'preview': newImage.preview
        })

    }
    else {
        res.status(403);
        return res.json({
            message: 'You are not an attendee of this event'
        })
    }
});

// Request to attend an Event based on the Event's Id
router.post('/:eventId/attendance', requireAuth, async (req, res, next) => {
    let { eventId } = req.params;
    const thisEvent = await Event.findByPk(eventId);

    if (!thisEvent) {
        res.status(404);
        const error = new Error("Event couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }

    const thisEventList = await Attendance.findAll({
        attributes: ['userId', 'status'],
        where: { eventId }
    });

    let thisEventArr = [];
    thisEventList.forEach(user => {
        thisEventArr.push([user.dataValues.userId, user.dataValues.status]);
    })

    for (let id of thisEventArr) {
        if (id[0] === req.user.id) {
            if (id[1] === 'pending') {
                const error = new Error("Attendance has already been requested");
                error.status = 400;
                return res.json({
                    'message': error.message,
                    'statusCode': error.status
                });
            }
            else if (id[1] === 'member' || id[1] === 'waitlist') {
                const error = new Error("User is already an attendee of the event");
                error.status = 400;
                return res.json({
                    'message': error.message,
                    'statusCode': error.status
                });
            }
        }
    }

    const userId = req.user.id;
    const newAttendee = await Attendance.create({
        eventId,
        userId,
        status: 'pending'
    });

    return res.json({
        'eventId': newAttendee.eventId,
        'userId': newAttendee.userId,
        'status': newAttendee.status
    })
})

//Edit an Event specified by its id

router.put('/:eventId', requireAuth, validateEvent, async (req, res, next) => {
    let { eventId } = req.params;
    const thisEvent = await Event.findByPk(eventId);
    if (!thisEvent) {
        res.status(404);
        const error = new Error("Event couldnt be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    const thisGroupId = thisEvent.groupId;
    const thisGroup = await Group.findByPk(thisGroupId);
    if (!thisGroup) {
        res.status(404);
        const error = new Error("Group couldnt be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
    const thisVenue = await Venue.findByPk(venueId);
    const userId = req.user.id;
    if (!thisVenue) {
        res.status(404);
        const error = new Error("Venue couldnt be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }

    const thisUserStatus = await Membership.findOne({
        where: { groupId: thisGroupId, userId }
    })

    if (!thisUserStatus) {
        res.status(403);
        return res.json({
            "message": 'Forbidden',
            "statusCode": 403
        })
    }

    if (thisGroup.organizerId === userId || thisUserStatus.status === 'co-host') {
        if (venueId) thisEvent.venueId = venueId;
        if (name) thisEvent.name = name;
        if (type) thisEvent.type = type;
        if (capacity) thisEvent.capacity = capacity;
        if (price) thisEvent.price = price;
        if (description) thisEvent.description = description;
        if (startDate) thisEvent.startDate = startDate;
        if (endDate) thisEvent.endDate = endDate;
        await thisEvent.save();
        return res.json({
            'id': thisEvent.id,
            'groupId': thisEvent.groupId,
            'venueId': thisEvent.venueId,
            'name': thisEvent.name,
            'type': thisEvent.type,
            'capacity': thisEvent.capacity,
            'price': thisEvent.price,
            'description': thisEvent.description,
            'startDate': thisEvent.startDate,
            'endDate': thisEvent.endDate
        });
    }
    else {
        res.status(403);
        return res.json({
            "message": 'Forbidden',
            "statusCode": 403
        })
    }
})

//Change the status of an attendance for an event specified by id

router.put('/:eventId/attendance', requireAuth, async (req, res, next) => {
    let { eventId } = req.params;
    let { userId, status } = req.body;

    const thisEvent = await Event.findByPk(eventId);
    if (!thisEvent) {
        res.status(404);
        const error = new Error("Event couldnt be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    const thisGroupId = thisEvent.groupId;
    const thisGroup = await Group.findByPk(thisGroupId);
    const currentUser = req.user;

    if (!currentUser) {
        res.status(400);
        const error = new Error("Current User must be the organizer or a co-host to change attendance status");
        error.status = 400;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }

    let thisAttendee = await Attendance.findOne({
        where: {
            userId,
            eventId
        }
    });
    if (!thisAttendee) {
        res.status(404);
        const error = new Error("Attendance between the user and the event does not exist");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    if (status === 'pending') {
        res.status(400);
        const error = new Error("Cannot change an attendance status to pending");
        error.status = 400;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    let currentStatus = await Membership.findOne({
        where: { userId: req.user.id, groupId: thisGroupId }
    });
    if (!currentStatus) {
        res.status(403);
        return res.json({
            "message": 'Forbidden',
            "statusCode": 403
        })
    }
    if (thisGroup.organizerId === req.user.id || currentStatus.status === 'co-host') {
        thisAttendee.status = status;
        await thisAttendee.save();
        return res.json({
            'id': thisAttendee.id,
            'eventId': thisAttendee.eventId,
            'userId': thisAttendee.userId,
            'status': thisAttendee.status
        });
    }
    else {
        res.status(403);
        return res.json({
            "message": 'Forbidden',
            "statusCode": 403
        })
    }
})

//Delete attendance to an event specified by id
router.delete('/:eventId/attendance', requireAuth, async (req, res, next) => {
    let { eventId } = req.params;
    let { userId } = req.body;
    const thisEvent = await Event.findByPk(eventId);
    if (!thisEvent) {
        res.status(404);
        const error = new Error("Event couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    const groupId = thisEvent.groupId;
    const thisGroup = await Group.findByPk(groupId);
    const currentUser = req.user;
    const thisAttendee = await Attendance.findOne({
        where: { eventId, userId: req.user.id }
    });
    if (!thisAttendee) {
        res.status(404);
        const error = new Error('Attendance does not exist for this User');
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    const currentStatus = await Membership.findOne({
        where: { groupId, userId: req.user.id }
    });

    if (thisGroup.organizerId === currentUser.id || currentUser.id === thisAttendee.userId || currentStatus.status === 'co-host') {
        await thisAttendee.destroy();
        res.status(200);
        return res.json({
            'message': "Successfully deleted attendance from event",
            'statusCode': 200
        })

    }
    else {
        res.status(403);
        const error = new Error("Only the User or organizer may delete an Attendance");
        error.status = 403;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
})

//Delete an Event specified by its id
router.delete('/:eventId', requireAuth, async (req, res, next) => {
    const { eventId } = req.params;
    const thisEvent = await Event.findByPk(eventId);

    if (!thisEvent) {
        res.status(404);
        const error = new Error("Event couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }

    const thisUser = await User.findByPk(req.user.id);
    const thisGroupId = thisEvent.groupId;
    const thisGroup = await Group.findByPk(thisGroupId);

    const currentStatus = await Membership.findOne({
        where: {
            groupId: thisGroupId,
            userId: req.user.id
        }
    });

    if (!currentStatus) {
        res.status(403);
        return res.json({
            "message": 'Forbidden',
            "statusCode": 403
        })
    }
    if (thisGroup.organizerId === req.user.id || currentStatus.status === 'co-host') {
        await thisEvent.destroy();
        res.status(200);
        return res.json({
            "message": "Successfully deleted",
            'statusCode': 200
        })
    } else {
        res.status(403);
        return res.json({
            "message": 'Forbidden',
            "statusCode": 403
        })
    }
})
module.exports = router;
