const express = require('express');

const { Group, Attendance, Membership, EventImage, User, Venue, GroupImage, sequelize, Event } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const router = express.Router();
const { Op } = require('sequelize');

//get all Events
router.get('/', async (req, res, next) => {
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
        ]

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
                include: [{
                    model: Attendance,
                    as: 'Attendance',
                    where: { eventId },
                    attributes: ['status'],
                    required: true
                }]
            });



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
        const error = new Error("Event couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    const validUser = await Attendance.findOne({
        where: { eventId, userId }
    })
    if (!validUser) {
        throw new Error('Unauthorized');
    }
    else if (validUser.status === 'member') {
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
        return res.json({
            message: 'You are not an attendee of this event'
        })
    }
})

module.exports = router;
