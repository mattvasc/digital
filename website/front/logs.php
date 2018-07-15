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
<meta charset="utf8">
<title> Sistema de Digital </title>
<link rel="shortcut icon" type="image/png" href="src/32px-Fingerprint.png"/>
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
<button class="btn btn-lg btn-primary btn-signout" onclick="logoff();">Logoff</button>
<button class="btn btn-lg btn-primary btn-signout" onclick="location.href='/main.php';">Gerenciar Pessoas</button>
<button class="btn btn-lg btn-primary btn-signout" onclick="location.href='/download	.php';">Baixar Cliente</button>

<table class="table hiddenbeforeload" id="maintable">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Nome</th>
			<th scope="col">Acesso</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>


<script src="src/jquery-3.3.1.min.js"></script>
<script src="src/bootstrap.min.js"></script>
<script>
$(".hiddenbeforeload").hide();
function formatDate(date) {
  var monthNames = [
    "Janeiro", "Fevereiro", "Março",
    "Abril", "Maio", "Junho", "Julho",
    "Agosto", "Setembro", "Outubro",
    "Novembro", "Dezembro"
  ];
  return date.getDate() + ' de ' + monthNames[date.getMonth()] + ' de ' + date.getFullYear() + " às " + date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

$( document ).ready(function() {
	$.ajax({
      type: "POST",
      url: "controller.php",
      data: {"action":"log" },
			dataType: "json",
      success: function (data) {
				i = 1;
				if (data && !data.error) {
					$(".hiddenbeforeload").show();
					data.data.forEach(function(pessoa){
							$("#maintable tbody").append("<tr><th scope='row'>"+i+++"</th><td>"+pessoa["name"]+"</td>"+ 
							"<td>"+ formatDate(new Date(pessoa["date"]))+"</td></tr>");
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