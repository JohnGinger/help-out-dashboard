import React, { Component, Fragment } from "react";
import firebase from "firebase/app";
import moment from "moment";

import AddEvent from "./AddEvent";
import ChangeDetails from "./ChangeDetails";
import ManageUsers from "./ManageUsers";
import "./Admin.scss";
export default class Admin extends Component {
  constructor() {
    super();
    this.state = {
      changeDetails: false,
      manageUsers: false,
      addingEvent: false
    };
  }

  changeCurrentUser({ name, email, id, valid }) {
    this.setState({ changeDetails: false });
    if (!valid) {
      return;
    }
    this.props
      .changeUser({
        name,
        email,
        id
      })
      .then(() => firebase.auth().currentUser.updateEmail(email))
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
    this.props.refreshCurrentUser();
  }

  changeUsers({ valid, users }) {
    this.setState({ manageUsers: false });
    if (!valid) {
      return;
    }
    const newUsers = this.state.users;

    const changedUsers = Array.from(users).filter(
      ([id, { changed }]) => changed
    );
    changedUsers.forEach(([userId, userDetails]) => {
      const filteredUserDetails = {
        id: userId,
        admin: userDetails.admin,
        email: userDetails.email,
        name: userDetails.name
      };
      this.props.changeUser(filteredUserDetails);
      newUsers.set(userId, filteredUserDetails);
    });
    this.props.refreshUsers();
  }

  addEvent({
    what,
    when,
    repeat,
    repeatFrequency,
    repeatUntil,
    valid,
    neededPeople
  }) {
    this.setState({ addingEvent: false });
    if (!valid) {
      return;
    }
    const eventsToAdd = [
      this.props.addEvent({
        date: when,
        what,
        people: [],
        neededPeople
      })
    ];

    if (repeat) {
      let newDate = moment
        .unix(when)
        .add(repeatFrequency, "days")
        .unix();
      while (newDate < repeatUntil) {
        newDate = moment
          .unix(newDate)
          .add(repeatFrequency, "days")
          .unix();
        eventsToAdd.push(
          this.props.addEvent({
            date: newDate,
            what,
            people: [],
            neededPeople
          })
        );
      }
    }

    Promise.all(eventsToAdd)
      .then(() => this.props.refreshEvents())
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
  }

  render() {
    return (
      <admin-panel>
        <admin-buttons>
          <button onClick={() => this.setState({ changeDetails: true })}>
            Change Details
          </button>
          {this.props.user.admin && (
            <Fragment>
              <button onClick={() => this.setState({ addingEvent: true })}>
                Add Event
              </button>
              <button onClick={() => this.setState({ manageUsers: true })}>
                Manage Users
              </button>
            </Fragment>
          )}
        </admin-buttons>
        <admin-actions>
          {this.state.changeDetails && (
            <ChangeDetails
              user={this.props.user}
              changeDetails={newDetails => this.changeCurrentUser(newDetails)}
            />
          )}
          {this.state.addingEvent && (
            <AddEvent addEvent={newEvent => this.addEvent(newEvent)} />
          )}
          {this.state.manageUsers && (
            <ManageUsers
              changeUsers={users => this.changeUsers(users)}
              user={this.props.user}
              users={this.props.users}
            />
          )}
        </admin-actions>
      </admin-panel>
    );
  }
}
