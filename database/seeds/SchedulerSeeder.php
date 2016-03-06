<?php

use Illuminate\Database\Seeder;

class SchedulerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('departments')->insert([
        	'id' => '1',
    		'name' => 'Computing and Information Sciences',
    		'phone' => '785-532-6350',
    		'email' => 'cisoffic@ksu.edu',
    		'office' => '234 Nichols Hall'
    	]);

    	DB::table('advisors')->insert([
        	'id' => '1',
    		'name' => 'Russell Feldhausen',
    		'email' => 'russfeld@ksu.edu',
    		'office' => '212 Nichols Hall',
    		'phone' => '785-532-7929',
    		'pic' => 'img/russfeld.png',
    		'department_id' => '1',
    		'user_id' => '2'
    	]);

    	DB::table('advisors')->insert([
        	'id' => '2',
    		'name' => 'Nathan Bean',
    		'email' => 'nhbean@ksu.edu',
    		'office' => '216 Nichols Hall',
    		'phone' => '785-532-7942',
    		'pic' => 'img/nhbean.png',
    		'department_id' => '1',
            'user_id' => '3'
    	]);

    	DB::table('advisors')->insert([
        	'id' => '3',
    		'name' => 'Julie Thornton',
    		'email' => 'juliet@ksu.edu',
    		'office' => '228 Nichols Hall',
    		'phone' => '785-532-7785',
    		'pic' => 'img/juliet.png',
    		'department_id' => '1',
            'user_id' => '4'
    	]);

    	DB::table('advisors')->insert([
        	'id' => '4',
    		'name' => 'Dennis Lang',
    		'email' => 'dlang1@ksu.edu',
    		'office' => '213 Nichols Hall',
    		'phone' => '785-532-7768',
    		'pic' => 'img/dlang1.png',
    		'department_id' => '1',
            'user_id' => '5'
    	]);

      DB::table('advisors')->insert([
        	'id' => '5',
    		'name' => 'David Schmidt',
    		'email' => 'das@ksu.edu',
    		'office' => '234 Nichols Hall',
    		'phone' => '785-532-7912',
    		'pic' => 'img/das.png',
    		'department_id' => '1',
            'user_id' => '6'
    	]);
    }
}
