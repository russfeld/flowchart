require(['util/site', 'pusher', 'react', 'react-dom', 'ionsound'], function(site, pusher, React, reactDOM, ionsound) {

	site.ajaxcrsf();

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

	var userID = parseInt($('#userID').val());
	var isAdvisor = parseInt($('#isAdvisor').val());

	var enableButton = function(){
		$('#groupRegisterBtn').removeAttr('disabled');
	}

	var disableButton = function(){
		$('#groupRegisterBtn').attr('disabled', 'disabled');
	}

	var checkButtons = function(queue){
		var len = queue.length;
		var foundMe = false;
		for(var i = 0; i < len; i++){
			if(queue[i].userid === userID){
				foundMe = true;
				break;
			}
		}
		if(foundMe){
			disableButton();
		}else{
			enableButton();
		}
	}

	var checkDing = function(person){
		if(person.status == 2){
			ion.sound.play("door_bell");
		}
	}

	var initialCheckDing = function(queue){
		var len = queue.length;
		for(var i = 0; i < len; i++){
			if(queue[i].userid === userID){
				checkDing(queue[i]);
				break;
			}
		}
	}

	var sortFunction = function(a, b){
		if(a.status == b.status){
			return (a.id < b.id ? -1 : 1);
		}
		return (a.status < b.status ? 1 : -1);
	}

	var getStatus = function(data){
		if(data.status === 0) return "NEW";
		if(data.status === 1) return "QUEUED";
		if(data.status === 2) return "MEET WITH " + data.advisor;
		if(data.status === 3) return "DELAY";
		if(data.status === 4) return "ABSENT";
		if(data.status === 5) return "DONE";
	}

	$('#groupRegisterBtn').on('click', function(){
		$('#groupSpin').removeClass('hide-spin');
		$.ajax({
		  method: "POST",
		  url: '/groupsession/register',
		})
		.success(function( message ) {
			site.displayMessage(message, "success");
			site.clearFormErrors();
			disableButton();
			$('#groupSpin').addClass('hide-spin');
		}).fail(function( jqXHR, message ){
			if (jqXHR.status == 422)
			{
				site.setFormErrors(jqXHR.responseJSON);
			}else{
				alert("Unable to register: " + jqXHR.responseJSON);
			}
			$('#groupSpin').addClass('hide-spin');
		});
	});

	$('#groupDisableBtn').on('click', function(){
		var choice = confirm("Are you sure?");
		if(choice === true){
			var really = confirm("Seriously, this will lose all current data. Are you really sure?");
			if(really === true){
				var token = $('meta[name="csrf-token"]').attr('content');
				$('<form action="/groupsession/disable" method="POST"/>')
	        .append($('<input type="hidden" name="id" value="' + userID + '">'))
					.append($('<input type="hidden" name="_token" value="' + token + '">'))
	        .appendTo($(document.body)) //it has to be added somewhere into the <body>
	        .submit();
			}
		}
	});

	var pusherInstance = new Pusher(pusherKey);
	var groupSessionChannel = pusherInstance.subscribe( 'groupsession' );

	pusherInstance.connection.bind('connected', function() {
		$('#groupSpin').addClass('hide-spin');
	});

/*
 * Enable for Pusher Debugging
 */

	Pusher.log = function(message) {
	  if (window.console && window.console.log) {
	    window.console.log(message);
	  }
	};


	var StudentRow = React.createClass({
		takeStudent: function(event){
			var gid = event.currentTarget.dataset.id;
			$.ajax({
			  method: "POST",
			  url: '/groupsession/take',
				data: {gid: gid},
			})
			.success(function( message ) {
				site.displayMessage(message, "success");
			}).fail(function( jqXHR, message ){
				if (jqXHR.status == 422)
				{
					site.setFormErrors(jqXHR.responseJSON);
				}else{
					alert("Unable to take: " + jqXHR.responseJSON);
				}
			});
		},
		putStudent: function(event){
			var gid = event.currentTarget.dataset.id;
			$.ajax({
			  method: "POST",
			  url: '/groupsession/put',
				data: {gid: gid},
			})
			.success(function( message ) {
				site.displayMessage(message, "success");
			}).fail(function( jqXHR, message ){
				if (jqXHR.status == 422)
				{
					site.setFormErrors(jqXHR.responseJSON);
				}else{
					alert("Unable to put: " + jqXHR.responseJSON);
				}
			});
		},
		doneStudent: function(event){
			var gid = event.currentTarget.dataset.id;
			$.ajax({
			  method: "POST",
			  url: '/groupsession/done',
				data: {gid: gid},
			})
			.success(function( message ) {
				site.displayMessage(message, "success");
			}).fail(function( jqXHR, message ){
				if (jqXHR.status == 422)
				{
					site.setFormErrors(jqXHR.responseJSON);
				}else{
					alert("Unable to mark done: " + jqXHR.responseJSON);
				}
			});
		},
		delStudent: function(event){
			var gid = event.currentTarget.dataset.id;
			$.ajax({
			  method: "POST",
			  url: '/groupsession/delete',
				data: {gid: gid},
			})
			.success(function( message ) {
				site.displayMessage(message, "success");
			}).fail(function( jqXHR, message ){
				if (jqXHR.status == 422)
				{
					site.setFormErrors(jqXHR.responseJSON);
				}else{
					alert("Unable to delete: " + jqXHR.responseJSON);
				}
			});
		},
		render: function(){
			var badgeTitle = getStatus(this.props.student);
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
			}else {
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

	var GroupList = React.createClass({
		getInitialState: function(){
			return {queue: []};
		},
		componentDidMount: function(){
			var self = this;
			groupSessionChannel.bind( "App\\Events\\GroupsessionRegister", function(data){
				var queue = self.state.queue;
				var found = false;
				var len = queue.length;
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
				if(!found){
					queue.push(data);
				}
				checkButtons(queue);
				if(data.userid === userID){
					checkDing(data);
				}
				queue.sort(sortFunction);
				self.setState({queue: queue});
			});
			groupSessionChannel.bind( "App\\Events\\GroupsessionEnd", function(data){
				window.location.href = "/groupsession";
			});
			$.ajax({
			  method: "GET",
			  url: '/groupsession/queue',
			})
			.success(function( message ) {
				var queue = self.state.queue.concat(JSON.parse(message));
				checkButtons(queue);
				initialCheckDing(queue);
				queue.sort(sortFunction);
				self.setState({queue: queue});
			}).fail(function( jqXHR, message ){
				if (jqXHR.status == 422)
				{
					site.setFormErrors(jqXHR.responseJSON);
				}else{
					alert("Unable to get queue: " + jqXHR.responseJSON);
				}
			});
		},
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

	reactDOM.render(
		<GroupList />,
		document.getElementById('groupList')
	);



});
