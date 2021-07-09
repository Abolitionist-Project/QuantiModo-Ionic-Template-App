// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
let logLevel = Cypress.env('LOG_LEVEL') || 'info'
const PERMANENT_TEST_USER_ACCESS_TOKEN_FOR_18535 = '42ff4170172357b7312bb127fb58d5ea464943c1'
const ACCESS_TOKEN_TO_GET_OR_CREATE_REFERRER_SPECIFIC_USER = 'test-token'
let accessToken = Cypress.env('ACCESS_TOKEN') || PERMANENT_TEST_USER_ACCESS_TOKEN_FOR_18535 || ACCESS_TOKEN_TO_GET_OR_CREATE_REFERRER_SPECIFIC_USER
let API_HOST = Cypress.env('API_HOST') // API_HOST must be a quantimo.do domain so cypress can clear cookies
let baseUrl = Cypress.config('baseUrl')
let testUserName = 'testuser'
let testUserPassword = 'testing123'
cy.getOAuthAppUrl = function (){
    let oauthAppBaseUrl = Cypress.env('OAUTH_APP_HOST')
    if(oauthAppBaseUrl.indexOf("http") === -1){
        oauthAppBaseUrl = "https://" + oauthAppBaseUrl
    }
    return oauthAppBaseUrl
}
cy.oauthAppIsHTTPS = function (){
    return cy.getOAuthAppUrl().indexOf("https://") === 0
}
Cypress.Commands.add('goToApiLoginPageAndLogin', (email = testUserName, password = testUserPassword) => {
    cy.log(`=== goToApiLoginPageAndLogin as ${email} ===`)
    cy.visitApi(`/api/v2/auth/login?logout=1`)
    cy.enterCredentials('input[name="user_login"]', email,
        'input[name="user_pass"]', password,
        'input[type="submit"]')
})
Cypress.Commands.add('goToMobileConnectPage', () => {
    cy.log(`=== goToMobileConnectPage ===`)
    cy.visitApi(`/api/v1/connect/mobile?log=testuser&pwd=testing123&clientId=ghostInspector`)
    cy.wait(5000)
})
Cypress.Commands.add('logoutViaApiLogoutUrl', () => {
    cy.log(`=== logoutViaApiLogoutUrl ===`)
    cy.visitApi(`/api/v2/auth/logout`).then(() => {
        cy.wait(2000)
        cy.visitApi(`/api/v2/auth/login`).then(() => {
            cy.get('input[name="user_login"]')
                .type(testUserName)
                .clear()
        })
    })
})
/**
 * @return {string}
 */
