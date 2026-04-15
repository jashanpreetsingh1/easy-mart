<?php

// do posts
$product = $_POST['product'];

if (empty($product)) {
    $product = "Fruit Party Tray";
}

require_once("./easy_groceries.class.php");

// create object
$oEasyGroceries = new EasyGroceries();

// call method
$data = $oEasyGroceries->getProduct($product);

// print the data
header("Content-Type: application/json");
echo("$data");

?>