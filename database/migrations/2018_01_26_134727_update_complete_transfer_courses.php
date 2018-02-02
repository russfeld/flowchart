<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateCompleteTransferCourses extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('completedcourses', function (Blueprint $table) {
            $table->dropColumn('course_id');
            $table->dropColumn('planrequirement_id');
        });

        Schema::table('transfercourses', function (Blueprint $table) {
            $table->dropColumn('course_id');
            $table->dropColumn('name');
            $table->dropColumn('grade');
            $table->dropColumn('credits');
            $table->dropColumn('semester');
            $table->dropColumn('year');
            $table->foreign('completedcourse_id')->references('id')->on('completedcourses')
        });

        Schema::table('planrequirements', function(Blueprint $table){
          $table->integer('degreerequirement_id')->nullable()->unsigned();
          $table->foreign('degreerequirement_id')->references('id')->on('degreerequirements');
        });

        Schema::create('completedcourse_planrequirement', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('planrequirement_id')->unsigned();
            $table->integer('completedcourse_id')->unsigned();
            $table->integer('user_id')->nullable()->unsigned();
            $table->foreign('planrequirement_id')->references('id')->on('planrequirements');
            $table->foreign('completedcourse_id')->references('id')->on('completedcourses');
            $table->foreign('user_id')->references('id')->on('users');
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

      Schema::drop('completedcourse_planrequirement');

      Schema::table('completedcourses', function (Blueprint $table) {
          $table->integer('course_id')->unsigned()->nullable();
          $table->integer('planrequirement_id')->unsigned()->nullable();
      });

      Schema::table('transfercourses', function (Blueprint $table) {
          $table->integer('course_id')->unsigned()->nullable();
          $table->string('name', 15);
          $table->string('grade', 2);
          $table->tinyInteger('credits')->unsigned();
          $table->tinyInteger('semester')->unsigned()->default(0);
          $table->smallInteger('year')->unsigned();
          $table->dropForeign('transfercourses_completedcourse_id_foreign');
      });

      Schema::table('planrequirements', function(Blueprint $table){
        $table->dropForeign('planrequirements_degreerequirement_id_foreign');
        $table->dropColumn('degreerequirement_id');
      });
    }
}
