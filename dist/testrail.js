"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios = require('axios');
var chalk = require('chalk');

var TestRail = /** @class */ (function () {
    function TestRail(options) {
        this.options = options;
        this.base = options.domain + "/index.php?/api/v2";
    }

    TestRail.prototype.createRun = function (name, description) {
      var _this = this

      axios({
          method: 'post',
          url: this.base + "/add_run/" + this.options.projectId,
          headers: { 'Content-Type': 'application/json' },
          auth: {
              username: this.options.username,
              password: this.options.password,
          },
          data: JSON.stringify({
              suite_id: this.options.suiteId,
              name: name,
              description: description,
              milestone_id: this.options.milestoneId,
              include_all: true,
          }),
      })
        .then(function (response) {
              console.log('\n', 'Creating test run... ---> run id is:  ', response.data.id, '\n');
              _this.runId = response.data.id;
        })
        .catch(function (error) { return console.error(error); });
    };

    TestRail.prototype.deleteRun = function () {

        if (this.options.createTestRun == 'no') {
            this.runId = this.options.runId
        } else if (this.runId == 'undefined'){
            console.error("runId is undefined.");
            return;
        }

        axios({
            method: 'post',
            url: this.base + "/delete_run/" + this.runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        }).catch(function (error) { return console.error(error); });
    };

    TestRail.prototype.publishResults = function (results) {

        var domain = this.options.domain

        if (this.options.createTestRun == 'no') {
            this.runId = this.options.runId
        } else if (this.runId == 'undefined'){
            console.error("runId is undefined.");
            return;
        }

        var linkId = this.runId

        axios({
            method: 'post',
            url: this.base + "/add_results_for_cases/" + this.runId,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({ results: results }),

        }).then(function (response) {
            if (response.status == 200) {
                console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
                console.log(
                  '\n',
                  ` - Results are published to ${chalk.magenta(
                    domain + "/index.php?/runs/view/" + linkId
                    )}`,
                  '\n'
                );
            }
        }).catch(function (error) { return console.error(error); });
    };

    return TestRail;
  }());
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map