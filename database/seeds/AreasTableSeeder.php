<?php

use Illuminate\Database\Seeder;

class AreasTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
    	DB::table('areas')->insert([
    		'id' => '1',
    		'area_name' => 'Aesthetic Interpretation',
    		'description' => 'Courses and experiences in the interpretive understanding of aesthetic experience provide students with the opportunity to develop their interpretive skills and heighten their aesthetic responses to literature, the performing arts, and the visual arts',
    		'area_icon' => 'aesthetic.png'
    	]);

    	DB::table('areas')->insert([
    		'id' => '2',
    		'area_name' => 'Empirical and Quantitative Reasoning',
    		'description' => 'Courses and experiences in empirical and quantitative reasoning provide students with the opportunity to learn how to gather and evaluate information, weigh alternative evidence, understand the likelihood of particular outcomes, and recognize when available evidence is inadequate to draw a conclusion.',
       		'area_icon' => 'empirical.png'
    	]);

    	DB::table('areas')->insert([
    		'id' => '3',
    		'area_name' => 'Ethical Reasoning and Responsibility',
    		'description' => 'Courses and experiences in ethical reasoning and responsibility should assist students in learning how to think through ethical dilemmas and make sound decisions when facing real-life situations. Ethical reasoning requires the study of standards by which human behavior and interactions can be considered right or wrong — defining the concepts of right and wrong, good and bad, and how we make these determinations. Ethical responsibility includes the ability to apply ethical standards to social and environmental issues.',
       		'area_icon' => 'ethical.png'
    	]);

    	DB::table('areas')->insert([
    		'id' => '4',
    		'area_name' => 'Global Issues and Perspectives',
    		'description' => 'Courses and experiences in global issues and perspectives will introduce students to values, perspectives, beliefs, behaviors, policies and customs from around the world. Emphasis should be placed on exploring the interdependence of people, nations and systems across the globe.',
       		'area_icon' => 'global.png'
    	]);

    	DB::table('areas')->insert([
    		'id' => '5',
    		'area_name' => 'Historical Perspectives',
    		'description' => 'Courses and experiences examining historical perspectives help students realize the need to understand the past and thoughtfully consider the future to contextualize current knowledge, to glimpse how it may continue to develop and to examine the role they might play.',
       		'area_icon' => 'historical.png'
    	]);

    	DB::table('areas')->insert([
    		'id' => '6',
    		'area_name' => 'Human Diversity within the U.S.',
    		'description' => 'Courses and experiences in human diversity within the U.S. should assist students in developing an awareness of self and others through scholarly study, research and personal interaction. Students should be exposed to multiple perspectives about U.S. society and how group affiliation affects people\'s perceptions and experiences.',
       		'area_icon' => 'human.png'
    	]);

    	DB::table('areas')->insert([
    		'id' => '7',
    		'area_name' => 'Natural and Physical Sciences',
    		'description' => 'Courses and experiences in natural and physical sciences introduce students to the central facts, ideas and theories related to the study of living systems and the physical universe and help them develop the ability to evaluate the merit of scientific and technological claims.',
    		'area_icon' => 'natural.png'
    	]);

    	DB::table('areas')->insert([
    		'id' => '8',
    		'area_name' => 'Social Sciences',
    		'description' => 'Courses and experiences in social sciences emphasize how individuals, families, groups, institutions, governments and societies behave and influence one another and the natural environment. Students are exposed to appropriate methods used to analyze and understand interactions of various social factors that influence behavior at these multiple levels.',
       		'area_icon' => 'social.png'
    	]);
    }
}
