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
      coursesForSemester: function(plan, number) {
        return plan.filter(function (course){
          return course.semester === number;
        })
      }
    },
    components: {
      draggable,
    },
  });

  $('#addsemester').on('click', function(){
    var max = Math.max.apply(null, window.vm.semesters.map(function(a){return a.number}));
    var semester = {
      name: "New Semester",
      number: max + 1,
      ordering: window.vm.semesters.length + 1,
      courses: [],
    }
    window.vm.semesters.push(semester);
    $(document.documentElement)[0].style.setProperty('--colNum', window.vm.semesters.length);
  })

  loadData();

  $('#reset').on('click', loadData);

}

var loadData = function(){
  var id = $('#id').val();
  window.axios.get('/flowcharts/semesters/' + id)
  .then(function(response){
    window.vm.semesters = response.data;
    for(i = 0; i < window.vm.semesters.length; i++){
      Vue.set(window.vm.semesters[i], 'courses', new Array());
    }
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
