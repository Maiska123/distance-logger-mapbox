// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "***REMOVED***",
    authDomain: "***REMOVED***",
    databaseURL: "***REMOVED***",
    projectId: "bin-map-mapbox",
    storageBucket: "bin-map-mapbox.appspot.com",
    messagingSenderId: "***REMOVED***",
    appId: "1:***REMOVED***:web:16e9fe824e050050eb5ff9",
    measurementId: "***REMOVED***"
  },

  mapbox: {
    accessToken: '***REMOVED***'
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
