/* eslint-disable no-process-env,object-shorthand,semi,block-spacing,comma-dangle,one-var,space-infix-ops,no-unused-vars,no-multi-spaces,no-useless-concat,no-empty */
const {missingRequiredParameter}  = require("./ts/qm.log");
const {readJsonFile}  = require("./ts/qm.file-helper");
const {loadEnv} = require("./ts/env-helper");
const {envs} = require("./ts/env-helper");
const {paths} = require("./ts/env-helper");
const {qmPlatform} = require("./ts/env-helper");
const {getenvOrException} = require("./ts/env-helper");
var qmLog = require("./ts/qm.log");
var pump = require('pump');
const {getQMClientIdOrException} = require("./ts/env-helper");
try{
    loadEnv(".env")
} catch (e) {
    qmLog.info(e.message);
}
var QUANTIMODO_CLIENT_ID = getQMClientIdOrException()
var devCredentials;
var androidArm7DebugApkName = 'android-armv7-debug';
var androidX86DebugApkName = 'android-x86-debug';
var androidArm7ReleaseApkName = 'android-armv7-release';
var androidX86ReleaseApkName = 'android-x86-release';
/** @namespace process.env.DEBUG_BUILD */
/** @namespace process.env.BUILD_DEBUG */
/** @namespace process.env.DO_NOT_MINIFY */
function isTruthy(value) {return (value && value !== "false");}
//var buildPath = './build';  Can't use . because => Updated .......  app_uploads/quantimodo/./build/quantimodo-chrome-extension.zip
var buildPath = 'build';
var circleCIPathToRepo = '~/quantimodo-android-chrome-ios-web-app';
var chromeExtensionBuildPath = buildPath + '/chrome_extension';
// Setup platforms to build that are supported on current hardware
// See https://taco.visualstudio.com/en-us/docs/tutorial-gulp-readme/
//var winPlatforms = ["android", "windows"], //Android is having problems so I'm only building windows for now
var winPlatforms = ['windows'],
    linuxPlatforms = ['android'],
    osxPlatforms = ['ios'],
    platformsToBuild = process.platform === 'darwin' ? osxPlatforms :
        (process.platform === 'linux' ? linuxPlatforms : winPlatforms),
    // Build config to use for build - Use Pascal case to match paths set by VS
    buildConfig = 'Release',
    // Arguments for build by platform. Warning: Omit the extra "--" when referencing platform
    // specific options (Ex:"-- --gradleArg" is "--gradleArg").
    buildArgs = {
        android: ['--' + buildConfig.toLocaleLowerCase(), '--device', '--gradleArg=--no-daemon'],
        ios: ['--' + buildConfig.toLocaleLowerCase(), '--device'],
        windows: ['--' + buildConfig.toLocaleLowerCase(), '--device']
    },
    // Paths used by build
    buildPaths = {
        tsconfig: 'scripts/tsconfig.json',
        ts: './scripts/**/*.ts',
        apk: ['./platforms/android/ant-build/*.apk',
            './platforms/android/bin/*.apk',
            './platforms/android/build/outputs/apk/*.apk'],
        binApk: './bin/Android/' + buildConfig,
        ipa: ['./platforms/ios/build/device/*.ipa',
            './platforms/ios/build/device/*.app.dSYM'],
        binIpa: './bin/iOS/' + buildConfig,
        appx: './platforms/windows/AppPackages/**/*',
        binAppx: './bin/Windows/' + buildConfig
    };
var appIds = {
    'moodimodo': 'homaagppbekhjkalcndpojiagijaiefm',
    'mindfirst': 'jeadacoeabffebaeikfdpjgpjbjinobl',
    'energymodo': 'aibgaobhplpnjmcnnmdamabfjnbgflob',
    'quantimodo': true,
    'medimodo': true
};
var argv = require('yargs').argv;
var defaultRequestOptions = {strictSSL: false};
var fs = require('fs');
var gulp = require('gulp');
var q = require('q');
var replace = require('gulp-string-replace');
var runSequence = require('run-sequence');
var AWS_ACCESS_KEY_ID = process.env.QM_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID; // Netlify has their own
var AWS_SECRET_ACCESS_KEY = process.env.QM_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY; // Netlify has their own
var s3Options = {accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY};
var qmGit = {
    branchName: null,
    getBranchName: function(){
        if(qmGit.branchName){return qmGit.branchName;}
        qmLog.info("Branch name not set!");
        return null;
    },
    isMaster: function () {
        if(!qmGit.getBranchName()){throw "Branch name not set!";}
        return qmGit.getBranchName() === "master";
    },
    isDevelop: function () {
        if(!qmGit.getBranchName()){throw "Branch name not set!";}
        return qmGit.getBranchName() === "develop";
    },
    isFeature: function () {
        return qmGit.getBranchName().indexOf("feature") !== -1;
    },
    getCurrentGitCommitSha: function () {
        if(process.env.SOURCE_VERSION){return process.env.SOURCE_VERSION;}
        try {
            return require('child_process').execSync('git rev-parse HEAD').toString().trim();
        } catch (error) {
            qmLog.info(error);
        }
    },
    accessToken: process.env.GITHUB_ACCESS_TOKEN,
    getCommitMessage: function(callback){
        if(process.env.BUILDPACK_LOG_FILE){
            qmLog.info("Can't get commit on Heroku");
            callback("Can't get commit on Heroku");
            return;
        }
        var commandForGit = 'git log -1 HEAD --pretty=format:%s';
        execute(commandForGit, function (error, output) {
            var commitMessage = output.trim();
            qmLog.info("Commit: "+ commitMessage);
            if(callback) {callback(commitMessage);}
        });
    },
    outputCommitMessageAndBranch: function () {
        qmGit.getCommitMessage(function (commitMessage) {
            qmGit.setBranchName(function () {
                qmLog.info("===== Building " + commitMessage + " on "+ qmGit.getBranchName() + " =====");
            });
        });
    },
    setBranchName: function (callback) {
        if(qmGit.branchName){
            qmLog.info("branchName already set to "+qmGit.branchName);
            if (callback) {callback();}
            return;
        }
        var git = require('gulp-git');
        function setBranch(branch, callback) {
            qmGit.branchName = branch.replace('origin/', '');
            qmLog.info('current git branch: ' + qmGit.branchName);
            if (callback) {callback();}
        }
        if (qmGit.getBranchEnv()){
            setBranch(qmGit.getBranchEnv(), callback);
            return;
        }
        if(process.env.BUILDPACK_LOG_FILE){
            console.info("Setting branch to FEATURE because on Heroku and we can't access git repo data");
            setBranch("feature", callback);
            return;
        }
        try {
            git.revParse({args: '--abbrev-ref HEAD'}, function (err, branch) {
                if(err){qmLog.error(err); return;}
                setBranch(branch, callback);
            });
        } catch (e) {
            qmLog.info("Could not set branch name because " + e.message);
        }
    },
    getBranchEnv: function () {
        function getNameIfNotHead(envName) {
            if(process.env[envName] && process.env[envName].indexOf("HEAD") === -1){return process.env[envName];}
            return false;
        }
        if(getNameIfNotHead('CIRCLE_BRANCH')){return process.env.CIRCLE_BRANCH;}
        if(getNameIfNotHead('BUDDYBUILD_BRANCH')){return process.env.BUDDYBUILD_BRANCH;}
        if(getNameIfNotHead('TRAVIS_BRANCH')){return process.env.TRAVIS_BRANCH;}
        if(getNameIfNotHead('GIT_BRANCH')){return process.env.GIT_BRANCH;}
    }
};
qmGit.setBranchName();
var majorMinorVersionNumbers = '2.10.';
if(argv.clientSecret){process.env.QUANTIMODO_CLIENT_SECRET = argv.clientSecret;}
process.env.npm_package_licenseText = null; // Pollutes logs
qmLog.debug("Environmental Variables", process.env, 50000);
var qmGulp = {
    chcp: {
        enabled: false,
        loginAndBuild: function(callback){
            /** @namespace qm.getAppSettings().additionalSettings.appIds.appleId */
            qmGulp.staticData.chcp = {
                "name": qmGulp.getAppDisplayName(),
                "s3bucket": qmGulp.chcp.getS3Bucket(),
                "s3region": "us-east-1",
                "s3prefix": qmGulp.chcp.getS3Prefix()+'/',
                "ios_identifier": qmGulp.getAppIds().appleId,
                "android_identifier": qmGulp.getAppIdentifier(),
                "update": "start",
                "content_url": qmGulp.chcp.getContentUrl()+'/'
            };
            writeToFileWithCallback('cordova-hcp.json', qmLog.prettyJSONStringify(qmGulp.staticData.chcp), function(err){
                if(err) {return qmLog.error(err);}
                var chcpBuildOptions = {
                    "dev": {"config-file": qmGulp.chcp.getChcpJsonUrl("dev")},
                    "production": {"config-file": qmGulp.chcp.getChcpJsonUrl("production")},
                    "QA": {"config-file": qmGulp.chcp.getChcpJsonUrl("qa")}
                };
                return writeToFileWithCallback('chcpbuild.options', qmLog.prettyJSONStringify(chcpBuildOptions), function(err){
                    if(err) {return qmLog.error(err);}
                    qmGulp.chcp.chcpLogin(function(err){
                        if(err) {return qmLog.error(err);}
                        qmGulp.chcp.outputCordovaHcpJson();
                        execute("cordova-hcp build", callback);
                    });
                });
            });
        },
        outputCordovaHcpJson: function() {
            outputFileContents('cordova-hcp.json');
        },
        chcpLogin: function (callback){
            if(!checkAwsEnvs()){throw "Cannot upload to S3. Please set environmental variable AWS_SECRET_ACCESS_KEY";}
            var string = '{"key": "' + AWS_ACCESS_KEY_ID + ' ", "secret": "' + AWS_SECRET_ACCESS_KEY +'"}';
            return writeToFileWithCallback(paths.chcpLogin, string, callback);
        },
        getS3HostName: function(){
            return "https://"+qmGulp.chcp.getS3Bucket()+".s3.amazonaws.com/";
        },
        getContentUrl: function(releaseStage){
            var url;
            if(releaseStage){
                url = qmGulp.chcp.getS3HostName() + qmGulp.chcp.getAppPath() + "/" + releaseStage;
            } else {
                url = qmGulp.chcp.getS3HostName() + qmGulp.chcp.getS3Prefix();
            }
            qmLog.info("ContentUrl is " + url);
            return url;
        },
        getChcpJsonUrl: function(releaseStage){
            return qmGulp.chcp.getContentUrl(releaseStage)+"/chcp.json";
        },
        releaseStagePath: null,
        getReleaseStagePath: function () {
            if(qmGulp.chcp.releaseStagePath){return qmGulp.chcp.releaseStagePath;}
            var path = "dev";
            if(qmGit.getBranchName() && qmGit.isMaster()){path = "production";}
            if(qmGit.getBranchName() && qmGit.isDevelop()){path = "qa";}
            if(qmGulp.buildSettings.buildDebug()){
                qmLog.info("qmGulp.buildSettings.buildDebug returns true so using ReleaseStagePath dev");
                path = "dev";
            }
            qmLog.info("CHCP ReleaseStagePath: " + path);
            return path;
        },
        appPath: null,
        getAppPath: function(){
            if(qmGulp.chcp.appPath){return qmGulp.chcp.appPath;}
            return qmGulp.getClientIdFromStaticData();
        },
        getS3Prefix: function(){
            return qmGulp.chcp.getAppPath() + "/"+qmGulp.chcp.getReleaseStagePath();
        },
        getS3Bucket: function(){
            if(process.env.PWD && process.env.PWD.indexOf('workspace/DEPLOY-staging') !== -1){return "qm-staging.quantimo.do";}
            if(process.env.PWD && process.env.PWD.indexOf('workspace/DEPLOY-production') !== -1){return "quantimodo.quantimo.do";}
            return "qm-cordova-hot-code-push";
        },
        chcpCleanConfigFiles: function(){
            return cleanFiles([
                '.chcpenv',
                'chcpbuild.options',
                'cordova-hcp.json',
                'src/chcp.json',
                'src/chcp.manifest',
                'www/chcp.json',
                paths.chcpLogin
            ]);
        }
    },
    client: {
        getClientId: function () {
            if(QUANTIMODO_CLIENT_ID){return QUANTIMODO_CLIENT_ID;}
            return null;
        },
        setClientId: function(clientId){
            QUANTIMODO_CLIENT_ID = clientId;
        },
        clientIds: {
            medimodo: 'medimodo',
            quantimodo: 'quantimodo'
        }
    },
    buildSettings: {
        doNotMinify: null,
        weShouldMinify: function(){
            if(qmPlatform.buildingFor.android()){return false;}
            //if(!qmPlatform.buildingFor.web()){return false;}  We need to minify on mobile or the app contains huge lib folder and CHCP sync is slow!
            if(qmGulp.buildSettings.doNotMinify !== null){return !!qmGulp.buildSettings.doNotMinify;}
            if(typeof process.env.MINIFY !== "undefined"){return isTruthy(process.env.MINIFY);}
            if(isTruthy(process.env.DO_NOT_MINIFY)){return false;}
            if(qmGulp.buildSettings.buildDebug()){
                qmLog.info("Copying src instead of minifying because qm.buildSettings.buildDebug returns true");
                return false;
            }
            return true;
        },
        buildDebug: function () {
            if(isTruthy(process.env.BUILD_ANDROID_RELEASE)){return false;}
            if(isTruthy(process.env.BUILD_DEBUG) || isTruthy(process.env.DEBUG_BUILD)){
                qmLog.info("BUILD_DEBUG or DEBUG_BUILD is true");
                return true;
            }
            if(qmPlatform.buildingFor.chrome()){return false;}  // Otherwise we don't minify and extension is huge
            // Always building debug when not on master causes unexpected results.  Just use BUILD_DEBUG env if necessary
            //if(!qmGit.isMaster()){ qmLog.info("Not on master so buildDebug is true"); return true; }
            return false;
        }
    },
    buildInfoHelper: {
        alreadyMinified: function(){
            try {
                var files = fs.readdirSync(paths.www.scripts);
                if (!files.length) {
                    qmLog.info("Scripts folder is empty so we need to minify");
                    return false;
                }
            } catch (e) {
                qmLog.info("No scripts folder so we need to minify");
                return false;
            }
            var previousSha = qmGulp.buildInfoHelper.getPreviousBuildSha();
            if(!previousSha){
                qmLog.error("Could not get previous git commit SHA!");
                return false;
            }
            var currentSha = qmGit.getCurrentGitCommitSha();
            if(!currentSha){
                qmLog.error("Could not get current git commit SHA!");
                return false;
            }
            var alreadyMinified = previousSha === currentSha;
            if(!alreadyMinified){
                qmLog.info("current sha " + currentSha + " and previous commit SHA " + previousSha +
                    " don't match so we need to minify again");
            } else {
                qmLog.info("No need to minify again because current sha " + currentSha + " and previous commit SHA " +
                    previousSha + " match");
            }
            return alreadyMinified;
        },
        buildInfo: {
            iosCFBundleVersion: null,
            builtAt: null,
            buildServer: null,
            buildLink: null,
            versionNumber: null,
            versionNumbers: {},
            gitBranch: null,
            gitCommitShaHash: null
        },
        getPreviousBuildSha: function(){
            var previousBuildInfo = qmGulp.buildInfoHelper.getPreviousBuildInfo();
            if(!previousBuildInfo){return false;}
            return previousBuildInfo.gitCommitShaHash;
        },
        getCurrentBuildInfo: function () {
            qmGulp.buildInfoHelper.currentBuildInfo = {
                iosCFBundleVersion: qmGulp.buildInfoHelper.buildInfo.versionNumbers.iosCFBundleVersion,
                builtAt: timeHelper.getUnixTimestampInSeconds(),
                builtAtString:  new Date().toISOString(),
                buildServer: qmLog.getCurrentServerContext(),
                buildLink: qmGulp.buildInfoHelper.getBuildLink(),
                versionNumber: qmGulp.buildInfoHelper.buildInfo.versionNumbers.ionicApp,
                versionNumbers: qmGulp.buildInfoHelper.buildInfo.versionNumbers,
                gitBranch: qmGit.getBranchName(),
                gitCommitShaHash: qmGit.getCurrentGitCommitSha()
            };
            return qmGulp.buildInfoHelper.currentBuildInfo;
        },
        getPreviousBuildInfo: function () {
            var previousBuildInfo = readJsonFile(paths.src.buildInfo);
            if(!previousBuildInfo){
                qmLog.info("No previous BuildInfo file at "+paths.src.buildInfo);
                qmGulp.buildInfoHelper.previousBuildInfo = false;
            } else {
                qmGulp.buildInfoHelper.previousBuildInfo = previousBuildInfo;
            }
            return qmGulp.buildInfoHelper.previousBuildInfo;
        },
        previousBuildInfo: null,
        writeCommitSha: function () {
            writeToFile('www/data/commits/'+qmGit.getCurrentGitCommitSha(), qmGit.getCurrentGitCommitSha());
            writeToFile('src/data/commits/'+qmGit.getCurrentGitCommitSha(), qmGit.getCurrentGitCommitSha());
        },
        getBuildLink: function() {
            if(process.env.BUDDYBUILD_APP_ID){return "https://dashboard.buddybuild.com/apps/" + process.env.BUDDYBUILD_APP_ID + "/build/" + process.env.BUDDYBUILD_APP_ID;}
            if(process.env.CIRCLE_BUILD_NUM){return "https://circleci.com/gh/QuantiModo/quantimodo-android-chrome-ios-web-app/" + process.env.CIRCLE_BUILD_NUM;}
            if(process.env.TRAVIS_BUILD_ID){return "https://travis-ci.org/" + process.env.TRAVIS_REPO_SLUG + "/builds/" + process.env.TRAVIS_BUILD_ID;}
        },
        setVersionNumbers: function(){
            var date = new Date();
            function getPatchVersionNumber() {
                var monthNumber = (date.getMonth() + 1).toString();
                var dayOfMonth = ('0' + date.getDate()).slice(-2);
                return monthNumber + dayOfMonth;
            }
            function getIosMinorVersionNumber() {
                return (getMinutesSinceMidnight()).toString();
            }
            function getMinutesSinceMidnight() {
                return date.getHours() * 60 + date.getMinutes();
            }
            function getAndroidMinorVersionNumber() {
                var number = getMinutesSinceMidnight() * 99 / 1440;
                number = Math.round(number);
                number = appendLeadingZero(number);
                return number;
            }
            function appendLeadingZero(integer) {return ('0' + integer).slice(-2);}
            function getLongDateFormat(){return date.getFullYear().toString() + appendLeadingZero(date.getMonth() + 1) + appendLeadingZero(date.getDate());}
            qmGulp.buildInfoHelper.buildInfo.versionNumbers = {
                iosCFBundleVersion: majorMinorVersionNumbers + getPatchVersionNumber() + '.' + getIosMinorVersionNumber(),
                //androidVersionCodes: {armV7: getLongDateFormat() + appendLeadingZero(date.getHours()), x86: getLongDateFormat() + appendLeadingZero(date.getHours() + 1)},
                androidVersionCode: getLongDateFormat() + getAndroidMinorVersionNumber(),
                ionicApp: majorMinorVersionNumbers + getPatchVersionNumber()
            };
            qmGulp.buildInfoHelper.buildInfo.versionNumbers.buildVersionNumber = qmGulp.buildInfoHelper.buildInfo.versionNumbers.androidVersionCode;
            qmLog.info(JSON.stringify(qmGulp.buildInfoHelper.buildInfo.versionNumbers));
        }
    },
    getAdditionalSettings: function(){
        return qmGulp.staticData.appSettings.additionalSettings;
    },
    getAppDisplayName: function(){
        if (!qmGulp.staticData.appSettings.appDisplayName) { throw 'Please export appSettings.appDisplayName';}
        return qmGulp.staticData.appSettings.appDisplayName;
    },
    getAppHostName: function(){
        if(process.env.APP_HOST_NAME){return process.env.APP_HOST_NAME;}
        // We can set utopia as env or in the app when necessary because always using it in build process on develop causes too many problems
        //if(qmGulp.buildSettings.buildDebug()){return "https://utopia.quantimo.do";}
        return "https://app.quantimo.do";
    },
    getAppIds: function(){
        return qmGulp.getAdditionalSettings().appIds;
    },
    getAppIdentifier: function(){
        return qmGulp.getAppIds().appIdentifier;
    },
    getAppStatus: function(){
        return qmGulp.staticData.appSettings.appStatus;
    },
    getAppSettings: function(){
        return qmGulp.staticData.appSettings;
    },
    getBuildStatus: function(){
        return qmGulp.staticData.appSettings.appStatus.buildStatus;
    },
    getClientIdFromStaticData: function(){
        return qmGulp.staticData.appSettings.clientId;
    },
    getMonetizationSettings: function(){
        return qmGulp.staticData.appSettings.additionalSettings.monetizationSettings;
    },
    releaseService: {
        getReleaseStage: function () {
            if(!process.env.RELEASE_STAGE){
                qmLog.info("No RELEASE_STAGE set!  Assuming development");
                return 'development';
            }
            return process.env.RELEASE_STAGE;
        },
        isDevelopment: function () {
            return qmGulp.releaseService.getReleaseStage() === 'development';
        },
        isStaging: function () {
            return qmGulp.releaseService.getReleaseStage() === 'staging';
        },
        isProduction: function () {
            return qmGulp.releaseService.getReleaseStage() === 'production';
        },
        getReleaseStageSubDomain: function(){
            if(qmGulp.releaseService.isStaging()){return "staging-web";}
            if(qmGulp.releaseService.isProduction()){return "web";}
            qmLog.error("No RELEASE_STAGE set!  Assuming GHPagesSubDomain qm-dev");
            return "qm-dev";
        }
    },
    //server: {isHeroku: function(){return process.env.BUILDPACK_LOG_FILE !== null;}},  Not sure why this breaks gulp?
    staticData: {
        commonVariables: null,
        units: null,
        variableCategories: null,
        connectors: null,
        docs: null,
        appSettings: null,
        privateConfig: null,
        chcp: null,
        buildInfo: null,
        configXml: null,
        chromeExtensionManifest: null
    },
    createStatusToCommit: function(statusOptions, callback){
        var github = require('gulp-github');
        github.createStatusToCommit(statusOptions, qmGulp.getGithubOptions(), callback);
    },
    getGithubOptions: function(){
        if(!process.env.GITHUB_ACCESS_TOKEN){
            throw "Please set GITHUB_ACCESS_TOKEN env in order to update Github statuses";
        }
        // noinspection JSUnusedLocalSymbols,JSUnusedLocalSymbols
        var options = {
            // Required options: git_token, git_repo
            // refer to https://help.github.com/articles/creating-an-access-token-for-command-line-use/
            git_token: process.env.GITHUB_ACCESS_TOKEN,
            // comment into this repo, this pr.
            git_repo: 'QuantiModo/quantimodo-android-chrome-ios-web-app',
            //git_prid: '1',
            // create status to this commit, optional
            git_sha: qmGit.getCurrentGitCommitSha(),
            jshint_status: 'error',       // Set status to error when jshint errors, optional
            jscs_status: 'failure',       // Set git status to failure when jscs errors, optional
            eslint_status: 'error',       // Set git status to error when eslint errors, optional
            // when using github enterprise, optional
            git_option: {
                // refer to https://www.npmjs.com/package/github for more options
                //host: 'github.mycorp.com',
                // You may require this when you using Enterprise Github
                //pathPrefix: '/api/v3'
            },
            // Provide your own jshint reporter, optional
            jshint_reporter: function (E, file) { // gulp stream file object
                // refer to http://jshint.com/docs/reporters/ for E structure.
                return 'Error in ' + E.file + '!';
            },
            // Provide your own jscs reporter, optional
            jscs_reporter: function (E, file) { // gulp stream file object
                // refer to https://github.com/jscs-dev/node-jscs/wiki/Error-Filters for E structure.
                return 'Error in ' + E.filename + '!';
            }
        };
        return options;
    },
    uploadBuildToS3: function(filePath) {
        if(!fs.existsSync(filePath)){
            throw filePath+" not found!";
        }
        if(qmGulp.getAppSettings().apiUrl === "local.quantimo.do"){
            qmLog.info("Not uploading because qm.getAppSettings().apiUrl is " + qmGulp.getAppSettings().apiUrl);
            return;
        }
        /** @namespace qm.getAppSettings().appStatus.betaDownloadLinks */
        var url = getApkS3DownloadUrl(filePath);
        qmLog.info("Download from "+url+ " and test!");
        qmGulp.getAppStatus().betaDownloadLinks[convertFilePathToPropertyName(filePath)] = url;
        var context = qmGulp.getClientIdFromStaticData() + " " + qmGulp.currentTask.replace('upload-combined-', '').replace('-to-s3', '');
        qmGulp.createStatusToCommit({
            description: 'Click Details to download and test',
            context: context,
            target_url: url,
            state: 'success'
        });
        /** @namespace qm.getAppSettings().appStatus.buildStatus */
        qmGulp.getBuildStatus()[convertFilePathToPropertyName(filePath)] = "READY";
        return uploadToS3(filePath);
    }
};
qmGulp.buildInfoHelper.setVersionNumbers();
var Quantimodo = require('./plain-javascript-client/index.js');
/** @namespace Quantimodo.ApiClient */
var defaultClient = Quantimodo.ApiClient.instance;
var quantimodo_oauth2 = defaultClient.authentications.quantimodo_oauth2;
quantimodo_oauth2.accessToken = process.env.QUANTIMODO_ACCESS_TOKEN;
console.log("process.platform is " + process.platform + " and process.env.OS is " + process.env.OS);
qmGit.outputCommitMessageAndBranch();
function setClientId(callback) {
    if (process.env.BUDDYBUILD_SCHEME) {
        QUANTIMODO_CLIENT_ID = process.env.BUDDYBUILD_SCHEME.toLowerCase().substr(0, process.env.BUDDYBUILD_SCHEME.indexOf(' '));
    }
    if(QUANTIMODO_CLIENT_ID){
        qmLog.info('Client id already set to ' + QUANTIMODO_CLIENT_ID);
        if (callback) {callback();}
        return;
    }
    if(argv.clientId){
        QUANTIMODO_CLIENT_ID = argv.clientId;
        qmLog.info("Using argv.clientId as client id: " + argv.clientId);
    }
    if(QUANTIMODO_CLIENT_ID){
        QUANTIMODO_CLIENT_ID = QUANTIMODO_CLIENT_ID.replace('apps/', '');
        qmLog.info('Stripped apps/ and now client id is ' + QUANTIMODO_CLIENT_ID);
    }
    if (!QUANTIMODO_CLIENT_ID) {
        qmGit.setBranchName(function () {
            var fullBranchName = qmGit.getBranchName();
            var branch = fullBranchName.replace('apps/', '');
            if (!QUANTIMODO_CLIENT_ID) {
                if (appIds[branch]) {
                    qmLog.info('Setting QUANTIMODO_CLIENT_ID using branch name ' + branch);
                    QUANTIMODO_CLIENT_ID = branch;
                } else {
                    console.warn('No QUANTIMODO_CLIENT_ID set.  Falling back to quantimodo client id');
                    QUANTIMODO_CLIENT_ID = 'quantimodo';
                }
            }
            if (callback) {callback();}
        });
    } else {
        if (callback) {callback();}
    }
}
setClientId();
function getChromeExtensionZipFilename() {return QUANTIMODO_CLIENT_ID + '-chrome-extension.zip';}
function getPathToChromeExtensionZip() {return buildPath + '/' + getChromeExtensionZipFilename();}
function getPathToUnzippedChromeExtension() {return buildPath + '/' + QUANTIMODO_CLIENT_ID + '-chrome-extension';}
function readDevCredentials(){
    try{
        devCredentials = readJsonFile(paths.src.devCredentials);
        qmLog.info("Using dev credentials from " + paths.src.devCredentials + ". This file is ignored in .gitignore and should never be committed to any repository.");
    } catch (error){
        qmLog.debug('No existing dev credentials found');
        devCredentials = {};
    }
}

