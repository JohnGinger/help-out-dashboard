import React, { Component } from "react";

export default class ManageUsers extends Component {
  constructor() {
    super();
    this.state = {
      changedUsers: new Map(),
      changedAdmins: new Map()
    };
  }

  isAdmin(id) {
    const wasAnAdmin = this.props.admins.some(adminId => adminId === id);
    if (this.state.changedAdmins.has(id)) {
      return this.state.changedAdmins.get(id);
    }
    return wasAnAdmin;
  }

  toggleIfAdmin(id) {
    const changedAdmins = this.state.changedAdmins;
    if (changedAdmins.get(id) === true) {
      changedAdmins.set(id, false);
    } else {
      changedAdmins.set(id, true);
    }
    this.setState({ changedAdmins });
  }

  changeName(id, newName) {
    const changedUsers = this.state.changedUsers;
    changedUsers.set(id, { ...this.props.users.get(id), name: newName });
    this.setState({ changedUsers });
  }

  getUsers() {
    return Array.from(this.props.users).map(([id, { name, email }]) => {
      if (this.state.changedUsers.has(id)) {
        return this.state.changedUsers.get(id);
      } else {
        return { id, name, email };
      }
    });
  }

  render() {
    return (
      <manage-users class="admin-section">
        <h3>Registered Users</h3>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Admin Status</th>
            </tr>
          </thead>
          <tbody>
            {this.getUsers().map(({ id, name, email }) => (
              <tr key={id}>
                <td>
                  <input
                    type="text"
                    value={name}
                    onChange={e => this.changeName(id, e.target.value)}
                  />
                  {id === this.props.user.id && " (You)"}
                </td>
                <td>{email}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={this.isAdmin(id)}
                    onChange={() => this.toggleIfAdmin(id)}
                    disabled={id === this.props.user.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <action-strip>
          <button
            onClick={() => {
              this.props.update({
                valid: true,
                users: this.state.changedUsers,
                admins: this.state.changedAdmins
              });
              this.setState({ changedAdmins: [], changedUsers: [] });
            }}
          >
            Save
          </button>
          <button onClick={() => this.props.update({ valid: false })}>
            Cancel
          </button>
        </action-strip>
      </manage-users>
    );
  }
}
