<?php

// ini_set('display_errors', '1');
// ini_set('display_startup_errors', '1');
// error_reporting(E_ALL);


class EasyGroceries {

    public $dbo;
    public $pepper;

    public function __construct () {
        require_once("./inc/connect_pdo.php");
        $this->dbo = $dbo;
        $this->pepper = $pepper; 
    }


    public function jsonFIX ($data) {
		
		$json_output = json_encode($data);

		if ($json_output === false && json_last_error() === JSON_ERROR_UTF8) {
			// If a UTF-8 error occurred, convert the data first
			function force_utf8($mixed) {
				if (is_array($mixed)) {
					foreach ($mixed as $key => $value) {
						$mixed[$key] = force_utf8($value);
					}
				} elseif (is_string($mixed)) {
					// Convert only if not already valid UTF-8
					if (!mb_check_encoding($mixed, 'UTF-8')) {
						return mb_convert_encoding($mixed, 'UTF-8', 'ISO-8859-1'); 
					}
				}
				return $mixed;
			}
			$data_utf8 = force_utf8($data);
			$json_output = json_encode($data_utf8);
		}

		return $json_output;
	}


    public function createSalt () {
        srand(time());
        $pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for($index = 0; $index < 2; $index++) {
            $salt .= substr($pool,(rand()%(strlen($pool))), 1);
        }
        return $salt;
    }

    public function createSession () {
        $session = sha1(time());
        return $session;
    }

    public function encryptPassword ($salt, $password) {
        for($index = 0; $index < 10; $index++) {
            $password = sha1($this->pepper.$password.$salt);
        }
        return $password;
    }


    public function getImage ($upc) {

        $query = "SELECT id, file
        FROM eg_image
        WHERE upc = :upc";

        $stmt = $this->dbo->prepare($query);

        $stmt->execute([
            ':upc' => $upc
        ]);

        $results = $stmt->fetchAll();

        if ($results) {
            foreach ($results as $row) {
                $id = $row[0];
                $file = $row[1];
                $folder = substr($upc, 0, 4);
                $path = "./images/$folder/$file";
            }
        } 
        return $path;
    }



    public function getCart ($cartForm) {
        
        $error_id = 0;
        $error_message = "";

        $cart_form = json_decode($cartForm, true);

        $list = "";
        $cart = array();
        foreach ($cart_form as $key=>$value) {
            if ($list == "") {
                $list = "$key"; 
            } else {
                $list .= ",$key";
            }
            $cart[$key] = $value;
        }

        try {
            $query = "SELECT eg_product_id, upc, brand, product_name, 
            product_description, price, eg_unit.name, stars, 
            eg_department.name, taxable
            FROM eg_product, eg_department, eg_unit
            WHERE eg_product.eg_department_id = eg_department.eg_department_id
            AND eg_unit.eg_unit_id = eg_product.eg_unit_id
            AND eg_product_id IN ($list)
            ORDER BY product_name";

            $stmt = $this->dbo->prepare($query);
            $stmt->execute();
            $results = $stmt->fetchAll();

            if ($results) {
                foreach ($results as $row) {
                    $eg_product_id = $row[0];
                    $upc           = $row[1];
                    $brand         = $row[2];
                    $product_name  = $row[3];
                    $product_description = $row[4];
                    $price         = $row[5];
                    $eg_unit_id    = $row[6];
                    $stars         = $row[7];
                    $department_name = $row[8];
                    $taxable       = $row[9];

                    $eg_product_id   = stripslashes($eg_product_id);
                    $upc             = stripslashes($upc);
                    $brand           = stripslashes($brand);
                    $product_name    = stripslashes($product_name);
                    $product_description = stripslashes($product_description);
                    $price           = stripslashes($price);
                    $eg_unit_id      = stripslashes($eg_unit_id);
                    $stars           = stripslashes($stars);
                    $department_name = stripslashes($department_name);
                    $taxable         = stripslashes($taxable);

                    $product["eg_product_id"]      = $eg_product_id;
                    $product["upc"]                = $upc;
                    $product["brand"]              = $brand;
                    $product["product_name"]       = $product_name;
                    $product["product_description"] = $product_description;
                    $product["price"]              = $price;
                    $product["eg_unit_id"]         = $eg_unit_id;
                    $product["stars"]              = $stars;
                    $product["department_name"]    = $department_name;
                    $product["taxable"]            = $taxable;
                    $product["image"]              = $this->getImage($upc);

                    $products[] = $product;
                    ++$x;
                }
            } else {
                $error_id = 602;
                $error_message = "no records found in getCart";
            }

        } catch (PDOException $e) {
            $error_id = 601;
            $error_message = "Something went wrong in getCart: $e";
        }

        $error["error_id"]      = $error_id;
        $error["error_message"] = $error_message;

        $data["error"]    = $error;
        $data["products"] = $products;

        $json_output = $this->jsonFIX($data);
        return $json_output;
    }


