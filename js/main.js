var Geocorp = angular.module("Geocorp", []);
var actual = {};

Geocorp.controller('listado', function($scope, $http) {
  if (typeof(localStorage["paciente"]) != "undefined") {
    window.location.replace("paciente.html");
  }else if (typeof(localStorage["select"]) != "undefined") {
    window.location.replace("user.html");
  }else {
    $http({
        method: 'GET',
        url: 'http://geocorp-jm.codeanyapp.com/patients/index.json'
    }).then(function successCallback(response) {
      $scope.patients = response.data.patients;

    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  }
  $scope.login = function() {
    $.ajax({
      url: 'http://geocorp-jm.codeanyapp.com/users/home.json',
      type: 'POST',
      dataType: 'json',
      data: {
        email: $scope.email,
        password: $scope.password,
      },
    })
    .done(function(data) {
      console.log(data);
    })
    .fail(function() {

    })
    .always(function() {

    });
  }
  $scope.buscar_paciente = function() {
    var result = $.grep($scope.patients, function(e){ return e.people.cedula == $scope.cedula; });
    if (result.length == 0) {
      $scope.mensaje_error_paciente = "El Paciente No Esta Reguistrado"
    } else if (result.length == 1) {
      localStorage["paciente"] = JSON.stringify(result[0]);
      setTimeout(function(argument) {
        window.location.replace("paciente.html");
      }, 500)
    }
  }
  
});