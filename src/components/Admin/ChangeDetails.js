import React, { Component } from "react";

export default class ChangeDetails extends Component {
  constructor() {
    super();
    this.state = {
      valid: true,
      name: "",
      email: "",
      id: ""
    };
  }
  componentDidMount() {
    this.setState({
      name: this.props.user.name,
      email: this.props.user.email,
      id: this.props.user.id
    });
  }
  render() {
    return (
      <change-details class="admin-section">
        <h3>Change Details</h3>
        <label>
          Name
          <input
            type="text"
            value={this.state.name}
            onChange={e => this.setState({ name: e.target.value })}
          />
        </label>
        <label>
          Email
          <input
            type="text"
            value={this.state.email}
            onChange={e => this.setState({ email: e.target.value })}
          />
        </label>
        <action-strip>
          <button
            onClick={() => {
              this.props.changeDetails(this.state);
            }}
          >
            Save
          </button>
          <button onClick={() => this.props.changeDetails({ valid: false })}>
            Cancel
          </button>
        </action-strip>
      </change-details>
    );
  }
}
