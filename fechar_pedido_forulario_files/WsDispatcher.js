/**
	 * @copyright     D Loja Virtual
	 * @link          http://www.dlojavirtual.com
	 * @package       app.FrontEnd.Js
	 * @since         v 1.0
	 * @author        Bruno Lehnen Simões
	*  @description   Revealing modules responsaveis pelo roteamento e pelas requisições aos Web Services
**/

var WsRouter = (function(){
	function getParameters(parameters){
		var self = this;
		parameters = ($.isArray(parameters)) ? parameters.join('/') : parameters;
		
		if(parameters === null){
			parameters = '';
		}
	
		return parameters;
	};

 	function getUri(plugin, controller, action, parameters){
		var uri = ''; 
		
		if(controller){
			uri += controller+'/';
		}
		if(action){
			uri+= action+'/';
		}
		if(parameters){
			uri+= getParameters(parameters);	
		}
		if(plugin){
			uri = plugin+'/'+uri;
		}


		return base_url+uri;
	};

	function generateRoute(plugin, controller, action, parameters){
		return {
			plugin: plugin,
			controller: controller,
			action: action,
			parameters: parameters
		}
	};

	return {
		getUri: getUri,
		generateRoute: generateRoute
	};

})();

var WsDispatcher = (function(){
	function filterWsData(data){
		var buffer = new Array(),
			dLen = data.CatalogoCarrinhoProduto.length;
		
		for(var i = 0; i < dLen; i++){
			var prod = data.CatalogoCarrinhoProduto[i];			
			
			if(typeof prod.CatalogoCarrinhoProduto.paridade === 'undefined'){
				prod.CatalogoCarrinhoProduto.paridade = 1;
			}

			buffer[i] = {
				'valor_unitario' : prod.CatalogoCarrinhoProduto.valor_unitario,
 				'produto_estoque_id' : parseInt(prod.CatalogoCarrinhoProduto.estoque_id),
				'produto_id': parseInt(prod.Estoque.produto_id),
				'nome_produto': prod.CatalogoCarrinhoProduto.nome_produto,
				'altura' : parseFloat(prod.CatalogoCarrinhoProduto.altura),	
				'largura' : parseFloat(prod.CatalogoCarrinhoProduto.largura),
				'comprimento' : parseFloat(prod.CatalogoCarrinhoProduto.comprimento),
				'peso' : parseFloat(prod.CatalogoCarrinhoProduto.peso_unitario),
				'quantidade' : prod.CatalogoCarrinhoProduto.paridade == 1 ? parseInt(prod.CatalogoCarrinhoProduto.quantidade_produto) : parseFloat(prod.CatalogoCarrinhoProduto.quantidade_produto),
				'tempo_producao' : parseInt(prod.CatalogoCarrinhoProduto.tempo_producao),
				'estoque_disponivel': parseInt(prod.Estoque.quantidade), 
				'estoque_avancado': prod.CatalogoCarrinhoProduto.estoque_avancado,
				'estoque_situacao': parseInt(prod.CatalogoCarrinhoProduto.estoque_situacao),
				'estoque_situacao_sem': parseInt(prod.CatalogoCarrinhoProduto.estoque_situacao_sem),
				'tipo_cupom' : prod.CatalogoCarrinhoProduto.tipo_cupom,
				'cupom' : prod.CatalogoCarrinhoProduto.codigo_cupom
			}
		}
		
		return buffer;
	};

	function request(route, beforeCallback, successCallback){
			var self = this;

			App.initCallback(beforeCallback, self, self);
			
			return $.getJSON(WsRouter.getUri(route.plugin, route.controller, route.action, route.parameters), function(data){ App.initCallback(successCallback, data, self); });	
	};

	 function postRequest(route, data, beforeCallback, successCallback){
		var self = this;
		App.initCallback(beforeCallback, self, self);

		return $.ajax({
			url : WsRouter.getUri(route.plugin, route.controller, route.action, route.parameters),
			type : 'POST',
			data : data,
			dataType : 'JSON',
			success: function(data){
				App.initCallback(successCallback, data, self); 
			}
		});
	}
	
	return {
		request : request,
		postRequest: postRequest,
		filterWsData: filterWsData
	}

})();