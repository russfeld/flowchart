<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class DropDegreerequirementTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::drop('degreerequiredcourses');
        Schema::drop('degreeelectivecourses');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
      Schema::create('degreeelectivecourses', function (Blueprint $table) {
          $table->increments('id');
          $table->integer('electivelist_id')->unsigned();
          $table->foreign('electivelist_id')->references('id')->on('electivelists');
          $table->timestamps();
      });

      Schema::create('degreerequiredcourses', function (Blueprint $table) {
          $table->increments('id');
          $table->integer('course_id')->unsigned();
          $table->foreign('course_id')->references('id')->on('courses');
          $table->timestamps();
      });
    }
}
