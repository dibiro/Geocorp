$(window).resize(function() {
  $("#mapa").css("width", $( ".container" ).width()).css("height", $( window ).height()-$("#atender").height());
});
$("#mapa").css("width", $( ".container" ).width()).css("height", $( window ).height()-$("#atender").height());

var Geocorp = angular.module("Geocorp", []);
var actual = {};

Geocorp.controller('listado', function($scope, $http) {
  var have_select = true
  if (typeof(localStorage["select"]) != "undefined") {
    $scope.select = JSON.parse(localStorage["select"]);
    $scope.$apply();
    have_select = true;
  } else {
    have_select = false;
    $scope.select = {};
    $scope.select.atendiendo = false;
    $scope.select.atendiendo_mensaje = "Atender";
    $scope.select.mensaje = "La primera Ubcacion mostrada esde la emergencia mas cercana";
  }
  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  var divMapa = document.getElementById('mapa');
  var gLatLon;
  var intlatitude;
  var intlongitude;
  var gMapa;
  var directionsDisplay = new google.maps.DirectionsRenderer();
  $scope.lista = [];

  function fn_mal () {
    console.log('fail')
  }

  function fn_ok ( rta ){
    intlatitude = rta.coords.latitude;
    intlongitude = rta.coords.longitude;
    gLatLon = new google.maps.LatLng( intlatitude, intlongitude);
    var objConfig = {
        zoom: 20,
        center: gLatLon
    } 
    gMapa = new google.maps.Map( divMapa, objConfig );
    directionsDisplay.setMap(gMapa);
    $http({
      method: 'GET',
      url: 'http://geocorp-jm.codeanyapp.com/geolocations/index.json'
    }).then(function successCallback(response) {
      var separador = 1;
      $.each(response.data.geolocations, function(index, val) {
        separador++
        setTimeout(
          function() {
            var request = {
              origin: {lat: parseFloat(intlatitude), lng: parseFloat(intlongitude)},
              destination: {lat: parseFloat(val.latitud), lng: parseFloat(val.longitud)},
              travelMode: google.maps.TravelMode.DRIVING
            };
            var directionsService = new google.maps.DirectionsService();
            directionsService.route(request, function(response, status) {
              if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                $scope.lista.push({
                  center: val,
                  response: response,
                  mapa: directionsService,
                  distancia: directionsDisplay.directions.routes[0].legs[0].distance.value,
                  distancia_text: directionsDisplay.directions.routes[0].legs[0].distance.text,
                });
                $scope.lista.sort(function(a, b) {
                    return parseFloat(a.distancia) - parseFloat(b.distancia);
                });
                // Display the route on the map.
                if (have_select) {
                  directionsDisplay.setDirections($scope.select.center.response)
                }else {
                  directionsDisplay.setDirections($scope.lista[0].response);
                  $scope.selet = $scope.lista[0]
                  $scope.$apply();
                }
              }
            });
          }, 
          1000*separador
        )
      });
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  }
  $scope.llamar = function (x) {
    $scope.select = x;
    directionsDisplay.setDirections(x.response);
    $scope.select.mensaje = "Usted Seleciono a";
    $scope.select.atendiendo = false;
    $scope.select.atendiendo_mensaje = "Atender";
  }
  $scope.atender = function(x) {
    $.ajax({
      url: 'http://geocorp-jm.codeanyapp.com/geolocations/delete/'+x.center.id,
      type: 'POST',
      dataType: 'json',
    })
    .done(function() {
      console.log("Reguistro Eliminado");
      $.each($scope.lista, function(index, val) {
        if (val.center.id==x.center.id) {
          $scope.lista.splice( index, 1 );
        }
      });
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });
    localStorage["select"] = JSON.stringify(x);
    $scope.select.atendiendo = true;
    $scope.select.atendiendo_mensaje = "Atendida";
    $scope.select.mensaje = "Usted Esta Atendiendo A";
  }
  $scope.atendida = function(x) {
    localStorage.removeItem("select");
    try {
      $scope.select = $scope.lista[0];
    }
    catch(err) {
      $scope.select = {};
    }
    $scope.select.atendiendo = false;
    $scope.select.atendiendo_mensaje = "Atender";
    $scope.select.mensaje = "La primera Ubcacion mostrada esde la emergencia mas cercana";
  }
});