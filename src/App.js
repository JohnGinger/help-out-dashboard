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
      signedUpPeople: new Map(),
      eventSeries: new Map()
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

    this.db.collection("users").onSnapshot(
      snapshot => {
        const users = new Map();
        snapshot.docs.forEach(x =>
          users.set(x.id, {
            ...x.data()
          })
        );
        this.setState({ users });
      },
      function(error) {
        console.warn(error);
      }
    );

    this.db.collection("admins").onSnapshot(
      snapshot => {
        this.setState({ admins: snapshot.docs.map(x => x.id) });
      },
      function(error) {
        console.warn(error);
      }
    );

    this.db.collection("event_series").onSnapshot(
      snapshot => {
        const eventSeries = new Map();
        snapshot.docs.forEach(x => eventSeries.set(x.id, x.data()));
        this.setState(
          {
            eventSeries
          },
          () => this.setEventsListener()
        );
      },
      function(error) {
        console.warn(error);
      }
    );

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
      .onSnapshot(user => this.setState({ user: user.data() }), function(
        error
      ) {
        console.warn(error);
      });
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  createUserIfNotExisting(authUser) {
    const userRef = this.db.collection("users").doc(authUser.uid);
    return userRef.get().then(user => {
      if (!user.exists) {
        const dbUser = {
          id: authUser.uid,
          name: authUser.displayName,
          email: authUser.email
        };
        return userRef.set(dbUser).then(() => dbUser);
      }
      return user.data();
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
        const events = snapshot.docs
          .filter(
            x => !this.state.eventSeries.get(x.data().eventSeries).deleted
          )
          .map(
            x => {
              const data = x.data();
              this.setPeopleListener(x.id);
              return {
                ...data,
                id: x.id,
                what: this.state.eventSeries.get(data.eventSeries).name
              };
            },
            function(error) {
              console.warn(error);
            }
          );
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
      .onSnapshot(
        snapshot => {
          const signedUpPeople = this.state.signedUpPeople;
          signedUpPeople.set(
            eventId,
            snapshot.docs.map(x => ({
              id: x.id,
              ...this.state.users.get(x.id)
            }))
          );
          this.setState({ signedUpPeople });
        },
        function(error) {
          console.warn(error);
        }
      );
  }

  toggleSignedUp(eventId) {
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

  editEvent({ neededPeople, id, deleteEvent }) {
    if (deleteEvent) {
      if (
        window.confirm(
          "Are you sure you want to delete this Event? This cannot be undone"
        )
      ) {
        this.db
          .collection("events")
          .doc(id)
          .delete();
      }
    } else {
      this.db
        .collection("events")
        .doc(id)
        .update({
          neededPeople
        });
    }
  }

  editEventSeries({ name, id, deleteEventSeries }) {
    if (deleteEventSeries) {
      if (
        window.confirm(
          "Are you sure you want to delete ALL EVENTS IN THIS SERIES?. This could be several hundred events! This cannot be undone"
        )
      ) {
        this.db
          .collection("event_series")
          .doc(id)
          .update({ deleted: true });
      }
    } else {
      this.db
        .collection("event_series")
        .doc(id)
        .update({
          name
        });
    }
  }

  addEvent({ when, what, neededPeople, repeat, id }) {
    this.db
      .collection("event_series")
      .doc(id)
      .set({
        name: what,
        deleted: false
      });

    this.db.collection("events").add({
      date: when,
      eventSeries: id,
      neededPeople
    });
    this.setState({ loading: true });
    if (repeat) {
      const batch = this.db.batch();

      let newDate = moment
        .unix(when)
        .add(repeat.frequency, "days")
        .unix();
      while (newDate < repeat.until) {
        newDate = moment
          .unix(newDate)
          .add(repeat.frequency, "days")
          .unix();
        batch.set(
          this.db.collection("events").doc(
            Math.random()
              .toString(32)
              .substr(2)
          ),
          {
            date: newDate,
            eventSeries: id,
            neededPeople
          }
        );
      }

      return batch
        .commit()
        .then(() => {
          this.setState({ loading: false });
        })
        .catch(console.warn);
    }
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
    const isAdmin = this.state.admins.some(id => id === this.state.user.id);
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
                isAdmin={isAdmin}
                toggleSignedUp={eventId => this.toggleSignedUp(eventId)}
                setStart={start => this.setEventDisplayRange(start)}
                editEvent={event => this.editEvent(event)}
                editEventSeries={eventSeries =>
                  this.editEventSeries(eventSeries)
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
