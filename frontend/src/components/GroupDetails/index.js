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
    const thisGroup = test[groupId];
    const thisUser = useSelector(state => state.session.user);

    const isOwner = thisUser?.id === thisGroup?.organizerId;
    const routeChange = () => {
        let path = `/groups/${groupId}/edit`
        history.push(path);
    }
    const routeChange2 = () => {
        let path = `/groups/${groupId}/events/new`
        history.push(path);
    }

    useEffect(() => {
        dispatch(fetchOneGroup(groupId))
    }, [dispatch]);

    const handleDelete = async groupId => {
        const thisDelete = await dispatch(deleteGroupThunk(groupId));
        history.push(`/groups`);
    }

    if (!thisGroup) return null;
    return (
        <>
            <div className='main-container'>
                <div className='top-container'>
                    <div className='left-top-container'>
                        <img className='image' src={thisGroup.GroupImages[0].url}></img>
                    </div>
                    <div className='right-top-container'>
                        <div>{thisGroup.name}</div>
                        <div>City: {thisGroup.city}</div>
                        <div>State: {thisGroup.state}</div>
                        <div>Members: {thisGroup.numMembers}</div>
                        <div>Private: {thisGroup.private.toString()}</div>
                    </div>
                    <div className='middle-container'>
                        <div class='dropdown'>
                            {isOwner &&
                                <button onClick={() => handleDelete(groupId)}>Delete Group</button>}

                            <div>
                                {isOwner &&
                                    <button onClick={routeChange}>Edit Group</button>}
                            </div>
                            <div>
                                {isOwner &&
                                    <button onClick={routeChange2}>Create Event</button>}
                            </div>
                        </div>
                    </div>
                    <div className='bottom-container'>
                        <div className='bottom-left-container'>
                            <div>{thisGroup.about}</div>
                        </div>
                    </div>
                    <div className='bottom-right-container'>
                        <div>Organizer: {thisGroup.organizerId}</div>
                    </div>
                </div>
                <br />
            </div>
        </>
    )
}
