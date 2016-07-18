@servers(['web' => 'root@104.131.70.168', 'cis' => 'russfeld@cislinux.cis.ksu.edu'])

<?php
$repo = 'git@github.com:russfeld/flowchart.git';
$release_dir = '/var/www/flowchart_releases';
$data_dir = '/var/www/flowchart_data';
$app_dir = '/var/www/flowchart';
$release_dir_cis = '/web/cis-advising/flowchart_releases';
$data_dir_cis = '/web/cis-advising/flowchart_data';
$app_dir_cis = '/web/cis-advising/html';
$release = 'release_' . date('YmdHis');
?>

@macro('test', ['on' => 'web'])
    fetch_repo
    delete_old
    configure_project
    update_permissions
    update_symlinks
    database_setup
@endmacro

@macro('cis', ['on' => 'cis'])
    fetch_repo_cis
    delete_old_cis
    configure_project_cis
    update_permissions_cis
    update_symlinks_cis
    database_setup_cis
@endmacro

@task('fetch_repo', ['on' => 'web'])
    [ -d {{ $release_dir }} ] || mkdir {{ $release_dir }};
    cd {{ $release_dir }};
    git clone -b master {{ $repo }} {{ $release }};
@endtask

@task('fetch_repo_cis', ['on' => 'cis'])
    [ -d {{ $release_dir_cis }} ] || mkdir {{ $release_dir_cis }};
    cd {{ $release_dir_cis }};
    git clone -b cis {{ $repo }} {{ $release }};
@endtask

@task('delete_old', ['on' => 'web'])
	find {{ $release_dir }}/* -maxdepth 0 -type d | sort -n | head -n -4 | cut -f 2- | xargs rm -rf
@endtask

@task('delete_old_cis', ['on' => 'cis'])
    find {{ $release_dir_cis }}/* -maxdepth 0 -type d | sort -n | head -n -4 | cut -f 2- | xargs rm -rf
@endtask

@task('configure_project', ['on' => 'web'])
    cd {{ $release_dir }}/{{ $release }};
    composer install --prefer-dist --no-scripts --no-dev;
    php artisan clear-compiled --env=production;
    php artisan optimize --env=production;
@endtask

@task('configure_project_cis', ['on' => 'cis'])
    cd {{ $release_dir_cis }}/{{ $release }};
    /home/r/russfeld/bin/composer install --prefer-dist --no-scripts --no-dev;
    php artisan clear-compiled --env=production;
    php artisan optimize --env=production;
@endtask

@task('database_setup', ['on' => 'web'])
    cd {{ $release_dir }}/{{ $release }};
    php artisan down
    php artisan migrate:refresh --seed --force
    php artisan deploy:post
    php artisan up
@endtask

@task('database_setup_cis', ['on' => 'cis'])
    cd {{ $release_dir_cis }}/{{ $release }};
    php artisan down
    php artisan migrate
    php artisan deploy:post
    php artisan up
@endtask

@task('configure_dev')
	sudo npm install
	bower update
	gulp --production
@endtask

@task('update_permissions', ['on' => 'web'])
    cd {{ $release_dir }};
    chgrp -R www-data {{ $release }};
    chmod -R ug+rwx {{ $release }};
@endtask

@task('update_permissions_cis', ['on' => 'cis'])
    cd {{ $release_dir_cis }};
    chmod -R ug+rwx {{ $release }};
    chmod -R a+rwx {{ $release }}/storage;
@endtask

@task('update_symlinks', ['on' => 'web'])
    ln -nfs {{ $release_dir }}/{{ $release }}/public {{ $app_dir }};
    chgrp -h www-data {{ $app_dir }};

    cd {{ $release_dir }}/{{ $release }};
    ln -nfs {{ $data_dir }}/.env .env;
    chgrp -h www-data .env;

    rm -r {{ $release_dir }}/{{ $release }}/storage/logs;
    rm -r {{ $release_dir }}/{{ $release }}/storage/app;
    cd {{ $release_dir }}/{{ $release }}/storage;
    ln -nfs {{ $data_dir }}/logs logs;
    ln -nfs {{ $data_dir }}/app app;
    chgrp -h www-data logs;
    chgrp -h www-data app;
@endtask

@task('update_symlinks_cis', ['on' => 'cis'])
    ln -nfs {{ $release_dir_cis }}/{{ $release }}/public {{ $app_dir_cis }};

    cd {{ $release_dir_cis }}/{{ $release }};
    ln -nfs {{ $data_dir_cis }}/.env .env;

    rm -r {{ $release_dir_cis }}/{{ $release }}/storage/logs;
    rm -r {{ $release_dir_cis }}/{{ $release }}/storage/app;
    cd {{ $release_dir_cis }}/{{ $release }}/storage;
    ln -nfs {{ $data_dir_cis }}/logs logs;
    ln -nfs {{ $data_dir_cis }}/app app;
@endtask
