'use strict';

app.service("HomeService", ["$window", "$state", "$http", function($window, $state, $http) {
  var sv = this;
  sv.getProfile = function() {
    return JSON.parse(atob($window.localStorage.token.split('.')[1]));
  };

  sv.logout = function() {
    delete $window.localStorage.token;
    $state.go("home");
  };


}]);

app.service("LoginService", ["$window", "$state", "$http", function($window, $state, $http) {
  var sv = this;
}]);

app.service("RegisterService", ["$window", "$state", "$http", function($window, $state, $http) {
  var sv = this;
  sv.register = function(user) {
    $http.post("https://mastermage.herokuapp.com/register", user)
    .then(function(data) {
      if (data.data === "Existing Username") {

      }
      $window.localStorage.token = data.data.token;
      $state.go("home");
    })
    .catch(function(err) {
      console.log(err);
    })
  }
}]);

app.service("SearchService", ["$window", "$state", "$http", function($window, $state, $http) {
  var sv = this;
}]);

app.service("AdvancedService", ["$window", "$state", "$http", "$rootScope", function($window, $state, $http, $rootScope) {
  var sv = this;
  sv.search = function(criteria, options) {
    var api = "https://api.deckbrew.com/mtg/cards?";
    for (var i = 0; i < criteria.colors.length; i++) {
      if (criteria.colors[i]) {
        api += "color=" + options.colors[i] + "&";
      }
    }
    for (i = 0; i < criteria.format.length; i++) {
      if (criteria.format[i]) {
        api += "format=" + options.format[i] + "&";
      }
    }
    for (i = 0; i < criteria.rarity.length; i++) {
      if (criteria.rarity[i]) {
        api += "rarity=" + options.rarity[i] + "&";
      }
    }
    if (criteria.set) {
      for (var i = 0; i < criteria.set.length; i++) {
        api += "set=" + criteria.set[i] + "&";
      }
    }
    if (criteria.type) {
      for (var i = 0; i < criteria.type.length; i++) {
        api += "type=" + criteria.type[i] + "&";
      }
    }
    if (criteria.name) {
      api += "name=" + criteria.name.replace(" ", "%20") + "&";
    }
    if (criteria.oracle) {
      api += "oracle=" + criteria.oracle.replace(" ", "%20") + "&";
    }
    if (criteria.allcolors[0]) {
      api += "multicolor=true&";
    }
    api = api.slice(0, -1);
    $http.get(api)
    .then(function(data) {
      $rootScope.searchResults = data.data;
      $state.go('search');
    })
    .catch(function(err) {
      console.log(err);
    });
  }
}]);
