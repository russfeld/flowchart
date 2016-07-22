<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class DegreePrograms extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      Schema::create('degreeprograms', function (Blueprint $table) {
          $table->increments('id');
          $table->string('title');
          $table->longText('description');
          $table->string('abbreviation', 10);
          $table->smallInteger('effective_semester')->unsigned();
          $table->integer('department_id')->unsigned();
          $table->foreign('department_id')->references('id')->on('departments');
          $table->timestamps();
          $table->softDeletes();
      });

      Schema::create('degreerequirements', function (Blueprint $table) {
          $table->increments('id');
          $table->string('notes');
          $table->integer('degreeprogram_id')->unsigned();
          $table->tinyInteger('semester')->unsigned();
          $table->tinyInteger('ordering')->unsigned();
          $table->tinyInteger('credits')->unsigned();
          $table->morphs('requireable');
          $table->foreign('degreeprogram_id')->references('id')->on('degreeprograms');
          $table->timestamps();
      });

      Schema::create('degreerequiredcourses', function (Blueprint $table) {
          $table->increments('id');
          $table->integer('course_id')->unsigned();
          $table->foreign('course_id')->references('id')->on('courses');
          $table->timestamps();
      });

      Schema::create('electivelists', function (Blueprint $table) {
          $table->increments('id');
          $table->string('name');
          $table->string('abbreviation');
          $table->timestamps();
          $table->softDeletes();
      });

      Schema::create('degreeelectivecourses', function (Blueprint $table) {
          $table->increments('id');
          $table->integer('electivelist_id')->unsigned();
          $table->foreign('electivelist_id')->references('id')->on('electivelists');
          $table->timestamps();
      });

      Schema::create('electivelistcourses', function (Blueprint $table) {
          $table->increments('id');
          $table->integer('electivelist_id')->unsigned();
          $table->integer('course_id')->unsigned();
          $table->foreign('electivelist_id')->references('id')->on('electivelists');
          $table->foreign('course_id')->references('id')->on('courses');
          $table->timestamps();
      });

      Schema::create('plans', function (Blueprint $table) {
          $table->increments('id');
          $table->string('title');
          $table->longText('description');
          $table->integer('degreeprogram_id')->unsigned();
          $table->integer('student_id')->unsigned();
          $table->foreign('degreeprogram_id')->references('id')->on('degreeprograms');
          $table->foreign('student_id')->references('id')->on('students');
          $table->timestamps();
          $table->softDeletes();
      });

      Schema::create('planrequirements', function (Blueprint $table) {
          $table->increments('id');
          $table->string('notes');
          $table->integer('plan_id')->unsigned();
          $table->tinyInteger('semester')->unsigned();
          $table->tinyInteger('ordering')->unsigned();
          $table->tinyInteger('credits')->unsigned();
          $table->morphs('requireable');
          $table->foreign('plan_id')->references('id')->on('plans');
          $table->timestamps();
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

      Schema::create('completedcourses', function (Blueprint $table) {
          $table->increments('id');
          $table->string('title', 15);
          $table->integer('coursenumber')->unsigned();
          $table->smallInteger('semester')->unsigned();
          $table->string('basis', 5);
          $table->string('grade', 2);
          $table->tinyInteger('credits')->unsigned();
          $table->integer('student_id')->unsigned();
          $table->integer('course_id')->unsigned()->nullable();
          $table->integer('planrequirement_id')->unsigned()->nullable();
          $table->foreign('student_id')->references('id')->on('students');
          //$table->foreign('course_id')->references('id')->on('courses')
          //$table->foreign('planrequirement_id')->references('id')->on('planrequirements');
          $table->timestamps();
      });

      Schema::create('transfercourses', function (Blueprint $table) {
          $table->increments('id');
          $table->string('incoming_institution');
          $table->string('incoming_name');
          $table->string('incoming_description');
          $table->string('incoming_semester');
          $table->tinyInteger('incoming_credits')->unsigned();
          $table->string('incoming_grade', 2);
          $table->string('title', 15);
          $table->string('grade', 2);
          $table->tinyInteger('credits')->unsigned();
          $table->smallInteger('semester')->unsigned();
          $table->integer('student_id')->unsigned();
          $table->integer('course_id')->unsigned()->nullable();
          $table->integer('completedcourse_id')->unsigned()->nullable();
          $table->foreign('student_id')->references('id')->on('students');
          //$table->foreign('course_id')->references('id')->on('courses')
          //$table->foreign('completedcourse_id')->references('id')->on('completedcourses')
          $table->timestamps();
      });

      Schema::table('students', function ($table) {
          $table->string('wildcat_id', 10);
          $table->string('ksis_id', 10);
      });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {

        Schema::table('students', function ($table) {
            $table->dropColumn('wildcat_id');
            $table->dropColumn('ksis_id');
        });

        Schema::drop('transfercourses');
        Schema::drop('completedcourses');
        Schema::drop('planelectivecourses');
        Schema::drop('planrequiredcourses');
        Schema::drop('planrequirements');
        Schema::drop('plans');
        Schema::drop('electivelistcourses');
        Schema::drop('degreeelectivecourses');
        Schema::drop('electivelists');
        Schema::drop('degreerequiredcourses');
        Schema::drop('degreerequirements');
        Schema::drop('degreeprograms');
    }
}
