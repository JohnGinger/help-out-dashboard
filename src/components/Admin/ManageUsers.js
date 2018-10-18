import React, { Component } from "react";

export default class ManageUsers extends Component {
  constructor() {
    super();
    this.state = {
      users: new Map()
    };
  }
  componentDidMount() {
    this.setState({ users: this.props.users });
  }
  render() {
    return (
      <manage-users class="admin-section">
        <h3>Registered Users</h3>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Admin Status</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(this.state.users).map(
              ([id, { admin, name, email }]) => (
                <tr key={id}>
                  <td>
                    <input
                      type="text"
                      value={name}
                      onChange={e => {
                        const newUsers = this.state.users;
                        newUsers.set(id, {
                          name: e.target.value,
                          id,
                          admin,
                          email,
                          changed: true
                        });
                        this.setState({ users: newUsers });
                      }}
                    />
                    {id === this.props.user.id && " (You)"}
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={admin}
                      onChange={() => {
                        const newUsers = this.state.users;
                        newUsers.set(id, {
                          name,
                          id,
                          email,
                          admin: !admin,
                          changed: true
                        });
                        this.setState({ users: newUsers });
                      }}
                      disabled={id === this.props.user.id}
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        <action-strip>
          <button
            onClick={() => {
              this.props.changeUsers({
                valid: true,
                users: this.state.users
              });
            }}
          >
            Save
          </button>
          <button onClick={() => this.props.changeUsers({ valid: false })}>
            Cancel
          </button>
        </action-strip>
      </manage-users>
    );
  }
}