function outputFileContents(path){
    qmLog.info(path+": "+fs.readFileSync(path));
}
function validateJsonFile(filePath) {
    try{
        var parsedOutput = JSON.parse(fs.readFileSync(filePath));
        qmLog.info(filePath + " is valid json");
        qmLog.debug(filePath + ": ", parsedOutput);
    } catch (error){
        var message = filePath + " is NOT valid json!";
        qmLog.error(message, error);
        throw(message);
    }
}
readDevCredentials();
function convertToCamelCase(string) {
    string = string.replace('.', '-');
    string = string.replace('_', '-');
    if(string.charAt(0) === "-"){string = string.substr(1);}
    string = string.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});
    string = string.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    return string;
}
function getSubStringAfterLastSlash(myString) {
    var parts = myString.split('/');
    return parts[parts.length - 1];
}
function convertFilePathToPropertyName(filePath) {
    var propertyName = getSubStringAfterLastSlash(filePath);
    propertyName = propertyName.replace(QUANTIMODO_CLIENT_ID, '');
    propertyName = propertyName.replace('.zip', '').replace('.apk', '');
    propertyName = convertToCamelCase(propertyName);
    return propertyName;
}
function getS3AppUploadsRelativePath(relative_filename) {
    var path =  'app_uploads/' + QUANTIMODO_CLIENT_ID + '/' + relative_filename;
    // noinspection JSUnusedLocalSymbols
    var numbers = qmGulp.buildInfoHelper.buildInfo.versionNumbers;
    if(relative_filename.indexOf('.apk') !== -1 && QUANTIMODO_CLIENT_ID === 'quantimodo'){
        var slug = qmLog.slugify(qmGit.getBranchName());
        slug = slug.replace('renovate-', '');
        path = path.replace('app-',
            //numbers.buildVersionNumber
            slug
            +'-app-');
    }
    return path;
}
function getApkS3DownloadUrl(filePath){
    var url = 'https://quantimodo.s3.amazonaws.com/' + getS3AppUploadsRelativePath(filePath);
    return url;
}
function uploadAppImagesToS3(filePath) {
    //qm.getAdditionalSettings().appImages[convertFilePathToPropertyName(filePath)] = getS3Url(filePath); We can just generate this from client id in PHP constructor
    return uploadToS3(filePath);
}
function checkAwsEnvs() {
    if(!AWS_ACCESS_KEY_ID){
        qmLog.info("Please set environmental variable QM_AWS_ACCESS_KEY_ID");
        return false;
    }
    if(!AWS_SECRET_ACCESS_KEY){
        qmLog.info("Please set environmental variable QM_AWS_SECRET_ACCESS_KEY");
        return false;
    }
    return true;
}
function uploadToS3(filePath) {
    var s3 = require('gulp-s3-upload')(s3Options);
    if(!checkAwsEnvs()){
        qmLog.info("No S3 credentials to upload " + filePath);
        return;
    }
    // noinspection JSUnusedLocalSymbols
    fs.stat(filePath, function (err, stat) {
        if (!err) {
            qmLog.info("Uploading " + filePath + " to S3...");
            // noinspection JSUnusedLocalSymbols
            return gulp.src([filePath]).pipe(s3({
                Bucket: 'quantimodo',
                ACL: 'public-read',
                keyTransform: function(relative_filename) {
                    var S3AppUploadsRelativePath = getS3AppUploadsRelativePath(filePath);
                    qmLog.info("S3 path: " + S3AppUploadsRelativePath);
                    return S3AppUploadsRelativePath;
                }
            }, {
                maxRetries: 5,
                logger: console
            }));
        } else {
            qmLog.error('Could not find ' + filePath);
            qmLog.error(err);
        }
    });
}
function execute(command, callback, suppressErrors, lotsOfOutput) {
    var exec = require('child_process').exec;
    var spawn = require('child_process').spawn; // For commands with lots of output resulting in stdout maxBuffer exceeded error
    qmLog.info('executing ' + command);
    if(lotsOfOutput){
        var args = command.split(" ");
        var program = args.shift();
        var ps = spawn(program, args);
        ps.on('exit', function (code, signal) {
            qmLog.info(command + ' exited with ' + 'code '+ code + ' and signal '+ signal);
            if(callback){callback();}
        });
        ps.stdout.on('data', function (data) {qmLog.info(command + ' stdout: ' + data);});
        ps.stderr.on('data', function (data) {qmLog.error(command + '  stderr: ' + data);});
        ps.on('close', function (code) {if (code !== 0) {qmLog.error(command + ' process exited with code ' + code);}});
    } else {
        // noinspection JSUnusedLocalSymbols
        var my_child_process = exec(command, function (error, stdout, stderr) {
            if (error !== null) {if (suppressErrors) {qmLog.info('ERROR: exec ' + error);} else {qmLog.error('ERROR: exec ' + error);}}
            callback(error, stdout);
        });
        my_child_process.stdout.pipe(process.stdout);
        my_child_process.stderr.pipe(process.stderr);
    }
}
function decryptFile(fileToDecryptPath, decryptedFilePath, callback) {
    if (!process.env.ENCRYPTION_SECRET) {
        qmLog.error('ERROR: Please set ENCRYPTION_SECRET environmental variable!');
        if (callback) {callback();}
        return;
    }
    qmLog.info('DECRYPTING ' + fileToDecryptPath + ' to ' + decryptedFilePath);
    var cmd = 'openssl aes-256-cbc -k "' + process.env.ENCRYPTION_SECRET + '" -in "' + fileToDecryptPath + '" -d -a -out "' + decryptedFilePath + '"';
    execute(cmd, function (error) {
        if (error !== null) {qmLog.error('ERROR: DECRYPTING: ' + error);} else {qmLog.info('DECRYPTED to ' + decryptedFilePath);}
        // noinspection JSUnusedLocalSymbols
        fs.stat(decryptedFilePath, function (err, stat) {
            if (!err) {
                qmLog.info(decryptedFilePath + ' exists');
            } else {
                qmLog.error('Could not decrypt' + fileToDecryptPath);
                qmLog.error('Make sure openssl works on your command line and the bin folder is in your PATH env: https://code.google.com/archive/p/openssl-for-windows/downloads');
                qmLog.error(err);
            }
        });
        if (callback) {callback();}
        //outputSHA1ForAndroidKeystore(decryptedFilePath);
    });
}
function encryptFile(fileToEncryptPath, encryptedFilePath, callback) {
    if (!process.env.ENCRYPTION_SECRET) {
        qmLog.error('ERROR: Please set ENCRYPTION_SECRET environmental variable!');
        return;
    }
    var cmd = 'openssl aes-256-cbc -k "' + process.env.ENCRYPTION_SECRET + '" -in "' + fileToEncryptPath + '" -e -a -out "' + encryptedFilePath + '"';
    qmLog.debug('executing ' + cmd);
    execute(cmd, callback);
}
function ionicUpload(callback) {
    var commandForGit = 'git log -1 HEAD --pretty=format:%s';
    execute(commandForGit, function (error, output) {
        var commitMessage = output.trim();
        var uploadCommand = 'ionic upload --email m@thinkbnumbers.org --password ' + process.env.IONIC_PASSWORD +
            ' --note "' + commitMessage + '" --deploy ' + process.env.RELEASE_STAGE;
        qmLog.info('ionic upload --note "' + commitMessage + '" --deploy ' + process.env.RELEASE_STAGE);
        qmLog.debug('\n' + uploadCommand);
        execute(uploadCommand, callback);
    });
}
function zipAFolder(folderPath, zipFileName, destinationFolder) {
    var zip = require('gulp-zip');
    qmLog.info("Zipping " + folderPath + " to " + destinationFolder + '/' + zipFileName);
    qmLog.debug('If this fails, make sure there are no symlinks.');
    return gulp.src([folderPath + '/**/*'])
        .pipe(zip(zipFileName))
        .pipe(gulp.dest(destinationFolder));
}
function zipAndUploadToS3(folderPath, zipFileName) {
    var zip = require('gulp-zip');
    var s3 = require('gulp-s3-upload')(s3Options);
    if(!checkAwsEnvs()){return;}
    var s3Path = getS3AppUploadsRelativePath(folderPath + '.zip');
    qmLog.info("Zipping " + folderPath + " to " + s3Path);
    qmLog.debug('If this fails, make sure there are no symlinks.');
    // noinspection JSUnusedLocalSymbols
    return gulp.src([folderPath + '/**/*'])
        .pipe(zip(zipFileName))
        .pipe(s3({
            Bucket: 'quantimodo',
            ACL: 'public-read',
            keyTransform: function(relative_filename) {
                return s3Path;
            }
        }, {
            maxRetries: 5,
            logger: console
        }));
}
function resizeIcon(callback, resolution, noAlpha) {
    var outputIconPath = paths.www.icons + '/icon_' + resolution + '.png';
    var command = 'convert resources/icon.png -resize ' + resolution + 'x' + resolution + ' ' + outputIconPath;
    if(noAlpha){
        outputIconPath = paths.www.icons + '/icon_white_' + resolution + '.png';
        command = 'convert resources/icon.png -resize ' + resolution + 'x' + resolution +
            ' -background white -alpha remove -alpha off ' + outputIconPath;
    }
    execute(command, function (error) {
        if (error) {
            qmLog.error('ERROR: ' + JSON.stringify(error));
            throw "Please install imagemagick in order to resize icons.  The windows version is here: "+
                "https://sourceforge.net/projects/imagemagick/?source=typ_redirect";
        }
        copyFiles([outputIconPath], paths.src.icons);
        uploadAppImagesToS3(outputIconPath);
        callback();
    });
}
function cordovaResources(callback){
    resizeIcon1024(function(){
        // noinspection JSUnusedLocalSymbols
        execute("cordova-res", function (error) {
            callback();
        });
    })
}
function resizeIcon1024(callback) {
    var command = 'convert resources/icon.png -resize 1024x1024 resources/icon.png';
    execute(command, function (error) {
        if (error) {
            qmLog.info("Please install imagemagick in order to resize icons.  The windows version is here: https://sourceforge.net/projects/imagemagick/?source=typ_redirect");
            qmLog.info('ERROR: ' + JSON.stringify(error));
        }
        callback();
    });
}
function onWindows(callback) {
    if(process.env.OS && process.env.OS.toLowerCase().indexOf('win') !== -1){
        qmLog.info("Cannot do this on windows");
        if(callback){callback();}
        return true;
    }
}
function fastlaneSupply(track, callback) {
    if(onWindows(callback)){return;}
    var apk_paths;
    qmLog.info("If you have problems uploading to Play, promote any alpha releases to beta, disable the alpha channel, and set xwalkMultipleApk to false");
    /** @namespace qm.getAppSettings().additionalSettings */
    /** @namespace buildSettings.xwalkMultipleApk */
    if(buildSettings.xwalkMultipleApk) {
        apk_paths = paths.apk.arm7Release + ',' + paths.apk.x86Release;
    } else {
        apk_paths = paths.apk.combinedRelease;
    }
    /** @namespace qm.getAppSettings().additionalSettings.appIds.appIdentifier */
    /** @namespace qm.getAppSettings().additionalSettings.appIds */
    execute('fastlane supply' +
        ' --apk_paths ' + apk_paths +
        ' --track ' + track +
        ' --skip_upload_metadata ' +
        ' --skip_upload_images ' +
        ' --skip_upload_screenshots ' +
        ' --verbose ' +
        ' --package_name ' + qmGulp.getAppIdentifier() +
        ' --json_key supply_json_key_for_google_play.json',
        callback);
}
function setVersionNumbersInWidget(parsedXmlFile) {
    /** @namespace parsedXmlFile.widget */
    parsedXmlFile.widget.$.version = qmGulp.buildInfoHelper.buildInfo.versionNumbers.ionicApp;
    parsedXmlFile.widget.$['ios-CFBundleVersion'] = qmGulp.buildInfoHelper.buildInfo.versionNumbers.iosCFBundleVersion;
    parsedXmlFile.widget.$['android-versionCode'] = qmGulp.buildInfoHelper.buildInfo.versionNumbers.androidVersionCode;
    return parsedXmlFile;
}
function getPostRequestOptions() {
    var options = getRequestOptions('/api/v1/appSettings');
    options.method = "POST";
    options.body = {clientId: QUANTIMODO_CLIENT_ID};
    return options;
}
function postAppStatus() {
    var options = getPostRequestOptions();
    options.body.appStatus = qmGulp.getAppStatus();
    qmLog.info("Posting appStatus", qmGulp.getAppStatus());
    return makeApiRequest(options);
}
function makeApiRequest(options, successHandler) {
    var rp = require('request-promise');
    qmLog.info('Making request to ' + options.uri + ' with clientId: ' + QUANTIMODO_CLIENT_ID);
    qmLog.debug(options.uri, options, 280);
    //options.uri = options.uri.replace('app', 'staging');
    if(options.uri.indexOf('staging') !== -1){options.strictSSL = false;}
    return rp(options).then(function (response) {
        if(response.success){
            qmLog.info("Successful response from " + options.uri + " for client id " + options.qs.clientId);
            qmLog.debug(options.uri + " response", response);
            if(successHandler){successHandler(response);}
        } else {
            outputApiErrorResponse({response: response}, options);
            throw "Success is false in response: "+ JSON.stringify(response);
        }
    }).catch(function (err) {
        outputApiErrorResponse(err, options);
        throw err;
    });
}
function postNotifyCollaborators(appType) {
    var options = getPostRequestOptions();
    options.uri = qmGulp.getAppHostName() + '/api/v2/email';
    options.body.emailType = appType + '-build-ready';
    return makeApiRequest(options);
}
function getRequestOptions(path) {
    var options = {
        uri: qmGulp.getAppHostName() + path,
        qs: {clientId: QUANTIMODO_CLIENT_ID, includeClientSecret: true, allStaticAppData: true},
        headers: {'User-Agent': 'Request-Promise', 'Content-Type': 'application/json'},
        json: true // Automatically parses the JSON string in the response
    };
    if(process.env.QUANTIMODO_ACCESS_TOKEN){
        options.qs.access_token = process.env.QUANTIMODO_ACCESS_TOKEN;
        qmLog.info("Using QUANTIMODO_ACCESS_TOKEN: " + options.qs.access_token.substring(0,4)+'...');
    } else {
        qmLog.error("Please add your QUANTIMODO_ACCESS_TOKEN environmental variable from " + qmGulp.getAppHostName() + "/api/v2/account");
    }
    return options;
}
function getAppEditUrl() {
    return getAppsListUrl() + '?clientId=' + qmGulp.getClientIdFromStaticData();
}
function getAppsListUrl() {
    return 'https://builder.quantimo.do/#/app/configuration';
}
function getAppDesignerUrl() {
    return 'https://builder.quantimo.do/#/app/configuration?clientId=' + qmGulp.getClientIdFromStaticData();
}
function verifyExistenceOfFile(filePath) {
    // noinspection JSUnusedLocalSymbols
    return fs.stat(filePath, function (err, stat) {
        if (!err) {qmLog.info(filePath + ' exists');} else {throw 'Could not create ' + filePath + ': '+ err;}
    });
}
function writeToXmlFile(outputFilePath, parsedXmlFile, callback) {
    var xml2js = require('xml2js');
    var builder = new xml2js.Builder();
    var updatedXml = builder.buildObject(parsedXmlFile);
    fs.writeFile(outputFilePath, updatedXml, 'utf8', function (error) {
        if (error) {
            qmLog.error('ERROR: error writing to xml file', error);
        } else {
            qmLog.info('Successfully wrote the xml file: ' + outputFilePath);
            qmLog.debug('Successfully wrote the xml file: ' + updatedXml);
            if(callback){callback();}
        }
    });
}
function replaceTextInFiles(filesArray, textToReplace, replacementText){
    var options = {
        logs: {
            enabled: true,
            notReplaced: true
        }
    };
    return gulp.src(filesArray, {base: '.'})
        .pipe(replace(textToReplace, replacementText, options))
        .pipe(gulp.dest('./'));
}
function outputApiErrorResponse(err, options) {
    if(!err || !err.response){
        qmLog.error("No err.response provided to outputApiErrorResponse!  err: ", err);
        qmLog.error("Request options: ", options);
        return;
    }
    qmLog.error(options.uri + " error response", err.response.body);
    if(err.response.statusCode === 401){
        throw "Credentials invalid.  Please correct them in " + paths.src.devCredentials + " and try again.";
    }
}
function getFileNameFromUrl(url) {
    return url.split('/').pop();
}
function downloadEncryptedFile(url, outputFileName) {
    var request = require('request');
    var decryptedFilename = getFileNameFromUrl(url).replace('.enc', '');
    var downloadUrl = qmGulp.getAppHostName() + '/api/v2/download?client_id=' + QUANTIMODO_CLIENT_ID + '&filename=' + encodeURIComponent(url);
    qmLog.info("Downloading " + downloadUrl + ' to ' + decryptedFilename);
    return request(downloadUrl + '&accessToken=' + process.env.QUANTIMODO_ACCESS_TOKEN, defaultRequestOptions)
        .pipe(fs.createWriteStream(outputFileName));
}
function unzipFile(pathToZipFile, pathToOutputFolder) {
    var unzip = require('gulp-unzip');
    qmLog.info("Unzipping " + pathToZipFile + " to " + pathToOutputFolder);
    return gulp.src(pathToZipFile)
        .pipe(unzip())
        .pipe(gulp.dest(pathToOutputFolder));
}
function getCordovaBuildCommand(releaseStage, platform) {
    var command = 'cordova build --' + releaseStage + ' ' + platform;
    //if(qm.buildSettings.buildDebug()){command += " --verbose";}  // Causes stdout maxBuffer exceeded error.  Run this as a command outside gulp if you need verbose output
    return command;
}
function outputVersionCodeForApk(pathToApk) {
    if(onWindows()){return;}
    var cmd = '$ANDROID_HOME/build-tools/24.0.2/aapt dump badging ' + circleCIPathToRepo + '/' + pathToApk;
    // aapt dump badging MyAwesomeApplication.apk |grep version
    return execute(cmd, function (error) {
        if (error !== null) {qmLog.error('ERROR: ' + error);}
    });
}
function copyFiles(sourceFiles, destinationPath, excludedFolder) {
    var srcArray = (sourceFiles.constructor !== Array) ? [sourceFiles] : sourceFiles;
    if(excludedFolder && typeof excludedFolder === "string"){
        console.log("Excluding " + excludedFolder + " from copy.. ");
        srcArray.push('!' + excludedFolder);
        srcArray.push('!' + excludedFolder + '/**');
    } else if (excludedFolder) {
        srcArray = srcArray.concat(excludedFolder);
    }
    console.log("Copying " + JSON.stringify(srcArray) + " to " + destinationPath);
    return gulp.src(srcArray).pipe(gulp.dest(destinationPath));
}
function addAppSettingsToParsedConfigXml(parsedXmlFile) {
    parsedXmlFile.widget.name[0] = qmGulp.getAppDisplayName();
    qmLog.info("Setting appDisplayName to " + qmGulp.getAppDisplayName() + " in config.xml");
    parsedXmlFile.widget.description[0] = qmGulp.getAppSettings().appDescription;
    parsedXmlFile.widget.$.id = qmGulp.getAppIdentifier();
    parsedXmlFile.widget.preference.push({$: {name: "xwalkMultipleApk", value: !!(buildSettings.xwalkMultipleApk)}});
    return parsedXmlFile;
}
function outputPluginVersionNumber(folderName) {
    var parseString = require('xml2js').parseString;
    var pluginXmlPath = 'plugins/' + folderName + '/plugin.xml';
    try {
        var xml = fs.readFileSync(pluginXmlPath, 'utf8');
        //console.log(prettyJSONStringify(xml));
        parseString(xml, function (err, parsedXmlFile) {
            if (err) {
                throw new Error('ERROR: failed to read xml file' + err);
            } else {
                console.log(folderName + " version: " + parsedXmlFile.plugin.$.version);
            }
        });
    } catch (error) {
        qmLog.error("Could not get plugin config from " + pluginXmlPath);
    }
}
function generateConfigXmlFromTemplate(callback) {
    var parseString = require('xml2js').parseString;
    var configXmlPath = 'config-template-shared.xml';
    var xml = fs.readFileSync(configXmlPath, 'utf8');
    /** @namespace qm.getAppSettings().additionalSettings.appIds.googleReversedClientId */
    if (qmGulp.getAppIds().googleReversedClientId) {
        xml = xml.replace('REVERSED_CLIENT_ID_PLACEHOLDER', qmGulp.getAppIds().googleReversedClientId);
    }
    xml = xml.replace('QuantiModoClientId_PLACEHOLDER', qmGulp.getClientIdFromStaticData());
    xml = xml.replace('QuantiModoClientSecret_PLACEHOLDER', qmGulp.getAppSettings().clientSecret);
    parseString(xml, function (err, parsedXmlFile) {
        if (err) {
            throw new Error('ERROR: failed to read xml file' + err);
        } else {
            parsedXmlFile = addAppSettingsToParsedConfigXml(parsedXmlFile);
            parsedXmlFile = setVersionNumbersInWidget(parsedXmlFile);
            if(parsedXmlFile.widget.chcp){parsedXmlFile.widget.chcp[0]['config-file'] = [{'$': {"url": qmGulp.chcp.getChcpJsonUrl()}}];}
            writeToXmlFile('./config.xml', parsedXmlFile, callback);
            qmGulp.staticData.configXml = parsedXmlFile;
            writeStaticDataFile();
        }
    });
}
var timeHelper = {
    getUnixTimestampInSeconds: function(dateTimeString) {
        if(!dateTimeString){dateTimeString = new Date().getTime();}
        return Math.round(timeHelper.getUnixTimestampInMilliseconds(dateTimeString)/1000);
    },
    getUnixTimestampInMilliseconds:function(dateTimeString) {
        if(!dateTimeString){return new Date().getTime();}
        return new Date(dateTimeString).getTime();
    },
    getTimeSinceString:function(unixTimestamp) {
        if(!unixTimestamp){return "never";}
        var secondsAgo = timeHelper.secondsAgo(unixTimestamp);
        if(secondsAgo > 2 * 24 * 60 * 60){return Math.round(secondsAgo/(24 * 60 * 60)) + " days ago";}
        if(secondsAgo > 2 * 60 * 60){return Math.round(secondsAgo/(60 * 60)) + " hours ago";}
        if(secondsAgo > 2 * 60){return Math.round(secondsAgo/(60)) + " minutes ago";}
        return secondsAgo + " seconds ago";
    },
    secondsAgo: function(unixTimestamp) {return Math.round((timeHelper.getUnixTimestampInSeconds() - unixTimestamp));}
};
gulp.Gulp.prototype.__runTask = gulp.Gulp.prototype._runTask; // Lets us get task name
gulp.Gulp.prototype._runTask = function(task) { this.currentTask = task; this.__runTask(task);};
// Set the default to the build task
gulp.task('default', ['configureApp']);
// Executes taks specified in winPlatforms, linuxPlatforms, or osxPlatforms based on
// the hardware Gulp is running on which are then placed in platformsToBuild
gulp.task('build', ['scripts', 'sass'], function () {
    var cordovaBuild = require('taco-team-build');
    var es = require('event-stream');
    qmLog.info("Be sure to setup your system following the instructions at http://taco.visualstudio.com/en-us/docs/tutorial-gulp-readme/#tacoteambuild");
    return cordovaBuild.buildProject(platformsToBuild, buildArgs)
        .then(function () {
            // ** NOTE: Package not required in recent versions of Cordova
            return cordovaBuild.packageProject(platformsToBuild)
                .then(function () {
                    return es.concat(
                        gulp.src(buildPaths.apk).pipe(gulp.dest(buildPaths.binApk)),
                        gulp.src(buildPaths.ipa).pipe(gulp.dest(buildPaths.binIpa)),
                        gulp.src(buildPaths.appx).pipe(gulp.dest(buildPaths.binAppx)));
                });
        });
});
// Build Android, copy the results back to bin folder
gulp.task('build-android', ['scripts', 'sass'], function () {
    var cordovaBuild = require('taco-team-build');
    return cordovaBuild.buildProject('android', buildArgs)
        .then(function () {
            return gulp.src(buildPaths.apk).pipe(gulp.dest(buildPaths.binApk));
        });
});
// Build iOS, copy the results back to bin folder
gulp.task('build-ios', ['scripts', 'sass'], function () {
    var cordovaBuild = require('taco-team-build');
    return cordovaBuild.buildProject('ios', buildArgs)
        .then(function () {
            // ** NOTE: Package not required in recent versions of Cordova
            return cordovaBuild.packageProject(platformsToBuild)
                .then(function () {
                    return gulp.src(buildPaths.ipa).pipe(gulp.dest(buildPaths.binIpa));
                });
        });
});
// Build Windows, copy the results back to bin folder
gulp.task('build-win', ['scripts', 'sass'], function () {
    var cordovaBuild = require('taco-team-build');
    return cordovaBuild.buildProject('windows', buildArgs)
        .then(function () {
            return gulp.src(buildPaths.appx).pipe(gulp.dest(buildPaths.binAppx));
        });
});
// Typescript compile - Can add other things like minification here
gulp.task('scripts', function () {
    var ts = require('gulp-typescript');
    // Compile TypeScript code - This sample is designed to compile anything under the "scripts" folder using settings
    // in tsconfig.json if present or this gulpfile if not.  Adjust as appropriate for your use case.
    if (fs.existsSync(buildPaths.tsconfig)) {
        // Use settings from scripts/tsconfig.json
        gulp.src(buildPaths.ts)
            .pipe(ts(ts.createProject(buildPaths.tsconfig)))
            .pipe(gulp.dest('.'));
    } else {
        // Otherwise use these default settings
        gulp.src(buildPaths.ts)
            .pipe(ts({
                noImplicitAny: false,
                noEmitOnError: true,
                removeComments: false,
                sourceMap: true,
                out: 'appBundle.js',
                target: 'es5'
            }))
            .pipe(gulp.dest(paths.www.scripts));
    }
});
var chromeScripts = [
    'lib/q/q.js',
    'lib/localforage/dist/localforage.js',
    'lib/bugsnag/dist/bugsnag.js',
    'lib/quantimodo/quantimodo-web.js',
    'js/qmLogger.js',
    'js/qmHelpers.js',
    'data/qmStaticData.js', // Must come after qmHelpers because we assign to qm.staticData
    'lib/underscore/underscore-min.js',
];
//if(qmGit.accessToken){chromeScripts.push('qm-amazon/qmUrlUpdater.js');}
// noinspection JSUnusedLocalSymbols
function deleteFile(path){
    if (fs.existsSync(path)) {
        return cleanFiles([path]);
    }
}
function chromeManifest(outputPath, backgroundScriptArray) {
    outputPath = outputPath || chromeExtensionBuildPath + '/manifest.json';
    var chromeManifestObject = qmGulp.staticData.chromeManifestString = {
        'manifest_version': 2,
        'name': qmGulp.getAppDisplayName(),
        'description': qmGulp.getAppSettings().appDescription,
        'version': qmGulp.buildInfoHelper.buildInfo.versionNumbers.ionicApp,
        'options_page': 'chrome_options.html',
        'icons': {
            '16': 'img/icons/icon_16.png',
            '48': 'img/icons/icon_48.png',
            '128': 'img/icons/icon_128.png'
        },
        'permissions': [
            'alarms',
            'notifications',
            'storage',
            //'tabs',
            'https://*.google.com/*',
            'https://*.facebook.com/*',
            'https://*.quantimo.do/*',
            'https://*.uservoice.com/*',
            'https://*.googleapis.com/*',
            'https://*.intercom.com/*',
            'https://*.intercom.io/*',
            'https://*.googleapis.com/*',
            'https://*.google-analytics.com/*'
        ],
        'browser_action': {
            'default_icon':  'img/icons/icon_700.png',
            'default_popup': 'chrome_default_popup_iframe.html'
        },
        'background': {
            'scripts': backgroundScriptArray,
            'persistent': true
        }
    };
    var amazonScraperPermissions = [
        'webRequest',
        'webRequestBlocking',
        'http://www.amazon.com/*',
        'https://www.amazon.com/*',
        'http://www.amazon.ca/*',
        'https://www.amazon.ca/*',
        'http://www.amazon.co.uk/*',
        'https://www.amazon.co.uk/*',
        'http://www.amazon.de/*',
        'https://www.amazon.de/*',
        'http://www.amazon.es/*',
        'https://www.amazon.es/*',
        'http://www.amazon.fr/*',
        'https://www.amazon.fr/*',
        'http://www.amazon.it/*',
        'https://www.amazon.it/*',
        'http://www.amazon.co.jp/*',
        'https://www.amazon.co.jp/*',
        'http://www.amazon.cn/*',
        'https://www.amazon.cn/*'
    ];
    var useAmazonOrderScraper = false;
    if(useAmazonOrderScraper){chromeManifestObject.permssions = chromeManifestObject.permissions.concat(amazonScraperPermissions);}
    //chromeExtensionManifest.appSettings = appSettings; // I think adding appSettings to the chrome manifest breaks installation
    var chromeManifestString = JSON.stringify(chromeManifestObject, null, 2);
    qmLog.info("Creating chrome manifest at " + outputPath);
    writeToFile(outputPath, chromeManifestString);
}
gulp.task('chromeIFrameHtml', [], function () {
    return gulp.src([
            //'src/chrome_default_popup_iframe.html',
            'src/js/closeChromePopup.js'
        ])
        .pipe(replace("quantimodo.quantimo.do", QUANTIMODO_CLIENT_ID + ".quantimo.do", './src/'))
        .pipe(gulp.dest(chromeExtensionBuildPath+'/js'));
});
gulp.task('chromeOptionsHtml', [], function () {
    return gulp.src(['src/chrome_options.html'])
        .pipe(replace("quantimodo.quantimo.do", QUANTIMODO_CLIENT_ID + ".quantimo.do", './www/'))
        .pipe(gulp.dest(chromeExtensionBuildPath));
});
gulp.task('chromeManifestInBuildFolder', ['getAppConfigs'], function () {
    chromeManifest(chromeExtensionBuildPath + '/manifest.json', [chromeBackgroundJsFilename]);
});
gulp.task('chromeManifestInSrcFolder', ['getAppConfigs'], function () {
    chromeManifest('src/manifest.json', chromeScripts);
});
gulp.task('createProgressiveWebAppManifestInSrcFolder', ['getAppConfigs'], function () {
    if(!qmPlatform.buildingFor.web()){
        qmLog.info("Don't need PWA manifest.json because not building for web");
        return;
    }
    return createProgressiveWebAppManifest('src/manifest.json');
});
function createProgressiveWebAppManifest(outputPath) {
    outputPath = outputPath || paths.src + '/manifest.json';
    var pwaManifest = {
        'manifest_version': 2,
        'name': qmGulp.getAppDisplayName(),
        'short_name': qmGulp.getClientIdFromStaticData(),
        'description': qmGulp.getAppSettings().appDescription,
        "start_url": "index.html",
        "display": "standalone",
        "icons": [{
            "src": "img/icons/icon_512.png",
            "sizes": "512x512",
            "type": "image/png"
        },
        {
            "src": "img/icons/icon_192.png",
            "sizes": "192x192",
            "type": "image/png"
        }],
        "background_color": "#FF9800",
        "theme_color": "#FF9800",
        //"gcm_sender_id": "1052648855194",  // This is the actual QM id but FB says change your web app manifest's 'gcm_sender_id' value to '103953800507' to use Firebase messaging.
        "gcm_sender_id": "103953800507"
    };
    pwaManifest = JSON.stringify(pwaManifest, null, 2);
    qmLog.info("Creating ProgressiveWebApp manifest at " + outputPath);
    return writeToFile(outputPath, pwaManifest);
}
function writeToFile(filePath, stringContents) {
    if(!stringContents || stringContents === "undefined" || stringContents === "null"){
        throw "String contents are " + stringContents;
    }
    qmLog.info("Writing to " + filePath);
    if(typeof stringContents !== "string"){stringContents = qmLog.prettyJSONStringify(stringContents);}
    return fs.writeFileSync(filePath, stringContents);
}
function writeToFileWithCallback(filePath, stringContents, callback) {
    if(!stringContents){
        throw filePath + " stringContents not provided to writeToFileWithCallback";
    }
    qmLog.info("Writing to " + filePath);
    if(typeof stringContents !== "string"){stringContents = JSON.stringify(stringContents);}
    return fs.writeFile(filePath, stringContents, callback);
}
gulp.task('createSuccessFile', function () {
    writeToFile('lastCommitBuilt', qmGit.getCurrentGitCommitSha());
    return fs.writeFileSync('success', qmGit.getCurrentGitCommitSha());
});
gulp.task('deleteSuccessFile', function () {
    if(qmPlatform.buildingFor.ios()){
        qmLog.info("Deleting success file messes up iOS build or so I'm told by my previous comments...");
        return;
    }
    qmLog.info("Deleting success file so we know if build completed...");
    return cleanFiles(['success']);
});
gulp.task('setClientId', function (callback) {setClientId(callback);});
gulp.task('validateDevCredentials', ['setClientId'], function () {
    var options = getRequestOptions('/api/v1/user');
    return makeApiRequest(options);
});
gulp.task('saveDevCredentials', ['setClientId'], function () {
    return writeToFile(paths.src.devCredentials, JSON.stringify(devCredentials));
});
function downloadFile(url, filename, destinationFolder) {
    var rename = require('gulp-rename');
    qmLog.info("Downloading  " + url + " to " + destinationFolder + "/" + filename);
    var downloadStream = require('gulp-download-stream');
    return downloadStream(url)
        .pipe(rename(filename))
        .pipe(gulp.dest(destinationFolder));
}
function downloadAndUnzipFile(url, destinationFolder) {
    var unzip = require('gulp-unzip');
    qmLog.info("Downloading  " + url + " and uzipping to " + destinationFolder);
    var downloadStream = require('gulp-download-stream');
    return downloadStream(url)
        .pipe(unzip())
        .pipe(gulp.dest(destinationFolder));
}
gulp.task('downloadChromeExtension', [], function(){
    return downloadAndUnzipFile(qmGulp.getAppStatus().betaDownloadLinks.chromeExtension, getPathToUnzippedChromeExtension());
});
gulp.task('downloadIcon', [], function(){
    /** @namespace qm.getAppSettings().additionalSettings.appImages.appIcon */
    /** @namespace qm.getAppSettings().additionalSettings.appImages */
    var iconUrl = (qmGulp.getAdditionalSettings().appImages.appIcon) ? qmGulp.getAdditionalSettings().appImages.appIcon : qmGulp.getAppSettings().iconUrl;
    cleanFiles(['resources/icon.psd']); // Sometimes QM PSD gets left and overrides MediModo PNG
    return downloadFile(iconUrl, 'icon.png', "./resources");
});
gulp.task('generatePlayPublicLicenseKeyManifestJson', ['getAppConfigs'], function(){
    if(!qmGulp.getMonetizationSettings().playPublicLicenseKey){
        qmLog.error("No public licence key for Play Store subscriptions.  Please add it at  " + getAppDesignerUrl(), qmGulp.getAdditionalSettings());
        return;
    }
    var manifestJson = {'play_store_key': qmGulp.getMonetizationSettings().playPublicLicenseKey.value};
    /** @namespace buildSettings.playPublicLicenseKey */
    return writeToFile('./www/manifest.json', manifestJson);
});
gulp.task('downloadSplashScreen', ['getAppConfigs'], function(){
    /** @namespace qm.getAppSettings().additionalSettings.appImages.splashScreen */
    var images = qmGulp.getAdditionalSettings().appImages;
    var splash = (images.splashScreen) ? images.splashScreen : qmGulp.getAppSettings().splashScreen;
    splash = splash.replace('https://raw.githubusercontent.com/mikepsinn/quantimodo-images/master', 'https://static.quantimo.do/img');
    return downloadFile(splash, 'splash.png', "./resources");
});
gulp.task('mergeToMasterAndTriggerRebuildsForAllApps', [], function(){
    var options = getRequestOptions('/api/ionic/master/merge');
    options.qs.server = options.qs.currentServerConext = qmLog.getCurrentServerContext();
    return makeApiRequest(options);
});
gulp.task('getAppConfigs', ['setClientId'], function () {
    if(qmGulp.getAppSettings() && qmGulp.getClientIdFromStaticData() === QUANTIMODO_CLIENT_ID){
        qmLog.info("Already have appSettings for build client id " + QUANTIMODO_CLIENT_ID);
        return;
    }
    var options = getRequestOptions('/api/v1/appSettings');
    function successHandler(response) {
        qmGulp.staticData = response.staticData;
        process.env.APP_DISPLAY_NAME = qmGulp.getAppDisplayName();  // Need env for Fastlane
        process.env.APP_IDENTIFIER = qmGulp.getAppIdentifier();  // Need env for Fastlane
        function addBuildInfoToAppSettings() {
            qmGulp.getAppSettings().buildServer = qmLog.getCurrentServerContext();
            qmGulp.getAppSettings().buildLink = qmGulp.buildInfoHelper.getBuildLink();
            qmGulp.getAppSettings().versionNumber = qmGulp.buildInfoHelper.buildInfo.versionNumbers.ionicApp;
            qmGulp.getAppSettings().androidVersionCode = qmGulp.buildInfoHelper.buildInfo.versionNumbers.androidVersionCode;
            qmGulp.getAppSettings().debugMode = isTruthy(process.env.APP_DEBUG);
            qmGulp.getAppSettings().builtAt = timeHelper.getUnixTimestampInSeconds();
            // if (!qm.getAppSettings().clientSecret && process.env.QUANTIMODO_CLIENT_SECRET) {
            //     qm.getAppSettings().clientSecret = process.env.QUANTIMODO_CLIENT_SECRET;
            // }
            buildSettings = JSON.parse(JSON.stringify(qmGulp.getAdditionalSettings().buildSettings));
            delete qmGulp.getAdditionalSettings().buildSettings;
            /** @namespace qm.getAppSettings().appStatus.buildEnabled.androidArmv7Release */
            /** @namespace qm.getAppSettings().appStatus.buildEnabled.androidX86Release */
            if (qmGulp.getAppStatus().buildEnabled.androidX86Release || qmGulp.getAppStatus().buildEnabled.androidArmv7Release) {
                qmGulp.getAdditionalSettings().buildSettings.xwalkMultipleApk = true;
            }
        }
        addBuildInfoToAppSettings();
        writePrivateConfigs('www'); // We need this for OAuth login.  It's OK to expose QM client secret because it can't be used to get user data.  We need to require it so it can be changed without changing the client id
        writePrivateConfigs('src'); // We need this for OAuth login.  It's OK to expose QM client secret because it can't be used to get user data.  We need to require it so it can be changed without changing the client id
        qmLog.info("Got app settings for " + qmGulp.getAppDisplayName() + ". You can change your app settings at " + getAppEditUrl());
        //qm.staticData.appSettings = removeCustomPropertiesFromAppSettings(qm.staticData.appSettings);
        if(process.env.APP_HOST_NAME){qmGulp.getAppSettings().apiUrl = process.env.APP_HOST_NAME.replace("https://", '');}
    }
    return makeApiRequest(options, successHandler);
});
function writePrivateConfigs(path) {
    if (!qmGulp.staticData.privateConfig && devCredentials.accessToken) {
        qmLog.error("Could not get privateConfig! " + ' Please double check your available client ids at ' +
            getAppsListUrl() + ' ' + qmGulp.getAdditionalSettings().companyEmail +
            " and ask them to make you a collaborator at " + getAppsListUrl() + " and run gulp devSetup again.");
    }
    /** @namespace response.privateConfig */
    if (qmGulp.staticData.privateConfig) {
        try {
            writeToFile(path + '/default.private_config.json', qmLog.prettyJSONStringify(qmGulp.staticData.privateConfig));
        } catch (error) {
            qmLog.error(error);
        }
    } else {
        qmLog.error("No private config provided!  User will not be able to use OAuth login!");
    }
}
var buildSettings;
gulp.task('downloadAndroidReleaseKeystore', ['getAppConfigs'], function () {
    /** @namespace buildSettings.androidReleaseKeystoreFile */
    if(!buildSettings.androidReleaseKeystoreFile){
        qmLog.error( "No Android Keystore provided.  Using QuantiModo one.  If you have your own, please upload it at " + getAppDesignerUrl());
        return;
    }
    /** @namespace buildSettings.androidReleaseKeystorePassword */
    if(!buildSettings.androidReleaseKeystorePassword){
        qmLog.error( "No Android keystore storePassword provided.  Using QuantiModo one.  If you have your own, please add it at " + getAppDesignerUrl());
        return;
    }
    /** @namespace buildSettings.androidReleaseKeyAlias */
    if(!buildSettings.androidReleaseKeyAlias){
        qmLog.error( "No Android keystore alias provided.  Using QuantiModo one.  If you have your own, please add it at " + getAppDesignerUrl());
        return;
    }
    /** @namespace buildSettings.androidReleaseKeyPassword */
    if(!buildSettings.androidReleaseKeyPassword){
        qmLog.error( "No Android keystore password provided.  Using QuantiModo one.  If you have your own, please add it at " + getAppDesignerUrl());
        return;
    }
    writeBuildJson();
    return downloadEncryptedFile(buildSettings.androidReleaseKeystoreFile, "quantimodo.keystore");
});
function writeBuildJson(){
    var buildJson = {};
    if(qmPlatform.buildingFor.android()){
        buildJson.android = {
            "release": {
                "keystore":"quantimodo.keystore",
                "storePassword": buildSettings.androidReleaseKeystorePassword,
                "alias": buildSettings.androidReleaseKeyAlias,
                "password": buildSettings.androidReleaseKeyPassword,
                "keystoreType":""
            }
        };
    }
    if(qmPlatform.buildingFor.ios()){
        buildJson.ios = {
            "debug": {
                "developmentTeam": "YD2FK7S2S5"
            },
            "release": {
                "developmentTeam": "YD2FK7S2S5"
            }
        };
    }
    return writeToFile('build.json', qmLog.prettyJSONStringify(buildJson));
}
gulp.task('downloadAndroidDebugKeystore', ['getAppConfigs'], function () {
    if(!buildSettings.androidReleaseKeystoreFile){
        throw "Please upload your Android release keystore at " + getAppEditUrl();
    }
    return downloadEncryptedFile(buildSettings.androidReleaseKeystoreFile, "debug.keystore");
});
gulp.task('verify-and-post-notify-collaborators-android', ['getAppConfigs'], function (callback) {
    runSequence(
        'verifyExistenceOfAndroidX86ReleaseBuild',
        'verifyExistenceOfAndroidArmV7ReleaseBuild',
        'verifyExistenceOfChromeExtension',
        'post-notify-collaborators-android',
        callback);
});
gulp.task('post-notify-collaborators-android', ['getAppConfigs'], function () {
    return postNotifyCollaborators('android');
});
gulp.task('post-app-status', ['getAppConfigs'], function () {
    return postAppStatus();
});
gulp.task('validateChromeManifest', function () {
    return validateJsonFile(getPathToUnzippedChromeExtension() + '/manifest.json');
});
gulp.task('verifyExistenceOfAndroidX86ReleaseBuild', function () {
    if(buildSettings.xwalkMultipleApk){
        return verifyExistenceOfFile(paths.apk.x86Release);
    }
});
gulp.task('verifyExistenceOfAndroidArmV7ReleaseBuild', function () {
    if(buildSettings.xwalkMultipleApk){
        return verifyExistenceOfFile(paths.apk.arm7Release);
    }
});
gulp.task('verifyExistenceOfChromeExtension', function () {
    return verifyExistenceOfFile(getPathToChromeExtensionZip());
});
gulp.task('getCommonVariables', function () {
    return getConstantsFromApiAndWriteToJson('commonVariables',
        'public/variables?removeAdvancedProperties=true&limit=1000&sort=-numberOfUserVariables&numberOfUserVariables=(gt)3' +
        '&concise=true'
    );
});
gulp.task('getConnectors', function () {
    return getConstantsFromApiAndWriteToJson('connectors', 'connectors/list');
});
gulp.task('getUnits', function () {
    return getConstantsFromApiAndWriteToJson('units');
});
gulp.task('downloadSwaggerJson', [], function () {
    var url = 'https://raw.githubusercontent.com/QuantiModo/docs/develop/swagger/swagger.json';
    // qmLog.info("Downloading "+url);
    // return download(url)
    //     .pipe(gulp.dest("src/data/"));
    return getConstantsFromApiAndWriteToJson('docs', url);
});
function writeStaticDataFile(){
    qmGulp.staticData.buildInfo = qmGulp.buildInfoHelper.getCurrentBuildInfo();
    var string = 'var staticData = '+ qmLog.prettyJSONStringify(qmGulp.staticData)+
        '; if(typeof window !== "undefined"){window.qm.staticData = staticData;} ' +
        ' else if(typeof qm !== "undefined"){qm.staticData = staticData;} else {module.exports = staticData;} ' +
        'if(typeof qm !== "undefined"){qm.stateNames = staticData.stateNames;}';
    try {
        writeToFile(paths.www.staticData, string);
    } catch(e){
        qmLog.error(e.message + ".  Maybe www/data doesn't exist but it might be resolved when we copy from src");
    }
    try {
        writeToFile('build/chrome_extension/data/qmStaticData.js', string);
    } catch(e){
        qmLog.error(e.message + ".  Maybe build/chrome_extension/data doesn't exist but it might be resolved when we copy from src");
    }
    return writeToFile(paths.src.staticData, string);
}
gulp.task('staticDataFile', ['getAppConfigs'], function () {
    return writeStaticDataFile();
});
function getConstantsFromApiAndWriteToJson(type, urlPath){
    var jeditor = require('gulp-json-editor');
    var request = require('request');
    var source = require('vinyl-source-stream');
    var streamify = require('gulp-streamify');
    if(!urlPath){urlPath = type;}
    var url = qmGulp.getAppHostName() + '/api/v1/' + urlPath;
    if(urlPath.indexOf("http") !== -1){url = urlPath;}
    qmLog.info('gulp ' + type + ' from '+ url);
    var destinations = [
        './src/data/',
        './www/data/'
    ];
    var pipeLine = request(url, defaultRequestOptions)
        .pipe(source(type + '.json'))
        .pipe(streamify(jeditor(function (constants) {
            qmGulp.staticData[type] = constants;
            return constants;
        })));
    try {
        destinations.forEach(function (d) {
            pipeLine = pipeLine.pipe(gulp.dest(d));
        });
    } catch (error) {
        qmLog.error(error);
    }
    return pipeLine;
}
gulp.task('getVariableCategories', function () {
    return getConstantsFromApiAndWriteToJson('variableCategories');
});
gulp.task('getSHA1FromAPK', function () {
    qmLog.info('Make sure openssl works on your command line and the bin folder is in your PATH env: https://code.google.com/archive/p/openssl-for-windows/downloads');
    var cmd = 'keytool -list -printcert -jarfile ' + paths.apk.arm7Release + ' | grep -Po "(?<=SHA1:) .*" |  xxd -r -p | openssl base64';
    return execute(cmd, function (error) {
        if (error !== null) {qmLog.error('ERROR: ' + error);} else {qmLog.info('DECRYPTED to ' + paths.apk.arm7Release);}
    });
});
gulp.task('outputX86ApkVersionCode', function () {
    if(buildSettings.xwalkMultipleApk){
        return outputVersionCodeForApk(paths.apk.x86Release);
    }
});
gulp.task('outputArmv7ApkVersionCode', function () {
    if(buildSettings.xwalkMultipleApk){
        return outputVersionCodeForApk(paths.apk.arm7Release);
    }
});
gulp.task('outputCombinedApkVersionCode', function () {
    if(!buildSettings.xwalkMultipleApk){
        return outputVersionCodeForApk(paths.apk.arm7Release);
    }
});
gulp.task('unzipChromeExtension', function () {
    return unzipFile(getPathToChromeExtensionZip(), getPathToUnzippedChromeExtension());
});
gulp.task('sass', function (done) {
    var sass = require('gulp-sass');
    var rename = require('gulp-rename');
    var minifyCss = require('gulp-minify-css');
    var textToReplace = '../fonts/ionicons';
    var replacementText = '../lib/ionic/fonts/ionicons';
    // Fix wrong fonts/ionicons in ionic.css in https://github.com/webpack-contrib/css-loader/issues/121
    gulp.src('./src/scss/app.scss')  // Can't use "return" because gulp doesn't know whether to respect that or the "done" callback
        .pipe(sass({errLogToConsole: true}))
        .pipe(replace(textToReplace, replacementText, {}))
        .pipe(gulp.dest('./src/css/'))
        .pipe(minifyCss({keepSpecialComments: 0}))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('./src/css/'))
        .on('end', done);
});
gulp.task('watch', function () {
    qmLog.info("Watching for changes to "+paths.sass);
    gulp.watch(paths.sass, ['sass']);
});
gulp.task('install', ['git-check'], function () {
    var gutil = require('gulp-util');
    var bower = require('bower');
    return bower.commands.install().on('log', function (data) {gutil.log('bower', gutil.colors.cyan(data.id), data.message);});
});
gulp.task('deleteNodeModules', function () {
    qmLog.info('If file is locked in Windows, open Resource Monitor as Administrator.  Then go to CPU -> Associated ' +
        'Handles and search for the locked file.  Then right click to kill all the processes using it.  Then try this ' +
        'task again.');
    return cleanFolder('node_modules');
});
gulp.task('deleteWwwPrivateConfig', function () {
    return cleanFiles([paths.www.defaultPrivateConfig]);
});
gulp.task('deleteWwwIcons', function () {
    return cleanFiles(['www/img/icons/*']);
});
gulp.task('getDevAccessTokenFromUserInput', [], function () {
    var inquirer = require('inquirer');
    var deferred = q.defer();
    if(devCredentials.accessToken){
        process.env.QUANTIMODO_ACCESS_TOKEN = devCredentials.accessToken;
        qmLog.info("Using accessToken " + devCredentials.accessToken + " from " + paths.src.devCredentials);
        deferred.resolve();
        return deferred.promise;
    }
    inquirer.prompt([{
        type: 'input', name: 'accessToken', message: 'Please enter your QuantiModo access token obtained from http://app.quantimo.do/api/v2/account: '
    }], function (answers) {
        process.env.QUANTIMODO_ACCESS_TOKEN = devCredentials.accessToken = answers.accessToken.trim();
        deferred.resolve();
    });
    return deferred.promise;
});
gulp.task('devSetup', [], function (callback) {
    runSequence(
        'getDevAccessTokenFromUserInput',
        'getClientIdFromUserInput',
        'validateDevCredentials',
        'saveDevCredentials',
        'configureApp',
        'ionicServe',
        'copyConfigsToSrc',
        callback);
});
gulp.task('getClientIdFromUserInput', function () {
    var inquirer = require('inquirer');
    var deferred = q.defer();
    inquirer.prompt([{
        type: 'input', name: 'clientId', message: 'Please enter the client id obtained at '  + getAppsListUrl() + ": "
    }], function (answers) {
        QUANTIMODO_CLIENT_ID = answers.clientId.trim();
        deferred.resolve();
    });
    return deferred.promise;
});
var updatedVersion = '';
gulp.task('getUpdatedVersion', ['getClientIdFromUserInput'], function () {
    var inquirer = require('inquirer');
    var deferred = q.defer();
    inquirer.prompt([{
        type: 'confirm', name: 'updatedVersion', 'default': false,
        message: 'Have you updated the app\'s version number in chromeApps/' + QUANTIMODO_CLIENT_ID + '/manifest.json ?'
    }], function (answers) {
        /** @namespace answers.updatedVersion */
        if (answers.updatedVersion) {
            updatedVersion = answers.updatedVersion;
            deferred.resolve();
        } else {
            qmLog.info('PLEASE UPDATE IT BEFORE UPLOADING');
            deferred.reject();
        }
    });
    return deferred.promise;
});
gulp.task('copyWwwFolderToChromeApp', ['getUpdatedVersion'], function () {
    return copyFiles('www/**/*', 'chromeApps/' + QUANTIMODO_CLIENT_ID + '/www');
});
gulp.task('zipChromeApp', ['copyWwwFolderToChromeApp'], function () {
    var zip = require('gulp-zip');
    return gulp.src(['chromeApps/' + QUANTIMODO_CLIENT_ID + '/**/*'])
        .pipe(zip(QUANTIMODO_CLIENT_ID + '.zip'))
        .pipe(gulp.dest('chromeApps/zips'));
});
gulp.task('openChromeAuthorizationPage', ['zipChromeApp'], function () {
    var open = require('gulp-open');
    var deferred = q.defer();
    gulp.src(__filename)
        .pipe(open({uri: 'https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=1052648855194-h7mj5q7mmc31k0g3b9rj65ctk0uejo9p.apps.googleusercontent.com&redirect_uri=urn:ietf:wg:oauth:2.0:oob'}));
    deferred.resolve();
});
var code = '';
gulp.task('getChromeAuthorizationCode', ['openChromeAuthorizationPage'], function () {
    var inquirer = require('inquirer');
    var deferred = q.defer();
    setTimeout(function () {
        qmLog.info('Starting getChromeAuthorizationCode');
        inquirer.prompt([{
            type: 'input', name: 'code', message: 'Please Enter the Code Generated from the opened website: '
        }], function (answers) {
            code = answers.code;
            code = code.trim();
            qmLog.info('code: ', code);
            deferred.resolve();
        });
    }, 2000);
    return deferred.promise;
});
var access_token = '';
gulp.task('getAccessTokenFromGoogle', ['getChromeAuthorizationCode'], function () {
    var deferred = q.defer();
    var request = require('request');
    var options = {
        method: 'POST',
        url: 'https://accounts.google.com/o/oauth2/token',
        form: {
            client_id: '1052648855194-h7mj5q7mmc31k0g3b9rj65ctk0uejo9p.apps.googleusercontent.com',
            client_secret: 'gXbySqbFgRcg_RM9bIiXUmIS',
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
        }
    };
    request(options, function (error, message, response) {
        if (error) {
            qmLog.error('ERROR: Failed to generate the access code', error);
            deferred.reject();
        } else {
            response = JSON.parse(response);
            access_token = response.access_token;
            deferred.resolve();
        }
    });
    return deferred.promise;
});
gulp.task("upload-chrome-extension-to-s3", function() {
    qmGulp.currentTask = this.currentTask.name;
    return qmGulp.uploadBuildToS3(getPathToChromeExtensionZip());
});
gulp.task("upload-x86-release-apk-to-s3", function() {
    qmGulp.currentTask = this.currentTask.name;
    if(buildSettings.xwalkMultipleApk){
        return qmGulp.uploadBuildToS3(paths.apk.x86Release);
    }
});
gulp.task("upload-armv7-release-apk-to-s3", function() {
    qmGulp.currentTask = this.currentTask.name;
    if(buildSettings.xwalkMultipleApk){
        return qmGulp.uploadBuildToS3(paths.apk.arm7Release);
    }
});
gulp.task("upload-combined-release-apk-to-s3", ['getAppConfigs'], function() {
    qmGulp.currentTask = this.currentTask.name;
    if(!buildSettings.xwalkMultipleApk){
        qmLog.info(qmGulp.buildInfoHelper.buildInfo.versionNumbers);
        return qmGulp.uploadBuildToS3(paths.apk.combinedRelease);
    }
});
gulp.task("upload-combined-debug-apk-to-s3", function() {
    qmGulp.currentTask = this.currentTask.name;
    if(!buildSettings.xwalkMultipleApk){
        if(qmGulp.buildSettings.buildDebug()){
            return qmGulp.uploadBuildToS3(paths.apk.combinedDebug);
        } else {
            return console.log("Not building debug version because process.env.BUILD_DEBUG is not true");
        }
    }
});
gulp.task('uploadChromeApp', ['getAccessTokenFromGoogle'], function () {
    qmGulp.currentTask = this.currentTask.name;
    var request = require('request');
    var q = require('q');
    var deferred = q.defer();
    var source = fs.createReadStream('./chromeApps/zips/' + QUANTIMODO_CLIENT_ID + '.zip');
    // upload the package
    var options = {
        url: 'https://www.googleapis.com/upload/chromewebstore/v1.1/items/' + appIds[QUANTIMODO_CLIENT_ID],
        method: 'PUT',
        headers: {'Authorization': 'Bearer ' + access_token, 'x-goog-api-version': '2'}
    };
    qmLog.info('Generated URL for upload operation: ', options.url);
    qmLog.info('The Access Token: Bearer ' + access_token);
    qmLog.info('UPLOADING. .. .. Please Wait! .. .');
    source.pipe(request(options, function (error, message, data) {
        if (error) {
            qmLog.error('ERROR: Error in Uploading Data', error);
            deferred.reject();
        } else {
            qmLog.info('Upload Response Received');
            data = JSON.parse(data);
            /** @namespace data.uploadState */
            if (data.uploadState === 'SUCCESS') {
                qmLog.info('Uploaded successfully!');
                deferred.resolve();
            } else {
                qmLog.info('Failed to upload the zip file');
                qmLog.info(JSON.stringify(data, 0, 2));
                deferred.reject();
            }
        }
    }));
    return deferred.promise;
});
var shouldPublish = true;
gulp.task('shouldPublish', ['uploadChromeApp'], function () {
    var inquirer = require('inquirer');
    var deferred = q.defer();
    inquirer.prompt([{
        type: 'confirm',
        name: 'shouldPublish',
        message: 'Should we publish this version?',
        default: true
    }], function (answers) {
        /** @namespace answers.shouldPublish */
        if (answers.shouldPublish) {
            shouldPublish = answers.shouldPublish;
            deferred.resolve();
        } else {
            qmLog.info('Ended without publishing!');
            deferred.reject();
        }
    });
    return deferred.promise;
});
gulp.task('publishToGoogleAppStore', ['shouldPublish'], function () {
    var request = require('request');
    var deferred = q.defer();
    // upload the package
    var options = {
        url: 'https://www.googleapis.com/chromewebstore/v1.1/items/' + appIds[QUANTIMODO_CLIENT_ID] + '/publish?publishTarget=trustedTesters',
        method: 'POST',
        headers: {'Authorization': 'Bearer ' + access_token, 'x-goog-api-version': '2', 'publishTarget': 'trustedTesters', 'Content-Length': '0'}
    };
    request(options, function (error, message, publishResult) {
        if (error) {
            qmLog.error('ERROR: error in publishing to trusted Users', error);
            deferred.reject();
        } else {
            publishResult = JSON.parse(publishResult);
            if (publishResult.status.indexOf('OK') > -1) {
                qmLog.info('published successfully');
                deferred.resolve();
            } else {
                qmLog.info('not published');
                qmLog.info(publishResult);
                deferred.reject();
            }
        }
    });
    return deferred.promise;
});
gulp.task('chrome', ['publishToGoogleAppStore'], function () {qmLog.info('Enjoy your day!');});
gulp.task('git-check', function (done) {
    var gutil = require('gulp-util');
    var sh = require('shelljs');
    if (!sh.which('git')) {
        qmLog.info(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});
function executeSynchronously(cmd, catchExceptions){
    var execSync = require('child_process').execSync;
    qmLog.info(cmd);
    try {
        // noinspection JSUnusedLocalSymbols
        var res = execSync(cmd);
        //qmLog.info(res);
    } catch (error) {
        if(catchExceptions){
            qmLog.error(error);
        } else {
            throw error;
        }
    }
}
// noinspection JSUnusedLocalSymbols
gulp.task('git-create-feature-for-each-changed-file', function (done) {
    var gitModified = require('gulp-gitmodified');
    var i = 0;
    return gulp.src('./src/templates/**/*')
        .pipe(gitModified('modified'))
        .on('data', function (file) {
            i++;
            var filePath = file.history[0];
            var fileName = filePath.split("/");
            fileName = fileName[fileName.length - 1];
            fileName = fileName.split("\\");
            fileName = fileName[fileName.length - 1];
            console.log('Modified file:', filePath);
            var feature = 'feature/'+qmLog.slugify(fileName);
            executeSynchronously("git checkout -b "+feature+" develop", true);
            executeSynchronously("git add "+filePath, true);
            executeSynchronously("git commit -m "+fileName);
            executeSynchronously("git push origin "+feature);
            //if(cb && i === files.length){cb();}
        });
});
gulp.task('git-set-branch-name', function (callback) {
    qmGit.setBranchName(callback);
});
gulp.task('deleteIOSApp', function () {
    var deferred = q.defer();
    execute('ionic platform rm ios', function (error) {
        if (error !== null) {
            qmLog.error('ERROR: REMOVING IOS APP: ' + error);
            deferred.reject();
        } else {
            qmLog.info('\n***PLATFORM REMOVED****');
            deferred.resolve();
        }
    });
    return deferred.promise;
});
gulp.task('encryptSupplyJsonKeyForGooglePlay', [], function (callback) {
    var fileToEncryptPath = 'supply_json_key_for_google_play.json';
    var encryptedFilePath = 'supply_json_key_for_google_play.json.enc';
    encryptFile(fileToEncryptPath, encryptedFilePath, callback);
});
gulp.task('decryptSupplyJsonKeyForGooglePlay', [], function (callback) {
    var fileToDecryptPath = 'supply_json_key_for_google_play.json.enc';
    var decryptedFilePath = 'supply_json_key_for_google_play.json';
    decryptFile(fileToDecryptPath, decryptedFilePath, callback);
});
gulp.task('encryptBuildJson', [], function (callback) {
    var fileToEncryptPath = 'build.json';
    var encryptedFilePath = 'build.json.enc';
    encryptFile(fileToEncryptPath, encryptedFilePath, callback);
});
gulp.task('decryptBuildJson', [], function (callback) {
    var fileToDecryptPath = 'build.json.enc';
    var decryptedFilePath = 'build.json';
    decryptFile(fileToDecryptPath, decryptedFilePath, callback);
});
gulp.task('ng-annotate', [], function() {
    var ngAnnotate = require('gulp-ng-annotate');
    return gulp.src('src/js/**/*.js')
        .pipe(ngAnnotate())
        .pipe(gulp.dest('www/js'));
});
function minifyJsGenerateCssAndIndexHtml(sourceIndexFileName) {
    var csso = require('gulp-csso');
    var ifElse = require('gulp-if-else');
    var lazypipe = require('lazypipe');
    var filter = require('gulp-filter');
    var rev = require('gulp-rev');
    var revReplace = require('gulp-rev-replace');
    var sourcemaps = require('gulp-sourcemaps');
    var uglify      = require('gulp-uglify');
    var useref = require('gulp-useref');
    qmLog.info("Running minify-js-generate-css-and-index-html for "+sourceIndexFileName);
    var jsFilter = filter("**/*.js", { restore: true });
    var cssFilter = filter("**/*.css", { restore: true });
    var indexHtmlFilter = filter(['**/*', '!**/'+sourceIndexFileName], { restore: true });
    var sourceMapsWriteOptions = {
        //sourceRoot: "src/lib/",
        includeContent: true // https://github.com/gulp-sourcemaps/gulp-sourcemaps#write-options
    };
    var renameForCacheBusting = qmPlatform.buildingFor.web();
    if (renameForCacheBusting) {
        qmLog.info("Renaming minified files for cache busting");
    } else {
        qmLog.info("Not renaming minified files because we can't remove from old ones from cordova hcp server");
    }
    return gulp.src("src/" + sourceIndexFileName)
        .pipe(useref({}, lazypipe().pipe(sourcemaps.init, { loadMaps: true })))
        .pipe(jsFilter)
        .pipe(uglify({mangle: false}))             // Minify any javascript sources (Can't mangle Angular files for some reason)
        .on('error', function (err) {
            var gutil = require('gulp-util');
            gutil.log(gutil.colors.red('[Error]'), err.toString());
            process.exit(1)
        })
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(csso())               // Minify any CSS sources
        .pipe(cssFilter.restore)
        .pipe(indexHtmlFilter)
        .pipe(ifElse(renameForCacheBusting, rev))                // Rename the concatenated files for cache busting (but not index.html)
        .pipe(indexHtmlFilter.restore)
        .pipe(ifElse(renameForCacheBusting, revReplace))         // Substitute in new filenames for cache busting
        .pipe(sourcemaps.write('.', sourceMapsWriteOptions))
        .pipe(gulp.dest('www'))
        ;
}
gulp.task('minify-js-generate-css-and-index-html', [], function() {
    if(!qmGulp.buildSettings.weShouldMinify()){return copyFiles('src/**/*', 'www', []);}
    return minifyJsGenerateCssAndIndexHtml('index.html');
});
gulp.task('minify-js-generate-css-and-android-popup-html', [], function() {
    if (!qmGulp.buildSettings.weShouldMinify()) {return copyFiles('src/**/*', 'www', []);}
    return minifyJsGenerateCssAndIndexHtml('android_popup.html');
});
var serviceWorkerFirebaseLocalForage = [
    paths.src.serviceWorker,
    'src/lib/firebase/firebase-app.js',
    'src/lib/ionic/fonts/ionicons.woff',
    'src/lib/ionic/fonts/ionicons.ttf',
    'src/lib/Bravey/build/bravey.js',
    'src/lib/firebase/firebase-messaging.js',
    'src/lib/localforage/dist/localforage.js',
    'src/js/qmLogger.js',
    'src/js/qmHelpers.js',
];
gulp.task('upload-source-maps', [], function(callback) {
    fs.readdir(paths.www.scripts, function (err, files) {
        if(!files){
            qmLog.info("No source maps to upload");
            callback();
            return;
        }
        files.forEach(function(file) {
            if(file.indexOf('.map') !== -1){return;}
            var options = {
                apiKey: 'ae7bc49d1285848342342bb5c321a2cf',
                appVersion: qmGulp.buildInfoHelper.buildInfo.versionNumbers.androidVersionCode, // 	the version of the application you are building (this should match the appVersion configured in your notifier)
                //codeBundleId: '1.0-123', // optional (react-native only)
                minifiedUrl: '*'+file, // supports wildcards
                sourceMap: paths.www.scripts + '/'+file+'.map', // file path of the source map on the current machine
                minifiedFile: paths.www.scripts + '/'+file, // file path of the minified file on the current machine
                uploadSources: true,
                overwrite: true, // whether you want to overwrite previously uploaded source maps
                // sources: {
                //     'http://example.com/assets/main.js': path.resolve(__dirname, 'path/to/main.js'),
                //     'http://example.com/assets/utils.js': path.resolve(__dirname, 'path/to/utils.js'),
                // },
            };
            qmLog.info("Upload options", options);
            var bugsnagSourceMaps = require('bugsnag-sourcemaps');
            bugsnagSourceMaps.upload(options, function(err) {
                if (err) {
                    qmLog.error('Could not upload source map for ' + file + " because " + err.message);
                } else {
                    console.log(file+ ' source map uploaded successfully');
                }
            });
        });
        callback();
    });
});
var pump = require('pump');
gulp.task('uglify-error-debugging', function (cb) {
    var uglify      = require('gulp-uglify');
    if(!qmGulp.buildSettings.weShouldMinify()){cb(); return;}
    pump([
        gulp.src('src/js/**/*.js'),
        uglify(),
        gulp.dest('./tmp/')
    ], cb);
});
gulp.task('deleteFacebookPlugin', function (callback) {
    qmLog.info('If this doesn\'t work, just use gulp cleanPlugins');
    execute('cordova plugin rm phonegap-facebook-plugin', callback);
});
gulp.task('deleteGooglePlusPlugin', function (callback) {
    qmLog.info('If this doesn\'t work, just use gulp cleanPlugins');
    execute('cordova plugin rm cordova-plugin-googleplus', callback);
});
gulp.task('platform-add-ios', function (callback) {
    try {
        execute('ionic platform add ios', callback);
    } catch (e) {
        qmLog.info(JSON.stringify(e));
        callback();
    }
});
gulp.task('cordova-plugin-rm-cordova-plugin-console', function (callback) {
    try {
        execute('cordova plugin rm cordova-plugin-console --save', callback);
    } catch (e) {
        qmLog.info(JSON.stringify(e));
        callback();
    }
});
gulp.task('ionic-build-ios', function (callback) {
    execute('ionic build ios', callback, false, true);
});
gulp.task('ionicServe', function (callback) {
    qmLog.info("The app should open in a new browser tab in a few seconds. If it doesn't, run `ionic serve` from an administrative command prompt in the root of the repository.");
    execute('ionic serve', callback);
});
gulp.task('ionicStateReset', function (callback) {
    execute('ionic state reset', callback);
});
gulp.task('fastlaneSupplyBeta', ['decryptSupplyJsonKeyForGooglePlay'], function (callback) {
    if(!qmGit.isMaster()){
        qmLog.info("Not doing fastlaneSupplyBeta because not on develop or master");
        callback();
        return;
    }
    if(qmGulp.buildSettings.buildDebug()){
        qmLog.info("Not uploading DEBUG build");
        callback();
        return;
    }
    try {
        fastlaneSupply('beta', callback, true);
    } catch (error) {
        qmLog.info(error);
    }
});
gulp.task('fastlaneSupplyProduction', ['decryptSupplyJsonKeyForGooglePlay'], function (callback) {
    if(!qmGit.isDevelop() && !qmGit.isMaster()){
        qmLog.info("Not doing fastlaneSupplyProduction because not on develop or master");
        callback();
        return;
    }
    try {
        fastlaneSupply('production', callback, true);
    } catch (error) {
        qmLog.info(error);
    }
});
gulp.task('ionicResources', function (callback) {
    execute('ionic resources', function () {
        qmLog.info("Uploading resources in case ionic resources command breaks");
        zipAndUploadToS3('resources', 'resources');
        callback();
    });
});
gulp.task('androidDebugKeystoreInfo', function (callback) {
    qmLog.info('androidDebugKeystoreInfo gets stuck for some reason');
    callback();
    //execute("keytool -exportcert -list -v -alias androiddebugkey -keystore debug.keystore", callback);
});
gulp.task('gitPull', function () {
    var commandForGit = 'git pull';
    execute(commandForGit, function (error, output) {
        output = output.trim();
        if (error) {
            qmLog.error('ERROR: Failed to pull: ' + output, error);
        } else {
            qmLog.info('Pulled changes ' + output);
        }
    });
});
gulp.task('gitCheckoutAppJs', function () {
    var commandForGit = 'git checkout -- www/js/app.js';
    execute(commandForGit, function (error, output) {
        output = output.trim();
        if (error) {
            qmLog.error('ERROR: Failed to gitCheckoutAppJs: ' + output, error);
        } else {
            qmLog.info('gitCheckoutAppJs ' + output);
        }
    });
});
gulp.task('ionicUploadStaging', function (callback) {
    process.env.RELEASE_STAGE = 'staging';
    ionicUpload(callback);
});
gulp.task('ionicUploadProduction', function (callback) {
    process.env.RELEASE_STAGE = 'production';
    ionicUpload(callback);
});
gulp.task('ionicUpload', function (callback) {
    ionicUpload(callback);
});
gulp.task('ionicUploadProductionForAllApps', function (callback) {
    process.env.RELEASE_STAGE = 'production';
    runSequence(
        'ionicUploadAllApps',
        callback);
});
gulp.task('fastlaneSupplyBetaQuantiModo', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'configureApp',
        'fastlaneSupplyBeta',
        callback);
});
gulp.task('ionicUploadStagingForAllApps', function (callback) {
    process.env.RELEASE_STAGE = 'production';
    runSequence(
        'ionicUploadAllApps',
        callback);
});
gulp.task('ionicUploadAllApps', function (callback) {
    runSequence(
        'setMediModoEnvs',
        'configureApp',
        'ionicUploadProduction',
        'setMoodiModoEnvs',
        'configureApp',
        'ionicUploadProduction',
        'setQuantiModoEnvs',
        'configureApp',
        'ionicUploadProduction',
        callback);
});
gulp.task('ionicAddCrosswalk', function (callback) {
    var command = 'ionic plugin add cordova-plugin-crosswalk-webview@2.2.0';  // Trying 2.2.0 to fix XWalkWebViewEngine is not abstract and does not override abstract method evaluateJavascript
    execute(command, callback);
});
gulp.task('ionicInfo', function (callback) {
    var command = 'ionic info';
    execute(command, callback);
});
gulp.task('cordovaPlatformVersionAndroid', function (callback) {
    var command = 'cordova platform version android';
    execute(command, callback);
});
gulp.task('downloadGradle', function () {
    var request = require('request');
    return request('https://services.gradle.org/distributions/gradle-2.14.1-bin.zip')
        .pipe(fs.createWriteStream('gradle-2.14.1-bin.zip'));
});
gulp.task('addFacebookPlugin', ['getAppConfigs'], function () {
    var deferred = q.defer();
    var addFacebookPlugin = function () {
        var commands = [
            'cordova -d plugin add ../fbplugin/phonegap-facebook-plugin',
            'APP_ID="' + qmGulp.staticData.privateConfig.FACEBOOK_APP_ID + '"',
            'APP_NAME="' + qmGulp.staticData.privateConfig.FACEBOOK_APP_NAME + '"'
        ].join(' --variable ');
        execute(commands, function (error) {
            if (error !== null) {
                qmLog.error('ERROR: THERE WAS AN ERROR:ADDING THE FACEBOOK PLUGIN***', error);
                deferred.reject();
            } else {
                qmLog.info('\n***FACEBOOK PLUGIN SUCCESSFULLY ADDED***');
                deferred.resolve();
            }
        });
    };
    fs.exists('../fbplugin', function (exists) {
        if (exists) {
            qmLog.info('FACEBOOK REPO ALREADY CLONED');
            addFacebookPlugin();
        } else {
            qmLog.info('FACEBOOK REPO NOT FOUND, CLONING https://github.com/Wizcorp/phonegap-facebook-plugin.git NOW');
            var commands = [
                'cd ../',
                'mkdir fbplugin',
                'cd fbplugin',
                'GIT_CURL_VERBOSE=1 GIT_TRACE=1 git clone https://github.com/Wizcorp/phonegap-facebook-plugin.git'
            ].join(' && ');
            /*			//Try this if you get the muliple dex file error still
             qmLog.info("FACEBOOK REPO NOT FOUND, CLONING https://github.com/Telerik-Verified-Plugins/Facebook.git NOW");
             var commands = [
             "cd ../",
             "mkdir fbplugin",
             "cd fbplugin",
             "GIT_CURL_VERBOSE=1 GIT_TRACE=1 git clone https://github.com/Telerik-Verified-Plugins/Facebook.git"
             ].join(' && ');
             */
            execute(commands, function (error) {
                if (error !== null) {
                    qmLog.error('ERROR: THERE WAS AN ERROR:DOWNLOADING THE FACEBOOK PLUGIN***', error);
                    deferred.reject();
                } else {
                    qmLog.info('\n***FACEBOOK PLUGIN DOWNLOADED, NOW ADDING IT TO IONIC PROJECT***');
                    addFacebookPlugin();
                }
            });
        }
    });
    return deferred.promise;
});
//gulp.task('addGooglePlusPlugin', ['deleteGooglePlusPlugin'] , function(){
// Can't do this because failure of deleteGooglePlusPlugin prevents next task.  Use runSequence instead
gulp.task('addGooglePlusPlugin', [], function () {
    var deferred = q.defer();
    if (!process.env.REVERSED_CLIENT_ID) {
        process.env.REVERSED_CLIENT_ID = 'com.googleusercontent.apps.1052648855194-djmit92q5bbglkontak0vdc7lafupt0d';
        qmLog.info('No REVERSED_CLIENT_ID env specified. Falling back to ' + process.env.REVERSED_CLIENT_ID);
    }
    var commands = [
        'cordova -d plugin add https://github.com/mikepsinn/cordova-plugin-googleplus.git#89ac9f2e8d521bacaaf3989a22b50e4d0b5d6d09',
        'REVERSED_CLIENT_ID="' + process.env.REVERSED_CLIENT_ID + '"'
    ].join(' --variable ');
    execute(commands, function (error) {
        if (error !== null) {
            qmLog.error('ERROR: ADDING THE GOOGLE PLUS PLUGIN***', error);
            deferred.reject();
        } else {
            qmLog.info('\n***GOOGLE PLUS PLUGIN ADDED****');
            deferred.resolve();
        }
    });
    return deferred.promise;
});
gulp.task('checkDrawOverAppsPlugin', [], function (callback) {
    fs.exists('./platforms/android/assets/www/plugins/cordova-plugin-drawoverapps/www/OverApps.js', function (exists) {
        if (exists) {
            qmLog.info('drawoverapps plugin installed');
            if(callback){callback();}
        } else {
            qmLog.error('drawoverapps plugin NOT installed! Installing now');
            execute("cordova plugin add https://github.com/mikepsinn/cordova-plugin-drawoverapps.git#master", function (error) {
                if (error !== null) {
                    qmLog.error('ERROR: ADDING THE drawoverapps PLUGIN: ' + error);
                } else {
                    qmLog.info('drawoverapps PLUGIN ADDED');
                }
                if(callback){callback();}
            });
        }
    });
});
gulp.task('removeDrawOverAppsPlugin', [], function (callback) {
    qmLog.info('We have to reinstall DrawOverAppsPlugin with new client id to fix "package com.quantimodo.quantimodo does not exist" error');
    var suppressErrors = true;
    execute("cordova plugin remove cordova-plugin-drawoverapps", function (error) {
        if (error !== null) {
            qmLog.error('ERROR: Failed to remove drawoverapps PLUGIN! error: ' + error);
        } else {
            qmLog.info('drawoverapps plugin REMOVED');
        }
        if(callback){callback();}
    }, suppressErrors);
});
gulp.task('reinstallDrawOverAppsPlugin', ['removeDrawOverAppsPlugin'], function (callback) {
    execute("cordova plugin add https://github.com/mikepsinn/cordova-plugin-drawoverapps.git", function (error) {
        if (error !== null) {
            qmLog.error('ERROR: ADDING THE drawoverapps PLUGIN: ' + error);
        } else {
            qmLog.info('drawoverapps PLUGIN ADDED');
        }
        if(callback){callback();}
    });
});
gulp.task('fixResourcesPlist', function () {
    var plist = require('plist');
    var deferred = q.defer();
    if (!qmGulp.getAppDisplayName()) {deferred.reject('Please export appSettings.appDisplayName');}
    var myPlist = plist.parse(fs.readFileSync('platforms/ios/' + qmGulp.getAppDisplayName() + '/' + qmGulp.getAppDisplayName() + '-Info.plist', 'utf8'));
    var LSApplicationQueriesSchemes = [
        'fbapi',
        'fbapi20130214',
        'fbapi20130410',
        'fbapi20130702',
        'fbapi20131010',
        'fbapi20131219',
        'fbapi20140410',
        'fbapi20140116',
        'fbapi20150313',
        'fbapi20150629',
        'fbauth',
        'fbauth2',
        'fb-messenger-api20140430'
    ];
    myPlist.LSApplicationQueriesSchemes = LSApplicationQueriesSchemes.concat(myPlist.LSApplicationQueriesSchemes);
    if (myPlist.NSAppTransportSecurity && myPlist.NSAppTransportSecurity.NSExceptionDomains) {
        var facebookDotCom = {};
        /** @namespace myPlist.NSAppTransportSecurity.NSExceptionDomains */
        if (myPlist.NSAppTransportSecurity.NSExceptionDomains['facebook.com']) {
            facebookDotCom = myPlist.NSAppTransportSecurity.NSExceptionDomains['facebook.com'];
        }
        if (!facebookDotCom.NSIncludesSubdomains) {facebookDotCom.NSIncludesSubdomains = true;}
        if (!facebookDotCom.NSThirdPartyExceptionRequiresForwardSecrecy) {facebookDotCom.NSThirdPartyExceptionRequiresForwardSecrecy = false;}
        /** @namespace myPlist.NSAppTransportSecurity */
        myPlist.NSAppTransportSecurity.NSExceptionDomains['facebook.com'] = facebookDotCom;
        qmLog.info('Updated facebook.com');
        var fbcdnDotNet = {};
        if (myPlist.NSAppTransportSecurity.NSExceptionDomains['fbcdn.net']) {fbcdnDotNet = myPlist.NSAppTransportSecurity.NSExceptionDomains['fbcdn.net'];}
        if (!fbcdnDotNet.NSIncludesSubdomains) {fbcdnDotNet.NSIncludesSubdomains = true;}
        if (!fbcdnDotNet.NSThirdPartyExceptionRequiresForwardSecrecy) {fbcdnDotNet.NSThirdPartyExceptionRequiresForwardSecrecy = false;}
        myPlist.NSAppTransportSecurity.NSExceptionDomains['fbcdn.net'] = fbcdnDotNet;
        qmLog.info('Updated fbcdn.net');
        // akamaihd.net
        var akamaihdDotNet = {};
        if (myPlist.NSAppTransportSecurity.NSExceptionDomains['akamaihd.net']) {
            akamaihdDotNet = myPlist.NSAppTransportSecurity.NSExceptionDomains['akamaihd.net'];
        }
        if (!akamaihdDotNet.NSIncludesSubdomains) {akamaihdDotNet.NSIncludesSubdomains = true;}
        if (!akamaihdDotNet.NSThirdPartyExceptionRequiresForwardSecrecy) {akamaihdDotNet.NSThirdPartyExceptionRequiresForwardSecrecy = false;}
        myPlist.NSAppTransportSecurity.NSExceptionDomains['akamaihd.net'] = akamaihdDotNet;
        qmLog.info('Updated akamaihd.net');
    }
    fs.writeFile('platforms/ios/' + qmGulp.getAppDisplayName() + '/' + qmGulp.getAppDisplayName() + '-Info.plist', plist.build(myPlist), 'utf8', function (err) {
        if (err) {
            qmLog.error('ERROR: error writing to plist', err);
            deferred.reject();
        } else {
            qmLog.info('successfully updated plist');
            deferred.resolve();
        }
    });
    return deferred.promise;
});
gulp.task('addPodfile', function () {
    var change = require('gulp-change');
    var deferred = q.defer();
    if (!qmGulp.getAppDisplayName()) {deferred.reject('Please export appSettings.appDisplayName');}
    var addBugsnagToPodfile = function () {
        fs.readFile('./platforms/ios/Podfile', function (err, data) {
            if (err) {throw err;}
            //if(data.indexOf('pod \'Bugsnag\', :git => "https://github.com/bugsnag/bugsnag-cocoa.git"') < 0){
            if (data.indexOf('Bugsnag') < 0) {
                qmLog.info('no Bugsnag detected');
                gulp.src('./platforms/ios/Podfile')
                    .pipe(change(function (content) {
                        var bugsnag_str = 'target \'' + qmGulp.getAppDisplayName() + '\' do \npod \'Bugsnag\', :git => "https://github.com/bugsnag/bugsnag-cocoa.git"';
                        qmLog.info('Bugsnag Added to Podfile');
                        deferred.resolve();
                        return content.replace(/target.*/g, bugsnag_str);
                    }))
                    .pipe(gulp.dest('./platforms/ios/'));
            } else {
                qmLog.info('Bugsnag already present in Podfile');
                deferred.resolve();
            }
        });
    };
    fs.exists('./platforms/ios/Podfile', function (exists) {
        if (exists) {
            qmLog.info('Podfile');
            addBugsnagToPodfile();
        } else {
            qmLog.info('PODFILE REPO NOT FOUND, Installing it First');
            var commands = [
                'cd ./platforms/ios',
                'pod init'
            ].join(' && ');
            execute(commands, function (error) {
                if (error !== null) {
                    qmLog.error('ERROR: There was an error detected', error);
                    deferred.reject();
                } else {
                    qmLog.info('\n***Podfile Added****');
                    addBugsnagToPodfile();
                }
            });
        }
    });
    return deferred.promise;
});
gulp.task('addInheritedToOtherLinkerFlags', function () {
    var change = require('gulp-change');
    return gulp.src('./platforms/ios/' + qmGulp.getAppDisplayName() + '.xcodeproj/project.pbxproj')
        .pipe(change(function (content) {
            return content.replace(/OTHER_LDFLAGS(\s+)?=(\s+)?(\s+)\(/g, 'OTHER_LDFLAGS = (\n\t\t\t\t\t"$(inherited)",');
        }))
        .pipe(gulp.dest('./platforms/ios/' + qmGulp.getAppDisplayName() + '.xcodeproj/'));
});
gulp.task('addDeploymentTarget', function () {
    var change = require('gulp-change');
    return gulp.src('./platforms/ios/' + qmGulp.getAppDisplayName() + '.xcodeproj/project.pbxproj')
        .pipe(change(function (content) {
            if (content.indexOf('IPHONEOS_DEPLOYMENT_TARGET') === -1) {
                return content.replace(/ENABLE_BITCODE(\s+)?=(\s+)?(\s+)NO\;/g, 'IPHONEOS_DEPLOYMENT_TARGET = 6.0;\ENABLE_BITCODE = NO;');
            }
            return content;
        }))
        .pipe(change(function (content) {
            qmLog.info('*****************\n\n\n', content, '\n\n\n*****************');
        }))
        .pipe(gulp.dest('./platforms/ios/' + qmGulp.getAppDisplayName() + '.xcodeproj/'));
});
gulp.task('installPods', ['addPodfile'], function () {
    var deferred = q.defer();
    var commands = [
        'cd platforms/ios',
        'pod install'
    ].join(' && ');
    execute(commands, function (error) {
        if (error !== null) {
            qmLog.error('ERROR: There was an error detected', error);
            deferred.reject();
        } else {
            qmLog.info('\n***Pods Installed****');
            deferred.resolve();
        }
    });
    return deferred.promise;
});
gulp.task('addBugsnagInObjC', function () {
    var change = require('gulp-change');
    return gulp.src('./platforms/ios/' + qmGulp.getAppDisplayName() + '/Classes/AppDelegate.m')
        .pipe(change(function (content) {
            if (content.indexOf('Bugsnag') !== -1) {
                qmLog.info('Bugsnag Already Present');
                return content;
            } else {
                content = content.replace(/#import "MainViewController.h"/g, '#import "MainViewController.h"\n#import "Bugsnag.h"');
                content = content.replace(/self\.window\.rootViewController(\s)?=(\s)?self\.viewController\;/g, '[Bugsnag startBugsnagWithApiKey:@"ae7bc49d1285848342342bb5c321a2cf"];\n\tself.window.rootViewController = self.viewController;');
                qmLog.info('Bugsnag Added');
            }
            return content;
        }))
        .pipe(gulp.dest('./platforms/ios/' + qmGulp.getAppDisplayName() + '/Classes/'));
});
gulp.task('enableBitCode', function () {
    var change = require('gulp-change');
    return gulp.src('./platforms/ios/' + qmGulp.getAppDisplayName() + '.xcodeproj/project.pbxproj')
        .pipe(change(function (content) {
            return content.replace(/FRAMEWORK_SEARCH_PATHS(\s*)?=(\s*)?\(/g, 'ENABLE_BITCODE = NO;\n\t\t\t\tFRAMEWORK_SEARCH_PATHS = (');
        }))
        .pipe(gulp.dest('./platforms/ios/' + qmGulp.getAppDisplayName() + '.xcodeproj/'));
});
gulp.task('makeIosApp', function (callback) {
    runSequence(
        'deleteIOSApp',
        'deleteFacebookPlugin',
        'googleServicesPList',
        'platform-add-ios',
        //'cordova-plugin-rm-cordova-plugin-console', // Can't seem to catch exception when plugin not present
        'ionicResources',
        'addFacebookPlugin',
        //'addGooglePlusPlugin',
        'fixResourcesPlist',
        'addBugsnagInObjC',
        'enableBitCode',
        'addInheritedToOtherLinkerFlags',
        'addDeploymentTarget',
        'addPodfile',
        'installPods',
        callback);
});
gulp.task('makeIosAppSimplified', function (callback) {
    runSequence(
        'fixResourcesPlist',
        'enableBitCode',
        'addInheritedToOtherLinkerFlags',
        'addDeploymentTarget',
        callback);
});
gulp.task('replaceRelativePathsWithAbsolutePaths', [], function () {
    if(!qmGulp.releaseService.isProduction() && !qmGulp.releaseService.isStaging()){
        qmLog.info("Not replacing relative urls with Github hosted ones because release stage is: " + qmGulp.releaseService.getReleaseStage());
        return;
    }
    qmLog.info("release stage is " + qmGulp.releaseService.getReleaseStage());
    var url = 'https://'+qmGulp.releaseService.getReleaseStageSubDomain()+'.quantimo.do/';
    var options = {logs: {enabled: true, notReplaced: true}};
    return gulp.src(['www/index.html'], {base: '.'})
        .pipe(replace('src="scripts', 'src="'+url+'scripts', options))
        .pipe(replace('src="lib', 'src="'+url+'lib', options))
        .pipe(replace('href="css', 'href="'+url+'css', options))
        .pipe(replace('href="lib', 'href="'+url+'lib', options))
        .pipe(gulp.dest('./'));
});
var uncommentedCordovaScript = '<script src="cordova.js"></script>';
var commentedCordovaScript = '<!-- cordova.js placeholder -->';
gulp.task('uncommentCordovaJsInIndexHtml', function () {
    return replaceTextInFiles(['src/index.html'], commentedCordovaScript, uncommentedCordovaScript);
});
gulp.task('uncommentBugsnagInIndexHtml', function () {
    return replaceTextInFiles(['src/index.html'], '<!--<script src="lib/bugsnag/dist/bugsnag.js"></script>-->',
        '<script src="lib/bugsnag/dist/bugsnag.js"></script>');
});
gulp.task('uncommentOpbeatInIndexHtml', function () {
    return replaceTextInFiles(['src/index.html'], '<!--<script src="lib/opbeat-angular/opbeat-angular.min.js"></script>-->',
        '<script src="lib/opbeat-angular/opbeat-angular.min.js"></script>');
});
gulp.task('commentOrUncommentCordovaJs', function () {
    if(process.env.BUILD_IOS || process.env.BUILD_ANDROID){
        console.log("Uncommenting cordova.js because process.env.BUILD_IOS or process.env.BUILD_ANDROID is true");
        return replaceTextInFiles(['src/index.html'], commentedCordovaScript, uncommentedCordovaScript);
    }
    console.log("Commenting cordova.js because neither process.env.BUILD_IOS or process.env.BUILD_ANDROID are true");
    return replaceTextInFiles(['src/index.html'], uncommentedCordovaScript, commentedCordovaScript);
});
gulp.task('setVersionNumberInFiles', function () {
    var filesToUpdate = [
        //paths.www.defaultConfig,
        '.travis.yml',
        'resources/chrome_app/manifest.json'
    ];
    return gulp.src(filesToUpdate, {base: '.'})
        .pipe(replace('IONIC_IOS_APP_VERSION_NUMBER_PLACEHOLDER', qmGulp.buildInfoHelper.buildInfo.versionNumbers.iosCFBundleVersion))
        .pipe(replace('IONIC_APP_VERSION_NUMBER_PLACEHOLDER', qmGulp.buildInfoHelper.buildInfo.versionNumbers.ionicApp))
        .pipe(gulp.dest('./'));
});
gulp.task('writeCommitSha', ['getAppConfigs'], function () {
    return qmGulp.buildInfoHelper.writeCommitSha();
});
gulp.task('ic_notification', function () {
    gulp.src('./resources/android/res/**')
        .pipe(gulp.dest('./platforms/android/res'));
});
gulp.task('template', function (done) {
    var templateCache = require('gulp-angular-templatecache');
    gulp.src('./www/templates/**/*.html')
        .pipe(templateCache({
            standalone: true,
            root: 'templates'
        }))
        .pipe(gulp.dest('./public'))
        .on('end', done);
});
gulp.task('setEnvsFromBranchName', [], function (callback) {
    runSequence(
        'setClientId',
        'getAppConfigs',
        callback);
});
gulp.task('setMediModoEnvs', [], function (callback) {
    QUANTIMODO_CLIENT_ID = 'medimodo';
    runSequence(
        'getAppConfigs',
        callback);
});
gulp.task('setMoodiModoEnvs', [], function (callback) {
    QUANTIMODO_CLIENT_ID = 'moodimodoapp';
    runSequence(
        'getAppConfigs',
        callback);
});
gulp.task('setAppEnvs', ['setClientId'], function (callback) {
    runSequence(
        'getAppConfigs',
        callback);
});
gulp.task('setQuantiModoEnvs', [], function (callback) {
    QUANTIMODO_CLIENT_ID = 'quantimodo';
    runSequence(
        'getAppConfigs',
        callback);
});
gulp.task('cleanResources', [], function () {
    return cleanFolder('resources');
});
gulp.task('cleanPlugins', [], function () {
    return cleanFolder('plugins');
});
gulp.task('cleanPlatformsAndroid', [], function () {
    return cleanFolder('platforms/android');
});
gulp.task('cleanPlatforms', [], function () {
    return cleanFolder('platforms');
});
function cleanFiles(filesArray) {
    var clean = require('gulp-rimraf');
    qmLog.info("Cleaning " + JSON.stringify(filesArray) + '...');
    return gulp.src(filesArray, {read: false}).pipe(clean());
}
function cleanFolder(folderPath) {
    var clean = require('gulp-rimraf');
    qmLog.info("Cleaning " + folderPath + " folder...");
    return gulp.src(folderPath + '/*', {read: false}).pipe(clean());
}
gulp.task('cleanChromeBuildFolder', [], function () {
    return cleanFolder(chromeExtensionBuildPath);
});
gulp.task('cleanCombinedFiles', [], function () {
    qmLog.info("Running cleanCombinedFiles...");
    return cleanFiles([
        'www/css/combined*',
        paths.www.scripts + '/combined*',
        paths.www.scripts + '/*combined-*'
    ]);
});
gulp.task('cleanBuildFolder', [], function () {
    qmLog.info("Cleaning build folder...");
    return cleanFolder(buildPath);
});
gulp.task('cleanWwwFolder', [], function () {
    return cleanFolder('www');
});
gulp.task('cleanWwwLibFolder', [], function () {
    return cleanFolder('www/lib');
});
gulp.task('copyAppResources', [
    //'cleanResources'
], function () {
    if(!QUANTIMODO_CLIENT_ID){
        qmLog.error("No QUANTIMODO_CLIENT_ID so falling back to quantimodo");
        QUANTIMODO_CLIENT_ID = 'quantimodo';
    }
    qmLog.info('If this doesn\'t work, make sure there are no symlinks in the apps folder!');
    var sourcePath = 'apps/' + QUANTIMODO_CLIENT_ID + '/**/*';
    qmLog.info("Copying " + sourcePath + "...");
    //return copyFiles(sourcePath, '.');
    return gulp.src([sourcePath], {
        base: 'apps/' + QUANTIMODO_CLIENT_ID
    }).pipe(gulp.dest('.'));
});
gulp.task('copyIonIconsToWww', [], function () {
    return copyFiles('src/lib/Ionicons/**/*', 'www/lib/Ionicons');
});
gulp.task('copyMaterialIconsToWww', [], function () {
    return copyFiles('src/lib/angular-material-icons/*', 'www/lib/angular-material-icons');
});
gulp.task('copySrcToWwwExceptJsLibrariesAndConfigs', [], function () {
    var minify = true;
    //var minify = qmGulp.buildSettings.weShouldMinify(); // I think we should always do this?  When are templates copied otherwise?
    if(minify){
        return copyFiles('src/**/*', 'www', [
            '!src/chcp*',
            '!src/configs',
            '!src/configuration-index.html',
            '!src/default.private_config.json',
            '!src/index.html',
            '!src/js',
            '!src/lib',
            '!src/lib/**',
            '!src/private_configs',
            '!src/qm-amazon',
        ]);
    }
});
gulp.task('_copy-src-to-www', [], function () {
    return copyFiles('src/**/*', 'www', []);
});
gulp.task('_copy-src-js-to-www', [], function () {
    return copyFiles('src/js/**/*', 'www/js');
});
var chromeBackgroundJsFilename = 'qmChromeBackground.js';
gulp.task('chromeBackgroundJS', [], function () {
    // noinspection JSUnusedLocalSymbols
    var uglify      = require('gulp-uglify');
    var concat = require('gulp-concat');
    var base = './src/';
    var chromeScriptsWithBase = [];
    for (var i = 0; i < chromeScripts.length; i++) {
        chromeScriptsWithBase[i] = base + chromeScripts[i];
    }
    return gulp.src(chromeScriptsWithBase)
        //.pipe(uglify())
        .pipe(concat(chromeBackgroundJsFilename))
        .pipe(gulp.dest(chromeExtensionBuildPath));
    //return gulp.src(chromeScriptsWithBase).pipe(babel({presets: ['es2015']})).pipe(uglify()).pipe(gulp.dest(chromeExtensionBuildPath));
    //return gulp.src(chromeScriptsWithBase,  {base: base}).pipe(gulp.dest(chromeExtensionBuildPath));
});
gulp.task('copySrcToAndroidWww', [], function () {
    return copyFiles('src/**/*', 'www'); /// Have to copy to www because android build will overwrite android/assets/www
});
gulp.task('copy-www-img-to-src', [], function () {
    return copyFiles('www/img/**/*', 'src/img/');
});
gulp.task('copyIconsToChromeImg', [], function () {
    return copyFiles('www/img/icons/*', chromeExtensionBuildPath+"/img/icons");
});
gulp.task('copyServiceWorkerFirebaseLocalForage', [], function () {
    return gulp.src( serviceWorkerFirebaseLocalForage, { base: './src' } )
        .pipe( gulp.dest( './www' ));
});
gulp.task('copyOverrideFiles', [], function () {
    return gulp.src( ['overrides/**/*'], { base: './overrides' } )
        .pipe( gulp.dest( '.' ));
});
gulp.task('copyAndroidLicenses', [], function () {
    if(!process.env.ANDROID_HOME){
        qmLog.error("Please pass ANDROID_HOME environmental variable to gulp task");
        return;
    }
    return copyFiles('android-licenses/*', process.env.ANDROID_HOME + '/licenses');
});
gulp.task('copyAndroidResources', [], function () {
    return copyFiles('resources/android/**/*', 'platforms/android');
});
gulp.task('copyAndroidBuild', [], function () {
    if (!QUANTIMODO_CLIENT_ID) {throw 'QUANTIMODO_CLIENT_ID not set!';}
    var buildFolderPath = buildPath + '/apks/' + QUANTIMODO_CLIENT_ID; // Non-symlinked apk build folder accessible by Jenkins within Vagrant box
    return copyFiles(paths.apk.outputFolder + '/*.apk', buildFolderPath);
});
gulp.task('copyWwwFolderHtmlToChromeExtension', ['getAppConfigs'], function () {
    return copyFiles('www/*.html', chromeExtensionBuildPath);
});
gulp.task('copyWwwFolderToChromeExtension', ['getAppConfigs'], function () {
    return copyFiles([
        'www/**/*',
        '!www/_redirects',
        "!www/**/*.map"
    ], chromeExtensionBuildPath);
});
gulp.task('copyWwwFolderToAndroidApp', [], function () {
    return copyFiles('www/**/*', 'platforms/android/assets/www');
});
gulp.task('copyWwwIconsToSrc', [], function () {
    return copyFiles(paths.www.icons + "/*", paths.src.icons);
});
gulp.task('removeTransparentPng', [], function () {
    return cleanFiles('resources/icon.png');
});
gulp.task('removeTransparentPsd', [], function () {
    return cleanFiles('resources/icon.psd');
});
gulp.task('useWhiteIcon', ['downloadIcon'], function (callback) {
    execute('convert -flatten resources/icon.png resources/icon.png', callback);
});
gulp.task('bowerInstall', [], function (callback) {
    execute('bower install --allow-root', callback);
});
gulp.task('ionicResourcesIos', [], function (callback) {
    execute('ionic resources ios', function () {
        qmLog.info("Uploading ios resources in case ionic resources ios command breaks");
        zipAndUploadToS3('resources', 'resources-ios');
        callback();
    });
});
gulp.task('generateConfigXmlFromTemplate', ['setClientId', 'getAppConfigs'], function (callback) {
    generateConfigXmlFromTemplate(callback);
});
gulp.task('write-build-json', [], function () {
    return writeBuildJson();
});
gulp.task('build-ios-app-without-cleaning', function (callback) {
    qmPlatform.setBuildingFor(qmPlatform.ios);
    console.warn("If you get `Error: Cannot read property ‘replace’ of undefined`, run the ionic command with --verbose and `cd platforms/ios/cordova && rm -rf node_modules/ios-sim && npm install ios-sim`");
    runSequence(
        'ionicInfo',
        'uncommentCordovaJsInIndexHtml',
        'configureApp',
        //'copyAppResources',
        'generateConfigXmlFromTemplate', // Needs to happen before resource generation so icon paths are not overwritten
        'removeTransparentPng',
        'removeTransparentPsd',
        'useWhiteIcon',
        'ionicResourcesIos',
        'chcp-config-login-build',
        'write-build-json',
        'googleServicesPList',
        'platform-add-ios',
        //'cordova-plugin-rm-cordova-plugin-console', // Can't seem to catch exception when plugin not present
        'ionicInfo',
        'ios-sim-fix',
        'ionic-build-ios',
        //'chcp-deploy', // Let's only do this on Android builds
        //'fastlaneBetaIos',
        callback);
});
gulp.task('build-ios-app', function (callback) {
    qmPlatform.setBuildingFor(qmPlatform.ios);
    console.warn("If you get `Error: Cannot read property ‘replace’ of undefined`, run the ionic command with --verbose and `cd platforms/ios/cordova && rm -rf node_modules/ios-sim && npm install ios-sim`");
    runSequence(
        'ionicInfo',
        'uncommentCordovaJsInIndexHtml',
        'cleanPlugins',
        'configureApp',
        //'copyAppResources',
        'generateConfigXmlFromTemplate', // Needs to happen before resource generation so icon paths are not overwritten
        'platform-remove-ios',
        'removeTransparentPng',
        'removeTransparentPsd',
        'useWhiteIcon',
        'ionicResourcesIos',
        'chcp-config-login-build',
        'write-build-json',
        'googleServicesPList',
        //'cordova-plugin-rm-cordova-plugin-console', // Can't seem to catch exception when plugin not present
        'platform-add-ios',
        'ionicInfo',
        'ios-sim-fix',
        'ionic-build-ios',
        //'chcp-deploy',  // Let's only do this on Android builds
        'fastlaneBetaIos',
        callback);
});
gulp.task('prepare-ios-app', function (callback) {
    qmPlatform.setBuildingFor(qmPlatform.ios);
    console.warn("If you get `Error: Cannot read property ‘replace’ of undefined`, run the ionic command with --verbose and `cd platforms/ios/cordova && rm -rf node_modules/ios-sim && npm install ios-sim`");
    runSequence(
        'platform-remove-ios',
        'ionicInfo',
        'uncommentCordovaJsInIndexHtml',
        'configureApp',
        //'copyAppResources',
        'generateConfigXmlFromTemplate', // Needs to happen before resource generation so icon paths are not overwritten
        'removeTransparentPng',
        'removeTransparentPsd',
        'useWhiteIcon',
        'ionicResourcesIos',
        'write-build-json',
        'googleServicesPList',
        //'cordova-plugin-rm-cordova-plugin-console', // Can't seem to catch exception when plugin not present
        'platform-add-ios',
        callback);
});
gulp.task('prepare-ios-app-without-cleaning', function (callback) {
    qmPlatform.setBuildingFor(qmPlatform.ios);
    console.warn("If you get `Error: Cannot read property ‘replace’ of undefined`, run the ionic command with --verbose and `cd platforms/ios/cordova && rm -rf node_modules/ios-sim && npm install ios-sim`");
    runSequence(
        'ionicInfo',
        'uncommentCordovaJsInIndexHtml',
        'configureApp',
        //'copyAppResources',
        'generateConfigXmlFromTemplate', // Needs to happen before resource genbuild-ios-apperation so icon paths are not overwritten
        'removeTransparentPng',
        'removeTransparentPsd',
        'useWhiteIcon',
        'ionicResourcesIos',
        'write-build-json',
        callback);
});
gulp.task('zipChromeExtension', [], function () {
    return zipAFolder(chromeExtensionBuildPath, getChromeExtensionZipFilename(), buildPath);
});
gulp.task('zipBuild', [], function () {
    return zipAFolder(process.env.BUDDYBUILD_WORKSPACE, "buddybuild.zip", './');
});
gulp.task('uploadBuddyBuildToS3', ['zipBuild'], function () {
    return qmGulp.uploadBuildToS3("buddybuild.zip");
});
// Need configureAppAfterNpmInstall or build-ios-app results in infinite loop
gulp.task('configureAppAfterNpmInstall', [], function (callback) {
    qmLog.info('gulp configureAppAfterNpmInstall');
    if(qmGulp.buildInfoHelper.alreadyMinified()){
        qmLog.info("Not configuring app because already built this commit");
        callback();
        return;
    }
    if(!qmPlatform.buildingFor.web()){
        qmLog.info("Not configuring app after yarn install because we're building for mobile");
        callback();
        return;
    }
    runSequence(
        'configureApp',
        //'deleteWwwPrivateConfig',  // We need this for OAuth login.  It's OK to expose QM client secret because it can't be used to get user data.  We need to require it so it can be changed without changing the client id
        callback);
});
gulp.task('configureApp', [], function (callback) {
    runSequence(
        'deleteSuccessFile',  // I think this breaks iOS build
        'setClientId',
        'rename-adsense',
        'copyIonIconsToWww',
        //'copyMaterialIconsToWww',
        'sass',
        'createProgressiveWebAppManifestInSrcFolder',
        'copySrcToWwwExceptJsLibrariesAndConfigs',
        'commentOrUncommentCordovaJs',
        //'downloadSwaggerJson',
        //'getCommonVariables', // This is in staticData now
        'getConnectors',
        //'getUnits', // This is in staticData now
        //'getVariableCategories',  // This is in staticData now
        'getAppConfigs',
        'writeCommitSha',
        'uncommentBugsnagInIndexHtml',
        //'uncommentOpbeatInIndexHtml',
        'staticDataFile',
        //'uglify-error-debugging',
        'cleanCombinedFiles',
        // Is 'minify-js-generate-css-and-index-html' necessary?  it randomly results in SyntaxError: Unexpected token: keyword (const) 'minify-js-generate-css-and-index-html',
        'minify-js-generate-css-and-android-popup-html',
        'upload-source-maps',
        'downloadIcon',
        'resizeIcons',
        'downloadSplashScreen',
        'copyServiceWorkerFirebaseLocalForage',
        'setVersionNumberInFiles',
        'createSuccessFile',
        callback);
});
gulp.task('_chrome-in-src', ['getAppConfigs'], function (callback) {
    if(!qmGulp.getAppStatus().buildEnabled.chromeExtension){
        qmLog.error("Not building chrome extension because appSettings.appStatus.buildEnabled.chromeExtension is " +
            qmGulp.getAppStatus().buildEnabled.chromeExtension + ".  You can re-enable it at " + getAppDesignerUrl());
        return;
    }
    runSequence(
        'chromeManifestInSrcFolder',
        callback);
});
gulp.task('buildChromeExtension', ['getAppConfigs'], function (callback) {
    qmPlatform.buildingFor.setChrome();
    if(!qmGulp.getAppStatus().buildEnabled.chromeExtension){
        qmLog.error("Not building chrome extension because qm.getAppStatus().buildEnabled.chromeExtension is " +
            qmGulp.getAppStatus().buildEnabled.chromeExtension + ".  You can re-enable it at " + getAppDesignerUrl());
        return;
    }
    runSequence(
        'cleanWwwLibFolder',
        'cleanChromeBuildFolder',
        'bowerInstall',
        'configureApp',
        'copyIonIconsToWww',
        'copyWwwFolderToChromeExtension',
        'buildChromeExtensionWithoutCleaning',
        callback);
});
gulp.task('buildChromeExtensionWithoutCleaning', ['getAppConfigs'], function (callback) {
    qmPlatform.buildingFor.setChrome();
    if(!qmGulp.getAppStatus().buildEnabled.chromeExtension){
        qmLog.error("Not building chrome extension because qm.getAppStatus().buildEnabled.chromeExtension is " +
            qmGulp.getAppStatus().buildEnabled.chromeExtension + ".  You can re-enable it at " + getAppDesignerUrl());
        return;
    }
    runSequence(
        'staticDataFile',
        'downloadQmAmazonJs',
        'downloadIcon',
        'resizeIcons',
        'chromeBackgroundJS',
        'chromeIFrameHtml',
        'chromeOptionsHtml',
        'copyIconsToChromeImg',
        'setVersionNumberInFiles',
        'chromeManifestInBuildFolder',
        //'chromeDefaultConfigJson',
        //'deleteWwwPrivateConfig', // We need this for OAuth login.  It's OK to expose QM client secret because it can't be used to get user data.  We need to require it so it can be changed without changing the client id
        'zipChromeExtension',
        'unzipChromeExtension',
        'validateChromeManifest',
        'upload-chrome-extension-to-s3',
        'post-app-status',
        callback);
});
gulp.task('prepareMoodiModoIos', function (callback) {
    qmPlatform.buildingFor.platform = 'ios';
    runSequence(
        'setMoodiModoEnvs',
        'prepare-ios-app',
        callback);
});
gulp.task('prepareMediModoIos', function (callback) {
    qmPlatform.buildingFor.platform = 'ios';
    runSequence(
        'setMediModoEnvs',
        'prepare-ios-app',
        callback);
});
gulp.task('buildQuantiModo', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'buildChromeExtension',
        'buildAndroidApp',
        'build-ios-app',
        callback);
});
gulp.task('buildQuantiModoIOS', function (callback) {
    qmPlatform.buildingFor.platform = 'ios';
    console.warn("Run `ionic platform add ios` and `ionic build ios` manually after this");
    runSequence(
        'setQuantiModoEnvs',
        'build-ios-app',
        callback);
});
gulp.task('buildMoodiModo', function (callback) {
    runSequence(
        'setMoodiModoEnvs',
        'buildChromeExtension',
        //'buildAndroidApp',
        'build-ios-app',
        callback);
});
gulp.task('buildMediModo', function (callback) {
    runSequence(
        'setMediModoEnvs',
        'buildChromeExtension',
        'buildAndroidApp',
        'build-ios-app',
        callback);
});
gulp.task('buildMediModoIos', function (callback) {
    runSequence(
        'setMediModoEnvs',
        'build-ios-app',
        callback);
});
gulp.task('_build-qm-android', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'buildAndroidApp',
        callback);
});
gulp.task('buildMediModoAndroid', function (callback) {
    runSequence(
        'setMediModoEnvs',
        'buildAndroidAfterCleaning',
        callback);
});
gulp.task('_build-all-chrome', function (callback) {
    runSequence(
        'cleanBuildFolder',
        'setMediModoEnvs',
        'buildChromeExtension',
        'setMoodiModoEnvs',
        'buildChromeExtensionWithoutCleaning',
        'setQuantiModoEnvs',
        'buildChromeExtensionWithoutCleaning',
        callback);
});
gulp.task('downloadQmAmazonJs', function (callback) {
    var git = require('gulp-git');
    git.clone('https://'+qmGit.accessToken+'@github.com/mikepsinn/qm-amazon', {args: './src/qm-amazon'}, function (err) {
        if (err) {qmLog.info(err);}
        callback();
    });
});
gulp.task('clone-ios-build-repo', function (callback) {
    var git = require('gulp-git');
    git.clone('https://'+qmGit.accessToken+'@github.com/mikepsinn/qm-ios-build', function (err) {
        if (err) {qmLog.info(err);}
        callback();
    });
});
gulp.task('copy-ios-build-repo', function () {
    return gulp.src(['qm-ios-build/**', '!.git/**'])
        .pipe(gulp.dest('./'));
});
gulp.task('downloadAllChromeExtensions', function (callback) {
    runSequence(
        'cleanBuildFolder',
        'setMediModoEnvs',
        'downloadChromeExtension',
        'setMoodiModoEnvs',
        'downloadChromeExtension',
        'setQuantiModoEnvs',
        'downloadChromeExtension',
        callback);
});
gulp.task('buildAllIosAppsWithBuildRepo', function (callback) {
    runSequence(
        'clone-ios-build-repo',
        'copy-ios-build-repo',
        'buildAllIosAppsWithoutCleaning',
        callback);
});
gulp.task('buildAllIosAppsWithoutCleaning', function (callback) {
    runSequence(
        'setMoodiModoEnvs',
        'build-ios-app-without-cleaning',
        'setMediModoEnvs',
        'build-ios-app-without-cleaning',
        'setQuantiModoEnvs',
        'build-ios-app-without-cleaning',
        callback);
});
gulp.task('buildAllIosApps', function (callback) {
    runSequence(
        'setMoodiModoEnvs',
        'build-ios-app',
        'setMediModoEnvs',
        'build-ios-app',
        'setQuantiModoEnvs',
        'build-ios-app',
        callback);
});
gulp.task('buildAllAndroidApps', function (callback) {
    runSequence(
        'cleanBuildFolder',
        'prepareRepositoryForAndroid',
        'setMediModoEnvs',
        'buildAndroidApp',
        'setQuantiModoEnvs',
        'buildAndroidApp',
        callback);
});
gulp.task('buildAllAndroidAppsWithCleaning', function (callback) {
    runSequence(
        'setMediModoEnvs',
        'cleanBuildFolder',
        'prepareRepositoryForAndroid',
        'buildAndroidApp',
        'setQuantiModoEnvs',
        'cleanBuildFolder',
        'prepareRepositoryForAndroid',
        'buildAndroidApp',
        callback);
});
gulp.task('buildQuantiModoChromeExtension', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'buildChromeExtension',
        callback);
});
gulp.task('buildMediModoChromeExtension', function (callback) {
    runSequence(
        'setMediModoEnvs',
        'buildChromeExtension',
        callback);
});
// This is a hook so we really shouldn't need it
gulp.task('buildAndReleaseIosApp', function (callback) {
    runSequence(
        'xcodeProjectFix',
        'fastlaneBetaIos',
        callback);
});
gulp.task('fastlaneBetaIos', function (callback) {
    if(!qmGit.isDevelop() && !qmGit.isMaster()){
        qmLog.info("Not doing fastlaneBetaIos because not on develop or master");
        callback();
        return;
    }
    var lane = 'deploy'; // Only works on Mac-Mini for some reason
    if(process.env.TRAVIS){lane = 'beta';} // Only works on Travis for some reason
    // export LC_ALL=en_US.UTF-8 && export LANG=en_US.UTF-8 && export APP_DISPLAY_NAME=MediModo && export APP_IDENTIFIER=com.quantimodo.medimodo && bundle exec fastlane beta
    var command = 'export LC_ALL=en_US.UTF-8 && export LANG=en_US.UTF-8 && bundle exec fastlane ' + lane;
    execute(command, callback);
});
gulp.task('xcodeProjectFix', function (callback) {
    var command = 'ruby hooks/xcodeprojectfix.rb';
    execute(command, callback);
});
gulp.task('cordovaPlatformAddAndroid', function (callback) {
    execute('cordova platform add android', callback);
});
gulp.task('cordovaPlatformRemoveAndroid', function (callback) {
    execute('cordova platform remove android', callback);
});
gulp.task('platform-remove-ios', function (callback) {
    execute('ionic platform remove ios', callback);
});
function buildAndroidDebug(callback){
    qmGulp.getBuildStatus()[convertFilePathToPropertyName(androidArm7DebugApkName)] = "BUILDING";
    qmGulp.getBuildStatus()[convertFilePathToPropertyName(androidX86DebugApkName)] = "BUILDING";
    qmGulp.getBuildStatus().androidDebug = "BUILDING";
    postAppStatus();
    paths.apk.builtApk = paths.apk.combinedDebug;
    try {
        execute(getCordovaBuildCommand('debug', 'android'), callback);
    } catch (e) {
        if(e.message.indexOf("not find gradle wrapper") !== -1){
            qmLog.error("Download Android SDK tools package from https://dl.google.com/android/repository/tools_r25.2.3-windows.zip  and copy e to Android\\sdk ");
        } else {
            throw e;
        }
    }
}
function buildAndroidRelease(callback){
    qmGulp.getBuildStatus()[convertFilePathToPropertyName(androidArm7ReleaseApkName)] = "BUILDING";
    qmGulp.getBuildStatus()[convertFilePathToPropertyName(androidX86ReleaseApkName)] = "BUILDING";
    qmGulp.getBuildStatus().androidRelease = "BUILDING";
    postAppStatus();
    paths.apk.builtApk = paths.apk.combinedRelease;
    execute(getCordovaBuildCommand('release', 'android'), callback);
}
gulp.task('cordovaBuildAndroid', function (callback) {
    try {fs.unlinkSync('platforms/android/assets/www/lib/quagga/server.pem');} catch (e) {}
    if(qmGulp.buildSettings.buildDebug()){
        console.log("Building DEBUG version because process.env.BUILD_DEBUG is true");
        return buildAndroidDebug(callback);
    } else {
        console.log("Building RELEASE version because process.env.BUILD_DEBUG is not true");
        return buildAndroidRelease(callback);
    }
});
gulp.task('prepareQuantiModoIos', function (callback) {
    runSequence(
        'setQuantiModoEnvs',
        'prepare-ios-app',
        callback);
});
gulp.task('_copy-src-and-emulate-android', function (callback) {
    runSequence(
        'uncommentCordovaJsInIndexHtml',
        '_copy-src-to-www',
        'ionicEmulateAndroid',
        callback);
});
gulp.task('_copy-src-and-run-android', function (callback) {
    runSequence(
        'uncommentCordovaJsInIndexHtml',
        '_copy-src-to-www',
        'ionicRunAndroid',
        callback);
});
gulp.task('ionicResourcesAndroid', [], function (callback) {
    cordovaResources(function () {
        qmLog.info("Uploading android resources in case ionic resources command breaks");
        zipAndUploadToS3('resources', 'resources-android');
        callback();
    });
});
gulp.task('ionicRunAndroid', [], function (callback) {
    execute('cordova run android', callback);
});
gulp.task('ionicEmulateAndroid', [], function (callback) {
    execute('cordova emulate android', callback);
});
gulp.task('resizeIcon16', [], function (callback) { return resizeIcon(callback, 16); });
gulp.task('resizeIcon48', [], function (callback) { return resizeIcon(callback, 48); });
gulp.task('resizeIcon128', [], function (callback) { return resizeIcon(callback, 128); });
gulp.task('resizeIcon192', [], function (callback) { return resizeIcon(callback, 192); });
gulp.task('resizeIcon512', [], function (callback) { return resizeIcon(callback, 512); });
gulp.task('resizeIcon700', [], function (callback) { return resizeIcon(callback, 700); });
gulp.task('resizeIcon1024', [], function (callback) { return resizeIcon(callback, 1024); });
gulp.task('resizeIcon1024White', [], function (callback) { return resizeIcon(callback, 1024, true); });
gulp.task('resizeIcons', function (callback) {
    runSequence(
        'resizeIcon16',
        'resizeIcon48',
        'resizeIcon128',
        'resizeIcon192',
        'resizeIcon512',
        'resizeIcon700',
        'resizeIcon1024',
        'resizeIcon1024White',
        'copy-www-img-to-src',
        callback);
});
gulp.task('prepareRepositoryForAndroid', function (callback) {
    qmPlatform.setBuildingFor(qmPlatform.android);
    runSequence(
        'uncommentCordovaJsInIndexHtml',
        'setAppEnvs',
        'generateConfigXmlFromTemplate',  // Must be run before addGooglePlusPlugin or running any other cordova commands
        'cleanPlatforms',
        'cleanPlugins',
        'chcp-clean-config-files',
        'prepareRepositoryForAndroidWithoutCleaning',
        callback);
});
gulp.task('prepareRepositoryForAndroidWithoutCleaning', function (callback) {
    if(!process.env.ANDROID_HOME){throw "ANDROID_HOME env is not set!";}
    console.log("ANDROID_HOME is " + process.env.ANDROID_HOME);
    qmPlatform.setBuildingFor(qmPlatform.android);
    runSequence(
        'setAppEnvs',
        'uncommentCordovaJsInIndexHtml',
        'generateConfigXmlFromTemplate',  // Must be run before addGooglePlusPlugin or running any other cordova commands
        'google-services-json',
        'copyAppResources', // Fixes Source path does not exist: resources/icon.png
        'cordovaPlatformAddAndroid',
        //'ionicAddCrosswalk',
        'ionicInfo',
        callback);
});
gulp.task('buildAndroidAfterCleaning', [], function (callback) {
    runSequence(
        'prepareRepositoryForAndroid',
        'buildAndroidApp',
        callback);
});
gulp.task('buildAndroidApp', ['getAppConfigs'], function (callback) {
    qmPlatform.buildingFor.platform = qmPlatform.android;
    /** @namespace qm.getAppSettings().additionalSettings.monetizationSettings */
    /** @namespace qm.getAppSettings().additionalSettings.monetizationSettings.subscriptionsEnabled.value */
    if(!qmGulp.getMonetizationSettings().playPublicLicenseKey.value && qmGulp.getMonetizationSettings().subscriptionsEnabled.value){
        qmLog.error("Please add your playPublicLicenseKey at " + getAppDesignerUrl());
        qmLog.error("No playPublicLicenseKey so disabling subscriptions on Android build");
        //qm.getMonetizationSettings().subscriptionsEnabled.value = false;
        //generateDefaultConfigJson(qm.staticData.appSettings);
    }
    /** @namespace qm.getAppStatus().buildEnabled */
    /** @namespace qm.getAppStatus().buildEnabled.androidRelease */
    if(!qmGulp.getAppStatus().buildEnabled.androidRelease){
        qmLog.info("Not building android app because qm.getAppStatus().buildEnabled.androidRelease is " +
            qmGulp.getAppStatus().buildEnabled.androidRelease + ".  You can enable it at " + getAppDesignerUrl());
        return;
    }
    outputPluginVersionNumber('de.appplant.cordova.plugin.local-notification');
    //outputPluginVersionNumber('cordova-plugin-local-notifications');
    runSequence(
        'google-services-json',
        'uncommentCordovaJsInIndexHtml',
        'copyAndroidLicenses',
        'bowerInstall',
        'copySrcToWwwExceptJsLibrariesAndConfigs', // Don't copy entire lib because it makes the app and chcp sync huge!
        'configureApp',
        'deleteLargeFilesFromWww',
        'copyAppResources',
        'generateConfigXmlFromTemplate',
        'cordovaPlatformVersionAndroid',
        'decryptBuildJson',
        'generatePlayPublicLicenseKeyManifestJson',
        'downloadAndroidReleaseKeystore',
        'ionicResourcesAndroid',
        'copyAndroidResources',
        'chcp-config-login-build',  // Must be done after all www files are present, but do this early enough to allow time to complete before chcp-deploy is run below
        //'reinstallDrawOverAppsPlugin',
        'ionicInfo',
        //'checkDrawOverAppsPlugin',
        'cordovaBuildAndroid',
        'chcp-deploy', // This should cover iOS as well (except mooodimodoapp)
        'chcp-clean-config-files',
        //'outputArmv7ApkVersionCode',
        //'outputX86ApkVersionCode',
        //'outputCombinedApkVersionCode',
        //"upload-x86-release-apk-to-s3",
        //"upload-armv7-release-apk-to-s3",
        "upload-combined-release-apk-to-s3",
        "upload-combined-debug-apk-to-s3",
        "fastlaneSupplyBeta",
        "post-app-status",
        callback);
});
gulp.task('watch-src', function () {
    var watch = require('gulp-watch');
    var source = './src', destination = './www';
    gulp.src(source + '/**/*', {base: source})
        .pipe(watch(source, {base: source}))
        .pipe(gulp.dest(destination));
});
gulp.task('deleteAppSpecificFilesFromWww', [], function () {
    return cleanFiles([
        //paths.www.defaultConfig,
        paths.www.defaultPrivateConfig,
        paths.www.devCredentials,
        'www/configs/*',
        'www/private_configs/*',
        'www/img/icons/*',
        'www/manifest.json']);
});
gulp.task('deleteLargeFilesFromWww', [], function () {
    return cleanFiles([
        //'www/lib',
        'www/scripts/*.map',
        'www/lib/**/*.map',
        'www/lib/moment-timezone/data',
        'www/lib/highcharts/js',
        'www/lib/angular-material/modules',
    ]);
});
gulp.task('chcp-config-login-build', ['getAppConfigs'], function (callback) {
    if(!qmGulp.chcp.enabled){
        callback();
        return;
    }
    qmGulp.chcp.loginAndBuild(callback);
});
gulp.task('chcp-install-local-dev-plugin', ['copyOverrideFiles'], function (callback) {
    if(!qmGulp.chcp.enabled){
        callback();
        return;
    }
    console.log("After this, run cordova-hcp server and cordova run android in new window");
    var runCommand = "cordova run android";
    if(qmPlatform.isOSX()){runCommand = "cordova emulate ios";}
    qmGulp.chcp.chcpCleanConfigFiles();
    execute("cordova plugin add https://github.com/apility/cordova-hot-code-push-local-dev-addon#646064d0b5ca100cd24f7bba177cc9c8111a6c81 --save",
        function () {
            execute("gulp copyOverrideFiles", function () {
                execute("cordova-hcp server", function () {
                    qmLog.info("Execute command "+ runCommand + " in new terminal now");
                    //callback();
                }, false, false);
            }, false, false);
        }, false, false);
});
gulp.task('chcp-clean-config-files', [], function () {
    if(!qmGulp.chcp.enabled){return;}
    return qmGulp.chcp.chcpCleanConfigFiles();
});
gulp.task('chcp-deploy', ['getAppConfigs'], function (callback) {
    if(!qmGulp.chcp.enabled){
        callback();
        return;
    }
    qmGulp.chcp.outputCordovaHcpJson();
    //qmGulp.chcp.loginBuildAndDeploy(callback);  // Have to build early in sequence to allow time for completion during other build steps so files are ready for deploy
    execute("cordova-hcp deploy", callback, false, true);  // Causes stdout maxBuffer exceeded error
});
gulp.task('ios-sim-fix', [], function (callback) {
    execute("cd platforms/ios/cordova && rm -rf node_modules/ios-sim && npm install ios-sim", callback);
});
gulp.task('generate-service-worker', function(callback) {
    var swPreCache = require('sw-precache');
    var rootDir = 'www';
    swPreCache.write('www/service-worker.js', {
        staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,svg,eot,ttf,woff}'],
        stripPrefix: rootDir
    }, callback);
});
function changeOriginRemote(remoteUrl, callback){
    var git = require('gulp-git');
    git.removeRemote('origin', function (err) {
        if (err) {qmLog.info(err);}
        git.addRemote('origin', remoteUrl, function (err) {
            if (err) {qmLog.info(err);}
            callback();
        });
    });
}
gulp.task('deploy-to-github-pages', ['add-client-remote'], function() {
    var ghPages = require('gulp-gh-pages-will');
    if(process.env.USE_QM_DOMAIN_ON_GITHUB){
        writeToFile('www/CNAME', QUANTIMODO_CLIENT_ID+".quantimo.do");
    } else {
        cleanFiles(['www/CNAME']);
    }
    return gulp.src('./www/**/*').pipe(ghPages({}));
});
gulp.task('add-client-remote', function(callback) {
    setClientId(function () {
        var remoteUrl ="https://" + qmGit.accessToken + "@github.com/mikepsinn/qm-ionic-" + QUANTIMODO_CLIENT_ID + ".git";
        qmLog.info("Deploying to "+ remoteUrl);
        changeOriginRemote(remoteUrl, callback);
    });
});
gulp.task('reset-remote', function(callback) {
    setClientId(function () {
        var remoteUrl ="https://" + qmGit.accessToken + "@github.com/QuantiModo/quantimodo-android-chrome-ios-web-app.git";
        qmLog.info("Resetting remote to "+ remoteUrl);
        changeOriginRemote(remoteUrl, callback);
    });
});
gulp.task('_update-remote-and-deploy-to-github-pages', ['getAppConfigs'], function(callback) {
    runSequence(
        'createSuccessFile',
        'add-client-remote',
        'deploy-to-github-pages',
        'reset-remote',
        'deleteSuccessFile',
        callback);
});
gulp.task('googleServicesPList', ['getAppConfigs'], function() {
    var string =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n' +
        '<plist version="1.0">\n' +
        '<dict>\n' +
        '\t<key>AD_UNIT_ID_FOR_BANNER_TEST</key>\n' +
        '\t<string>ca-app-pub-3940256099942544/2934735716</string>\n' +
        '\t<key>AD_UNIT_ID_FOR_INTERSTITIAL_TEST</key>\n' +
        '\t<string>ca-app-pub-3940256099942544/4411468910</string>\n' +
        '\t<key>CLIENT_ID</key>\n' +
        '\t<string>1052648855194-ifoi5gva7emm5igvpac2kp5u8kt8k8an.apps.googleusercontent.com</string>\n' +
        '\t<key>REVERSED_CLIENT_ID</key>\n' +
        '\t<string>com.googleusercontent.apps.1052648855194-ifoi5gva7emm5igvpac2kp5u8kt8k8an</string>\n' +
        '\t<key>ANDROID_CLIENT_ID</key>\n' +
        '\t<string>1052648855194-6ag9aqacrharin4at9pfdh4h01j89iio.apps.googleusercontent.com</string>\n' +
        '\t<key>API_KEY</key>\n' +
        '\t<string>'+process.env.FIREBASE_API_KEY+'</string>\n' +
        '\t<key>GCM_SENDER_ID</key>\n' +
        '\t<string>1052648855194</string>\n' +
        '\t<key>PLIST_VERSION</key>\n' +
        '\t<string>1</string>\n' +
        '\t<key>BUNDLE_ID</key>\n' +
        '\t<string>'+qmGulp.getAppIdentifier()+'</string>\n' +
        '\t<key>PROJECT_ID</key>\n' +
        '\t<string>quantimo-do</string>\n' +
        '\t<key>STORAGE_BUCKET</key>\n' +
        '\t<string>quantimo-do.appspot.com</string>\n' +
        '\t<key>IS_ADS_ENABLED</key>\n' +
        '\t<true></true>\n' +
        '\t<key>IS_ANALYTICS_ENABLED</key>\n' +
        '\t<false></false>\n' +
        '\t<key>IS_APPINVITE_ENABLED</key>\n' +
        '\t<true></true>\n' +
        '\t<key>IS_GCM_ENABLED</key>\n' +
        '\t<true></true>\n' +
        '\t<key>IS_SIGNIN_ENABLED</key>\n' +
        '\t<true></true>\n' +
        '\t<key>GOOGLE_APP_ID</key>\n' +
        '\t<string>1:1052648855194:ios:b40c24a456cfe8f5</string>\n' +
        '\t<key>DATABASE_URL</key>\n' +
        '\t<string>https://quantimo-do.firebaseio.com</string>\n' +
        '</dict>\n' +
        '</plist>';
    return writeToFile('GoogleService-Info.plist', string);
    //return writeToFile('platforms/ios/'+qm.getAppDisplayName()+'/Resources/GoogleService-Info.plist', string);
});
gulp.task('google-services-json', [], function() {
    var string =
        '{\n' +
        '  "project_info": {\n' +
        '    "project_number": "1052648855194",\n' +
        '    "firebase_url": "https://quantimo-do.firebaseio.com",\n' +
        '    "project_id": "quantimo-do",\n' +
        '    "storage_bucket": "quantimo-do.appspot.com"\n' +
        '  },\n' +
        '  "client": [\n' +
        '    {\n' +
        '      "client_info": {\n' +
        '        "mobilesdk_app_id": "1:1052648855194:android:b40c24a456cfe8f5",\n' +
        '        "android_client_info": {\n' +
        '          "package_name": "'+qmGulp.getAppIdentifier()+'"\n' +
        '        }\n' +
        '      },\n' +
        '      "oauth_client": [\n' +
        '        {\n' +
        '          "client_id": "1052648855194-qdidrqml70rfpiv15ita3on7g7oc20st.apps.googleusercontent.com",\n' +
        '          "client_type": 1,\n' +
        '          "android_info": {\n' +
        '            "package_name": "'+qmGulp.getAppIdentifier()+'",\n' +
        '            "certificate_hash": "aff84d452d36ade90ce1a96c6d11c1ef038837ae"\n' +
        '          }\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194-bd9puomjjr1k0pq2gv6iv8uc4rbgb1d9.apps.googleusercontent.com",\n' +
        '          "client_type": 1,\n' +
        '          "android_info": {\n' +
        '            "package_name": "'+qmGulp.getAppIdentifier()+'",\n' +
        '            "certificate_hash": "c96637dabff2fe6b215692b0a4d1f871affb8ac7"\n' +
        '          }\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194-b02cfhgog3fta60f8p0ehc4ii0ko0g9t.apps.googleusercontent.com",\n' +
        '          "client_type": 3\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194.apps.googleusercontent.com",\n' +
        '          "client_type": 3\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194.project.googleusercontent.com",\n' +
        '          "client_type": 3\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194-b02cfhgog3fta60f8p0ehc4ii0ko0g9t.apps.googleusercontent.com",\n' +
        '          "client_type": 3\n' +
        '        }\n' +
        '      ],\n' +
        '      "api_key": [\n' +
        '        {\n' +
        '          "current_key": "'+process.env.FIREBASE_API_KEY+'"\n' +
        '        }\n' +
        '      ],\n' +
        '      "services": {\n' +
        '        "analytics_service": {\n' +
        '          "status": 1\n' +
        '        },\n' +
        '        "appinvite_service": {\n' +
        '          "status": 2,\n' +
        '          "other_platform_oauth_client": [\n' +
        '            {\n' +
        '              "client_id": "1052648855194-b02cfhgog3fta60f8p0ehc4ii0ko0g9t.apps.googleusercontent.com",\n' +
        '              "client_type": 3\n' +
        '            },\n' +
        '            {\n' +
        '              "client_id": "1052648855194-ifoi5gva7emm5igvpac2kp5u8kt8k8an.apps.googleusercontent.com",\n' +
        '              "client_type": 2,\n' +
        '              "ios_info": {\n' +
        '                "bundle_id": "'+qmGulp.getAppIdentifier()+'",\n' +
        '                "app_store_id": "'+qmGulp.getAppIds().appleId+'"\n' +
        '              }\n' +
        '            }\n' +
        '          ]\n' +
        '        },\n' +
        '        "ads_service": {\n' +
        '          "status": 2\n' +
        '        }\n' +
        '      }\n' +
        '    },\n' +
        '    {\n' +
        '      "client_info": {\n' +
        '        "mobilesdk_app_id": "1:1052648855194:android:0b7c6fd1ab60b28d",\n' +
        '        "android_client_info": {\n' +
        '          "package_name": "com.quantimodo.moodimodoapp"\n' +
        '        }\n' +
        '      },\n' +
        '      "oauth_client": [\n' +
        '        {\n' +
        '          "client_id": "1052648855194-b02cfhgog3fta60f8p0ehc4ii0ko0g9t.apps.googleusercontent.com",\n' +
        '          "client_type": 3\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194-ua30i6hqfk45qa3a9fa9mqpboujsertk.apps.googleusercontent.com",\n' +
        '          "client_type": 1,\n' +
        '          "android_info": {\n' +
        '            "package_name": "com.quantimodo.moodimodoapp",\n' +
        '            "certificate_hash": "c96637dabff2fe6b215692b0a4d1f871affb8ac7"\n' +
        '          }\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194.apps.googleusercontent.com",\n' +
        '          "client_type": 3\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194.project.googleusercontent.com",\n' +
        '          "client_type": 3\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194-b02cfhgog3fta60f8p0ehc4ii0ko0g9t.apps.googleusercontent.com",\n' +
        '          "client_type": 3\n' +
        '        }\n' +
        '      ],\n' +
        '      "api_key": [\n' +
        '        {\n' +
        '          "current_key": "'+process.env.FIREBASE_API_KEY+'"\n' +
        '        }\n' +
        '      ],\n' +
        '      "services": {\n' +
        '        "analytics_service": {\n' +
        '          "status": 2,\n' +
        '          "analytics_property": {\n' +
        '            "tracking_id": "UA-39222734-9"\n' +
        '          }\n' +
        '        },\n' +
        '        "appinvite_service": {\n' +
        '          "status": 2,\n' +
        '          "other_platform_oauth_client": [\n' +
        '            {\n' +
        '              "client_id": "1052648855194-b02cfhgog3fta60f8p0ehc4ii0ko0g9t.apps.googleusercontent.com",\n' +
        '              "client_type": 3\n' +
        '            },\n' +
        '            {\n' +
        '              "client_id": "1052648855194-ifoi5gva7emm5igvpac2kp5u8kt8k8an.apps.googleusercontent.com",\n' +
        '              "client_type": 2,\n' +
        '              "ios_info": {\n' +
        '                "bundle_id": "'+qmGulp.getAppIdentifier()+'",\n' +
        '                "app_store_id": "'+qmGulp.getAppIds().appleId+'"\n' +
        '              }\n' +
        '            }\n' +
        '          ]\n' +
        '        },\n' +
        '        "ads_service": {\n' +
        '          "status": 2\n' +
        '        }\n' +
        '      }\n' +
        '    },\n' +
        '    {\n' +
        '      "client_info": {\n' +
        '        "mobilesdk_app_id": "1:1052648855194:android:88b22d1114b98c3d",\n' +
        '        "android_client_info": {\n' +
        '          "package_name": "'+qmGulp.getAppIdentifier()+'"\n' +
        '        }\n' +
        '      },\n' +
        '      "oauth_client": [\n' +
        '        {\n' +
        '          "client_id": "1052648855194-lse0ugfnigiii3v7npmlpa6dfbhsdn15.apps.googleusercontent.com",\n' +
        '          "client_type": 1,\n' +
        '          "android_info": {\n' +
        '            "package_name": "'+qmGulp.getAppIdentifier()+'",\n' +
        '            "certificate_hash": "943730f4f7c645691ac6bbd5b893707274b2a0ba"\n' +
        '          }\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194-b02cfhgog3fta60f8p0ehc4ii0ko0g9t.apps.googleusercontent.com",\n' +
        '          "client_type": 3\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194-en385jlnknb38ma8om296pnej3i4tjad.apps.googleusercontent.com",\n' +
        '          "client_type": 1,\n' +
        '          "android_info": {\n' +
        '            "package_name": "'+qmGulp.getAppIdentifier()+'",\n' +
        '            "certificate_hash": "559679b24cec5f864e055fd1ae85320f7ab670dc"\n' +
        '          }\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194-9shgemkqn8n5h67rugjioi260223sk3c.apps.googleusercontent.com",\n' +
        '          "client_type": 1,\n' +
        '          "android_info": {\n' +
        '            "package_name": "'+qmGulp.getAppIdentifier()+'",\n' +
        '            "certificate_hash": "c96637dabff2fe6b215692b0a4d1f871affb8ac7"\n' +
        '          }\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194.apps.googleusercontent.com",\n' +
        '          "client_type": 3\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194.project.googleusercontent.com",\n' +
        '          "client_type": 3\n' +
        '        },\n' +
        '        {\n' +
        '          "client_id": "1052648855194-b02cfhgog3fta60f8p0ehc4ii0ko0g9t.apps.googleusercontent.com",\n' +
        '          "client_type": 3\n' +
        '        }\n' +
        '      ],\n' +
        '      "api_key": [\n' +
        '        {\n' +
        '          "current_key": "'+process.env.FIREBASE_API_KEY+'"\n' +
        '        }\n' +
        '      ],\n' +
        '      "services": {\n' +
        '        "analytics_service": {\n' +
        '          "status": 2,\n' +
        '          "analytics_property": {\n' +
        '            "tracking_id": "UA-39222734-7"\n' +
        '          }\n' +
        '        },\n' +
        '        "appinvite_service": {\n' +
        '          "status": 2,\n' +
        '          "other_platform_oauth_client": [\n' +
        '            {\n' +
        '              "client_id": "1052648855194-b02cfhgog3fta60f8p0ehc4ii0ko0g9t.apps.googleusercontent.com",\n' +
        '              "client_type": 3\n' +
        '            },\n' +
        '            {\n' +
        '              "client_id": "1052648855194-ifoi5gva7emm5igvpac2kp5u8kt8k8an.apps.googleusercontent.com",\n' +
        '              "client_type": 2,\n' +
        '              "ios_info": {\n' +
        '                "bundle_id": "'+qmGulp.getAppIdentifier()+'",\n' +
        '                "app_store_id": "'+qmGulp.getAppIds().appleId+'"\n' +
        '              }\n' +
        '            }\n' +
        '          ]\n' +
        '        },\n' +
        '        "ads_service": {\n' +
        '          "status": 2\n' +
        '        }\n' +
        '      }\n' +
        '    }\n' +
        '  ],\n' +
        '  "configuration_version": "1"\n' +
        '}';
    return writeToFile('google-services.json', string);
});
gulp.task('rename-adsense', [], function () {
    var rename = require('gulp-rename');
    qmLog.info("Renaming adsense because of Ad-Block");
    return gulp.src("./src/lib/angular-google-adsense/dist/angular-google-adsense.min.js")
        .pipe(rename("custom-lib/aga.js"))
        .pipe(gulp.dest("./src")); // ./dist/main/text/ciao/goodbye.md
});
gulp.task('merge-dialogflow-export', function() {
    var agent = {entities: {}, intents: {}};
    var agentPath = 'src/data/apiai';
    var entitiesPath = agentPath + '/entities';
    var entityFiles = fs.readdirSync(entitiesPath);
    for (var i = 0; i < entityFiles.length; i++) {
        var entityFileName = entityFiles[i];
        if(entityFileName.indexOf('entries') !== -1){continue;}
        var entityName = entityFileName.replace('.json', '');
        var entityPath = entitiesPath+ '/' + entityFileName;
        agent.entities[entityName] = JSON.parse(fs.readFileSync(entityPath));
        var entriesPath = entitiesPath+'/'+entityName+'_entries_en.json';
        var entries = JSON.parse(fs.readFileSync(entriesPath));
        var entriesString = JSON.stringify(entries);
        if(entriesString.replace){
            entriesString = entriesString.replace('***', '');
        } else {
            qmLog.info("Cannot replace "+entityName);
        }
        agent.entities[entityName].entries = JSON.parse(entriesString);
        writeToFile(entityPath, agent.entities[entityName]);
    }
    var intentsPath = agentPath + '/intents';
    var intentFiles = fs.readdirSync(intentsPath);
    for (i = 0; i < intentFiles.length; i++) {
        var intentFileName = intentFiles[i];
        if(intentFileName.indexOf('usersays') !== -1){continue;}
        var intentName = intentFileName.replace('.json', '');
        var intentPath = intentsPath+ '/' + intentFileName;
        agent.intents[intentName] = JSON.parse(fs.readFileSync(intentPath));
        var userSaysPath = intentsPath+'/'+intentName+'_usersays_en.json';
        try {
            var userSays = JSON.parse(fs.readFileSync(userSaysPath));
            var userSaysString = JSON.stringify(userSays);
            agent.intents[intentName].userSays = JSON.parse(userSaysString);
            writeToFile(intentPath, agent.intents[intentName]);
        } catch (error) {
            qmLog.error(error);
        }
    }
});
gulp.task('lint_report_github', function () {
    var jshint = require('gulp-jshint'),
        jscs = require('gulp-jscs'),
        eslint = require('gulp-eslint'),
        github = require('gulp-github');
    return gulp.src('lib/*.js')
        .pipe(jshint())
        .pipe(jscs()).on('error', function (E) {
            console.log(E.message);   // This handled jscs stream error.
        })
        .pipe(eslint())
        .pipe(github(qmGulp.getGithubOptions()))       // Comment issues in github PR!
        .pipe(github.failThisTask()); // Fail this task when jscs/jshint/eslint issues found.
});
