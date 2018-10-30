import React from "react";
import "./NeededPeople.scss";

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
export default NeededPeople;
