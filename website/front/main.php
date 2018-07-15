<?php
	session_start();
	if(!isset($_SESSION["autenticado"]) || $_SESSION["autenticado"] != 1)
	{
		session_destroy();
		header("Location: /");
    die();
	}
		
?>


<!doctype html>
<html>
<head>
<link href="src/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.0/css/all.css" integrity="sha384-lKuwvrZot6UHsBSfcMvOkWwlCMgc0TaWr+30HWe3a4ltaBwTZhyTEggF5tJv8tbt" crossorigin="anonymous">
<meta charset="utf8">
<title> Sistema de Digital </title>
<link rel="shortcut icon" type="image/png" href="src/32px-Fingerprint.png"/>
</head>
<body>
  <!--Modal de notificação  -->
	<div id="aviso_modal" class="modal fade" role="dialog" tabindex="-1">
		<div class="modal-dialog">
			<!-- Modal content-->
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
							<input id="mnome"  placeholder="Insira o Nome aqui..." class="form-control input-md" type="text">
						</div>
					</div>

					
					<div class="form-group">
					<label class="col-md-4 control-label" for="memail">Email:</label>  
					<div class="col-md-4">
					<input id="memail" placeholder="Insira o Email aqui..." class="form-control input-md" type="text">
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
					<button type="button" class="btn btn-default bg-info text-white" tabindex="-1" data-dismiss="modal">Cancelar</button>
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
					<button type="button" class="btn btn-default bg-info text-white" tabindex="-1" data-dismiss="modal">Salvar</button>
					<button type="button" class="btn btn-default bg-info text-white" tabindex="-1" data-dismiss="modal">Cancelar</button>
				</div>
			</div>
		</div>
	</div>
	<!-- fim da modal de digitais -->




<button class="btn btn-lg btn-primary btn-signout" onclick="logoff();">Logoff</button>
<button class="btn btn-lg btn-primary btn-signout" onclick="irLogs();">Ver logs de acesso</button>
<button class="btn btn-lg btn-primary btn-signout hiddenbeforeload" onclick="abrirCrud(-1);">Cadastrar novo usuário</button>

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


<script src="src/jquery-3.3.1.min.js"></script>
<script src="src/bootstrap.min.js"></script>
<script>
	$(".hiddenbeforeload").hide();

function logoff(){
	alert('teste');
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
	}

}


$('#finger_modal').on('show.bs.modal', function(event) {
        var row = $(event.relatedTarget).closest('tr');
				console.log(row);
				
});

$('#crud_modal').on('show.bs.modal', function(event) {
        var row = $(event.relatedTarget).closest('tr');
				console.log(row);
				console.log(event);
});

$('#delete_modal').on('show.bs.modal', function(event) {
        var row = $(event.relatedTarget).closest('tr');
				console.log(row);
});

function abrirFinger(personid){
	$("#finger_modal").modal("show");
}

function abrirDelete(personid){
	$("#aviso_modal .modal-body").html("Tem certeza que gostaria de remover o acesso de ciclano ao laboratório? <i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\" style=\"color:red\"></i>");
	$("#aviso_modal").modal("show");
}

function irLogs(){
	alert("TEM QUE IMPLEMENTAR!");
}

$( document ).ready(function() {
	$.ajax({
      type: "POST",
      url: "controller.php",
      data: {"action":"list", 'foo': 'bar', },
			dataType: "json",
      success: function (data) {
				i = 1;
				if (data && !data.error) {
					$(".hiddenbeforeload").show();
					data.data.forEach(function(pessoa){
							$("#maintable tbody").append("<tr><th scope='row'>"+i+++"</th><td>"+pessoa["name"]+"</td><td>"+pessoa["email"]+"</td><td>"+ 
							((pessoa["phone"]=="") ? "---" : pessoa["phone"]) + "</td><td>"+((pessoa["date"]==null) ?"---": formatDate(new Date(pessoa["date"])))+
							"</td>"+'<td onclick="$(\'#crud_modal .modal-title\').html(\'Editar Usuário\');	$(\'#crud_modal\').modal(\'show\');" align="center"><i style="cursor:pointer"class="fas fa-lapis fa-pencil-alt"></i> </td> '+
							 '<td align="center"><i onclick="abrirFinger(0);" style="cursor:pointer"class="fas fa-dedo fa-fingerprint"></i></td>'+
							 '<td align="center"><i style="cursor:pointer" onclick="abrirDelete(0);" class="fas fa-delete fa-times-circle"></i></td>'+"</tr>");
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