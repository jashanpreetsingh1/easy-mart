<?php

// do posts

// link to class
require_once("./easy_groceries.class.php");

// create object
$oEasyGroceries = new EasyGroceries();

// call method
$data = $oEasyGroceries->getDepartments();

// print the data
header("Content-Type: application/json");
echo("$data");

?>