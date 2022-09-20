import React, { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import { Link, NavLink } from 'react-router-dom';
import './GroupDetails.css';
import { fetchOneGroup } from '../../store/group';

export default function GroupDetails() {
    const dispatch = useDispatch();
    const { groupId } = useParams();
    //const history = useHistory();
    const test = useSelector((state) => state.groups);
    //console.log('TEST ------', test);
    const thisGroup = test[groupId];
    //console.log('THIS GROUP ------', thisGroup);
    useEffect(() => {
        dispatch(fetchOneGroup(groupId))
    }, [dispatch]);

    if (!thisGroup) return null;
    return (
        <>
            <div>
                This is Group Details Page;
                <div>{thisGroup.name}</div>
                <div>{thisGroup.about}</div>
                <div>Organizer: {thisGroup.organizerId}</div>
                <div>Type: {thisGroup.type}</div>
                <div>Private: {thisGroup.private.toString()}</div>
                <div>City: {thisGroup.city}</div>
                <div>State: {thisGroup.state}</div>
                <div>Members: {thisGroup.numMembers}</div>
                <div>Image: {thisGroup.previewImage}</div>
                <br />
            </div>
        </>
    )
}
