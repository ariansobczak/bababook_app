angular.module('firebaseConfig', ['firebase'])
  .run(function () {
    var config = {
      apiKey: "AIzaSyD-gTUhW17HLnSElOulKeUgEyQQSOJN3kQ",
      authDomain: "bookify-aac93.firebaseapp.com",
      databaseURL: "https://bookify-aac93.firebaseio.com",
      projectId: "bookify-aac93",
      storageBucket: "bookify-aac93.appspot.com",
      messagingSenderId: "1051030206984"
    };
    firebase.initializeApp(config);
  })
