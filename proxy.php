<?php
	$c = curl_init('http://192.168.5.3:8080/?'.$_SERVER['QUERY_STRING']);
	curl_setopt($c,CURLOPT_RETURNTRANSFER,true);
	curl_setopt($c, CURLOPT_HTTPAUTH, CURLAUTH_DIGEST ) ;
	curl_setopt($c, CURLOPT_USERPWD, "user:password");
	Header('Content-Type: application/json');
	echo curl_exec($c);
