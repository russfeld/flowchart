<?php

use Illuminate\Database\Seeder;

use App\Models\Plan;
use App\Models\Completedcourse;
use App\Models\Transfercourse;

class PlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
      $plan = new Plan();
      $plan->id = 1;
      $plan->name= "Computer Science Plan";
      $plan->description = "Sample Plan for Computer Science Degree";
      $plan->start_semester = 3;
      $plan->start_year = 2018;
      $plan->degreeprogram_id = 1;
      $plan->student_id = 1;
      $plan->save();

      $this->addCompletedCourse(1, "CIS 115", "12345", 3, 2018, "LEC", "A", 3, 1);
      $this->addCompletedCourse(2, "CIS 200", "12346", 3, 2018, "LEC", "A", 4, 1);
      $this->addCompletedCourse(3, "ENGL 100", "12347", 3, 2018, "LEC", "A", 3, 1);
      $this->addTransferCourse(1, "JCCC", "ENGL 100", "English 1", "Fall 2018", 3, "A", 3);
    }

    public function addCompletedCourse($id, $name, $coursenumber, $semester, $year, $basis, $grade, $credits, $student){
      $course = new Completedcourse();
      $course->id = $id;
      $course->name = $name;
      $course->coursenumber = $coursenumber;
      $course->semester = $semester;
      $course->year = $year;
      $course->basis = $basis;
      $course->grade = $grade;
      $course->credits = $credits;
      $course->student_id = $student;
      $course->save();
    }

    public function addTransferCourse($id, $institution, $name, $description, $semester, $credits, $grade, $course_id){
      $transfer = new Transfercourse();
      $transfer->id = $id;
      $transfer->incoming_institution = $institution;
      $transfer->incoming_name = $name;
      $transfer->incoming_description = $description;
      $transfer->incoming_semester = $semester;
      $transfer->incoming_grade = $grade;
      $transfer->incoming_credits = $credits;
      $transfer->completedcourse_id = $course_id;
      $transfer->save();
    }
}
