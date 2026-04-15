<?php

// do posts
$email = $_POST['email'];
$password = $_POST['password'];

require_once("./easy_groceries.class.php");

// create object
$oEasyGroceries = new EasyGroceries();

// call method
$data = $oEasyGroceries->login($email, $password);

// print the data
header("Content-Type: application/json");
echo("$data");

?>