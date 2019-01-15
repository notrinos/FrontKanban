<?php
/*======================================================\
|                      FrontKanban                      |
|-------------------------------------------------------|
|  Creator: Phương                                      |
|  Date :   01-Dec-2017                                 |
|  Description: Frontaccounting Project Management Ext  |
|  Free software under GNU GPL                          |
|                                                       |
\======================================================*/

$page_security = 'SA_MANAGER';
$path_to_root  = '../..';
include_once($path_to_root . "/includes/session.inc");
include_once($path_to_root . "/modules/kanban/includes/PHPMailer/PHPMailerAutoload.php");
add_access_extensions();

if(!file_exists(company_path().'/kanban_data'))
    mkdir(company_path().'/kanban_data');

define('DATA_FILE', company_path().'/kanban_data/'.$_SESSION['project']);

function save($data) {
	// $encoded = json_encode($data, JSON_PRETTY_PRINT);
	$encoded = preg_replace("/&quot;/", '"', $data);
	$f = fopen(DATA_FILE, 'w') or die ("could not open file");
    flock($f, LOCK_EX); //lock file to handle multi access at the same time
	fwrite($f, $encoded);
    flock($f, LOCK_UN); // release lock
	fclose($f);
}

function load() {
	$fh = fopen(DATA_FILE, 'r');
	$data = fread($fh, filesize(DATA_FILE));
	print $data;
}
function get_all_users() {
	$result = array();
	
	foreach(get_users() as $row) {
	    $result[] = $row;
	};
    $result[] = $_SESSION['wa_current_user']->username;
    $result[] = $_SESSION['wa_current_user']->name;
    $result[] = $_SESSION['wa_current_user']->email;
    echo json_encode($result);
}
function sendEmail($data) {
    
    $host = get_company_pref('smtp_host');
    $port = get_company_pref('smtp_port');
    $user = get_company_pref('smtp_username');
    $pass = get_company_pref('smtp_password');
    $secure = get_company_pref('smtp_secure');
    $sender = get_company_pref('smtp_sendername');
    
    $mail = new PHPMailer;
    $mail->IsHTML(true);
    $mail->CharSet = "text/html; charset=UTF-8;";
    $mail->isSMTP();
    $mail->SMTPDebug = 2;
    $mail->Debugoutput = 'html';
    $mail->Host = $host;
    $mail->Port = $port;
    $mail->SMTPSecure = $secure;
    $mail->SMTPAuth = true;
    $mail->Username = $user;
    $mail->Password = $pass;
    $mail->setFrom($user, $sender);
    $mail->addReplyTo('replyto@example.com', 'No Reply');
    $mail->addAddress($data['recipient'], 'recipient');
    $mail->Subject = $data['subject'];
    $mail->Body = html_entity_decode($data['content']);
    $mail->AltBody = 'This is a plain-text message body';
    if (!$mail->send()) {
        echo "Mailer Error: " . $mail->ErrorInfo;
    }
    else {
        echo json_encode($data);
    }
}

if (function_exists($_POST['action'])) {
	$actionVar = $_POST['action'];
	@$actionVar($_POST['data']);
}
