import React from "react";
import moment from "moment";
import EditEvent from "./EditEvent";
import NeededPeople from "./NeededPeople";

import "./EventBlock.scss";

const EventBlock = ({
  date,
  what,
  people,
  user,
  isAdmin,
  neededPeople,
  toggleSignedUp,
  editEvent,
  editEventSeries
}) => {
  return (
    <event-block>
      {isAdmin && (
        <EditEvent
          what={what}
          neededPeople={neededPeople}
          editEvent={event => editEvent(event)}
          editEventSeries={eventSeries => editEventSeries(eventSeries)}
        />
      )}
      <h3>{moment.unix(date).format("Do MMMM h:mma")}</h3>
      {what && <h4>{what}</h4>}
      <NeededPeople
        neededPeople={neededPeople}
        numberSignedUp={people.length}
      />
      {people.map(
        person =>
          person.id === user.id ? (
            <button
              key={person.id}
              className="signed-up-user"
              onClick={() => toggleSignedUp()}
            >
              {person.name}
            </button>
          ) : (
            <signed-up-person key={person.id}>{person.name}</signed-up-person>
          )
      )}
      {!people.some(p => p.id === user.id) && (
        <button className="sign-up" onClick={() => toggleSignedUp()}>
          + {user.name}
        </button>
      )}
    </event-block>
  );
};
export default EventBlock;
