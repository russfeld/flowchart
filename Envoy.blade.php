@servers(['web' => 'root@104.131.70.168'])

<?php
$repo = 'git@github.com:russfeld/flowchart.git';
$release_dir = '/var/www/releases';
$app_dir = '/var/www/html';
$release = 'release_' . date('YmdHis');
?>

@macro('deploy', ['on' => 'web'])
    fetch_repo
    delete_old
    configure_project
    update_permissions
    update_symlinks
@endmacro

@task('fetch_repo')
    [ -d {{ $release_dir }} ] || mkdir {{ $release_dir }};
    cd {{ $release_dir }};
    git clone -b master {{ $repo }} {{ $release }};
@endtask

@task('delete_old')
	find {{ $release_dir }}/* -maxdepth 0 -type d | sort -n | head -n -4 | cut -f 2- | xargs rm -rf
@endtask

@task('configure_project')
    cd {{ $release_dir }}/{{ $release }};
    composer install --prefer-dist --no-scripts;
    php artisan clear-compiled --env=production;
    php artisan optimize --env=production;
@endtask

@task('configure_dev')
	sudo npm install
	bower update
	gulp --production
@endtask

@task('update_permissions')
    cd {{ $release_dir }};
    chgrp -R www-data {{ $release }};
    chmod -R ug+rwx {{ $release }};
@endtask

@task('update_symlinks')
    ln -nfs {{ $release_dir }}/{{ $release }}/public {{ $app_dir }};
    chgrp -h www-data {{ $app_dir }};

    cd {{ $release_dir }}/{{ $release }};
    ln -nfs ../../.env .env;
    chgrp -h www-data .env;

    rm -r {{ $release_dir }}/{{ $release }}/storage/logs;
    cd {{ $release_dir }}/{{ $release }}/storage;
    ln -nfs ../../../logs logs;
    chgrp -h www-data logs;
@endtask