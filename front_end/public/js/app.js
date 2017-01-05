'use strict';

var app = angular.module("MTGApp", ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider
  .state('home', {
    url: '/',
    templateUrl: '../templates/home.html',
    controller: 'HomeController',
    controllerAs: 'HC'
  })
  .state('login', {
    url: '/login',
    templateUrl: '../templates/login.html',
    controller: 'LoginController',
    controllerAs: 'LC'
  })
  .state('register', {
    url: '/register',
    templateUrl: '../templates/register.html',
    controller: 'RegisterController',
    controllerAs: 'RC'
  })
  .state('search', {
    url: '/search',
    templateUrl: '../templates/search.html',
    controller: 'SearchController',
    controllerAs: 'SC'
  })
  .state('advanced', {
    url: '/advanced',
    templateUrl: '../templates/advanced.html',
    controller: 'AdvancedController',
    controllerAs: 'AC'
  })
  .state('new', {
    url: '/new',
    templateUrl: '../templates/adddeck.html',
    controller: 'NewDeckController',
    controllerAs: 'NC'
  })
  .state('update', {
    url: '/update_deck',
    templateUrl: '../templates/editdeck.html',
    controller: 'UpdateDeckController',
    controllerAs: 'UC'
  })
  .state('public', {
    url: '/public',
    templateUrl: '../templates/public.html',
    controller: 'PublicController',
    controllerAs: 'PC'
  })
  .state('view', {
    url: '/view',
    templateUrl: '../templates/view.html',
    controller: 'ViewController',
    controllerAs: 'VC'
  })
  .state('settings', {
    url: '/settings',
    templateUrl: '../templates/settings.html',
    controller: 'SettingsController',
    controllerAs: 'SC'
  });
});

// app.config(['$httpProvider', function($httpProvider) {
//   $httpProvider.interceptors.push('authInterceptor');
// }]);
