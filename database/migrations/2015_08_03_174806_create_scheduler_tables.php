<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSchedulerTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {

        Schema::create('departments', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name');;
            $table->string('phone');
            $table->string('email');
            $table->string('office');
            $table->timestamps();
        });

        Schema::create('advisors', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->unsigned()->unique()->nullable();
            $table->string('name');
            $table->string('email');
            $table->string('office');
            $table->string('phone');
            $table->string('pic');
            $table->integer('department_id')->unsigned();
            $table->longText('notes');
            $table->timestamps();
            $table->foreign('department_id')->references('id')->on('departments');
            $table->foreign('user_id')->references('id')->on('users');
        });

         Schema::create('students', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->unsigned()->unique()->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->integer('advisor_id')->unsigned();
            $table->integer('department_id')->unsigned();
            $table->timestamps();
            $table->foreign('advisor_id')->references('id')->on('advisors');
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('department_id')->references('id')->on('departments');
        });

        Schema::create('meetings', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title');
            $table->dateTime('start');
            $table->dateTime('end');
            $table->longText('description')->nullable();
            $table->integer('advisor_id')->unsigned();
            $table->integer('student_id')->unsigned();
            $table->timestamps();
            $table->foreign('advisor_id')->references('id')->on('advisors');
            $table->foreign('student_id')->references('id')->on('students');
        });

        Schema::create('blackouts', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title');
            $table->dateTime('start');
            $table->dateTime('end');
            $table->integer('advisor_id')->unsigned();
            $table->smallInteger('repeat_type');
            $table->smallInteger('repeat_every');
            $table->smallInteger('repeat_detail');
            $table->dateTime('repeat_until');
            $table->timestamps();
            $table->foreign('advisor_id')->references('id')->on('advisors');
        });

        Schema::create('blackoutevents', function (Blueprint $table) {
            $table->increments('id');
            $table->string('title');
            $table->dateTime('start');
            $table->dateTime('end');
            $table->boolean('repeat');
            $table->integer('advisor_id')->unsigned();
            $table->integer('blackout_id')->unsigned();
            $table->timestamps();
            $table->foreign('advisor_id')->references('id')->on('advisors');
            $table->foreign('blackout_id')->references('id')->on('blackouts')->onDelete('cascade');;
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('blackoutevents');
        Schema::drop('blackouts');
        Schema::drop('meetings');
        Schema::drop('students');
        Schema::drop('advisors');
        Schema::drop('departments');
    }
}
