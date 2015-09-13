<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Model::unguard();

        $this->call(UserTableSeeder::class);
        $this->call(AreasTableSeeder::class);
        $this->call(PrefixesTableSeeder::class);
        $this->call(CoursesTableSeeder::class);
        $this->call(PrerequisitesTableSeeder::class);
        $this->call(SchedulerSeeder::class);
        $this->call(StudentSeeder::class);
        //$this->call(MeetingSeeder::class);
        Model::reguard();
    }
}
