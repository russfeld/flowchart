<?php

namespace App\Providers;

use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class ComposerServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
      //ADD EDITABLE COMPONENTS TO App/Console/Commands/PostDeploy TO AUTO-POPULATE!
      View::composer(
          ['groupsession.index'], 'App\Http\ViewComposers\EditableComposer'
      );

      View::composer(
          ['includes.scripts'], 'App\Http\ViewComposers\JavascriptComposer'
      );




    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
