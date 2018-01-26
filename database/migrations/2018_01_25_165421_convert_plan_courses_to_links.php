<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ConvertPlanCoursesToLinks extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      Schema::drop('planrequiredcourses');
      Schema::drop('planelectivecourses');

      Schema::table('planrequirements', function(Blueprint $table){
        $table->dropColumn('requireable_id');
        $table->dropColumn('requireable_type');
        $table->string('course_name');
        $table->integer('electivelist_id')->nullable()->unsigned();
        $table->foreign('electivelist_id')->references('id')->on('electivelists');
      });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
      Schema::table('planrequirements', function(Blueprint $table){
        $table->dropForeign('planrequirements_electivelist_id_foreign');
        $table->dropColumn('course_name');
        $table->dropColumn('electivelist_id');
        $table->morphs('requireable');
      });

      Schema::create('planrequiredcourses', function (Blueprint $table) {
          $table->increments('id');
          $table->integer('course_id')->unsigned();
          $table->foreign('course_id')->references('id')->on('courses');
          $table->timestamps();
      });

      Schema::create('planelectivecourses', function (Blueprint $table) {
          $table->increments('id');
          $table->integer('electivelist_id')->unsigned();
          $table->foreign('electivelist_id')->references('id')->on('electivelists');
          $table->timestamps();
      });

    }
}
