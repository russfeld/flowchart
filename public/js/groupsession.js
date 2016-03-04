'use strict';

require(['util/site', 'pusher', 'react', 'react-dom'], function (site, pusher, React, reactDOM) {

	site.ajaxcrsf();

	var getStatus = function getStatus(data) {
		if (data === 0) return "NEW";
		if (data === 1) return "QUEUED";
		if (data === 2) return "BECKON";
		if (data === 3) return "DELAY";
		if (data === 4) return "ABSENT";
		if (data === 5) return "COMPLETE";
	};

	$('#groupRegisterBtn').on('click', function () {
		$('#groupSpin').removeClass('hide-spin');
		$.ajax({
			method: "POST",
			url: '/groupsession/register'
		}).success(function (message) {
			site.displayMessage(message, "success");
			site.clearFormErrors();
			$('#groupRegisterBtn').attr('disabled', 'disabled');
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
		$('#groupRegisterBtn').removeAttr('disabled');
		$('#groupSpin').addClass('hide-spin');
	});

	Pusher.log = function (message) {
		if (window.console && window.console.log) {
			window.console.log(message);
		}
	};

	var StudentRow = React.createClass({
		displayName: 'StudentRow',

		render: function render() {
			var badgeTitle = getStatus(this.props.student.status);
			return React.createElement(
				'div',
				{ className: "alert alert-info groupsession-small", role: "alert" },
				this.props.student.name,
				' ',
				React.createElement(
					'span',
					{ className: "badge" },
					badgeTitle
				)
			);
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
						queue[i] = data;
						found = true;
						break;
					}
				}
				if (!found) {
					queue.push(data);
				}
				self.setState({ queue: queue });
			});
			$.ajax({
				method: "GET",
				url: '/groupsession/queue'
			}).success(function (message) {
				self.setState({ queue: JSON.parse(message) });
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