<?php

use Illuminate\Database\Seeder;

use App\Models\Degreeprogram;
use App\Models\Course;
use App\Models\Degreerequirement;
use App\Models\Electivelistcourse;
use App\Models\Electivelist;

class DegreeProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $degreeprogram = new Degreeprogram();
        $degreeprogram -> id = 1;
        $degreeprogram -> name = "Computer Science";
        $degreeprogram -> abbreviation = "CS";
        $degreeprogram -> effective_year = "2017";
        $degreeprogram -> effective_semester = "3";
        $degreeprogram -> department_id = "1";
        $degreeprogram -> save();

        $this->addElectivelist(1, "CS Natural Science", "CS-NATSCI");
        $this->addElectivecourses(1, "PHYS", "213", null);
        $this->addElectivecourses(1, "PHYS", "214", null);
        $this->addElectivecourses(1, "CHM", "210", null);
        $this->addElectivecourses(1, "CHM", "230", null);
        $this->addElectivecourses(1, "BIOL", "198", null);
        $this->addElectivecourses(1, "BIOL", "201", null);

        $this->addDegreeRequirement(1, 1, 1, 3, "CIS 115", "");
        $this->addDegreeRequirement(1, 2, 1, 3, "CIS 200", "");

        $this->addDegreeElective(1, 1, 2, 4, 1, "");
    }

    public function addDegreeRequirement($progid, $semester, $ordering, $credits, $courseid, $notes){
      $degreerequirement = new Degreerequirement();
      $degreerequirement -> degreeprogram_id = $progid;
      $degreerequirement -> semester = $semester;
      $degreerequirement -> ordering = $ordering;
      $degreerequirement -> credits = $credits;
      $degreerequirement -> notes = $notes;
      $degreerequirement -> course_name = $courseid;
      $degreerequirement -> save();
    }

    public function addDegreeElective($progid, $semester, $ordering, $credits, $elid, $notes){
      $degreerequirement = new Degreerequirement();
      $degreerequirement -> degreeprogram_id = $progid;
      $degreerequirement -> semester = $semester;
      $degreerequirement -> ordering = $ordering;
      $degreerequirement -> credits = $credits;
      $degreerequirement -> notes = $notes;
      $degreerequirement -> electivelist_id = $elid;
      $degreerequirement -> save();
    }

    public function addElectivelist($id, $name, $abbr){
      $electivelist = new Electivelist();
      $electivelist -> id = $id;
      $electivelist -> name = $name;
      $electivelist -> abbreviation = $abbr;
      $electivelist -> save();
    }

    public function addElectivecourses($electivelist, $prefix, $min, $max){
      $electivelistcourse = new Electivelistcourse();
      $electivelistcourse -> electivelist_id = $electivelist;
      $electivelistcourse -> course_prefix = $prefix;
      $electivelistcourse -> course_min_number = $min;
      $electivelistcourse -> course_max_number = $max;
      $electivelistcourse -> save();
    }
}
