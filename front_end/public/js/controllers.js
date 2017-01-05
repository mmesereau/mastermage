'use strict';

app.controller("HomeController", ["HomeService", "$state", "$rootScope", "$window", "$http", function(HomeService, $state, $rootScope, $window, $http) {
  var vm = this;
  vm.$state = $state;

  vm.getDecks = function() {
    $http.post("https://mastermage.herokuapp.com/deck/find", $rootScope.profile)
    .then(function(data) {
      vm.decks = data.data;
    })
    .catch(function(err) {
      console.log(err);
    });
  };

  vm.cardDisappear = function() {
    $("#responsive-cardpic").css("display", "none");
  }


  if ($window.localStorage.token) {
    vm.loggedIn = true;
    $rootScope.profile = HomeService.getProfile();
    console.log($rootScope.profile);
    vm.getDecks();
  }

  vm.logout = function() {
    delete $window.localStorage.token;
    vm.loggedIn = false;
  };

  vm.edit = function(index) {
    $rootScope.deck = vm.decks[index];
    $state.go('update');
  };

  vm.search = function() {
    var api = "https://api.deckbrew.com/mtg/cards"
    vm.card.replace(" ", "%20");
    $http.get(api + "?name=" + vm.card)
    .then(function(data) {
      $rootScope.searchResults = data.data;
      $state.go('search');
    })
    .catch(function(err) {
      console.log(err);
    });
  }
}]);

app.controller("RegisterController", ["RegisterService", "$state", "$rootScope", "$window", "$http", function(RegisterService, $state, $rootScope, $window, $http) {
  var vm = this;
  if ($window.localStorage.token) {
    $state.go("home");
  }
  vm.user = {};
  vm.usernameCheck = function() {
    $http.post("https://mastermage.herokuapp.com/register/username", vm.user)
    .then(function(data) {
      if (data.data === "Username Taken") {
        vm.takenUsername = true;
      }
      else {
        vm.takenUsername = false;
      }
    })
  }
  vm.emailCheck = function() {
    if (vm.user.email) {
      if (vm.user.email.indexOf('@') === -1 || vm.user.email.indexOf('.') === -1 || vm.user.email.indexOf('.') < vm.user.email.indexOf('@')) {
        vm.invalidEmail = true;
        $http.post("https://mastermage.herokuapp.com/register/email", vm.user)
        .then(function(data) {
          if (data.data === "Email Taken") {
            vm.takenEmail = true;
          }
          else {
            vm.takenEmail = false;
          }
        })
        .catch(function(err) {
          console.log(err);
        });
      }
      else {
        vm.invalidEmail = false;
      }
    }
  }
  vm.passwordCheck = function() {
    if (vm.user.password) {
      if (vm.user.password.length < 8 || vm.user.password.length > 12) {
        vm.invalidPassword = true;
      }
      else {
        vm.invalidPassword = false;
      }
    }
  }
  vm.register = function() {
    RegisterService.register(vm.user);
  }
}]);

app.controller("LoginController", ["LoginService", "$state", "$rootScope", "$window", "$http", function(LoginService, $state, $rootScope, $window, $http) {
  var vm = this;
  if ($window.localStorage.token) {
    $state.go("home");
  }
  vm.user = {};
  vm.login = function() {
    $http.post("https://mastermage.herokuapp.com/login", vm.user)
    .then(function(data) {
      if (data.data === "Incorrect Password") {
        vm.badPassword = true;
        vm.badUsername = false;
        vm.user.password = "";
      }
      else if (data.data === "Nonexistent Username") {
        vm.badUsername = true;
        vm.badPassword = false;
        vm.user.username = "";
        vm.user.password = "";
      }
      else if (data.data.token) {
        $window.localStorage.token = data.data.token;
        $state.go('home');
      }
      else {
        alert("Something has gone terribly wrong!");
      }
    })
    .catch(function(err) {
      console.log(err);
    });
  }
}]);

