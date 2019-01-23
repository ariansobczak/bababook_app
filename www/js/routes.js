angular.module('app.routes', ['ionicUIRouter'])

  .config(function ($stateProvider, $urlRouterProvider) {
    // $urlRouterProvider.otherwise('/tabs/main')

    $stateProvider
      .state('auth', {
        url: '/auth',
        templateUrl: 'templates/auth.html',
        controller: 'authCtrl'
      })

      .state('tabs', {
        url: '/tabs',
        templateUrl: 'templates/tabs.html',
        abstract: true
      })

      .state('tabs.books', {
        url: '/books',
        views: {
          'books': {
            templateUrl: 'templates/books.html',
            controller: 'booksCtrl'
          }
        }
      })

      .state('tabs.book', {
        url: '/book',
        views: {
          'books': {
            templateUrl: 'templates/book.html',
            controller: 'bookCtrl'
          }
        },
        params: {
          book: null
        }
      })

      .state('tabs.profile', {
        url: '/profile',
        views: {
          'profile': {
            templateUrl: 'templates/profile.html',
            controller: 'profileCtrl'
          }
        }
      })

      .state('tabs.events', {
        url: '/events',
        views: {
          'events': {
            templateUrl: 'templates/events.html',
            controller: 'eventsCtrl'
          }
        }
      })

      .state('tabs.notifications', {
        url: '/notifications',
        views: {
          'notifications': {
            templateUrl: 'templates/notifications.html',
            controller: 'notificationsCtrl'
          }
        }
      })

      .state('tabs.main', {
        url: '/main',
        views: {
          'main': {
            templateUrl: 'templates/main.html',
            controller: 'mainCtrl'
          }
        }
      })
  });