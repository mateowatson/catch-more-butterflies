let mix = require('laravel-mix');

mix.js('src/app.js', 'dist')
    .sass('src/sass/style.scss', 'dist')
    .options({ processCssUrls: false });