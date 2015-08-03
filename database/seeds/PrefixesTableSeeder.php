<?php

use Illuminate\Database\Seeder;

class PrefixesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('colleges')->insert([
        	'id' => '1',
    		'college_name' => 'Agriculture'
    	]);

    	DB::table('colleges')->insert([
        	'id' => '2',
    		'college_name' => 'Architecture, Planning & Design'
    	]);

    	DB::table('colleges')->insert([
        	'id' => '3',
    		'college_name' => 'Arts & Sciences'
    	]);

    	DB::table('colleges')->insert([
        	'id' => '4',
    		'college_name' => 'Business Administration'
    	]);

    	DB::table('colleges')->insert([
        	'id' => '5',
    		'college_name' => 'Education'
    	]);

    	DB::table('colleges')->insert([
        	'id' => '6',
    		'college_name' => 'Engineering'
    	]);

    	DB::table('colleges')->insert([
        	'id' => '7',
    		'college_name' => 'Human Ecology'
    	]);

    	DB::table('colleges')->insert([
        	'id' => '8',
    		'college_name' => 'Technology and Aviation'
    	]);

    	DB::table('colleges')->insert([
        	'id' => '9',
    		'college_name' => 'Veterinary Medicine'
    	]);

    	DB::table('colleges')->insert([
        	'id' => '10',
    		'college_name' => 'Interdisciplinary Studies'
    	]);

    	DB::table('colleges')->insert([
        	'id' => '11',
    		'college_name' => 'Olathe Campus'
    	]);

