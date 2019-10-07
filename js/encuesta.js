
var repeat = false, LaEncuesta, listRpt, xIdEncuesta, countPreguntasTotal=0, ListRespuestas = [], cantidadEncuestas=90, timeInactivo=0;

window.addEventListener('replaceState', function(e) {
    console.warn('THEY DID IT AGAIN!');
});

$(document).ready(function() {	
	// 
	getDataO();
	
	
	$('.carousel').carousel({
		interval: 0,
		touch: false,
		keyboard: false,
		wrap: false,		
		cycle: true
	});

	$('.carousel').on('slide.bs.carousel', function (e) {
		if (e.from === countPreguntasTotal) {
			// guardar			
			setTimeout(() => {							
				xSaveE();
			}, 4000);
		}
	  })
	  window.onpopstate = function(event) {
		history.pushState(null, document.title, location.href);
	};
	
	// xPrepararData();
});

function xSaveE() {
	console.log('ListRespuestas', JSON.stringify(ListRespuestas));

	$.ajax({
		url: './bdphp/log_003.php?op=102',
		type: 'POST',
		data: {item: ListRespuestas, i: xIdEncuesta}
	})
	.done((res) => {
		console.log(res);
		cantidadEncuestas = JSON.parse(res).datos[0].res;
		$("#cantEncuestas").text('Personas que opinaron: ' + cantidadEncuestas.toString().padStart(5, 0));
		xInitSlider();
	});
}

function xInitSlider() {
	if( repeat ) {
		var initial = $('#item-i').attr('data-slide-to', 0);		
		var final = $('.carousel-item.active').attr('data-slide-to', 0);
		final.removeClass('active');
		initial.addClass('active');
	}

	clearInterval(timeInactividad);
	ListRespuestas = [];
	txt_comentario.value = '';
}

function countEncuestas() {
	$.ajax({
		url: './bdphp/log_003.php?op=103',
		type: 'POST',
		data: {i: xIdEncuesta}
	})
	.done((res) => {
		cantidadEncuestas = JSON.parse(res).datos[0].res;
		$("#cantEncuestas").text('Personas que opinaron: ' + cantidadEncuestas.toString().padStart(5, 0));
	});
}

function getDataO() {
	// _repeat = getUrlParameter('r', '?');
	_data_o = getUrlParameter('o', '?');
	_data_o = JSON.parse(atob(_data_o));

	repeat = _data_o.r ? exampleModalCenter === 0 ? false : true : false;
	xIdEncuesta = _data_o.e;

	if ( !xIdEncuesta ) { // seleccionar encuesta
		$.ajax({
			url: './bdphp/log_003.php?op=101',
			type: 'POST',
			data: _data_o
		})
		.done((res) => {
			const listEncuestas = JSON.parse(res).datos;
			var xLiEncuesta = '';
			if (listEncuestas.length === 1) {
				xIdEncuesta = listEncuestas[0].idencuesta_sede_conf;
				_data_o.e = xIdEncuesta;
				xShowVista();
			} else {
				// opcion seleccionar encuesta
				const idLocal = window.localStorage.getItem('sys::e');				
				
				listEncuestas.map(x => {
					xLiEncuesta = String(xLiEncuesta + `<li class="xli" data-id="${x.idencuesta_sede_conf}" onclick="selectEncuesta(${x.idencuesta_sede_conf})">${x.nombre}</li>`)
				});
				$('#listE').html(xLiEncuesta).trigger('create');
				
				if ( idLocal ) {
					selectEncuesta(idLocal);
					return;
				}

				// $('#exampleModalCenter').modal('show');
				xshowDialog();
			}
			
		});
	} else {
		xShowVista();
	}
	
}

function xshowDialog() {
	$('#exampleModalCenter').modal('show');
}

function selectEncuesta(id) {
	_data_o.e = id;
	xIdEncuesta = id;	
	$('#exampleModalCenter').modal('hide');
	xShowVista();

	window.localStorage.setItem('sys::e', id);
}

function xShowVista() {
	setTimeout(() => {		
		$("body").addClass("loaded");	
	}, 300);

	xPrepararData();
}

function xPrepararData() {
	
	$.ajax({
		url: './bdphp/log_003.php?op=1',
		type: 'POST'
	})
	.done((res) => {
		listRpt = JSON.parse(res).datos;
		console.log('preguntas', listRpt);
		xLoadPreuguntas();
		countEncuestas();
	});
	
	
}

