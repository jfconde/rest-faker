module.exports = function(grunt) {

    grunt.initConfig({
        jsdoc : {
            dist : {
                src: ['./libs', './*.js'],
                jsdoc: './node_modules/.bin/jsdoc',
                options: {
                    recurse: true,
                    destination: './public_html/doc',
                    configure: './jsdoc/config.json',
                    template: './node_modules/ink-docstrap/template'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsdoc');

};