    public function getDepartments () {
        
        $error_id = 0;
        $error_message = "";

        try {

            $query = "SELECT eg_department_id, name
            FROM eg_department
            ORDER BY name";

            $data["query"] = $query;
            $stmt = $this->dbo->prepare($query);

            $stmt->execute();

            $results = $stmt->fetchAll();

            if ($results) {
                foreach ($results as $row) {
                    $eg_department_id = $row[0];
                    $name = addslashes($row[1]);

                    $department["eg_department_id"] = $eg_department_id;
                    $department["name"] = $name;

                    $departments[] = $department;
                    ++$x;
                }
            } else {
                $error_id = 102;
                $error_message = "no records found in getDepartments"; 
            }

        } catch (PDOException $e) {
            $error_id = 101;
            $error_message = "Something went wrong in getDpartment: $e";
        }

        $error["error_id"] = $error_id;
        $error["error_message"] = $error_message;
        
        $data["error"] = $error;
        $data["departments"] = $departments;

        // $data = json_encode($departments);
        $json_output = $this->jsonFIX($data);

        return $json_output;
    }


    public function getDepartment ($department) {
        
        $error_id = 0;
        $error_message = "";

        $data["department"] = $department;

        try {
            $query = "SELECT eg_product_id, upc, brand, product_name, product_description, price, eg_unit.name, stars, eg_department.name
            FROM eg_product, eg_department, eg_unit
            WHERE eg_product.eg_department_id = eg_department.eg_department_id
            AND eg_unit.eg_unit_id = eg_product.eg_unit_id
            AND eg_department.name LIKE :department
            ORDER BY product_name";

            $stmt = $this->dbo->prepare($query);

            $stmt->execute([
                ':department' => $department
            ]);

            $results = $stmt->fetchAll();

            if ($results) {
                foreach ($results as $row) {
                    $eg_product_id = $row[0];
                    $upc = $row[1];
                    $brand = $row[2];
                    $product_name = $row[3];
                    $product_description = $row[4];
                    $price = $row[5];
                    $eg_unit_id = $row[6];
                    $stars = $row[7];
                    $department_name = $row[8];

                    $eg_product_id = stripslashes($eg_product_id);
                    $upc = stripslashes($upc);
                    $brand = stripslashes($brand);
                    $product_name = stripslashes($product_name);
                    $product_description = stripslashes($product_description);
                    $price = stripslashes($price);
                    $eg_unit_id = stripslashes($eg_unit_id);
                    $stars = stripslashes($stars);
                    $department_name = stripslashes($department_name);

                    $product["eg_product_id"] = $eg_product_id;
                    $product["upc"] = $upc;
                    $product["brand"] = $brand;
                    $product["product_name"] = $product_name;
                    $product["product_description"] = $product_description;
                    $product["price"] = $price;
                    $product["eg_unit_id"] = $eg_unit_id;
                    $product["stars"] = $stars;
                    $product["department_name"] = $department_name;
                    $product["image"] = $this->getImage($upc);
                    //

                    $products[] = $product;
                    ++$x;
                }
            } else {
                $error_id = 202;
                $error_message = "no records found in getDepartment"; 
            }

        } catch (PDOException $e) {
            $error_id = 201;
            $error_message = "Something went wrong in getDpartment: $e";
        }

        $error["error_id"] = $error_id;
        $error["error_message"] = $error_message;
        
        $data["error"] = $error;
        $data["products"] = $products;

        // $data = json_encode($departments);
        $json_output = $this->jsonFIX($data);

        return $json_output;
    }


    public function createAccount ($email, $password, $name_last, $name_first) {
        
        $error_id = 0;
        $error_message = "";

        $salt = $this->createSalt();
        // $salt = "RG";
        
        $enc_password = $this->encryptPassword($salt, $password);


        try {

            $query = "INSERT INTO eg_user
            SET email = :email,
            password = :password,
            salt = :salt,
            billing_name_first = :name_first,
            billing_name_last = :name_last,
            sign_up_date = NOW() ";

            $stmt = $this->dbo->prepare($query);

            $stmt->execute([
                ':email' => $email,
                ':salt' => $salt,
                ':name_first' => $name_first,
                ':name_last' => $name_last,
                ':password' => $enc_password
            ]);

            

        } catch (PDOException $e) {
            $error_id = 401;
            $error_message = "Something went wrong in Create Account: $e";
        }

        $error["error_id"] = $error_id;
        $error["error_message"] = $error_message;
        
        $data["error"] = $error;

        $json_output = $this->jsonFIX($data);

        return $json_output;
    }


