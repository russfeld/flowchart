require(['util/site', 'pusher', 'react', 'react-dom'], function(site, pusher, React, reactDOM) {

	site.ajaxcrsf();

	var userID = parseInt($('#userID').val());
	var isAdvisor = parseInt($('#isAdvisor').val());

	var getStatus = function(data){
		if(data === 0) return "NEW";
		if(data === 1) return "QUEUED";
		if(data === 2) return "BECKON";
		if(data === 3) return "DELAY";
		if(data === 4) return "ABSENT";
		if(data === 5) return "COMPLETE";
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
			$('#groupRegisterBtn').attr('disabled', 'disabled');
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

	var pusherInstance = new Pusher(pusherKey);
	var groupSessionChannel = pusherInstance.subscribe( 'groupsession' );

	pusherInstance.connection.bind('connected', function() {
	  $('#groupRegisterBtn').removeAttr('disabled');
		$('#groupSpin').addClass('hide-spin');
	});

	Pusher.log = function(message) {
	  if (window.console && window.console.log) {
	    window.console.log(message);
	  }
	};

	var StudentRow = React.createClass({
		render: function(){
			var badgeTitle = getStatus(this.props.student.status);
			if(isAdvisor === 1){
				return(
					<div className="alert alert-info groupsession-div" role="alert"><button className="btn btn-danger pull-right groupsession-button del-button" data-id={this.props.student.id}>X</button><button className="btn btn-primary pull-right groupsession-button done-button" data-id={this.props.student.id}>Done</button><button className="btn btn-info pull-right groupsession-button put-button" data-id={this.props.student.id}>Requeue</button><button className="btn btn-success pull-right groupsession-button take-button" data-id={this.props.student.id}>Take</button>{this.props.student.name} <span className="badge">{badgeTitle}</span></div>
				);
			}else if (userID === this.props.student.userid){
				return(
					<div className="alert alert-info groupsession-small" role="alert"><b>{this.props.student.name}</b> <span className="badge">{badgeTitle}</span></div>
				);
			}else{
				return(
					<div className="alert alert-info groupsession-small" role="alert">{this.props.student.name} <span className="badge">{badgeTitle}</span></div>
				);
			}
		}
	})

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
						queue[i] = data;
						found = true;
						break;
					}
				}
				if(!found){
					queue.push(data);
				}
				self.setState({queue: queue});
			});
			$.ajax({
			  method: "GET",
			  url: '/groupsession/queue',
			})
			.success(function( message ) {
				self.setState({queue: JSON.parse(message)});
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
