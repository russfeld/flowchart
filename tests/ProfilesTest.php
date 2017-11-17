<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Models\User;
use App\Models\Student;
use App\Models\Advisor;
use App\Models\Department;

class ProfilesTest extends TestCase
{

    use DatabaseTransactions;
    //use WithoutMiddleware;

    public function testGetIndexStudent()
    {
        $student = factory(Student::class)->create();
        $this->actingAs($student->user)
        ->visit('/profile')
        ->seeInField('first_name', $student->first_name)
        ->seeInField('last_name', $student->last_name)
        ->seeInField('email', $student->email)
        ->seeInField('advisor', $student->advisor->name)
        ->seeInField('department', $student->department->name)
        ->assertResponseOk();
    }

    public function testGetIndexAdvisor()
    {
      $advisor = factory(Advisor::class)->create();
      $this->actingAs($advisor->user)
      ->visit('/profile')
      ->assertResponseOk();
    }

    public function testGetStudentFeedStudent()
    {
      $student = factory(Student::class)->create();
      $this->actingAs($student->user)
      ->json('GET', '/profile/studentfeed')
      ->seeJson([
          trans('errors.advisors_only')
        ])
      ->assertResponseStatus(403);
    }

    public function testGetStudentFeedNoQuery(){
      $advisor = factory(Advisor::class)->create();
      $this->actingAs($advisor->user)
      ->json('GET', '/profile/studentfeed')
      ->seeJson([
          trans('validation.required', ['attribute' => 'query'])
        ]
      );
    }

    public function testGetStudentFeedAdvisor()
    {
      $students = factory(Student::class, 3)->create();
      $advisor = factory(Advisor::class)->create();
      $this->actingAs($advisor->user)
      ->json('GET', '/profile/studentfeed', ['query' => $students[0]->first_name])
      ->seeJson([
        'value' => $students[0]->name,
      ])
      ->dontSeeJson([
        'value' => $students[1]->name,
      ])
      ->dontSeeJson([
        'value' => $students[2]->name,
      ])
      ->assertResponseOk();

      $this->actingAs($advisor->user)
      ->json('GET', '/profile/studentfeed', ['query' => $students[1]->first_name])
      ->dontSeeJson([
        'value' => $students[0]->name,
      ])
      ->seeJson([
        'value' => $students[1]->name,
      ])
      ->dontSeeJson([
        'value' => $students[2]->name,
      ])
      ->assertResponseOk();
    }

    public function testPostUpdateStudent()
    {
      $student = factory(Student::class)->create();

      Session::start();

      $this->actingAs($student->user)
      ->json('POST', '/profile/update', ['first_name' => "firstname", 'last_name' => "lastname", '_token' => csrf_token()])
      ->seeJson([
        trans('messages.profile_updated')
      ])
      ->assertResponseOk();
    }

    public function testPostUpdateStudentMissingFirstName()
    {
      $student = factory(Student::class)->create();

      Session::start();

      $this->actingAs($student->user)
      ->json('POST', '/profile/update', ['last_name' => "lastname", '_token' => csrf_token()])
      ->seeJson([
        trans('validation.required', ['attribute' => 'first name'])
      ]);
    }

    public function testPostUpdateStudentMissingLastName()
    {
      $student = factory(Student::class)->create();

      Session::start();

      $this->actingAs($student->user)
      ->json('POST', '/profile/update', ['first_name' => "firstname", '_token' => csrf_token()])
      ->seeJson([
        trans('validation.required', ['attribute' => 'last name'])
      ]);
    }

/*
    public function testPostUpdateAdvisor()
    {
      $advisor = factory(Advisor::class)->create();
      $this->actingAs($advisor->user)
      ->json('POST', '/profile/update')
      ->seeJson([
        trans('errors.unimplemented')
      ])
      ->assertResponseStatus(400);
    }
    */
}
