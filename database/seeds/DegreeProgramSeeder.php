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
      //CS NATURAL SCIENCE ELECTIVES
        $this->addElectivelist(1, "CS Natural Science", "CS-NATSCI");
        $this->addElectivecourses(1, "BIOCH", "265", null);
        $this->addElectivecourses(1, "BIOCH", "521", null);
        $this->addElectivecourses(1, "BIOL", "198", null);
        $this->addElectivecourses(1, "BIOL", "201", null);
        $this->addElectivecourses(1, "BIOL", "450", null);
        $this->addElectivecourses(1, "BIOL", "455", null);
        $this->addElectivecourses(1, "CHM", "210", null);
        $this->addElectivecourses(1, "CHM", "230", null);
        $this->addElectivecourses(1, "CHM", "350", null);
        $this->addElectivecourses(1, "CHM", "531", null);
        $this->addElectivecourses(1, "CHM", "371", null);
        $this->addElectivecourses(1, "CHM", "550", null);
        $this->addElectivecourses(1, "GEOL", "100", null);
        $this->addElectivecourses(1, "GEOL", "102", "103");
        $this->addElectivecourses(1, "GEOL", "502", null);
        $this->addElectivecourses(1, "PHYS", "113", "114");
        $this->addElectivecourses(1, "PHYS", "213", "214");
        $this->addElectivecourses(1, "PHYS", "223", "224");
        $this->addElectivecourses(1, "PHYS", "325", null);

      //CS COMM ELECTIVES
        $this->addElectivelist(2, "CS Communication", "CS-COMM");
        $this->addElectivecourses(2, "COMM", "322", null);
        $this->addElectivecourses(2, "COMM", "326", null);
        $this->addElectivecourses(2, "MANGT", "420", null);
        $this->addElectivecourses(2, "THTRE", "261", null);
        $this->addElectivecourses(2, "THTRE", "265", null);

      //CS PUBLIC SPEAKING
        $this->addElectivelist(3, "CS Public Speaking", "CS-PUBSPK");
        $this->addElectivecourses(3, "COMM", "105", "106");

      //CS TECH ELECTIVES
        $this->addElectivelist(4, "CS Technical Electives", "CS-TECH");
        $this->addElectivecourses(4, "CIS", "490", "999");

      //CS 505or640
        $this->addElectivelist(5, "CS Theory", "CS-THRY");
        $this->addElectivecourses(5, "CIS", "505", null);
        $this->addElectivecourses(5, "CIS", "640", null);

      //CS 520or625
        $this->addElectivelist(6, "CS Parallel", "CS-PAR");
        $this->addElectivecourses(6, "CIS", "520", null);
        $this->addElectivecourses(6, "CIS", "625", null);

      //CS 598or642and643
        $this->addElectivelist(7, "CS Project", "CS-PROJ");
        $this->addElectivecourses(7, "CIS", "598", null);
        $this->addElectivecourses(7, "CIS", "642", null);
        $this->addElectivecourses(7, "CIS", "643", null);

      //ENGG Humanities
        $this->addElectivelist(8, "ENGG Humanities & Social Sciences", "H&SS");
        $this->addElectivecourses(8, "ARCH", "240", null);
        $this->addElectivecourses(8, "ARCH", "290", null);
        $this->addElectivecourses(8, "ARCH", "301", null);
        $this->addElectivecourses(8, "LAR", "322", null);
        $this->addElectivecourses(8, "ENVD", "210", null);

        $this->addElectivecourses(8, "AGEC", "315", null);

        $this->addElectivecourses(8, "AERO", "110", "111");
        $this->addElectivecourses(8, "AERO", "210", "211");

        $this->addElectivecourses(8, "AMETH", "0", "999");

        $this->addElectivecourses(8, "ANTH", "200", "260");
        $this->addElectivecourses(8, "ANTH", "503", "517");
        $this->addElectivecourses(8, "ANTH", "524", "618");
        $this->addElectivecourses(8, "ANTH", "630", "634");
        $this->addElectivecourses(8, "ANTH", "673", null);
        $this->addElectivecourses(8, "ANTH", "676", null);
        $this->addElectivecourses(8, "ANTH", "685", null);

        $this->addElectivecourses(8, "ART", "0", "999");

        $this->addElectivecourses(8, "CHM", "315", null);
        $this->addElectivecourses(8, "CHM", "650", null);

        $this->addElectivecourses(8, "COMM", "120", null);
        $this->addElectivecourses(8, "COMM", "320", null);
        $this->addElectivecourses(8, "COMM", "322", "323");
        $this->addElectivecourses(8, "COMM", "325", null);
        $this->addElectivecourses(8, "COMM", "330", "331");
        $this->addElectivecourses(8, "COMM", "420", null);
        $this->addElectivecourses(8, "COMM", "425", null);
        $this->addElectivecourses(8, "COMM", "430", "435");
        $this->addElectivecourses(8, "COMM", "470", null);
        $this->addElectivecourses(8, "COMM", "480", null);
        $this->addElectivecourses(8, "COMM", "525", null);
        $this->addElectivecourses(8, "COMM", "526", null);
        $this->addElectivecourses(8, "COMM", "535", null);
        $this->addElectivecourses(8, "COMM", "545", null);

        $this->addElectivecourses(8, "DANCE", "120", "195");
        $this->addElectivecourses(8, "DANCE", "205", null);
        $this->addElectivecourses(8, "DANCE", "459", null);

        $this->addElectivecourses(8, "ECON", "0", "999");

        $this->addElectivecourses(8, "ENGL", "220", "298");
        $this->addElectivecourses(8, "ENGL", "315", "390");
        $this->addElectivecourses(8, "ENGL", "420", null);
        $this->addElectivecourses(8, "ENGL", "440", null);
        $this->addElectivecourses(8, "ENGL", "445", null);
        $this->addElectivecourses(8, "ENGL", "450", null);
        $this->addElectivecourses(8, "ENGL", "461", null);
        $this->addElectivecourses(8, "ENGL", "470", null);
        $this->addElectivecourses(8, "ENGL", "476", null);
        $this->addElectivecourses(8, "ENGL", "490", null);
        $this->addElectivecourses(8, "ENGL", "525", null);
        $this->addElectivecourses(8, "ENGL", "545", null);
        $this->addElectivecourses(8, "ENGL", "580", null);

        $this->addElectivecourses(8, "GEOG", "0", "220");
        $this->addElectivecourses(8, "GEOG", "222", "320");
        $this->addElectivecourses(8, "GEOG", "322", "444");
        $this->addElectivecourses(8, "GEOG", "446", "459");
        $this->addElectivecourses(8, "GEOG", "461", "507");
        $this->addElectivecourses(8, "GEOG", "509", "534");
        $this->addElectivecourses(8, "GEOG", "536", "699");
        $this->addElectivecourses(8, "GEOG", "701", null);
        $this->addElectivecourses(8, "GEOG", "703", "704");
        $this->addElectivecourses(8, "GEOG", "706", "707");
        $this->addElectivecourses(8, "GEOG", "710", null);
        $this->addElectivecourses(8, "GEOG", "712", "734");
        $this->addElectivecourses(8, "GEOG", "736", "744");
        $this->addElectivecourses(8, "GEOG", "746", "764");
        $this->addElectivecourses(8, "GEOG", "766", "794");
        $this->addElectivecourses(8, "GEOG", "796", "999");

        $this->addElectivecourses(8, "HIST", "0", "999");

        $this->addElectivecourses(8, "LEAD", "212", null);
        $this->addElectivecourses(8, "LEAD", "350", null);
        $this->addElectivecourses(8, "LEAD", "405", null);
        $this->addElectivecourses(8, "LEAD", "430", null);
        $this->addElectivecourses(8, "LEAD", "450", null);

        $this->addElectivecourses(8, "MC", "110", "112");
        $this->addElectivecourses(8, "MC", "331", null);
        $this->addElectivecourses(8, "MC", "531", null);
        $this->addElectivecourses(8, "MC", "710", "725");

        //LANGUAGES
        $this->addElectivecourses(8, "ARAB", "0", "999");
        $this->addElectivecourses(8, "CHINE", "0", "999");
        $this->addElectivecourses(8, "CLSCS", "0", "999");
        $this->addElectivecourses(8, "FREN", "0", "999");
        $this->addElectivecourses(8, "GRMN", "0", "999");
        $this->addElectivecourses(8, "HINDI", "0", "999");
        $this->addElectivecourses(8, "ITAL", "0", "999");
        $this->addElectivecourses(8, "JAPAN", "0", "999");
        $this->addElectivecourses(8, "LATIN", "0", "999");
        $this->addElectivecourses(8, "MLANG", "0", "999");
        $this->addElectivecourses(8, "RUSSN", "0", "999");
        $this->addElectivecourses(8, "SPAN", "0", "999");

        $this->addElectivecourses(8, "MUSIC", "103", "140");
        $this->addElectivecourses(8, "MUSIC", "203", "209");
        $this->addElectivecourses(8, "MUSIC", "231", "239");
        $this->addElectivecourses(8, "MUSIC", "251", "260");
        $this->addElectivecourses(8, "MUSIC", "280", "299");
        $this->addElectivecourses(8, "MUSIC", "321", "373");
        $this->addElectivecourses(8, "MUSIC", "400", "404");
        $this->addElectivecourses(8, "MUSIC", "408", "417");
        $this->addElectivecourses(8, "MUSIC", "427", "490");

        $this->addElectivecourses(8, "MUSIC", "100", null);
        $this->addElectivecourses(8, "MUSIC", "160", null);
        $this->addElectivecourses(8, "MUSIC", "170", "171");
        $this->addElectivecourses(8, "MUSIC", "210", null);
        $this->addElectivecourses(8, "MUSIC", "225", null);
        $this->addElectivecourses(8, "MUSIC", "230", null);
        $this->addElectivecourses(8, "MUSIC", "240", null);
        $this->addElectivecourses(8, "MUSIC", "245", null);
        $this->addElectivecourses(8, "MUSIC", "250", null);
        $this->addElectivecourses(8, "MUSIC", "310", null);
        $this->addElectivecourses(8, "MUSIC", "320", null);
        $this->addElectivecourses(8, "MUSIC", "360", null);
        $this->addElectivecourses(8, "MUSIC", "385", null);
        $this->addElectivecourses(8, "MUSIC", "420", "424");

        $this->addElectivecourses(8, "PHILO", "0", "109");
        $this->addElectivecourses(8, "PHILO", "111", "319");
        $this->addElectivecourses(8, "PHILO", "321", "509");
        $this->addElectivecourses(8, "PHILO", "511", "999");

        $this->addElectivecourses(8, "POLSC", "0", "999");

        $this->addElectivecourses(8, "PSYCH", "0", "999");

        $this->addElectivecourses(8, "SOCIO", "0", "422");
        $this->addElectivecourses(8, "SOCIO", "424", "519");
        $this->addElectivecourses(8, "SOCIO", "521", null);
        $this->addElectivecourses(8, "SOCIO", "523", "999");

        $this->addElectivecourses(8, "THTRE", "211", "265");
        $this->addElectivecourses(8, "THTRE", "361", null);
        $this->addElectivecourses(8, "THTRE", "560", null);
        $this->addElectivecourses(8, "THTRE", "565", null);

        $this->addElectivecourses(8, "THTRE", "270", null);
        $this->addElectivecourses(8, "THTRE", "572", "573");
        $this->addElectivecourses(8, "THTRE", "662", null);
        $this->addElectivecourses(8, "THTRE", "667", "672");

        $this->addElectivecourses(8, "GWSS", "0", "999");

        $this->addElectivecourses(8, "CNS", "110", null);
        $this->addElectivecourses(8, "FSHS", "0", "999");
        $this->addElectivecourses(8, "GNHE", "310", null);
        $this->addElectivecourses(8, "PFP", "101", null);

      //Unrestricted
        $this->addElectivelist(9, "Unrestricted", "UNREST");
        $this->addElectivecourses(9, "*", "000", "999");


      //CS DEGREE PROGRAM
        $degreeprogram = new Degreeprogram();
        $degreeprogram -> id = 1;
        $degreeprogram -> name = "Computer Science";
        $degreeprogram -> abbreviation = "CS";
        $degreeprogram -> effective_year = "2017";
        $degreeprogram -> effective_semester = "3";
        $degreeprogram -> department_id = "1";
        $degreeprogram -> save();

      //CS DEGREE REQUIREMENTS
        $this->addDegreeRequirement(1, 1, 1, 3, "CIS 115", "");
        $this->addDegreeRequirement(1, 1, 2, 4, "MATH 220", "");
        $this->addDegreeRequirement(1, 1, 3, 3, "ENGL 100", "");
        $this->addDegreeElective(1, 1, 4, 3, 8, "1 of 5");
        $this->addDegreeElective(1, 1, 5, 3, 3, "");

        $this->addDegreeRequirement(1, 2, 1, 4, "CIS 200", "");
        $this->addDegreeRequirement(1, 2, 2, 4, "MATH 221", "");
        $this->addDegreeRequirement(1, 2, 3, 3, "ECE 241", "");
        $this->addDegreeElective(1, 2, 4, 4, 1, "1 of 4");

        $this->addDegreeRequirement(1, 3, 1, 3, "CIS 300", "");
        $this->addDegreeRequirement(1, 3, 2, 3, "CIS 301", "");
        $this->addDegreeRequirement(1, 3, 3, 3, "ENGL 200", "");
        $this->addDegreeRequirement(1, 3, 4, 3, "ECON 110", "");
        $this->addDegreeElective(1, 3, 5, 3, 8, "2 of 5");

        $this->addDegreeRequirement(1, 4, 1, 1, "CIS 308", "");
        $this->addDegreeRequirement(1, 4, 2, 3, "CIS 501", "");
        $this->addDegreeRequirement(1, 4, 3, 3, "MATH 510", "");
        $this->addDegreeElective(1, 4, 4, 3, 1, "2 of 4");
        $this->addDegreeElective(1, 4, 5, 3, 8, "3 of 5");
        $this->addDegreeElective(1, 4, 6, 3, 2, "");

        $this->addDegreeRequirement(1, 5, 1, 1, "CIS 415", "");
        $this->addDegreeRequirement(1, 5, 2, 3, "CIS 560", "");
        $this->addDegreeElective(1, 5, 3, 3, 1, "3 of 4");
        $this->addDegreeElective(1, 5, 4, 3, 8, "4 of 5");
        $this->addDegreeElective(1, 5, 5, 3, 9, "");
        $this->addDegreeElective(1, 5, 6, 3, 9, "");

        $this->addDegreeRequirement(1, 6, 1, 3, "CIS 450", "");
        $this->addDegreeRequirement(1, 6, 2, 3, "CIS 575", "");
        $this->addDegreeRequirement(1, 6, 3, 3, "ENGL 516", "");
        $this->addDegreeRequirement(1, 6, 4, 3, "STAT 510", "");
        $this->addDegreeElective(1, 6, 5, 3, 9, "");

        $this->addDegreeRequirement(1, 7, 1, 3, "MATH 551", "");
        $this->addDegreeElective(1, 7, 2, 3, 5, "");
        $this->addDegreeElective(1, 7, 3, 3, 6, "");
        $this->addDegreeElective(1, 7, 4, 3, 7, "");
        $this->addDegreeElective(1, 7, 5, 3, 9, "");

        $this->addDegreeElective(1, 8, 1, 3, 4, "");
        $this->addDegreeElective(1, 8, 2, 3, 4, "");
        $this->addDegreeElective(1, 8, 3, 4, 1, "4 of 4");
        $this->addDegreeElective(1, 8, 4, 3, 8, "5 of 5");
        $this->addDegreeElective(1, 8, 5, 3, 9, "");
    }

    public function addDegreeRequirement($progid, $semester, $ordering, $credits, $courseid, $notes){
      $degreerequirement = new Degreerequirement();
      $degreerequirement -> degreeprogram_id = $progid;
      $degreerequirement -> semester = $semester - 1;
      $degreerequirement -> ordering = $ordering - 1;
      $degreerequirement -> credits = $credits;
      $degreerequirement -> notes = $notes;
      $degreerequirement -> course_name = $courseid;
      $degreerequirement -> save();
    }

    public function addDegreeElective($progid, $semester, $ordering, $credits, $elid, $notes){
      $degreerequirement = new Degreerequirement();
      $degreerequirement -> degreeprogram_id = $progid;
      $degreerequirement -> semester = $semester - 1;
      $degreerequirement -> ordering = $ordering - 1;
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
