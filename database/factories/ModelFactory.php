<?php

use App\Models\User;
use App\Models\Student;
use App\Models\Advisor;
use App\Models\Department;
/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| Here you may define all of your model factories. Model factories give
| you a convenient way to create models for testing and seeding your
| database. Just tell the factory how a default model should look.
|
*/

$factory->define(User::class, function (Faker\Generator $faker) {
    return [
        'eid' => $faker->userName,
        'is_advisor' => false,
        'remember_token' => str_random(10),
        'update_profile' => true,
    ];
});

$factory->defineAs(User::class, 'advisor', function (Faker\Generator $faker) use ($factory) {
    $user = $factory->raw(User::class);
    return array_merge($user, ['is_advisor' => true]);
});

$factory->define(Student::class, function (Faker\Generator $faker) {
    return [
        'first_name' => $faker->firstName,
        'last_name' => $faker->lastName,
        'email' => $faker->email,
        'advisor_id' => factory(Advisor::class)->create()->id,
        'department_id' => factory(Department::class)->create()->id,
        'user_id' => factory(User::class)->create()->id,
    ];
});

$factory->define(Advisor::class, function (Faker\Generator $faker) {
    return [
        'name' => $faker->name,
        'email' => $faker->email,
        'office' => $faker->secondaryAddress,
        'phone' => $faker->phoneNumber,
        'pic' => "russfeld.png",
        'notes' => $faker->sentence,
        'department_id' => factory(Department::class)->create()->id,
        'user_id' => factory(User::class, 'advisor')->create()->id,
    ];
});

$factory->define(Department::class, function (Faker\Generator $faker) {
    return [
        'name' => $faker->catchPhrase,
        'phone' => $faker->phoneNumber,
        'email' => $faker->email,
        'office' => $faker->secondaryAddress,
    ];
});
