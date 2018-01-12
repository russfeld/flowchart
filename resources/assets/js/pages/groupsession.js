site = require('../util/site');
require('pusher-js');
ion = require('ion-sound');

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
	var userID = parseInt($('#userID').val());
	var isAdvisor = parseInt($('#isAdvisor').val());

	//register button click
	$('#groupRegisterBtn').on('click', function(){
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
	});

	//disable button click
	$('#groupDisableBtn').on('click', function(){
		var choice = confirm("Are you sure?");
		if(choice === true){
			var really = confirm("Seriously, this will lose all current data. Are you really sure?");
			if(really === true){
				//this is a bit hacky, but it works
				var token = $('meta[name="csrf-token"]').attr('content');
				$('<form action="/groupsession/disable" method="POST"/>')
	        .append($('<input type="hidden" name="id" value="' + userID + '">'))
					.append($('<input type="hidden" name="_token" value="' + token + '">'))
	        .appendTo($(document.body)) //it has to be added somewhere into the <body>
	        .submit();
			}
		}
	});

	//load pusher
	var pusherInstance = new Pusher(pusherKey);
	var groupSessionChannel = pusherInstance.subscribe( 'groupsession' );

	//connect using pusher
	pusherInstance.connection.bind('connected', function() {

		//when connected, disable the spinner
		$('#groupSpin').addClass('hide-spin');
	});

	//enable for pusher debugging
  console.log("Pusher logging enabled!");
	Pusher.log = function(message) {
	  if (window.console && window.console.log) {
	    window.console.log(message);
	  }
	};

	//render REACT DOM elements
	reactDOM.render(
		<GroupList />,
		document.getElementById('groupList')
	);

};

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
		if(queue[i].userid === userID){
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
		if(queue[i].userid === userID){
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
 * Function to translate status messages to text
 *
 * @param data - data item to translate
 * @return - text status message
 */
var getStatus = function(data){
	if(data.status === 0) return "NEW";
	if(data.status === 1) return "QUEUED";
	if(data.status === 2) return "MEET WITH " + data.advisor;
	if(data.status === 3) return "DELAY";
	if(data.status === 4) return "ABSENT";
	if(data.status === 5) return "DONE";
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
}

/**
 * React class for rendering a single student row
 *
 * see https://toddmotto.com/react-create-class-versus-component/ for updates
 */
//var StudentRow = React.createClass({

class StudentRow extends React.Component {

	//constructor function
	constructor(props) {
    super(props);
  }

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

	//function to render the item on the screen
	render: function(){
		var badgeTitle = getStatus(this.props.student);

		//if the user is an advisor, render extra buttons
		if(isAdvisor === 1){
			if(this.props.student.status == 0 || this.props.student.status == 1){
				return(
					<div className="alert alert-info groupsession-div" role="alert"><button className="btn btn-danger pull-right groupsession-button del-button" data-id={this.props.student.id} onClick={this.delStudent}>X</button><button className="btn btn-success pull-right groupsession-button take-button" data-id={this.props.student.id} onClick={this.takeStudent}>Take</button>{this.props.student.name} <span className="badge">{badgeTitle}</span></div>
				);
			}else if(this.props.student.status == 2){
				return(
					<div className="alert alert-success groupsession-div" role="alert"><button className="btn btn-danger pull-right groupsession-button del-button" data-id={this.props.student.id} onClick={this.delStudent}>X</button><button className="btn btn-primary pull-right groupsession-button done-button" data-id={this.props.student.id} onClick={this.doneStudent}>Done</button><button className="btn btn-info pull-right groupsession-button put-button" data-id={this.props.student.id} onClick={this.putStudent}>Requeue</button>{this.props.student.name} <span className="badge">{badgeTitle}</span></div>
				);
			}

		//if user is not an advisor, render normal view
		}else{
			if(this.props.student.status == 0 || this.props.student.status == 1){
				var myClass = "alert alert-info groupsession-div";
			}else if (this.props.student.status == 2){
				var myClass = "alert alert-success groupsession-div";
			}
			if (userID === this.props.student.userid){
				var name = <b>{this.props.student.name}</b>;
				myClass = myClass + " groupsession-me";
			}else{
				var name = this.props.student.name;
			}
			return(
				<div className={myClass} role="alert">{name} <span className="badge">{badgeTitle}</span></div>
			);
		}
	},
});

/**
 * React class to render the entire group list
 */
var GroupList = React.createClass({

	//initial state - empty the queue
	getInitialState: function(){
		return {queue: []};
	},

	//on successful load, connect to the pusher queue
	componentDidMount: function(){
		var self = this;

		//bind to pusher
		groupSessionChannel.bind( "App\\Events\\GroupsessionRegister", function(data){
			var queue = self.state.queue;
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

			//update react state
			self.setState({queue: queue});
		});

		//bind to the channel for groupsession ending
		groupSessionChannel.bind( "App\\Events\\GroupsessionEnd", function(data){
			//if groupsessions end, force all browsers to reload the URL
			window.location.href = "/groupsession";
		});

		//use AJAX to get initial queue
		window.axios.get('/groupsession/queue')
			.then(function(response){
				var queue = self.state.queue.concat(response.data);
				checkButtons(queue);
				initialCheckDing(queue);
				queue.sort(sortFunction);
				self.setState({queue: queue});
			})
			.catch(function(error){
				site.handleError('get queue', '', error);
			});

	},

	//function to render the grouplist
	render: function(){
		var divs = [];
		this.state.queue.forEach(function(student){
			divs.push(<StudentRow key={student.id} student={student} />);
		});
		return (
			<div>{divs}</div>
		);
	}

});
