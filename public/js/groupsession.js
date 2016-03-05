'use strict';

require(['util/site', 'pusher', 'react', 'react-dom', 'ionsound'], function (site, pusher, React, reactDOM, ionsound) {

	site.ajaxcrsf();

	ion.sound({
		sounds: [{
			name: "door_bell"
		}],
		volume: 1.0,
		path: "/sounds/",
		preload: true
	});

	var userID = parseInt($('#userID').val());
	var isAdvisor = parseInt($('#isAdvisor').val());

	var enableButton = function enableButton() {
		$('#groupRegisterBtn').removeAttr('disabled');
	};

	var disableButton = function disableButton() {
		$('#groupRegisterBtn').attr('disabled', 'disabled');
	};

	var checkButtons = function checkButtons(queue) {
		var len = queue.length;
		var foundMe = false;
		for (var i = 0; i < len; i++) {
			if (queue[i].userid === userID) {
				foundMe = true;
				break;
			}
		}
		if (foundMe) {
			disableButton();
		} else {
			enableButton();
		}
	};

	var checkDing = function checkDing(person) {
		if (person.status == 2) {
			ion.sound.play("door_bell");
		}
	};

	var initialCheckDing = function initialCheckDing(queue) {
		var len = queue.length;
		for (var i = 0; i < len; i++) {
			if (queue[i].userid === userID) {
				checkDing(queue[i]);
				break;
			}
		}
	};

	var sortFunction = function sortFunction(a, b) {
		if (a.status == b.status) {
			return a.id < b.id ? -1 : 1;
		}
		return a.status < b.status ? 1 : -1;
	};

	var getStatus = function getStatus(data) {
		if (data.status === 0) return "NEW";
		if (data.status === 1) return "QUEUED";
		if (data.status === 2) return "MEET WITH " + data.advisor;
		if (data.status === 3) return "DELAY";
		if (data.status === 4) return "ABSENT";
		if (data.status === 5) return "DONE";
	};

	$('#groupRegisterBtn').on('click', function () {
		$('#groupSpin').removeClass('hide-spin');
		$.ajax({
			method: "POST",
			url: '/groupsession/register'
		}).success(function (message) {
			site.displayMessage(message, "success");
			site.clearFormErrors();
			disableButton();
			$('#groupSpin').addClass('hide-spin');
		}).fail(function (jqXHR, message) {
			if (jqXHR.status == 422) {
				site.setFormErrors(jqXHR.responseJSON);
			} else {
				alert("Unable to register: " + jqXHR.responseJSON);
			}
			$('#groupSpin').addClass('hide-spin');
		});
	});

	var pusherInstance = new Pusher(pusherKey);
	var groupSessionChannel = pusherInstance.subscribe('groupsession');

	pusherInstance.connection.bind('connected', function () {
		$('#groupSpin').addClass('hide-spin');
	});

	/*
  * Enable for Pusher Debugging
  */
	/*
 	Pusher.log = function(message) {
 	  if (window.console && window.console.log) {
 	    window.console.log(message);
 	  }
 	};
 */

	var StudentRow = React.createClass({
		displayName: 'StudentRow',

		takeStudent: function takeStudent(event) {
			var gid = event.currentTarget.dataset.id;
			$.ajax({
				method: "POST",
				url: '/groupsession/take',
				data: { gid: gid }
			}).success(function (message) {
				site.displayMessage(message, "success");
			}).fail(function (jqXHR, message) {
				if (jqXHR.status == 422) {
					site.setFormErrors(jqXHR.responseJSON);
				} else {
					alert("Unable to take: " + jqXHR.responseJSON);
				}
			});
		},
		putStudent: function putStudent(event) {
			var gid = event.currentTarget.dataset.id;
			$.ajax({
				method: "POST",
				url: '/groupsession/put',
				data: { gid: gid }
			}).success(function (message) {
				site.displayMessage(message, "success");
			}).fail(function (jqXHR, message) {
				if (jqXHR.status == 422) {
					site.setFormErrors(jqXHR.responseJSON);
				} else {
					alert("Unable to put: " + jqXHR.responseJSON);
				}
			});
		},
		doneStudent: function doneStudent(event) {
			var gid = event.currentTarget.dataset.id;
			$.ajax({
				method: "POST",
				url: '/groupsession/done',
				data: { gid: gid }
			}).success(function (message) {
				site.displayMessage(message, "success");
			}).fail(function (jqXHR, message) {
				if (jqXHR.status == 422) {
					site.setFormErrors(jqXHR.responseJSON);
				} else {
					alert("Unable to mark done: " + jqXHR.responseJSON);
				}
			});
		},
		delStudent: function delStudent(event) {
			var gid = event.currentTarget.dataset.id;
			$.ajax({
				method: "POST",
				url: '/groupsession/delete',
				data: { gid: gid }
			}).success(function (message) {
				site.displayMessage(message, "success");
			}).fail(function (jqXHR, message) {
				if (jqXHR.status == 422) {
					site.setFormErrors(jqXHR.responseJSON);
				} else {
					alert("Unable to delete: " + jqXHR.responseJSON);
				}
			});
		},
		render: function render() {
			var badgeTitle = getStatus(this.props.student);
			if (isAdvisor === 1) {
				if (this.props.student.status == 0 || this.props.student.status == 1) {
					return React.createElement(
						'div',
						{ className: "alert alert-info groupsession-div", role: "alert" },
						React.createElement(
							'button',
							{ className: "btn btn-danger pull-right groupsession-button del-button", 'data-id': this.props.student.id, onClick: this.delStudent },
							'X'
						),
						React.createElement(
							'button',
							{ className: "btn btn-success pull-right groupsession-button take-button", 'data-id': this.props.student.id, onClick: this.takeStudent },
							'Take'
						),
						this.props.student.name,
						' ',
						React.createElement(
							'span',
							{ className: "badge" },
							badgeTitle
						)
					);
				} else if (this.props.student.status == 2) {
					return React.createElement(
						'div',
						{ className: "alert alert-success groupsession-div", role: "alert" },
						React.createElement(
							'button',
							{ className: "btn btn-danger pull-right groupsession-button del-button", 'data-id': this.props.student.id, onClick: this.delStudent },
							'X'
						),
						React.createElement(
							'button',
							{ className: "btn btn-primary pull-right groupsession-button done-button", 'data-id': this.props.student.id, onClick: this.doneStudent },
							'Done'
						),
						React.createElement(
							'button',
							{ className: "btn btn-info pull-right groupsession-button put-button", 'data-id': this.props.student.id, onClick: this.putStudent },
							'Requeue'
						),
						this.props.student.name,
						' ',
						React.createElement(
							'span',
							{ className: "badge" },
							badgeTitle
						)
					);
				}
			} else {
				if (this.props.student.status == 0 || this.props.student.status == 1) {
					var myClass = "alert alert-info groupsession-div";
				} else if (this.props.student.status == 2) {
					var myClass = "alert alert-success groupsession-div";
				}
				if (userID === this.props.student.userid) {
					var name = React.createElement(
						'b',
						null,
						this.props.student.name
					);
					myClass = myClass + " groupsession-me";
				} else {
					var name = this.props.student.name;
				}
				return React.createElement(
					'div',
					{ className: myClass, role: "alert" },
					name,
					' ',
					React.createElement(
						'span',
						{ className: "badge" },
						badgeTitle
					)
				);
			}
		}
	});

	var GroupList = React.createClass({
		displayName: 'GroupList',

		getInitialState: function getInitialState() {
			return { queue: [] };
		},
		componentDidMount: function componentDidMount() {
			var self = this;
			groupSessionChannel.bind("App\\Events\\GroupsessionRegister", function (data) {
				var queue = self.state.queue;
				var found = false;
				var len = queue.length;
				for (var i = 0; i < len; i++) {
					if (queue[i].id === data.id) {
						if (data.status < 3) {
							queue[i] = data;
						} else {
							queue.splice(i, 1);
							i--;
							len--;
						}
						found = true;
					}
				}
				if (!found) {
					queue.push(data);
				}
				checkButtons(queue);
				if (data.userid === userID) {
					checkDing(data);
				}
				queue.sort(sortFunction);
				self.setState({ queue: queue });
			});
			$.ajax({
				method: "GET",
				url: '/groupsession/queue'
			}).success(function (message) {
				var queue = self.state.queue.concat(JSON.parse(message));
				checkButtons(queue);
				initialCheckDing(queue);
				queue.sort(sortFunction);
				self.setState({ queue: queue });
			}).fail(function (jqXHR, message) {
				if (jqXHR.status == 422) {
					site.setFormErrors(jqXHR.responseJSON);
				} else {
					alert("Unable to get queue: " + jqXHR.responseJSON);
				}
			});
		},
		render: function render() {
			var divs = [];
			this.state.queue.forEach(function (student) {
				divs.push(React.createElement(StudentRow, { key: student.id, student: student }));
			});
			return React.createElement(
				'div',
				null,
				divs
			);
		}
	});

	reactDOM.render(React.createElement(GroupList, null), document.getElementById('groupList'));
});
//# sourceMappingURL=groupsession.js.map