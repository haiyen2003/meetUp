// frontend/src/App.js
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
import SignupFormPage from "./components/SignupFormPage";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import Groups from './components/Groups'
import GroupDetails from "./components/GroupDetails";
import CreateGroupForm from "./components/CreateGroup";
import CreateEventForm from "./components/CreateEvent";
import EditGroupForm from "./components/EditGroupForm";
import Events from './components/Events';
import EventDetails from "./components/EventDetails";
import EditEventForm from "./components/EditEventForm";
import Home from "./components/Home";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
           <Route exact path = '/'>
            <Home />
          </Route>
          <Route exact path="/signup">
            <SignupFormPage />
          </Route>
          <Route path='/groups/:groupId/events/new'>
            <CreateEventForm />
          </Route>
          <Route  path="/events/:eventId/edit">
            <EditEventForm />
          </Route>
          <Route  path="/events/:eventId">
            <EventDetails />
          </Route>
          <Route  path='/groups/:groupId/edit'>
            <EditGroupForm />
          </Route>
          <Route  path='/groups/new'>
            <CreateGroupForm />
          </Route>
          <Route  path="/groups/:groupId">
            <GroupDetails />
          </Route>
          <Route  path="/groups">
            <Groups />
          </Route>
          <Route path="/events">
            <Events />
          </Route>
        </Switch>
      )}
    </>
  );
}

export default App;
