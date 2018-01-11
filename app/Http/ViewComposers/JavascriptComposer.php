<?php

//https://laravel.com/docs/5.4/views
//https://andy-carter.com/blog/scoping-javascript-functionality-to-specific-pages-with-laravel-and-cakephp

namespace App\Http\ViewComposers;

use Illuminate\View\View;
use Illuminate\Routing\Route;

class JavascriptComposer
{

    public function __construct(Route $route)
    {
      $action = $route->getActionName();
      if(strpos($action, "@") === false){
        $this->controllerName = "index";
        $this->actionName = "index";
      }else{
        list($controller, $method) = explode('@', $action);
        $this->controllerName = preg_replace('/.*\\\/', '', $controller);
        $this->actionName = preg_replace('/.*\\\/', '', $method);
      }
    }

    /**
     * Bind data to the view.
     *
     * @param  View  $view
     * @return void
     */
    public function compose(View $view)
    {
      $view->with('controller', $this->controllerName)->with('action', $this->actionName);
    }
}
