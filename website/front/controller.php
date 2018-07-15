<?php
class Resultado
{
     function __construct($error, $error_msg, $data, $error_debug = "") {
       $this->error = $error;
       $this->error_msg = $error_msg;
       $this->data = $data;
       $this->error_debug = $error_debug;
     }
    public $error = true;
    public $error_msg = "";
    public $error_debug = "";
    public $data = false;
}


if( !isset($_POST) || (!isset($_POST['email']) && !isset($_POST['passwd']) && !isset($_POST['action']) ) )
{
    header("Location: /");
    die();
}

else if(isset($_POST['email']) && isset($_POST['passwd']) && $_POST['email'] == 'email@email' && $_POST['passwd'] == '123')
{
    header("Location: /main.php");
    session_start();
    $_SESSION['autenticado'] = 1;
    die();
}

else if($_POST['action']=='list')
{
    try {
    class MyDB extends SQLite3 {
        function __construct() {
           $this->open('database.db');
        }
     }
     
     $db = new MyDB();
     if(!$db) {
        $resultado = new Resultado(true,"Erro ao conectar no banco de dados",false,$db->lastErrorMsg());
     } else {
        
            $sql = "SELECT user.id, user.name, user.email, user.phone,  log.date FROM user LEFT JOIN log ON user.id=log.userid GROUP BY user.id ORDER BY user.name;";
            $ret = $db->query($sql);
            $i=0;
            while($row = $ret->fetchArray(SQLITE3_ASSOC) ) {
                $retorno[$i]['id'] = $row["id"];
                $retorno[$i]['email'] = $row["email"];
                $retorno[$i]['phone'] = $row["phone"];
                $retorno[$i]['name'] = $row["name"];
                $retorno[$i]["date"] = $row["date"];
                $i++;
            }
            $db->close();
            $resultado = new Resultado(false,"", $retorno,"");
     }
    }
    catch (Exception $e) {
        $resultado = new Resultado(true,"Erro ao conectar no banco de dados",false,$e->getMessage());
    }
}
echo json_encode($resultado);
?>

