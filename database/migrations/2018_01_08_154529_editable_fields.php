<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class EditableFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
      Schema::create('editables', function (Blueprint $table) {
        $table->increments('id');
        $table->string('page');
        $table->string('key');
        $table->integer('version')->unsigned()->default(0);
        $table->longText('contents');
        $table->integer('user_id')->unsigned()->nullable();
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
        Schema::drop('editables');
    }
}
