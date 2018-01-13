window.Vue = require('vue');
var site = require('../util/site');
var Echo = require('laravel-echo');
require('ion-sound');

window.Pusher = require('pusher-js');

/**
 * Groupsession init function
 * must be called explicitly to start
 */
exports.init = function(){

	//load ion-sound library
	ion.sound({
    sounds: [
        {
            name: "door_bell"
        },
    ],
    volume: 1.0,
    path: "/sounds/",
    preload: true
	});

	//get userID and isAdvisor variables
	window.userID = parseInt($('#userID').val());

	//register button click
	$('#groupRegisterBtn').on('click', groupRegisterBtn);

	//disable button click
	$('#groupDisableBtn').on('click', groupDisableBtn);

	//render Vue App
	window.vm = new Vue({
		el: '#groupList',
		data: {
			queue: [],
			advisor: parseInt($('#isAdvisor').val()) == 1,
			userID: parseInt($('#userID').val()),
			online: [],
		},
		methods: {
			//Function to get CSS classes for a student object
			getClass: function(s){
				return{
					'alert-info': s.status == 0 || s.status == 1,
					'alert-success': s.status == 2,
					'groupsession-me': s.userid == this.userID,
					'groupsession-offline': $.inArray(s.userid, this.online) == -1,
				};
			},
			//function to take a student from the list
			takeStudent: function(event){
				var data = { gid: event.currentTarget.dataset.id };
				var url = '/groupsession/take'
				ajaxPost(url, data, 'take');
			},

			//function to put a student back at the end of the list
			putStudent: function(event){
				var data = { gid: event.currentTarget.dataset.id };
				var url = '/groupsession/put'
				ajaxPost(url, data, 'put');
			},

			// function to mark a student done on the list
			doneStudent: function(event){
				var data = { gid: event.currentTarget.dataset.id };
				var url = '/groupsession/done'
				ajaxPost(url, data, 'mark done');
			},

			//function to delete a student from the list
			delStudent: function(event){
				var data = { gid: event.currentTarget.dataset.id };
				var url = '/groupsession/delete'
				ajaxPost(url, data, 'delete');
			},
		},
	})


	//Enable Pusher logging
	if(window.env == "local" || window.env == "staging"){
		console.log("Pusher logging enabled!");
		Pusher.logToConsole = true;
	}

	//Load the Echo instance on the window
	window.Echo = new Echo({
		broadcaster: 'pusher',
		key: window.pusherKey,
		cluster: window.pusherCluster,
	});

	//Bind to the connected action on Pusher (called when connected)
	window.Echo.connector.pusher.connection.bind('connected', function(){
		//when connected, disable the spinner
		$('#groupSpin').addClass('hide-spin');

		//Load the initial student queue via AJAX
		window.axios.get('/groupsession/queue')
			.then(function(response){
				window.vm.queue = window.vm.queue.concat(response.data);
				checkButtons(window.vm.queue);
				initialCheckDing(window.vm.queue);
				window.vm.queue.sort(sortFunction);
			})
			.catch(function(error){
				site.handleError('get queue', '', error);
			});
	})

	//Connect to the groupsession channel
	/*
	window.Echo.channel('groupsession')
		.listen('GroupsessionRegister', (data) => {

		});
 */

	//Connect to the groupsessionend channel
	window.Echo.channel('groupsessionend')
		.listen('GroupsessionEnd', (e) => {

			//if ending, redirect back to home page
			window.location.href = "/groupsession";
	});

	window.Echo.join('presence')
		.here((users) => {
			var len = users.length;
			for(var i = 0; i < len; i++){
				window.vm.online.push(users[i].id);
			}
		})
		.joining((user) => {
			window.vm.online.push(user.id);
		})
		.leaving((user) => {
			window.vm.online.splice( $.inArray(user.id, window.vm.online), 1);
		})
		.listen('GroupsessionRegister', (data) => {
			var queue = window.vm.queue;
			var found = false;
			var len = queue.length;

			//update the queue based on response
			for(var i = 0; i < len; i++){
				if(queue[i].id === data.id){
					if(data.status < 3){
						queue[i] = data;
					}else{
						queue.splice(i, 1);
						i--;
						len--;
					}
					found = true;
				}
			}

			//if element not found on current queue, push it on to the queue
			if(!found){
				queue.push(data);
			}

			//check to see if current user is on queue before enabling button
			checkButtons(queue);

			//if current user is found, check for status update to play sound
			if(data.userid === userID){
				checkDing(data);
			}

			//sort the queue correctly
			queue.sort(sortFunction);

			//update Vue state, might be unnecessary
			window.vm.queue = queue;
		});

};


