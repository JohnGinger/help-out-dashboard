import React, { Component, Fragment } from "react";
import moment from "moment";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import Events from "./components/Events/Events.js";
import Admin from "./components/Admin/Admin.js";
import Loader from "./components/Loader";
import Header from "./components/Header";
import Login from "./components/Login";
import "./App.scss";

const config = {
  apiKey: "AIzaSyA-CuOrF-IzFy7JPVJ5r-zWdNfdbjxLs5Y",
  authDomain: "help-out-dashboard.firebaseapp.com",
  databaseURL: "https://help-out-dashboard.firebaseio.com",
  projectId: "help-out-dashboard",
  storageBucket: "help-out-dashboard.appspot.com",
  messagingSenderId: "792887962708"
};
firebase.initializeApp(config);

class App extends Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      user: {},
      events: {
        start: moment()
          .startOf("month")
          .unix(),
        period: [1, "month"],
        list: []
      }
    };
    this.db = {};
  }

  componentDidMount() {
    this.db = firebase.firestore();
    this.db.settings({
      timestampsInSnapshots: true
    });

    this.unregisterAuthObserver = firebase
      .auth()
      .onAuthStateChanged(async authUser => {
        const isSignedIn = !!authUser;
        if (!isSignedIn) {
          return;
        }
        await this.createUserIfNotExisting(authUser);
        await this.refreshCurrentUser(authUser.uid);
        await this.refreshUsers();
      });
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  createUserIfNotExisting(authUser) {
    const userRef = this.db.collection("users").doc(authUser.uid);
    return userRef
      .get()
      .then(user => {
        if (!user.exists) {
          const dbUser = {
            id: authUser.uid,
            name: authUser.displayName,
            admin: false,
            email: authUser.email
          };
          return userRef.set(dbUser).then(() => dbUser);
        }
        return user.data();
      })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
  }

  refreshCurrentUser(id) {
    const userId = id || this.state.user.id;
    return this.db
      .collection("users")
      .doc(userId)
      .get()
      .then(user => this.setState({ user: user.data() }))
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
  }

  refreshUsers() {
    return this.db
      .collection("users")
      .get()
      .then(snapshot => {
        const users = new Map();
        snapshot.docs.forEach(x =>
          users.set(x.id, {
            ...x.data()
          })
        );
        this.setState({ users });
      })
      .then(() => this.refreshEvents())
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });
  }

  refreshEvents() {
    this.setState({ loading: true });
    const eventsRef = this.db
      .collection("events")
      .where("date", ">", this.state.events.start)
      .where(
        "date",
        "<",
        moment
          .unix(this.state.events.start)
          .add(...this.state.events.period)
          .unix()
      );

    eventsRef
      .get()
      .then(snapshot => {
        const events = snapshot.docs.map(x => {
          const data = x.data();
          return {
            ...data,
            people: data.people.map(id => this.state.users.get(id)),
            id: x.id
          };
        });
        this.setState({
          events: { ...this.state.events, list: events },
          loading: false
        });
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });
  }

  updateEvent(event) {
    this.db
      .collection("events")
      .doc(event.id)
      .update(event)
      .then(() => this.refreshEvents())
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
  }

  changeUser(user) {
    return this.db
      .collection("users")
      .doc(user.id)
      .set(user);
  }

  addEvent(event) {
    return this.db.collection("events").add(event);
  }

  signOut() {
    firebase.auth().signOut();
    this.setState({ user: {} });
  }

  render() {
    return (
      <div className="App">
        <Header user={this.state.user} signOut={() => this.signOut()} />
        {this.state.user.id ? (
          <Fragment>
            <Admin
              user={this.state.user}
              users={this.state.users}
              refreshUsers={() => this.refreshUsers()}
              refreshCurrentUser={() => this.refreshCurrentUser()}
              refreshEvents={() => this.refreshEvents()}
              changeUser={user => this.changeUser(user)}
              addEvent={event => this.addEvent(event)}
            />
            {this.state.loading ? (
              <Loader />
            ) : (
              <Events
                events={this.state.events.list}
                user={this.state.user}
                changeIfSignedUp={({ isSignedUp, event }) =>
                  this.changeIfSignedUp({ isSignedUp, event })
                }
                updateEvent={event => this.updateEvent(event)}
                getEvents={this.refreshEvents}
                start={this.state.events.start}
                period={this.state.events.period}
                setStart={start =>
                  this.setState(
                    { events: { ...this.state.events, start } },
                    () => this.refreshEvents()
                  )
                }
              />
            )}
          </Fragment>
        ) : (
          <Login />
        )}
      </div>
    );
  }
}

export default App;