    public function login ($email, $password) {
        
        $error_id = 0;
        $error_message = "";

        try {

            // get salt and retreived password
            $query = "SELECT salt, password, eg_user_id, billing_name_first, billing_name_last,
            billing_address, billing_city, billing_province, billing_postal_code, billing_phone
            FROM eg_user
            WHERE email = :email ";

            $stmt = $this->dbo->prepare($query);

            $stmt->execute([
                ':email' => $email
            ]);

            $results = $stmt->fetchAll();

            if ($results) {
                foreach ($results as $row) {
                    $salt = $row[0];
                    $saved_password = $row[1];
                    $eg_user_id = $row[2];
                    $billing_name_first = $row[3];
                    $billing_name_last = $row[4];
                    $billing_address = $row[5];
                    $billing_city = $row[6];
                    $billing_province = $row[7];
                    $billing_postal_code = $row[8];
                    $billing_phone = $row[9];
                    $session = $this->createSession();

                    $user["eg_user_id"] = $eg_user_id;
                    $user["billing_name_first"] = $billing_name_first;
                    $user["billing_name_last"] = $billing_name_last;
                    $user["billing_address"] = $billing_address;
                    $user["billing_city"] = $billing_city;
                    $user["billing_province"] = $billing_province;
                    $user["billing_postal_code"] = $billing_postal_code;
                    $user["billing_phone"] = $billing_phone;
                    $user["session"] = $session;
                }
            }


            $enc_password = $this->encryptPassword($salt, $password);

            
            // compare exiting password with retrived password
            // if same then get rest of info
            if ($enc_password === $saved_password) {
                // all ok get rest of data
                $error_id = 500;
                $error_message = "Login Successful.";
                $data["user"] = $user;

                $query = "INSERT INTO eg_session
                SET eg_user_id = :eg_user_id,
                session = :session ";

                $stmt = $this->dbo->prepare($query);

                $stmt->execute([
                    ':eg_user_id' => $eg_user_id,
                    ':session' => $session
                ]);

            } else {
                $error_id = 505;
                $error_message = "The email and password do not match or exist.";
            }
            // if not then send error back
        } catch (PDOException $e) {
            $error_id = 501;
            $error_message = "Something went wrong in Login: $e";
        }

        $error["error_id"] = $error_id;
        $error["error_message"] = $error_message;
        
        $data["error"] = $error;
        $data["user"] = $user;

        $json_output = $this->jsonFIX($data);

        return $json_output;
    }



    public function getSearch ($search) {

        $error_id = 0;
        $error_message = "";

        $words = explode(' ', trim($search));
        $regex = implode('|', $words);
        $regex = trim($search)."|".$regex;

        $data["search"] = $search;

        try {
            $query = "SELECT eg_product_id, upc, brand, product_name, product_description, price, eg_unit.name, stars, eg_department.name
            FROM eg_product, eg_department, eg_unit
            WHERE eg_product.eg_department_id = eg_department.eg_department_id
            AND eg_unit.eg_unit_id = eg_product.eg_unit_id
            AND (eg_product.upc REGEXP '{$regex}'
            OR eg_product.brand REGEXP '{$regex}'
            OR eg_department.name REGEXP '{$regex}'
            OR eg_product.product_name REGEXP '{$regex}')
            ORDER BY eg_department.name, product_name";

            $stmt = $this->dbo->prepare($query);
            $stmt->execute();
            $results = $stmt->fetchAll();

            if ($results) {
                foreach ($results as $row) {
                    $eg_product_id       = stripslashes($row[0]);
                    $upc                 = stripslashes($row[1]);
                    $brand               = stripslashes($row[2]);
                    $product_name        = stripslashes($row[3]);
                    $product_description = stripslashes($row[4]);
                    $price               = stripslashes($row[5]);
                    $eg_unit_id          = stripslashes($row[6]);
                    $stars               = stripslashes($row[7]);
                    $department_name     = stripslashes($row[8]);

                    $product["eg_product_id"]       = $eg_product_id;
                    $product["upc"]                 = $upc;
                    $product["brand"]               = $brand;
                    $product["product_name"]        = $product_name;
                    $product["product_description"] = $product_description;
                    $product["price"]               = $price;
                    $product["eg_unit_id"]          = $eg_unit_id;
                    $product["stars"]               = $stars;
                    $product["department_name"]     = $department_name;
                    $product["image"]               = $this->getImage($upc);

                    $products[] = $product;
                }
            } else {
                $error_id = 202;
                $error_message = "no records found in getSearch";
            }

        } catch (PDOException $e) {
            $error_id = 201;
            $error_message = "Something went wrong in getSearch: $e";
        }

        $error["error_id"]      = $error_id;
        $error["error_message"] = $error_message;
        $data["error"]          = $error;
        $data["products"]       = $products;

        return $this->jsonFIX($data);
    }


