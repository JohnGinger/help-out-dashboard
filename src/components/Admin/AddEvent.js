import React, { Component } from "react";
import moment from "moment";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

export default class AddEvent extends Component {
  constructor() {
    super();
    this.state = {
      isRepeated: false,
      repeat: {
        frequency: 7,
        until: moment()
          .add("5", "years")
          .unix()
      },
      what: "",
      when: moment().unix(),
      volunteersVisible: true,
      public: true,
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
          Targeted Number of Volunteers
          <input
            type="number"
            value={this.state.neededPeople}
            onChange={e =>
              this.setState({ neededPeople: Number(e.target.value) })
            }
          />
        </label>
        <label>
          Volunteers Visible?
          <input
            type="checkbox"
            checked={this.state.volunteersVisible}
            onChange={e =>
              this.setState({
                volunteersVisible: !this.state.volunteersVisible
              })
            }
          />
        </label>
        <label>
          Public?
          <input
            type="checkbox"
            checked={this.state.public}
            onChange={e =>
              this.setState({
                public: !this.state.public
              })
            }
          />
        </label>
        <label>
          Repeat?
          <input
            type="checkbox"
            checked={this.state.isRepeated}
            onChange={() =>
              this.setState({
                isRepeated: !this.state.isRepeated
              })
            }
          />
        </label>
        {this.state.isRepeated && (
          <repeat-info>
            Repeat every{" "}
            <input
              type="number"
              value={this.state.repeat.frequency}
              onChange={e =>
                this.setState({
                  repeat: { ...this.state.repeat, frequency: e.target.value }
                })
              }
            />{" "}
            days, until{" "}
            <Datetime
              value={moment.unix(this.state.repeat.until)}
              onChange={repeatEnd => {
                this.setState({
                  repeat: { ...this.state.repeat, until: repeatEnd.unix() }
                });
              }}
            />
          </repeat-info>
        )}
        <action-strip>
          <button
            onClick={() => {
              const newEvent = {
                what: this.state.what,
                when: this.state.when,
                neededPeople: this.state.neededPeople,
                public: this.state.public,
                volunteersVisible: this.state.volunteersVisible,
                valid: true
              };

              if (this.state.isRepeated) {
                newEvent.repeat = this.state.repeat;
              }
              this.props.addEvent(newEvent);
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
