require(['util/site', 'util/dashboard'], function(site, dashboard) {

  site.ajaxcrsf();
  dashboard.init();

});
