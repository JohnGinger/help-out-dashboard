import React, { Component, Fragment } from "react";
//import moment from "moment";

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
    this.props.changeUser({
      name,
      email,
      id
    });
  }

  updateUsers({ valid, users, admins }) {
    this.setState({ manageUsers: false });
    if (!valid) {
      return;
    }

    Array.from(users).forEach(([userId, userDetails]) => {
      const filteredUserDetails = {
        id: userId,
        email: userDetails.email,
        name: userDetails.name
      };
      this.props.changeUser(filteredUserDetails);
    });

    Array.from(admins).forEach(([id, isAdmin]) =>
      this.props.setAdmin({ id, isAdmin })
    );
  }

  addEvent({ valid, ...eventDetails }) {
    this.setState({ addingEvent: false });
    if (!valid) {
      return;
    }

    this.props.addEvent({
      ...eventDetails,
      id: Math.random()
        .toString(36)
        .substring(2)
    });
  }

  render() {
    const isAdmin = this.props.admins.some(id => id === this.props.user.id);
    return (
      <admin-panel>
        <admin-buttons>
          <button onClick={() => this.setState({ changeDetails: true })}>
            Change Details
          </button>
          {isAdmin && (
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
              update={e => this.updateUsers(e)}
              user={this.props.user}
              users={this.props.users}
              admins={this.props.admins}
            />
          )}
        </admin-actions>
      </admin-panel>
    );
  }
}
