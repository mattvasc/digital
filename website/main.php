<?php
	session_start();
	if(!isset($_SESSION["autenticado"]) || $_SESSION["autenticado"] != 1)
	{
		session_destroy();
		header("Location: http://leris.sor.ufscar.br/digital");
    die();
	}

?>


<!doctype html>
<html>
<head>
<link href="http://leris.sor.ufscar.br/digital/src/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.0/css/all.css" integrity="sha384-lKuwvrZot6UHsBSfcMvOkWwlCMgc0TaWr+30HWe3a4ltaBwTZhyTEggF5tJv8tbt" crossorigin="anonymous">
<meta charset="utf8">
<title> Sistema de Digital </title>
<link rel="shortcut icon" type="image/png" href="http://leris.sor.ufscar.br/digital/src/32px-Fingerprint.png"/>
</head>
<body>
  <!--Modal de notificação  -->
	<div id="aviso_modal" class="modal fade" role="dialog" tabindex="-1">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h4 class="modal-title">Aviso</h4>
				</div>
				<div class="modal-body">

				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default bg-info text-white" tabindex="-1" data-dismiss="modal">OK</button>
				</div>
			</div>
		</div>
	</div>
	<!-- fim da modal de notificação -->

	<!--Modal de crud  -->
	<div id="crud_modal" class="modal fade" role="dialog" tabindex="-1">
		<div class="modal-dialog">
			<!-- Modal content-->
			<div class="modal-content">
				<div class="modal-header">
					<h4 class="modal-title">Editar</h4>
				</div>
				<div class="modal-body">
				<form class="form-horizontal">
					<div class="form-group">
						<label class="col-md-4 control-label" for="mnome">Nome:</label>  
						<div class="col-md-4">
							<input id="mnome"  placeholder="Insira o Nome aqui..." class="form-control input-md" type="text" required>
						</div>
					</div>

					
					<div class="form-group">
					<label class="col-md-4 control-label" for="memail">Email:</label>  
					<div class="col-md-4">
					<input id="memail" placeholder="Insira o Email aqui..." class="form-control input-md" type="email" required>
					</div>
					</div>

					<div class="form-group">
					<label class="col-md-4 control-label" for="mphone">Telefone:</label>  
					<div class="col-md-4">
					<input id="mphone" placeholder="(Opcional)" class="form-control input-md" type="text">
					</div>
					</div>
				</form>
				</div>
				<div class="modal-footer">
					
				</div>
			</div>
		</div>
	</div>
	<!-- fim da crud modal -->

	<!--Modal de digitais  -->
	<div id="finger_modal" class="modal fade" role="dialog" tabindex="-1">
		<div class="modal-dialog">
			<!-- Modal content-->
			<div class="modal-content">
				<div class="modal-header">
					<h4 class="modal-title">Gerenciar Digitais</h4>
				</div>
				<div class="modal-body">
						Dedos já cadastrados: <br>
						Polegar direito ----- <a>Apagar</a><br><br>
						<input type="button" value="cadastrar novo dedo">

				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default bg-info text-white" tabindex="-1" data-dismiss="modal">Fechar</button>
				</div>
			</div>
		</div>
	</div>
	<!-- fim da modal de digitais -->




<button class="btn btn-lg btn-primary btn-signout" onclick="logoff();">Logoff</button>
<button class="btn btn-lg btn-primary btn-signout" onclick="location.href='http://leris.sor.ufscar.br/digital/logs.php';">Ver logs de acesso</button>
<button class="btn btn-lg btn-primary btn-signout hiddenbeforeload" onclick="abrirCrud(-1);">Cadastrar novo usuário</button>
<button class="btn btn-lg btn-primary btn-signout" onclick="location.href='http://leris.sor.ufscar.br/digital/download	.php';">Baixar Cliente</button>

<style>
.fa-delete:hover {
    color: red;
}
.fa-dedo:hover {
    color: blue;
}.fa-lapis:hover {
    color: brown;
}
</style>
<table class="table hiddenbeforeload" id="maintable">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Nome</th>
      <th scope="col">Email</th>
			<th scope="col">Telefone</th>
			<th scope="col">Último Acesso</th>
			<th scope="col" align="center">Editar</th>
			<th scope="col" align="center">Dedos</th>
    <th scope="col">Apagar</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>
<form action="http://leris.sor.ufscar.br/digital/controller.php" method="POST" id="invisibleform">
	<input type="hidden" name="action" value="logout">
</form>

<script src="http://leris.sor.ufscar.br/digital/src/jquery-3.3.1.min.js"></script>
<script src="http://leris.sor.ufscar.br/digital/src/bootstrap.min.js"></script>
<script>
	$(".hiddenbeforeload").hide();

function logoff(){
	$("#invisibleform").submit();
}