app.controller("SearchController", ["SearchService", "$state", "$rootScope", "$window", "$http", function(SearchService, $state, $rootScope, $window, $http) {
  var vm = this;

  $("#searchbar").innerText = "";
  if (!$rootScope.searchResults) {
    $state.go("home");
  }

  for (var i = 0; i < $rootScope.searchResults.length; i++) {
    if ($rootScope.searchResults[i].editions.length > 50) {
      console.log($rootScope.searchResults[i]);
      $rootScope.searchResults[i].editions.splice(1);
      $rootScope.searchResults[i].editions[0].set = "ALL EDITIONS";
    }
  }

  vm.showDecks = function(index) {
    $rootScope.searchResults[index].visibleDecks = true;
    if ($rootScope.profile) {
      $http.post("https://mastermage.herokuapp.com/deck/find", $rootScope.profile)
      .then(function(data) {
        vm.decks = data.data;
      })
      .catch(function(err) {
        console.log(err);
      });
    }
  };

  vm.addToDeck = function(deck, card) {
    var included = false;
    for (var i = 0; i < deck.deck.staging_area.length; i++) {
      if (deck.deck.staging_area[i].name === card.name) {
        included = true;
      }
    }
    if (!included) {
      card.quantity = 1;
      deck.deck.staging_area.push(card);
      $rootScope.deck = deck;
      $state.go('update');
    }
  }
}]);

app.controller("AdvancedController", ["AdvancedService", "$state", "$rootScope", "$window", "$http", function(AdvancedService, $state, $rootScope, $window, $http) {
  var vm = this;
  vm.options = {};
  vm.multicolor = false;
  vm.getOptions = function() {
    var api = "https://api.deckbrew.com/mtg/";
    $http.get(api + "sets")
    .then(function(data) {
      vm.options.sets = data.data;
      return $http.get(api + "types");
    })
    .then(function(data) {
      vm.options.types = data.data;
      return $http.get(api + "supertypes");
    })
    .then(function(data) {
      vm.options.supertypes = data.data;
      return $http.get(api + "subtypes");
    })
    .then(function(data) {
      vm.options.subtypes = data.data;
      return $http.get(api + "colors");
    })
    .then(function(data) {
      vm.options.colors = data.data;
      for (var i = 0; i < vm.options.colors.length; i++) {
        vm.criteria.colors.push(false);
      }
      return "done";
    })
    .catch(function(err) {
      console.log(err);
    });
  };
  vm.criteria = {
    format: [false, false, false, false, false],
    colors: [],
    rarity: [false, false, false, false],
    allcolors: [false]
  };
  vm.getOptions();
  vm.options.format = ["commander", "legacy", "vintage", "modern", "standard"];
  vm.options.rarity = ["common", "uncommon", "rare", "mythic"];
  vm.search = function() {
    AdvancedService.search(vm.criteria, vm.options);
  };
  vm.colorSwitch = function(index) {
    vm.criteria.colors[index] = !vm.criteria.colors[index];
    if (vm.criteria.colors[index]) {
      $("#color" + vm.options.colors[index]).css("background-color", vm.options.colors[index]);
    }
    else {
      $("#color" + vm.options.colors[index]).css("background-color", "transparent");
    }
    vm.colorLength();
  }
  vm.colorLength = function() {
    var selected = 0;
    for (var i = 0; i < vm.criteria.colors.length; i++){
      if (vm.criteria.colors[i]) {
        selected++;
      }
    }
    if (selected >= 2) {
      vm.multicolor = true;
    }
    else {
      vm.multicolor = false;
    }
  }
}]);

app.controller("NewDeckController", ["$state", "$http", "$rootScope", "$window", function($state, $http, $rootScope, $window) {
  var vm = this;
  if (!$window.localStorage.token) {
    $state.go('home');
  }
  vm.deck = {
    staging_area: [],
    included: [],
    sideboard: []
  };

  vm.add = function() {
    $http.post("https://mastermage.herokuapp.com/deck", {deck: vm.deck, user: $rootScope.profile})
    .then(function(data) {
      $rootScope.deck = data.data;
      $state.go('update');
    })
    .catch(function(err) {
      console.log(err);
    });
  };
}]);

