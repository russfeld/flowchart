<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ConvertCoursesToLinks extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('degreerequirements', function(Blueprint $table){
          $table->dropColumn('requireable_id');
          $table->dropColumn('requireable_type');
          $table->string('course_name');
          $table->integer('electivelist_id')->nullable()->unsigned();
          $table->foreign('electivelist_id')->references('id')->on('electivelists');
        });

        Schema::table('electivelistcourses', function(Blueprint $table){
          $table->dropForeign('electivelistcourses_course_id_foreign');
          $table->dropColumn('course_id');
          $table->string('course_prefix');
          $table->integer('course_min_number')->unsigned();
          $table->integer('course_max_number')->unsigned()->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {

      Schema::table('degreerequirements', function(Blueprint $table){
        $table->dropForeign('degreerequirements_electivelist_id_foreign');
        $table->dropColumn('course_name');
        $table->dropColumn('electivelist_id');
        $table->morphs('requireable');
      });

      Schema::table('electivelistcourses', function(Blueprint $table){
        $table->dropColumn('course_prefix');
        $table->dropColumn('course_min_number');
        $table->dropColumn('course_max_number');
        $table->integer('course_id')->unsigned();
        $table->foreign('course_id')->references('id')->on('courses');
      });
    }
}
