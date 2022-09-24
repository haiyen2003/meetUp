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
        // .then((res) => {
        //     console.log(res, 'RES -----');
        // })
        // .catch((res) => {
        //     const data = res.json()
        //     if (data && data.errors) console.log(data.errors, '----- ERROR');
        // })
    }, [dispatch]);

    if (test === undefined) return null;

    return (
        <div>
            <div className='map-container'>
                {groups.map((group) => (
                    <div className='group-card'>
                        <div className='group-left'>
                            <img className='image' src={group.previewImage} alt='group-img'></img>
                        </div>
                        <div className='group-right'>
                            <NavLink className='group-name' to={`/groups/${group.id}`}>{group.name}</NavLink>
                            <div className='group-city-state'>{group.city.toUpperCase()}, {group.state.toUpperCase()}</div>
                            <div className = 'group-about'>{group.about}</div>
                            <div>Organizer: {group.organizerId}</div>
                            <div className = 'group-member-pulic'>
                                {group.numMembers} {group.numMembers === 1 ? "member" : "members" } · {group.private ? "Private" : "Public" }
                            </div>
                            <div>Type: {group.type}</div>
                        </div>
                        <br />
                    </div>
                ))}

            </div>
        </div>
    )
}

export default Groups;
