<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCoursesTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->increments('id');
            $table->boolean('ugrad');
            $table->boolean('grad');
            $table->string('prefix', 10);
            $table->smallInteger('number');
            $table->string('slug', 13);
            $table->string('title');
            $table->longText('description');
            $table->tinyInteger('min_hours');
            $table->tinyInteger('max_hours');
            $table->boolean('variable_hours');
            $table->string('requisites');
            $table->string('semesters');
            $table->boolean('uge');
            $table->string('kstate8_text');
            $table->timestamps();
        });

        Schema::create('prerequisites', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('prerequisite_course_id')->unsigned();
            $table->integer('prerequisite_for_course_id')->unsigned();
            $table->foreign('prerequisite_course_id')->references('id')->on('courses');
            $table->foreign('prerequisite_for_course_id')->references('id')->on('courses');
            $table->timestamps();
        });

        Schema::create('areas', function (Blueprint $table) {
            $table->increments('id');
            $table->string('area_name');
            $table->string('description');
            $table->string('area_icon');
            $table->timestamps();
        });

        Schema::create('kstate8', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('course_id')->unsigned();
            $table->integer('area_id')->unsigned();
            $table->foreign('course_id')->references('id')->on('courses');
            $table->foreign('area_id')->references('id')->on('areas');
            $table->timestamps();
        });

        Schema::create('colleges', function (Blueprint $table) {
            $table->increments('id');
            $table->string('college_name');
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('college_id')->unsigned();
            $table->string('category_name');
            $table->string('url');
            $table->foreign('college_id')->references('id')->on('colleges');
            $table->timestamps();
        });

        Schema::create('prefixes', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('category_id')->unsigned();
            $table->string('prefix', 10);
            $table->foreign('category_id')->references('id')->on('categories');
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
        Schema::drop('prefixes');
        Schema::drop('categories');
        Schema::drop('colleges');
        Schema::drop('kstate8');
        Schema::drop('prerequisites');
        Schema::drop('areas');
        Schema::drop('courses'); 
    }
}
