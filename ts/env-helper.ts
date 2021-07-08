import dotenv from "dotenv"
import * as fileHelper from "./qm.file-helper"
import * as qmLog from "./qm.log"

export const envs = {
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
}

export let paths = {
    apk: {// android\app\build\outputs\apk\release\app-release.apk
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
        appSettings: "src/data/appSettings.js",
        defaultPrivateConfig: "src/default.private_config.json",
        devCredentials: "src/dev-credentials.json",
        firebase: "src/lib/firebase/**/*",
        icons: "src/img/icons",
        js: "src/js/*.js",
        serviceWorker: "src/firebase-messaging-sw.js",
    },
    www: {
        appSettings: "src/data/appSettings.js",
        defaultPrivateConfig: "www/default.private_config.json",
        devCredentials: "www/dev-credentials.json",
        firebase: "www/lib/firebase/",
        icons: "www/img/icons",
        js: "www/js/",
        scripts: "www/scripts",
    },
}

export function getenv(names: string|string[], defaultValue?: null | string): string | null {
    if(!Array.isArray(names)) {names = [names]}
    function getFromProcess(): string | null  {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < names.length; i++) {
            const name = names[i]
            const val = process.env[name]
            if (typeof val !== "undefined" && val !== null && val !== "") {
                // @ts-ignore
                return val
            }
        }
        return null
    }
    let result = getFromProcess()
    if(result !== null) {return result}
    try {
        loadEnv(".env")
        result = getFromProcess()
        if(result !== null) {return result}
        console.info("Could not get "+names.join(" or ")+" from .env file or process.env")
    } catch (e) {
        console.info(e.message+"\n No .env to get "+names.join(" or "))
    }
    return defaultValue || null
}

export function getenvOrException(names: string|string[]): string {
    if(!Array.isArray(names)) {names = [names]}
    const val = getenv(names)
    if (val === null || val === "" || val === "undefined") {
        const msg = `
==================================================================
Please specify
` + names.join(" or ") + `
in .env file in root of project or system environmental variables
==================================================================
`
        qmLog.throwError(msg)
        throw new Error(msg)
    }
    return val
}

export function loadEnv(relativeEnvPath: string) {
    const path = fileHelper.getAbsolutePath(relativeEnvPath)
    console.info("Loading " + path)
    // https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set
    const result = dotenv.config({path})
    if (result.error) {
        throw result.error
    }
    // qmLog.info(result.parsed.name)
}

export function getQMClientIdOrException(): string {
    return getenvOrException(envs.QUANTIMODO_CLIENT_ID)
}

export function getQMClientIdIfSet(): string|null {
    return getenv(envs.QUANTIMODO_CLIENT_ID)
}

export function getQMClientSecret(): string | null {
    return getenv(envs.QUANTIMODO_CLIENT_SECRET)
}

export function getAppHostName() {
    return getenv(envs.APP_HOST_NAME)
}

export function getAccessToken(): string {
    return getenvOrException(envs.QUANTIMODO_ACCESS_TOKEN)
}

export function getGithubAccessToken(): string {
    return getenvOrException([envs.GITHUB_ACCESS_TOKEN_FOR_STATUS, envs.GITHUB_ACCESS_TOKEN, envs.GH_TOKEN])
}

export const qmPlatform = {
    android: "android",
    buildingFor: {
        getPlatformBuildingFor() {
            if(qmPlatform.buildingFor.android()) {return "android"}
            if(qmPlatform.buildingFor.ios()) {return "ios"}
            if(qmPlatform.buildingFor.chrome()) {return "chrome"}
            if(qmPlatform.buildingFor.web()) {return "web"}
            qmLog.error("What platform are we building for?")
            return null
        },
        setChrome() {
            qmPlatform.buildingFor.platform = qmPlatform.chrome
        },
        platform: "",
        web() {
            return !qmPlatform.buildingFor.android() &&
                !qmPlatform.buildingFor.ios() &&
                !qmPlatform.buildingFor.chrome()
        },
        android() {
            if (qmPlatform.buildingFor.platform === "android") { return true }
            if (process.env.BUDDYBUILD_SECURE_FILES) { return true }
            if (process.env.TRAVIS_OS_NAME === "osx") { return false }
            return process.env.BUILD_ANDROID
        },
        ios() {
            if (qmPlatform.buildingFor.platform === qmPlatform.ios) { return true }
            if (process.env.BUDDYBUILD_SCHEME) {return true}
            if (process.env.TRAVIS_OS_NAME === "osx") { return true }
            return process.env.BUILD_IOS
        },
        chrome() {
            if (qmPlatform.buildingFor.platform === qmPlatform.chrome) { return true }
            return process.env.BUILD_CHROME
        },
        mobile() {
            return qmPlatform.buildingFor.android() || qmPlatform.buildingFor.ios()
        },
    },
    chrome: "chrome",
    setBuildingFor(platform: string) {
        qmPlatform.buildingFor.platform = platform
    },
    isOSX() {
        return process.platform === "darwin"
    },
    isLinux() {
        return process.platform === "linux"
    },
    isWindows() {
        return !qmPlatform.isOSX() && !qmPlatform.isLinux()
    },
    getPlatform() {
        if(qmPlatform.buildingFor) {return qmPlatform.buildingFor}
        if(qmPlatform.isOSX()) {return qmPlatform.ios}
        if(qmPlatform.isWindows()) {return qmPlatform.android}
        return qmPlatform.web
    },
    ios: "ios",
    web: "web",
    isBackEnd() {
        return typeof window === "undefined"
    },
}
