To deploy a new website

Setup a firebase account and login https://firebase.google.com/docs/cli/

Create a new project at https://console.firebase.google.com

Change .firebaserc to the name of the project you just created (instead of help-out-dashboard)
Your site is hosted at https://[help-out-dashboard].firebaseapp.com

Remember to change homepage in package.json to the url above

To deploy a version run `yarn build`

If you want to run locally then run `yarn start`