//Categories-----------------------------------------------------------

    	DB::table('categories')->insert([
        	'id' => '1',
    		'college_id' => '1',
    		'category_name' => 'General Agriculture',
    		'url' => 'AG'
    	]);

    	DB::table('categories')->insert([
        	'id' => '2',
    		'college_id' => '1',
    		'category_name' => 'Agricultural Economics',
    		'url' => 'AGEC'
    	]);

    	DB::table('categories')->insert([
        	'id' => '3',
    		'college_id' => '1',
    		'category_name' => 'Agronomy',
    		'url' => 'AGRON'
    	]);

    	DB::table('categories')->insert([
        	'id' => '4',
    		'college_id' => '1',
    		'category_name' => 'Animal Sciences and Industry',
    		'url' => 'ASI'
    	]);

    	DB::table('categories')->insert([
        	'id' => '5',
    		'college_id' => '1',
    		'category_name' => 'Communications and Agricultural Education',
    		'url' => 'AGCOM'
    	]);

    	DB::table('categories')->insert([
        	'id' => '6',
    		'college_id' => '1',
    		'category_name' => 'Entomology',
    		'url' => 'ENTOM'
    	]);

    	DB::table('categories')->insert([
        	'id' => '7',
    		'college_id' => '1',
    		'category_name' => 'Food Science Institutue',
    		'url' => 'FDSCI'
    	]);

    	DB::table('categories')->insert([
        	'id' => '8',
    		'college_id' => '1',
    		'category_name' => 'Grain Science and Industry',
    		'url' => 'GRSC'
    	]);

    	DB::table('categories')->insert([
        	'id' => '9',
    		'college_id' => '1',
    		'category_name' => 'Horticulture Forestry and Recreation Resources',
    		'url' => 'HORT'
    	]);

    	DB::table('categories')->insert([
        	'id' => '10',
    		'college_id' => '1',
    		'category_name' => 'Plant Pathology',
    		'url' => 'PLPTH'
    	]);

    	DB::table('categories')->insert([
        	'id' => '11',
    		'college_id' => '2',
    		'category_name' => 'Environmental Design Studies',
    		'url' => 'AR'
    	]);

    	DB::table('categories')->insert([
        	'id' => '12',
    		'college_id' => '2',
    		'category_name' => 'Architecture',
    		'url' => 'ARCH'
    	]);

    	DB::table('categories')->insert([
        	'id' => '13',
    		'college_id' => '2',
    		'category_name' => 'Interior Architecture and Product Design',
    		'url' => 'IAR'
    	]);

    	DB::table('categories')->insert([
        	'id' => '14',
    		'college_id' => '2',
    		'category_name' => 'Landscape Architecture/Regional and Community Planning',
    		'url' => 'LAR'
    	]);

    	DB::table('categories')->insert([
        	'id' => '15',
    		'college_id' => '3',
    		'category_name' => 'College of Arts and Sciences',
    		'url' => 'AS'
    	]);

    	DB::table('categories')->insert([
        	'id' => '16',
    		'college_id' => '3',
    		'category_name' => 'Aerospace Studies',
    		'url' => 'AERO'
    	]);

    	DB::table('categories')->insert([
        	'id' => '17',
    		'college_id' => '3',
    		'category_name' => 'American Ethnic Studies',
    		'url' => 'AMETH'
    	]);

    	DB::table('categories')->insert([
        	'id' => '18',
    		'college_id' => '3',
    		'category_name' => 'Art',
    		'url' => 'ART'
    	]);

    	DB::table('categories')->insert([
        	'id' => '19',
    		'college_id' => '3',
    		'category_name' => 'Biochemistry',
    		'url' => 'BIOCH'
    	]);

    	DB::table('categories')->insert([
        	'id' => '20',
    		'college_id' => '3',
    		'category_name' => 'Biology',
    		'url' => 'BIOL'
    	]);

    	DB::table('categories')->insert([
        	'id' => '21',
    		'college_id' => '3',
    		'category_name' => 'Chemistry',
    		'url' => 'CHEM'
    	]);

    	DB::table('categories')->insert([
        	'id' => '22',
    		'college_id' => '3',
    		'category_name' => 'Communication Studies',
    		'url' => 'COMM'
    	]);

    	DB::table('categories')->insert([
        	'id' => '23',
    		'college_id' => '3',
    		'category_name' => 'Economics',
    		'url' => 'ECON'
    	]);

    	DB::table('categories')->insert([
        	'id' => '24',
    		'college_id' => '3',
    		'category_name' => 'English',
    		'url' => 'ENGL'
    	]);

    	DB::table('categories')->insert([
        	'id' => '25',
    		'college_id' => '3',
    		'category_name' => 'Geography',
    		'url' => 'GEOG'
    	]);

        DB::table('categories')->insert([
            'id' => '75',
            'college_id' => '3',
            'category_name' => 'Geology',
            'url' => 'GEOL'
        ]);

    	DB::table('categories')->insert([
        	'id' => '26',
    		'college_id' => '3',
    		'category_name' => 'History',
    		'url' => 'HIST'
    	]);

    	DB::table('categories')->insert([
        	'id' => '27',
    		'college_id' => '3',
    		'category_name' => 'Intercollegiate Athletics',
    		'url' => 'ICATH'
    	]);

    	DB::table('categories')->insert([
        	'id' => '28',
    		'college_id' => '3',
    		'category_name' => 'Journalism and Mass Communications, School of',
    		'url' => 'JMC'
    	]);

    	DB::table('categories')->insert([
        	'id' => '29',
    		'college_id' => '3',
    		'category_name' => 'Mathematics',
    		'url' => 'MATH'
    	]);

    	DB::table('categories')->insert([
        	'id' => '30',
    		'college_id' => '3',
    		'category_name' => 'Military Science',
    		'url' => 'MSCI'
    	]);

    	DB::table('categories')->insert([
        	'id' => '31',
    		'college_id' => '3',
    		'category_name' => 'Modern Languages',
    		'url' => 'MLANG'
    	]);

    	DB::table('categories')->insert([
        	'id' => '32',
    		'college_id' => '3',
    		'category_name' => 'Music, Theatre and Dance, School of',
    		'url' => 'MUSIC'
    	]);

    	DB::table('categories')->insert([
        	'id' => '33',
    		'college_id' => '3',
    		'category_name' => 'Philosophy',
    		'url' => 'PHILO'
    	]);

    	DB::table('categories')->insert([
        	'id' => '34',
    		'college_id' => '3',
    		'category_name' => 'Physics',
    		'url' => 'PHYS'
    	]);

    	DB::table('categories')->insert([
        	'id' => '35',
    		'college_id' => '3',
    		'category_name' => 'Political Science',
    		'url' => 'POLSC'
    	]);

    	DB::table('categories')->insert([
        	'id' => '36',
    		'college_id' => '3',
    		'category_name' => 'Psychological Sciences',
    		'url' => 'PSYCH'
    	]);

    	DB::table('categories')->insert([
        	'id' => '37',
    		'college_id' => '3',
    		'category_name' => 'Sociology, Anthropology, and Social Work',
    		'url' => 'SASW'
    	]);

    	DB::table('categories')->insert([
        	'id' => '38',
    		'college_id' => '3',
    		'category_name' => 'Statistics',
    		'url' => 'STAT'
    	]);

    	DB::table('categories')->insert([
        	'id' => '39',
    		'college_id' => '3',
    		'category_name' => 'Womens Studies',
    		'url' => 'WOMST'
    	]);

    	DB::table('categories')->insert([
        	'id' => '40',
    		'college_id' => '4',
    		'category_name' => 'General Business',
    		'url' => 'BA'
    	]);

    	DB::table('categories')->insert([
        	'id' => '41',
    		'college_id' => '4',
    		'category_name' => 'Accounting',
    		'url' => 'ACCTG'
    	]);

    	DB::table('categories')->insert([
        	'id' => '42',
    		'college_id' => '4',
    		'category_name' => 'Finance',
    		'url' => 'FINAN'
    	]);

    	DB::table('categories')->insert([
        	'id' => '43',
    		'college_id' => '4',
    		'category_name' => 'Management',
    		'url' => 'MANGT'
    	]);

    	DB::table('categories')->insert([
        	'id' => '44',
    		'college_id' => '4',
    		'category_name' => 'Marketing',
    		'url' => 'MKTG'
    	]);

    	DB::table('categories')->insert([
        	'id' => '45',
    		'college_id' => '5',
    		'category_name' => 'College of Education and Honors',
    		'url' => 'ED'
    	]);

    	DB::table('categories')->insert([
        	'id' => '46',
    		'college_id' => '5',
    		'category_name' => 'Curriculum and Instruction',
    		'url' => 'EDCI'
    	]);

    	DB::table('categories')->insert([
        	'id' => '47',
    		'college_id' => '5',
    		'category_name' => 'Educational Leadership',
    		'url' => 'EDADL'
    	]);

    	DB::table('categories')->insert([
        	'id' => '48',
    		'college_id' => '5',
    		'category_name' => 'Special Education, Counseling and Student Affairs',
    		'url' => 'EDSP'
    	]);

    	DB::table('categories')->insert([
        	'id' => '49',
    		'college_id' => '6',
    		'category_name' => 'General Engineering',
    		'url' => 'EN'
    	]);

    	DB::table('categories')->insert([
        	'id' => '50',
    		'college_id' => '6',
    		'category_name' => 'Architectural Engineering and Construction Science',
    		'url' => 'AECS'
    	]);

    	DB::table('categories')->insert([
        	'id' => '51',
    		'college_id' => '6',
    		'category_name' => 'Biological and Agricultural Engineering',
    		'url' => 'BAE'
    	]);

    	DB::table('categories')->insert([
        	'id' => '52',
    		'college_id' => '6',
    		'category_name' => 'Chemical Engineering',
    		'url' => 'CHE'
    	]);

    	DB::table('categories')->insert([
        	'id' => '53',
    		'college_id' => '6',
    		'category_name' => 'Civil Engineering',
    		'url' => 'CE'
    	]);

    	DB::table('categories')->insert([
        	'id' => '54',
    		'college_id' => '6',
    		'category_name' => 'Computing and Information Sciences',
    		'url' => 'CIS'
    	]);

    	DB::table('categories')->insert([
        	'id' => '55',
    		'college_id' => '6',
    		'category_name' => 'Electrical and Computer Engineering',
    		'url' => 'ECE'
    	]);

    	DB::table('categories')->insert([
        	'id' => '56',
    		'college_id' => '6',
    		'category_name' => 'Industrial and Manufacturing Systems Engineering',
    		'url' => 'IMSE'
    	]);

    	DB::table('categories')->insert([
        	'id' => '57',
    		'college_id' => '6',
    		'category_name' => 'Mechanical and Nuclear Engineering',
    		'url' => 'MNE'
    	]);

    	DB::table('categories')->insert([
        	'id' => '58',
    		'college_id' => '7',
    		'category_name' => 'General Human Ecology',
    		'url' => 'MNE'
    	]);

    	DB::table('categories')->insert([
        	'id' => '59',
    		'college_id' => '7',
    		'category_name' => 'Apparel, Textiles, and Interior Design',
    		'url' => 'ATID'
    	]);

    	DB::table('categories')->insert([
        	'id' => '60',
    		'college_id' => '7',
    		'category_name' => 'Family Studies and Human Services, School of',
    		'url' => 'FSHS'
    	]);

    	DB::table('categories')->insert([
        	'id' => '61',
    		'college_id' => '7',
    		'category_name' => 'Gerontology',
    		'url' => 'GERON'
    	]);

    	DB::table('categories')->insert([
        	'id' => '62',
    		'college_id' => '7',
    		'category_name' => 'Hospitality Management and Dietetics',
    		'url' => 'HMD'
    	]);

    	DB::table('categories')->insert([
        	'id' => '63',
    		'college_id' => '7',
    		'category_name' => 'Human Nutrition',
    		'url' => 'HN'
    	]);

    	DB::table('categories')->insert([
        	'id' => '64',
    		'college_id' => '7',
    		'category_name' => 'Kinesiology',
    		'url' => 'KIN'
    	]);

    	DB::table('categories')->insert([
        	'id' => '65',
    		'college_id' => '8',
    		'category_name' => 'College of Technology and Aviation',
    		'url' => 'TC'
    	]);

    	DB::table('categories')->insert([
        	'id' => '66',
    		'college_id' => '8',
    		'category_name' => 'Salina Arts, Sciences and Business',
    		'url' => 'ASB'
    	]);

    	DB::table('categories')->insert([
        	'id' => '67',
    		'college_id' => '8',
    		'category_name' => 'Salina Aviation',
    		'url' => 'AERON'
    	]);

    	DB::table('categories')->insert([
        	'id' => '68',
    		'college_id' => '8',
    		'category_name' => 'Salina Engineering Technology',
    		'url' => 'TECH'
    	]);

    	DB::table('categories')->insert([
        	'id' => '69',
    		'college_id' => '9',
    		'category_name' => 'College of Veterinary Medicine',
    		'url' => 'VM'
    	]);

    	DB::table('categories')->insert([
        	'id' => '70',
    		'college_id' => '9',
    		'category_name' => 'Anatomy and Physiology',
    		'url' => 'AP'
    	]);

    	DB::table('categories')->insert([
        	'id' => '71',
    		'college_id' => '9',
    		'category_name' => 'Clinical Sciences',
    		'url' => 'CS'
    	]);

    	DB::table('categories')->insert([
        	'id' => '72',
    		'college_id' => '9',
    		'category_name' => 'Diagnostic Medicine/Pathobiology',
    		'url' => 'DMP'
    	]);

    	DB::table('categories')->insert([
        	'id' => '73',
    		'college_id' => '10',
    		'category_name' => 'Master\'s in Public Health',
    		'url' => 'MPH'
    	]);

    	DB::table('categories')->insert([
        	'id' => '74',
    		'college_id' => '11',
    		'category_name' => 'All Olathe Classes',
    		'url' => 'Olathe'
    	]);