app.controller("UpdateDeckController", ["$state", "$http", "$rootScope", "$window", function($state, $http, $rootScope, $window) {
  var vm = this;
  if (!$window.localStorage.token || !$rootScope.deck) {
    $state.go('home');
  }

  $rootScope.deck.stats = {
    formats: {
      commander: {
        name: "Commander",
        legal: true,
        illegalCards: [],
        visible: false
      },
      legacy: {
        name: "Legacy",
        legal: true,
        illegalCards: [],
        visible: false
      },
      vintage: {
        name: "Vintage",
        legal: true,
        illegalCards: [],
        visible: false
      },
      modern: {
        name: "Modern",
        legal: true,
        illegalCards: [],
        visible: false
      },
      standard: {
        name: "Standard",
        legal: true,
        illegalCards: [],
        visible: false
      }
    },
  };

  console.log($rootScope.deck);

  vm.cardTypes = [];

  $http.get("https://api.deckbrew.com/mtg/types")
  .then(function(data) {
    vm.types = data.data;
    vm.getStats();
  })
  .catch(function(err) {
    console.log(err);
  });

  vm.search = function() {
    var api = "https://api.deckbrew.com/mtg/cards"
    vm.searchCriteria.replace(" ", "%20");
    $http.get(api + "?name=" + vm.searchCriteria)
    .then(function(data) {
      console.log(data.data[0]);
      if (data.data[0]) {
        data.data[0].quantity = 1;
      }
      vm.searchResult = data.data[0];
      return;
    })
    .catch(function(err) {
      console.log(err);
    });
  };

  vm.add_to_staging_area = function(index) {
    var included = false;
    if (vm.searchResult.types && vm.searchResult.supertypes) {
      if (vm.searchResult.editions.length > 4) {
        vm.searchResult.editions.splice(4);
      }
    }
    if ($rootScope.deck.deck.staging_area) {
      for (var i = 0; i < $rootScope.deck.deck.staging_area.length; i++) {
        if ($rootScope.deck.deck.staging_area[i].name === vm.searchResult.name) {
          included = true;
        }
      }
      if (!included) {
        $rootScope.deck.deck.staging_area.push(vm.searchResult);
        vm.searchCriteria = "";
      }
    }
    vm.update();
  };

  vm.update = function() {
    $http.put("https://mastermage.herokuapp.com/deck", $rootScope.deck)
    .then(function(data) {
      vm.getStats();
    })
    .catch(function(err) {
      console.log(err);
    });
  };

  vm.remove = function(index) {
    $rootScope.deck.deck.staging_area.splice(index, 1);
    vm.update();
  };

  vm.add = function(index, area) {
    var card = $rootScope['deck']['deck'][area][index];
    if (card.types && card.supertypes) {
      if (card.types[0] === "land" && card.supertypes[0] === "basic") {
        vm.basicLand = true;
      }
      else {
        vm.basicLand = false;
      }
    }
    else {
      vm.basicLand = false;
    }

    if (vm.basicLand || card.quantity < 4) {
      $rootScope['deck']['deck'][area][index].quantity++;
    }
    vm.update();
  };

  vm.subtract = function(index, area) {
    $rootScope['deck']['deck'][area][index].quantity--;
    vm.update();
  };

  vm.include = function(index) {
    var included = false;
    for (var i = 0; i < $rootScope.deck.deck.included.length; i++) {
      if ($rootScope.deck.deck.included[i].name === $rootScope.deck.deck.staging_area[index].name) {
        included = true;
      }
    }
    if (!included) {
      $rootScope.deck.deck.included.push($rootScope.deck.deck.staging_area[index]);
    }
    $rootScope.deck.deck.staging_area.splice(index, 1);
    vm.update();
  };

  vm.stage = function(index) {
    $rootScope.deck.deck.staging_area.push($rootScope.deck.deck.included[index]);
    $rootScope.deck.deck.included.splice(index, 1);
    vm.update();
  };

  vm.deleteDeck = function() {
    $http.delete("https://mastermage.herokuapp.com/deck/" + $rootScope.deck._id)
    .then(function(data) {
      $state.go('home');
    })
    .catch(function(err) {
      console.log(err);
    });
  };

  vm.showCard = function(index, area) {
    var src = $rootScope['deck']['deck'][area][index]['editions'][0]['image_url'];
    $("#cardpic").attr("src", src).css("display", "inline");
  }

  vm.hideCard = function() {
    $("#cardpic").css("display", "none");
  };

  vm.stats = false;

  vm.showStats = function() {
    vm.stats = !vm.stats;
  };

  vm.getStats = function() {
    $rootScope.deck.stats.quantity = 0;
    vm.cardTypes = [];
    for (var i = 0; i < vm.types.length; i++) {
      vm.cardTypes.push({name: vm.types[i], quantity: 0});
    }
    for (i = 0; i < $rootScope.deck.deck.included.length; i++) {
      vm.cardTypes[vm.types.indexOf($rootScope.deck.deck.included[i].types[0])].quantity += $rootScope.deck.deck.included[i].quantity;
      $rootScope.deck.stats.quantity += $rootScope.deck.deck.included[i].quantity;
    }
    vm.checkLegality();
    $rootScope.deck.stats.types = vm.cardTypes;
  };

  vm.checkLegality = function() {
    for (var i in $rootScope.deck.stats.formats) {
      if ($rootScope.deck.stats.formats[i].name === "Commander") {
        $rootScope.deck.stats.formats[i].legal = true;
        var total = 0;
        for (var j = 0; j < $rootScope.deck.deck.included.length; j++) {
          if ($rootScope.deck.deck.included[j].supertypes) {
            if ($rootScope.deck.deck.included[j].quantity > 1 && !($rootScope.deck.deck.included[j].types.includes('land') && $rootScope.deck.deck.included[j].supertypes.includes('basic'))) {
              $rootScope.deck.stats.formats[i].legal = false;
            }
          }
          else {
            $rootScope.deck.stats.formats[i].legal = false;
          }
          total += $rootScope.deck.deck.included[j].quantity;
        }
        if (total < 100) {
          $rootScope.deck.stats.formats[i].legal = false;
        }
      }
      else {
        $rootScope.deck.stats.formats[i].illegalCards = [];
        $rootScope.deck.stats.formats[i].legal = true;
        for (var j = 0; j < $rootScope.deck.deck.included.length; j++) {
          var legal = false;
          if (Object.keys($rootScope.deck.deck.included[j].formats).includes(i)) {
            legal = true;
          }
          if (!legal) {
            $rootScope.deck.stats.formats[i].legal = false;
            $rootScope.deck.stats.formats[i].illegalCards.push($rootScope.deck.deck.included[j]);
          }
        }
        if ($rootScope.deck.stats.quantity < 60) {
          $rootScope.deck.stats.formats[i].legal = false;
        }
      }
    }
  };

  vm.showLegality = function(format) {
    format.visible = !format.visible;
  };

  vm.makeLegal = function(format) {
    for (var i = 0; i < format.illegalCards.length; i++) {
      for (var j = 0; j < $rootScope.deck.deck.included.length; j++) {
        if ($rootScope.deck.deck.included[j].name === format.illegalCards[i].name) {
          $rootScope.deck.deck.included.splice(j, 1);
        }
      }
      $rootScope.deck.deck.staging_area.push(format.illegalCards[i]);
    }
    vm.update();
  };

  vm.public = function() {
    if ($rootScope.deck.public) {
      $rootScope.deck.public = false;
    }
    else {
      $rootScope.deck.public = true;
    }
    console.log($rootScope.deck);
    vm.update();
  }

}]);

