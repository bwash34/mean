angular
.module('loc8rApp')
.controller('homeCtrl', homeCtrl);

function homeCtrl($scope, loc8rData, geolocation) {
  let vm = this;
  vm.pageHeader = {
    title: 'Loc8r',
    strapline: 'Find places to work with wifi near you!'
  };
  vm.sidebar = {
    content: "Looking for wifi and a seat, blah blah blah"
  };

  vm.message = "Checking your location";

  vm.getData = function(position) {
    let lat = position.coords.latitude;
    let lng = position.coords.longitude;

    vm.message = "Searching for nearby places.";
    
    loc8rData.locationByCoords(lat, lng)
    .then((data) => {
      console.log(data);
      vm.message = data.data.length > 0 ? "" : "No locations found";
      vm.data = { locations: data.data };
    }, (e) => {
      vm.message = "Sorry, something's gone wrong";
      console.log(e);
    });
  };

  vm.showError = function(error) {
    $scope.$apply(function() {
      vm.message = error.message;
    });
  };

  vm.noGeo = function() {
    $scope.$apply(function() {
      vm.message = "Geolocation not supported by this browser.";
    });
  };

  geolocation.getPosition(vm.getData, vm.showError, vm.noGeo);
}