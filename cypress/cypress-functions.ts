// @ts-ignore
import repoPath from "app-root-path"
import * as cypress from "cypress"
import {slackRunner} from "cypress-slack-reporter/bin/slack/slack-alert.js"
import * as fs from "fs"
// @ts-ignore
import {merge} from "mochawesome-merge"
// @ts-ignore
import marge from "mochawesome-report-generator"
import * as Q from "q"
// @ts-ignore
import rimraf from "rimraf"
import {loadEnv} from "../ts/env-helper"
import * as fileHelper from "../ts/qm.file-helper"
// require hack
declare function require(path: string): any
// require untyped library file
// tslint:disable-next-line:no-var-requires
const qm = require("../src/js/qmHelpers.js")
import * as qmGit from "../ts/qm.git"
import * as qmLog from "../ts/qm.log"
import {createSuccessFile, deleteEnvFile, deleteSuccessFile, getBuildLink, getCiProvider} from "../ts/test-helpers"

// https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
// loadEnv(".env.local")
const ciProvider = getCiProvider()
const isWin = process.platform === "win32"
const outputReportDir = repoPath + "/cypress/reports/mocha"
const screenshotDirectory = outputReportDir + `/assets`
const unmerged = repoPath + "/cypress/reports/mocha"
const vcsProvider = "github"
const verbose = true
const videoDirectory = `${repoPath}/cypress/videos`
const mergedJsonPath = outputReportDir + "/mochawesome.json"
const lastFailedCypressTestPath = "last-failed-cypress-test"
const cypressJson = fileHelper.getAbsolutePath("cypress.json")
const releaseStage = process.env.RELEASE_STAGE || "production"
const envPath = fileHelper.getAbsolutePath(`cypress/config/cypress.${releaseStage}.json`)
const s3Bucket = "qmimages"
const paths = {
    reports: {
        junit: "./cypress/reports/junit",
        mocha: "./cypress/reports/mocha",
    },
}
function getReportUrl() {
    const url = process.env.JOB_URL
    if (url && url.indexOf("DEPLOY-") === 0) {
        return url + "ws/tmp/quantimodo-sdk-javascript/mochawesome-report/mochawesome.html"
    }
    return getBuildLink()
}
export function mochawesome(failedTests: any[], cb: (err: any) => void) {
    const abs = fileHelper.getAbsolutePath(unmerged)
    console.log("Merging reports in " + abs)
    merge({
        inline: true,
        reportDir: abs,
        saveJson: true,
    }).then((mergedJson: any) => {
        fs.writeFileSync(mergedJsonPath, JSON.stringify(mergedJson, null, 2))
        // console.log("Generating report from " + unmerged + " and outputting at " + outputReportDir)
        return marge.create(mergedJson, {
            // cdn: true,
            autoOpen: isWin,
            charts: true,
            inline: true,
            overwrite: true,
            reportDir: outputReportDir,
            saveJson: true,
            showPassed: true,
        })
    }).then((generatedReport: any[]) => {
        console.log("Merged report available here:-", generatedReport[0])
        // tslint:disable-next-line: no-console
        console.log("Constructing Slack message with the following options", {
            ciProvider,
            outputReportDir,
            screenshotDirectory,
            vcsProvider,
            verbose,
            videoDirectory,
        })
        try {
            // @ts-ignore
            // noinspection JSUnusedLocalSymbols
            if (!process.env.SLACK_WEBHOOK_URL) {
                console.error("env SLACK_WEBHOOK_URL not set!")
            } else {
                // @ts-ignore
                slackRunner(
                    ciProvider,
                    vcsProvider,
                    outputReportDir,
                    videoDirectory,
                    screenshotDirectory,
                    verbose,
                )
                // tslint:disable-next-line: no-console
                // console.log("Finished slack upload")
            }
        } catch (error) {
            console.error(error)
        }
        cb(generatedReport[0])
    })
}
function copyCypressEnvConfigIfNecessary() {
    console.info(`Copying ${envPath} to cypress.json`)
    try {
        fs.unlinkSync(cypressJson)
    } catch(err) {
        console.log(err)
    }
    fs.copyFileSync(envPath, cypressJson)
    let cypressJsonString = fs.readFileSync(cypressJson).toString()
    let cypressJsonObject: null
    try {
        cypressJsonObject = JSON.parse(cypressJsonString)
    } catch (e) {
        console.error("Could not parse  "+cypressJson+" because "+e.message+"! Here's the string "+cypressJsonString)
        const fixed = cypressJsonString.replace("}\n}", "}")
        console.error("Going to try replacing extra bracket. Here's the fixed version "+fixed)
        fs.writeFileSync(cypressJson, fixed)
        cypressJsonString = fs.readFileSync(cypressJson).toString()
        cypressJsonObject = JSON.parse(cypressJsonString)
    }
    if(!cypressJsonObject) {
        const before = fs.readFileSync(envPath).toString()
        throw Error(`Could not parse ${cypressJson} after copy! ${envPath} is ${before}`)
    }
    console.info("Cypress Configuration: " + cypressJsonString)
}
function setGithubStatusAndUploadTestResults(failedTests: any[], context: string, cb: (err: any) => void) {
    const test = failedTests[0];
    const failedTestTitle = failedTests[0].title[1]
    const errorMessage = test.displayError
    if(!failedTests[0].displayError || failedTests[0].displayError === "undefined"){
        qmLog.le("No displayError on failedTests[0]: ", failedTests[0])
    }
    qmGit.setGithubStatus("failure", context, failedTestTitle + " err: " +
        failedTests[0].error, getReportUrl(), function() {
        uploadMochawesome().then(function(urls) {
            console.error(errorMessage)
            cb(errorMessage)
            // resolve();
        })
    })
}
function deleteJUnitTestResults() {
    const jUnitFiles = paths.reports.junit + "/*.xml"
    rimraf(jUnitFiles, function() {
        console.debug(`Deleted ${jUnitFiles}`)
    })
}

