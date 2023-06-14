<?php
	header('Cache-control: private');
	header('content-type: application/json; charset=utf-8');
	header("Access-Control-Allow-Origin: *");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
    header('Access-Control-Allow-Headers: *');

    if (!array_key_exists('REDIRECT_HTTP_AUTHORIZATION', $_SERVER)) {
        echo json_encode(["error" => 'Authorization header is not set!']);
        exit;
    }
    
    $token = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    if($token == "secret_token") {
        echo json_encode(["data" => "Darth vader is luke's father 🙀!"]);
    }
    else {
        echo json_encode(["error" => "Not a valid authorization header!"]);
    }
?>