import React, { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Link, NavLink } from 'react-router-dom';
import '../Groups/Groups.css';
import { fetchMyGroups } from '../../store/group';

function MyGroups() {
    const dispatch = useDispatch();
    const test = useSelector((state) => state.groups);
    let groups;
    const sessionUser = useSelector(state => state.session.user);
    if (test) {
        groups = Object.values(test);
    }

    useEffect(() => {
        dispatch(fetchMyGroups())
    }, [dispatch]);

    const renderGroupAbout = (text) => {
        const segments = text.split(" ");

        if (segments.length < 20) {
            return segments.join(" ");
        } else {
            return `${segments.slice(0, 19).join(" ")}...`
        }
    }
    if (!sessionUser) {
        return (
            <><div className='warning-container'>
                <div className='Warning'> Please log in to see your groups or <NavLink to='/' className='back-to-homepage'>  back to Home Page.</NavLink> </div></div></>
        )
    }
    if (test === undefined) return null;
    return (
        <div>
            <div className='map-container'>
                <div className='top-container'>
                    <NavLink className="top-link top-link-underlined" to={`/groups/my`}>My Groups</NavLink>
                </div>
                {groups.map((group) => (
                    <div className='group-card'>
                        <div className='group-left'>
                            {!group.previewImage && <div className='empty-image'></div>}
                            {group.previewImage && <img className='image' src={group.previewImage} alt='group-img'></img>}
                        </div>
                        <div className='group-right'>
                            <NavLink className='group-name' to={`/groups/${group.id}`}>{group.name}</NavLink>
                            <div className='group-city-state'>{group.city.toUpperCase()}, {group.state.toUpperCase()}</div>
                            <div className='group-organizer'> Organized by: {Object(Object(groups[0])['Organizer'])["firstName"]}</div>
                            {/* <div className = 'about-container'> */}
                            <div className='group-about'>{renderGroupAbout(group.about)}</div>
                            {/* </div> */}
                            <div className='group-member-pulic'>
                                {group.numMembers} {group.numMembers === 1 ? "member" : "members"} · {group.private ? "Private" : "Public"}
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    )
}

export default MyGroups;
