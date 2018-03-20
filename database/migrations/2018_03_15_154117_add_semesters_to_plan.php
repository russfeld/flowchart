<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSemestersToPlan extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      Schema::create('semesters', function (Blueprint $table) {
          $table->increments('id');
          $table->string('name');
          $table->integer('ordering')->unsigned();
          $table->integer('plan_id')->unsigned();
          $table->foreign('plan_id')->references('id')->on('plans');
          $table->timestamps();
          $table->unique(['plan_id', 'ordering']);
      });

      Schema::table('planrequirements', function (Blueprint $table) {
          $table->dropColumn('semester');
          $table->integer('semester_id')->unsigned();
          $table->foreign('semester_id')->references('id')->on('semesters');
          $table->unique(['plan_id', 'semester_id', 'ordering']);
      });

      Schema::table('degreerequirements', function (Blueprint $table) {
          $table->unique(['degreeprogram_id', 'semester', 'ordering']);
      });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //https://github.com/laravel/framework/issues/13873

        Schema::table('planrequirements', function (Blueprint $table) {
            $table->index('plan_id', 'planrequirements_plan_id_foreign');
        });

        Schema::table('planrequirements', function (Blueprint $table) {
            $table->dropForeign('planrequirements_semester_id_foreign');
            $table->dropColumn('semester_id');
            $table->integer('semester')->unsigned();
            $table->dropUnique('planrequirements_plan_id_semester_id_ordering_unique');
        });

        Schema::table('degreerequirements', function (Blueprint $table) {
            $table->index('degreeprogram_id', 'degreerequirements_degreeprogram_id_foreign');
        });

        Schema::table('degreerequirements', function (Blueprint $table) {
            $table->dropUnique('degreerequirements_degreeprogram_id_semester_ordering_unique');
        });

        Schema::drop('semesters');
    }
}
