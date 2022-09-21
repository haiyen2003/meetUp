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
            <div>
                {groups.map((group) => (
                    <div>
                        <NavLink to={`/groups/${group.id}`}>{group.name}</NavLink>
                        <div>{group.about}</div>
                        <div>Organizer: {group.organizerId}</div>
                        <div>Type: {group.type}</div>
                        <div>Private: {group.private.toString()}</div>
                        <div>City: {group.city}</div>
                        <div>State: {group.state}</div>
                        <div>Members: {group.numMembers}</div>
                        <div>Image: {group.previewImage}</div>
                        <br />
                    </div>
                ))}

            </div>
        </div>
    )
}

export default Groups;
