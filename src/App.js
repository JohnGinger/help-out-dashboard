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
      admins: [],
      events: {
        start: moment()
          .startOf("month")
          .unix(),
        period: [1, "month"]
      },
      eventsList: [],
      signedUpPeople: new Map()
    };
    this.db = {};
    this.eventsListener = () => {};
    this.peopleListeners = [];
  }

  componentDidMount() {
    this.db = firebase.firestore();
    this.db.settings({
      timestampsInSnapshots: true
    });

    this.db.collection("users").onSnapshot(snapshot => {
      const users = new Map();
      snapshot.docs.forEach(x =>
        users.set(x.id, {
          ...x.data()
        })
      );
      this.setState({ users });
    });

    this.db.collection("admins").onSnapshot(snapshot => {
      this.setState({ admins: snapshot.docs.map(x => x.id) });
    });

    this.setEventsListener();

    this.unregisterAuthObserver = firebase
      .auth()
      .onAuthStateChanged(async authUser => {
        const isSignedIn = !!authUser;
        if (!isSignedIn) {
          return;
        } else {
          await this.createUserIfNotExisting(authUser);
          this.setState({ user: { id: authUser.uid } }, () => {
            this.setUserListener();
          });
        }
      });
  }

  setUserListener() {
    this.db
      .collection("users")
      .doc(this.state.user.id)
      .onSnapshot(user => this.setState({ user: user.data() }));
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

  setEventsListener() {
    this.eventsListener();
    this.peopleListeners.forEach(x => x());
    this.setState({ loading: true });
    this.eventsListener = this.db
      .collection("events")
      .where("date", ">", this.state.events.start)
      .where(
        "date",
        "<",
        moment
          .unix(this.state.events.start)
          .add(...this.state.events.period)
          .unix()
      )
      .onSnapshot(snapshot => {
        const events = snapshot.docs.map(x => {
          this.setPeopleListener(x.id);
          const data = x.data();
          return {
            ...data,
            id: x.id
          };
        });
        this.setState({
          eventsList: events,
          loading: false
        });
      });
  }

  setPeopleListener(eventId) {
    this.peopleListeners[eventId] && this.peopleListeners[eventId]();
    this.peopleListeners[eventId] = this.db
      .collection(`events/${eventId}/people`)
      .onSnapshot(snapshot => {
        const signedUpPeople = this.state.signedUpPeople;
        signedUpPeople.set(
          eventId,
          snapshot.docs.map(x => ({
            id: x.id,
            ...this.state.users.get(x.id)
          }))
        );
        this.setState({ signedUpPeople });
      });
  }

  toggleSignedUp(eventId) {
    console.log("toggle signed up");
    const userId = this.state.user.id;
    const signedUp =
      this.state.signedUpPeople.has(eventId) &&
      this.state.signedUpPeople.get(eventId).some(x => x.id === userId);
    if (signedUp) {
      this.db
        .collection(`events/${eventId}/people`)
        .doc(this.state.user.id)
        .delete();
    } else {
      this.db
        .collection(`events/${eventId}/people`)
        .doc(this.state.user.id)
        .set({});
    }
  }

  addEvent(event) {
    return this.db.collection("events").add(event);
  }

  updateEvent({ id, event }) {
    this.db
      .collection("events")
      .doc(id)
      .update(event);
  }

  setAdmin({ id, isAdmin }) {
    if (isAdmin) {
      this.db
        .collection("admins")
        .doc(id)
        .set({});
    } else if (this.state.admins.some(adminId => adminId === id)) {
      this.db
        .collection("admins")
        .doc(id)
        .delete();
    }
  }

  changeUser(user) {
    if (user.id === this.state.user.id) {
      firebase.auth().currentUser.updateEmail(user.email);
    }

    this.db
      .collection("users")
      .doc(user.id)
      .set(user);
  }

  setEventDisplayRange(start) {
    this.setState({ events: { ...this.state.events, start } }, () =>
      this.setEventsListener()
    );
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
              admins={this.state.admins}
              changeUser={user => this.changeUser(user)}
              setAdmin={id => this.setAdmin(id)}
              addEvent={event => this.addEvent(event)}
            />
            {this.state.loading ? (
              <Loader />
            ) : (
              <Events
                events={this.state.eventsList}
                people={this.state.signedUpPeople}
                user={this.state.user}
                start={this.state.events.start}
                period={this.state.events.period}
                toggleSignedUp={eventId => this.toggleSignedUp(eventId)}
                setStart={start => this.setEventDisplayRange(start)}
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
