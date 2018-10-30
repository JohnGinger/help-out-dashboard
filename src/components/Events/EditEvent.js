import React from "react";
import "./EditEvent.scss";

export default class EditEvent extends React.Component {
  constructor() {
    super();
    this.state = {
      editing: false,
      eventSeriesName: ""
    };
  }
  render() {
    const { name, neededPeople, editEvent, editEventSeries } = this.props;

    if (this.state.editing) {
      return (
        <edit-event>
          <button
            onClick={() => editEvent({ deleteEvent: true })}
            className="warning"
          >
            Delete
          </button>
          <button
            onClick={() => editEventSeries({ deleteEventSeries: true })}
            className="warning"
          >
            Delete Event Series
          </button>
          <label>
            Needed People
            <input
              type="number"
              value={neededPeople}
              onChange={e =>
                editEvent({ neededPeople: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Event series name
            <input
              type="text"
              placeholder={name}
              value={this.state.eventSeriesName}
              onChange={e => this.setState({ eventSeriesName: e.target.value })}
            />
          </label>
          <button
            onClick={() => {
              if (this.state.eventSeriesName) {
                editEventSeries({ name: this.state.eventSeriesName });
              }
              this.setState({ editing: false });
            }}
          >
            Done
          </button>
        </edit-event>
      );
    } else {
      return (
        <edit-event-button>
          <button
            onClick={() => {
              this.setState({ editing: true });
            }}
          >
            Edit
          </button>
        </edit-event-button>
      );
    }
  }
}
