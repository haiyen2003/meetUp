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
          <Route exact path="/signup">
            <SignupFormPage />
          </Route>
          <Route exact path="/groups">
            <Groups />
          </Route>
          <Route exact path='/groups/new'>
            <CreateGroupForm />
          </Route>
          <Route exact path="/groups/:groupId">
            <GroupDetails />
          </Route>
        </Switch>
      )}
    </>
  );
}

export default App;
