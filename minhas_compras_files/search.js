$(function(){
	//Subscriber
	var Hinter = (function(){
		var val = '';

		function hide(element){
			element.removeClass('input-loading').parent().children('.wrapper-advanced-search').remove();
		}

		function products(data, urlLoja, ExibePreco){
			var ul = $('<ul/>', {'class':'advanced-search-list'}),
				list = [];

			$.each(data, function(index, element){
				
				if (typeof ExibePreco !== 'undefined' && !ExibePreco) {
					element.CatalogoProduto.valor_inicio = '';
				}

				var li = $('<li />', { 'class': 'advanced-search-item' }),
				 	a = $('<a />', {
							href : urlLoja+'/'+element.CatalogoProduto.slug,
							html: "<span class='product-image'><img src='"+base_url_image+"/sku/thumb_"+element.ImagemPerfil.name+"'></span>"+
						 	      "<span class='product-name'>"+element.CatalogoProduto.nome+"</span>"+
								  "<span class='product-price'>"+element.CatalogoProduto.valor_inicio+"</span>"
						});

				list.push(li.append(a));
			});

			return ul.append(list);
		}

		function categories(data, urlLoja){
			var ul = $('<ul/>', {'class':'advanced-search-categories'}),
				list = [];	

			$.each(data, function(index, element){
				var li = $('<li />', { 'class': 'advanced-search-category-item' }),
				 	a = $('<a />', {
							href: urlLoja+'/'+element.CatalogoCategoria.slug,
							html: "<span>"+element.CatalogoCategoria.nome+"</span>"
						});
				 	
					list.push(li.append(a));
			});

			return ul.append(list);
		}

		function suggestions(data, element){
			var mainDiv = $('<div/>', {'class': 'advanced-search'}),
				parent = $(element).parent(),
				wrapper =  $('<div />', {'class': 'wrapper-advanced-search'});

			parent.children('.wrapper-advanced-search').remove();
			
			if(data.CatalogoProduto){
				parent.append(wrapper.append(
					mainDiv.append([
						categories(data.CatalogoCategoria, data.urlLoja),
						'<div class="advanced-search-header"><span class="advanced-search-title">Produtos Sugeridos</span></div>',
						products(data.CatalogoProduto, data.urlLoja, data.ExibePreco)
					])
				));
			}
		}

		function hint(){
			var element = this;
			var pixelAtivo = (typeof fbq !== 'undefined');
			var gaAtivo = (typeof gtag !== 'undefined');

			if(!$(element).hasClass('input-loading')){
				$(element).addClass('input-loading');
			}

			ProductModel.hint(this.value, null, function(data){
				$(element).removeClass('input-loading');
				suggestions(data, element);

				if(gaAtivo){					
					gtag('event', 'search', {
						"search_term": element.value
					});
				}

				if(pixelAtivo){
					fbq('track', 'Search');
				}
			});
		}

		function erase(){
			var element = $(this);
			hide(element);			
		}

		function focusOut(){
			var element = $(this);
			hide(element);		
		}

		function notify(type, element, event){
			switch(type){
				case 'hint':
					hint.call(element, event);
				break;

				case 'erase':
					erase.call(element, event);
				break;

				case 'focusOut':
					focusOut.call(element, event);
				break;
			}
		}

		return { notify : notify };

	})();

	//Publisher
	var SearchEvt = (function(){
		var started = false,
			counter = 0,
			intervalId = 0,
			subscribers = {'hint': [], 'erase': [], 'focusOut': []};

		function validateKey(element, e){
			var counter = element.value.length,
				validKCode = /[a-zA-Z0-9-_:\s\b]/,
				kCode = String.fromCharCode(e.which).match(validKCode);
			
			return ((element.value && counter >= 3  && !e.ctrlKey && !e.altKey) && (kCode || typeof e.which === 'undefined'));
		};


		function checkHint(element, e){
			if(intervalId){
				clearTimeout(intervalId);
			}

			if(validateKey(element, e)){
				intervalId = setTimeout(function(){ 
					publish('hint', element, e); 	
					
					$(document).click(function(e){ 
						$(document).unbind('click'); 
						publish('focusOut', element, e); 
					});

				}, 500);
			}
		}

		function keyCallback(e){
			var element = this;
				keyVal = element.val;
				checkHint(element, e);

			if(counter < 3 && started && e.which == 8){
				$(document).unbind('click');
				publish('erase', element, e);
				started = false;
			}else{
				started = true;
			}

		};


		function subscribe(type, object){
			if(subscribers[type]){
				subscribers[type].push(object);
			}else{
				return false;
			}
		};

		function publish(type, element, event){
			var subLen = subscribers[type].length;

			for(var i = 0; i < subLen; i++){
				var obj = subscribers[type][i];
					obj.notify(type, element, event);
			}

		};

		var field = $('.search-field');
			field.on('keydown', keyCallback);

		return { subscribe : subscribe };

	})();
	
	SearchEvt.subscribe('hint', Hinter);
	SearchEvt.subscribe('erase', Hinter);
	SearchEvt.subscribe('focusOut', Hinter);
});