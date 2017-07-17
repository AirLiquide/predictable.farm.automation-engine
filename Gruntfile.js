/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var path = require("path");

module.exports = function(grunt) {

    var nodemonArgs = ["-v"];
    var flowFile = grunt.option('flowFile');
    if (flowFile) {
        nodemonArgs.push(flowFile);
    }

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        paths: {
            dist: ".dist"
        },
        concat: {
            options: {
                separator: ";",
            },
            build: {
                src: [
                ],
                dest: "theme/predictable-ui/js/main.js"
            }
        },
        uglify: {
            build: {
                files: {
                    'theme/predictable-ui/js/main.min.js': 'theme/predictable-ui/js/main.js'
                }
            }
        },
        sass: {
            build: {
                options: {
                },
                files: [
                {
                    src:  'theme/predictable-ui/sass/style.scss',
                    dest: 'theme/predictable-ui/css/style.css'

                }
                ]
            }
        },
        clean: {
            build: {
                src: []
            },
            release: {
                src: [
                    '<%= paths.dist %>'
                ]
            }
        },
        exec: {
          install: './install.sh'
        },
        watch: {
            js: {
                files: [
                    'theme/predictable-ui/js/**/*.js'
                ],
                tasks: ['copy:build','concat','uglify']
            },
            sass: {
                files: [
                    'theme/predictable-ui/sass/**/*.scss'
                ],
                tasks: ['sass','exec:install']
            },
        },

        concurrent: {
            dev: {
                tasks: ['watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('setDevEnv',
        'Sets NODE_ENV=development so non-minified assets are used',
            function () {
                process.env.NODE_ENV = 'development';
            });

    grunt.registerTask('default',
        'Builds editor content then runs code style checks and unit tests on all components',
        ['sass']);


    grunt.registerTask('build',
        'Builds editor content',
        ['clean:build','concat:build','copy:build','sass:build']);
};