function logFailedTests(failedTests: any[], context: string, cb: (err: any) => void) {
    // tslint:disable-next-line:prefer-for-of
    for (let j = 0; j < failedTests.length; j++) {
        const test = failedTests[j]
        const testName = test.title[1]
        let errorMessage = test.error || test.message || test.displayError
        if(!errorMessage) {
            errorMessage = JSON.stringify(test)
            console.error("no test.error or test.message or test.displayError property in "+errorMessage)
        }
        console.error("==============================================")
        console.error(testName + " FAILED")
        console.error(errorMessage)
        console.error("==============================================")
    }
    deleteSuccessFile().then(function() {
        mochawesome(failedTests, function() {
            setGithubStatusAndUploadTestResults(failedTests, context, cb)
        })
    })
}

export function runWithRecording(specName: string, cb: (err: any) => void) {
    const specsPath = getSpecsPath()
    const specPath = specsPath + "/" + specName
    const browser = process.env.CYPRESS_BROWSER || "electron"
    const context = specName.replace("_spec.js", "") + "-" + releaseStage
    console.info("Re-running " + specName + " with recording so you can check it at https://dashboard.cypress.io/")
    cypress.run({
        browser,
        record: true,
        spec: specPath,
    }).then((recordingResults) => {
        let runUrl: string | undefined = "No runUrl provided so just go to https://dashboard.cypress.io/"
        if ("runUrl" in recordingResults) {
            runUrl = recordingResults.runUrl
        }
        uploadCypressVideo(specName)
            .then(function(s3Url) {
                const url: any = s3Url || getBuildLink() || runUrl
                qmGit.setGithubStatus("error", context, "View recording of "+specName,
                    url, function() {
                        qmGit.createCommitComment(context, "\nView recording of "+specName+"\n"+
                            "[Cypress Dashboard]("+runUrl+") or [Build Log]("+getBuildLink()+") or [S3]("+s3Url+")",
                            function() {
                            cb(recordingResults)
                        })
                })
        })
    })
}

