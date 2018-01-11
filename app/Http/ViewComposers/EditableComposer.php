<?php

//https://laravel.com/docs/5.4/views

namespace App\Http\ViewComposers;

use Illuminate\View\View;
use App\Models\Editable;
use Illuminate\Routing\Route;

class EditableComposer
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
      $editables = Editable::where('controller', $this->controllerName)->where('action', $this->actionName)->where('version', 0)->get();

      //https://adamwathan.me/2016/07/14/customizing-keys-when-mapping-collections/ 
      $editableAssoc = $editables->reduce(function($editableAssoc, $editable){
          $editableAssoc[$editable->key] = $editable;
          return $editableAssoc;
      }, []);

      $view->with('editables', $editableAssoc);
    }
}
