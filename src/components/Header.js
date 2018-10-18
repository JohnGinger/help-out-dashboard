import React from "react";
import logo from "./logo.png";
import "./Header.scss";
const Header = ({ user, signOut }) => (
  <header>
    <img src={logo} alt="logo" />
    {user.id && (
      <user-container>
        Hi {user.name}
        <button onClick={() => signOut()}>logout</button>
      </user-container>
    )}
  </header>
);
export default Header;
