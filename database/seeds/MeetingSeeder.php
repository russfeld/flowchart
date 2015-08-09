<?php

use Illuminate\Database\Seeder;

class MeetingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('meetings')->insert([
            'id' => '1',
            'title' => 'Testing Appt',
            'start' => '2015-08-05 15:00:00',
            'end' => '2015-08-05 15:20:00',
            'advisor_id' => '1',
            'student_id' => '1',
            'sequence' => '0'
        ]);

        DB::table('meetings')->insert([
            'id' => '2',
            'title' => 'Really Long Name Person',
            'start' => '2015-08-06 14:00:00',
            'end' => '2015-08-06 14:20:00',
            'advisor_id' => '1',
            'student_id' => '2',
            'sequence' => '0'
        ]);

        DB::table('meetings')->insert([
            'id' => '3',
            'title' => 'Another One',
            'start' => '2015-08-04 16:00:00',
            'end' => '2015-08-04 16:20:00',
            'advisor_id' => '1',
            'student_id' => '1',
            'sequence' => '0'
        ]);

        DB::table('meetings')->insert([
            'id' => '4',
            'title' => 'Something Else Goes Here',
            'start' => '2015-08-05 8:00:00',
            'end' => '2015-08-05 8:20:00',
            'advisor_id' => '1',
            'student_id' => '2',
            'sequence' => '0' 
        ]);

        DB::table('blackouts')->insert([
            'id' => '1',
            'title' => 'CIS 115',
            'start' => '2015-08-03 09:20:00',
            'end' => '2015-08-03 11:00:00',
            'advisor_id' => '1'
        ]);

        DB::table('blackoutevents')->insert([
            'id' => '1',
            'title' => 'CIS 115',
            'start' => '2015-08-03 09:20:00',
            'end' => '2015-08-03 11:00:00',
            'advisor_id' => '1',
            'blackout_id' => '1'
        ]);

        DB::table('blackoutevents')->insert([
            'id' => '2',
            'title' => 'CIS 115',
            'start' => '2015-08-04 09:20:00',
            'end' => '2015-08-04 11:00:00',
            'advisor_id' => '1',
            'blackout_id' => '1'
        ]);

        DB::table('blackoutevents')->insert([
            'id' => '3',
            'title' => 'CIS 115',
            'start' => '2015-08-05 09:20:00',
            'end' => '2015-08-05 11:00:00',
            'advisor_id' => '1',
            'blackout_id' => '1'
        ]);

        DB::table('blackoutevents')->insert([
            'id' => '4',
            'title' => 'CIS 115',
            'start' => '2015-08-06 09:20:00',
            'end' => '2015-08-06 11:00:00',
            'advisor_id' => '1',
            'blackout_id' => '1'
        ]);

        DB::table('blackoutevents')->insert([
            'id' => '5',
            'title' => 'CIS 115',
            'start' => '2015-08-07 09:20:00',
            'end' => '2015-08-07 11:00:00',
            'advisor_id' => '1',
            'blackout_id' => '1'
        ]);
    }
}
