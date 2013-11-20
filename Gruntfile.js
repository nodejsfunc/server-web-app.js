'use strict';

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.initConfig({
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            'dist/*'
          ]
        }]
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'app.js',
        'config/**/*.js',
				'routes/**/*.js',
				'public/**/*.js'
			]
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '.',
          dest: 'dist',
          src: [
            'package.json',
            'app.js',
            'config/**/*',
            'public/**/*',
            'routes/**/*',
            'views/**/*',
            'node_modules/**/*'
          ]
        }]
      }
    },
    replace: {
      dist: {
        options: {
          variables: {
            '<%= grunt.config.get("searchTerm") %>': '<%= grunt.config.get("serverVersion") %>'
          },
          prefix: '-'
        },
        files: [
          {expand: true, flatten: true, src: ['package.json'], dest: ''}
        ]
      }
    }
  });

  grunt.registerTask('build', [
    'jshint'
  ]);

  grunt.registerTask('ci-build', [
    'clean:dist',
    'jshint',
    'replace',
    'copy'
  ]);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('create-version', function() {
    var pkg = grunt.file.readJSON('package.json');
    var searchTerm = pkg.version.substring(pkg.version.lastIndexOf('-') + 1, pkg.version.length);
    var fullVersion = '-' + process.env.BUILD_NUMBER; // append Jenkins build number
    grunt.config.set('serverVersion', fullVersion);
    grunt.config.set('searchTerm', searchTerm);
  });
};