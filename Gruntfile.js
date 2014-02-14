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
            }
        },
        zip: {
            build: {
                cwd: 'application/',
                src: 'application/**',
                dest: 'webkit/winnodelauncher.nw'
            }
        },
        watch: {
            dist: {
                files: ['**/*.js', '**/*.scss', '**/*.html'],
                tasks: ['build']
            },
            dev: {
                files: ['**/*.scss'],
                tasks: ['compass:dist']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-zip');

    grunt.registerTask('build', ['compass:dist', 'zip:build']);

    grunt.registerTask('default', ['build']);

};