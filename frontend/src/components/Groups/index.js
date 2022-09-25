import React, { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Link, NavLink } from 'react-router-dom';
import './Groups.css';
import { fetchGroups } from '../../store/group';

function Groups() {
    const dispatch = useDispatch();
    const test = useSelector((state) => state.groups);
    let groups;

    if (test) {
        groups = Object.values(test);
        // console.log(groups, '---- THIS IS GROUPS');
    }

    useEffect(() => {
        dispatch(fetchGroups())
    }, [dispatch]);

    if (test === undefined) return null;

    return (
        <div>
            <div className='map-container'>
                <div className='top-container'>
                    <NavLink className="top-link top-link-underlined" to={`/groups`}>Groups</NavLink>
                    <NavLink className='top-link' to={`/events`}>Events</NavLink>
                </div>
                {groups.map((group) => (
                    <div className='group-card'>
                        <div className='group-left'>
                            <img className='image' src={group.previewImage} alt='group-img'></img>
                        </div>
                        <div className='group-right'>
                            <NavLink className='group-name' to={`/groups/${group.id}`}>{group.name}</NavLink>
                            <div className='group-city-state'>{group.city.toUpperCase()}, {group.state.toUpperCase()}</div>
                            <div className='group-organizer'> Organized by: {Object(Object(groups[0])['Organizer'])["firstName"]}</div>

                            <div className='group-about'>{group.about}</div>

                            <div className='group-member-pulic'>
                                {group.numMembers} {group.numMembers === 1 ? "member" : "members"} · {group.private ? "Private" : "Public"}
                            </div>
                        </div>
                        <br />
                    </div>
                ))}

            </div>
        </div>
    )
}

export default Groups;
