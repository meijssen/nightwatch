var BASE_PATH = process.env.NIGHTWATCH_COV
  ? 'lib-cov'
  : 'lib';

var path = require('path');

module.exports = {
  setUp : function(cb) {
    this.Runner = require('../../../'+ BASE_PATH +'/runner/run.js');
    process.removeAllListeners('exit');
    process.removeAllListeners('uncaughtException');
    cb();
  },

  tearDown : function(callback) {
    delete require.cache[require.resolve('../../../'+ BASE_PATH +'/runner/run.js')];
    callback();
  },

  testRunEmptyFolder : function(test) {
    var testsPath = path.join(process.cwd(), '/sampletests/empty');
    this.Runner.run([testsPath], {}, {
      output_folder : false
    }, function(err) {
      test.ok(err.message.indexOf('No tests defined!') === 0);
      test.done();
    });
  },

  testRunSimple : function(test) {
    test.expect(5);
    var testsPath = path.join(process.cwd(), '/sampletests/simple');
    this.Runner.run([testsPath], {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test
      }
    }, {
      output_folder : false,
      start_session : true
    }, function(err, results) {
      test.equals(err, null);
      test.ok('sample' in results.modules);
      test.ok('demoTest' in results.modules.sample.completed);
      test.done();
    });
  },

  'test run multiple sources and same module name' : function(test) {
    var srcFolders = [
      path.join(process.cwd(), '/sampletests/simple'),
      path.join(process.cwd(), '/sampletests/mixed')
    ];

    this.Runner.run(srcFolders, {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test
      }
    }, {
      output_folder : false,
      start_session : true,
      src_folders : srcFolders
    }, function(err, results) {
      test.equals(err, null);

      test.ok('simple/sample' in results.modules);
      test.ok('mixed/sample' in results.modules);
      test.ok('demoTest' in results.modules['simple/sample'].completed);
      test.ok('demoTestMixed' in results.modules['mixed/sample'].completed);

      test.done();
    });
  },

  testRunMultipleSrcFolders : function(test) {
    test.expect(8);
    var testsPath = path.join(process.cwd(), '/sampletests/simple');
    var testsPath2 = path.join(process.cwd(), '/sampletests/srcfolders');
    var srcFolders = [testsPath2, testsPath];
    this.Runner.run(srcFolders, {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test
      }
    }, {
      output_folder : false,
      start_session : true,
      src_folders : srcFolders
    }, function(err, results) {
      test.equals(err, null);
      test.ok('simple/sample' in results.modules);
      test.ok('demoTest' in results.modules['simple/sample'].completed);
      test.ok('srcfolders/other_sample' in results.modules);
      test.ok('srcFoldersTest' in results.modules['srcfolders/other_sample'].completed);
      test.done();
    });
  },


  testRunWithExcludeFolder : function(test) {
    var testsPath = path.join(process.cwd(), '/sampletests/withexclude');
    this.Runner.run([testsPath], {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test
      },
      exclude : ['excluded']
    }, {
      output_folder : false,
      start_session : true
    }, function(err, results) {
      test.ok(!('excluded-module' in results.modules));
      test.done();
    });
  },

  testRunWithExcludePattern : function(test) {
    var testsPath = path.join(process.cwd(), '/sampletests/withexclude');
    var testPattern = path.join('excluded', 'excluded-*');
    this.Runner.run([testsPath], {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test
      },
      exclude : [testPattern]
    }, {
      output_folder : false,
      start_session : true
    }, function(err, results) {
      test.ok(!('excluded-module' in results.modules));
      test.done();
    });
  },

  testRunAsync : function(test) {
    test.expect(5);
    var testsPath = path.join(process.cwd(), '/sampletests/async');
    this.Runner.run([testsPath], {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test
      }
    }, {
      output_folder : false,
      start_session : true
    }, function(err, results) {
      test.equals(err, null);
      test.ok('sample' in results.modules);
      test.ok('demoTestAsync' in results.modules.sample.completed);
      test.done();
    });
  },

  testRunAsyncWithBeforeAndAfter : function(test) {
    test.expect(27);
    var testsPath = path.join(process.cwd(), '/sampletests/before-after');
    this.Runner.run([testsPath], {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test
      }
    }, {
      output_folder : false,
      start_session : true
    }, function(err, results) {
      test.equals(err, null);
      test.ok('sampleWithBeforeAndAfter' in results.modules);

      var result = results.modules.sampleWithBeforeAndAfter.completed;
      test.ok('demoTestAsyncOne' in result);
      test.ok('demoTestAsyncTwo' in result);
      test.ok(!('beforeEach' in result));
      test.ok(!('before' in result));
      test.ok(!('afterEach' in result));
      test.ok(!('after' in result));
      test.ok('syncBeforeAndAfter' in results.modules);
      test.ok('demoTestAsyncOne' in result);
      test.ok('demoTestAsyncTwo' in result);
      test.ok(!('beforeEach' in result));
      test.ok(!('before' in result));
      test.ok(!('afterEach' in result));
      test.ok(!('after' in result));
      test.done();
    });
  },

  testRunWithGlobalBeforeAndAfter : function(test) {
    test.expect(15);
    var testsPath = path.join(process.cwd(), '/sampletests/before-after');
    var beforeEachCount = 0;
    var afterEachCount = 0;
    this.Runner.run([testsPath], {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test,
        beforeEach: function() { beforeEachCount++; },
        afterEach: function() { afterEachCount++; }
      }
    }, {
      output_folder : false,
      start_session : true
    }, function(err, results) {
      test.equals(err, null);
      test.equals(beforeEachCount, 2);
      test.equals(afterEachCount, 2);
      test.done();
    });
  },

  testRunWithGlobalAsyncBeforeEachAndAfterEach : function(test) {
    test.expect(15);
    var testsPath = path.join(process.cwd(), '/sampletests/before-after');
    var beforeEachCount = 0;
    var afterEachCount = 0;
    this.Runner.run([testsPath], {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test,
        beforeEach: function(done) {
          setTimeout(function() { beforeEachCount++; done(); }, 100);
        },
        afterEach: function(done) {
          setTimeout(function() { afterEachCount++; done(); }, 100);
        }
      }
    }, {
      output_folder : false,
      start_session : true
    }, function(err, results) {
      test.equals(err, null);
      test.equals(beforeEachCount, 2);
      test.equals(afterEachCount, 2);
      test.done();
    });
  },

  testRunWithGlobalAsyncBeforeEachAndAfterEachWithBrowser : function(test) {
    test.expect(17);
    var testsPath = path.join(process.cwd(), '/sampletests/before-after');
    var beforeEachCount = 0;
    var afterEachCount = 0;
    this.Runner.run([testsPath], {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test,
        beforeEach: function(client, done) {
          test.deepEqual(client.globals, this);
          setTimeout(function() {
            beforeEachCount++;
            done();
          }, 100);
        },
        afterEach: function(client, done) {
          setTimeout(function() {
            afterEachCount++;
            done();
          }, 100);
        }
      }
    }, {
      output_folder : false,
      start_session : true
    }, function(err, results) {
      test.equals(err, null);
      test.equals(beforeEachCount, 2);
      test.equals(afterEachCount, 2);
      test.done();
    });
  },

  testRunWithGlobalReporter : function(test) {
    test.expect(15);
    var testsPath = path.join(process.cwd(), '/sampletests/before-after');
    var reporterCount = 0;
    this.Runner.run([testsPath], {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test,
        reporter: function(results) {
          test.ok('modules' in results);
          reporterCount++;
        }
      }
    }, {
      output_folder : false,
      start_session : true
    }, function(err, results) {
      test.equals(err, null);
      test.equals(reporterCount, 1);
      test.done();
    });
  },

  testRunWithGlobalAsyncReporter : function(test) {
    test.expect(15);
    var testsPath = path.join(process.cwd(), '/sampletests/before-after');
    var reporterCount = 0;
    this.Runner.run([testsPath], {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test,
        reporter: function(results, done) {
          test.ok('modules' in results);
          reporterCount++;
          done();
        }
      }
    }, {
      output_folder : false,
      start_session : true
    }, function(err, results) {
      test.equals(err, null);
      test.equals(reporterCount, 1);
      test.done();
    });
  },

  testRunMixed : function(test) {
    test.expect(6);
    var testsPath = path.join(process.cwd(), '/sampletests/mixed');
    this.Runner.run([testsPath], {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test
      }
    }, {
      output_folder : false
    }, function(err, results) {
      test.equals(err, null);
      test.ok('sample' in results.modules);
      test.ok('demoTestMixed' in results.modules.sample.completed);
      test.done();
    });
  },

  testRunWithTags : function(test) {
    var testsPath = path.join(process.cwd(), 'sampletests');

    this.Runner.run([testsPath], {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test
      },
      tag_filter : ['login']
    }, {
      output_folder : false,
      start_session : true
    }, function(err, results) {
      test.ok(('demoTagTest' in results.modules.sample.completed), 'demoTagTest was ran');
      test.ok(Object.keys(results.modules).length === 1, 'There was only 1 test running.');
      test.done();
    });
  },

  testRunWithOutput : function(test) {
    var src_folders = [
      path.join(process.cwd(), 'sampletests/withsubfolders')
    ];

    this.Runner.run(src_folders, {
      seleniumPort : 10195,
      silent : true,
      output : false,
      globals : {
        test : test
      }
    }, {
      output_folder : 'output',
      start_session : true,
      src_folders : src_folders,
      reporter : 'junit'
    }, function(err, results) {
      test.equals(err, null);
      var fs = require('fs');
      fs.readdir(src_folders[0], function(err, list) {
        test.deepEqual(list, ['simple', 'tags'], 'The subfolders have been created.');
        var simpleReportFile = 'output/simple/FIREFOX_TEST_TEST_sample.xml';
        var tagsReportFile = 'output/tags/FIREFOX_TEST_TEST_sample.xml';

        test.ok(fs.existsSync(simpleReportFile), 'The simple report file was not created.');
        test.ok(fs.existsSync(tagsReportFile), 'The tags report file was not created.');
        test.done();
      });

    });
  },

  testRunModuleSyncName : function(test) {
    test.expect(3);
    var testsPath = path.join(process.cwd(), '/sampletests/syncnames');
    this.Runner.run([testsPath], {
      seleniumPort : 10195,
      silent : true,
      output : false,
      sync_test_names : true,
      globals : {
        test : test
      }
    }, {
      output_folder : false,
      start_session : true
    }, function(err, results) {
      test.equals(err, null);
      test.ok('sampleTest' in results.modules);
      test.done();
    });
  },

  testRunUnitTests : function(test) {
    var testsPath = path.join(process.cwd(), '/sampletests/unittests');
    test.expect(3);
    this.Runner.run([testsPath], {
      silent : true,
      output : false,
      globals : {
        test : test
      }
    }, {
      output_folder : false,
      start_session : false
    }, function(err, results) {
      test.equals(err, null);
      test.done();
    });
  },

  testRunTestcase : function(test) {
    var testsPath = path.join(process.cwd(), '/sampletests/before-after/syncBeforeAndAfter.js');

    this.Runner.run(testsPath, {
      silent : true,
      output : false,
      globals : {
        test : test
      }
    }, {
      output_folder : false,
      start_session : true,
      testcase : 'demoTestSyncOne'
    }, function(err, results) {
      test.equals(err, null);
      test.ok('demoTestSyncOne' in results.modules.syncBeforeAndAfter.completed);
      test.ok(!('demoTestSyncTwo' in results.modules.syncBeforeAndAfter.completed));

      test.done();
    });
  },

  testRunTestcaseInvalid : function(test) {
    var testsPath = path.join(process.cwd(), '/sampletests/before-after/syncBeforeAndAfter.js');

    this.Runner.run(testsPath, {
      silent : true,
      output : false,
      globals : {
        test : test
      }
    }, {
      output_folder : false,
      start_session : true,
      testcase : 'Unknown'
    }, function(err, results) {
      test.equals(err.message, 'Error: "Unknown" is not a valid testcase in the current test suite.');

      test.done();
    });
  }

};