function UpdateQueryString(key, value, uri){
    let re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i')
    let separator = uri.indexOf('?') !== -1 ? '&' : '?'
    if(uri.match(re)){
        return uri.replace(re, `$1${key}=${value}$2`)
    }
    return `${uri + separator + key}=${value}`
}
Cypress.Commands.add('loginWithAccessTokenIfNecessary', (path = '/#/app/reminders-inbox', waitForAvatar = true) => {
    cy.log(`${path} - loginWithAccessTokenIfNecessary`)
    //let logout = UpdateQueryString('logout', true, path)
    //cy.visitIonicAndSetApiUrl(logout)
    let withToken = UpdateQueryString('access_token', accessToken, path)
    cy.visitIonicAndSetApiUrl(withToken)
    if(waitForAvatar){
        cy.get('#navBarAvatar > img', {timeout: 40000})
    }
})
Cypress.Commands.add('visitIonicAndSetApiUrl', (path = '/#/app/reminders-inbox') => {
    path = UpdateQueryString('apiUrl', API_HOST, path)
    path = UpdateQueryString('logLevel', logLevel, path)
    if(Cypress.env('LOGROCKET')){ path = UpdateQueryString('logrocket', 1, path) }
    let url = path
    if(path.indexOf('http') !== 0){ url = cy.getOAuthAppUrl() + path }
    cy.log(`${url} - visitIonicAndSetApiUrl`)
    cy.visit(url)
})
Cypress.Commands.add('visitWithApiUrlParam', (url, options = {}) => {
    cy.log(`=== visitWithApiUrlParam at ${url} ===`)
    if(!options.qs){
        options.qs = {}
    }
    options.qs.apiUrl = API_HOST
    cy.visit(url, options)
})
// noinspection JSUnusedLocalSymbols
Cypress.Commands.add('visitApi', (url, options = {}) => {
    cy.log(`=== visitApi at ${url} ===`)
    if(!API_HOST || API_HOST === 'undefined'){ throw 'Please set API_HOST env!' }
    if(!options.qs){ options.qs = {} }
    options.qs.XDEBUG_SESSION_START = 'PHPSTORM'
    cy.visit("https://" + API_HOST + url, options)
})
Cypress.Commands.add('containsCaseInsensitive', (selector, content) => {
    function caseInsensitive(str){
        // escape special characters
        // eslint-disable-next-line no-useless-escape
        let input = str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        return new RegExp(`${input}`, 'i')
    }
    cy.get(selector, {timeout: 10000}).contains(caseInsensitive(content))
    return cy
})
Cypress.Commands.add('urlShouldContainCaseInsensitive', (content) => {
    let url = cy.url()
    url = url.toLowerCase()
    content = content.toLowerCase()
    if(url.indexOf(content) === -1){
        throw `URL ${url} does not contain ${content}`
    }
})
Cypress.Commands.add('assertInputValueEquals', (selector, expectedValue) => {
    cy.get(selector, {timeout: 30000})
        .scrollIntoView()
        .should('be.visible')
        .then(function($el){
            expect($el[0].value).to.eq(expectedValue)
        })
})
Cypress.Commands.add('assertInputValueContains', (selector, expectedValue) => {
    cy.get(selector, {timeout: 30000})
        .scrollIntoView()
        .should('be.visible')
        .then(function($el){
            expect($el[0].value).to.contain(expectedValue)
        })
})
Cypress.Commands.add('assertInputValueDoesNotContain', (selector, expectedValue) => {
    cy.get(selector, {timeout: 15000})
        .scrollIntoView()
        .should('be.visible')
        .then(function($el){
            expect($el[0].value).not.to.contain(expectedValue)
        })
})
Cypress.Commands.add('clearAndType', (selector, text) => {
    cy.log("=== clearAndType ===")
    cy.get(selector, {timeout: 15000})
        .scrollIntoView()
        .should('be.visible')
        .clear({force: true})
        .type(text, {force: true})
})
Cypress.Commands.add('enterCredentials', (usernameSelector = 'input[name="user_login"]',
                                          username = 'testuser', passwordSelector = 'input[name="user_pass"]',
                                          password = 'testing123', submitSelectors = 'input[type="submit"]') => {
    cy.log("=== enterCredentials ===")
    cy.get(usernameSelector)
        .click({force: true})
        .type(username, {force: true})
    cy.get(passwordSelector)
        .click({force: true})
        .type(password, {force: true})
    cy.log('Clicking submit')
    if(typeof submitSelectors === 'string'){
        submitSelectors = [submitSelectors]
    }
    submitSelectors.forEach(function(selector){
        cy.get(selector)
            .click({force: true})
        cy.log('Clicked submit')
    })
})
Cypress.Commands.add('disableSpeechAndSkipIntro', () => {
    // Seeing if commenting this fixes run error messages cy.log("=== disableSpeechAndSkipIntro ===")
    if(Cypress.browser.name === 'chrome'){
        cy.get('.pane > div > div > #disableSpeechButton > span', {timeout: 30000}).click()
    }
    cy.get('.slider > .slider-slides > .slider-slide:nth-child(1) > .button-bar > #skipButtonIntro').click()
})
Cypress.Commands.add('enterNewUserCredentials', (clickAccept) => {
    cy.log("=== enterNewUserCredentials ===")
    let d = new Date()
    let newUserLogin = `testuser${d.getTime()}`
    let newUserEmail = `testuser${d.getTime()}@gmail.com`
    cy.get('input[name="user_login"]').type(newUserLogin, {force: true})
    cy.get('input[name="user_email"]').type(newUserEmail, {force: true})
    cy.get('input[name="user_pass"]').click({force: true}).type('qwerty', {force: true})
    cy.get('input[name="user_pass_confirmation"]').click({force: true}).type('qwerty', {force: true})
    cy.get('input[type="submit"]').click({force: true})
    if(clickAccept && baseUrl.indexOf("quantimo.do") === -1){
        cy.log("OAUTH_APP_HOST is external so we have to click approve on oauth page")
        cy.get('#button-approve').click({force: true})
    }
})
Cypress.Commands.add('logOutViaSettingsPage', (useMenuButton = false) => {
    cy.log("=== logOutViaSettingsPage ===")
    if(useMenuButton){
        cy.get('#menu-item-settings').click({force: true})
        cy.get('#menu-item-settings > a').click({force: true})
    }else{
        cy.visitIonicAndSetApiUrl(`/#/app/settings`)
    }
    cy.get('#userName', {timeout: 30000}).click({force: true})
    cy.get('#yesButton').click({force: true})
    cy.log('We should end up back at intro after logout')
    cy.get('#skipButtonIntro').should('exist')
})
Cypress.Commands.add('allowUncaughtException', (expectedErrorMessage) => {
    if(expectedErrorMessage){
        cy.log(`Allowing uncaught exceptions containing ${expectedErrorMessage}`)
    }else{
        cy.log('Disabling allowance of uncaught exceptions')
    }
    Cypress.env('expectedErrorMessage', expectedErrorMessage)
})
Cypress.Commands.add('checkForBrokenImages', () => {
    cy.log('Checking for broken images...')
    cy.wait(2000)
    // noinspection JSUnusedLocalSymbols
    cy.get('img', {timeout: 30000})
    // eslint-disable-next-line no-unused-vars
        .each(($el, index, $list) => {
            if(!$el){
                cy.log(`No $element at index: ${index}`)
                return
            }
            if(!$el[0].naturalWidth){
                let src = $el[0].getAttribute('src')
                cy.url().then((url) => {
                    let message = `The image with src \n  ${src} \n  is broken! \n outerHTML is: \n  ${$el[0].outerHTML}  \n URL: ` + url
                    cy.log(message)
                    throw message
                })
            }
        })
})
Cypress.Commands.add('iframeLoaded', {prevSubject: 'element'}, ($iframe) => {
    const contentWindow = $iframe.prop('contentWindow')
    return new Promise((resolve) => {
        if(
            contentWindow &&
            contentWindow.document.readyState === 'complete'
        ){
            resolve(contentWindow)
        }else{
            $iframe.on('load', () => {
                resolve(contentWindow)
            })
        }
    })
})
Cypress.Commands.add('getInDocument', {prevSubject: 'document'}, (document, selector) => Cypress.$(selector, document))
Cypress.Commands.add('getWithinIframe',
    (targetElement) => cy.get('iframe').iframeLoaded().its('document').getInDocument(targetElement))
