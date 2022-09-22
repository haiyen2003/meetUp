//all the state of the Group
import { csrfFetch } from './csrf';


//Get all groups
const GET_ALL_GROUPS = 'groups/GET_ALL_GROUPS';
const getAllGroups = groups => {
    return {
        type: GET_ALL_GROUPS,
        groups
    }
}
export const fetchGroups = () => async dispatch => {
    const res = await csrfFetch('/api/groups');
    if (res.ok) {
        const groups = await res.json();
        dispatch(getAllGroups(groups));
        return groups;
    }
}

//Get Groups by Id
const GET_ONE_GROUP = 'groups/GET_ONE_GROUP';
const getOneGroup = group => {
    return {
        type: GET_ONE_GROUP,
        group
    }
}
export const fetchOneGroup = id => async dispatch => {
    const res = await csrfFetch(`/api/groups/${id}`);
    if (res.ok) {
        const thisGroup = await res.json();
        dispatch(getOneGroup(thisGroup));
    }
}

//Create Group
const CREATE_GROUP = 'groups/CREATE_GROUP';
const createGroup = (group) => {
    return {
        type: CREATE_GROUP,
        group
    }
}

export const createGroupThunk = payload => async (dispatch) => {
    const { name, about, type, city, state, isPrivate } = payload;
    const res = await csrfFetch(`/api/groups`, {
        method: 'POST',
        body: JSON.stringify({
            name,
            about,
            type,
            city,
            state,
            private: isPrivate,
        }),
        // headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json();
    //console.log(data, 'THIS IS DATA');
    if (res.ok) {
        dispatch(createGroup(data));
        return res;
    } else {
        //console.log(data, 'THIS IS DATA ----');
        return data;
    }
}

//Edit Group
const EDIT_GROUP = 'groups/EDIT_GROUP';
const editGroup = group => {
    return {
        type: EDIT_GROUP,
        group
    }
}

export const editGroupThunk = (id, group) => async (dispatch) => {
    //const { name, about, type, city, state, isPrivate } = group;
    console.log('THIS IS GROUP ID', group);
    const res = await csrfFetch(`/api/groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(
            // name,
            // about,
            // type,
            // city,
            // state,
            // private: isPrivate,
            group
        ),
        headers: { 'Content-Type': 'application/json' },
    })

    const data = await res.json();
    if (res.ok) {
        dispatch(editGroup(data));
        // dispatch(createGroup(data));
        console.log('this is data', data);
        return data;
    } else {
        console.log('errors', data.errors, res.errors);
    }
}

//Delete Group
const DELETE_GROUP = 'groups/DELETE_GROUP';
const deleteGroup = groupId => {
    return {
        type: DELETE_GROUP,
        groupId
    }
}
export const deleteGroupThunk = groupId => async dispatch => {
    const res = await csrfFetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
    });

    if (res.ok) {
        dispatch(deleteGroup(groupId));
        return res;
    }
}

const initialState = {};
const groupsReducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case GET_ALL_GROUPS:
            newState = { ...state };
            newState = action.groups.Groups;
            return newState;
        case GET_ONE_GROUP:
            newState = { ...state };
            newState[action.group.id] = action.group;
            return newState;
        case CREATE_GROUP:
            newState = { ...state };
            newState.group = action.group;
            return newState;
        case EDIT_GROUP:
            newState = { ...state };
            newState[action.group.id] = action.group;
            return newState;
        case DELETE_GROUP:
            newState = { ...state };
            delete newState[action.groupId];
            return newState;
        default:
            return state;
    }
}

export default groupsReducer;
