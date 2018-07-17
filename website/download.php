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
<link rel="shortcut icon" type="image/png" href="src/32px-Fingerprint.png"/>
</head>
<body>
<button class="btn btn-lg btn-primary btn-signout" onclick="logoff();">Logoff</button>
<button class="btn btn-lg btn-primary btn-signout" onclick="location.href='http://leris.sor.ufscar.br/digital/main.php';">Gerenciar Pessoas</button>
<button class="btn btn-lg btn-primary btn-signout" onclick="location.href='http://leris.sor.ufscar.br/digital/logs.php';">Ver logs de acesso</button>
	<br><h1>Em breve!</h1>
	<script src="http://leris.sor.ufscar.br/digital/src/jquery-3.3.1.min.js"></script>
<script src="http://leris.sor.ufscar.br/digital/src/bootstrap.min.js"></script>
<script>

</script>
</body>
</html>