function getFailedTestsFromResults(results: any) {
    if(!results.runs) {
        console.error("No runs on results obj: ", results)
    }
    const tests = results.runs[0].tests
    let failedTests: any[] = []
    if (tests) {
        failedTests = tests.filter(function(test: { state: string; }) {
            return test.state === "failed"
        })
        if (!failedTests) {
            failedTests = []
        }
    } else {
        console.error("No tests on ", results.runs[0])
    }
    return failedTests
}

function handleTestSuccess(results: any, context: string, cb: (err: any) => void) {
    deleteLastFailedCypressTest()
    console.info(results.totalPassed + " tests PASSED!")
    qmGit.setGithubStatus("success", context, results.totalPassed + " tests passed", null,function() {
        createSuccessFile()
            .then(function() {
                cb(false)
            })
    })
}

export function runOneCypressSpec(specName: string, cb: ((err: any) => void)) {
    uploadLastFailed(specName)  // Set last failed first so it exists if we have an exception
    const specsPath = getSpecsPath()
    const specPath = specsPath + "/" + specName
    const browser = process.env.CYPRESS_BROWSER || "electron"
    const context = specName.replace("_spec.js", "") + "-" + releaseStage
    qmGit.setGithubStatus("pending", context, `Running ${context} Cypress tests...`)
    // noinspection JSUnresolvedFunction
    cypress.run({
        browser,
        record: true,
        spec: "cypress/integration/"+specName,
    }).then((results) => {
        // @ts-ignore
        if (!results.runs || !results.runs[0]) {
            console.log("No runs property on " + JSON.stringify(results, null, 2))
            cb(false)
        } else {
            const failedTests = getFailedTestsFromResults(results)
            if (failedTests.length) {
                process.env.LOGROCKET = "1"
                fileHelper.uploadToS3InSubFolderWithCurrentDateTime(getVideoPath(specName), "cypress")
                    .then( function(url) {
                        runWithRecording(specName, function(recordResults) {
                            const failedRecordedTests = getFailedTestsFromResults(recordResults)
                            if (failedRecordedTests.length) {
                                logFailedTests(failedRecordedTests, context, function(errorMessage) {
                                    cb(errorMessage)
                                    process.exit(1)
                                })
                            } else {
                                delete process.env.LOGROCKET
                                handleTestSuccess(results, context, cb)
                            }
                        })
                    })
            } else {
                handleTestSuccess(results, context, cb)
            }
        }
    }).catch((runtimeError: any) => {
        qmGit.setGithubStatus("error", context, runtimeError, getReportUrl(), function() {
            console.error(runtimeError)
            process.exit(1)
        })
        qmLog.logEndOfProcess(specPath)
    })
}

export function getVideoPath(specName: string) {
    return "cypress/videos/"+specName+".mp4"
}

export function uploadCypressVideo(specName: string) {
    return fileHelper.uploadToS3InSubFolderWithCurrentDateTime(getVideoPath(specName), "cypress")
}

export function uploadLastFailed(specName: string, cb?: (url: string) => void) {
    fs.writeFileSync(lastFailedCypressTestPath, specName)
    return fileHelper.uploadToS3(lastFailedCypressTestPath, "cypress/"+lastFailedCypressTestPath, "qmimages")
}

export function downloadLastFailed() {
    return fileHelper.downloadFromS3(lastFailedCypressTestPath, "cypress"+"/"+lastFailedCypressTestPath, s3Bucket)
}

function getSpecsPath() {
    return repoPath + "/cypress/integration"
}

export function runCypressTestsInParallel(cb?: (err: any) => void) {
    qmLog.logStartOfProcess("runCypressTestsInParallel")
    deleteSuccessFile()
    try {
        copyCypressEnvConfigIfNecessary()
    } catch (e) {
        console.error(e.message+"!  Going to try again...")
        copyCypressEnvConfigIfNecessary()
    }
    deleteJUnitTestResults()
    rimraf(paths.reports.mocha + "/*.json", function() {
        const specsPath = getSpecsPath()
        fs.readdir(specsPath, function(err: any, specFileNames: string[]) {
            if (!specFileNames) {
                throw new Error("No specFileNames in " + specsPath)
            }
            const promises = []
            for (const specName of specFileNames) {
                if (releaseStage === "ionic" && specName.indexOf("ionic_") === -1) {
                    console.debug("skipping " + specName + " because it doesn't test ionic app and release stage is "+
                        releaseStage)
                    continue
                }
                promises.push(new Promise((resolve) => {
                    runOneCypressSpec(specName,function() {
                        resolve()
                    })
                }))
            }
            Promise.all(promises).then((values) => {
                console.log(values)
                createSuccessFile()
                    .then(function() {
                        deleteEnvFile()
                        if (cb) {
                            cb(false)
                        }
                        qmLog.logEndOfProcess("runCypressTestsInParallel")
                })
            })
        })
    })
}

