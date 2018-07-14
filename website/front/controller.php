<?php


if( !isset($_POST) || !isset($_POST['email']) || !isset($_POST['passwd']) )
{
    header("Location: /");
    die();
}
if($_POST['email'] == 'email@email' && $_POST['passwd'] == '123')
{
    header("Location: /main.php");
    die();
}
?>