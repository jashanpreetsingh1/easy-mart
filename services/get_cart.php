<?php

// do posts
$cartJSON = $_POST['cartJSON'];

require_once("./easy_groceries.class.php");

// create object
$oEasyGroceries = new EasyGroceries();

// call method
$data = $oEasyGroceries->getCart($cartJSON);

// print the data
header("Content-Type: application/json");
echo("$data");

?>