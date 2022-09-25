import React, { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import './Events.css';
import { fetchEvents } from '../../store/event';
import EventDetails from '../EventDetails';

function Events() {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.events)
    let events;

    if (data) {
        events = Object.values(data);
    }
    useEffect(() => {
        dispatch(fetchEvents())
    }, [dispatch])

    if (!data) return null;
    return (
        <>
            <div className='map-container'>
                <div className='top-container'>
                    <NavLink className="top-link " to={`/groups`}>Groups</NavLink>
                    <NavLink className='top-link top-link-underlined' to={`/events`}>Events</NavLink>
                </div>
                {events.map((event) => (
                    <div className='group-card'>
                        <div className='group-left'>
                            <img className='image' src={event.previewImage} alt='group-img'></img>
                        </div>
                        <div className='group-right'>
                            <div>Start Date: {event.startDate}</div>
                            <NavLink className='group-name' to={`/events/${event.id}`}>{event.name}</NavLink>
                            <div className='group-city-state'>{event.Group.name} · {event.Venue.city}</div>
                            <div className='group-about'>{event.description}</div>
                            <div className='group-member-pulic'>{event.numAttending} {event.numAttending === 1 ? "attendee" : "attendees"}</div>
                            <br />
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
export default Events;
