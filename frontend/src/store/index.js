//Redux doesnot let import createStore -> configureStore
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

//import * as sessionActions from './store/session';

import sessionReducer from './session';

// if (process.env.NODE_ENV !== 'production') {
//   restoreCSRF();

//   window.csrfFetch = csrfFetch;
//   window.store = store;
//   window.sessionActions = sessionActions;
// }

const rootReducer = combineReducers({
  session: sessionReducer,
});

let enhancer;

if (process.env.NODE_ENV === "production") {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = require("redux-logger").default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

const configureStore = (preloadedState) => {
  return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
