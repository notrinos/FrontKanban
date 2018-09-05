
<link href="<?php echo $path_to_root ?>/modules/kanban/css/kanban.css" rel="stylesheet" type="text/css" />
<link type="text/css" rel="stylesheet" href="../css/jquery-te-1.4.0.css" charset="utf-8" />
	
<div id="kanban_wrapper">
	<div id="kanban_board"></div>
	<div class="clear"></div>

	<div id="member_filter" class="task_filter">
		<div class="filter_header">Project members</div>
	</div>
	<div id="date_filter" class="task_filter">
		<div class="filter_header">Created date</div>
        <?php
        start_table(TABLESTYLE_NOBORDER, 'align=left');
        date_cells(_("From:"), 'FromDate', null, null, 0, 0, 1001, null, false);
        date_cells(_("To:"), 'ToDate', null, null, 0, 0, 1001, null, false);
        button_cell('search', _('Search'), _('Click to search'));
        button_cell('clear', _('Clear'), _('Clear date filter'));
        end_table();
        ?>
	</div>
</div>

<?php
if(user_theme() != 'flat' && user_theme() != 'shinee')
    echo "<script type='text/javascript' src='../js/jquery-1.10.2.min.js'></script>";
?>

<script type="text/javascript" src="../js/jquery.dragsort-0.5.2.js" ></script>
<script type="text/javascript" src="../js/config.js" ></script>
<script type="text/javascript" src="../js/kanban.js" ></script>
<script type="text/javascript" src="../js/jquery-te-1.4.0.min.js"></script>
