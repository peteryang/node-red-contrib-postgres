module.exports = function(grunt){
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc:true     // Use external jshinrc file configured as below
            },
            all: {
                src: ['*.js']
            }
        },
        jsonlint:{
            all:{
                src: ['/locales/**/*.json']
            }
        },
        inlinelint: {
            html: ['*.html'],
            options: {
                jshintrc: ".jshintrc"
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-lint-inline');
    grunt.loadNpmTasks('grunt-jsonlint');

    grunt.registerTask('default', ['jshint:all', 'jsonlint:all', 'inlinelint:html']);
};
