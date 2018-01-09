<?php

//https://laravel.com/docs/5.4/views

namespace App\Http\ViewComposers;

use Illuminate\View\View;
use App\Models\Editable;

class GroupSessionComposer
{

    public function __construct()
    {

    }

    /**
     * Bind data to the view.
     *
     * @param  View  $view
     * @return void
     */
    public function compose(View $view)
    {
      $editables = Editable::where('page', 'groupsession')->where('version', 0)->get();
      if($editables->isEmpty() || $editables->count() < 3){
         $header = new Editable;
         $header->page = "groupsession";
         $header->key = "header";
         $header->contents = "<i>Editable by advisors only</i>";
         $header->version = 0;
         $header->user_id = 1;
         $header->save();

         $panelhead = new Editable;
         $panelhead->page = "groupsession";
         $panelhead->key = "panelhead";
         $panelhead->contents = "<i>Editable by advisors only</i>";
         $panelhead->version = 0;
         $header->user_id = 1;
         $panelhead->save();

         $panel = new Editable;
         $panel->page = "groupsession";
         $panel->key = "panel";
         $panel->contents = "<i>Editable by advisors only</i>";
         $panel->version = 0;
         $header->user_id = 1;
         $panel->save();

         $editables = Editable::where('page', 'groupsession')->where('version', 0)->get();
      }
      $view->with('edit_header', $editables->where('key', 'header')->first())
        ->with('edit_panelhead', $editables->where('key', 'panelhead')->first())
        ->with('edit_panel', $editables->where('key', 'panel')->first());
    }
}
