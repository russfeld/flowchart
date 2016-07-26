<?php

use Illuminate\Database\Seeder;

class CoursesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
		$xml = simplexml_load_file("database/seeds/ksu_courses.xml");
		if ($xml === false) {
		    echo "Failed loading XML: ";
		    foreach(libxml_get_errors() as $error) {
		        echo "<br>", $error->message;
		    }
		}

		foreach($xml->children() as $child){
			DB::table('courses')->insert([
	            'id' => $child->id,
	            'ugrad' => $child->ugrad == 'true' ? true : false,
	            'grad' => $child->grad == 'true' ? true : false,
	            'prefix' => $child->prefix,
	            'number' => $child->number,
	            'slug' => $child->prefix . str_pad($child->number, 3, '0', STR_PAD_LEFT),
	            'title' => $child->title,
	            'description' => $child->description,
	            'min_hours' => $child->minHours,
	            'max_hours' => $child->maxHours,
	            'variable_hours' => $child->variableHours == 'true' ? true : false,
	            'requisites' => $child->requisites,
	            'semesters' => $child->semesters,
	            'uge' => $child->uge == 'true' ? true : false,
	            'kstate8_text' => $child->kstate8,
	        ]);

	        if(strpos($child->kstate8, 'Aesthetic') !== false){
	        	DB::table('kstate8')->insert([
	        		'course_id' => $child->id,
	        		'area_id' => 1
	        	]);
	        }

	        if(strpos($child->kstate8, 'Empirical') !== false){
	        	DB::table('kstate8')->insert([
	        		'course_id' => $child->id,
	        		'area_id' => 2
	        	]);
	        }

	        if(strpos($child->kstate8, 'Ethical') !== false){
	        	DB::table('kstate8')->insert([
	        		'course_id' => $child->id,
	        		'area_id' => 3
	        	]);
	        }

	        if(strpos($child->kstate8, 'Global') !== false){
	        	DB::table('kstate8')->insert([
	        		'course_id' => $child->id,
	        		'area_id' => 4
	        	]);
	        }

	        if(strpos($child->kstate8, 'Historical') !== false){
	        	DB::table('kstate8')->insert([
	        		'course_id' => $child->id,
	        		'area_id' => 5
	        	]);
	        }

	        if(strpos($child->kstate8, 'Human') !== false){
	        	DB::table('kstate8')->insert([
	        		'course_id' => $child->id,
	        		'area_id' => 6
	        	]);
	        }

	        if(strpos($child->kstate8, 'Natural') !== false){
	        	DB::table('kstate8')->insert([
	        		'course_id' => $child->id,
	        		'area_id' => 7
	        	]);
	        }

	        if(strpos($child->kstate8, 'Social') !== false){
	        	DB::table('kstate8')->insert([
	        		'course_id' => $child->id,
	        		'area_id' => 8
	        	]);
	        }
		}
    }
}