/**
 * Vue filter for status text
 *
 * @param data - the student to render
 */
Vue.filter('statustext', function(data){
	if(data.status === 0) return "NEW";
	if(data.status === 1) return "QUEUED";
	if(data.status === 2) return "MEET WITH " + data.advisor;
	if(data.status === 3) return "DELAY";
	if(data.status === 4) return "ABSENT";
	if(data.status === 5) return "DONE";
});

/**
 * Function for clicking on the register button
 */
var groupRegisterBtn = function(){
	$('#groupSpin').removeClass('hide-spin');

	var url = '/groupsession/register';
	window.axios.post(url, {})
		.then(function(response){
			site.displayMessage(response.data, "success");
			disableButton();
			$('#groupSpin').addClass('hide-spin');
		})
		.catch(function(error){
			site.handleError('register', '#group', error);
		});
};

/**
 * Function for advisors to disable groupsession
 */
var groupDisableBtn = function(){
	var choice = confirm("Are you sure?");
	if(choice === true){
		var really = confirm("Seriously, this will lose all current data. Are you really sure?");
		if(really === true){
			//this is a bit hacky, but it works
			var token = $('meta[name="csrf-token"]').attr('content');
			$('<form action="/groupsession/disable" method="POST"/>')
				.append($('<input type="hidden" name="id" value="' + window.userID + '">'))
				.append($('<input type="hidden" name="_token" value="' + token + '">'))
				.appendTo($(document.body)) //it has to be added somewhere into the <body>
				.submit();
		}
	}
}

/**
 * Function to enable registration button
 */
var enableButton = function(){
	$('#groupRegisterBtn').removeAttr('disabled');
}

/**
 * Function to disable registration button
 */
var disableButton = function(){
	$('#groupRegisterBtn').attr('disabled', 'disabled');
}

/**
 * Function to check and see if user is on the list - if not, don't enable button
 */
var checkButtons = function(queue){
	var len = queue.length;
	var foundMe = false;

	//iterate through users on list, looking for current user
	for(var i = 0; i < len; i++){
		if(queue[i].userid === window.userID){
			foundMe = true;
			break;
		}
	}

	//if found, disable button; if not, enable button
	if(foundMe){
		disableButton();
	}else{
		enableButton();
	}
}

/**
 * Check to see if the current user is beckoned, if so, play sound!
 *
 * @param person - the current user to check
 */
var checkDing = function(person){
	if(person.status == 2){
		ion.sound.play("door_bell");
	}
}

/**
 * Check if the person has been beckoned on load; if so, play sound!
 *
 * @param queue - the initial queue of users loaded
 */
var initialCheckDing = function(queue){
	var len = queue.length;
	for(var i = 0; i < len; i++){
		if(queue[i].userid === window.userID){
			checkDing(queue[i]);
			break;
		}
	}
}

/**
 * Helper function to sort elements based on their status
 *
 * @param a - first person
 * @param b - second person
 * @return - sorting value indicating who should go first_name
 */
var sortFunction = function(a, b){
	if(a.status == b.status){
		return (a.id < b.id ? -1 : 1);
	}
	return (a.status < b.status ? 1 : -1);
}



/**
 * Function for making AJAX POST requests
 *
 * @param url - the URL to send to
 * @param data - the data object to send
 * @param action - the string describing the action
 */
var ajaxPost = function(url, data, action){
	window.axios.post(url, data)
		.then(function(response){
			site.displayMessage(response.data, "success");
		})
		.catch(function(error){
			site.handleError(action, '', error);
		});
};
