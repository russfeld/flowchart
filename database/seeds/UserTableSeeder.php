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
            'name' => 'Russell Feldhausen',
            'email' => 'russfeld@ksu.edu',
            'password' => bcrypt('LnxRkx'),
        ]);

        DB::table('users')->insert([
            'id' => '2',
            'name' => 'Test Student',
            'email' => 'teststudent@ksu.edu',
            'password' => bcrypt('LnxRkx'),
        ]);

        DB::table('users')->insert([
            'id' => '3',
            'name' => 'Miriam Cox',
            'email' => 'miriamc@ksu.edu',
            'password' => bcrypt('LnxRkx')
        ]);
    }
}
