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
        console.log(groups, '---- THIS IS GROUPS');
    }

    useEffect(() => {
        dispatch(fetchGroups())
            .then((res) => {
                console.log(res, 'RES -----');
            })
            .catch((res) => {
                const data = res.json()
                if (data && data.errors) console.log(data.errors, '----- ERROR');
            })
    }, [dispatch]);

    if (test === undefined) return null;
    return (
        <div>
            Hello Debug
            <div>
                {groups.map((group) => (
                    <div>
                      <div>{group.name}</div>
                      <div>{group.about}</div>
                      <div>{group.organizerId}</div>
                      <div>{group.type}</div>
                      <div>{group.city}</div>
                      <br/>
                        <NavLink to={`/groups/${group.id}`}>{group.id}</NavLink>
                    </div>
                ))}

            </div>
        </div>
    )

}

export default Groups;
