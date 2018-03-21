var site = require('../util/site');
window.Vue = require('vue');
var draggable = require('vuedraggable');

exports.init = function(){

  window.vm = new Vue({
		el: '#flowchart',
		data: {
      semesters: [],
		},
    methods: {
      editSemester: editSemester,
      saveSemester: saveSemester,
      deleteSemester: deleteSemester,
      dropSemester: dropSemester,
      dropCourse: dropCourse,
      editCourse: editCourse,
    },
    components: {
      draggable,
    },
  });

  loadData();

  $('#reset').on('click', loadData);
  $('#add-sem').on('click', addSemester);

  $('#saveCourse').on('click', saveCourse);
  $('#deleteCourse').on('click', deleteCourse);

  ajaxautocomplete('electivelist_id', '/electivelists/electivelistfeed');

  ajaxautocomplete('course_id', '/courses/coursefeed');

  var student_id = $('#student_id').val();
  ajaxautocomplete('completedcourse_id', '/completedcourses/completedcoursefeed/' + student_id);
}

/**
 * Helper function to sort elements based on their ordering
 *
 * @param a - first item
 * @param b - second item
 * @return - sorting value indicating who should go first
 */
var sortFunction = function(a, b){
	if(a.ordering == b.ordering){
		return (a.id < b.id ? -1 : 1);
	}
	return (a.ordering < b.ordering ? -1 : 1);
}

var loadData = function(){
  var id = $('#id').val();
  window.axios.get('/flowcharts/semesters/' + id)
  .then(function(response){
    window.vm.semesters = response.data;
    window.vm.semesters.sort(sortFunction);
    $(document.documentElement)[0].style.setProperty('--colNum', window.vm.semesters.length);
    window.axios.get('/flowcharts/data/' + id)
    .then(function(response){
      $.each(response.data, function(index, value){
        var semester = window.vm.semesters.find(function(element){
          return element.id == value.semester_id;
        })
        semester.courses.push(value);
      });
      $.each(window.vm.semesters, function(index, value){
        value.courses.sort(sortFunction);
      });
    })
    .catch(function(error){
      site.handleError('get data', '', error);
    });
  })
  .catch(function(error){
    site.handleError('get data', '', error);
  });
}

var editSemester = function(event){
  var semid = $(event.target).data('id');
  $("#sem-paneledit-" + semid).show();
  $("#sem-panelhead-" + semid).hide();
}

var saveSemester = function(event){
  var id = $('#id').val();
  var semid = $(event.target).data('id');
  var data = {
    id: semid,
    name: $("#sem-text-" + semid).val()
  }
  window.axios.post('/flowcharts/semesters/' + id + '/save', data)
    .then(function(response){
      $("#sem-paneledit-" + semid).hide();
      $("#sem-panelhead-" + semid).show();
      //site.displayMessage(response.data, "success");
    })
    .catch(function(error){
      site.displayMessage("AJAX Error", "danger");
    })
}

var deleteSemester = function(event){
  var choice = confirm("Are you sure?");
    if(choice === true){
    var id = $('#id').val();
    var semid = $(event.target).data('id');
    var data = {
      id: semid,
    };
    window.axios.post('/flowcharts/semesters/' + id + '/delete', data)
      .then(function(response){
        for(var i = 0; i < window.vm.semesters.length; i++){
          if(window.vm.semesters[i].id == semid){
            window.vm.semesters.splice(i, 1);
            break;
          }
        }
        //site.displayMessage(response.data, "success");
      })
      .catch(function(error){
        site.displayMessage("AJAX Error", "danger");
      });
  }
}

var addSemester = function(){
  var id = $('#id').val();
  var data = {
  };
  window.axios.post('/flowcharts/semesters/' + id + '/add', data)
    .then(function(response){
      window.vm.semesters.push(response.data);
      //Vue.set(window.vm.semesters[window.vm.semester.length - 1], 'courses', new Array());
      $(document.documentElement)[0].style.setProperty('--colNum', window.vm.semesters.length);
      //site.displayMessage("Item Saved", "success");
    })
    .catch(function(error){
      site.displayMessage("AJAX Error", "danger");
    })
}

var dropSemester = function(event){
  var ordering = [];
  $.each(window.vm.semesters, function(index, value){
    ordering.push({
      id: value.id,
    });
  });
  var data = {
    ordering: ordering,
  }
  var id = $('#id').val();
  window.axios.post('/flowcharts/semesters/' + id + '/move', data)
    .then(function(response){
      //site.displayMessage(response.data, "success");
    })
    .catch(function(error){
      site.displayMessage("AJAX Error", "danger");
    })
}

