<?php

use Illuminate\Database\Seeder;

class UserTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('users')->insert([
            'id' => '1',
            'eid' => 'test-student',
            'is_advisor' => false
        ]);

        DB::table('users')->insert([
            'id' => '2',
            'eid' => 'russfeld',
            'is_advisor' => true
        ]);

        DB::table('users')->insert([
            'id' => '3',
            'eid' => 'nhbean',
            'is_advisor' => true
        ]);

        DB::table('users')->insert([
            'id' => '4',
            'eid' => 'juliet',
            'is_advisor' => true
        ]);

        DB::table('users')->insert([
            'id' => '5',
            'eid' => 'dlang1',
            'is_advisor' => true
        ]);
    }
}
