import React, { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import { Link, NavLink } from 'react-router-dom';
import './EventDetails.css';
import { fetchOneEvent } from '../../store/event';
import { deleteEventThunk } from '../../store/event';

export default function EventDetails() {
    const dispatch = useDispatch();
    const { eventId } = useParams();
    const history = useHistory();
    const thisEvent = useSelector((state) => state.events[eventId]);
    //const thisEvent = data[eventId];
    //console.log(thisEvent, "this event ------")
    const thisUser = useSelector(state => state.session.user);
    const isOwner = thisUser?.id === thisEvent?.Group?.organizerId;

    const routeChange = () => {
        let path = `/events/${eventId}/edit`
        history.push(path);
    }
    useEffect(() => {
        dispatch(fetchOneEvent(eventId))
    }, [dispatch]);

    const handleDelete = async eventId => {
        const thisDelete = await dispatch(deleteEventThunk(eventId));
        history.push(`/events`);
    }

    if (!thisEvent) return null;
    return (
        <>
            This is Event Details Page;
            <div>{thisEvent.name}</div>
            <div>{thisEvent.description}</div>
            <div>Capacity: {thisEvent.capacity}</div>
            <div>Type: {thisEvent.type}</div>
            <div>Price: {thisEvent.price}</div>
            <div>VenueId: {thisEvent.venueId}</div>
            <div>Start Date: {thisEvent.startDate}</div>
            <div>End Date: {thisEvent.endDate}</div>
            <div>
                {isOwner &&
                    <button onClick={() => handleDelete(eventId)}>Delete Event</button>}
            </div>
            <div>
                {isOwner &&
                    <button onClick={routeChange}>Edit Event</button>}
            </div>
        </>
    )
}
