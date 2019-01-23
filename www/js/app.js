// Default colors
var brandPrimary = '#20a8d8';
var brandSuccess = '#4dbd74';
var brandInfo = '#63c2de';
var brandWarning = '#f8cb00';
var brandDanger = '#f86c6b';
var mintColor = '#00C49E';

var grayDark = '#2a2c36';
var gray = '#55595c';
var grayLight = '#818a91';
var grayLighter = '#d1d4d7';
var grayLightest = '#f8f9fa';

angular.module('app', [
  'ionic', 
  'app.controllers', 
  'app.routes', 
  'app.directives', 
  'app.services', 
  'firebase', 
  'firebaseConfig', 
  'ngCordovaOauth', 
  'ngOpenFB',
  'angular-rating-icons'
])

  .config(function ($ionicConfigProvider, $sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['self', '*://www.youtube.com/**', '*://player.vimeo.com/video/**']);
    $ionicConfigProvider.tabs.position('bottom');
  })

  .run(['$rootScope', '$state', '$ionicPlatform', '$openFB', 'config', 'api',
    function ($rootScope, $state, $ionicPlatform, $openFB, config, api) {
      (function (d) {
        // load the Facebook javascript SDK

        var js,
          id = 'facebook-jssdk',
          ref = d.getElementsByTagName('script')[0];

        if (d.getElementById(id)) {
          return;
        }

        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";

        ref.parentNode.insertBefore(js, ref);

      }(document));

      $rootScope.user = firebase.auth().currentUser || JSON.parse(window.localStorage.getItem('firebase:authUser'));

      Object.keys(localStorage)
      .map(function(key) { 
        if(key.includes("firebase:authUser")) {
            $rootScope.user = JSON.parse(localStorage.getItem(key));
        }
      });

      if(!$rootScope.user) $rootScope.user = firebase.auth().currentUser;
      if(!$rootScope.user) $state.go('auth');
      else $state.go('tabs.main');

      $ionicPlatform.ready(function () {
        $rootScope.config = config;

        $openFB.init({
          appId: '180052556272819',
          channelUrl: 'templates/channel.html',
          status: true,
          cookie: true,
          xfbml: true
        });

        if (window.cordova && window.cordova.plugins) {
          // cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          // cordova.plugins.Keyboard.disableScroll(true);

          cordova.plugins.firebase.messaging.requestPermission().then(function (token) {
            cordova.plugins.firebase.messaging.onMessage(function (data) {
              cordova.plugins.notification.local.schedule({
                title: data.title,
                text: data.message
              });
  
              api.saveNotification(data, $rootScope.user);
            });
          });
        }
        if (window.StatusBar) {
          StatusBar.backgroundColorByHexString("#F7613C");
          StatusBar.styleLightContent();
        }
      });
    }])