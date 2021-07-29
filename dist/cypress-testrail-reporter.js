"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

Object.defineProperty(exports, "__esModule", { value: true });
var mocha_1 = require("mocha");
var moment = require("moment");
var testrail_1 = require("./testrail");
var shared_1 = require("./shared");
var testrail_interface_1 = require("./testrail.interface");
var chalk = require('chalk');

var CypressTestRailReporter = /** @class */ (function (_super) {
    __extends(CypressTestRailReporter, _super);
    function CypressTestRailReporter(runner, options) {
        var _this = _super.call(this, runner) || this;
        _this.results = [];
        _this.actualCaseIds = [];
        var reporterOptions = options.reporterOptions;
        _this.testRail = new testrail_1.TestRail(reporterOptions);
        _this.validate(reporterOptions, 'domain');
        _this.validate(reporterOptions, 'username');
        _this.validate(reporterOptions, 'password');
        _this.validate(reporterOptions, 'projectId');
        _this.validate(reporterOptions, 'milestoneId');
        _this.validate(reporterOptions, 'suiteId');
        _this.validate(reporterOptions, 'createTestRun');

        var artifacts = (reporterOptions.artifactsURL || 'TEST ARTIFACT URL NOT PROVIDED');

        runner.on('start', function () {
            var executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
            var name = (reporterOptions.runName || 'Automated test run') + " " + executionDateTime;
            var description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';

            if (reporterOptions.createTestRun == 'yes') {
                _this.testRail.createRun(name, description);
            } else if (reporterOptions.createTestRun == 'no'){
                console.info('\n', "Results will be published to already existing Test Run with ID Number: " + reporterOptions.runId, '\n');
            } else {
                console.error('\n', "Please use valid string values for createTestRun option!", '\n');
                return;
            }
        });

        runner.on('pass', function (test) {
            var caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                var results = caseIds.map(function (caseId) {
                    _this.actualCaseIds.push(caseId);
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Passed,
                        comment: "Test was marked as PASSED by Cypress Automation Framework!" + "\n\n" + "Execution time: " + test.duration + " ms" + "\n\n" + "Test Recording location:" + "\n" + artifacts + "\n",
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
            var _a;
        });

        runner.on('fail', function (test) {
            var caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                var results = caseIds.map(function (caseId) {
                    _this.actualCaseIds.push(caseId);
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Failed,
                        comment: "Test was marked as FAILED by Cypress Automation Framework!" + "\n\n" + "ERROR MESSAGE:" + "\n" + test.err.message + "\n\n" + "Test Recording location:" + "\n" + artifacts + "\n",
                    };
                });
                (_a = _this.results).push.apply(_a, results);
            }
            var _a;
        });
        
        runner.on('end', function () {
            if (_this.results.length == 0) {
                console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
                console.warn('\n', 'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx', '\n');
                if (reporterOptions.createTestRun == 'yes') {
                    _this.testRail.deleteRun();
                }
                return;
            }
            console.log("!!!!!!!!!!!!!!!!!!!!");
            var existingCases = _this.testRail.getCases();
            existingCases.concat(_this.actualCaseIds);
            console.log(existingCases);
            _this.testRail.update_run(existingCases);

            _this.testRail.publishResults(_this.results);

        });
        return _this;
    }

    CypressTestRailReporter.prototype.validate = function (options, name) {
        if (options == null) {
            throw new Error('Missing reporterOptions in cypress.json');
        }
        if (options[name] == null) {
            throw new Error("Missing " + name + " value. Please update reporterOptions in cypress.json");
        }
    };

    return CypressTestRailReporter;

}(mocha_1.reporters.Spec));

exports.CypressTestRailReporter = CypressTestRailReporter;
//# sourceMappingURL=cypress-testrail-reporter.js.map