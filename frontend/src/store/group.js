//all the state of the Group
import { csrfFetch } from './csrf';

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

const initialState = {};
const groupsReducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case GET_ALL_GROUPS:
            newState = { ...state };
            newState = action.groups.Groups;
            // action.groups.forEach(group => {
            //     newState[group.id] = group;
            // });
            return newState;
        default:
            return state;
    }
}

export default groupsReducer;
