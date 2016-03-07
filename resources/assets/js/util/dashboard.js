define(['util/site', 'adminlte', 'datatables.net', 'datatables.netbs'], function(site, adminlte, datatables, datatablesbs) {

  function dashboardModule() {
    //self-referential variable
    //anything attached to this or self will be public
    var self = this;

    self.init = function(){

      $('body').addClass('skin-purple');

      $('#table').DataTable({
        "pageLength": 50,
        "lengthChange": false,
      });
    }
  };

  return new dashboardModule();
});
