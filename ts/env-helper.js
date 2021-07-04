"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qmPlatform = exports.getGithubAccessToken = exports.getAccessToken = exports.getAppHostName = exports.getQMClientSecret = exports.getQMClientIdIfSet = exports.getQMClientIdOrException = exports.loadEnv = exports.getenvOrException = exports.getenv = exports.paths = exports.envs = void 0;
var dotenv_1 = __importDefault(require("dotenv"));
var fileHelper = __importStar(require("./qm.file-helper"));
var qmLog = __importStar(require("./qm.log"));
exports.envs = {
    APP_HOST_NAME: "APP_HOST_NAME",
    AWS_ACCESS_KEY_ID: "AWS_ACCESS_KEY_ID",
    AWS_SECRET_ACCESS_KEY: "AWS_SECRET_ACCESS_KEY",
    BUGSNAG_API_KEY: "BUGSNAG_API_KEY",
    GH_TOKEN: "GH_TOKEN",
    GITHUB_ACCESS_TOKEN: "GITHUB_ACCESS_TOKEN",
    GITHUB_ACCESS_TOKEN_FOR_STATUS: "GITHUB_ACCESS_TOKEN_FOR_STATUS",
    QM_AWS_ACCESS_KEY_ID: "QM_AWS_ACCESS_KEY_ID",
    QM_AWS_SECRET_ACCESS_KEY: "QM_AWS_SECRET_ACCESS_KEY",
    QUANTIMODO_ACCESS_TOKEN: "QUANTIMODO_ACCESS_TOKEN",
    QUANTIMODO_CLIENT_ID: "QUANTIMODO_CLIENT_ID",
    QUANTIMODO_CLIENT_SECRET: "QUANTIMODO_CLIENT_SECRET",
};
exports.paths = {
    apk: {
        arm7Release: "platforms/android/app/build/outputs/apk/release/app-arm7-release.apk",
        builtApk: null,
        combinedDebug: "platforms/android/app/build/outputs/apk/release/app-debug.apk",
        combinedRelease: "platforms/android/app/build/outputs/apk/release/app-release.apk",
        outputFolder: "platforms/android/app/build/outputs/apk",
        x86Release: "platforms/android/app/build/outputs/apk/release/app-x86-release.apk",
    },
    chcpLogin: ".chcplogin",
    sass: ["./src/scss/**/*.scss"],
    src: {
        buildInfo: "src/data/build-info.json",
        defaultPrivateConfig: "src/default.private_config.json",
        devCredentials: "src/dev-credentials.json",
        firebase: "src/lib/firebase/**/*",
        icons: "src/img/icons",
        js: "src/js/*.js",
        serviceWorker: "src/firebase-messaging-sw.js",
        staticData: "src/data/qmStaticData.js",
    },
    www: {
        defaultPrivateConfig: "www/default.private_config.json",
        devCredentials: "www/dev-credentials.json",
        firebase: "www/lib/firebase/",
        icons: "www/img/icons",
        js: "www/js/",
        scripts: "www/scripts",
        staticData: "src/data/qmStaticData.js",
    },
};
function getenv(names, defaultValue) {
    if (!Array.isArray(names)) {
        names = [names];
    }
    function getFromProcess() {
        // tslint:disable-next-line:prefer-for-of
        for (var i = 0; i < names.length; i++) {
            var name_1 = names[i];
            var val = process.env[name_1];
            if (typeof val !== "undefined" && val !== null && val !== "") {
                // @ts-ignore
                return val;
            }
        }
        return null;
    }
    var result = getFromProcess();
    if (result !== null) {
        return result;
    }
    try {
        loadEnv(".env");
        result = getFromProcess();
        if (result !== null) {
            return result;
        }
        console.info("Could not get " + names.join(" or ") + " from .env file or process.env");
    }
    catch (e) {
        console.info(e.message + "\n No .env to get " + names.join(" or "));
    }
    return defaultValue || null;
}
exports.getenv = getenv;
function getenvOrException(names) {
    if (!Array.isArray(names)) {
        names = [names];
    }
    var val = getenv(names);
    if (val === null || val === "" || val === "undefined") {
        var msg = "\n==================================================================\nPlease specify\n" + names.join(" or ") + "\nin .env file in root of project or system environmental variables\n==================================================================\n";
        qmLog.throwError(msg);
        throw new Error(msg);
    }
    return val;
}
exports.getenvOrException = getenvOrException;
function loadEnv(relativeEnvPath) {
    var path = fileHelper.getAbsolutePath(relativeEnvPath);
    console.info("Loading " + path);
    // https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
    var result = dotenv_1.default.config({ path: path });
    if (result.error) {
        throw result.error;
    }
    // qmLog.info(result.parsed.name)
}
exports.loadEnv = loadEnv;
function getQMClientIdOrException() {
    return getenvOrException(exports.envs.QUANTIMODO_CLIENT_ID);
}
exports.getQMClientIdOrException = getQMClientIdOrException;
function getQMClientIdIfSet() {
    return getenv(exports.envs.QUANTIMODO_CLIENT_ID);
}
exports.getQMClientIdIfSet = getQMClientIdIfSet;
function getQMClientSecret() {
    return getenv(exports.envs.QUANTIMODO_CLIENT_SECRET);
}
exports.getQMClientSecret = getQMClientSecret;
function getAppHostName() {
    return getenv(exports.envs.APP_HOST_NAME);
}
exports.getAppHostName = getAppHostName;
function getAccessToken() {
    return getenvOrException(exports.envs.QUANTIMODO_ACCESS_TOKEN);
}
exports.getAccessToken = getAccessToken;
function getGithubAccessToken() {
    return getenvOrException([exports.envs.GITHUB_ACCESS_TOKEN_FOR_STATUS, exports.envs.GITHUB_ACCESS_TOKEN, exports.envs.GH_TOKEN]);
}
exports.getGithubAccessToken = getGithubAccessToken;
exports.qmPlatform = {
    android: "android",
    buildingFor: {
        getPlatformBuildingFor: function () {
            if (exports.qmPlatform.buildingFor.android()) {
                return "android";
            }
            if (exports.qmPlatform.buildingFor.ios()) {
                return "ios";
            }
            if (exports.qmPlatform.buildingFor.chrome()) {
                return "chrome";
            }
            if (exports.qmPlatform.buildingFor.web()) {
                return "web";
            }
            qmLog.error("What platform are we building for?");
            return null;
        },
        setChrome: function () {
            exports.qmPlatform.buildingFor.platform = exports.qmPlatform.chrome;
        },
        platform: "",
        web: function () {
            return !exports.qmPlatform.buildingFor.android() &&
                !exports.qmPlatform.buildingFor.ios() &&
                !exports.qmPlatform.buildingFor.chrome();
        },
        android: function () {
            if (exports.qmPlatform.buildingFor.platform === "android") {
                return true;
            }
            if (process.env.BUDDYBUILD_SECURE_FILES) {
                return true;
            }
            if (process.env.TRAVIS_OS_NAME === "osx") {
                return false;
            }
            return process.env.BUILD_ANDROID;
        },
        ios: function () {
            if (exports.qmPlatform.buildingFor.platform === exports.qmPlatform.ios) {
                return true;
            }
            if (process.env.BUDDYBUILD_SCHEME) {
                return true;
            }
            if (process.env.TRAVIS_OS_NAME === "osx") {
                return true;
            }
            return process.env.BUILD_IOS;
        },
        chrome: function () {
            if (exports.qmPlatform.buildingFor.platform === exports.qmPlatform.chrome) {
                return true;
            }
            return process.env.BUILD_CHROME;
        },
        mobile: function () {
            return exports.qmPlatform.buildingFor.android() || exports.qmPlatform.buildingFor.ios();
        },
    },
    chrome: "chrome",
    setBuildingFor: function (platform) {
        exports.qmPlatform.buildingFor.platform = platform;
    },
    isOSX: function () {
        return process.platform === "darwin";
    },
    isLinux: function () {
        return process.platform === "linux";
    },
    isWindows: function () {
        return !exports.qmPlatform.isOSX() && !exports.qmPlatform.isLinux();
    },
    getPlatform: function () {
        if (exports.qmPlatform.buildingFor) {
            return exports.qmPlatform.buildingFor;
        }
        if (exports.qmPlatform.isOSX()) {
            return exports.qmPlatform.ios;
        }
        if (exports.qmPlatform.isWindows()) {
            return exports.qmPlatform.android;
        }
        return exports.qmPlatform.web;
    },
    ios: "ios",
    web: "web",
    isBackEnd: function () {
        return typeof window === "undefined";
    },
};
//# sourceMappingURL=env-helper.js.map