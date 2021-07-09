// load type definitions that come with Cypress module
/// <reference types="cypress" />

/**
 * @param {string} path
 */
function visitAndCheckUrl (path) {
  cy.visitIonicAndSetApiUrl(path)
  cy.wait(2000)
  cy.url().should('include', path)
}
describe('Reminders', function () {
  /**
   * @param {string} variableCategoryName
   */
  function goToCategoryInbox (variableCategoryName) {
    visitAndCheckUrl(`/#/app/reminders-inbox?variableCategoryName=${variableCategoryName}`)
    //cy.get('#TodayReminders', { timeout: 40000 }).should('exist')
    //cy.get('#TodayReminders').children().should('have.length.above', 0)
  }
    /**
     * @param {string} variableCategoryName
     */
    function goToManageReminders (variableCategoryName) {
        if(!variableCategoryName){ variableCategoryName = 'Anything' }
        cy.loginWithAccessTokenIfNecessary(`/#/app/variable-list-category/${variableCategoryName}`)
    }
  /**
   * @param {string} frequency
   */
  function setFrequency (frequency) {
    cy.log(`Setting frequency to ${frequency}`)
    cy.get('#frequencySelectorMaterial').click({force: true})
      cy.get('md-option').contains(frequency).click({force: true})
  }
  /**
   * @param {number} hour
   * @param {number} minute
   * @param {string} ampm
   */
  function setReminderTime (hour, minute, ampm) {
    cy.log(`Change to ${hour}:${minute} ${ampm} (We want this to be slightly later than other reminders so its always at the top of ` +
            'the reminder inbox.  (Warning: This will fail for 15 minutes every day)')
    cy.get('#materialFirstReminderStartTime', { timeout: 30000 }).click({ force: true })
    cy.get('.dtp-picker-time').contains(hour).click()
    cy.wait(1000)
    cy.get('a').contains(ampm).click()
    cy.wait(1000)
    cy.get('.dtp-picker-time').contains(minute).click()
    cy.wait(1000)
    cy.get('.dtp-btn-ok').contains('OK').click()
    cy.wait(1000)
  }
  function deleteReminders (variableCategoryName) {
      goToManageReminders(variableCategoryName)
    cy.log('Deleting reminders...')
    cy.wait(1000)
    let reminderListSelector = '#remindersList > div'
    let deleted = false
      //cy.debug();
      cy.get("body").then(($body) => {
          let selector = "#showActionSheet-button > i"
          let numberOfReminders = $body.find(selector).length
          cy.log(numberOfReminders + " reminders to delete")
          if (numberOfReminders > 0) { //evaluates as true
              cy.get(selector, { timeout: 30000 })
                  // eslint-disable-next-line no-unused-vars
                  .each(($el, _index, _$list) => {
                      cy.log(`Deleting ${$el.text()} reminder`)
                      cy.wrap($el).click({force: true, timeout: 10000})
                      cy.clickActionSheetButtonContaining('Delete')
                      deleted = true
                  })
          }
      })

    cy.get(reminderListSelector, { timeout: 30000 })
    // eslint-disable-next-line no-unused-vars
            .each(($el, _index, _$list) => {
              let html = $el.html() // $el is a wrapped jQuery element

              if (html.indexOf('showActionSheet') !== -1 && $el.is('visible')) {
                cy.log(`Deleting ${$el.text()} reminder`)
                cy.wrap($el).click()
                cy.clickActionSheetButtonContaining('Delete')
                deleted = true
              } else {
                // It's a header
              }
            })
    if (deleted) {
      cy.log('Waiting for deletions to post...')
      cy.wait(5000)
    }
  }
    function deleteFavorites () {
        cy.loginWithAccessTokenIfNecessary(`/#/app/favorites`)
        cy.log('Deleting favorites...')
        cy.wait(1000)
        cy.get("body").then(($body) => {
            let selector = "#favoriteItemSettings > i"
            let numberOfReminders = $body.find(selector).length
            cy.log(numberOfReminders + " reminders to delete")
            if (numberOfReminders > 0) { //evaluates as true
                cy.get(selector, { timeout: 30000 })
                    // eslint-disable-next-line no-unused-vars
                    .each(($el, _index, _$list) => {
                        cy.log(`Deleting ${$el.text()} reminder`)
                        cy.wrap($el).click({force: true, timeout: 10000})
                        cy.clickActionSheetButtonContaining('Delete')
                        deleted = true
                    })
            }
        })
    }
  /**
   * @param {string} unitName
   */
  function changeUnit (unitName) {
    cy.log(`Changing unit to ${unitName}`)
    cy.get('#unitSelectorMaterial').click()
    cy.get('md-option').contains(unitName).click({ force: true })
  }
  /**
   * @param {string} variableName
   * @param {string} [frequency]
   */
  function addReminder (variableName, frequency) {
    cy.log(`Click Add new reminder for ${variableName}`)
    cy.get('#addReminderButton').click({ force: true })
    cy.searchAndClickTopResult(variableName, true)
    cy.get('#reminder-header').contains(variableName, {matchCase: false})
    if (frequency) {
      setFrequency(frequency)
    }
  }
  /**
   * @param {string} variableName
   * @param {string} frequency
   * @param {string} variableCategoryName
   */
  function deleteRemindersAddOneAndGoToCategoryInbox (variableName, frequency, variableCategoryName) {
    deleteReminders(variableCategoryName)
    addReminder(variableName, frequency)
    saveReminderAndGoToCategoryInbox(variableCategoryName)
  }
  /**
   * @param {string} variableCategoryName
   */
  function saveReminderAndGoToCategoryInbox (variableCategoryName) {
    cy.get('#saveButton').click({ force: true })
    cy.wait(1000) // Have to wait for save to complete
    goToCategoryInbox(variableCategoryName)
  }
    it('Selects a reminder time', function () {
        cy.loginWithAccessTokenIfNecessary('/#/app/reminder-add/', false)
        setReminderTime(8, 15, 'AM')
    })
  it('Creates a goals reminder and skip it', function () {
    let variableName = 'Aaa Test Reminder Goal Skip'
    let variableCategoryName = 'Goals'
    let frequency = '30 minutes'

    deleteRemindersAddOneAndGoToCategoryInbox(variableName, frequency, variableCategoryName)
    cy.get('#notification-skip').click({ force: true })
    cy.get('#notification-skip').should('not.exist')
    deleteReminders(variableCategoryName)
  })
  it('Creates a sleep reminder and changes unit', function () {
    let variableName = 'Sleep Duration'
    let variableCategoryName = 'Sleep'
      cy.log("Deleting all reminders to make sure we can get a sleep notification after reminder creation...")
    deleteReminders('Anything')
    addReminder(variableName)
    //cy.get('#defaultValue').should('not.exist')
    let hour = 8
    let minute = 15
    let ampm = 'AM'

    setReminderTime(hour, minute, ampm)
    cy.get('#saveButton').click({ force: true })

      goToManageReminders(variableCategoryName)
    cy.log('Should not contain reminder time because the frequency is below a day')
    //let firstReminderTime = '#remindersList > div > div > div:nth-child(1) > div.col.col-70 > p';
    let time = `${hour}:${minute}`

    //assertReminderListContains(time);
    cy.get("#valueAndFrequencyTextDescriptionWithTime").should('contain', time)
    cy.wait(1500) // Have to wait for save to complete
    goToCategoryInbox(variableCategoryName)
    cy.get('#notification-settings').click({ force: true, timeout: 15000 })
    cy.url().should('include', '#/app/reminder-add/')
    cy.get('#reminder-header').contains(variableName, {matchCase: false})
    changeUnit('Minutes')
    saveReminderAndGoToCategoryInbox(variableCategoryName)
    cy.log('Click Record different value/time')
    cy.get('#other-value-time-note-button').click({ force: true })
    cy.url().should('include', '#/app/measurement-add')
    //cy.get('#measurementAddCard > div', {timeout: 10000}).should('contain', variableName);
    //cy.get('#defaultValue').type("480", {force: true});
    deleteReminders(variableCategoryName)
  })
  it('Deletes reminders', function () {
    deleteReminders('Sleep')
  })
  it('Creates a food reminder and snoozes it', function () {
    let variableName = 'Aaa Test Reminder Snooze'
    let variableCategoryName = 'Foods'
    let frequency = '30 minutes'

    deleteRemindersAddOneAndGoToCategoryInbox(variableName, frequency, variableCategoryName)
    cy.get('#notification-snooze').click({ force: true })
    cy.get('#notification-snooze').should('not.exist')
    deleteReminders(variableCategoryName)
  })
  it.skip('Creates a symptoms reminder and tracks it', function () {
    let variableName = 'Aaa Test Reminder Variable'
    let variableCategoryName = 'Symptoms'
    let frequency = '30 minutes'
    deleteRemindersAddOneAndGoToCategoryInbox(variableName, frequency, variableCategoryName)
    cy.get('#negativeRatingOptions4').click({ force: true, timeout: 30000 })
    cy.get('#menu-item-chart-search > a').click({ force: true, timeout: 20000 })
    cy.log("waiting for notifications to post after leaving inbox state before checking history...")
      cy.wait('@post-notifications', {timeout: 30000}).its('response.statusCode').should('eq', 201)
    cy.searchAndClickTopResult(variableName, true)
    cy.contains(`${variableName} Over Time`, {timeout: 30000})
    cy.get('#menu-more-button').click({ force: true })
    cy.clickActionSheetButtonContaining('History')
    cy.get('#historyItemTitle-0', { timeout: 30000 }).should('contain', `4/5 ${variableName}`)
    cy.get('#historyItemTitle-0').click({ force: true })
    cy.get('#menu-more-button').click({ force: true })
    cy.clickActionSheetButtonContaining('Analysis Settings')
    cy.get('#variableName', { timeout: 30000 }).should('contain', variableName)
    cy.log('Waiting for action sheet button to update...')
    cy.wait(1000)
    cy.get('#menu-more-button').click({ force: true })
    cy.clickActionSheetButtonContaining('Delete All')
    cy.get('#yesButton').click({ force: true })
    cy.wait(1000)
    deleteReminders(variableCategoryName)
  })
  it('Sets frequency to 30 minutes', function () {
    cy.loginWithAccessTokenIfNecessary('/#/app/reminder-add/', false)
    setFrequency('30 minutes')
  })
  it('Changes unit', function () {
    cy.loginWithAccessTokenIfNecessary('/#/app/reminder-add/', false)
    changeUnit('Minutes')
  })
    it.skip('Adds a favorite and records a measurement with it', function () {
        deleteFavorites()
        cy.loginWithAccessTokenIfNecessary('/#/app/favorites')
        cy.log('Click add a favorite variable')
        cy.get('#addFavoriteBtn').click({ force: true })
        let variableName = 'Aaa Test Treatment'
        cy.searchAndClickTopResult(variableName, true)
        cy.get('#moreOptions').click({ force: true })
        cy.log('Assign default value to 100mg')
        cy.get('#defaultValue').type('100', { force: true })
        cy.get('#saveButton').click({ force: true })
        cy.log('Wait for favorite to save so we are not redirected back to favoriteAdd')
        cy.visitIonicAndSetApiUrl('/#/app/favorites')
        cy.log('Check that favorite was added')
        cy.get('#favoriteItemTitle').should('contain', variableName)
        cy.debug()
        cy.get('#recordDefaultValue', { timeout: 20000 }).should('contain', 'Record ')
        cy.log('Click Record 100 mg')

        cy.get('#recordDefaultValue').click({ force: true, timeout: 20000 })
        cy.get('#favoriteItemTitle').should('contain', '100 mg')
        cy.get('#favoriteItemTitle').should('contain', variableName)
        cy.log(
            'Space out clicks so the first post consistently completes before the second one.  This way we have a consistent 100 value on history page to check.')
        cy.log('Click Record 100 mg')
        //cy.get('#recordDefaultValue').click({ force: true, timeout: 20000 })
        //cy.log('Displayed value from second click (Not sure why test cant detect but it works in real life)')
        //cy.get('#favoriteItemTitle').should('contain', '200 mg')
        cy.get('#favoriteItemTitle').should('contain', variableName)
        cy.log('Click ... settings button')
        cy.get('#favoriteItemSettings', { timeout: 30000 })
            // eslint-disable-next-line no-unused-vars
            .each(($el, _index, _$list) => {
                cy.log(`Deleting ${$el.text()} reminder`)
                cy.wrap($el).click()
                cy.clickActionSheetButtonContaining('Delete')
            })
        //cy.log('Since there are no favorites, the explanation card is showing')
        //cy.get("#noFavoritesExplanation").should('exist');
        //cy.log('There is no favorites list since there are no favorites')
        //cy.get("#favoritesList").should('not.exist')
        cy.log('Posted value from second click')
        cy.visitIonicAndSetApiUrl('/#/app/history-all?variableCategoryName=Treatments')
        //TODO: cy.get('#historyItemTitle-0', { timeout: 30000 }).should('contain', '100 mg '+variableName)
    })
})
