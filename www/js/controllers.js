angular.module('app.controllers', [])
  .controller('booksCtrl', [
    '$scope', '$state', '$stateParams', '$window', '$rootScope', '$ionicLoading', '$firebaseArray', 'api',
    function ($scope, $state, $stateParams, $window, $rootScope, $ionicLoading, $firebaseArray, api) {
      $scope.details = function (book) {
        $state.go('tabs.book', { book: book });
      }

      api.getBooks().then(function (books) {
        $scope.books = books;
      });


    }])

  .controller('bookCtrl', ['$scope', '$state', '$stateParams', '$rootScope', 'api',
    function ($scope, $state, $stateParams, $rootScope, api) {
      $scope.b = $stateParams.book;
      console.log($rootScope.user);

      $scope.requestBorrow = function (l) {
        api.requestBorrow(l, $rootScope.user)
          .then(function (params) {
            l.requested = true;
            navigator.notification.alert(
              `Your reqest to book "${l.title}" was sent.`,
              (s) = {},
              'Request to book',
              'Done'
            );
          })
      }

    }])

  .controller('profileCtrl', ['$scope', '$state', '$rootScope', 'api',
    function ($scope, $state, $rootScope, api) {
      api.getUserInfo($rootScope.user)
        .then(function (user) {
          $scope.userInfo = user;
          console.log(user);
        })

      $scope.signout = function () {
        firebase.auth().signOut()
        $rootScope.userToken = {};
        $rootScope.user = {};
        $state.go('auth');

      }
    }])

  .controller('mainCtrl', ['$scope', '$rootScope', 'api', 'config',
    function ($scope, $rootScope, api, config) {
      $scope.getLent = function() {
        api.getMyLend($rootScope.user)
        .then(function (lended) {
          $scope.lended = lended.map(function (l) {
            l.reminded = false;
            $scope.$broadcast('scroll.refreshComplete');
            return l;
          })
        })
      }
      $scope.getLent();

      $scope.requestForExtend = function (l) {
        api.requestForExtend(l)
          .then(function name(params) {
            l.requested = true;
            navigator.notification.alert(
              `Your reqest to extend return time for book "${l.book.title}" was sent.`,
              (s) = {},
              'Extend borrow request',
              'Done'
            );
          })
      }
      $scope.remindMe = function (wtr) {
        wtr.reminded = true;
        cordova.plugins.notification.local.schedule({
          title: `Book return reminder`,
          text: `Remebere to return book ${wtr.book.title} TOMORROW!`,
          icon: wtr.book.cover,
          trigger: { at: $rootScope.config.remindNow ? moment().toDate() : moment(wtr.returnDate).subtract(1, 'day') }
        });
        navigator.notification.alert(
          `Baba will notify you one day before the due date (${moment(wtr.returnDate).subtract(1, 'day').format('dddd, DD MMM YYYY')})`,
          (s) = {},
          'Baba will remember',
          'Thank you Baba'
        );
        api.saveNotification({
          title: `Baba will remember about ${wtr.book.title}`,
          message: `Baba will notify you to return ${wtr.book.title}!`,
        }, $rootScope.user)
      }
    }])

  .controller('notificationsCtrl', ['$scope', 'api',
    function ($scope, api) {
      api.getUserNotifications()
        .then(function (notifications) {
          $scope.notifications = notifications
        })
    }])



  .controller('eventsCtrl', ['$scope', '$state', '$stateParams', '$window', '$rootScope', '$ionicLoading', '$firebaseArray', 'api', function ($scope, $state, $stateParams, $window, $rootScope, $ionicLoading, $firebaseArray, api) {
    api.getEvents().then(function (events) {
      $scope.events = events;
    });
    $scope.cantGoEvent = function (evnt) {
      api.cantGoEvent(evnt, $rootScope.user)
    }
    $scope.goEvent = function (evnt) {
      api.goEvent(evnt, $rootScope.user).catch(function (e) {
        alertt(JSON.stringify(e))
      })
    }
    $scope.moment = moment;

    $scope.canParticipate = function (event) {
      if (!event.participants) event.participants = {};
      var userGoes = Object.keys(event.participants).includes($rootScope.user.uid);
      return !userGoes;
    }
  }])

  .controller('authCtrl', ['$scope', '$rootScope', '$state', '$window', 'api',
    function ($scope, $rootScope, $state, $window, api) {

      var provider = new firebase.auth.FacebookAuthProvider();
      // provider.setCustomParameters({
      //   'display': 'popup'
      // });
      $scope.$on('$ionicView.enter', function () {
        if (window.StatusBar) {
          StatusBar.hide();
        }
      });

      $scope.login = function () {
        firebase.auth()
          .signInWithPopup(provider)
          .then(function (result) {
            $rootScope.userToken = result.credential.accessToken;
            $rootScope.user = result.user;

            api.addUser(result.user)
              .then(function () {
                $state.go('tabs.profile');
              })
              .catch(function (e) {
                console.log(e);

              })

          }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
          });
      };
    }])