var dropCourse = function(event){
  var ordering = [];
  var toSemIndex = $(event.to).data('id');
  $.each(window.vm.semesters[toSemIndex].courses, function(index, value){
    ordering.push({
      id: value.id,
    });
  });
  var data = {
    semester_id: window.vm.semesters[toSemIndex].id,
    course_id: $(event.item).data('id'),
    ordering: ordering,
  }
  var id = $('#id').val();
  window.axios.post('/flowcharts/data/' + id + '/move', data)
    .then(function(response){
      //site.displayMessage(response.data, "success");
    })
    .catch(function(error){
      site.displayMessage("AJAX Error", "danger");
    })
}

var editCourse = function(event){
  var courseIndex = $(event.target).data('id');
  var semIndex = $(event.target).data('sem');
  var course = window.vm.semesters[semIndex].courses[courseIndex];
  $('#course_name').val(course.name);
  $('#credits').val(course.credits);
  $('#notes').val(course.notes);
  $('#planrequirement_id').val(course.id);
  $('#electivelist_idauto').val('');
  $('#electivelist_idtext').html("Selected: (" + course.electivelist_id + ") " + site.truncateText(course.electivelist_name, 30));
  $('#course_idauto').val('');
  $('#course_idtext').html("Selected: (" + course.course_id + ") " + site.truncateText(course.course_name, 30));
  $('#completedcourse_idauto').val('');
  $('#completedcourse_idtext').html("Selected: (" + course.completedcourse_id + ") " + site.truncateText(course.completedcourse_name, 30));
  if(course.degreerequirement_id <= 0){
    $('#course_name').prop('disabled', false);
    $('#credits').prop('disabled', false);
    $('#electivelist_idauto').prop('disabled', false);
    $('#deleteCourse').show();
  }else{
    if(course.electivelist_id <= 0){
      $('#course_name').prop('disabled', true);
    }else{
      $('#course_name').prop('disabled', false);
    }
    $('#credits').prop('disabled', true);
    $('#electivelist_idauto').prop('disabled', true);
    $('#deleteCourse').hide();
  }

  $('#editCourse').modal('show');
}

var saveCourse = function(){
  $('#spin').removeClass('hide-spin');
  var id = $('#id').val();
  var planrequirement_id = $('#planrequirement_id').val();
  var data = {
    notes: $('#notes').val(),
  }
  if($('#planrequirement_id').val().length > 0){
    data.planrequirement_id = $('#planrequirement_id').val();
  }
  if($('#course_id').val() > 0){
    data.course_id = $('#course_id').val();
  }
  if($('#completedcourse_id').val() > 0){
    data.completedcourse_id = $('#completedcourse_id').val();
  }
  if(!$('#course_name').is(':disabled')){
    data.course_name = $('#course_name').val();
  }
  if(!$('#credits').is(':disabled')){
    data.credits = $('#credits').val();
  }
  if(!$('#electivelist_idauto').is(':disabled')){
    if($('#electivelist_id').val() > 0){
      data.electivelist_id = $('#electivelist_id').val();
    }
  }
  window.axios.post('/flowcharts/data/' + id + '/save', data)
    .then(function(response){
      $('#editCourse').modal('hide');
      $('#spin').addClass('hide-spin');
      site.displayMessage(response.data, "success");
      loadData();
    })
    .catch(function(error){
      site.handleError("save course", "#editCourse", error);
    });

}

var deleteCourse = function(event){
  console.log($(event.target).data('id'));
}

/**
 * Function to autocomplete a field (duplicated from dashboard)
 *
 * @param id - the ID of the field
 * @param url - the URL to request data from
 */
var ajaxautocomplete = function(id, url){
  $('#' + id + 'auto').autocomplete({
	    serviceUrl: url,
	    ajaxSettings: {
	    	dataType: "json"
	    },
      minChars: 3,
	    onSelect: function (suggestion) {
	        $('#' + id).val(suggestion.data);
          $('#' + id + 'text').html("Selected: (" + suggestion.data + ") " + site.truncateText(suggestion.value, 30));
	    },
	    transformResult: function(response) {
	        return {
	            suggestions: $.map(response.data, function(dataItem) {
	                return { value: dataItem.value, data: dataItem.data };
	            })
	        };
	    }
	});
}
