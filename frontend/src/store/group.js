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
        case GET_ONE_GROUP:
            newState = { ...state };
            newState[action.group.id] = action.group;
            return newState;
        default:
            return state;
    }
}

export default groupsReducer;
