<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class EnableSoftDeletes extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      Schema::table('students', function ($table) {
          $table->softDeletes();
      });

      Schema::table('advisors', function ($table) {
          $table->softDeletes();
      });

      Schema::table('departments', function ($table) {
          $table->softDeletes();
      });

      Schema::table('users', function ($table) {
          $table->softDeletes();
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
          $table->dropColumn('deleted_at');
      });

      Schema::table('advisors', function ($table) {
          $table->dropColumn('deleted_at');
      });

      Schema::table('departments', function ($table) {
          $table->dropColumn('deleted_at');
      });

      Schema::table('users', function ($table) {
          $table->dropColumn('deleted_at');
      });
    }
}