function formatDate(date) {
  var monthNames = [
    "Janeiro", "Fevereiro", "Março",
    "Abril", "Maio", "Junho", "Julho",
    "Agosto", "Setembro", "Outubro",
    "Novembro", "Dezembro"
  ];
  return date.getDate() + ' de ' + monthNames[date.getMonth()] + ' de ' + date.getFullYear() + " às " + date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

function abrirCrud(personid){
	if(personid == -1){
		$("#crud_modal .modal-title").html("Cadastrar Usuário");
		$("#mnome").val("");
		$("#memail").val("");
		$("#mphone").val("");
		$("#crud_modal .modal-footer").html(
		'<button type="button" class="btn btn-default bg-success text-white" onclick="cadastrar_usuario()">Cadastrar</button>'+
		'<button type="button" class="btn btn-default bg-danger text-white" data-dismiss="modal">Cancelar</button>');
	}
		else{
			$('#crud_modal .modal-title').html('Editar Usuário');
			$("#mnome").val(($("#p"+personid + " td:nth-child(2)").html()));
			$("#memail").val(($("#p"+personid + " td:nth-child(3)").html()));
			$("#mphone").val( ($("#p"+personid + " td:nth-child(4)").html()!='---'?$("#p"+personid + " td:nth-child(4)").html():"" )  );
			$("#crud_modal .modal-footer").html(
			'<button type="button" class="btn btn-default bg-success text-white" onclick="alterar_usuario()">Alterar</button>'+
			'<button type="button" class="btn btn-default bg-danger text-white" data-dismiss="modal">Cancelar</button>');
		}
		$('#crud_modal').modal('show');
}

function abrirFinger(personid){
	$("#finger_modal").modal("show");
}

function abrirDelete(personid){
	console.log(personid);
	$("#aviso_modal .modal-body").html("Tem certeza que gostaria de remover o acesso de "+ $("#p"+personid + " td:nth-child(2)").html() +" ao laboratório? <i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\" style=\"color:red\"></i>");
	$("#aviso_modal .modal-footer").html(
		'<button type="button" class="btn btn-default bg-success text-white" onclick="alert(\'OH NO! Falta desenvolver essa opção...\');">Sim, mande embora</button>'+
		'<button type="button" class="btn btn-default bg-danger text-white" data-dismiss="modal">Não</button>'
	);
	$("#aviso_modal").modal("show");
	
}

function cadastrar_usuario(){
	if($("#mnome").val() == "" || $("#memail").val() == ""){
		alert("Preencha o nome e o email!");
		return;
	}

	var dados = {"action": "insert", 'name': $("#mnome").val(), "email": $("#memail").val() , "phone": $("#mphone").val() };

	$.ajax({
      type: "POST",
      url: "http://leris.sor.ufscar.br/digital/controller.php",
      data: dados,
			dataType: "json",
      success: function (data) {
				if(data && !data.error){
					alert("Inserido com sucesso! Cadastre agora digitais.");
					location.reload();
				}else{
					console.log(data.error_debug);
					alert("Erro ao inserir fulano!");
				}

			},
			error: function(reason){
				alert("Erro ao tentar contactar servidor!");
				console.log(reason);
			}
	});
}

$( document ).ready(function() {
	$.ajax({
      type: "POST",
      url: "http://leris.sor.ufscar.br/digital/controller.php",
      data: {"action":"list", 'foo': 'bar', },
			dataType: "json",
      success: function (data) {
				i = 1;
				if (data && !data.error) {
					$(".hiddenbeforeload").show();
					data.data.forEach(function(pessoa){
							$("#maintable tbody").append("<tr id='p"+pessoa['id']+"'><th scope='row'>"+i+++"</th><td>"+pessoa["name"]+"</td><td><a href='mailto:"+pessoa["email"]+"'>"+pessoa["email"]+"</a></td><td>"+ 
							((pessoa["phone"]=="") ? "---" : pessoa["phone"]) + "</td><td>"+((pessoa["date"]==null) ?"---": formatDate(new Date(pessoa["date"])))+
							"</td>"+'<td onclick="abrirCrud('+pessoa["id"]+');" align="center"><i style="cursor:pointer"class="fas fa-lapis fa-pencil-alt"></i> </td> '+
							 '<td align="center"><i onclick="abrirFinger('+pessoa["id"]+');" style="cursor:pointer"class="fas fa-dedo fa-fingerprint"></i></td>'+
							 '<td align="center"><i style="cursor:pointer" onclick="abrirDelete('+pessoa["id"]+');" class="fas fa-delete fa-times-circle"></i></td>'+"</tr>");
						});
				}
				else if(data && data.error){
					console.log(data.error_debug);
					$("#aviso_modal .modal-body").html(data.error_msg + " <i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\" style=\"color:red\"></i>");
        	$("#aviso_modal").modal("show");
				}

      },
			error: function(reason){
				$("#aviso_modal .modal-body").html("Erro ao tentar contactar servidor para obter dados! <i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\" style=\"color:red\"></i>");
        $("#aviso_modal").modal("show");
				console.log(reason);
			}
 });
});
</script>
</body>
</html>