function moveToFront(specFileNames: string[], first: string) {
    specFileNames.sort(function (x, y) {
        return x == first ? -1 : y == first ? 1 : 0;
    });
}

export function runCypressTests(cb?: (err: any) => void) {
    qmLog.logStartOfProcess("runCypressTests")
    deleteSuccessFile()
    try {
        copyCypressEnvConfigIfNecessary()
    } catch (e) {
        console.error(e.message+"!  Going to try again...")
        copyCypressEnvConfigIfNecessary()
    }
    deleteJUnitTestResults()
    rimraf(paths.reports.mocha + "/*.json", function() {
        const specsPath = getSpecsPath()
        fs.readdir(specsPath, function(err: any, specFileNames: string[]) {
            if (!specFileNames) {
                throw new Error("No specFileNames in " + specsPath)
            }
            moveToFront(specFileNames, "ionic_measurements_spec.js") // Fails a lot
            moveToFront(specFileNames, "ionic_variables_spec.js") // Fails a lot
            for (let i = 0, p = Promise.resolve(); i < specFileNames.length; i++) {
                const specName = specFileNames[i]
                if (releaseStage === "ionic" && specName.indexOf("ionic_") === -1) {
                    console.debug("skipping " + specName + " because it doesn't test ionic app and release stage is "+
                        releaseStage)
                    continue
                }
                p = p.then((_) => new Promise((resolve) => {
                    runOneCypressSpec(specName,function() {
                        if (i === specFileNames.length - 1) {
                            createSuccessFile()
                                .then(function() {
                                    deleteEnvFile()
                                    if (cb) {
                                        cb(false)
                                    }
                                })
                        }
                        qmLog.logEndOfProcess("runCypressTests")
                        resolve()
                    })
                }))
            }
        })
    })
}
function getLastFailedCypressTest() {
    const deferred = Q.defer()
    try {
        downloadLastFailed()
            .then(function(absPath) {
                if(!absPath) {
                    deferred.resolve(null)
                    return
                }
                try {
                    // @ts-ignore
                    const spec = fs.readFileSync(absPath, "utf8")
                    deferred.resolve(spec)
                } catch (error) {
                    deferred.resolve(null)
                }
            })
    } catch (error) {
        qmLog.error(error)
        deferred.resolve(null)
    }
    return deferred.promise
}
function deleteLastFailedCypressTest() {
    // tslint:disable-next-line:no-empty
    try {
        fs.unlinkSync(lastFailedCypressTestPath)
    } catch (err) {
        console.debug("No last-failed-cypress-test file to delete")
    }
}
// tslint:disable-next-line:unified-signatures
export function runLastFailedCypressTest(cb: (err: any) => void) {
    qmLog.logStartOfProcess("runLastFailedCypressTest")
    getLastFailedCypressTest()
        .then(function(name) {
            if (!name) {
                console.info("No previously failed test!")
                cb(false)
                return
            }
            deleteSuccessFile()
            try {
                copyCypressEnvConfigIfNecessary()
            } catch (e) {
                console.error(e.message+"!  Going to try again...")
                copyCypressEnvConfigIfNecessary()
            }
            // @ts-ignore
            runOneCypressSpec(name, cb)
        })
}
export function uploadMochawesome() {
    const s3Key = "mochawesome/" + qmGit.getCurrentGitCommitSha()
    return fileHelper.uploadFolderToS3(outputReportDir, s3Key, s3Bucket,
        "public-read")
}