/**
 * @param {string} variableName
 * @param {boolean} topResultShouldContainSearchTerm
 */
Cypress.Commands.add('searchAndClickTopResult', (variableName, topResultShouldContainSearchTerm) => {
    cy.log(`=== searchAndClickTopResult for ${variableName} ===`)
    cy.wait(1000)
    cy.get('#variableSearchBox').type(variableName, { force: true, timeout: 5000 })
    let firstResultSelector = '#variable-search-result > div > p'
    cy.log('Wait for search results to load')
    cy.wait(1000) // Wait in case we only have common variables locally
    // Sometimes we just get local variables so we can't cy.wait('@get-variables')
    // cy.wait('@get-variables', {timeout: 30000}).should('have.property', 'status', 200)
    cy.log(`Click on ${variableName} in dropdown search results`)
    if (topResultShouldContainSearchTerm) {
        cy.get(firstResultSelector, { timeout: 20000 })
            .contains(variableName)
            .click({ force: true })
    } else {
        cy.get(firstResultSelector, { timeout: 20000 })
            .click({ force: true })
    }
})
Cypress.Commands.add('setTimeZone', () => {
    cy.log(`=== setTimeZone for ===`)
    // TODO
})
/**
 * @param {string} str
 */
Cypress.Commands.add('clickActionSheetButtonContaining', (str) => {
    cy.log(`${str} Action Sheet Button`)
    cy.wait(2000)
    let button = '.action-sheet-option'
    if (str.indexOf('Delete') !== -1) {
        button = '.destructive'
    }
    cy.get(button, { timeout: 5000 })
        .contains(str)
        .click({ force: true })
})
/**
 * @param {string} str
 */
Cypress.Commands.add('toastContains', (str) => {
    cy.get('.md-toast-text').should('contain', str)
})
//Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));
