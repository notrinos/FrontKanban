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
include($path_to_root . "/includes/db_pager.inc");
include_once($path_to_root . "/includes/session.inc");
add_access_extensions();

$js = "";
if ($SysPrefs->use_popup_windows)
	$js .= get_js_open_window(700, 300);
if (user_use_date_picker())
	$js .= get_js_date_picker();

include_once($path_to_root . "/includes/ui.inc");
include_once($path_to_root . "/modules/kanban/includes/kanban_db.inc");
include_once($path_to_root . "/modules/kanban/includes/kanban_ui.inc");

//--------------------------------------------------------------------------

unset($_SESSION['project']);

function project_link($row) {
	return "<a href='?proj=".$row['proj_id']."'>".$row['proj_name']."</a>";
}
function check_overdue($row) {
	return false;
}
function get_owner($row) {
	return get_user($row['owner_id'])['real_name'];
}
function get_project_type($row) {
    return $row['proj_type'] == 0 ? _('Public') : _('Private');
}
function edit_link($row) {
    return button('edit_'.$row['proj_id'], _('Edit this project'), false, ICON_EDIT);
}

//--------------------------------------------------------------------------

foreach (db_query(get_projects(false, true)) as $proj) {
    if(isset($_POST['edit_'.$proj['proj_id']]))
        meta_forward($path_to_root.'/modules/kanban/manage/add_project.php', 'ID='.$proj['proj_id']);
}

if(empty($_GET['proj'])) {

    page(_($help_context = "Projects List"), false, false, "", $js);
    start_form();

    start_outer_table(TABLESTYLE2, "cellpadding='10'");
    table_section(1);
    check_row(_('Also Closed').':', 'closed', null, true);
    table_section(2);
    check_row(_('Only Private').':', 'only_private', null, true);
    table_section(3);
    check_row(_('Only Public').':', 'only_public', null, true);
    end_outer_table(1);
    
    if(check_value('only_public') == 1 && check_value('only_private') != 1)
        $type = 0;
    elseif(check_value('only_public') != 1 && check_value('only_private') == 1)
        $type = 1;
    else
        $type = false;

    $sql = get_projects(false, check_value('closed'), $type);

    $cols = array(
        _('ID') => array('align'=>'center'),
        _('Name') => array('fun'=>'project_link'),
        _('Description'),
        _('Type') => array('fun'=>'get_project_type', 'align'=>'center'),
        _('Created date') => array('type'=>'date'),
        _('Closed date') => array('type'=>'date'),
        _('Begin date') => array('type'=>'date'),
        _('End date') => array('type'=>'date'),
        _('Owner') => array('fun'=>'get_owner'),
        _('Edit') => array('fun'=>'edit_link','align'=>'center')
    );

    $table = new_db_pager('projects_tbl', $sql, $cols);
    $table->set_marker('check_overdue', _("Marked rows are overdue."));
    // $table->width = "60%";
    display_note(_('Press name to go to project details.'));
    display_db_pager($table);

    end_form();
}
else {

    $_SESSION['project'] = $_GET['proj'];

    page($help_context = get_projects($_SESSION['project'])['proj_name'], false, false, "", $js);

    include_once("$path_to_root/modules/kanban/includes/ui/board.inc");
}
end_page();