"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var path = require('path')
var appDir = path.resolve(".")
var chai = require("chai")
var qmGit = require("../../ts/qm.git")
var qmShell = require("../../ts/qm.shell")
var fileHelper = require("../../ts/qm.file-helper")
var cypressFunctions = require("../../ts/cypress-functions")
var urlParser = require("url")
var https = require("https")
global.fetch = require("../../node_modules/node-fetch/lib/index.js")
global.Headers = fetch.Headers
var _str = require("underscore.string")
var simpleGit = require("simple-git/promise")
var th = require("../../ts/test-helpers")
var git = simpleGit()
global.bugsnagClient = require('./../../node_modules/bugsnag')
//global.Swal = require('./../../src/lib/swee')
var argv = require('./../../node_modules/yargs').argv
global.qm = require('./../../src/js/qmHelpers')
qm.appMode.mode = 'testing'
var qmLog = require('./../../src/js/qmLogger')
qmLog.color = require('./../../node_modules/ansi-colors')
qm.github = require('./../../node_modules/gulp-github')
qm.Quantimodo = require('./../../node_modules/quantimodo')
require('./../../src/data/qmStaticData')
qm.stateNames = qm.staticData.stateNames
qm.qmLog = qmLog
qmLog.qm = qm
qm.qmLog.setLogLevelName(process.env.LOG_LEVEL || 'info')
global.nlp = require('./../../src/lib/compromise')
const chrome = require('sinon-chrome/extensions')
var qmTests = {
    getAccessToken(){
        var t = process.env.QUANTIMODO_ACCESS_TOKEN
        if(!t){ throw "Please set process.env.QUANTIMODO_ACCESS_TOKEN" }
        return t
    },
    testParams: {},
    setTestParams(params){
        qmTests.testParams = params
        qmLog.debug("Setting test params: " + JSON.stringify(params))
    },
    getTestParams(){
        if(typeof qmTests.testParams === 'string'){
            return JSON.parse(qmTests.testParams)
        }
        return qmTests.testParams
    },
    startUrl: null,
    getStartUrl(){
        var params = qmTests.getTestParams()
        var startUrl = 'https://medimodo.herokuapp.com'
        if(params && params.startUrl){ startUrl = params.startUrl }
        if(params && params.deploy_ssl_url){ startUrl = params.deploy_ssl_url }
        if(params && params.START_URL){ startUrl = params.START_URL }
        if(process.env.START_URL){ startUrl = process.env.START_URL }
        if(process.env.DEPLOY_PRIME_URL){ startUrl = process.env.DEPLOY_PRIME_URL }
        if(argv.startUrl){ startUrl = argv.startUrl }
        if(startUrl.indexOf('https') === -1){ startUrl = "https://" + startUrl }
        return startUrl
    },
    getSha(){
        var params = qmTests.getTestParams()
        if(params && params.commit_ref){ return params.commit_ref }
        if(params && params.sha){ return params.sha }
    },
    getStatusesUrl(){
        var params = qmTests.getTestParams()
        if(params && params.statuses_url){ return params.statuses_url }
        /** @namespace params.commit_url */
        if(params && params.commit_url){
            var url = params.commit_url
            url = url.replace('github.com', 'api.github.com/repos')
            url = url.replace('commit', 'statuses')
            return url
        }
        return null
    },
    getApiUrl(){
        var params = qmTests.getTestParams()
        if(params && params.API_URL){ return params.API_URL }
        if(process.env.API_URL){ return process.env.API_URL }
        if(argv.apiUrl){ return argv.apiUrl }
        return 'api.quantimo.do'
    },
    tests: {
        checkIntent(userInput, expectedIntentName, expectedEntities, expectedParameters, callback){
            var intents = qm.staticData.dialogAgent.intents
            var entities = qm.staticData.dialogAgent.entities
            qmLog.info("Got " + entities.length + " entities")
            var matchedEntities = qm.dialogFlow.getEntitiesFromUserInput(userInput)
            for (var expectedEntityName in expectedEntities) {
                if (!expectedEntities.hasOwnProperty(expectedEntityName)) { continue }
                qm.assert.doesNotEqual(typeof matchedEntities[expectedEntityName], "undefined",
                    expectedEntityName + " not in matchedEntities!")
                qm.assert.equals(matchedEntities[expectedEntityName].matchedEntryValue, expectedEntities[expectedEntityName])
            }
            var expectedIntent = intents[expectedIntentName]
            var triggerPhraseMatchedIntent = qm.dialogFlow.getIntentMatchingCommandOrTriggerPhrase(userInput)
            qm.assert.equals(triggerPhraseMatchedIntent.name, expectedIntentName)
            var score = qm.dialogFlow.calculateScoreAndFillParameters(expectedIntent, matchedEntities, userInput)
            var filledParameters = expectedIntent.parameters
            var expectedParameterName
            for (expectedParameterName in expectedParameters) {
                if (!expectedParameters.hasOwnProperty(expectedParameterName)) { continue }
                if(typeof filledParameters[expectedParameterName] === "undefined"){
                    score = qm.dialogFlow.calculateScoreAndFillParameters(expectedIntent, matchedEntities, userInput)
                }
                qm.assert.doesNotEqual(typeof filledParameters[expectedParameterName], "undefined", expectedParameterName + " not in filledParameters!")
                qm.assert.equals(filledParameters[expectedParameterName], expectedParameters[expectedParameterName])
            }
            qm.assert.greaterThan(-2, score)
            var matchedIntent = qm.dialogFlow.getIntent(userInput)
            filledParameters = matchedIntent.parameters
            qm.assert.equals(matchedIntent.name, expectedIntentName)
            for (expectedParameterName in expectedParameters) {
                if (!expectedParameters.hasOwnProperty(expectedParameterName)) { continue }
                qm.assert.doesNotEqual(typeof filledParameters[expectedParameterName], "undefined", expectedParameterName + " not in filledParameters!")
                qm.assert.equals(filledParameters[expectedParameterName], expectedParameters[expectedParameterName])
            }
            if(callback){ callback() }
        },
        getOptions(startUrl){
            var options = {}
            options.startUrl = startUrl || qmTests.getStartUrl()
            options.apiUrl = qmTests.getApiUrl()
            if(qmTests.getSha()){ options.sha = qmTests.getSha() }
            if(qmTests.getStatusesUrl()){ options.statuses_url = qmTests.getStatusesUrl() }
            return options
        },
        parseCorrelationNotificationTest(cb){
            var pushData = {
                color: "#2196F3",
                "content-available": "1",
                "force-start": "0",
                forceStart: "0",
                foreground: "false",
                image: "https://web.quantimo.do/img/variable_categories/symptoms.png",
                isBackground: "true",
                message: "Your EffectVariableName is generally 40% higher after $1.1 over the previous 30 days. ",
                notId: "100624100625",
                soundName: "false",
                title: "↑Higher Purchases Of CauseVariableName Predicts Significantly ↑Higher EffectVariableName",
                url: "https://web.quantimo.do/#/app/study?causeVariableId=100624&effectVariableId=100625&userId=1&clientId=quantimodo",
                user: "1",
            }
            var notificationOptions = qm.notifications.convertPushDataToWebNotificationOptions(pushData, qm.getAppSettings())
            qm.assert.equals(notificationOptions.title, pushData.title)
            qm.assert.equals(notificationOptions.body, pushData.message)
            cb()
        },
    },
    logBugsnagLink(suite, start, end){
        var query = "filters[event.since][0]=" +
            start + "&filters[error.status][0]=open&filters[event.before][0]=" +
            end + "&sort=last_seen"
        console.error(suite.toUpperCase() + " errors: https://app.bugsnag.com/quantimodo/" + suite + "/errors?" + query)
    },
    outputErrorsForTest(testResults){
        var name = testResults.testName || testResults.name
        console.error(name + " FAILED: https://app.ghostinspector.com/results/" + testResults._id)
        qmTests.logBugsnagLink('ionic', testResults.dateExecutionStarted, testResults.dateExecutionFinished)
        qmTests.logBugsnagLink('slim-api', testResults.dateExecutionStarted, testResults.dateExecutionFinished)
        console.error("=== CONSOLE ERRORS ====")
        for (var i = 0; i < testResults.console.length; i++) {
            var logObject = testResults.console[i]
            if(logObject.error || logObject.output.toLowerCase().indexOf("error") !== -1){
                console.error(logObject.output + " at " + logObject.url)
            }
        }
        process.exit(1)
    },
    runAllTestsForType (testType, callback) {
        console.info("=== " + testType + " Tests ===")
        var tests = qm.tests[testType]
        for (var testName in tests) {
            if (!tests.hasOwnProperty(testName)) continue
            console.info(testName + "...")
            tests[testName]()
            console.info(testName + " passed! :D")
        }
        if(callback){ callback() }
    },
}
beforeEach(function (done) {
    var t = this.currentTest
    this.timeout(10000) // Default 2000 is too fast for Github API
    // @ts-ignore
    qmGit.setGithubStatus("pending", t.title, "Running...", null, function (res) {
        var logResult = false
        if (logResult) {
            console.debug(res)
        }
        done()
    })
})
afterEach(function (done) {
    var t = this.currentTest
    // @ts-ignore
    var state = t.state
    if (!state) {
        console.debug("No test state in afterEach!")
        done()
        return
    }
    var githubState = "success"
    if (state === "failed") {
        githubState = "failure"
    }
    // @ts-ignore
    qmGit.setGithubStatus(githubState, t.title, t.title, null, function (res) {
        var logResult = false
        if (logResult) {
            console.debug(res)
        }
        done()
    })
})
function downloadFileContains(url, expectedToContain, cb) {
    downloadFile(url, function (str) {
        chai.expect(str).to.contain(expectedToContain)
        cb()
    })
}
function downloadFile(url, cb) {
    var parsedUrl = urlParser.parse(url)
    var options = {
        hostname: parsedUrl.hostname,
        method: "GET",
        path: parsedUrl.path,
        port: 443,
    }
    var req = https.request(options, function (res) {
        console.log("statusCode: " + res.statusCode)
        chai.expect(res.statusCode).to.eq(200)
        var str = ""
        res.on("data", function (chunk) {
            str += chunk
        })
        res.on("end", function () {
            console.log("RESPONSE: " + _str.truncate(str, 30))
            cb(str)
        })
    })
    req.on("error", function (error) {
        console.error(error)
    })
    req.end()
}
describe("API", function (){
    it("Makes sure api url is app.quantimo.do", function (done) {
        chai.expect(qm.api.getApiUrl()).to.eq("https://app.quantimo.do")
        done()
    })
}).timeout(10000)
describe("Chrome Extension", function () {
    before(function () {
        global.chrome = chrome
    })
    it('can create a popup window', function(done) {
        console.log("TODO: Figure out how to mock chrome.extension.onMessage")
        done()
        //qm.chrome.initialize()
        //qmTests.runAllTestsForType('chrome', done)
    })
}).timeout(10000)
describe("File Helper", function () {
    it("creates success file", function (done) {
        const filename = "success-file"
        fileHelper.deleteFile(filename, function (){
            let exists = fileHelper.exists(filename)
            chai.expect(exists).to.be.false
            th.createSuccessFile(function (){
                exists = fileHelper.exists(filename)
                chai.expect(exists).to.be.true
                done()
            })
        })
    })
    it("determines the absolute path", function (done) {
        var abs = fileHelper.getAbsolutePath("tests/ionIcons.js")
        chai.expect(abs).contains(appDir)
        done()
    })
    it("uploads a file", function (done) {
        fileHelper.uploadToS3(appDir + "/tests/ionIcons.js", "tests", function (uploadResponse) {
            downloadFileContains(uploadResponse.Location, "iosArrowUp", done)
        })
    })
    it.skip("uploads test results", function (done) {
        this.timeout(10000) // Default 2000 is too fast
        cypressFunctions.uploadTestResults(function (uploadResponse) {
            downloadFileContains(uploadResponse.Location, "mocha", done)
        })
    })
}).timeout(10000)
describe("Ghost Inspector", function () {
    it("runs tests on staging API", function (done) {
        var previouslySetApiUrl = process.env.API_URL || null
        delete process.env.API_URL
        chai.assert.isUndefined(process.env.API_URL)
        process.env.RELEASE_STAGE = "staging"
        var url = th.getApiUrl()
        chai.expect(url).to.contain("https://staging.quantimo.do")
        if (previouslySetApiUrl) {
            process.env.API_URL = previouslySetApiUrl
        }
        done()
    })
}).timeout(10000)
describe("Git Helper", function () {
    it.skip("sets commit status", function (done) {
        qmGit.setGithubStatus("pending", "test context", "test description", "https://get-bent.com", function (res) {
            chai.expect(res.status).to.eq(201)
            done()
        })
    })
    it.skip("creates a feature branch and deletes it", function (done) {
        var featureName = "test-feature"
        var branchName = "feature/" + featureName
        qmGit.createFeatureBranch("test-feature")
        git.branchLocal().then(function (branchSummary) {
            chai.expect(branchSummary.all).to.contain(branchName)
            qmShell.executeSynchronously("git checkout -B develop", true)
            git.deleteLocalBranch(branchName).then(function () {
                git.branchLocal().then(function (branchSummary) {
                    chai.expect(branchSummary.all).not.to.contain(branchName)
                    done()
                })
            })
        })
    })
}).timeout(10000)
describe("Intent Handler", function () {
    it('can record measurement from user speech command', function(done) {
        var userInput = "Record 1 Overall Mood"
        var expectedIntentName = 'Record Measurement Intent'
        var expectedEntities = {variableName: 'Overall Mood', recordMeasurementTriggerPhrase: "record"}
        var expectedParameters = {variableName: 'Overall Mood', value: 1}
        qmTests.tests.checkIntent(userInput, expectedIntentName, expectedEntities, expectedParameters, done)
    })
    it.skip('can remember stuff', function(done) {
        var userInput = "Remember where my keys are"
        var expectedIntentName = 'Remember Intent'
        var expectedEntities = {interrogativeWord: 'where', rememberCommand: "remember"}
        var expectedParameters = {memoryQuestion: 'where my keys are'}
        qmTests.tests.checkIntent(userInput, expectedIntentName, expectedEntities, expectedParameters, done)
    })
}).timeout(10000)
describe("Notifications", function () {
    it('test-push-parsing', function(done) {
        // noinspection HtmlRequiredAltAttribute,RequiredAttributes,HtmlUnknownAttribute
        var pushData = {
            actions: '[{"longTitle":"Rate 3\\/5","callback":"trackThreeRatingAction","modifiedValue":3,"action":"track","foreground":false,"shortTitle":"3\\/5","image":"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_ok.png","accessibilityText":"3\\/5","functionName":"track","html":"<md-tooltip>Rate 3\\/5<\\/md-tooltip><img class=\\"md-user-avatar\\" style=\\"height: 100%;\\" ng-src=\\"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_ok.png\\"\\/>","id":"ratingnotificationbutton-button","parameters":{"value":3,"modifiedValue":3,"action":"track","unitAbbreviatedName":"\\/5","trackingReminderNotificationId":99354},"successToastText":"Recorded 3 out of 5","text":"3\\/5","title":"3\\/5","tooltip":"Rate 3\\/5"},{"longTitle":"Rate 2\\/5","callback":"trackTwoRatingAction","modifiedValue":2,"action":"track","foreground":false,"shortTitle":"2\\/5","image":"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_sad.png","accessibilityText":"2\\/5","functionName":"track","html":"<md-tooltip>Rate 2\\/5<\\/md-tooltip><img class=\\"md-user-avatar\\" style=\\"height: 100%;\\" ng-src=\\"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_sad.png\\"\\/>","id":"ratingnotificationbutton-button","parameters":{"value":2,"modifiedValue":2,"action":"track","unitAbbreviatedName":"\\/5","trackingReminderNotificationId":99354},"successToastText":"Recorded 2 out of 5","text":"2\\/5","title":"2\\/5","tooltip":"Rate 2\\/5"},{"longTitle":"Rate 4\\/5","callback":"trackFourRatingAction","modifiedValue":4,"action":"track","foreground":false,"shortTitle":"4\\/5","image":"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_happy.png","accessibilityText":"4\\/5","functionName":"track","html":"<md-tooltip>Rate 4\\/5<\\/md-tooltip><img class=\\"md-user-avatar\\" style=\\"height: 100%;\\" ng-src=\\"https:\\/\\/web.quantimo.do\\/img\\/rating\\/100\\/face_rating_button_100_happy.png\\"\\/>","id":"ratingnotificationbutton-button","parameters":{"value":4,"modifiedValue":4,"action":"track","unitAbbreviatedName":"\\/5","trackingReminderNotificationId":99354},"successToastText":"Recorded 4 out of 5","text":"4\\/5","title":"4\\/5","tooltip":"Rate 4\\/5"}]',
            color: "#2196F3",
            "content-available": "1",
            "force-start": "1",
            foreground: "false",
            icon: "https://web.quantimo.do/img/variable_categories/emotions.png",
            image: "",
            isBackground: "true",
            lastValue: "3",
            message: "Pull down and select a value to record or tap to open inbox for more options",
            notId: "1398",
            secondToLastValue: "2",
            soundName: "false",
            thirdToLastValue: "4",
            title: "Track Overall Mood",
            trackingReminderNotificationId: "40611535",
            unitAbbreviatedName: "/5",
            url: "https://web.quantimo.do/#/app/reminders-inbox",
            valence: "positive",
            variableCategoryId: "1",
            variableDisplayName: "Overall Mood",
            variableName: "Overall Mood",
        }
        var notificationOptions = qm.notifications.convertPushDataToWebNotificationOptions(pushData, qm.getAppSettings())
        qm.assert.equals(3, notificationOptions.actions.length)
        qm.assert.equals("Overall Mood", notificationOptions.title)
        qmTests.tests.parseCorrelationNotificationTest(done)
    }).timeout(10000)
})
describe("Menu", function () {
    it("can move menu item down", function (done) {
        var original = JSON.parse(JSON.stringify(qm.menu.getMenu()))
        var reordered = qm.menu.moveMenuItemDown(JSON.parse(JSON.stringify(original)), 0)
        qm.assert.doesNotEqual(original[0].id, reordered[0].id)
        qm.assert.doesNotEqual(original[1].id, reordered[1].id)
        qm.assert.equals(original[0].id, reordered[1].id)
        done()
    })
    it("can move first menu item up", function (done) {
        var original = JSON.parse(JSON.stringify(qm.menu.getMenu()))
        var reordered = qm.menu.moveMenuItemUp(JSON.parse(JSON.stringify(original)), 0)
        qm.assert.equals(original[0].id, reordered[0].id)
        done()
    })
    it("can move menu item up", function (done) {
        var original = JSON.parse(JSON.stringify(qm.menu.getMenu()))
        var reordered = qm.menu.moveMenuItemUp(JSON.parse(JSON.stringify(original)), 1)
        qm.assert.equals(original[1].id, reordered[0].id)
        qm.assert.doesNotEqual(original[0].id, reordered[0].id)
        qm.assert.doesNotEqual(original[1].id, reordered[1].id)
        done()
    })
    it("can change variable category", function (done) {
        var before = {
            "stateName": "app.historyAllCategory",
            "href": "#/app/history-all-category/Physical+Activity",
            "url": "/history-all-category/:variableCategoryName",
            "icon": "ion-ios-body-outline",
            "subMenu": null,
            "params": {
                "showAds": true,
                "variableCategoryName": null,
                "refresh": null,
                "title": "History",
                "ionIcon": "ion-ios-list-outline",
            },
            "title": "Activity History",
            "id": "history-all-category-physical-activity",
            "showSubMenu": true,
            "$$hashKey": "object:3482",
            "cache": true,
            "views": {
                "menuContent": {
                    "templateUrl": "templates/history-all.html",
                    "controller": "historyAllMeasurementsCtrl",
                },
            },
            "name": "app.historyAllCategory",
        }
        before.params.variableCategoryName = "Nutrients"
        var updated = qm.menu.onParameterChange(JSON.parse(JSON.stringify(before)))
        qm.assert.contains("Nutrients", updated.href)
        qm.assert.equals("history-all-category-nutrients", updated.id)
        qm.assert.equals("Nutrients History", updated.title)
        qm.assert.doesNotContain(":variableCategory", updated.href)
        done()
    })
    it("can change state", function (done) {
        var before = {
            "stateName": "app.historyAllCategory",
            "href": "#/app/history-all-category/Physical+Activity",
            "url": "/history-all-category/:variableCategoryName",
            "icon": "ion-ios-body-outline",
            "subMenu": null,
            "params": {
                "showAds": true,
                "variableCategoryName": null,
                "refresh": null,
                "title": "History",
                "ionIcon": "ion-ios-list-outline",
            },
            "title": "Activity History",
            "id": "history-all-category-physical-activity",
            "showSubMenu": true,
            "$$hashKey": "object:3482",
            "cache": true,
            "views": {
                "menuContent": {
                    "templateUrl": "templates/history-all.html",
                    "controller": "historyAllMeasurementsCtrl",
                },
            },
            "name": "app.historyAllCategory",
        }
        before.stateName = qm.staticData.stateNames.charts
        var updated = qm.menu.onStateChange(JSON.parse(JSON.stringify(before)))
        qm.assert.contains("charts", updated.href)
        qm.assert.contains("charts", updated.id)
        qm.assert.equals("Charts", updated.title)
        qm.assert.doesNotContain(":variableCategory", updated.href)
        updated.params.variableName = "Overall Mood"
        updated = qm.menu.onStateChange(JSON.parse(JSON.stringify(before)))
        qm.assert.contains("Overall", updated.href)
        qm.assert.equals("charts-overall-mood", updated.id)
        qm.assert.equals("Overall Mood Charts", updated.title)
        qm.assert.doesNotContain(":variableName", updated.href)
        qm.assert.doesNotHaveProperty(updated.params, 'variableCategoryName')
        done()
    })
}).timeout(10000)
describe("Studies", function () {
    it.skip('can get a study showing relationship between eggs and mood', function(done) {
        this.timeout(20000)
        qm.storage.setItem(qm.items.accessToken, qmTests.getAccessToken())
        qm.studyHelper.getStudyFromApi({causeVariableName: "Eggs (serving)", effectVariableName: "Overall Mood", userId: 230}, function(study){
            qm.qmLog.info("Got study " + study.causeVariableName)
            qm.variablesHelper.getFromLocalStorageOrApi({variableName: "Eggs (serving)"}, function(variables){
                if(variables.length > 1){
                    throw "Why did we get " + variables.length + " variables for Eggs (serving)?!?!?"
                }
                var user = qm.getUser()
                qm.qmLog.info("Got variable for user " + variables[0].userId)
                qm.assert.equals(user.id, variables[0].userId, "We should have saved the user variable from the study!")
                done()
            }, function(error){
                throw error
            })
        }, function(error){
            throw error
        })
    })
}).timeout(10000)
describe("Units", function () {
    it('can get units', function(done) {
        var units = qm.unitHelper.getAllUnits()
        qmLog.debug("units:", units)
        qm.assert.greaterThan(5, units.length)
        done()
    })
}).timeout(10000)
describe("URL Helper", function () {
    it('can get query params before hash', function(done) {
        var url = 'https://dev-web.quantimo.do/?clientId=preve-wellness-tracker#/app/onboarding'
        var params = qm.urlHelper.getQueryParams(url)
        qm.assert.equals('preve-wellness-tracker', params.clientId)
        done()
    })
}).timeout(10000)
describe("Users", function () {
    it('can get users', function(done) {
        this.timeout(10000)
        chai.expect(qm.api.getApiUrl()).to.eq("https://app.quantimo.do")
        qm.storage.setItem(qm.items.accessToken, qmTests.getAccessToken())
        qm.userHelper.getUsersFromApi(function(users){
            qmLog.debug("users:", users)
            qm.assert.greaterThan(0, users.length)
            done()
        }, function(error){
            throw error
        })
    })
}).timeout(10000)
describe("Variables", function () {
    it("can search for common variables containing partial string", function (done) {
        this.timeout(30000) // Default 2000 is too fast for Github API
        //qm.qmLog.setLogLevelName("debug");
        var alreadyCalledBack = false
        qm.storage.setItem(qm.items.accessToken, qmTests.getAccessToken())
        qm.userHelper.getUserFromLocalStorageOrApi(function (user) {
            qmLog.debug("User: ", user)
            if(!qm.getUser()){ throw "No user!" }
            var requestParams = {
                excludeLocal: null,
                includePublic: true,
                minimumNumberOfResultsRequiredToAvoidAPIRequest: 20,
                searchPhrase: "car",
            }
            qm.variablesHelper.getFromLocalStorageOrApi(requestParams, function(variables){
                qmLog.info('=== Got ' + variables.length + ' variables matching ' + requestParams.searchPhrase)
                // Why? qm.assert.doesNotHaveUserId(variables);
                qm.assert.variables.descendingOrder(variables, 'lastSelectedAt')
                qm.assert.greaterThan(5, variables.length)
                var variable5 = variables[4]
                var timestamp = qm.timeHelper.getUnixTimestampInSeconds()
                qm.variablesHelper.setLastSelectedAtAndSave(variable5)
                var userVariables = qm.globalHelper.getItem(qm.items.userVariables) || []
                qmLog.info("There are " + userVariables.length + " user variables")
                //qm.assert.isNull(userVariables, qm.items.userVariables);
                qm.variablesHelper.getFromLocalStorageOrApi({id: variable5.id, includePublic: true}, function(variables){
                    // Why? qm.assert.doesNotHaveProperty(variables, 'userId');
                    qm.assert.variables.descendingOrder(variables, 'lastSelectedAt')
                    qm.assert.equals(timestamp, variables[0].lastSelectedAt, 'lastSelectedAt')
                    qm.assert.equals(variable5.name, variables[0].name, 'name')
                    qm.variablesHelper.getFromLocalStorageOrApi(requestParams, function(variables){
                        qm.assert.variables.descendingOrder(variables, 'lastSelectedAt')
                        var variable1 = variables[0]
                        qmLog.info("Variable 1 is " + variable1.name)
                        //qm.assert.equals(variable1.lastSelectedAt, timestamp);
                        //qm.assert.equals(variable1.variableId, variable5.variableId);
                        //qm.assert.equals(1, qm.api.requestLog.length, "We should have made 1 request but have "+ JSON.stringify(qm.api.requestLog));
                        if(done && !alreadyCalledBack){
                            alreadyCalledBack = true
                            done()
                        }
                    })
                }, function(error){
                    qm.qmLog.error(error)
                })
            })
        })
    })
    it('can search manual tracking variables', function(done) {
        qm.storage.setItem(qm.items.accessToken, qmTests.getAccessToken())
        qm.userHelper.getUserFromLocalStorageOrApi(function (user) {
            qmLog.info("Got user " + user.loginName)
            if(!qm.getUser()){ throw "No user!" }
            var requestParams = {
                limit: 100,
                includePublic: true,
                manualTracking: true,
            }
            qm.variablesHelper.getFromLocalStorageOrApi(requestParams, function(variables){
                qmLog.info('Got ' + variables.length + ' variables')
                qm.assert.count(requestParams.limit, variables)
                var manual = variables.filter(function (v) {
                    return v.manualTracking
                })
                qm.assert.count(requestParams.limit, manual)
                qm.assert.variables.descendingOrder(variables, 'lastSelectedAt')
                done()
            })
        })
    })
}).timeout(10000)