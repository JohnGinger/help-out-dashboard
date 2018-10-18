import React from "react";
import moment from "moment";
import "./EventBlock.scss";
import firebase from "firebase/app";

const EventBlock = ({
  date,
  what,
  people,
  user,
  changePeopleSignedUp,
  neededPeople
}) => {
  const changeIfSignedUp = ({ event, isSignedUp }) => {
    const { id } = user;
    const newPeople = isSignedUp
      ? firebase.firestore.FieldValue.arrayUnion(id)
      : firebase.firestore.FieldValue.arrayRemove(id);

    changePeopleSignedUp(newPeople);
  };

  return (
    <event-block>
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
              onClick={() => changeIfSignedUp({ isSignedUp: false })}
            >
              {person.name}
            </button>
          ) : (
            <signed-up-person key={person.id}>{person.name}</signed-up-person>
          )
      )}
      {!people.some(p => p.id === user.id) && (
        <button
          className="sign-up"
          onClick={() => changeIfSignedUp({ isSignedUp: true })}
        >
          + {user.name}
        </button>
      )}
    </event-block>
  );
};
export default EventBlock;

const NeededPeople = ({ neededPeople, numberSignedUp }) => {
  const percentage = Math.min((numberSignedUp / neededPeople) * 100, 100);
  const peopleNeeded = neededPeople - numberSignedUp;
  const arePeopleNeeded = peopleNeeded > 0;
  const isFullStyle = arePeopleNeeded ? "not-full" : "full";

  return (
    <needed-people class={isFullStyle}>
      <percentage-covered style={{ width: `${percentage}%` }} />
      <people-needed-text>
        {arePeopleNeeded
          ? `Need ${peopleNeeded} more`
          : `We have everyone we need`}
      </people-needed-text>
    </needed-people>
  );
};
