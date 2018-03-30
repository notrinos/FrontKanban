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
$path_to_root  = '../../..';

include_once($path_to_root . '/includes/session.inc');
add_access_extensions();

$js = "";
if (user_use_date_picker())
	$js .= get_js_date_picker();

include_once($path_to_root . '/includes/ui.inc');
include_once($path_to_root . '/modules/kanban/includes/kanban_db.inc');
include_once($path_to_root . '/modules/kanban/includes/kanban_ui.inc');

page(_($help_context = 'Manage Project'), false, false, '', $js);

if(isset($_GET['ID']))
	$selected_id = $_GET['ID'];
elseif(isset($_POST['selected_id']))
    $selected_id = $_POST['selected_id'];

//-----------------------------------------------------------------------------

if(isset($_POST['addupdate'])) {
	if(strlen($_POST['proj_name']) == 0 || $_POST['proj_name'] == '') {
		display_error(_('Project name must be entered.'));
		set_focus('proj_name');
	}
	else {
		write_project(@$selected_id, get_post('proj_name'), get_post('proj_description'), get_post('proj_type'), Today(), null, $_POST['begin_date'], $_POST['end_date'], $_SESSION['wa_current_user']->user, check_value('closed'));

		if(empty($selected_id)) {
            $id = db_insert_id();
		    if(add_project_data_file($id))
		        display_notification(_('New project created'));
		    else {
			    delete_project($id);
			    display_error(_('Could not create data file'));
		    }
		}
		else
            display_notification(_('Project has been updated.'));
	}
	$sav = get_post('selected_id');
	unset($_POST);
	$_POST['selected_id'] = $sav;
	$Ajax -> activate('_page_body');
}

//-----------------------------------------------------------------------------

start_form();

if(!empty($selected_id)) {
	$proj = get_projects($selected_id);
	$_POST['proj_name'] = $proj['proj_name'];
	$_POST['proj_type'] = $proj['proj_type'];
	$_POST['begin_date'] = sql2date($proj['begin_date']);
	$_POST['end_date'] = sql2date($proj['end_date']);
	$_POST['proj_description'] = $proj['proj_description'];
	$_POST['closed'] = $proj['closed'];

	hidden('selected_id', $selected_id);
}

start_table(TABLESTYLE2);
text_row(_('Project Name').':', 'proj_name', null, 40, 50);
project_types_radio_row(_('Project Type').':', 'proj_type', get_post('proj_type'));
date_row(_('Begin Date').':', 'begin_date');
date_row(_('End Date').':', 'end_date', null, null, 0, 0, 1);
textarea_row(_('Description').':', 'proj_description', null, 36, 5);
check_row(_('Closed').':', 'closed');
end_table(1);

div_start('controls');

$txt = empty($selected_id) ? _('Add New Project') : _('Update Project');
submit_center('addupdate', $txt, true, '', 'default');

div_end();

end_form(1);
end_page();