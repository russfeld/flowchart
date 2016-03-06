<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class RouteTest extends TestCase
{
    public function testHomepage()
    {
        $this->visit('/')
        ->assertResponseOk();
    }

    public function testAbout()
    {
      $this->visit('/about')
      ->assertResponseOk();
    }

    public function testHelp()
    {
      $this->visit('/help')
      ->assertResponseOk();
    }

    public function testFlowchartTest()
    {
      $this->visit('/test')
      ->assertResponseOk();
    }
}
