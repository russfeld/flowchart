<?php

use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('students')->insert([
        	'id' => '1',
    		'name' => 'Test Student',
    		'email' => 'teststudent@ksu.edu',
    		'advisor_id' => '1',
    		'user_id' => '2'
    	]);

    	DB::table('students')->insert([
        	'id' => '2',
    		'name' => 'Christopher Piggott',
    		'email' => 'cpiggott@ksu.edu',
    		'advisor_id' => '1'
    	]);

    	DB::table('students')->insert([
        	'id' => '5',
    		'name' => 'Miriam Cox',
    		'email' => 'miriamc@ksu.edu',
    		'advisor_id' => '5'
    	]);

    	DB::table('students')->insert([
        	'id' => '4',
    		'name' => 'James Tyson',
    		'email' => 'jbtyson@ksu.edu',
    		'advisor_id' => '5'
    	]);
    }
}
