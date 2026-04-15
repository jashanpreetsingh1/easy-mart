<?php

// do posts
$search = $_POST['search'];

if (empty($search)) {
    $search = "Milk";
}

require_once("./easy_groceries.class.php");

// create object
$oEasyGroceries = new EasyGroceries();

// call method
$data = $oEasyGroceries->getSearch($search);

// print the data
header("Content-Type: application/json");
echo("$data");

?>