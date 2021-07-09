// ***********************************************************
// This example support/index.js is processed and loaded automatically before your test files.
// This is a great place to put global configuration and behavior that modifies Cypress.
// You can change the location of this file or turn off automatically serving support files with the 'supportFile'
// configuration option. You can read more here: https://on.cypress.io/configuration
// ***********************************************************

import './commands' // Import commands.js using ES2015 syntax:
// eslint-disable-next-line no-unused-vars
// noinspection JSUnusedLocalSymbols
var allowLogging = false // For some reason cypress always logs in staging even if env isn't set
Cypress.on('uncaught:exception', (err, runnable) => {
    if(err.message.indexOf('runnable must have an id') !== false){
        cy.log(err.message)
        return false
    }
    let expectedErrorMessage = Cypress.env('expectedErrorMessage')
    if(expectedErrorMessage){
        expect(err.message).to.include(expectedErrorMessage)
        return false
    }
    cy.log(`Uncaught exception: ${err.message}`)
})
beforeEach(function(){ // runs before each test in the block
    let url = Cypress.config('baseUrl')
    if(!url){
        debugger
        throw Error("baseUrl not set!")
    }
    cy.log(`baseUrl is ${url}`)
    cy.log(`API_HOST is ${Cypress.env('API_HOST')}`)
})
import addContext from 'mochawesome/addContext'
Cypress.on('test:after:run', (test, runnable) => {
    // https://medium.com/@nottyo/generate-a-beautiful-test-report-from-running-tests-on-cypress-io-371c00d7865a
    if(test.state === 'failed'){
        let specName = Cypress.spec.name
        let runnableTitle = runnable.parent.title
        let testTitle = test.title
        const screenshotFileName = `${runnableTitle} -- ${testTitle} (failed).png`
        const folder = Cypress.config('screenshotsFolder') + `/${specName}/`
        const screenshotPath = folder + screenshotFileName
        //const screenshotFileName =  `./${specName}/${runnableTitle.replace(':', '')} -- ${testTitle} (failed).png`
        console.error(`screenshotPath ${screenshotPath}`)
        addContext({test}, screenshotPath)
    }
})
let skip = [
    "[bugsnag] Loaded!",
]
let remove = [
    "https://app.quantimo.do/__cypress/tests?p=",
    "https://staging.quantimo.do/__cypress/tests?p=",
]
function truncate(str, length, ending) {
    if (length == null) { length = 100 }
    if (ending == null) { ending = '...' }
    if (str.length > length) {
        return str.substring(0, length - ending.length) + ending
    }
        return str

}
Cypress.on('window:before:load', (win) => {
    if(allowLogging && Cypress.env('ELECTRON_ENABLE_LOGGING')) {
        win.console.log = (...args) => {  // Needs ELECTRON_ENABLE_LOGGING=1
            try {
                let str = JSON.stringify(args)
                if (str.indexOf("[bugsnag] Loaded") !== -1) {
                    return
                }
                //let baseUrl = Cypress.env('baseUrl');
                //if(str.indexOf('/api/v') !== -1 && str.indexOf(Cypress.env('baseUrl')) === -1){throw "baseUrl is "+baseUrl+" but log message says "+str;}
                if (str && str.length > 1000) {
                    let obj = JSON.parse(str)
                    delete obj.consoleProps // Fix for logrocket spam
                    str = JSON.stringify(obj)
                }
                if (new RegExp(skip.join("|")).test(str)) {
                    return
                }
                for (let i = 0; i < remove.length; i++) {
                    const removeElement = remove[i]
                    str = str.replace(removeElement, '')
                }
                args = JSON.parse(str)
            } catch (e) {
                Cypress.log({
                    name: 'console.log',
                    message: "Could not format log because " + e.message,
                })
            }
            Cypress.log({
                name: 'console.log',
                message: args,
            })
        }
    }
})

Cypress.on('log:added', (options) => {
    if(allowLogging && Cypress.env('ELECTRON_ENABLE_LOGGING')) {
        if (options.instrument === 'command' && options.consoleProps) {
            let detailMessage = ''
            if (options.name === 'xhr') {
                detailMessage = (options.consoleProps.Stubbed === 'Yes' ? 'STUBBED ' : '') + options.consoleProps.Method + ' ' + options.consoleProps.URL
            }
            const message = options.name + ' ' + options.message + (detailMessage !== '' ? ' ' + detailMessage : '')
            console.log(message)
            return
        }
        if (options.instrument === 'command') { // Needs ELECTRON_ENABLE_LOGGING=1
            // eslint-disable-next-line no-console
            let message = `${(options.displayName || options.name || '').toUpperCase()} ${
                options.message
            }`
            if (!options.message || options.message === "") {
                try {
                    message = JSON.stringify(options, null, 2)
                    message = truncate(message, 500)
                } catch (e) {
                    console.log("Could not format log because " + e.message)
                }
            }
            console.log(message)
        }
    }
})

beforeEach(() => {
    cy.server()
    cy.intercept('GET', '/api/v3/measurements*').as('measurements')
    cy.intercept('GET', '/api/v3/variables*').as('get-variables')
    cy.intercept('POST', '/api/v3/measurements*').as('post-measurement')
    cy.intercept('POST', '/api/v3/measurements/delete').as('delete-measurements')
    cy.intercept('POST', '/api/v3/trackingReminderNotifications*').as('post-notifications')
})
