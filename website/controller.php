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
    header("Location: http://leris.sor.ufscar.br/digital");
    die();
}

else if(isset($_POST['email']) && isset($_POST['passwd']) ){
    if($_POST['email'] == 'email@email' && $_POST['passwd'] == '123')
    {
        header("Location: http://leris.sor.ufscar.br/digital/main.php");
        session_start();
        $_SESSION['autenticado'] = 1;
        die();
    }
    else{
        header("Location: http://leris.sor.ufscar.br/digital?erro=1");
        session_destroy();
    }
}

else if(isset($_POST['action']))
{
    switch($_POST['action'])
    {
        case 'list':
            try {
            class MyDB extends SQLite3 {
                function __construct() {
                $this->open('/fingerprints/database.db');
                }
            }
            
            $db = new MyDB();
            if(!$db) {
                $resultado = new Resultado(true,"Erro ao conectar no banco de dados",false,$db->lastErrorMsg());
            } else {
                
                    $sql = "SELECT user.id, user.name, user.email, user.phone,  log.date FROM user LEFT JOIN log ON user.id=log.userid GROUP BY user.id ORDER BY LOWER(user.name);";
                    $ret = $db->query($sql);
                    $i=0;
                    while($row = $ret->fetchArray(SQLITE3_ASSOC) ) {
                        $retorno[$i]['id'] = $row["id"]; $retorno[$i]['email'] = $row["email"]; $retorno[$i]['phone'] = $row["phone"]; 
                        $retorno[$i]['name'] = $row["name"];  $retorno[$i]["date"] = $row["date"];  $i++;
                    }
                    $db->close();
                    $resultado = new Resultado(false,"", $retorno,"");
            }
            }
            catch (Exception $e) {
                "SELECT user.name, log.date FROM log LEFT JOIN user ON user.id=log.userid ORDER BY log.date DESC LIMIT 50;";
                $resultado = new Resultado(true,"Erro ao conectar no banco de dados",false,$e->getMessage());
            }
            break;
        case 'log':
            try {
                class MyDB extends SQLite3 
                {
                    function __construct() 
                    {
                        $this->open('database.db');
                    }
                }
            $db = new MyDB();
            if(!$db) {
                $resultado = new Resultado(true,"Erro ao conectar no banco de dados",false,$db->lastErrorMsg());
            } else {              
                    $sql = "SELECT user.name, log.date FROM log LEFT JOIN user ON user.id=log.userid ORDER BY log.date DESC LIMIT 50;";
                    $ret = $db->query($sql);
                    $i=0;
                    while($row = $ret->fetchArray(SQLITE3_ASSOC) ) {
                        $retorno[$i]['name'] = $row["name"];  $retorno[$i]["date"] = $row["date"]; $i++;
                    }
                    $db->close();
                    $resultado = new Resultado(false,"", $retorno,"");
                }
            }
            catch (Exception $e) {
                $resultado = new Resultado(true,"Erro ao conectar no banco de dados",false,$e->getMessage());
            }
            break;
        case 'logout':
            $_SESSION['autenticado'] = 0;
            unset($_SESSION['autenticado']);
            header("Location: http://leris.sor.ufscar.br/digital");
            die();
            break;
        case 'insert':
            try {
                class MyDB extends SQLite3 
                {
                    function __construct() 
                    {
                        $this->open('database.db');
                    }
                }
                $db = new MyDB();
                if(!$db) {
                    $resultado = new Resultado(true,"Erro ao conectar no banco de dados",false,$db->lastErrorMsg());
                } else {              
                    $sql = "INSERT INTO user(name,email,phone) VALUES (:nome, :emaio, :telefone);";
                    $stmt = $db->prepare($sql);
                    if($stmt){
                        $stmt->bindValue(":nome", $_POST["name"], SQLITE3_TEXT);
                        $stmt->bindValue(":emaio", $_POST["email"], SQLITE3_TEXT);
                        $stmt->bindValue(":telefone", $_POST["phone"], SQLITE3_TEXT);
                        $result = $stmt->execute();
                        if($result)
                            $resultado = new Resultado(false,"",true,"");
                        else
                            $resultado = new Resultado(true,"Erro ao cadastrar nova pessoa",false, $db->lastErrorMsg());
                        $db->close();
                    }
                    else
                        $resultado = new Resultado(true,"Erro ao cadastrar nova pessoa",false,"Conseguiu nem criar o stmt! " + $db->lastErrorMsg());
                    
                }
            }
            catch (Exception $e) {
                $resultado = new Resultado(true,"Erro ao conectar no banco de dados",false,$e->getMessage());
            }
            break;
        case 'list_fingers':
            
        default:
            $resultado = new Resultado(true,"Ação não compreendida",false,"Caiu no default do switch");
    }
}
echo json_encode($resultado);
?>

