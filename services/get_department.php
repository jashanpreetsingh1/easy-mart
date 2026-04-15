<?php

// do posts
$department = $_POST['department'];

if (empty($department)) {
    $department = "Produce";
}

require_once("./easy_groceries.class.php");

// create object
$oEasyGroceries = new EasyGroceries();

// call method
$data = $oEasyGroceries->getDepartment($department);

// print the data
header("Content-Type: application/json");
echo("$data");

?>