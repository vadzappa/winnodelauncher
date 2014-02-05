module.exports = function (grunt) {

    grunt.initConfig({
        compass: {                  // Task
            dist: {                   // Target
                options: {
                    basePath: 'application/',
                    sassDir: 'sass',
                    cssDir: 'css',
                    require: 'susy',
                    environment: 'production'
                }
            },
            dev: {                    // Another target
                options: {
                    basePath: 'application/',
                    sassDir: 'sass',
                    cssDir: 'css',
                    require: 'susy'
                }
            }
        },
        zip: {
            build: {
                cwd: 'application/',
                src: 'application/**',
                dest: 'webkit/winnodelauncher.nw'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-compass');

    grunt.loadNpmTasks('grunt-zip');

    grunt.registerTask('default', ['compass:dev', 'zip:build']);

    grunt.registerTask('build', ['compass:dist', 'zip:build']);

};