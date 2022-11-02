// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyD00UvCmupFx9iw3gumGdU1BtZNaDurYXQ",
    authDomain: "bin-map-mapbox.firebaseapp.com",
    databaseURL: "https://bin-map-mapbox-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bin-map-mapbox",
    storageBucket: "bin-map-mapbox.appspot.com",
    messagingSenderId: "262739108476",
    appId: "1:262739108476:web:16e9fe824e050050eb5ff9",
    measurementId: "G-GPJ9D2W9BW"
  },

  mapbox: {
    accessToken: 'pk.eyJ1IjoibWFpc2thIiwiYSI6ImNrbjVsejZoeDA1ZjMycXA0ODBoZDB6MXIifQ.gBswgnTLapLXXy-NHdESdg'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
