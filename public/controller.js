//create controller
app.controller('mainCtrl', function($scope, $http, $firebaseArray, $interval){

	var ref = new Firebase("https://time-trekker.firebaseio.com")
	var refRegistros = ref.child('registros')
	var refProjetos = ref.child('projetos')
	var refCalendario = ref.child('calendario')
	$scope.dados = $firebaseArray(refRegistros)
	$scope.projetos = $firebaseArray(refProjetos)
	$scope.calendario = $firebaseArray(refCalendario)
	$scope.mostraRegistroForm = true;
	var registroNovo = true
	var horaInicial;
	var relogioDia;

	//could have used $bindTo for 3-way data binding instead of assigning the variable to a scope variable

	//my very own timer
	var inicio;
	var relogios = {}
	$scope.inicia = function(reg){
		console.log('inicio');
		horaInicial = new Date();
		//inicia relogio da atividade
		relogios[reg.$id] = $interval(function(){
			adicionaSegundo(reg)
		},1000)
		//inicia relogio do dia
		relogioDia = $interval(function(){
			adicionaSegundo(reg)
		},1000)
	}

	$scope.zera = function(reg){
		reg.timer = 0;
		salvaRegistro(reg)		
	}

	$scope.add5 = function(reg){
		reg.timer = reg.timer + 300
		$scope.regDia.timer = $scope.regDia.timer + 300
		salvaRegistro(reg)
	}

	$scope.del5 = function(reg){
		if (reg.timer < 300) {
			reg.timer = 0
			$scope.regDia.timer = 0
		} else {
			reg.timer = reg.timer - 300
			$scope.regDia.timer = $scope.regDia.timer - 300
		}
		salvaRegistro(reg)
	}

	$scope.para = function(reg){
		$interval.cancel(relogios[reg.$id])
		relogios[reg.$id] = undefined
		$interval.cancel(relogioDia)
		relogioDia = undefined
		salvaRegistro(reg)
	}

	function salvaRegistro(reg){
		//salva reg
		$scope.dados.$save(reg).then(function(ref){
			console.log('Salvo com sucesso: ', ref)
		}, function(error){
			console.log('Erro: ', error)
		})
		//salva dia
		$scope.calendario.$save($scope.regDia).then(function(ref){
			console.log('Salvo com sucesso: ', ref)
		}, function(error){
			console.log('Erro: ', error)
		})
	}

	function adicionaSegundo(reg) {
		//calcula diferença e corrige o timer
		var secs = Math.round((new Date() - horaInicial)/1000)
		reg.timer = reg.timer + secs
		$scope.regDia.timer = $scope.regDia.timer + secs
		horaInicial = new Date()
		if ((reg.timer.secs == 0) || (reg.timer.secs == 30)){
			salvaRegistro(reg)
		}
	}

	$scope.novoRegistro = function(){
		$scope.reg = {
			timer: 0,
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

	//dia
	//abre o aplicativo, verifica se o dia
	function verificaDia(){
		var dia = new Date().toISOString().slice(0, 10);
		//verifica se já existe
		$scope.calendario.$loaded(function(){
			angular.forEach($scope.calendario, function(k, v){
				console.log('kdia', k.dia)
				console.log('dia', dia)
				if (k.dia == dia) {
					console.log('on if') 
					$scope.regDia = $scope.calendario.$getRecord(k.$id)
				}
			})
			//se não, cria um novo
			if (!$scope.regDia) {
				$scope.calendario.$add({ timer: 0, dia: dia }).then(function(ref){
					$scope.regDia = $scope.calendario.$getRecord(ref.key());
				})					
			}
		})
	}

	$scope.reiniciaDia = function(){
		$scope.dados.$remove($scope.regDia);
		var dia = new Date().toISOString().slice(0, 10);
		$scope.calendario.$add({ timer: 0, dia: dia }).then(function(ref){
			$scope.regDia = $scope.calendario.$getRecord(ref.key());
		})							
	}

	verificaDia()

})