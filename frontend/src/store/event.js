import { csrfFetch } from './csrf';

//Get all events
const GET_ALL_EVENTS = 'events/GET_ALL_EVENTS';
const getAllEvents = events => {
    return {
        type: GET_ALL_EVENTS,
        events
    }
}
export const fetchEvents = () => async dispatch => {
    const res = await csrfFetch('/api/events');
    if (res.ok) {
        const events = await res.json();
        dispatch(getAllEvents(events));
        return events;
    }
}

//Get Events by Id
const GET_ONE_EVENT = 'events/GET_ONE_EVENT';
const getOneEvent = event => {
    return {
        type: GET_ONE_EVENT,
        event
    }
}
export const fetchOneEvent = id => async dispatch => {
    const res = await csrfFetch(`/api/events/${id}`);
    if (res.ok) {
        const thisEvent = await res.json();
        dispatch(getOneEvent(thisEvent));
    }
}

//get event by groupId
const GET_GROUP_EVENT = 'events/GET_GROUP_EVENT';
const getGroupEvent = event => {
    return {
        type: GET_GROUP_EVENT,
        event
    }
}
export const fetchGroupEvent = groupId => async dispatch => {
    const res = await csrfFetch(`/api/groups/${groupId}/events`);
    if (res.ok) {
        const events = await res.json();
        dispatch(getGroupEvent(events));
    }
}

//Create Event
const CREATE_EVENT = 'events/CREATE_EVENT';
const createEvent = (event) => {
    return {
        type: CREATE_EVENT,
        event
    }
}

export const createEventThunk = (payload) => async (dispatch) => {
    console.log(payload, 'this is payload -----');
    const { groupId, venueId, name, type, capacity, price, description, startDate, endDate, previewImage } = payload;
    console.log(payload.groupId, 'THIS IS GROUP ID');
    const res = await csrfFetch(`/api/groups/${groupId}/events`, {
        method: 'POST',
        body: JSON.stringify({
            venueId: parseInt(venueId),
            groupId: parseInt(groupId),
            name,
            type,
            capacity,
            price,
            description,
            startDate,
            endDate,
            previewImage
        }),
    })
    const data = await res.json();
    if (res.ok) {
        dispatch(createEvent(data));
        return res;
    } else {
        return data;
    }
}

//Edit Event
const EDIT_EVENT = 'events/EDIT_EVENT';
const editEvent = event => {
    return {
        type: EDIT_EVENT,
        event
    }
}

export const editEventThunk = (id, event) => async (dispatch) => {
    const res = await csrfFetch(`/api/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(
            event
        ),
        headers: { 'Content-Type': 'application/json' },
    })

    const data = await res.json();
    if (res.ok) {
        dispatch(editEvent(data));
        return data;
    } else {
        console.log('errors', data.errors, res.errors);
    }
}

//Delete Event
const DELETE_EVENT = 'events/DELETE_EVENT';
const deleteEvent = eventId => {
    return {
        type: DELETE_EVENT,
        eventId
    }
}
export const deleteEventThunk = eventId => async dispatch => {
    const res = await csrfFetch(`/api/events/${eventId}`, {
        method: 'DELETE',
    });

    if (res.ok) {
        dispatch(deleteEvent(eventId));
        return res;
    }
}

const initialState = {};
const eventsReducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case GET_ALL_EVENTS:
            newState = { ...state };
            newState = action.events.Events;
            return newState;
        case GET_GROUP_EVENT:
            newState = { ...state };
            newState = action.events.Events;
            return newState;
        case GET_ONE_EVENT:
            newState = { ...state };
            newState[action.event.id] = action.event;
            return newState;
        case CREATE_EVENT:
            newState = { ...state };
            newState.event = action.event;
            return newState;
        case EDIT_EVENT:
            newState = { ...state };
            newState[action.event.id] = action.event;
            return newState;
        case DELETE_EVENT:
            newState = { ...state };
            delete newState[action.eventId];
            return newState;
        default:
            return state;
    }
}

export default eventsReducer;