function xLoadPreuguntas() {

	var _rpt = '';
	listRpt.map((r, i)=> {
		_rpt = String(_rpt + `<div class="divBtn" onclick="xNextPregunta(this)" data-index=${i}>
			<img src="img/${r.img}" class="btnIco" alt="${i}">
			<span>${r.descripcion}</span>
		</div>`);
	});

	$.ajax({
		url: './bdphp/log_003.php?op=0',
		type: 'POST',
		data: 
	})
	.done((res) => {
		LaEncuesta = JSON.parse(res);
		LaEncuesta = JSON.parse(LaEncuesta.datos[0].preguntas);
		console.log(LaEncuesta);
		
		var _pregunta = '',listPreguntas='', listIndicador='';

		//inicio
		var itemIni = `<div class="carousel-item active" id="item-i">					
					<h1 id="txt_ini">${LaEncuesta.inicio}</h1>
					<br>
					<img src="./img/reactions_1.gif">
					<br><br>
					<div class="text-center p-3">
						<button class="btn btn-success" onclick="xInitSliderEncuesta(this)"><h4>Listo, Comenzar</h4></button>
					</div>	
					<p id="cantEncuestas">Encuestas enviadas: ${cantidadEncuestas}</p> 				
				</div>`;
		// $('#txt_inicio').text(LaEncuesta.inicio);
		listPreguntas = itemIni;
		listIndicador = `<li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>`;

		// preguntas
		countPreguntasTotal = LaEncuesta.preguntas.length;
		var countPreguntas = countPreguntasTotal-1, itemRpt = '', rptTextArea;		


		rptTextArea = `<div><textarea id="txt_comentario" style="width: 70%;" id="txt_comentario" cols="100" rows="3"></textarea><br><br>
		<button class="btn btn-success" onclick="xNextPregunta(this, true)"><h4>Listo, Enviar</h4></button></div>`;


		LaEncuesta.preguntas.map((x, i) => {
			listIndicador = String(listIndicador + `<li data-target="#carouselExampleIndicators" data-slide-to="${i+1}"></li>`);

			itemRpt = countPreguntas > i ? _rpt : rptTextArea;

			_pregunta = `<div class="carousel-item" data-index="${i}">
			<h1>${x.pregunta}</h1>
			<div class="text-center p-3 d-inline-flex">
				${itemRpt}
			</div>
		  </div>`;

		  listPreguntas = String(listPreguntas + _pregunta)
		});

		//final
		var itemFinal = `<div class="carousel-item" id="item-f">
					<h1 id="txt_fin">${LaEncuesta.fin}</h1>                                
				</div>`;		

		listIndicador = String(listIndicador + `<li data-target="#carouselExampleIndicators" data-slide-to="${LaEncuesta.preguntas.length+1}"></li>`);
		listPreguntas = String(listPreguntas + itemFinal)

		//build
		$('#listIndicadores').html(listIndicador).trigger('create');
		$('#listPreguntas').html(listPreguntas).trigger('create');

	});
}

function xNextPregunta(obj, isPregunta=true) {	
	if (isPregunta) {
		initTimeInactivo = 0;
		const index = parseInt(obj.dataset.index);
		const isComentario = isNaN(index) ? 1 : 0;
		const indexPregunta = isComentario === 0 ? parseInt(obj.parentNode.parentNode.dataset.index): parseInt(obj.parentNode.parentNode.parentNode.dataset.index);
		const idencuesta_respuesta = isComentario === 0 ? listRpt[index].idencuesta_respuesta : 0;
		const rpt = {
			idencuesta_pregunta: LaEncuesta.preguntas[indexPregunta].idencuesta_pregunta,
			idencuesta_respuesta: idencuesta_respuesta,
			iscomentario: isComentario,
			comentario: txt_comentario.value || ''
		}
		ListRespuestas.push(rpt);
	}	

	setTimeout(() => {	
		$('.carousel').carousel('next');
	}, 350);
}

function xInitSliderEncuesta(obj) {
	xNextPregunta(obj, false);
	xInitTimeInactividad();
}

function xTiemInactividad() {	
	initTimeInactivo ++;
	if (initTimeInactivo > 20) {
		xInitSlider();
	}
}

function xInitTimeInactividad() {
	initTimeInactivo = 0;
	timeInactividad = setInterval(xTiemInactividad, 1000);
}

function getUrlParameter(sParam,simbolo) {
	var sPageURL = window.location.href;
	sPageURL=sPageURL.replace('-',' ');
	var sURLVariables = sPageURL.split(simbolo);
	for (var i = 0; i < sURLVariables.length; i++)
		{ var sParameterName = sURLVariables[i].split('=');
			if (sParameterName[0] == sParam) { return sParameterName[1]; } }
}
