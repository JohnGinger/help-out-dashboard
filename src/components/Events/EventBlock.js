import React, { Fragment } from "react";
import moment from "moment";
import EditEvent from "./EditEvent";
import NeededPeople from "./NeededPeople";

import "./EventBlock.scss";

const EventBlock = ({
  eventSeries,
  date,
  name,
  people,
  user,
  isAdmin,
  neededPeople,
  toggleSignedUp,
  editEvent,
  editEventSeries,
  volunteersVisible
}) => {
  const getEmailLinkToSignedUp = () => {
    return `mailto:${user.email}?&bcc=${people.map(x => x.email)}
    &subject=${name || "The event you signed up to"} on ${moment
      .unix(date)
      .format("Do MMMM h:mma")}`;
  };

  return (
    <event-block>
      {isAdmin && (
        <EditEvent
          name={name}
          neededPeople={neededPeople}
          editEvent={event => editEvent(event)}
          editEventSeries={eventSeries => editEventSeries(eventSeries)}
        />
      )}
      <h3>{moment.unix(date).format("Do MMMM h:mma")}</h3>
      {name && <h4>{name}</h4>}
      <NeededPeople
        neededPeople={neededPeople}
        numberSignedUp={people.length}
      />
      {people.map(person => {
        if (person.id === user.id) {
          return (
            <button
              key={person.id}
              className="signed-up-user"
              onClick={() => toggleSignedUp()}
            >
              You!
            </button>
          );
        } else if (volunteersVisible || isAdmin) {
          return (
            <signed-up-person key={person.id}>{person.name}</signed-up-person>
          );
        } else {
          return null;
        }
      })}
      {!people.some(p => p.id === user.id) && (
        <button className="sign-up" onClick={() => toggleSignedUp()}>
          + {user.name}
        </button>
      )}
      {isAdmin && (
        <Fragment>
          <div>
            <a href={getEmailLinkToSignedUp()}>Email People Signed Up</a>
          </div>
          <div>
            <a href={`/events/${eventSeries}`}>Event Series Link</a>
          </div>
        </Fragment>
      )}
    </event-block>
  );
};
export default EventBlock;
