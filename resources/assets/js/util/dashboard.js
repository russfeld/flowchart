define(['util/site', 'adminlte', 'datatables.net', 'datatables.netbs'], function(site, adminlte, datatables, datatablesbs) {

  function dashboardModule() {
    //self-referential variable
    //anything attached to this or self will be public
    var self = this;

    self.dataTableOptions = {
      "pageLength": 50,
      "lengthChange": false,
    }

    self.init = function(options){
      options || (options = self.dataTableOptions);
      $('#table').DataTable(options);
    }
  };

  return new dashboardModule();
});
