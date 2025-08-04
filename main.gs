// Fetch current Audit data
function fetchAuditData() {

    let getAuditEndpoint = `/web-audits/${auditId}`
    let auditSettingsObject = apiRequest(getAuditEndpoint,'v2',apiKey,'GET')
    return auditSettingsObject
}

// Push new URL's into Audit settings, mostly using the settings as they were acquired from the GET request, but partially using the inputsin the spreadsheet (i.e. Starting URL's, and Audit limit)
function pushStartingURLs() {

    let currentAuditData = fetchAuditData()
    let putAuditEndpoint = `/web-audits/${auditId}`
    let putAuditObj = {
                        "id": +auditId,
                        "domainId": currentAuditData.domainId,
                        "ownerId": currentAuditData.ownerId,
                        "name": currentAuditData.name,
                        "limit": +auditLimit,
                            // appends each URL with the hard codes UTM values
                        "startingUrls": newStartingURLs.map(url => url + testUTMs),
                        "frequency": currentAuditData.frequency,
                        "schedule": {
                            "dtStart": currentAuditData.schedule.dtStart,
                            "tzId": currentAuditData.schedule.tzId,
                            "recurrenceRule": currentAuditData.schedule.recurrenceRule,
                            "isPaused": currentAuditData.schedule.isPaused
                        },
                        "recipients": currentAuditData.recipients,
                        "nextRun": currentAuditData.nextRun,
                        "filters": currentAuditData.filters,
                        "options": {
                        "location": currentAuditData.options.location,
                        "customProxy": currentAuditData.options.customProxy,
                        "userAgent": currentAuditData.options.userAgent,
                        "requestRate": currentAuditData.options.requestRate,
                        "fireTags": currentAuditData.options.fireTags,
                        "clearCookies": currentAuditData.options.clearCookies,
                        "stripQueryString": currentAuditData.options.stripQueryString,
                        "sameUrlRunId": currentAuditData.options.sameUrlRunId,
                        "loadFlash": currentAuditData.options.loadFlash,
                        "browserWidth": currentAuditData.options.browserWidth,
                        "browserHeight": currentAuditData.options.browserHeight,
                        "vpnEnabled": currentAuditData.options.vpnEnabled,
                        "gpcEnabled": currentAuditData.options.gpcEnabled,
                        "blockThirdPartyCookies": currentAuditData.options.blockThirdPartyCookies,
                        "adobeAuditor": currentAuditData.options.adobeAuditor,
                        "blackoutPeriod": currentAuditData.options.blackoutPeriod,
                        "webHookUrl": currentAuditData.options.webHookUrl,
                        "remoteFileMapConfig": currentAuditData.options.remoteFileMapConfig
                        }
                    }
    apiRequest(putAuditEndpoint,'v2',apiKey,'PUT',putAuditObj)
}

// Run Audit, on the condition that URL's are valid and provided all other previous code/API's worked
function runScan() {

    const urlRegex = new RegExp(
    '^https?:\\/\\/([A-Za-z0-9\\-_.~\\[\\]@!$()*+,;=]+\\.[A-Za-z0-9\\-_.~:?#\\[\\]@!$&()*+,;=]+\\/?$|[A-Za-z0-9\\-_.~\\[\\]@!$()*+,;=]+\\.[A-Za-z0-9\\-_.~\\[\\]@!$()*+,;=]+\\/[A-Za-z0-9\\-_.~:/?#\\[\\]@!$&()*+,;=]+(?:\\.[A-Za-z0-9\\-_.~\\[\\]@!$()*+,;=]+)?$)'
    );

    // Confirm URL's are valid
    if (newStartingURLs.every(url => urlRegex.test(url)) === true) {
        //Confirm user's intent to run Audit
        const response = ui.alert("Confirmation Required","Do you want to run the Audit with the provided URL's?",ui.ButtonSet.YES_NO)
        if (response === ui.Button.YES) {
            let runAuditEndpoint = `/web-audits/${auditId}/runs`
            try {
                pushStartingURLs()
                apiRequest(runAuditEndpoint,'v2',apiKey,'POST',{})
                ui.alert("Audit is running.");
            } catch(e) {
                
            }
        } else {
            ui.alert("Audit canceled.");
        }
    } else {
        //Abandon if URL's are not valid; throw error message
        let badUrls = newStartingURLs.filter(url => !urlRegex.test(url))
        let badUrlsString = badUrls.join("\n")
        ui.alert("Resolve Invlaid URL(s)",badUrlsString,ui.ButtonSet.OK)    }
}

