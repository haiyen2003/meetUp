const express = require('express');

const { Group, Membership, User, Venue, GroupImage, sequelize, Event, EventImage } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, restoreUser, requireAuth } = require('../../utils/auth');
const router = express.Router();
const { Op } = require('sequelize');
const { check } = require('express-validator');

//Delete an image for a group
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const { imageId } = req.params;
    const thisGroupImage = await GroupImage.findByPk(imageId);
    if (!thisGroupImage) {
        res.status(404);
        const error = new Error("Group Image couldn't be found");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }
    const thisGroupId = thisGroupImage.groupId;

    const thisGroup = await Group.findByPk(thisGroupId);
    if (!thisGroup) {
        res.status(404);
        const error = new Error("Cannot found relationship between group and image");
        error.status = 404;
        return res.json({
            'message': error.message,
            'statusCode': error.status
        });
    }

    if (thisGroup.organizerId === req.user.id) {
        await thisGroupImage.destroy();
        res.status(200);
        return res.json({
            'message': "Successfully deleted",
            'statusCode': 200
        })
    }

    const currentStatus = await Membership.findOne({
        where: {
            groupId: thisGroupId,
            userId: req.user.id
        }
    })

    if (!currentStatus) {
        res.status(403);
        return res.json({
            "message": 'Forbidden - No relationship found',
            "statusCode": 403
        })
    }

    else if (thisGroup.organizerId === req.user.id || currentStatus.status === 'co-host') {
        await thisGroupImage.destroy();
        res.status(200);
        return res.json({
            'message': "Successfully deleted",
            'statusCode': 200
        })
    }
})
module.exports = router;
