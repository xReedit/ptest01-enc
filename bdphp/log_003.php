<?php
	//log registrar encuesta
	// ini_set('session.use_strict_mode', 1);
    $sid = md5('restobar-encuesta-session');
    session_id($sid);
    session_start();
	// session_start();	
	header('content-type: text/html; charset: utf-8');
	header('Content-Type: text/event-stream');
	header('Cache-Control: no-cache');
	include "ManejoBD.php";

	// if (isset($_SESSION['nombd'])) {
	$bd=new xManejoBD('restobar');
	// }

	date_default_timezone_set('America/Lima');

	$op = $_GET['op'];	
	$ido =$_POST['o'];
	$idsede = $_POST['s'];
	$idEncuesta = $_POST['e'];

	// $bdNom = 'restobar';
	// if ($_POST['d']==='d') {$bdNom = 'restobar_demo';}
	// $bd=new xManejoBD($bdNom);
	// $_SESSION['nombd']=$bdNom;

    switch ($op) {
		case '0':// prepar variables					
				// $_SESSION['ido']=$_POST['o'];
				// $_SESSION['idsede']=$_POST['s'];

				$bdNom = 'restobar';
				if ($_POST['d']==='d') {$bdNom = 'restobar_demo';}
				$_SESSION['nombd']=$bdNom;
				$bd=new xManejoBD($_SESSION['nombd']);

				// ip local
				$sql="SELECT preguntas from encuesta_sede_conf where idencuesta_sede_conf=$idEncuesta";
				$bd->xConsulta($sql);				
				return;
			break;
		case '1': //respuesta predefinidas		
			$sql="select * from encuesta_respuesta where estado=0";			
			$bd->xConsulta($sql);
			break;
		case '101':
			$sql="select * from encuesta_sede_conf where idsede=$idsede and estado=0";
			$bd->xConsulta($sql);
			break;
		case '102': // guardar encuesta
			$id = $_POST['i'];
			$item = json_encode($_POST['item']);
			$sql="call procedure_save_encuesta($id, '".$item."')";
			$bd->xConsulta($sql);
			break;
		case '103': //count encuestas enviadas
			$id = $_POST['i'];
			$sql = "SELECT count(idencuesta_resultados) res from encuesta_resultados where idencuesta_sede_conf=$id";
			$bd->xConsulta($sql);
			break;
	}

?>