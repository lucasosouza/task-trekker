//initialize app
var app = angular.module('timeTrekker', ['firebase'])

app.filter('numberFixedLen', function () {
    return function(a,b){
        return(1e4+a+"").slice(-b);
    };
});

//create controller
app.controller('mainCtrl', function($scope, $http, $firebaseArray, $interval){

	var ref = new Firebase("https://time-trekker.firebaseio.com")
	$scope.dados = $firebaseArray(ref)
	var registroNovo = true

	//why go through all this? in 30 minutes I could have coded my own timer
	$scope.timer = {
		secs: 0,
		mins: 0,
		hrs: 0,
		days: 0
	}

	var inicio;
	$scope.inicia = function(reg){
		console.log('inicio')
		inicio = $interval(function(){
			adicionaSegundo(reg)
		},1000)
	}

	$scope.para = function(){
		$interval.cancel(inicio)
		inicio = undefined
	}

	function adicionaSegundo(reg) {
		//adiciona segundo
		if (reg.timer.secs < 59) {
			reg.timer.secs = reg.timer.secs + 1
		} else if (reg.timer.secs == 59) {
			reg.timer.secs = 0
			//adiciona minuto
			if (reg.timer.mins < 59) {
				reg.timer.mins++
			} else if (reg.timer.mins == 59) {
				reg.timer.mins = 0
				//adiciona hora
				if (reg.timer.hrs < 23) {
					reg.timer.hrs++
				} else if (reg.timer.hrs == 23) {
					reg.timer.hrs = 0
					//adiciona dia
					reg.timer.days++
				}
			}
		}
		reg.tempoRealizado = reg.timer.secs/60 + reg.timer.mins + reg.timer.hrs*60 + reg.timer.days*60*24
		//console.log(reg.timer)
		//console.log(reg.tempoRealizado)
	}

	$scope.novoRegistro = function(){
		$scope.reg = {
			timer: {
				secs: 0,
				mins: 0,
				hrs: 0,
				days: 0
			}
		};
		registroNovo = true
		//console.log($scope.reg)
	}

	$scope.editaRegistro = function(id){
		$scope.reg = $scope.dados.$getRecord(id);
		registroNovo = false;
	}

	$scope.deletaRegistro = function(reg){
		$scope.reg = $scope.dados.$remove(reg);
	}

	$scope.enviaRegistro = function(reg){
		console.log('enviandoRegistro', reg)
		reg.tempoRealizado = reg.timer.mins + reg.timer.hrs*60 + reg.timer.days*60*24
		if (registroNovo) {
			$scope.dados.$add(reg)
		} else {
			$scope.dados.$save(reg)
		}
	}

	$scope.novoRegistro()


})