app.controller("PublicController", ['$http', '$state', '$rootScope', '$window',function($http, $state, $rootScope, $window) {
  var vm = this;

  if ($state.$current.name === "view" && !$rootScope.deck) {
    $state.go("public");
  }

  $http.get('https://mastermage.herokuapp.com/deck/public')
  .then(function(data) {
    vm.decks = data.data;
    console.log(vm.decks);
  })
  .catch(function(err) {
    console.log(err);
  });

  vm.upvote = function(index) {
    if ($rootScope.profile) {
      if (!vm.decks[index].upvoters.includes($rootScope.profile.username)) {
        vm.decks[index].votes++;
        vm.decks[index].upvoters.push($rootScope.profile.username);
        if (vm.decks[index].downvoters.includes($rootScope.profile.username)) {
          vm.decks[index].votes++;
          vm.decks[index].downvoters.splice(vm.decks[index].downvoters.indexOf($rootScope.profile.username), 1);
        }
      }
      vm.update(index);
    }
    else {
      $state.go("login");
    }
  }

  vm.downvote = function(index) {
    if ($rootScope.profile) {
      if (!vm.decks[index].downvoters.includes($rootScope.profile.username)) {
        vm.decks[index].votes--;
        vm.decks[index].downvoters.push($rootScope.profile.username);
        if (vm.decks[index].upvoters.includes($rootScope.profile.username)) {
          vm.decks[index].votes--;
          vm.decks[index].upvoters.splice(vm.decks[index].upvoters.indexOf($rootScope.profile.username), 1);
        }
      }
      vm.update(index);
    }
    else {
      $state.go("login");
    }
  }

  vm.update = function(index) {
    $http.put("https://mastermage.herokuapp.com/deck", vm.decks[index])
    .then(function(data) {
      vm.getStats();
    })
    .catch(function(err) {
      console.log(err);
    });
  };

  vm.view = function(index) {
    console.log(vm.decks[index]);
    $rootScope.deck = vm.decks[index];
    $state.go("view");
  };

}]);

