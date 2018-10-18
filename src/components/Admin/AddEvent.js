import React, { Component } from "react";
import moment from "moment";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

export default class AddEvent extends Component {
  constructor() {
    super();
    this.state = {
      repeat: false,
      valid: true,
      what: "",
      when: moment().unix(),
      repeatFrequency: 7,
      repeatUntil: moment()
        .add("5", "years")
        .unix(),
      neededPeople: 0
    };
  }
  render() {
    return (
      <add-event class="admin-section">
        <h3>New Event</h3>
        <label>
          What
          <input
            type="text"
            value={this.state.what}
            onChange={e => this.setState({ what: e.target.value })}
          />
        </label>
        <label>
          When
          <Datetime
            value={moment.unix(this.state.when)}
            onChange={when => {
              this.setState({ when: when.unix() });
            }}
          />
        </label>
        <label>
          Repeat?{" "}
          <input
            type="checkbox"
            value={this.state.repeat}
            onChange={() => this.setState({ repeat: !this.state.repeat })}
          />
        </label>
        <label>
          Needed People{" "}
          <input
            type="number"
            value={this.state.neededPeople}
            onChange={e =>
              this.setState({ neededPeople: Number(e.target.value) })
            }
          />
        </label>
        {this.state.repeat && (
          <repeat-info>
            Repeat every{" "}
            <input
              type="number"
              value={this.state.repeatFrequency}
              onChange={e => this.setState({ repeatFrequency: e.target.value })}
            />{" "}
            days, until{" "}
            <Datetime
              value={moment.unix(this.state.repeatUntil)}
              onChange={repeatEnd => {
                this.setState({ repeatUntil: repeatEnd.unix() });
              }}
            />
          </repeat-info>
        )}
        <action-strip>
          <button
            onClick={() => {
              this.props.addEvent(this.state);
            }}
          >
            Add
          </button>
          <button onClick={() => this.props.addEvent({ valid: false })}>
            Cancel
          </button>
        </action-strip>
      </add-event>
    );
  }
}