//Prefixes----------------------------------------------------------

    	DB::table('prefixes')->insert([
        	'category_id' => '1',
    		'prefix' => 'GENAG',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '2',
    		'prefix' => 'AGEC',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '3',
    		'prefix' => 'AGRON',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '4',
    		'prefix' => 'ASI',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '5',
    		'prefix' => 'AGCOM',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '5',
    		'prefix' => 'AGED',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '6',
    		'prefix' => 'ENTOM',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '7',
    		'prefix' => 'FDSCI',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '8',
    		'prefix' => 'GRSC',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '9',
    		'prefix' => 'FOR',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '9',
    		'prefix' => 'HORT',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '9',
    		'prefix' => 'PMC',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '9',
    		'prefix' => 'RRES',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '9',
    		'prefix' => 'WOEM',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '10',
    		'prefix' => 'PLPTH',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '11',
    		'prefix' => 'ENVD',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '12',
    		'prefix' => 'ARCH',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '13',
    		'prefix' => 'IAPD',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '14',
    		'prefix' => 'CDPLN',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '14',
    		'prefix' => 'LAR',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '14',
    		'prefix' => 'PLAN',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '15',
    		'prefix' => 'DAS',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '16',
    		'prefix' => 'AERO',
    	]);

        DB::table('prefixes')->insert([
            'category_id' => '17',
            'prefix' => 'AMETH',
        ]);

    	DB::table('prefixes')->insert([
        	'category_id' => '18',
    		'prefix' => 'ART',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '19',
    		'prefix' => 'BIOCH',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '20',
    		'prefix' => 'BIOL',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '21',
    		'prefix' => 'CHM',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '22',
    		'prefix' => 'COMM',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '23',
    		'prefix' => 'ECON',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '24',
    		'prefix' => 'ENGL',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '25',
    		'prefix' => 'GEOG',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '75',
    		'prefix' => 'GEOL',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '26',
    		'prefix' => 'HIST',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '27',
    		'prefix' => 'ATHM',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '27',
    		'prefix' => 'ATHW',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '28',
    		'prefix' => 'MC',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '29',
    		'prefix' => 'MATH',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '30',
    		'prefix' => 'MSCI',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '31',
    		'prefix' => 'ARAB',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '31',
    		'prefix' => 'CHINE',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '31',
    		'prefix' => 'CLSCS',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '31',
    		'prefix' => 'FREN',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '31',
    		'prefix' => 'GRMN',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '31',
    		'prefix' => 'HINDI',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '31',
    		'prefix' => 'ITAL',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '31',
    		'prefix' => 'JAPAN',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '31',
    		'prefix' => 'LATIN',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '31',
    		'prefix' => 'MLANG',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '31',
    		'prefix' => 'RUSSN',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '31',
    		'prefix' => 'SPAN',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '32',
    		'prefix' => 'DANCE',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '32',
    		'prefix' => 'MUSIC',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '32',
    		'prefix' => 'THTRE',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '33',
    		'prefix' => 'PHILO',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '34',
    		'prefix' => 'PHYS',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '35',
    		'prefix' => 'POLSC',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '36',
    		'prefix' => 'GRAD',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '36',
    		'prefix' => 'PSYCH',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '37',
    		'prefix' => 'ANTH',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '37',
    		'prefix' => 'SOCIO',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '37',
    		'prefix' => 'SOCWK',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '38',
    		'prefix' => 'STAT',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '39',
    		'prefix' => 'WOMST',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '40',
    		'prefix' => 'GENBA',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '41',
    		'prefix' => 'ACCTG',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '42',
    		'prefix' => 'FINAN',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '43',
    		'prefix' => 'ENTRP',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '43',
    		'prefix' => 'GRAD',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '43',
    		'prefix' => 'MANGT',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '44',
    		'prefix' => 'MKTG',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '45',
    		'prefix' => 'DED',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '46',
    		'prefix' => 'EDCI',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '46',
    		'prefix' => 'EDEL',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '46',
    		'prefix' => 'EDSEC',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '47',
    		'prefix' => 'EDACE',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '47',
    		'prefix' => 'EDLEA',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '47',
    		'prefix' => 'LEAD',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '48',
    		'prefix' => 'EDCEP',
    	]);

		DB::table('prefixes')->insert([
        	'category_id' => '48',
    		'prefix' => 'EDSP',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '49',
    		'prefix' => 'DEN',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '50',
    		'prefix' => 'ARE',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '50',
    		'prefix' => 'CNS',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '51',
    		'prefix' => 'ATM',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '51',
    		'prefix' => 'BAE',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '52',
    		'prefix' => 'CHE',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '53',
    		'prefix' => 'CE',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '54',
    		'prefix' => 'CIS',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '55',
    		'prefix' => 'ECE',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '56',
    		'prefix' => 'IMSE',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '57',
    		'prefix' => 'ME',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '57',
    		'prefix' => 'NE',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '58',
    		'prefix' => 'DHE',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '58',
    		'prefix' => 'GNHE',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '59',
    		'prefix' => 'AT',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '59',
    		'prefix' => 'ID',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '60',
    		'prefix' => 'CNRES',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '60',
    		'prefix' => 'CSD',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '60',
    		'prefix' => 'ECED',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '60',
    		'prefix' => 'FSHS',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '60',
    		'prefix' => 'LSHD',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '60',
    		'prefix' => 'MFT',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '60',
    		'prefix' => 'PFP',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '61',
    		'prefix' => 'GERON',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '62',
    		'prefix' => 'HMD',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '63',
    		'prefix' => 'HN',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '64',
    		'prefix' => 'KIN',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '65',
    		'prefix' => 'COT',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '67',
    		'prefix' => 'AVM',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '67',
    		'prefix' => 'AVT',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '67',
    		'prefix' => 'PPIL',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '68',
    		'prefix' => 'CMST',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '68',
    		'prefix' => 'ECET',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '68',
    		'prefix' => 'ETA',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '68',
    		'prefix' => 'MET',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '69',
    		'prefix' => 'DVM',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '70',
    		'prefix' => 'AP',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '71',
    		'prefix' => 'CS',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '72',
    		'prefix' => 'DMP',
    	]);

    	DB::table('prefixes')->insert([
        	'category_id' => '73',
    		'prefix' => 'MPH',
    	]);
    }
}