app.controller("ViewController", ['$http', '$state', '$rootScope', '$window',function($http, $state, $rootScope, $window) {
  var vm = this;

  if (!$rootScope.deck) {
    $state.go("public");
  }

  console.log($rootScope.deck);

  vm.stats = false;
  if (!$rootScope.deck.comments) {
    $rootScope.deck.comments = [];
  }

  vm.upvote = function() {
    if ($rootScope.profile) {
      if (!$rootScope.deck.upvoters.includes($rootScope.profile.username)) {
        $rootScope.deck.votes++;
        $rootScope.deck.upvoters.push($rootScope.profile.username);
        if ($rootScope.deck.downvoters.includes($rootScope.profile.username)) {
          $rootScope.deck.votes++;
          $rootScope.deck.downvoters.splice($rootScope.deck.downvoters.indexOf($rootScope.profile.username), 1);
        }
      }
      vm.update();
    }
    else {
      $state.go("login");
    }
  }

  vm.downvote = function(index) {
    if ($rootScope.profile) {
      if (!$rootScope.deck.downvoters.includes($rootScope.profile.username)) {
        $rootScope.deck.votes--;
        $rootScope.deck.downvoters.push($rootScope.profile.username);
        if ($rootScope.deck.upvoters.includes($rootScope.profile.username)) {
          $rootScope.deck.votes--;
          $rootScope.deck.upvoters.splice($rootScope.deck.upvoters.indexOf($rootScope.profile.username), 1);
        }
      }
      vm.update();
    }
    else {
      $state.go("login");
    }
  }

  vm.update = function() {
    $http.put("https://mastermage.herokuapp.com/deck", $rootScope.deck)
    .then(function(data) {
      console.log($rootScope.deck);
    })
    .catch(function(err) {
      console.log(err);
    });
  };

  vm.showCard = function(index) {
    $("#cardpic").attr("src", $rootScope.deck.deck.included[index].editions[0].image_url).css("display", "inline");
  }

  vm.hideCard = function() {
    $("#cardpic").css("display", "none");
  };

  vm.smallCard = function(index) {
    if ($(window).width() < $(window).height()) {
      $("#responsive-cardpic").attr("src", $rootScope.deck.deck.included[index].editions[0].image_url).css("display", "inline");
    }
  }

  vm.comment = function() {
    if (!$rootScope.profile) {
      $state.go("login");
    }
    else {
      vm.commentForm = true;
    }
  };

  vm.addComment = function() {
    console.log($rootScope.profile.username);
    $rootScope.deck.comments.push({username: $rootScope.profile.username, content: vm.newComment, cards: []});
    vm.commentForm = false;
    vm.newComment = "";
    // vm.lookForCards($rootScope.deck.comments.length - 1);
    vm.update();
  };

  vm.cancel = function() {
    vm.commentForm = false;
    vm.newComment = "";
  };

  vm.edit = function(index) {
    vm.editor = null;
    // vm.lookForCards(index);
    vm.update();
  };

  // vm.lookForCards = function(index) {
  //   console.log($rootScope.deck.comments, index);
  //   var card = $rootScope.deck.comments[index].content.slice($rootScope.deck.comments[index].content.indexOf("<") + 1, $rootScope.deck.comments[index].content.indexOf(">"));
  //   if ($rootScope.deck.comments[index].content.includes("<") && $rootScope.deck.comments[index].content.includes(">")) {
  //     // console.log($rootScope.deck.comments[index].content.slice($rootScope.deck.comments[index].content.indexOf("<") + 1, $rootScope.deck.comments[index].content.indexOf(">")));
  //     $http.get("https://api.deckbrew.com/mtg/cards?name=" + card.replace(" ", "%20"))
  //     .then(function(data) {
  //       for (var i = 0; i < data.data.length; i++) {
  //         if (data.data[i].name.toLowerCase() === card.toLowerCase()) {
  //           console.log(card);
  //           var included = false;
  //           for (var j = 0; j < $rootScope.deck.comments[index].cards.length; j++) {
  //             if ($rootScope.deck.comments[index].cards[j].name.toLowerCase() === card.toLowerCase()) {
  //               console.log("this card is already part of the object");
  //               included = true;
  //             }
  //           }
  //           if (!included) {
  //             console.log("adding to the object");
  //             $rootScope.deck.comments[index].cards.push(data.data[i]);
  //           }
  //         }
  //       }
  //     })
  //     .catch(function(err) {
  //       console.log(err);
  //     });
  //   }
  // };

  vm.delete = function(index) {
    $rootScope.deck.comments.splice(index, 1);
    vm.editor = null;
    vm.update();
  }

}]);

app.controller("SettingsController", ["$rootScope", "$http", "$state", "$window", function($rootScope, $http, $state, $window) {
  var vm = this;
  vm.changePassword = function() {
    if (vm.password && vm.new && vm.repeat) {
      if (vm.new === vm.repeat) {
        $http.post("https://mastermage.herokuapp.com/changePassword", {password: vm.password, new: vm.new, username: $rootScope.profile.username})
        .then(function(data) {
          $state.go("home");
        })
        .catch(function(err) {
          console.log(err);
        })
      }
    }
  }
}]);
