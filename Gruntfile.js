module.exports = function(grunt){
    grunt.initConfig({
        jshint: {
            options: {
                jshintrc:true     // Use external jshinrc file configured as below
            },
            all: {
                src: ['*.js'],
                filter: function(filepath) { // on some developer machines the test coverage HTML report utilities cause further failures
                    if ((filepath.indexOf("coverage/") !== -1) || (filepath.indexOf("node_modules") !== -1)) {
                        console.log( "\033[30m  filtered out \033[32m:\033[37m " + filepath + "\033[0m");
                        return false;
                    } else {
                        return true;
                    }
                }
            }
        },
        jsonlint:{
            all:{
                src:[
                    '/locales/**/*.json'
                  ]
            }
        },
        inlinelint: {
            html: ['*.html', '!node_modules/*/*.html', '!*/node_modules/*.html'],
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
