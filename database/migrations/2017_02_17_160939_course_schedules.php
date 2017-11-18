<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CourseSchedules extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      Schema::table('colleges', function ($table) {
          $table->string('college_abbr');
      });

      Schema::create('terms', function (Blueprint $table) {
        $table->increments('id');
        $table->smallInteger('term_number')->unsigned();
        $table->string('description');
        $table->string('abbreviation');
        $table->timestamps();
      });

      Schema::create('course_schedule', function (Blueprint $table) {
          $table->increments('id');
          $table->tinyint('session');
          $table->integer('course_id')->unsigned()->nullable();
          $table->string('section');
          $table->integer('class_number');
          $table->string('instructor');
          $table->date('date_start');
          $table->date('date_end');
          $table->time('time_start');
          $table->time('time_end');
          $table->boolean('monday');
          $table->boolean('tuesday');
          $table->boolean('wednesday');
          $table->boolean('thursday');
          $table->boolean('friday');
          $table->tinyint('credits');
          $table->string('basis');
          $table->string('component');
          $table->foreign('course_id')->references('id')->on('courses');
          $table->timestamps();
      });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('colleges', function ($table) {
          $table->dropColumn('college_abbr');
        }

        Schema::drop('course_schedule');
        Schema::drop('terms');
    }
}
