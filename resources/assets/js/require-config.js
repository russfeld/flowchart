var require = {
    shim : {
        "bootstrap" : { "deps" :['jquery'] },
        "jquery.autocomplete" : { "deps" : ['jquery'] },
        "fullcalendar" : { "deps" : ['jquery', 'moment'] },
        "bootstrap-datetimepicker" : { "deps" : ['jquery', 'moment', 'bootstrap'] }
    },
    paths: {
        "jquery" : "lib/jquery",
        "bootstrap" :  "lib/bootstrap",
        "jquery.autocomplete" :  "lib/jquery.autocomplete" ,
        "moment": "lib/moment",
        "bootstrap-datetimepicker": "lib/bootstrap-datetimepicker",
        "fullcalendar": "lib/fullcalendar"   
    }
};