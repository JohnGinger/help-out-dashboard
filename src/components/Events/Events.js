import React, { Fragment } from "react";
import EventBlock from "./EventBlock";
import moment from "moment";
import "./Events.scss";

const Events = ({
  events,
  user,
  start,
  period,
  setStart,
  toggleSignedUp,
  people,
  isAdmin,
  editEvent,
  editEventSeries
}) => {
  return (
    <events-container>
      <h3>
        {moment.unix(start).format("Do MMMM YYYY")}
        {" to "}
        {moment
          .unix(start)
          .add(...period)
          .format("Do MMMM YYYY")}
      </h3>
      <signups-container>
        <change-date>
          <button
            onClick={() => {
              setStart(
                moment
                  .unix(start)
                  .subtract(...period)
                  .unix()
              );
            }}
          >
            <icon-holder>⇦</icon-holder>
          </button>
        </change-date>
        <signup-dates>
          {events.length === 0 ? (
            "Sorry - There are no events for these dates"
          ) : (
            <Fragment>
              {events.map(event => (
                <EventBlock
                  {...event}
                  key={event.date}
                  user={user}
                  isAdmin={isAdmin}
                  people={people.get(event.id) || []}
                  toggleSignedUp={() => toggleSignedUp(event.id)}
                  editEvent={editedEvent => editEvent({ ...editedEvent, id: event.id })}
                  editEventSeries={eventSeries =>
                    editEventSeries({ ...eventSeries, id: event.eventSeries })
                  }
                />
              ))}
            </Fragment>
          )}
        </signup-dates>
        <change-date>
          <button
            onClick={() => {
              setStart(
                moment
                  .unix(start)
                  .add(...period)
                  .unix()
              );
            }}
          >
            <icon-holder>⇨</icon-holder>
          </button>
        </change-date>
      </signups-container>
    </events-container>
  );
};
export default Events;
