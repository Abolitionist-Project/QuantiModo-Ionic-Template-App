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
Object.defineProperty(exports, "__esModule", { value: true });
var qmTests = __importStar(require("./cypress-functions"));
var env_helper_1 = require("./env-helper");
env_helper_1.loadEnv("local");
if (!process.env.ELECTRON_ENABLE_LOGGING) {
    console.log("set env ELECTRON_ENABLE_LOGGING=\"1\" if you want to log to CI.  Disabled by default to avoid leaking secrets on Travis");
}
var specName = process.env.SPEC_NAME;
var PARALLEL = false; // Doesn't work for some reason
if (specName) {
    console.log("Only running process.env.SPEC_NAME " + specName);
    qmTests.runOneCypressSpec(specName, function () {
        console.info("Done with " + specName);
    });
}
else if (PARALLEL) {
    console.log("runCypressTestsInParallel");
    qmTests.runCypressTestsInParallel();
}
else {
    console.log("runLastFailedCypressTest and then run runCypressTests");
    qmTests.runLastFailedCypressTest(function (err) {
        console.log("Done with runLastFailedCypressTest. Going to run all now...");
        if (err) {
            throw err;
        }
        qmTests.runCypressTests();
    });
}
//# sourceMappingURL=cypress-runner.js.map