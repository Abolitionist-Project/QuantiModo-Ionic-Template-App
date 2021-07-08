import * as api from "../src/api/node"
import * as env from "./env-helper"
import * as fileHelper from "./qm.file-helper"
import * as qmLog from "./qm.log"
import * as timeHelper from "./qm.time-helper"

// tslint:disable-next-line:no-var-requires
const qm = require("../src/js/qmHelpers.js")
function isTruthy(value: any) {return (value && value !== "false")}
function getRequestOptions(path: string) {
    const options = {
        headers: {"User-Agent": "Request-Promise", "Content-Type": "application/json"},
        json: true, // Automatically parses the JSON string in the response
        qs: {
            access_token: env.getAccessToken(),
            allStaticAppData: true,
            clientId: env.getQMClientIdOrException(),
            includeClientSecret: true,
        },
        uri: qm.getAppHostName() + path,
    }
    if(options.qs.access_token) {
        qmLog.info("Using QUANTIMODO_ACCESS_TOKEN: " + options.qs.access_token.substring(0,4)+"...")
    } else {
        qmLog.error("Please add your QUANTIMODO_ACCESS_TOKEN environmental variable from " + env.getAppHostName()
            + "/api/v2/account")
    }
    return options
}

api.AppSettingsService.getAppSettings(env.getQMClientIdOrException(), true)
    .then(function(AppSettingsResponse) {
        qm.staticData = AppSettingsResponse.staticData
        process.env.APP_DISPLAY_NAME = qm.getAppDisplayName()  // Need env for Fastlane
        process.env.APP_IDENTIFIER = qm.getAppIdentifier()  // Need env for Fastlane
        function addBuildInfoToAppSettings() {
            qm.getAppSettings().buildServer = qmLog.getCurrentServerContext()
            qm.getAppSettings().buildLink = qm.buildInfoHelper.getBuildLink()
            qm.getAppSettings().versionNumber = qm.buildInfoHelper.buildInfo.versionNumbers.ionicApp
            qm.getAppSettings().androidVersionCode = qm.buildInfoHelper.buildInfo.versionNumbers.androidVersionCode
            qm.getAppSettings().debugMode = isTruthy(process.env.APP_DEBUG)
            qm.getAppSettings().builtAt = timeHelper.getUnixTimestampInSeconds()
        }

        addBuildInfoToAppSettings()
        qmLog.info("Got app settings for " + qm.getAppDisplayName() + ". You can change your app settings at " +
            getAppEditUrl())
        const url = env.getAppHostName()
        if(url) {
            qm.getAppSettings().apiUrl = url.replace("https://", "")
        }
        return writeStaticDataFile()
})
function getAppEditUrl() {
    return getAppsListUrl() + "?clientId=" + qm.getClientId()
}
function getAppsListUrl() {
    return "https://builder.quantimo.do/#/app/configuration"
}
function getAppDesignerUrl() {
    return "https://builder.quantimo.do/#/app/configuration?clientId=" + qm.getClientId()
}

function writeStaticDataFile() {
    qm.staticData.buildInfo = qm.buildInfoHelper.getCurrentBuildInfo()
    const content = "var staticData = "+ qmLog.prettyJSONStringify(qm.staticData)+
        '; if(typeof window !== "undefined"){window.qm.staticData = staticData;} ' +
        ' else if(typeof qm !== "undefined"){qm.staticData = staticData;} else {module.exports = staticData;} ' +
        'if(typeof qm !== "undefined"){qm.stateNames = staticData.stateNames;}'
    try {
        fileHelper.writeToFile(env.paths.www.appSettings, content)
    } catch(e) {
        qmLog.error(e.message + ".  Maybe www/data doesn't exist but it might be resolved when we copy from src")
    }
    try {
        fileHelper.writeToFile("build/chrome_extension/data/appSettings.js", content)
    } catch(e) {
        qmLog.error(e.message + ".  Maybe build/chrome_extension/data doesn't exist but it might be resolved when we copy from src")
    }
    return fileHelper.writeToFile(env.paths.src.appSettings, content)
}