    public function getProduct ($product) {
        
        $error_id = 0;
        $error_message = "";

        try {

            $query = "SELECT eg_product_id, upc, brand, product_name, product_description, price, eg_unit.name, stars, eg_department.name, eg_department.eg_department_id
            FROM eg_product, eg_department, eg_unit
            WHERE eg_product.eg_department_id = eg_department.eg_department_id
            AND eg_unit.eg_unit_id = eg_product.eg_unit_id
            AND eg_product.product_name LIKE :product ";

            $stmt = $this->dbo->prepare($query);

            $stmt->execute([
                ':product' => $product
            ]);

            $results = $stmt->fetchAll();

            if ($results) {
                foreach ($results as $row) {
                    $eg_product_id = $row[0];
                    $upc = $row[1];
                    $brand = $row[2];
                    $product_name = $row[3];
                    $product_description = $row[4];
                    $price = $row[5];
                    $eg_unit_id = $row[6];
                    $stars = $row[7];
                    $department_name = $row[8];
                    $department_id = $row[9];

                    $eg_product_id = stripslashes($eg_product_id);
                    $upc = stripslashes($upc);
                    $brand = stripslashes($brand);
                    $product_name = stripslashes($product_name);
                    $product_description = stripslashes($product_description);
                    $price = stripslashes($price);
                    $eg_unit_id = stripslashes($eg_unit_id);
                    $stars = stripslashes($stars);
                    $department_name = stripslashes($department_name);

                    $product1["eg_product_id"] = $eg_product_id;
                    $product1["upc"] = $upc;
                    $product1["brand"] = $brand;
                    $product1["product_name"] = $product_name;
                    $product1["product_description"] = $product_description;
                    $product1["price"] = $price;
                    $product1["eg_unit_id"] = $eg_unit_id;
                    $product1["stars"] = $stars;
                    $product1["department_name"] = $department_name;
                    $product1["image"] = $this->getImage($upc);

                    $products[] = $product1;
                    ++$x;
                }
            } else {
                $error_id = 302;
                $error_message = "no records found in getProduct"; 
            }

            /*     GET 4 RELATED PRODUCTS     */

            $query = "SELECT eg_product_id, upc, brand, product_name, product_description, price, eg_unit.name, stars, eg_department.name, eg_department.eg_department_id
            FROM eg_product, eg_department, eg_unit
            WHERE eg_product.eg_department_id = eg_department.eg_department_id
            AND eg_unit.eg_unit_id = eg_product.eg_unit_id
            AND eg_department.eg_department_id = :department_id
            ORDER BY RAND()
            LIMIT 0,4 ";

            $stmt = $this->dbo->prepare($query);

            $stmt->execute([
                ':department_id' => $department_id
            ]);

            $results = $stmt->fetchAll();

            if ($results) {
                foreach ($results as $row) {
                    $eg_product_id = $row[0];
                    $upc = $row[1];
                    $brand = $row[2];
                    $product_name = $row[3];
                    $product_description = $row[4];
                    $price = $row[5];
                    $eg_unit_id = $row[6];
                    $stars = $row[7];
                    $department_name = $row[8];
                    $department_id = $row[9];

                    $eg_product_id = stripslashes($eg_product_id);
                    $upc = stripslashes($upc);
                    $brand = stripslashes($brand);
                    $product_name = stripslashes($product_name);
                    $product_description = stripslashes($product_description);
                    $price = stripslashes($price);
                    $eg_unit_id = stripslashes($eg_unit_id);
                    $stars = stripslashes($stars);
                    $department_name = stripslashes($department_name);

                    $product2["eg_product_id"] = $eg_product_id;
                    $product2["upc"] = $upc;
                    $product2["brand"] = $brand;
                    $product2["product_name"] = $product_name;
                    $product2["product_description"] = $product_description;
                    $product2["price"] = $price;
                    $product2["eg_unit_id"] = $eg_unit_id;
                    $product2["stars"] = $stars;
                    $product2["department_name"] = $department_name;
                    $product2["image"] = $this->getImage($upc);

                    $related_products[] = $product2;
                    ++$x;
                }
            } else {
                $error_id = 303;
                $error_message = "no records found in getProduct related"; 
            }

        } catch (PDOException $e) {
            $error_id = 301;
            $error_message = "Something went wrong in getProduct: $e";
        }

        $error["error_id"] = $error_id;
        $error["error_message"] = $error_message;
        
        $data["error"] = $error;
        $data["products"] = $products;
        $data["related_products"] = $related_products;

        // $data = json_encode($departments);
        $json_output = $this->jsonFIX($data);

        return $json_output;
    }

}

?>