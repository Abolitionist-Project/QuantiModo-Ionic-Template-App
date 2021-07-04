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
exports.readJsonFile = exports.listFilesRecursively = exports.uploadFolderToS3 = exports.download = exports.getAbsolutePath = exports.writeToFile = exports.uploadToS3 = exports.uploadToS3InSubFolderWithCurrentDateTime = exports.downloadFromS3 = exports.getS3Client = exports.deleteFile = exports.createFile = exports.exists = exports.assertExists = exports.assertDoesNotExist = void 0;
// noinspection JSUnusedGlobalSymbols,JSUnusedGlobalSymbols
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var fs = __importStar(require("fs"));
var https = __importStar(require("https"));
var mime = __importStar(require("mime"));
var path = __importStar(require("path"));
var Q = __importStar(require("q"));
var rimraf_1 = __importDefault(require("rimraf"));
var env_helper_1 = require("./env-helper");
var qmLog = __importStar(require("./qm.log"));
var defaultS3Bucket = "qmimages";
// tslint:disable-next-line:no-var-requires
var appRoot = require("app-root-path");
function assertDoesNotExist(relative) {
    var abs = getAbsolutePath(relative);
    if (fs.existsSync(abs)) {
        throw Error(abs + " exists!");
    }
}
exports.assertDoesNotExist = assertDoesNotExist;
function assertExists(relative) {
    var abs = getAbsolutePath(relative);
    if (!fs.existsSync(abs)) {
        throw Error(abs + " does not exist!");
    }
}
exports.assertExists = assertExists;
// require untyped library file
// tslint:disable-next-line:no-var-requires
var qm = require("../src/js/qmHelpers.js");
function exists(filename) {
    var filepath = getAbsolutePath(filename);
    return fs.existsSync(filepath);
}
exports.exists = exists;
function createFile(filePath, contents) {
    return writeToFile(filePath, contents);
}
exports.createFile = createFile;
function deleteFile(filename) {
    var deferred = Q.defer();
    var filepath = getAbsolutePath(filename);
    rimraf_1.default(filepath, function () {
        qmLog.info(filepath + "\n\tdeleted!");
        deferred.resolve();
    });
    return deferred.promise;
}
exports.deleteFile = deleteFile;
function getS3Client() {
    var s3Options = {
        accessKeyId: env_helper_1.getenvOrException([env_helper_1.envs.QM_AWS_ACCESS_KEY_ID, env_helper_1.envs.AWS_ACCESS_KEY_ID]),
        secretAccessKey: env_helper_1.getenvOrException([env_helper_1.envs.QM_AWS_SECRET_ACCESS_KEY, env_helper_1.envs.AWS_SECRET_ACCESS_KEY]),
    };
    return new aws_sdk_1.default.S3(s3Options);
}
exports.getS3Client = getS3Client;
function downloadFromS3(filePath, key, bucketName) {
    if (bucketName === void 0) { bucketName = defaultS3Bucket; }
    var s3 = getS3Client();
    var deferred = Q.defer();
    s3.getObject({
        Bucket: bucketName,
        Key: key,
    }, function (err, data) {
        if (err) {
            if (err.name === "NoSuchKey") {
                console.warn(key + " not found in bucket: " + bucketName);
                deferred.resolve(null);
                return;
            }
            throw err;
        }
        if (data && data.Body) {
            fs.writeFileSync(filePath, data.Body.toString());
            console.log(filePath + " has been created!");
            deferred.resolve(filePath);
        }
        else {
            throw Error(key + " not found in bucket: " + bucketName);
        }
    });
    return deferred.promise;
}
exports.downloadFromS3 = downloadFromS3;
function uploadToS3InSubFolderWithCurrentDateTime(relative, s3BasePath, s3Bucket, accessControlLevel, ContentType) {
    if (s3Bucket === void 0) { s3Bucket = defaultS3Bucket; }
    if (accessControlLevel === void 0) { accessControlLevel = "public-read"; }
    var at = new Date();
    var dateTime = at.toISOString();
    return uploadToS3(relative, s3BasePath + "/" + dateTime + "/" + relative, s3Bucket, accessControlLevel, ContentType);
}
exports.uploadToS3InSubFolderWithCurrentDateTime = uploadToS3InSubFolderWithCurrentDateTime;
function uploadToS3(filePath, s3Key, s3Bucket, accessControlLevel, ContentType) {
    if (s3Bucket === void 0) { s3Bucket = defaultS3Bucket; }
    if (accessControlLevel === void 0) { accessControlLevel = "public-read"; }
    var deferred = Q.defer();
    var s3 = getS3Client();
    var abs = getAbsolutePath(filePath);
    assertExists(abs);
    var fileContent = fs.readFileSync(abs);
    var params = {
        ACL: accessControlLevel,
        Body: fileContent,
        Bucket: s3Bucket,
        Key: s3Key,
    };
    if (!ContentType) {
        try {
            ContentType = mime.getType(s3Key);
        }
        catch (e) {
            qmLog.error(e);
        }
    }
    if (ContentType) {
        // @ts-ignore
        params.ContentType = ContentType;
    }
    s3.upload(params, function (err, SendData) {
        if (err) {
            qmLog.error(s3Key + "\n\t FAILED to uploaded");
            deferred.reject(err);
        }
        else {
            qmLog.info(s3Key + "\n\tuploaded to\t\n" + SendData.Location);
            deferred.resolve(SendData.Location);
        }
    });
    return deferred.promise;
}
exports.uploadToS3 = uploadToS3;
function writeToFile(filePath, contents) {
    var deferred = Q.defer();
    function ensureDirectoryExistence(filePathToCheck) {
        var dirname = path.dirname(filePathToCheck);
        if (fs.existsSync(dirname)) {
            return true;
        }
        ensureDirectoryExistence(dirname);
        fs.mkdirSync(dirname);
    }
    var absolutePath = getAbsolutePath(filePath);
    ensureDirectoryExistence(absolutePath);
    console.log("Writing to " + absolutePath);
    fs.writeFile(absolutePath, contents, function (err) {
        if (err) {
            deferred.reject(err);
        }
        // tslint:disable-next-line:no-console
        console.log(absolutePath + "\n\tsaved!");
        deferred.resolve(absolutePath);
    });
    return deferred.promise;
}
exports.writeToFile = writeToFile;
function getAbsolutePath(relativePath) {
    if (path.isAbsolute(relativePath)) {
        return relativePath;
    }
    else {
        return path.resolve(appRoot.path, relativePath);
    }
}
exports.getAbsolutePath = getAbsolutePath;
function download(url, relative) {
    var deferred = Q.defer();
    var absolutePath = getAbsolutePath(relative);
    var file = fs.createWriteStream(absolutePath);
    qmLog.info("Downloading " + url + " to " + absolutePath + "...");
    https.get(url, function (response) {
        response.pipe(file);
        file.on("finish", function () {
            file.on("close", function () {
                deferred.resolve(absolutePath);
            });
            file.close();
        });
    });
    return deferred.promise;
}
exports.download = download;
function uploadFolderToS3(dir, s3BasePath, s3Bucket, accessControlLevel, ContentType) {
    if (s3Bucket === void 0) { s3Bucket = defaultS3Bucket; }
    if (accessControlLevel === void 0) { accessControlLevel = "public-read"; }
    return listFilesRecursively(dir)
        .then(function (files) {
        var promises = [];
        // @ts-ignore
        files.forEach(function (file) {
            var dirWithForwardSlashes = qm.stringHelper.replaceBackSlashes(dir, "/");
            var fileWithForwardSlashes = qm.stringHelper.replaceBackSlashes(file, "/");
            var relativePath = fileWithForwardSlashes.replace(dirWithForwardSlashes, "");
            var s3Key = s3BasePath + relativePath;
            s3Key = s3Key.replace("\\", "/");
            promises.push(uploadToS3(file, s3Key, s3Bucket, ContentType));
        });
        return Q.all(promises);
    });
}
exports.uploadFolderToS3 = uploadFolderToS3;
function listFilesRecursively(dir) {
    var results = [];
    var deferred = Q.defer();
    fs.readdir(dir, function (err, list) {
        if (err) {
            deferred.reject(err);
            return;
        }
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) {
                deferred.resolve(results);
                return;
            }
            file = path.resolve(dir, file);
            fs.stat(file, function (statErr, stat) {
                if (stat && stat.isDirectory()) {
                    listFilesRecursively(file).then(function (res) {
                        results = results.concat(res);
                        next();
                    });
                }
                else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
    return deferred.promise;
}
exports.listFilesRecursively = listFilesRecursively;
function readJsonFile(jsonPath) {
    try {
        var content = fs.readFileSync(jsonPath).toString();
        return JSON.parse(content);
    }
    catch (e) {
        qmLog.error("Could not read " + jsonPath);
        return false;
    }
}
exports.readJsonFile = readJsonFile;
//# sourceMappingURL=qm.file-helper.js.map