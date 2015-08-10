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
    		'first_name' => 'Test',
            'last_name' => 'Student',
    		'email' => 'russfeld@ksu.edu',
    		'advisor_id' => '1',
    		'user_id' => '2',
            'department_id' => '1'
    	]);

    	DB::table('students')->insert([
        	'id' => '2',
    		'first_name' => 'Christopher',
            'last_name' => 'Piggott',
    		'email' => 'cpiggott@ksu.edu',
    		'advisor_id' => '1',
            'department_id' => '1'
    	]);

    	DB::table('students')->insert([
        	'id' => '3',
    		'first_name' => 'Miriam',
            'last_name' => 'Cox',
    		'email' => 'miriamc@ksu.edu',
    		'advisor_id' => '1',
            'department_id' => '2',
            'user_id' => '3'
    	]);

    	DB::table('students')->insert([
        	'id' => '4',
    		'first_name' => 'James',
            'last_name' => 'Tyson',
    		'email' => 'jbtyson@ksu.edu',
    		'advisor_id' => '1',
            'department_id' => '2'
    	]);
    }
}
