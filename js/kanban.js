
/*======================================================\
|                      FrontKanban                      |
|-------------------------------------------------------|
|  Creator: Phương                                      |
|  Date :   01-Dec-2017                                 |
|  Description: Frontaccounting Project Management Ext  |
|  Free software under GNU GPL                          |
|                                                       |
\======================================================*/

(function(){
	"use strict";

	var app_data = {
		people:{}
	};
	var IN_EDIT_MODE = false;

	var loadData = function() {
		var state_data = init_states(cols);
		$.ajax({
			type: 'POST',
			url: '../data.php',
			data: {action:'load'},
			dataType: 'json',
			success: function(data) {
				if (data === null) {
					data = {};
				}
				app_data.board = init_board(data);
				app_data.states = state_data.states;
				app_data.states_order = state_data.states_order;
				app_data.rawData = data;
                $.each(app_data.rawData, function(key, val){
                	var decoded = $('<textarea/>').html(val.content).text();
                    app_data.rawData[key].content = decoded;
                    // console.log(decoded);
                    $.each(app_data.rawData[key].comment, function(time, comment){
                        $.each(comment,function(user,txt){
                        	app_data.rawData[key].comment[time][user] = $('<textarea/>').html(txt).text();
                        })
                    });
                });
				create_board(app_data);
				createPeopleList();
			}
		});
	};

	var sendNotification = function(data) {
        $.ajax({
			type: 'POST',
			url: '../data.php',
			data: {action:'sendEmail',data:data},
			dataType: 'json',
			success: function(data) {
				// alert('An email has been sent to project members.');
			}
		});
	};

	var createPeopleList = function() {
		var peopleList = '<form id="people_form"><ul class="people-list">';
		for (var i in app_data.people) {
			if (app_data.people.hasOwnProperty(i)) {
				peopleList += '<li><input type="checkbox" name="'+i+'" value="0">'+i+'</li>';
			}
		}
		peopleList += '</ul></form>';
		$('#member_filter').append(peopleList);
	};

	var saveData = function(data) {
		if (data === '') {
			data = {};
		}
		$.ajax({
			type: 'POST',
			url: '../data.php',
			data: {action:'save',data:data},
			dataType:'json'
		});
	};

	var saveComment = function(data) {
        if(data == '') {
        	data = {};
        }
        $.ajax({
        	type: 'POST',
        	url: '../data.php',
        	data: {action:'save',data:data},
        	dataType: 'json',
        	success: function() {
				
			}
        });
	};

	var init_states = function(states_input) {
		var states = {};
		var states_order = [];
		for ( var i=0, len=states_input.length; i<len; i++ ) {
			var state = states_input[i].split(",");
			if (state.length === 2) {
				states[state[0]] = state[1];
				states_order.push(state[0]);
			}
		}
		return {states: states, states_order: states_order};
	};

	var init_board = function(tasks) {
		var board = {};
		for (var i in tasks) {
			if (tasks.hasOwnProperty(i)) {
				var task = tasks[i];
				task.id = i;
				if (! board[task.state]) {
					board[task.state] = [];
				}
				board[task.state].push(task);
			}
		}
		return board;
	};

	var create_task_li_item = function(task) {
		var task_element = $("<li data-state='"+task.state+"' data-id='"+task.id+"'><div class='task_box color_"+task.color+"' ><div class='task_editable' data-id='"+task.id+"'>" + task.title + "</div><div class='user_box'>" + task.responsible + "</div><a href='#' class='editable'>Edit</a></div></li>");

		if (app_data.people[task.responsible] === undefined) {
			app_data.people[task.responsible] = [task.id];
		}
		else {
			app_data.people[task.responsible].push(task.id);
		}
		return task_element;
	};

	var create_list = function(board, state) {
		var list = $("<ul></ul>");
		if (board[state]) {
			for (var i=0, len=board[state].length; i<len; i++) {
				var id = board[state][i].id;
				var task_element = create_task_li_item(app_data.rawData[id]);
				list.append(task_element);
			}
		}
		return "<ul class='state' id='" + state + "'>"+list.html()+"</ul>";
	};

	var create_column = function(board, state, headlines, num) {
		var odd_even = num % 2 == 0 ? 'col_even' : 'col_odd';
		var content = '<div class="col state_box state_'+state+' col_'+num+' '+odd_even+'"><h4><a href="#" class="new">+</a>'+headlines + '</h4>';
		
		content += create_list(board, state);
		content += '</div>';
		return content;
	};

	var create_board = function(app_data) {
		for (var j=0; j< app_data.states_order.length; j++) {
			var state = app_data.states_order[j];
			var col = create_column(app_data.board, state, app_data.states[state],j);
			$('#kanban_board').append(col);
		}
		
		startDragsort();
	};

	var create_task = function(id, title, content, state, color, comment) {
		if (state === undefined) {
			state = app_data.states_order[0];
		}
		if (color === undefined) {
			color = 0;
		}
        if(comment == undefined) {
        	comment = "";
        }
		var assignee = $('#kanban_board').find('select.user_list').val();
		if(assignee === undefined || assignee == 0)
			assignee = 'Not assigned';
		var task = {
			title:title,
			content:content,
			id:id,
			responsible:assignee,
			state:state,
			color:color,
			comment:comment
		};
		return task;
	};

	var create_comments = function(comments) {

	};

	var droppedElement = function() {
		var newState = $(this).parent().attr('id');
		var taskId = $(this).attr('data-id');
		app_data.rawData[taskId].state = newState;
		saveData(app_data.rawData);
	};

	var startDragsort = function() {
		$('ul.state').dragsort({dragSelector:'li',dragBetween: true, placeHolderTemplate: "<li class='placeholder'><div>&nbsp</div></li>",dragEnd:droppedElement});
	};

	var destroyDragsort = function() {
		$('ul.state').dragsort("destroy");
	};

	var get_users = function() {
		$.ajax({
			type: 'POST',
			url: '../data.php',
			data: {action:'get_all_users'},
			dataType: 'json',
			success: function(data) {
				if (data === null) {
					data = {};
				}
				app_data.users = data;
				app_data.currUser = data[Object.keys(data).length - 3];
				app_data.currUserName = data[Object.keys(data).length - 2];
				app_data.currUserMail = data[Object.keys(data).length - 1];
				// console.log(app_data);
			}
		});
	}

	var create_members_list = function(selected_id) {
		var list = "<select class='user_list'><option value='0'>not assigned</option>";
		for(var i=0; i<app_data.users.length; i++) {
			if(app_data.users[i].user_id == selected_id) {
				list += "<option value="+app_data.users[i].user_id+" selected='selected'>"+app_data.users[i].real_name+"</option>";
			}
			else {
				if(app_data.users[i].user_id != undefined)
				    list += "<option value="+app_data.users[i].user_id+">"+app_data.users[i].real_name+"</option>";
			}
		}
		list += "</select>";

		return list;
	}

	var dateFormat = function(miliseconds) {
		var duration = parseInt(miliseconds);
		var date = new Date(duration);
		var day = date.getDate() < 10 ? '0'+date.getDate() : date.getDate();
		var month = date.getMonth();
		var month_name = new Array('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
		var year = date.getFullYear();
        var hours = parseInt((duration/(1000*60*60))%24);
        hours = (hours < 10) ? "0" + hours : hours;
        var minutes = parseInt((duration/(1000*60))%60);
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        var seconds = parseInt((duration/1000)%60);
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        
		return day + '/' + month_name[month] + '/' + year;
	}

	var decodeEntities = (function() {
        var element = document.createElement('div');

        function decodeHTMLEntities(str) {
            if(str && typeof str === 'string') {
                str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
                str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
                element.innerHTML = str;
                str = element.textContent;
                element.textContent = '';
            }
            return str;
        }
        return decodeHTMLEntities;
    })();
	
//--------------------------------------------------------------------------

	$(document).ready(function(){
		
		get_users();
		loadData();
		// console.log(app_data.people);
		
		$('#kanban_board').on('click', '.new', function(){
			var id = new Date().getTime();
			var task = create_task(id, "New task", "", $(this).parent().siblings('.state').attr('id'));
			if (app_data.rawData === undefined) {
				app_data.rawData = {};
			}
			app_data.rawData[id] = task;
			saveData(app_data.rawData);
			var taskHtml = create_task_li_item(task);
			$('#'+task.state).append(taskHtml);
			$(taskHtml).find('.editable').trigger('click');
			destroyDragsort();
			return false;
		});

		$('#kanban_board').on('click','.editable', function(){
			if (!IN_EDIT_MODE) {
				var taskId = $(this).parent().parent().attr('data-id');
				var titleValue = app_data.rawData[taskId].title;
				var taskContent = app_data.rawData[taskId].content;
				taskContent = taskContent.replace(/"/g, "'");
				var oldColor = app_data.rawData[taskId].color;
				var oldAssignee = app_data.rawData[taskId].responsible;

				var comments = '<div id="comments_wrapper">';

				$.each(app_data.rawData[taskId].comment, function(key,val){
					var momment = dateFormat(key);
					$.each(val, function(user, cmt){
						cmt = $('<textarea/>').html(cmt).text();
						comments += '<p><b>' + user + '</b><i>&nbsp;' + momment + '</i></p>';
						comments += '<div class="comment_content">' + cmt + '</div>';
						app_data.rawData[taskId].comment[key][user] = cmt;
					});
				});

				comments += '</div>';
				
				var createdDate = dateFormat(app_data.rawData[taskId].id);

				var members = create_members_list(oldAssignee);
				var taskForm = '<form id="task_form"><div id="color_and_title"><a class="cancel" href="#">&#10060;</a><input type="text" id="task_title" class="editBox" value="'+titleValue+'" maxlength="100"/><div class="date_cells">Created: '+createdDate+'</div></div><input type="text" class="editBox formatable" id="task_input" value="'+taskContent+'" data-old-value="'+taskContent+'" data-old-color="'+oldColor+'"><div class="user_list_cells">Assignee:'+members+'</div><div class="task_modal_control"><a href="#" class="color">Color</a><a href="#" class="delete">Delete</a></div></form>';
				var commentForm = '<form id="comment_form"><div class="task_comments"></div><input type="text" class="formatable" id="comment_input"></form>';
				var commentBtn = '<a id="save_comment" href="#">Comment</a>';
				var saveBtn = '<a class="save" href="#">Save</a>';

				$(this).parent().addClass('task_modal');
				$('.task_modal').show();
				$(this).siblings('.task_editable').append(taskForm);
				$(this).siblings('.task_editable').append(commentForm);
				// $('#task_form').find('#task_title').focus();
				var val = $('#task_form').find('#task_input').val();
				$('#task_form').find('#task_input').val('');
				$('#task_form').find('#task_input').val(val);
				$(this).siblings('.task_editable').find('.task_comments').append('<p>'+comments+'</p>');
				$('#task_title').addClass('color_' + oldColor);
				destroyDragsort();
				IN_EDIT_MODE = true;
				$(".formatable").jqte();
				$('#task_form .jqte_toolbar').append(saveBtn);
				$('#comment_form .jqte_toolbar').append(commentBtn);

				$('.task_editable').on('paste','.jqte_editor', function(e){
					e.preventDefault();
                    var text = e.originalEvent.clipboardData.getData("text/plain");
                    document.execCommand("insertHTML", false, text);
				});
			}
		});

		$('#member_filter').on('change', '.people-list input[type="checkbox"]', function(){
			var responsible = $(this).attr('name');

			if($(this).val() == '0') {
				$(this).val('1')
			}
			else {
				$(this).val('0')
			}

			var count = 0;
			for (var k in app_data.people) {

			    if($('input[name="'+k+'"]').val() == "0") {
					for(var j in app_data.people[k]) {
						$('#kanban_board li[data-id="'+app_data.people[k][j]+'"] .task_box').addClass('blur_task');
					}
				}
				else {
					for(var j in app_data.people[k]) {
						$('#kanban_board li[data-id="'+app_data.people[k][j]+'"] .task_box').removeClass('blur_task');
					}
					count++ ;
				}
			}
			if(count == 0) {
				$('#kanban_board').find('.blur_task').removeClass('blur_task');
			}
		});

		$('#date_filter').on('click', 'input[name="search"]', function() {
			var from = $('input[name="FromDate"]').attr('_last_val');
			var to = $('input[name="ToDate"]').attr('_last_val');

			if(user.datefmt == 1) {
				from = from.split('/');
				from = new Date(from[2],from[1]-1,from[0]);
			    from = from.getTime();
			    to = to.split('/');
			    to = new Date(to[2],to[1]-1,to[0]);
			    to = to.getTime();
			}
			else {
				from = new Date(from);
			    from = from.getTime();
			    to = new Date(to);
			    to = to.getTime();
			}

			if(to < from)
				alert("From date must be before To date");

			for(var i in app_data.rawData) {
				if(i < from || i > (to + 86399999)) {
					for(var j in app_data.rawData[i]) {
						$('#kanban_board li[data-id="'+app_data.rawData[i][j]+'"] .task_box').addClass('blur_task');
					}
				}
				else {
					for(var j in app_data.rawData[i]) {
						$('#kanban_board li[data-id="'+app_data.rawData[i][j]+'"] .task_box').removeClass('blur_task');
					}
				}
			}
		});

		$('#date_filter').on('click', 'input[name="clear"]', function() {
			for(var i in app_data.rawData) {
				for(var j in app_data.rawData[i]) {
					$('#kanban_board li[data-id="'+app_data.rawData[i][j]+'"] .task_box').removeClass('blur_task');
					$('#date_filter').find('.date').val('');
				}
			}
		});

		$(document).keyup(function(e) {
			if (e.keyCode === 27) { 
				$('.cancel').trigger('click');
			}
			else if (e.keyCode === 78) {
				if (!IN_EDIT_MODE) {
					$('#new').trigger('click');
				}
			}
		});

		$('#kanban_board').on('click','.cancel', function(){
			var taskId = $(this).parent().parent().parent().attr('data-id');
			var oldTitle = app_data.rawData[taskId].title;

			var remove_colors = "";
			for (var i=0;i<possible_colors;i++) {
				remove_colors += "color_"+i+" ";
			}
			var oldColor = $(this).parent().parent().find('#task_input').attr('data-old-color');
			app_data.rawData[taskId].color = oldColor;
			$(this).parent().parent().parent().parent().removeClass(remove_colors);
			$(this).parent().parent().parent().parent().addClass('color_'+oldColor);
			$(this).parent().parent().parent().parent().removeClass('task_modal');
			$(this).parent().parent().parent().parent().attr('style', '');

			$(this).parent().parent().parent().html(oldTitle);

			$('html').unbind('click');
			setTimeout(function(){IN_EDIT_MODE = false;}, 200);
			startDragsort();
      		return false;
		});

		$('#kanban_board').on('click','.delete', function(){
			var id = $(this).parent().parent().parent().attr('data-id');
			$(this).parent().parent().parent().parent().parent().remove();
			$('html').unbind('click');
			delete app_data.rawData[id];
			saveData(app_data.rawData);
			setTimeout(function(){IN_EDIT_MODE = false;}, 200);
			$(this).parent().parent().parent().parent().removeClass('task_modal');
			startDragsort();
            return false;
		});

		$('#kanban_board').on('click', '.color', function() {
			var taskId = $(this).parent().parent().parent().attr('data-id');
			if (app_data.rawData[taskId].color === undefined) {
				app_data.rawData[taskId].color = 0;				
			}
			else {
				$(this).parent().parent().parent().parent().removeClass('color_'+app_data.rawData[taskId].color);
				$('#task_title').removeClass('color_'+app_data.rawData[taskId].color);
				app_data.rawData[taskId].color++;
				if (app_data.rawData[taskId].color >= possible_colors) {
					app_data.rawData[taskId].color = 0;
				}
			}
			$(this).parent().parent().parent().parent().addClass('color_'+app_data.rawData[taskId].color);
			$('#task_title').addClass('color_'+app_data.rawData[taskId].color);
            return false;
		});

		$('#kanban_board').on('submit', '#task_form', function(){
			var title = $(this).find('#task_title').val();
			var content = $(this).find('#task_input').val();
			var taskId = $(this).parent().attr('data-id');
			var state = $(this).parent().parent().parent().attr('data-state');
			var color = app_data.rawData[taskId].color;
			var task = create_task(taskId, title, content, state, color, app_data.rawData[taskId].comment);
			var notification = {
				subject:app_data.currUserName + " has created or edited a task on your project.",
				content:app_data.currUserName + " has created a task: " + "<h3>" + title + "</h3>" + "<p>" + content + "</p>"
			};
            
			app_data.rawData[taskId] = task;
			saveData(app_data.rawData);

			$('html').unbind('click');
			$(this).parent().parent().attr('style', '');
			$(this).parent().siblings('.user_box').html(task.responsible);
			$(this).parent().html(task.title);
			setTimeout(function(){IN_EDIT_MODE = false;}, 200);

			$.each(app_data.users, function(key,val){
                if(val.user_id != app_data.currUser) {
                	notification.recipient = val.email;
                	sendNotification(notification);
                }
			});
			return false;
		});

		$('#kanban_board').on('submit', '#comment_form', function(){

			var taskId = $(this).parent().attr('data-id');
			var commentID = new Date().getTime();
			var newComment = $('#comment_input').val();
			var title = app_data.rawData[taskId].title;
			var content = app_data.rawData[taskId].content;
			var state = app_data.rawData[taskId].state;
			var color = app_data.rawData[taskId].color
			var notification = {
				subject:app_data.currUserName + " has commented on task: " + title,
				content: "<b>" + app_data.currUserName + "</b>" + " has commented on the task: " + "<b>" + title + "</b>" + "<p>" + newComment + "</p>"
			};

            if(app_data.rawData[taskId].comment == "") {
                app_data.rawData[taskId].comment = {commentID:""};
                
            }
            app_data.rawData[taskId].comment[commentID] = {};
			app_data.rawData[taskId].comment[commentID][app_data.currUser] = newComment;

			var task = create_task(taskId, title, content, state, color, app_data.rawData[taskId].comment);
			app_data.rawData[taskId] = task;
			saveComment(app_data.rawData);

			$('html').unbind('click');
			$(this).parent().parent().attr('style', '');
			$(this).parent().siblings('.user_box').html(task.responsible);
			$(this).parent().html(task.title);
			setTimeout(function(){IN_EDIT_MODE = false;}, 200);

			$.each(app_data.users, function(key,val){
                if(val.user_id != app_data.currUser) {
                	notification.recipient = val.email;
                	sendNotification(notification);
                }
			});

			return false;
		});

		$('#kanban_board').on('click','.save', function(){
			$('.task_modal').removeClass('task_modal');
			$('#task_form').submit();
			startDragsort();
			
			return false;
		});

		$('#kanban_board').on('click','#save_comment',function(){
			$('#comment_form').submit();
			$('.task_modal').removeClass('task_modal');
            
            startDragsort();

			return false;
		});
	});

  })();
