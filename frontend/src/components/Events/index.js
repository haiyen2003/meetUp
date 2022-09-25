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
                {events.map((event) => {
                    let date = event.startDate;
                    let properDate = new Date(date);
                    let day = properDate.getDay();
                    let month = properDate.getMonth();
                    let time = event.startDate.split('T');
                    let newTime = time[1].split('.');
                    let monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    let dayArray = ['Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];
                    let newDay = dayArray[day];
                    let newMonth = monthArray[month];
                    let newDate = properDate.getDate();

                    return (
                        <div className='group-card'>
                            <div className='group-left'>
                                <img className='image' src={event.previewImage} alt='group-img'></img>
                            </div>
                            <div className='group-right'>
                                <div className='group-about'>{newDay}, {newDate} {newMonth} · {newTime[0]}</div>
                                <NavLink className='group-name' to={`/events/${event.id}`}>{event.name}</NavLink>
                                <div className='group-name-city'>{event.Group.name} · {event.Venue.city}, {event.Venue.state}</div>
                                <div className='group-attendee'>{event.numAttending} {event.numAttending === 1 ? "attendee" : "attendees"}</div>

                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}
export default Events;
