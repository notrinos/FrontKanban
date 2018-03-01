<?php
/*=======================================================\
|                        FrontKanban                     |
|--------------------------------------------------------|
|   Creator: Phương                                      |
|   Date :   01-Dec-2017                                 |
|   Description: Frontaccounting Project Management Ext  |
|   Free software under GNU GPL                          |
|                                                        |
\=======================================================*/

$page_security = 'SA_MANAGER';
$path_to_root  = '../..';
include_once($path_to_root . "/includes/session.inc");
include_once($path_to_root . "/modules/kanban/includes/PHPMailer/PHPMailerAutoload.php");
add_access_extensions();

define('DATA_FILE', "$path_to_root/modules/kanban/data/".$_SESSION['project']);

function save($data) {
	$encoded = json_encode($data);
	$encoded = preg_replace("/},/", "},\n", $encoded);
	$fh = fopen(DATA_FILE, 'w') or die ("could not open file");
	fwrite($fh, $encoded);
	fclose($fh);
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
    date_default_timezone_set('Etc/UTC');
    $mail = new PHPMailer;
    $mail->IsHTML(true);
    $mail->CharSet = "text/html; charset=UTF-8;";
    $mail->isSMTP();
    $mail->SMTPDebug = 2;
    $mail->Debugoutput = 'html';
    $mail->Host = 'yourHost';
    $mail->Port = 465;
    $mail->SMTPSecure = 'ssl';
    $mail->SMTPAuth = true;
    $mail->Username = "yourUsername";
    $mail->Password = "yourPassword";
    $mail->setFrom('yourUsername', 'Project Notification');
    $mail->addReplyTo('replyto@example.com', 'First Last');
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
