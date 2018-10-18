import React from "react";
import firebase from "firebase/app";
import firebaseui from "firebaseui";

import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";

const uiConfig = {
  signInFlow: "popup",
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
  callbacks: {
    signInSuccessWithAuthResult: () => {}
  }
};

const Login = () => (
  <StyledFirebaseAuth
    className="login-container"
    uiConfig={uiConfig}
    firebaseAuth={firebase.auth()}
  />
);
export default Login;
