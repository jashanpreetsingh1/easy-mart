<?php

// do posts
$email = $_POST['email'];
$password = $_POST['password'];
$name_last = $_POST['name_last'];
$name_first = $_POST['name_first'];


require_once("./easy_groceries.class.php");

// create object
$oEasyGroceries = new EasyGroceries();

// call method
$data = $oEasyGroceries->createAccount($email, $password, $name_last, $name_first);

// print the data
header("Content-Type: application/json");
echo("$data");

?>