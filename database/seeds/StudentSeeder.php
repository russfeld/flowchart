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
    		'user_id' => '1',
            'department_id' => '1'
    	]);
    }
}
