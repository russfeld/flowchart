<?php

use Illuminate\Database\Seeder;

class PrerequisitesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $xml = simplexml_load_file("database/seeds/ksu_prerequisitecourses.xml");
		if ($xml === false) {
		    echo "Failed loading XML: ";
		    foreach(libxml_get_errors() as $error) {
		        echo "<br>", $error->message;
		    }
		}

		foreach($xml->children() as $child){
			DB::table('prerequisites')->insert([
				'prerequisite_course_id' => $child->prerequisiteCourse,
				'prerequisite_for_course_id' => $child->prerequisiteFor
			]);
		}
    }
}
