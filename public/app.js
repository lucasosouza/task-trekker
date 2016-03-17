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

//filtro que recebe segundos e retorna string
app.filter('converteTimer', function($filter){
	return function(input) {
		var days = Math.floor(input/86400); var rem = input % 86400
		var hours = Math.floor(rem/3600); rem = rem % 3600
		var mins = Math.floor(rem/60); 
		var secs = rem%60;
		return (1e4+days+"").slice(-2) + ":" + (1e4+hours+"").slice(-2) + ":" + (1e4+mins+"").slice(-2) + ":" + (1e4+secs+"").slice(-2) 
	}
})

app.filter('converteMinutos', function($filter){
	return function(input) {
		return Math.floor(input/60)
	}
})

