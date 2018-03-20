var site = require('../util/site');
window.Vue = require('vue');
var draggable = require('vuedraggable');

exports.init = function(){

  window.vm = new Vue({
		el: '#flowchart',
		data: {
			plan: [],
      semesters: [],
		},
    methods: {
      editSemester: editSemester,
      saveSemester: saveSemester,
      deleteSemester: deleteSemester,
    },
    components: {
      draggable,
    },
  });

  loadData();

  $('#reset').on('click', loadData);
  $('#add-sem').on('click', addSemester);

}

var loadData = function(){
  var id = $('#id').val();
  window.axios.get('/flowcharts/semesters/' + id)
  .then(function(response){
    window.vm.semesters = response.data;
    //for(i = 0; i < window.vm.semesters.length; i++){
    //  Vue.set(window.vm.semesters[i], 'courses', new Array());
    //}
    $(document.documentElement)[0].style.setProperty('--colNum', window.vm.semesters.length);
    window.axios.get('/flowcharts/data/' + id)
    .then(function(response){
      $.each(response.data, function(index, value){
        var semester = window.vm.semesters.find(function(element){
          return element.number == value.semester;
        })
        semester.courses.push(value);
      })
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
      site.displayMessage(response.data, "success");
    })
    .catch(function(error){
      site.displayMessage("AJAX Error", "danger");
    })
}

var deleteSemester = function(event){
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
      site.displayMessage(response.data, "success");
    })
    .catch(function(error){
      site.displayMessage("AJAX Error", "danger");
    })
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
      site.displayMessage("Item Saved", "success");
    })
    .catch(function(error){
      site.displayMessage("AJAX Error", "danger");
    })
}
