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

$page_security = 'SA_SETUPCOMPANY';
$path_to_root  = '../../..';

include_once($path_to_root . '/includes/session.inc');
add_access_extensions();

include_once($path_to_root . "/includes/ui.inc");
include_once($path_to_root . "/includes/data_checks.inc");
// include_once($path_to_root . "/admin/db/company_db.inc");

include_once($path_to_root . "/modules/kanban/includes/kanban_db.inc");
include_once($path_to_root . "/modules/kanban/includes/kanban_ui.inc");

//--------------------------------------------------------------------------

page(_($help_context = 'Mail Setup'));

if (get_company_pref('smtp_host') === null)
	set_company_pref('smtp_host', 'system.mail', 'varchar', 60, 'localhost');
if (get_company_pref('smtp_port') === null)
	set_company_pref('smtp_port', 'system.mail', 'int', 11, 25);
if (get_company_pref('smtp_username') === null)
	set_company_pref('smtp_username', 'system.mail', 'varchar', 60, '');
if (get_company_pref('smtp_password') === null)
	set_company_pref('smtp_password', 'system.mail', 'varchar', 60, '');
if (get_company_pref('smtp_secure') === null)
	set_company_pref('smtp_secure', 'system.mail', 'varchar', 10, 'none');
if (get_company_pref('smtp_sendername') === null)
	set_company_pref('smtp_sendername', 'system.mail', 'varchar', 10, 'none');

function can_process() {
    $errors = 0;
    
    if(empty($_POST['smtp_sendername'])) {
    	$errors++;
    	display_error(_("The Name of Sender must be entered."));
    	set_focus('smtp_sendername');
    }
    elseif(empty($_POST['smtp_host'])) {
    	$errors++;
    	display_error(_("The SMTP host must be entered."));
    	set_focus('smtp_host');
    }
    elseif(!check_num('smtp_port', 1)) {
    	$errors++;
    	display_error(_("The SMTP port must be a positive number."));
    	set_focus('smtp_port');
    }
    elseif(empty($_POST['smtp_username'])) {
    	$errors++;
    	display_error(_("The SMTP username must be entered."));
    	set_focus('smtp_username');
    }
    elseif(empty($_POST['smtp_password'])) {
    	$errors++;
    	display_error(_("The SMTP password must be entered."));
    	set_focus('smtp_password');
    }
    
    return ($errors == 0);
}

//-------------------------------------------------------------------------------------------------

if (isset($_POST['submit']) && can_process()) {
	update_company_prefs(get_post(array('smtp_sendername','smtp_host','smtp_port','smtp_secure','smtp_username','smtp_password')));

	display_notification(_("The smtp mail sending settings has been updated."));
}

$prefs = get_company_prefs();

$_POST['smtp_sendername'] = @$prefs['smtp_sendername'];
$_POST['smtp_host'] = @$prefs['smtp_host'];
$_POST['smtp_port'] = @$prefs['smtp_port'];
$_POST['smtp_secure'] = @$prefs['smtp_secure'];
$_POST['smtp_username'] = @$prefs['smtp_username'];
$_POST['smtp_password'] = @$prefs['smtp_password'];

//-------------------------------------------------------------------------------------------------

start_form();

div_start('details');

start_table(TABLESTYLE2);
text_row(_("Sender Name:"), 'smtp_sendername', $_POST['smtp_sendername'], 20, 60);
text_row(_("SMTP Host:"), 'smtp_host', $_POST['smtp_host'], 20, 60);
text_row(_("SMTP Port:"), 'smtp_port', $_POST['smtp_port'], 20, 12);
label_row(_("SMTP Secure:"), array_selector('smtp_secure', $_POST['smtp_secure'], array('none'=>'None', 'tls'=>'TLS', 'ssl'=>'SSL')));
text_row(_("Username:"), 'smtp_username', $_POST['smtp_username'], 20, 60);
password_row(_("Password:"), 'smtp_password', $_POST['smtp_password']);
end_table(1);

div_end();

submit_center('submit', _("Update"), true, '', 'default');

end_form();
end_page();