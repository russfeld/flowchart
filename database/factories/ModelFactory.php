<?php

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

$factory->define(App\User::class, function (Faker\Generator $faker) {
    return [
        'eid' => $faker->userName,
        'is_advisor' => false,
        'remember_token' => str_random(10),
    ];
});

$factory->defineAs(App\User::class, 'advisor', function (Faker\Generator $faker) use ($factory) {
    $user = $factory->raw(App\User::class);
    return array_merge($user, ['is_advisor' => true]);
});

$factory->define(App\Student::class, function (Faker\Generator $faker) {
    return [
        'first_name' => $faker->firstName,
        'last_name' => $faker->lastName,
        'email' => $faker->email,
        'advisor_id' => factory(App\Advisor::class)->create()->id,
        'department_id' => factory(App\Department::class)->create()->id,
        'user_id' => factory(App\User::class)->create()->id,
    ];
});

$factory->define(App\Advisor::class, function (Faker\Generator $faker) {
    return [
        'name' => $faker->name,
        'email' => $faker->email,
        'office' => $faker->secondaryAddress,
        'phone' => $faker->phoneNumber,
        'pic' => "russfeld.png",
        'notes' => $faker->sentence,
        'department_id' => factory(App\Department::class)->create()->id,
        'user_id' => factory(App\User::class, 'advisor')->create()->id,
    ];
});

$factory->define(App\Department::class, function (Faker\Generator $faker) {
    return [
        'name' => $faker->catchPhrase,
        'phone' => $faker->phoneNumber,
        'email' => $faker->email,
        'office' => $faker->secondaryAddress,
    ];
});
