import React, { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import { Link, NavLink } from 'react-router-dom';
import './GroupDetails.css';
import { fetchOneGroup } from '../../store/group';
import { deleteGroupThunk } from '../../store/group';

export default function GroupDetails() {
    const dispatch = useDispatch();
    const { groupId } = useParams();
    const history = useHistory();
    const test = useSelector((state) => state.groups);
    //console.log('TEST ------', test);
    const thisGroup = test[groupId];
    const thisUser = useSelector(state => state.session.user);

    const isOwner = thisUser?.id === thisGroup?.organizerId;


    useEffect(() => {
        dispatch(fetchOneGroup(groupId))
    }, [dispatch]);

    const handleDelete = async groupId => {
        console.log('BEFORE DELETE');
        const thisDelete = await dispatch(deleteGroupThunk(groupId));
        console.log('THIS DELETE HAPPENED');
        history.push(`/groups`);
    }

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
                <div>
                    {isOwner &&
                        <button onClick={() => handleDelete(groupId)}>Delete Group</button>}
                </div>
                <br />
            </div>
        </>
    )
}
