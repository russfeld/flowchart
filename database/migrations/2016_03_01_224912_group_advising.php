<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class GroupAdvising extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      Schema::create('groupsessions', function (Blueprint $table) {
          $table->increments('id');
          $table->integer('advisor_id')->unsigned()->nullable();
          $table->integer('student_id')->unsigned();
          $table->integer('status')->unsigned();
          $table->timestamps();
          $table->foreign('student_id')->references('id')->on('students');
          //$table->foreign('advisor_id')->references('id')->on('advisors');
      });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('groupsessions');
    }
}
