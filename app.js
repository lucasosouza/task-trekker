//initialize app
var app = angular.module('timeTrekker', ['firebase'])

app.filter('numberFixedLen', function () {
    return function(a,b){
        return(1e4+a+"").slice(-b);
    };
});

app.filter('porProjeto', function() {
	return function(input, selecionado) {
		return input.filter(function(elem, idx, array){
			if ((elem.projeto) == selecionado) {
				return elem
			}
		})
	}
})

app.filter('formataData', function($filter){
	return function(input){
		$filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss')
		if (input) {
			return $filter('date')(new Date(input), 'dd/MM/yyyy')
		}
		return input
	}
})


//create controller
app.controller('mainCtrl', function($scope, $http, $firebaseArray, $interval){

	var ref = new Firebase("https://time-trekker.firebaseio.com")
	var refRegistros = ref.child('registros')
	var refProjetos = ref.child('projetos')
	$scope.dados = $firebaseArray(refRegistros)
	$scope.projetos = $firebaseArray(refProjetos)
	$scope.mostraRegistroForm = true;
	var registroNovo = true

	//my very own timer
	var inicio;
	var relogios = {}
	$scope.inicia = function(reg){
		console.log('inicio')
		relogios[reg.$id] = $interval(function(){
			adicionaSegundo(reg)
		},999) //1 milisegundo para processamento, a headstart for the timer
	}

	$scope.zera = function(reg){
		reg.timer.days = 0;
		reg.timer.hrs = 0;
		reg.timer.mins = 0;
		reg.timer.secs = 0;
		atualizaTempoRealizado(reg)
		salvaRegistro(reg)		
	}

	$scope.add5 = function(reg){
		if (reg.timer.mins < 55) {
			reg.timer.mins = reg.timer.mins+5
		} else {
			reg.timer.mins = 0 + (reg.timer.mins-55)
			//adiciona hora
			if (reg.timer.hrs < 23) {
				reg.timer.hrs++
			} else if (reg.timer.hrs == 23) {
				reg.timer.hrs = 0
				//adiciona dia
				reg.timer.days++
			}
		}
		atualizaTempoRealizado(reg)
		salvaRegistro(reg)		
	}

	$scope.del5 = function(reg){
		if (reg.tempoRealizado < 5) {
			reg.timer.days = 0;
			reg.timer.hrs = 0;
			reg.timer.mins = 0;
			reg.timer.secs = 0;
		} else {
			//remove minutos
			if (reg.timer.mins >= 5) {
				reg.timer.mins = reg.timer.mins-5
			} else {
				reg.timer.mins = 60 - (5-reg.timer.mins)
				//remove hora
				if (reg.timer.hrs > 0) {
					reg.timer.hrs--
				} else {
					reg.timer.hrs = 23
					//remove dia
					reg.timer.days--
				}
			}
		}
		atualizaTempoRealizado(reg)
		salvaRegistro(reg)
	}

	$scope.para = function(reg){
		$interval.cancel(relogios[reg.$id])
		relogios[reg.$id] = undefined
		console.log('parando relogio')
		atualizaTempoRealizado(reg)
		salvaRegistro(reg)
	}

	function salvaRegistro(reg){
		$scope.dados.$save(reg).then(function(ref){
			console.log('Salvo com sucesso: ', ref)
		}, function(error){
			console.log('Erro: ', error)
		})
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
		atualizaTempoRealizado(reg)
		if ((reg.timer.secs == 0) || (reg.timer.secs == 30)){
			salvaRegistro(reg)
		}
	}

	function atualizaTempoRealizado(reg){
		reg.tempoRealizado = reg.timer.mins + reg.timer.hrs*60 + reg.timer.days*60*24
	}

	$scope.novoRegistro = function(){
		$scope.reg = {
			timer: {
				secs: 0,
				mins: 0,
				hrs: 0,
				days: 0
			},
			dataPlanejada: new Date(),
			dataConcluida: new Date()
		};
		registroNovo = true
		if (!$scope.mostraRegistroForm) {
			$scope.mostraRegistroForm = true;
		} else {
			$scope.mostraRegistroForm = false;
		}
	}

	$scope.editaRegistro = function(id){
		$scope.reg = $scope.dados.$getRecord(id);
		//converte data ao carregar
		$scope.reg.dataPlanejada = new Date($scope.reg.dataPlanejada)
		$scope.reg.dataConcluida = new Date($scope.reg.dataConcluida)
		//marcadores
		registroNovo = false;
		$scope.mostraRegistroForm = true;
	}

	$scope.deletaRegistro = function(reg){
		$scope.reg = $scope.dados.$remove(reg);
	}

	$scope.enviaRegistro = function(reg){
		//converte data antes de salvar
		console.log(reg.dataPlanejada, reg.dataConcluida)
		reg.dataPlanejada = reg.dataPlanejada.toISOString();
		reg.dataConcluida = reg.dataConcluida.toISOString();
		console.log(reg.dataPlanejada, reg.dataConcluida)
		//salva
		console.log('enviandoRegistro', reg)	
		if (registroNovo) {
			$scope.dados.$add(reg)
		} else {
			salvaRegistro(reg)
		}
		$scope.mostraRegistroForm = false
	}

	$scope.enviaProjeto = function(projeto) {
		$scope.projetos.$add(projeto);
		$scope.novoProjeto = '';
	}

	$scope.novoRegistro()

})