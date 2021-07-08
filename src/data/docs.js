if(typeof qm === "undefined"){if(typeof window === "undefined") {global.qm = {}; }else{window.qm = {};}}
if(typeof qm.staticData === "undefined"){qm.staticData = {};}
qm.staticData.docs = {
    "basePath": "\/api",
    "consumes": [
        "application\/json"
    ],
    "definitions": {
        "AppSettings": {
            "properties": {
                "additionalSettings": {
                    "description": "What do you expect?",
                    "type": "object"
                },
                "appDescription": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "appDesign": {
                    "description": "What do you expect?",
                    "type": "object"
                },
                "appDisplayName": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "appStatus": {
                    "description": "What do you expect?",
                    "type": "object"
                },
                "appType": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "buildEnabled": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "clientId": {
                    "description": "Get yours at https::\/\/builder.quantimo.do",
                    "type": "string"
                },
                "clientSecret": {
                    "description": "Get yours at https::\/\/builder.quantimo.do",
                    "type": "string"
                },
                "collaborators": {
                    "description": "What do you expect?",
                    "items": {
                        "$ref": "#\/definitions\/User"
                    },
                    "type": "array"
                },
                "createdAt": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "userId": {
                    "description": "User id of the owner of the application",
                    "format": "int32",
                    "type": "integer"
                },
                "users": {
                    "description": "What do you expect?",
                    "items": {
                        "$ref": "#\/definitions\/User"
                    },
                    "type": "array"
                },
                "redirectUri": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "companyName": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "homepageUrl": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "iconUrl": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "longDescription": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "splashScreen": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "textLogo": {
                    "description": "What do you expect?",
                    "type": "string"
                }
            },
            "required": [
                "clientId"
            ]
        },
        "AppSettingsResponse": {
            "properties": {
                "appSettings": {
                    "$ref": "#\/definitions\/AppSettings"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            },
            "required": [
                "description",
                "summary"
            ]
        },
        "AuthorizedClients": {
            "properties": {
                "apps": {
                    "description": "Applications with access to user measurements for all variables",
                    "items": {
                        "$ref": "#\/definitions\/AppSettings"
                    },
                    "type": "array"
                },
                "individuals": {
                    "description": "Individuals such as physicians or family members with access to user measurements for all variables",
                    "items": {
                        "$ref": "#\/definitions\/AppSettings"
                    },
                    "type": "array"
                },
                "studies": {
                    "description": "Studies with access to generally anonymous user measurements for a specific predictor and outcome variable",
                    "items": {
                        "$ref": "#\/definitions\/AppSettings"
                    },
                    "type": "array"
                }
            },
            "required": [
                "apps",
                "individuals",
                "studies"
            ]
        },
        "Button": {
            "properties": {
                "accessibilityText": {
                    "description": "Ex: connect",
                    "type": "string"
                },
                "action": {
                    "description": "Action data",
                    "type": "object"
                },
                "additionalInformation": {
                    "description": "Ex: connect",
                    "type": "string"
                },
                "color": {
                    "description": "Ex: #f2f2f2",
                    "type": "string"
                },
                "confirmationText": {
                    "description": "Text to show user before executing functionName",
                    "type": "string"
                },
                "functionName": {
                    "description": "Name of function to call",
                    "type": "string"
                },
                "parameters": {
                    "description": "Data to provide to functionName or be copied to the card parameters when button is clicked and card is posted to the API",
                    "type": "object"
                },
                "html": {
                    "description": "Ex: connect",
                    "type": "string"
                },
                "id": {
                    "description": "HTML element id",
                    "type": "string"
                },
                "image": {
                    "description": "Ex: https:\/\/image.jpg",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-refresh",
                    "type": "string"
                },
                "link": {
                    "description": "Ex: https:\/\/local.quantimo.do",
                    "type": "string"
                },
                "stateName": {
                    "description": "State to go to",
                    "type": "string"
                },
                "stateParams": {
                    "description": "Data to provide to the state",
                    "type": "object"
                },
                "successToastText": {
                    "description": "Text to show user after executing functionName",
                    "type": "string"
                },
                "successAlertTitle": {
                    "description": "Text to show user after executing functionName",
                    "type": "string"
                },
                "successAlertBody": {
                    "description": "Text to show user after executing functionName",
                    "type": "string"
                },
                "text": {
                    "description": "Ex: Connect",
                    "type": "string"
                },
                "tooltip": {
                    "description": "Ex: This is a tooltip",
                    "type": "string"
                },
                "webhookUrl": {
                    "description": "Post here on button click",
                    "type": "string"
                }
            },
            "required": [
                "link",
                "text"
            ]
        },
        "Card": {
            "properties": {
                "actionSheetButtons": {
                    "items": {
                        "$ref": "#\/definitions\/Button"
                    },
                    "type": "array"
                },
                "avatar": {
                    "description": "Smaller square image",
                    "type": "string"
                },
                "avatarCircular": {
                    "description": "Smaller circular image",
                    "type": "string"
                },
                "backgroundColor": {
                    "description": "Ex: #f2f2f2",
                    "type": "string"
                },
                "buttons": {
                    "items": {
                        "$ref": "#\/definitions\/Button"
                    },
                    "type": "array"
                },
                "buttonsSecondary": {
                    "items": {
                        "$ref": "#\/definitions\/Button"
                    },
                    "type": "array"
                },
                "content": {
                    "description": "Ex: Content",
                    "type": "string"
                },
                "headerTitle": {
                    "description": "Ex: Title",
                    "type": "string"
                },
                "html": {
                    "description": "HTML for the entire card.",
                    "type": "string"
                },
                "htmlContent": {
                    "description": "Ex: <div>Content<\/div>",
                    "type": "string"
                },
                "id": {
                    "description": "HTML element id",
                    "type": "string"
                },
                "image": {
                    "description": "Larger image of variable dimensions",
                    "type": "string"
                },
                "inputFields": {
                    "items": {
                        "$ref": "#\/definitions\/InputField"
                    },
                    "type": "array"
                },
                "ionIcon": {
                    "description": "Ex: ion-refresh",
                    "type": "string"
                },
                "link": {
                    "description": "A link to a web page or something. Not much more to say about that.",
                    "type": "string"
                },
                "parameters": {
                    "description": "Key value pairs derived from user input fields, button clicks, or preset defaults",
                    "type": "object"
                },
                "relatedCards": {
                    "items": {
                        "$ref": "#\/definitions\/Card"
                    },
                    "type": "array"
                },
                "selectedButton": {
                    "description": "Button that the user clicked and the provided function parameters",
                    "$ref": "#\/definitions\/Button"
                },
                "sharingBody": {
                    "description": "Ex: sharingBody",
                    "type": "string"
                },
                "sharingButtons": {
                    "items": {
                        "$ref": "#\/definitions\/Button"
                    },
                    "type": "array"
                },
                "sharingTitle": {
                    "description": "Ex: sharingTitle",
                    "type": "string"
                },
                "subHeader": {
                    "description": "Ex: subTitle",
                    "type": "string"
                },
                "subTitle": {
                    "description": "Ex: subTitle",
                    "type": "string"
                },
                "title": {
                    "description": "Ex: Title",
                    "type": "string"
                }
            },
            "required": [
                "id"
            ]
        },
        "Chart": {
            "properties": {
                "highchartConfig": {
                    "description": " Highcharts config that can be used if you have highcharts.js included on the page",
                    "type": "object"
                },
                "chartId": {
                    "description": "Ex: correlationScatterPlot",
                    "type": "string"
                },
                "chartTitle": {
                    "description": "Ex: Overall Mood following Sleep Duration (R = -0.173)",
                    "type": "string"
                },
                "explanation": {
                    "description": "Ex: The chart above indicates that an increase in Sleep Duration is usually followed by an decrease in Overall Mood.",
                    "type": "string"
                },
                "svgUrl": {
                    "description": "Url to a static svg of the chart",
                    "type": "string"
                },
                "svg": {
                    "description": "SVG string than can be embedded directly in HTML",
                    "type": "string"
                }
            }
        },
        "CommonResponse": {
            "properties": {
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            },
            "required": [
                "description",
                "summary"
            ],
            "type": "object"
        },
        "ConnectInstructions": {
            "properties": {
                "parameters": {
                    "items": {
                        "type": "object"
                    },
                    "description": "Create a form with these fields and post the key and user submitted value to the provided connect url",
                    "type": "array"
                },
                "url": {
                    "description": "URL to open to connect",
                    "type": "string"
                },
                "usePopup": {
                    "description": "True if should open auth window in popup",
                    "type": "boolean"
                }
            },
            "required": [
                "url"
            ]
        },
        "ConversionStep": {
            "properties": {
                "operation": {
                    "description": "ADD or MULTIPLY",
                    "enum": [
                        "ADD",
                        "MULTIPLY"
                    ],
                    "type": "string"
                },
                "value": {
                    "description": "This specifies the order of conversion steps starting with 0",
                    "format": "double",
                    "type": "number"
                }
            },
            "required": [
                "operation",
                "value"
            ]
        },
        "Correlation": {
            "properties": {
                "averageDailyHighCause": {
                    "description": "Ex: 4.19",
                    "format": "double",
                    "type": "number"
                },
                "averageDailyLowCause": {
                    "description": "Ex: 1.97",
                    "format": "double",
                    "type": "number"
                },
                "averageEffect": {
                    "description": "Ex: 3.0791054117396",
                    "format": "double",
                    "type": "number"
                },
                "averageEffectFollowingHighCause": {
                    "description": "Ex: 3.55",
                    "format": "double",
                    "type": "number"
                },
                "averageEffectFollowingLowCause": {
                    "description": "Ex: 2.65",
                    "format": "double",
                    "type": "number"
                },
                "averageForwardPearsonCorrelationOverOnsetDelays": {
                    "description": "Ex: 0.396",
                    "format": "double",
                    "type": "number"
                },
                "averageReversePearsonCorrelationOverOnsetDelays": {
                    "description": "Ex: 0.453667",
                    "format": "double",
                    "type": "number"
                },
                "averageVote": {
                    "description": "Ex: 0.9855",
                    "type": "number"
                },
                "causeChanges": {
                    "description": "Ex: 164",
                    "type": "integer"
                },
                "causeDataSource": {
                    "$ref": "#\/definitions\/DataSource"
                },
                "causeUserVariableShareUserMeasurements": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "causeVariableCategoryId": {
                    "description": "Ex: 6",
                    "type": "integer"
                },
                "causeVariableCategoryName": {
                    "description": "Ex: Sleep",
                    "type": "string"
                },
                "causeVariableCombinationOperation": {
                    "description": "Ex: MEAN",
                    "type": "string"
                },
                "causeVariableUnitAbbreviatedName": {
                    "description": "Ex: \/5",
                    "type": "string"
                },
                "causeVariableId": {
                    "description": "Ex: 1448",
                    "type": "integer"
                },
                "causeVariableMostCommonConnectorId": {
                    "description": "Ex: 6",
                    "type": "integer"
                },
                "causeVariableName": {
                    "description": "Ex: Sleep Quality",
                    "type": "string"
                },
                "confidenceInterval": {
                    "description": "Ex: 0.14344467795996",
                    "format": "double",
                    "type": "number"
                },
                "confidenceLevel": {
                    "description": "Ex: high",
                    "type": "string"
                },
                "correlationCoefficient": {
                    "description": "Ex: 0.538",
                    "format": "double",
                    "type": "number"
                },
                "correlationIsContradictoryToOptimalValues": {
                    "description": "Ex: false",
                    "type": "boolean"
                },
                "createdAt": {
                    "description": "Ex: 2016-12-28 20:47:30 UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "criticalTValue": {
                    "description": "Calculated Statistic: Ex: 1.646",
                    "format": "double",
                    "type": "number"
                },
                "direction": {
                    "description": "Ex: higher",
                    "type": "string"
                },
                "durationOfAction": {
                    "description": "User-Defined Variable Setting: The amount of time over which a predictor\/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus\/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.  Unit: Seconds",
                    "type": "integer"
                },
                "durationOfActionInHours": {
                    "description": "User-Defined Variable Setting: The amount of time over which a predictor\/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus\/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.  Unit: Hours",
                    "format": "float",
                    "type": "number"
                },
                "degreesOfFreedom": {
                    "description": "Ex: 200",
                    "type": "integer"
                },
                "effectNumberOfProcessedDailyMeasurements": {
                    "description": "Ex: 145",
                    "type": "integer"
                },
                "error": {
                    "description": "Ex: optimalPearsonProduct is not defined",
                    "type": "string"
                },
                "effectChanges": {
                    "description": "Ex: 193",
                    "type": "integer"
                },
                "effectDataSource": {
                    "$ref": "#\/definitions\/DataSource"
                },
                "effectSize": {
                    "description": "Ex: moderately positive",
                    "type": "string"
                },
                "effectUnit": {
                    "description": "Ex: \/5",
                    "type": "string"
                },
                "effectUserVariableShareUserMeasurements": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "effectVariableCategoryId": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "effectVariableCategoryName": {
                    "description": "Ex: Emotions",
                    "type": "string"
                },
                "effectVariableCombinationOperation": {
                    "description": "Ex: MEAN",
                    "type": "string"
                },
                "effectVariableCommonAlias": {
                    "description": "Ex: Mood_(psychology)",
                    "type": "string"
                },
                "effectVariableUnitAbbreviatedName": {
                    "description": "Ex: \/5",
                    "type": "string"
                },
                "effectVariableUnitId": {
                    "description": "Ex: 10",
                    "type": "integer"
                },
                "effectVariableUnitName": {
                    "description": "Ex: 1 to 5 Rating",
                    "type": "string"
                },
                "effectVariableId": {
                    "description": "Ex: 1398",
                    "type": "integer"
                },
                "effectVariableMostCommonConnectorId": {
                    "description": "Ex: 10",
                    "type": "integer"
                },
                "effectVariableName": {
                    "description": "Ex: Overall Mood",
                    "type": "string"
                },
                "experimentEndTime": {
                    "description": "Ex: 2014-07-30 12:50:00 UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "experimentStartTime": {
                    "description": "Ex: 2012-05-06 21:15:00 UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "forwardSpearmanCorrelationCoefficient": {
                    "description": "Ex: 0.528359",
                    "format": "double",
                    "type": "number"
                },
                "numberOfPairs": {
                    "description": "Ex: 298",
                    "type": "integer"
                },
                "onsetDelay": {
                    "description": "Ex: 0",
                    "type": "integer"
                },
                "onsetDelayInHours": {
                    "description": "Ex: 0",
                    "format": "float",
                    "type": "number"
                },
                "onsetDelayWithStrongestPearsonCorrelation": {
                    "description": "Ex: -86400",
                    "type": "integer"
                },
                "onsetDelayWithStrongestPearsonCorrelationInHours": {
                    "description": "Ex: -24",
                    "format": "float",
                    "type": "number"
                },
                "optimalPearsonProduct": {
                    "description": "Ex: 0.68582816186982",
                    "format": "double",
                    "type": "number"
                },
                "outcomeFillingValue": {
                    "description": "User-Defined Variable Setting: Ex: -1. Unit: User-specified or common.",
                    "type": "integer"
                },
                "outcomeMaximumAllowedValue": {
                    "description": "User-Defined Variable Setting: Ex: 23. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "outcomeMinimumAllowedValue": {
                    "description": "User-Defined Variable Setting: Ex: 0.1. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "pearsonCorrelationWithNoOnsetDelay": {
                    "description": "Ex: 0.477",
                    "format": "double",
                    "type": "number"
                },
                "predictivePearsonCorrelation": {
                    "description": "Ex: 0.538",
                    "format": "double",
                    "type": "number"
                },
                "predictivePearsonCorrelationCoefficient": {
                    "description": "Ex: 0.538",
                    "format": "double",
                    "type": "number"
                },
                "predictorDataSources": {
                    "description": "Ex: RescueTime",
                    "type": "string"
                },
                "predictorFillingValue": {
                    "description": "Ex: -1. Unit: User-specified or common.",
                    "type": "integer"
                },
                "predictorMaximumAllowedValue": {
                    "description": "Ex: 200. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "predictorMinimumAllowedValue": {
                    "description": "Ex: 30. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "predictsHighEffectChange": {
                    "description": "Ex: 17. Unit: User-specified or common.",
                    "type": "integer"
                },
                "predictsLowEffectChange": {
                    "description": "Ex: -11. Unit: User-specified or common.",
                    "type": "integer"
                },
                "pValue": {
                    "description": "Ex: 0.39628900511586",
                    "format": "double",
                    "type": "number"
                },
                "qmScore": {
                    "description": "Ex: 0.528",
                    "format": "double",
                    "type": "number"
                },
                "reversePearsonCorrelationCoefficient": {
                    "description": "Ex: 0.01377184270977",
                    "format": "double",
                    "type": "number"
                },
                "shareUserMeasurements": {
                    "description": "Would you like to make this study publicly visible?",
                    "type": "boolean"
                },
                "sharingDescription": {
                    "description": "Ex: N1 Study: Sleep Quality Predicts Higher Overall Mood",
                    "type": "string"
                },
                "sharingTitle": {
                    "description": "Ex: N1 Study: Sleep Quality Predicts Higher Overall Mood",
                    "type": "string"
                },
                "significantDifference": {
                    "description": "Ex: 1",
                    "type": "boolean"
                },
                "statisticalSignificance": {
                    "description": "Ex: 0.9813",
                    "format": "double",
                    "type": "number"
                },
                "strengthLevel": {
                    "description": "Ex: moderate",
                    "type": "string"
                },
                "strongestPearsonCorrelationCoefficient": {
                    "description": "Ex: 0.613",
                    "format": "double",
                    "type": "number"
                },
                "studyHtml": {
                    "$ref": "#\/definitions\/StudyHtml"
                },
                "studyImages": {
                    "$ref": "#\/definitions\/StudyImages"
                },
                "studyLinks": {
                    "$ref": "#\/definitions\/StudyLinks"
                },
                "studyText": {
                    "$ref": "#\/definitions\/StudyText"
                },
                "tValue": {
                    "description": "Ex: 9.6986079652717",
                    "format": "double",
                    "type": "number"
                },
                "updatedAt": {
                    "description": "Ex: 2017-05-06 15:40:38 UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "userId": {
                    "description": "Ex: 230",
                    "type": "integer"
                },
                "userVote": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "valuePredictingHighOutcome": {
                    "description": "Ex: 4.14",
                    "format": "double",
                    "type": "number"
                },
                "valuePredictingLowOutcome": {
                    "description": "Ex: 3.03",
                    "format": "double",
                    "type": "number"
                },
                "outcomeDataSources": {
                    "description": "Sources used to collect data for the outcome variable",
                    "type": "string"
                },
                "principalInvestigator": {
                    "description": "Mike Sinn",
                    "type": "string"
                },
                "reverseCorrelation": {
                    "description": "Correlation when cause and effect are reversed. For any causal relationship, the forward correlation should exceed the reverse correlation.",
                    "type": "number"
                },
                "averagePearsonCorrelationCoefficientOverOnsetDelays": {
                    "description": "Ex: ",
                    "format": "float",
                    "type": "number"
                },
                "causeNumberOfRawMeasurements": {
                    "description": "Ex: 14764",
                    "type": "integer"
                },
                "correlationsOverDurationsOfAction": {
                    "description": "Correlations calculated with various duration of action hyper-parameters",
                    "items": {
                        "$ref": "#\/definitions\/Correlation"
                    },
                    "type": "array"
                },
                "correlationsOverOnsetDelays": {
                    "description": "Correlations calculated with various onset delay hyper-parameters",
                    "items": {
                        "$ref": "#\/definitions\/Correlation"
                    },
                    "type": "array"
                },
                "correlationsOverDurationsOfActionChartConfig": {
                    "description": "Highchart config illustrating correlations calculated with various duration of action hyper-parameters",
                    "type": "object"
                },
                "correlationsOverOnsetDelaysChartConfig": {
                    "description": "Highchart config illustrating correlations calculated with various onset delay hyper-parameters",
                    "type": "object"
                },
                "numberOfUsers": {
                    "description": "Ex: 1",
                    "type": "number"
                },
                "rawCauseMeasurementSignificance": {
                    "description": "Ex: 1",
                    "format": "double",
                    "type": "number"
                },
                "rawEffectMeasurementSignificance": {
                    "description": "Ex: 1",
                    "format": "double",
                    "type": "number"
                },
                "reversePairsCount": {
                    "description": "Ex: 1",
                    "type": "string"
                },
                "voteStatisticalSignificance": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "aggregateQMScore": {
                    "description": "Ex: 0.011598441286655",
                    "format": "double",
                    "type": "number"
                },
                "forwardPearsonCorrelationCoefficient": {
                    "description": "Ex: 0.0333",
                    "format": "double",
                    "type": "number"
                },
                "numberOfCorrelations": {
                    "description": "Ex: 6",
                    "type": "integer"
                },
                "vote": {
                    "description": "Ex: 1 or 0",
                    "type": "number"
                }
            },
            "required": [
                "causeVariableName",
                "effectVariableName"
            ]
        },
        "DataSource": {
            "properties": {
                "affiliate": {
                    "description": "Ex: true",
                    "type": "boolean"
                },
                "backgroundColor": {
                    "description": "Background color HEX code that matches the icon",
                    "type": "string"
                },
                "buttons": {
                    "items": {
                        "$ref": "#\/definitions\/Button"
                    },
                    "type": "array"
                },
                "card": {
                    "description": "Card containing instructions, image, text, link and relevant import buttons",
                    "$ref": "#\/definitions\/Card"
                },
                "clientId": {
                    "description": "Your QuantiModo client id can be obtained by creating an app at https:\/\/builder.quantimo.do",
                    "type": "string"
                },
                "connected": {
                    "description": "True if the authenticated user has this connector enabled",
                    "type": "boolean"
                },
                "connectError": {
                    "description": "Ex: Your token is expired. Please re-connect",
                    "type": "string"
                },
                "connectInstructions": {
                    "description": "URL and parameters used when connecting to a service",
                    "$ref": "#\/definitions\/ConnectInstructions"
                },
                "connectorId": {
                    "description": "Ex: 8",
                    "type": "integer"
                },
                "connectStatus": {
                    "description": "Ex: CONNECTED",
                    "type": "string"
                },
                "count": {
                    "description": "Number of measurements from this source or number of users who have measurements from this source",
                    "type": "integer"
                },
                "createdAt": {
                    "description": "Ex: 2000-01-01 00:00:00 UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "connectorClientId": {
                    "description": "Ex: ba7d0c12432650e23b3ce924ae2d21e2ff59e7e4e28650759633700af7ed0a30",
                    "type": "string"
                },
                "defaultVariableCategoryName": {
                    "description": "Ex: Foods",
                    "type": "string"
                },
                "displayName": {
                    "description": "Ex: QuantiModo",
                    "type": "string"
                },
                "enabled": {
                    "description": "Ex: 0",
                    "type": "integer"
                },
                "getItUrl": {
                    "description": "Ex: https:\/\/quantimo.do",
                    "type": "string"
                },
                "id": {
                    "description": "Ex: 72",
                    "type": "integer"
                },
                "image": {
                    "description": "Ex: https:\/\/web.quantimo.do\/img\/logos\/quantimodo-logo-qm-rainbow-200-200.png",
                    "type": "string"
                },
                "imageHtml": {
                    "description": "Ex: <a href=\"https:\/\/quantimo.do\"><img id=\"quantimodo_image\" title=\"QuantiModo\" src=\"https:\/\/web.quantimo.do\/img\/logos\/quantimodo-logo-qm-rainbow-200-200.png\" alt=\"QuantiModo\"><\/a>",
                    "type": "string"
                },
                "lastSuccessfulUpdatedAt": {
                    "description": "Ex: 2017-07-31 10:10:34 UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "lastUpdate": {
                    "description": "Epoch timestamp of last sync",
                    "type": "integer"
                },
                "linkedDisplayNameHtml": {
                    "description": "Ex: <a href=\"https:\/\/quantimo.do\">QuantiModo<\/a>",
                    "type": "string"
                },
                "longDescription": {
                    "description": "Ex: QuantiModo is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  QuantiModo then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.",
                    "type": "string"
                },
                "message": {
                    "description": "Ex: Got 412 new measurements on 2017-07-31 10:10:34",
                    "type": "string"
                },
                "mobileConnectMethod": {
                    "description": "Mobile connect method: webview, cordova, google, spreadsheet, or ip",
                    "type": "string"
                },
                "name": {
                    "description": "Ex: quantimodo",
                    "type": "string"
                },
                "platforms": {
                    "description": "Platforms (chrome, android, ios, web) that you can connect on.",
                    "items": {
                        "type": "string"
                    },
                    "type": "array"
                },
                "premium": {
                    "description": "True if connection requires upgrade",
                    "type": "boolean"
                },
                "scopes": {
                    "description": "Required connector scopes",
                    "items": {
                        "type": "string"
                    },
                    "type": "array"
                },
                "shortDescription": {
                    "description": "Ex: Tracks anything",
                    "type": "string"
                },
                "spreadsheetUploadLink": {
                    "description": "URL to POST a spreadsheet to (if available for this data source)",
                    "type": "string"
                },
                "totalMeasurementsInLastUpdate": {
                    "description": "Number of measurements obtained during latest update",
                    "type": "integer"
                },
                "updatedAt": {
                    "description": "Ex: 2017-07-31 10:10:34 UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "updateRequestedAt": {
                    "description": "Ex: 2017-07-18 05:16:31 UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "updateStatus": {
                    "description": "Ex: UPDATED",
                    "type": "string"
                },
                "userId": {
                    "description": "Ex: 230",
                    "type": "integer"
                }
            },
            "required": [
                "affiliate",
                "connectorClientId",
                "defaultVariableCategoryName",
                "displayName",
                "enabled",
                "getItUrl",
                "id",
                "image",
                "imageHtml",
                "linkedDisplayNameHtml",
                "longDescription",
                "name",
                "shortDescription"
            ]
        },
        "DeviceToken": {
            "properties": {
                "clientId": {
                    "description": "Client id",
                    "type": "string"
                },
                "platform": {
                    "description": "ios, android, or web",
                    "type": "string"
                },
                "deviceToken": {
                    "description": "The device token",
                    "type": "string"
                }
            },
            "required": [
                "deviceToken",
                "platform"
            ]
        },
        "Error": {
            "properties": {
                "message": {
                    "description": "Error message",
                    "type": "string"
                }
            },
            "required": [
                "message"
            ]
        },
        "Explanation": {
            "properties": {
                "description": {
                    "description": "Ex: These factors are most predictive of Overall Mood based on your own data.",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "startTracking": {
                    "$ref": "#\/definitions\/ExplanationStartTracking"
                },
                "title": {
                    "description": "Ex: Top Predictors of Overall Mood",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                }
            },
            "required": [
                "description",
                "image",
                "ionIcon",
                "startTracking",
                "title"
            ]
        },
        "ExplanationStartTracking": {
            "properties": {
                "button": {
                    "$ref": "#\/definitions\/Button"
                },
                "description": {
                    "description": "Ex: The more data I have the more accurate your results will be so track regularly!",
                    "type": "string"
                },
                "title": {
                    "description": "Ex: Improve Accuracy",
                    "type": "string"
                }
            },
            "required": [
                "button",
                "description",
                "title"
            ]
        },
        "InputField": {
            "properties": {
                "displayName": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "helpText": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "hint": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "icon": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "id": {
                    "description": "HTML element id",
                    "type": "string"
                },
                "image": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "key": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "labelLeft": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "labelRight": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "link": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "maxLength": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "maxValue": {
                    "description": "What do you expect?",
                    "type": "number"
                },
                "minLength": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "minValue": {
                    "description": "What do you expect?",
                    "type": "number"
                },
                "options": {
                    "description": "Selector list options",
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "placeholder": {
                    "description": "Ex: Title",
                    "type": "string"
                },
                "postUrl": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "required": {
                    "description": "What do you expect?",
                    "type": "boolean"
                },
                "show": {
                    "description": "Ex: Title",
                    "type": "boolean"
                },
                "submitButton": {
                    "$ref": "#\/definitions\/Button"
                },
                "type": {
                    "description": "Ex: Title",
                    "enum": [
                        "check_box",
                        "date",
                        "email",
                        "number",
                        "postal_code",
                        "select_option",
                        "string",
                        "switch",
                        "text_area",
                        "unit",
                        "variable_category"
                    ],
                    "type": "string"
                },
                "validationPattern": {
                    "description": "See http:\/\/html5pattern.com\/ for examples",
                    "type": "string"
                },
                "value": {
                    "description": "What do you expect?",
                    "type": "string"
                }
            },
            "required": [
                "displayName",
                "type"
            ]
        },
        "GetConnectorsResponse": {
            "properties": {
                "connectors": {
                    "items": {
                        "$ref": "#\/definitions\/DataSource"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            },
            "required": [
                "description",
                "summary"
            ]
        },
        "GetCorrelationsDataResponse": {
            "properties": {
                "correlations": {
                    "items": {
                        "$ref": "#\/definitions\/Correlation"
                    },
                    "type": "array"
                },
                "explanation": {
                    "$ref": "#\/definitions\/Explanation"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            },
            "required": [
                "correlations",
                "explanation"
            ]
        },
        "GetCorrelationsResponse": {
            "properties": {
                "data": {
                    "$ref": "#\/definitions\/GetCorrelationsDataResponse"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            },
            "required": [
                "description",
                "summary"
            ]
        },
        "GetStudiesResponse": {
            "properties": {
                "studies": {
                    "items": {
                        "$ref": "#\/definitions\/Study"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "Ex: These factors are most predictive of Overall Mood based on your own data.",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "startTracking": {
                    "$ref": "#\/definitions\/ExplanationStartTracking"
                },
                "title": {
                    "description": "Ex: Top Predictors of Overall Mood",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                }
            },
            "required": [
                "description",
                "summary"
            ]
        },
        "GetUploadResponse": {
            "properties": {
                "data": {
                    "type": "string"
                },
                "description": {
                    "description": "Whatever you uploaded",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "title": {
                    "description": "Ex: Top Predictors of Overall Mood",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                }
            },
            "required": [
                "description",
                "summary"
            ]
        },
        "GetSharesResponse": {
            "properties": {
                "authorizedClients": {
                    "$ref": "#\/definitions\/AuthorizedClients"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            },
            "required": [
                "description",
                "summary"
            ]
        },
        "FeedResponse": {
            "properties": {
                "cards": {
                    "items": {
                        "$ref": "#\/definitions\/Card"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "Tracking reminder notifications, messages, and study result cards that can be displayed in user feed or stream",
                    "type": "string"
                },
                "summary": {
                    "description": "Tracking reminder notifications, messages, and study results",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            },
            "required": [
                "description",
                "summary",
                "cards"
            ]
        },
        "GetTrackingReminderNotificationsResponse": {
            "properties": {
                "data": {
                    "items": {
                        "$ref": "#\/definitions\/TrackingReminderNotification"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            },
            "required": [
                "description",
                "summary"
            ]
        },
        "Image": {
            "properties": {
                "height": {
                    "description": "Ex: 240",
                    "type": "string"
                },
                "imageUrl": {
                    "description": "Ex: https:\/\/www.filepicker.io\/api\/file\/TjmeNWS5Q2SFmtJlUGLf",
                    "type": "string"
                },
                "width": {
                    "description": "Ex: 224",
                    "type": "string"
                }
            },
            "required": [
                "height",
                "imageUrl",
                "width"
            ]
        },
        "JsonErrorResponse": {
            "properties": {
                "message": {
                    "description": "Error message",
                    "type": "string"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            },
            "required": [
                "status"
            ]
        },
        "Measurement": {
            "properties": {
                "card": {
                    "description": "Card containing image, text, link and relevant buttons",
                    "$ref": "#\/definitions\/Card"
                },
                "clientId": {
                    "description": "Ex: quantimodo",
                    "type": "string"
                },
                "connectorId": {
                    "description": "Ex: 13",
                    "type": "integer"
                },
                "createdAt": {
                    "description": "Ex: 2017-07-30 21:08:36",
                    "type": "string"
                },
                "displayValueAndUnitString": {
                    "description": "Examples: 3\/5, $10, or 1 count",
                    "type": "string"
                },
                "iconIcon": {
                    "description": "Ex: ion-sad-outline",
                    "type": "string"
                },
                "id": {
                    "description": "Ex: 1051466127",
                    "type": "integer"
                },
                "inputType": {
                    "description": "Ex: value",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-medkit-outline",
                    "type": "string"
                },
                "manualTracking": {
                    "description": "Ex: 1",
                    "type": "boolean"
                },
                "maximumAllowedValue": {
                    "description": "Ex: 5. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "minimumAllowedValue": {
                    "description": "Ex: 1. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "note": {
                    "description": "Note of measurement",
                    "type": "string"
                },
                "noteObject": {
                    "description": "Additional meta data for the measurement",
                    "type": "object"
                },
                "noteHtml": {
                    "description": "Embeddable HTML with message hyperlinked with associated url",
                    "type": "object"
                },
                "originalUnitId": {
                    "description": "Ex: 23",
                    "type": "integer"
                },
                "originalValue": {
                    "description": "Original value submitted. Unit: Originally submitted.",
                    "format": "double",
                    "type": "number"
                },
                "pngPath": {
                    "description": "Ex: img\/variable_categories\/treatments.png",
                    "type": "string"
                },
                "pngUrl": {
                    "description": "Ex: https:\/\/web.quantimo.do\/img\/variable_categories\/treatments.png",
                    "type": "string"
                },
                "productUrl": {
                    "description": "Link to associated product for purchase",
                    "type": "string"
                },
                "sourceName": {
                    "description": "Application or device used to record the measurement values",
                    "type": "string"
                },
                "startDate": {
                    "description": "Ex: 2014-08-27",
                    "type": "string"
                },
                "startTimeEpoch": {
                    "description": "Seconds between the start of the event measured and 1970 (Unix timestamp)",
                    "type": "integer"
                },
                "startTimeString": {
                    "description": "Start Time for the measurement event in UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "svgUrl": {
                    "description": "Ex: https:\/\/web.quantimo.do\/img\/variable_categories\/treatments.svg",
                    "type": "string"
                },
                "unitAbbreviatedName": {
                    "description": "Abbreviated name for the unit of measurement",
                    "type": "string"
                },
                "unitCategoryId": {
                    "description": "Ex: 6",
                    "type": "integer"
                },
                "unitCategoryName": {
                    "description": "Ex: Miscellany",
                    "type": "string"
                },
                "unitId": {
                    "description": "Ex: 23",
                    "type": "integer"
                },
                "unitName": {
                    "description": "Ex: Count",
                    "type": "string"
                },
                "updatedAt": {
                    "description": "Ex: 2017-07-30 21:08:36",
                    "type": "string"
                },
                "url": {
                    "description": "Link to associated Facebook like or Github commit, for instance",
                    "type": "string"
                },
                "userVariableUnitAbbreviatedName": {
                    "description": "Ex: count",
                    "type": "string"
                },
                "userVariableUnitCategoryId": {
                    "description": "Ex: 6",
                    "type": "integer"
                },
                "userVariableUnitCategoryName": {
                    "description": "Ex: Miscellany",
                    "type": "string"
                },
                "userVariableUnitId": {
                    "description": "Ex: 23",
                    "type": "integer"
                },
                "userVariableUnitName": {
                    "description": "Ex: Count",
                    "type": "string"
                },
                "userVariableVariableCategoryId": {
                    "description": "Ex: 13",
                    "type": "integer"
                },
                "userVariableVariableCategoryName": {
                    "description": "Ex: Treatments",
                    "type": "string"
                },
                "valence": {
                    "description": "Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5\/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1\/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. ",
                    "type": "string"
                },
                "value": {
                    "description": "Converted measurement value in requested unit",
                    "format": "double",
                    "type": "number"
                },
                "variableCategoryId": {
                    "description": "Ex: 13",
                    "type": "integer"
                },
                "variableCategoryImageUrl": {
                    "description": "Ex: https:\/\/static.quantimo.do\/img\/variable_categories\/pill-96.png",
                    "type": "string"
                },
                "variableCategoryName": {
                    "description": "Ex: Emotions, Treatments, Symptoms...",
                    "enum": [
                        "Activity",
                        "Books",
                        "Causes of Illness",
                        "Cognitive Performance",
                        "Conditions",
                        "Emotions",
                        "Environment",
                        "Foods",
                        "Goals",
                        "Locations",
                        "Miscellaneous",
                        "Movies and TV",
                        "Music",
                        "Nutrients",
                        "Payments",
                        "Physical Activities",
                        "Physique",
                        "Sleep",
                        "Social Interactions",
                        "Software",
                        "Symptoms",
                        "Treatments",
                        "Vital Signs"
                    ],
                    "type": "string"
                },
                "variableDescription": {
                    "description": "Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5\/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1\/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. ",
                    "type": "string"
                },
                "variableId": {
                    "description": "Ex: 5956846",
                    "type": "integer"
                },
                "variableName": {
                    "description": "Name of the variable for which we are creating the measurement records",
                    "type": "string"
                },
                "displayName": {
                    "description": "Ex: Trader Joe's Bedtime Tea",
                    "type": "string"
                }
            },
            "required": [
                "sourceName",
                "startTimeString",
                "unitAbbreviatedName",
                "value",
                "variableName"
            ]
        },
        "MeasurementDelete": {
            "properties": {
                "startTime": {
                    "description": "Start time of the measurement to be deleted",
                    "type": "integer"
                },
                "variableId": {
                    "description": "Variable id of the measurement to be deleted",
                    "type": "integer"
                },
                "connectorName": {
                    "description": "Name of the connector for which measurements should be deleted",
                    "type": "string"
                },
                "clientId": {
                    "description": "Your app's client id",
                    "type": "string"
                }
            },
            "required": [
                "clientId"
            ]
        },
        "MeasurementItem": {
            "properties": {
                "note": {
                    "description": "Optional note to include with the measurement",
                    "type": "string"
                },
                "timestamp": {
                    "description": "Timestamp for the measurement event in epoch time (unixtime)",
                    "format": "int64",
                    "type": "integer"
                },
                "value": {
                    "description": "Measurement value",
                    "format": "double",
                    "type": "number"
                }
            },
            "required": [
                "timestamp",
                "value"
            ]
        },
        "MeasurementSet": {
            "properties": {
                "combinationOperation": {
                    "description": "Way to aggregate measurements over time. SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.",
                    "enum": [
                        "MEAN",
                        "SUM"
                    ],
                    "type": "string"
                },
                "measurementItems": {
                    "description": "Array of timestamps, values, and optional notes",
                    "items": {
                        "$ref": "#\/definitions\/MeasurementItem"
                    },
                    "type": "array"
                },
                "sourceName": {
                    "description": "Name of the application or device used to record the measurement values",
                    "type": "string"
                },
                "unitAbbreviatedName": {
                    "description": "Unit of measurement",
                    "type": "string"
                },
                "variableCategoryName": {
                    "description": "Ex: Emotions, Treatments, Symptoms...",
                    "enum": [
                        "Activity",
                        "Books",
                        "Causes of Illness",
                        "Cognitive Performance",
                        "Conditions",
                        "Emotions",
                        "Environment",
                        "Foods",
                        "Goals",
                        "Locations",
                        "Miscellaneous",
                        "Movies and TV",
                        "Music",
                        "Nutrients",
                        "Payments",
                        "Physical Activities",
                        "Physique",
                        "Sleep",
                        "Social Interactions",
                        "Software",
                        "Symptoms",
                        "Treatments",
                        "Vital Signs"
                    ],
                    "type": "string"
                },
                "variableName": {
                    "description": "ORIGINAL name of the variable for which we are creating the measurement records",
                    "type": "string"
                },
                "upc": {
                    "description": "UPC or other barcode scan result",
                    "type": "string"
                }
            },
            "required": [
                "measurementItems",
                "sourceName",
                "unitAbbreviatedName",
                "variableName"
            ]
        },
        "MeasurementUpdate": {
            "properties": {
                "id": {
                    "description": "Variable id of the measurement to be updated",
                    "type": "integer"
                },
                "note": {
                    "description": "The new note for the measurement (optional)",
                    "type": "string"
                },
                "startTime": {
                    "description": "The new timestamp for the the event in epoch seconds (optional)",
                    "type": "integer"
                },
                "value": {
                    "description": "The new value of for the measurement (optional)",
                    "format": "double",
                    "type": "number"
                }
            },
            "required": [
                "id"
            ]
        },
        "Pair": {
            "properties": {
                "causeMeasurement": {
                    "description": "Ex: 101341.66666667",
                    "format": "double",
                    "type": "number"
                },
                "causeMeasurementValue": {
                    "description": "Ex: 101341.66666667",
                    "format": "double",
                    "type": "number"
                },
                "causeVariableUnitAbbreviatedName": {
                    "description": "Ex: mg",
                    "type": "string"
                },
                "effectMeasurement": {
                    "description": "Ex: 7.98",
                    "format": "double",
                    "type": "number"
                },
                "effectMeasurementValue": {
                    "description": "Ex: 7.98",
                    "format": "double",
                    "type": "number"
                },
                "effectVariableUnitAbbreviatedName": {
                    "description": "Ex: %",
                    "type": "string"
                },
                "eventAt": {
                    "description": "Ex: 2015-08-06 15:49:02 UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "eventAtUnixTime": {
                    "description": "Ex: 1438876142",
                    "type": "integer"
                },
                "startTimeString": {
                    "description": "Ex: 2015-08-06 15:49:02 UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "timestamp": {
                    "description": "Ex: 1464937200",
                    "type": "integer"
                }
            },
            "required": [
                "causeMeasurement",
                "causeMeasurementValue",
                "causeVariableUnitAbbreviatedName",
                "effectMeasurement",
                "effectMeasurementValue",
                "effectVariableUnitAbbreviatedName",
                "timestamp"
            ]
        },
        "ParticipantInstruction": {
            "properties": {
                "instructionsForCauseVariable": {
                    "description": "Ex: <a href=\"https:\/\/www.amazon.com\/Fitbit-Charge-Heart-Fitness-Wristband\/dp\/B01K9S260E\/ref=as_li_ss_tl?ie=UTF8&qid=1493518902&sr=8-3&keywords=fitbit&th=1&linkCode=ll1&tag=quant08-20&linkId=b357b0833de73b0c4e935fd7c13a079e\">Obtain Fitbit<\/a> and use it to record your Sleep Duration. Once you have a <a href=\"https:\/\/www.amazon.com\/Fitbit-Charge-Heart-Fitness-Wristband\/dp\/B01K9S260E\/ref=as_li_ss_tl?ie=UTF8&qid=1493518902&sr=8-3&keywords=fitbit&th=1&linkCode=ll1&tag=quant08-20&linkId=b357b0833de73b0c4e935fd7c13a079e\">Fitbit<\/a> account, <a href=\"https:\/\/web.quantimo.do\/#\/app\/import\">connect your  Fitbit account at QuantiModo<\/a> to automatically import and analyze your data.",
                    "type": "string"
                },
                "instructionsForEffectVariable": {
                    "description": "Ex: <a href=\"https:\/\/quantimo.do\">Obtain QuantiModo<\/a> and use it to record your Overall Mood. Once you have a <a href=\"https:\/\/quantimo.do\">QuantiModo<\/a> account, <a href=\"https:\/\/web.quantimo.do\/#\/app\/import\">connect your  QuantiModo account at QuantiModo<\/a> to automatically import and analyze your data.",
                    "type": "string"
                }
            }
        },
        "PostMeasurementsDataResponse": {
            "properties": {
                "userVariables": {
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "PostMeasurementsResponse": {
            "properties": {
                "data": {
                    "$ref": "#\/definitions\/PostMeasurementsDataResponse"
                },
                "message": {
                    "description": "Message",
                    "type": "string"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            },
            "required": [
                "status",
                "success"
            ]
        },
        "PostStudyPublishResponse": {
            "properties": {
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "PostStudyCreateResponse": {
            "properties": {
                "study": {
                    "$ref": "#\/definitions\/Study"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "PostTrackingRemindersDataResponse": {
            "properties": {
                "trackingReminderNotifications": {
                    "items": {
                        "$ref": "#\/definitions\/TrackingReminderNotification"
                    },
                    "type": "array"
                },
                "trackingReminders": {
                    "items": {
                        "$ref": "#\/definitions\/TrackingReminder"
                    },
                    "type": "array"
                },
                "userVariables": {
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "PostTrackingRemindersResponse": {
            "properties": {
                "data": {
                    "$ref": "#\/definitions\/PostTrackingRemindersDataResponse"
                },
                "message": {
                    "description": "Message",
                    "type": "string"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            },
            "required": [
                "status",
                "success"
            ]
        },
        "PostUserSettingsDataResponse": {
            "properties": {
                "purchaseId": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "PostUserSettingsResponse": {
            "properties": {
                "data": {
                    "$ref": "#\/definitions\/PostUserSettingsDataResponse"
                },
                "message": {
                    "description": "Message",
                    "type": "string"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            },
            "required": [
                "status",
                "success"
            ],
            "type": "object"
        },
        "PostUploadResponse": {
            "properties": {
                "data": {
                    "description": "Message",
                    "type": "string"
                },
                "message": {
                    "description": "Message",
                    "type": "string"
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            },
            "required": [
                "status",
                "success"
            ],
            "type": "object"
        },
        "ShareInvitationBody": {
            "properties": {
                "emailAddress": {
                    "description": "Enter the email address of the friend, family member, or health-care provider that you would like to give access to your measurements",
                    "type": "string"
                },
                "name": {
                    "description": "Name of the individual that the user wishes to have access to their measurements",
                    "type": "string"
                },
                "emailSubject": {
                    "description": "Ex: I would like to share my measurements with you!",
                    "type": "string"
                },
                "emailBody": {
                    "description": "Ex: I would like to share my data with you so you can help me identify find discover hidden causes of and new treatments for my illness.",
                    "type": "string"
                },
                "scopes": {
                    "description": "Space separated list of scopes to grant to the recipient (i.e. readmeasurements, writemeasurements, measurements:read",
                    "type": "string"
                }
            },
            "required": [
                "emailAddress"
            ]
        },
        "Study": {
            "description": "A study analyzes the relationship between a predictor variable like gluten-intake and an outcome of interest such as overall mood.",
            "properties": {
                "type": {
                    "description": "Ex: population, cohort, or individual",
                    "type": "string"
                },
                "userId": {
                    "description": "The user id of the principal investigator or subject if an individual studies",
                    "format": "int32",
                    "type": "integer"
                },
                "id": {
                    "description": "ID of the cohort study which is necessary to allow participants to join",
                    "type": "string"
                },
                "causeVariable": {
                    "$ref": "#\/definitions\/Variable"
                },
                "causeVariableName": {
                    "description": "Ex: Sleep Quality",
                    "type": "string"
                },
                "studyCharts": {
                    "$ref": "#\/definitions\/StudyCharts"
                },
                "effectVariable": {
                    "$ref": "#\/definitions\/Variable"
                },
                "effectVariableName": {
                    "description": "Ex: Overall Mood",
                    "type": "string"
                },
                "participantInstructions": {
                    "$ref": "#\/definitions\/ParticipantInstruction"
                },
                "statistics": {
                    "$ref": "#\/definitions\/Correlation"
                },
                "studyCard": {
                    "description": "Contains a summary, images, sharing buttons, and links",
                    "$ref": "#\/definitions\/Card"
                },
                "studyHtml": {
                    "$ref": "#\/definitions\/StudyHtml"
                },
                "studyImages": {
                    "$ref": "#\/definitions\/StudyImages"
                },
                "studyLinks": {
                    "$ref": "#\/definitions\/StudyLinks"
                },
                "studySharing": {
                    "$ref": "#\/definitions\/StudySharing"
                },
                "studyText": {
                    "$ref": "#\/definitions\/StudyText"
                },
                "studyVotes": {
                    "$ref": "#\/definitions\/StudyVotes"
                },
                "joined": {
                    "description": "True if you are sharing your data with this study",
                    "type": "boolean"
                }
            },
            "required": [
                "type"
            ]
        },
        "StudyCharts": {
            "description": "An object with various chart properties each property contain and svg and Highcharts configuration",
            "properties": {
                "populationTraitScatterPlot": {
                    "$ref": "#\/definitions\/Chart"
                },
                "outcomeDistributionColumnChart": {
                    "$ref": "#\/definitions\/Chart"
                },
                "predictorDistributionColumnChart": {
                    "$ref": "#\/definitions\/Chart"
                },
                "correlationScatterPlot": {
                    "$ref": "#\/definitions\/Chart"
                },
                "pairsOverTimeLineChart": {
                    "$ref": "#\/definitions\/Chart"
                }
            }
        },
        "StudyCreationBody": {
            "properties": {
                "causeVariableName": {
                    "description": "Name of predictor variable",
                    "type": "string"
                },
                "effectVariableName": {
                    "description": "Name of the outcome variable",
                    "type": "string"
                },
                "studyTitle": {
                    "description": "Title of your study (optional)",
                    "type": "string"
                },
                "type": {
                    "description": "Individual studies are based on data of a single user. Group studies are based on data from a specific group of individuals who have joined.  Global studies are based on aggregated and anonymously shared data from all users.",
                    "type": "string",
                    "enum": [
                        "individual",
                        "group",
                        "global"
                    ]
                }
            },
            "required": [
                "causeVariableName",
                "effectVariableName",
                "type"
            ]
        },
        "StudyHtml": {
            "properties": {
                "chartHtml": {
                    "description": "Embeddable chart html",
                    "type": "string"
                },
                "downloadButtonsHtml": {
                    "description": "Play Store, App Store, Chrome Web Store",
                    "type": "string"
                },
                "fullPageWithHead": {
                    "description": "Embeddable study including HTML head section charts.  Modifiable css classes are study-title, study-section-header, study-section-body",
                    "type": "string"
                },
                "fullStudyHtml": {
                    "description": "Embeddable study text html including charts.  Modifiable css classes are study-title, study-section-header, study-section-body",
                    "type": "string"
                },
                "fullStudyHtmlWithCssStyles": {
                    "description": "Embeddable study html including charts and css styling",
                    "type": "string"
                },
                "participantInstructionsHtml": {
                    "description": "Instructions for study participation",
                    "type": "string"
                },
                "statisticsTableHtml": {
                    "description": "Embeddable table with statistics",
                    "type": "string"
                },
                "studyAbstractHtml": {
                    "description": "Text summary",
                    "type": "string"
                },
                "studyHeaderHtml": {
                    "description": "Title, study image, abstract with CSS styling",
                    "type": "string"
                },
                "studyImageHtml": {
                    "description": "PNG image",
                    "type": "string"
                },
                "studyMetaHtml": {
                    "description": "Facebook, Twitter, Google+",
                    "type": "string"
                },
                "studyTextHtml": {
                    "description": "Formatted study text sections",
                    "type": "string"
                },
                "socialSharingButtonHtml": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "studySummaryBoxHtml": {
                    "description": "What do you expect?",
                    "type": "string"
                }
            },
            "required": [
                "chartHtml",
                "fullStudyHtml"
            ]
        },
        "StudyImages": {
            "properties": {
                "causeVariableImageUrl": {
                    "description": "Ex: https:\/\/static.quantimo.do\/img\/variable_categories\/sleeping_in_bed-96.png",
                    "type": "string"
                },
                "causeVariableIonIcon": {
                    "description": "Ex: ion-ios-cloudy-night-outline",
                    "type": "string"
                },
                "effectVariableImageUrl": {
                    "description": "Ex: https:\/\/static.quantimo.do\/img\/variable_categories\/theatre_mask-96.png",
                    "type": "string"
                },
                "effectVariableIonIcon": {
                    "description": "Ex: ion-happy-outline",
                    "type": "string"
                },
                "gaugeImage": {
                    "description": "Ex: https:\/\/s3.amazonaws.com\/quantimodo-docs\/images\/gauge-moderately-positive-relationship.png",
                    "type": "string"
                },
                "gaugeImageSquare": {
                    "description": "Ex: https:\/\/s3.amazonaws.com\/quantimodo-docs\/images\/gauge-moderately-positive-relationship-200-200.png",
                    "type": "string"
                },
                "gaugeSharingImageUrl": {
                    "description": "Image with gauge and category images",
                    "type": "string"
                },
                "imageUrl": {
                    "description": "Ex: https:\/\/s3-us-west-1.amazonaws.com\/qmimages\/variable_categories_gauges_logo_background\/gauge-moderately-positive-relationship_sleep_emotions_logo_background.png",
                    "type": "string"
                },
                "robotSharingImageUrl": {
                    "description": "Image with robot and category images",
                    "type": "string"
                },
                "avatar": {
                    "description": "Avatar of the principal investigator",
                    "type": "string"
                }
            },
            "required": [
                "gaugeImage",
                "gaugeImageSquare",
                "imageUrl"
            ]
        },
        "StudyJoinResponse": {
            "properties": {
                "study": {
                    "$ref": "#\/definitions\/Study"
                },
                "trackingReminders": {
                    "type": "array",
                    "items": {
                        "$ref": "#\/definitions\/TrackingReminder"
                    }
                },
                "trackingReminderNotifications": {
                    "type": "array",
                    "items": {
                        "$ref": "#\/definitions\/TrackingReminderNotification"
                    }
                },
                "description": {
                    "description": "Can be used as body of help info popup",
                    "type": "string"
                },
                "summary": {
                    "description": "Can be used as title in help info popup",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "StudyLinks": {
            "properties": {
                "studyJoinLink": {
                    "description": "Share this link with potential study participants",
                    "type": "string"
                },
                "studyLinkEmail": {
                    "description": "Ex: mailto:?subject=N1%20Study%3A%20Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood&body=Check%20out%20my%20study%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%0A%0AHave%20a%20great%20day!",
                    "type": "string"
                },
                "studyLinkFacebook": {
                    "description": "Ex: https:\/\/www.facebook.com\/sharer\/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230",
                    "type": "string"
                },
                "studyLinkGoogle": {
                    "description": "Ex: https:\/\/plus.google.com\/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230",
                    "type": "string"
                },
                "studyLinkStatic": {
                    "description": "Ex: https:\/\/local.quantimo.do\/api\/v2\/study?causeVariableName=Sleep%20Quality&effectVariableName=Overall%20Mood&userId=230",
                    "type": "string"
                },
                "studyLinkDynamic": {
                    "description": "Ex: https:\/\/local.quantimo.do\/ionic\/Modo\/www\/index.html#\/app\/study?causeVariableName=Sleep%20Quality&effectVariableName=Overall%20Mood&userId=230",
                    "type": "string"
                },
                "studyLinkTwitter": {
                    "description": "Ex: https:\/\/twitter.com\/home?status=Sleep%20Quality%20Predicts%20Higher%20Overall%20Mood%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fstudy%3FcauseVariableName%3DSleep%2520Quality%26effectVariableName%3DOverall%2520Mood%26userId%3D230%20%40quantimodo",
                    "type": "string"
                }
            },
            "required": [
                "studyLinkDynamic",
                "studyLinkEmail",
                "studyLinkFacebook",
                "studyLinkGoogle",
                "studyLinkStatic",
                "studyLinkTwitter"
            ]
        },
        "StudySharing": {
            "properties": {
                "shareUserMeasurements": {
                    "description": "Would you like to make this study publicly visible?",
                    "type": "boolean"
                },
                "sharingDescription": {
                    "description": "Ex: N1 Study: Sleep Quality Predicts Higher Overall Mood",
                    "type": "string"
                },
                "sharingTitle": {
                    "description": "Ex: N1 Study: Sleep Quality Predicts Higher Overall Mood",
                    "type": "string"
                }
            },
            "required": [
                "shareUserMeasurements",
                "sharingDescription",
                "sharingTitle"
            ]
        },
        "StudyText": {
            "properties": {
                "averageEffectFollowingHighCauseExplanation": {
                    "description": "Ex: Overall Mood is 3.55\/5 (15% higher) on average after days with around 4.19\/5 Sleep Quality",
                    "type": "string"
                },
                "averageEffectFollowingLowCauseExplanation": {
                    "description": "Ex: Overall Mood is 2.65\/5 (14% lower) on average after days with around 1.97\/5 Sleep Quality",
                    "type": "string"
                },
                "valuePredictingHighOutcomeExplanation": {
                    "description": "Ex: Overall Mood, on average, 17% higher after around 4.14\/5 Sleep Quality",
                    "type": "string"
                },
                "valuePredictingLowOutcomeExplanation": {
                    "description": "Ex: Overall Mood, on average, 11% lower after around 3.03\/5 Sleep Quality",
                    "type": "string"
                },
                "dataAnalysis": {
                    "description": "Ex: It was assumed that 0 hours would pass before a change in Very Distracting Time would produce an observable change in Video Activities.  It was assumed that Very Distracting Time could produce an observable change in Video Activities for as much as 7 days after the stimulus event.",
                    "type": "string"
                },
                "dataSources": {
                    "description": "Ex: Very Distracting Time data was primarily collected using <a href=\"https:\/\/www.rescuetime.com\/rp\/quantimodo\/plans\">RescueTime<\/a>. Detailed reports show which applications and websites you spent time on. Activities are automatically grouped into pre-defined categories with built-in productivity scores covering thousands of websites and applications. You can customize categories and productivity scores to meet your needs.<br>Video Activities data was primarily collected using <a href=\"https:\/\/www.rescuetime.com\/rp\/quantimodo\/plans\">RescueTime<\/a>. Detailed reports show which applications and websites you spent time on. Activities are automatically grouped into pre-defined categories with built-in productivity scores covering thousands of websites and applications. You can customize categories and productivity scores to meet your needs.",
                    "type": "string"
                },
                "dataSourcesParagraphForCause": {
                    "description": "Ex: Very Distracting Time data was primarily collected using <a href=\"https:\/\/www.rescuetime.com\/rp\/quantimodo\/plans\">RescueTime<\/a>. Detailed reports show which applications and websites you spent time on. Activities are automatically grouped into pre-defined categories with built-in productivity scores covering thousands of websites and applications. You can customize categories and productivity scores to meet your needs.<br>Video Activities data was primarily collected using <a href=\"https:\/\/www.rescuetime.com\/rp\/quantimodo\/plans\">RescueTime<\/a>. Detailed reports show which applications and websites you spent time on. Activities are automatically grouped into pre-defined categories with built-in productivity scores covering thousands of websites and applications. You can customize categories and productivity scores to meet your needs.",
                    "type": "string"
                },
                "dataSourcesParagraphForEffect": {
                    "description": "Ex: Very Distracting Time data was primarily collected using <a href=\"https:\/\/www.rescuetime.com\/rp\/quantimodo\/plans\">RescueTime<\/a>. Detailed reports show which applications and websites you spent time on. Activities are automatically grouped into pre-defined categories with built-in productivity scores covering thousands of websites and applications. You can customize categories and productivity scores to meet your needs.<br>Video Activities data was primarily collected using <a href=\"https:\/\/www.rescuetime.com\/rp\/quantimodo\/plans\">RescueTime<\/a>. Detailed reports show which applications and websites you spent time on. Activities are automatically grouped into pre-defined categories with built-in productivity scores covering thousands of websites and applications. You can customize categories and productivity scores to meet your needs.",
                    "type": "string"
                },
                "lastCauseDailyValueSentenceExtended": {
                    "description": "Ex: Sleep Quality Predicts Higher Overall Mood",
                    "type": "string"
                },
                "lastCauseAndOptimalValueSentence": {
                    "description": "Ex: Sleep Quality Predicts Higher Overall Mood",
                    "type": "string"
                },
                "lastCauseDailyValueSentence": {
                    "description": "Ex: Sleep Quality Predicts Higher Overall Mood",
                    "type": "string"
                },
                "optimalDailyValueSentence": {
                    "description": "Ex: Sleep Quality Predicts Higher Overall Mood",
                    "type": "string"
                },
                "participantInstructions": {
                    "description": "Instructions for study participation",
                    "type": "string"
                },
                "predictorExplanation": {
                    "description": "Ex: Sleep Quality Predicts Higher Overall Mood",
                    "type": "string"
                },
                "significanceExplanation": {
                    "description": "Ex: Using a two-tailed t-test with alpha = 0.05, it was determined that the change in Video Activities is statistically significant at 95% confidence interval.",
                    "type": "string"
                },
                "studyAbstract": {
                    "description": "Ex: Aggregated data from 21 suggests with a low degree of confidence (p=0.097) that Very Distracting Time has a moderately positive predictive relationship (R=0.354) with Video Activities  (Activity).  The highest quartile of Video Activities measurements were observed following an average 2.03h Very Distracting Timeper day.  The lowest quartile of Video Activities  measurements were observed following an average 1.04h Very Distracting Timeper day.",
                    "type": "string"
                },
                "studyDesign": {
                    "description": "Ex: This study is based on data donated by  21 QuantiModo users. Thus, the study design is equivalent to the aggregation of 21 separate n=1 observational natural experiments.",
                    "type": "string"
                },
                "studyLimitations": {
                    "description": "Ex: As with any human experiment, it was impossible to control for all potentially confounding variables.\n            Correlation does not necessarily imply correlation.  We can never know for sure if one factor is definitely the cause of an outcome.\n            However, lack of correlation definitely implies the lack of a causal relationship.  Hence, we can with great\n            confidence rule out non-existent relationships. For instance, if we discover no relationship between mood\n            and an antidepressant this information is just as or even more valuable than the discovery that there is a relationship.\n            <br>\n            <br>\n            We can also take advantage of several characteristics of time series data from many subjects  to infer the likelihood of a causal relationship if we do find a correlational relationship.\n            The criteria for causation are a group of minimal conditions necessary to provide adequate evidence of a causal relationship between an incidence and a possible consequence.\n            The list of the criteria is as follows:\n            <br>\n            1. Strength (effect size): A small association does not mean that there is not a causal effect, though the larger the association, the more likely that it is causal.\n            <br>\n            2. Consistency (reproducibility): Consistent findings observed by different persons in different places with different samples strengthens the likelihood of an effect.\n            <br>\n            3. Specificity: Causation is likely if a very specific population at a specific site and disease with no other likely explanation. The more specific an association between a factor and an effect is, the bigger the probability of a causal relationship.\n            <br>\n            4. Temporality: The effect has to occur after the cause (and if there is an expected delay between the cause and expected effect, then the effect must occur after that delay).\n            <br>\n            5. Biological gradient: Greater exposure should generally lead to greater incidence of the effect. However, in some cases, the mere presence of the factor can trigger the effect. In other cases, an inverse proportion is observed: greater exposure leads to lower incidence.\n            <br>\n            6. Plausibility: A plausible mechanism between cause and effect is helpful.\n            <br>\n            7. Coherence: Coherence between epidemiological and laboratory findings increases the likelihood of an effect.\n            <br>\n            8. Experiment: \"Occasionally it is possible to appeal to experimental evidence\".\n            <br>\n            9. Analogy: The effect of similar factors may be considered.\n            <br>\n            <br>\n             The confidence in a causal relationship is bolstered by the fact that time-precedence was taken into account in all calculations. Furthermore, in accordance with the law of large numbers (LLN), the predictive power and accuracy of these results will continually grow over time.  146 paired data points were used in this analysis.   Assuming that the relationship is merely coincidental, as the participant independently modifies their Very Distracting Time values, the observed strength of the relationship will decline until it is below the threshold of significance.  To it another way, in the case that we do find a spurious correlation, suggesting that banana intake improves mood for instance,\n            one will likely increase their banana intake.  Due to the fact that this correlation is spurious, it is unlikely\n            that you will see a continued and persistent corresponding increase in mood.  So over time, the spurious correlation will\n            naturally dissipate.Furthermore, it will be very enlightening to aggregate this data with the data from other participants  with similar genetic, diseasomic, environmentomic, and demographic profiles.",
                    "type": "string"
                },
                "studyObjective": {
                    "description": "Ex: The objective of this study is to determine the nature of the relationship (if any) between the Very Distracting Time and the Video Activities. Additionally, we attempt to determine the Very Distracting Time values most likely to produce optimal Video Activities values.",
                    "type": "string"
                },
                "studyResults": {
                    "description": "Ex: This analysis suggests that higher Very Distracting Time generally predicts negative Video Activities (p = 0.097). Video Activities is, on average, 36%  higher after around 2.03 Very Distracting Time.  After an onset delay of 168 hours, Video Activities is, on average, 16%  lower than its average over the 168 hours following around 1.04 Very Distracting Time.  146 data points were used in this analysis.  The value for Very Distracting Time changed 2984 times, effectively running 1492 separate natural experiments. The top quartile outcome values are preceded by an average 2.03 h of Very Distracting Time.  The bottom quartile outcome values are preceded by an average 1.04 h of Very Distracting Time.  Forward Pearson Correlation Coefficient was 0.354 (p=0.097, 95% CI -0.437 to 1.144 onset delay = 0 hours, duration of action = 168 hours) .  The Reverse Pearson Correlation Coefficient was 0.208 (P=0.097, 95% CI -0.583 to 0.998, onset delay = -0 hours, duration of action = -168 hours). When the Very Distracting Time value is closer to 2.03 h than 1.04 h, the Video Activities value which follows is, on average, 36% percent higher than its typical value.  When the Very Distracting Time value is closer to 1.04 h than 2.03 h, the Video Activities value which follows is 0% lower than its typical value.  Video Activities is 5 h (67% higher) on average after days with around 5 h Very Distracting Time",
                    "type": "string"
                },
                "studyTitle": {
                    "description": "Ex: N1 Study: Very Distracting Time Predicts Negative Video Activities",
                    "type": "string"
                },
                "studyInvitation": {
                    "description": "Help us determine if Remeron affects Overall Mood!",
                    "type": "string"
                },
                "studyQuestion": {
                    "description": "Does Remeron affect Overall Mood?",
                    "type": "string"
                },
                "studyBackground": {
                    "description": "In order to reduce suffering through the advancement of human knowledge...",
                    "type": "string"
                }
            },
            "required": [
                "studyAbstract",
                "studyDesign",
                "studyLimitations",
                "studyObjective",
                "studyResults",
                "studyTitle"
            ]
        },
        "StudyVotes": {
            "properties": {
                "averageVote": {
                    "description": "Average of all user votes with 1 representing an up-vote and 0 representing a down-vote. Ex: 0.9855",
                    "type": "number"
                },
                "userVote": {
                    "description": "1 if the current user has up-voted the study and 0 if they down-voted it. Null means no vote. Ex: 1 or 0 or null",
                    "type": "integer"
                }
            },
            "required": [
                "averageVote",
                "userVote"
            ]
        },
        "TrackingReminder": {
            "properties": {
                "actionArray": {
                    "items": {
                        "$ref": "#\/definitions\/TrackingReminderNotificationAction"
                    },
                    "type": "array"
                },
                "availableUnits": {
                    "items": {
                        "$ref": "#\/definitions\/Unit"
                    },
                    "type": "array"
                },
                "bestStudyLink": {
                    "description": "Link to study comparing variable with strongest relationship for user or population",
                    "type": "string"
                },
                "bestStudyCard": {
                    "description": "Description of relationship with variable with strongest relationship for user or population",
                    "$ref": "#\/definitions\/Card"
                },
                "bestUserStudyLink": {
                    "description": "Link to study comparing variable with strongest relationship for user",
                    "type": "string"
                },
                "bestUserStudyCard": {
                    "description": "Description of relationship with variable with strongest relationship for user",
                    "$ref": "#\/definitions\/Card"
                },
                "bestPopulationStudyLink": {
                    "description": "Link to study comparing variable with strongest relationship for population",
                    "type": "string"
                },
                "bestPopulationStudyCard": {
                    "description": "Description of relationship with variable with strongest relationship for population",
                    "$ref": "#\/definitions\/Card"
                },
                "optimalValueMessage": {
                    "description": "Description of relationship with variable with strongest relationship for user or population",
                    "type": "string"
                },
                "commonOptimalValueMessage": {
                    "description": "Description of relationship with variable with strongest relationship for population",
                    "type": "string"
                },
                "userOptimalValueMessage": {
                    "description": "Description of relationship with variable with strongest relationship for user",
                    "type": "string"
                },
                "card": {
                    "description": "Card containing instructions, image, text, link and relevant import buttons",
                    "$ref": "#\/definitions\/Card"
                },
                "clientId": {
                    "description": "Your QuantiModo client id can be obtained by creating an app at https:\/\/builder.quantimo.do",
                    "type": "string"
                },
                "combinationOperation": {
                    "description": "The way multiple measurements are aggregated over time",
                    "enum": [
                        "MEAN",
                        "SUM"
                    ],
                    "type": "string"
                },
                "createdAt": {
                    "description": "Ex: 2016-05-18 02:24:08 UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "displayName": {
                    "description": "Ex: Trader Joe's Bedtime Tea",
                    "type": "string"
                },
                "unitAbbreviatedName": {
                    "description": "Ex: \/5",
                    "type": "string"
                },
                "unitCategoryId": {
                    "description": "Ex: 5",
                    "type": "integer"
                },
                "unitCategoryName": {
                    "description": "Ex: Rating",
                    "type": "string"
                },
                "unitId": {
                    "description": "Ex: 10",
                    "type": "integer"
                },
                "unitName": {
                    "description": "Ex: 1 to 5 Rating",
                    "type": "string"
                },
                "defaultValue": {
                    "description": "Default value to use for the measurement when tracking. Unit: User-specified or common.",
                    "format": "float",
                    "type": "number"
                },
                "enabled": {
                    "description": "If a tracking reminder is enabled, tracking reminder notifications will be generated for this variable.",
                    "type": "boolean"
                },
                "email": {
                    "description": "True if the reminders should be delivered via email",
                    "type": "boolean"
                },
                "errorMessage": {
                    "description": "Ex: reminderStartTimeLocal is less than $user->earliestReminderTime or greater than  $user->latestReminderTime",
                    "type": "string"
                },
                "fillingValue": {
                    "description": "Ex: 0. Unit: User-specified or common.",
                    "type": "integer"
                },
                "firstDailyReminderTime": {
                    "description": "Ex: 02:45:20 in UTC timezone",
                    "type": "string"
                },
                "frequencyTextDescription": {
                    "description": "Ex: Daily",
                    "type": "string"
                },
                "frequencyTextDescriptionWithTime": {
                    "description": "Ex: Daily at 09:45 PM",
                    "type": "string"
                },
                "id": {
                    "description": "id",
                    "format": "int32",
                    "type": "integer"
                },
                "inputType": {
                    "description": "Ex: saddestFaceIsFive",
                    "type": "string"
                },
                "instructions": {
                    "description": "Ex: I am an instruction!",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-sad-outline",
                    "type": "string"
                },
                "lastTracked": {
                    "description": "UTC ISO 8601 YYYY-MM-DDThh:mm:ss timestamp for the last time a measurement was received for this user and variable",
                    "type": "string"
                },
                "lastValue": {
                    "description": "Ex: 2",
                    "format": "double",
                    "type": "number"
                },
                "latestTrackingReminderNotificationReminderTime": {
                    "description": "UTC ISO 8601 YYYY-MM-DDThh:mm:ss  timestamp for the reminder time of the latest tracking reminder notification that has been pre-emptively generated in the database",
                    "type": "string"
                },
                "localDailyReminderNotificationTimes": {
                    "items": {
                        "type": "string"
                    },
                    "type": "array"
                },
                "localDailyReminderNotificationTimesForAllReminders": {
                    "items": {
                        "type": "string"
                    },
                    "type": "array"
                },
                "manualTracking": {
                    "description": "Ex: 1",
                    "type": "boolean"
                },
                "maximumAllowedValue": {
                    "description": "Ex: 5. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "minimumAllowedValue": {
                    "description": "Ex: 1. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "nextReminderTimeEpochSeconds": {
                    "description": "Ex: 1501555520",
                    "type": "integer"
                },
                "notificationBar": {
                    "description": "True if the reminders should appear in the notification bar",
                    "type": "boolean"
                },
                "numberOfRawMeasurements": {
                    "description": "Ex: 445",
                    "type": "integer"
                },
                "numberOfUniqueValues": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "outcome": {
                    "description": "Indicates whether or not the variable is usually an outcome of interest such as a symptom or emotion",
                    "type": "boolean"
                },
                "pngPath": {
                    "description": "Ex: img\/variable_categories\/symptoms.png",
                    "type": "string"
                },
                "pngUrl": {
                    "description": "Ex: https:\/\/web.quantimo.do\/img\/variable_categories\/symptoms.png",
                    "type": "string"
                },
                "productUrl": {
                    "description": "Link to associated product for purchase",
                    "type": "string"
                },
                "popUp": {
                    "description": "True if the reminders should appear as a popup notification",
                    "type": "boolean"
                },
                "question": {
                    "description": "Ex: How is your overall mood?",
                    "type": "string"
                },
                "longQuestion": {
                    "description": "Ex: How is your overall mood on a scale of 1 to 5??",
                    "type": "string"
                },
                "reminderEndTime": {
                    "description": "Latest time of day at which reminders should appear in UTC HH:MM:SS format",
                    "type": "string"
                },
                "reminderFrequency": {
                    "description": "Number of seconds between one reminder and the next",
                    "format": "int32",
                    "type": "integer"
                },
                "reminderSound": {
                    "description": "String identifier for the sound to accompany the reminder",
                    "type": "string"
                },
                "reminderStartEpochSeconds": {
                    "description": "Ex: 1469760320",
                    "type": "integer"
                },
                "reminderStartTime": {
                    "description": "Earliest time of day at which reminders should appear in UTC HH:MM:SS format",
                    "type": "string"
                },
                "reminderStartTimeLocal": {
                    "description": "Ex: 21:45:20",
                    "format": "string",
                    "type": "string"
                },
                "reminderStartTimeLocalHumanFormatted": {
                    "description": "Ex: 09:45 PM",
                    "type": "string"
                },
                "repeating": {
                    "description": "Ex: true",
                    "type": "boolean"
                },
                "secondDailyReminderTime": {
                    "description": "Ex: 01:00:00",
                    "type": "string"
                },
                "secondToLastValue": {
                    "description": "Ex: 1. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "sms": {
                    "description": "True if the reminders should be delivered via SMS",
                    "type": "boolean"
                },
                "startTrackingDate": {
                    "description": "Earliest date on which the user should be reminded to track in YYYY-MM-DD format",
                    "format": "string",
                    "type": "string"
                },
                "stopTrackingDate": {
                    "description": "Latest date on which the user should be reminded to track in YYYY-MM-DD format",
                    "format": "string",
                    "type": "string"
                },
                "svgUrl": {
                    "description": "Ex: https:\/\/web.quantimo.do\/img\/variable_categories\/symptoms.svg",
                    "type": "string"
                },
                "thirdDailyReminderTime": {
                    "description": "Ex: 20:00:00",
                    "type": "string"
                },
                "thirdToLastValue": {
                    "description": "Ex: 3",
                    "format": "double",
                    "type": "number"
                },
                "trackingReminderId": {
                    "description": "Ex: 11841",
                    "type": "integer"
                },
                "trackingReminderImageUrl": {
                    "description": "Ex: Not Found",
                    "type": "string"
                },
                "upc": {
                    "description": "UPC or other barcode scan result",
                    "type": "string"
                },
                "updatedAt": {
                    "description": "When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.",
                    "type": "string"
                },
                "userId": {
                    "description": "ID of User",
                    "format": "int32",
                    "type": "integer"
                },
                "userVariableUnitAbbreviatedName": {
                    "description": "Ex: \/5",
                    "type": "string"
                },
                "userVariableUnitCategoryId": {
                    "description": "Ex: 5",
                    "type": "integer"
                },
                "userVariableUnitCategoryName": {
                    "description": "Ex: Rating",
                    "type": "string"
                },
                "userVariableUnitId": {
                    "description": "Ex: 10",
                    "type": "integer"
                },
                "userVariableUnitName": {
                    "description": "Ex: 1 to 5 Rating",
                    "type": "string"
                },
                "userVariableVariableCategoryId": {
                    "description": "Ex: 10",
                    "type": "integer"
                },
                "userVariableVariableCategoryName": {
                    "description": "Ex: Symptoms",
                    "type": "string"
                },
                "valence": {
                    "description": "Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5\/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1\/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. ",
                    "type": "string"
                },
                "valueAndFrequencyTextDescription": {
                    "description": "Ex: Rate daily",
                    "type": "string"
                },
                "valueAndFrequencyTextDescriptionWithTime": {
                    "description": "Ex: Rate daily at 09:45 PM",
                    "type": "string"
                },
                "variableCategoryId": {
                    "description": "Ex: 10",
                    "type": "integer"
                },
                "variableCategoryImageUrl": {
                    "description": "Ex: https:\/\/static.quantimo.do\/img\/variable_categories\/sad-96.png",
                    "type": "string"
                },
                "variableCategoryName": {
                    "description": "Ex: Emotions, Treatments, Symptoms...",
                    "enum": [
                        "Activity",
                        "Books",
                        "Causes of Illness",
                        "Cognitive Performance",
                        "Conditions",
                        "Emotions",
                        "Environment",
                        "Foods",
                        "Goals",
                        "Locations",
                        "Miscellaneous",
                        "Movies and TV",
                        "Music",
                        "Nutrients",
                        "Payments",
                        "Physical Activities",
                        "Physique",
                        "Sleep",
                        "Social Interactions",
                        "Software",
                        "Symptoms",
                        "Treatments",
                        "Vital Signs"
                    ],
                    "type": "string"
                },
                "variableDescription": {
                    "description": "Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5\/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1\/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. ",
                    "type": "string"
                },
                "variableId": {
                    "description": "Id for the variable to be tracked",
                    "format": "int32",
                    "type": "integer"
                },
                "variableName": {
                    "description": "Name of the variable to be used when sending measurements",
                    "type": "string"
                }
            },
            "required": [
                "reminderFrequency",
                "unitAbbreviatedName",
                "variableCategoryName",
                "variableName"
            ]
        },
        "TrackingReminderDelete": {
            "properties": {
                "id": {
                    "description": "Id of the TrackingReminder to be deleted",
                    "type": "integer"
                }
            },
            "required": [
                "id"
            ]
        },
        "TrackingReminderNotification": {
            "properties": {
                "actionArray": {
                    "items": {
                        "$ref": "#\/definitions\/TrackingReminderNotificationAction"
                    },
                    "type": "array"
                },
                "availableUnits": {
                    "items": {
                        "$ref": "#\/definitions\/Unit"
                    },
                    "type": "array"
                },
                "bestStudyLink": {
                    "description": "Link to study comparing variable with strongest relationship for user or population",
                    "type": "string"
                },
                "bestStudyCard": {
                    "description": "Description of relationship with variable with strongest relationship for user or population",
                    "$ref": "#\/definitions\/Card"
                },
                "bestUserStudyLink": {
                    "description": "Link to study comparing variable with strongest relationship for user",
                    "type": "string"
                },
                "bestUserStudyCard": {
                    "description": "Description of relationship with variable with strongest relationship for user",
                    "$ref": "#\/definitions\/Card"
                },
                "bestPopulationStudyLink": {
                    "description": "Link to study comparing variable with strongest relationship for population",
                    "type": "string"
                },
                "bestPopulationStudyCard": {
                    "description": "Description of relationship with variable with strongest relationship for population",
                    "$ref": "#\/definitions\/Card"
                },
                "optimalValueMessage": {
                    "description": "Description of relationship with variable with strongest relationship for user or population",
                    "type": "string"
                },
                "commonOptimalValueMessage": {
                    "description": "Description of relationship with variable with strongest relationship for population",
                    "type": "string"
                },
                "userOptimalValueMessage": {
                    "description": "Description of relationship with variable with strongest relationship for user",
                    "type": "string"
                },
                "card": {
                    "description": "Card with options for tracking.",
                    "$ref": "#\/definitions\/Card"
                },
                "clientId": {
                    "description": "Your QuantiModo client id can be obtained by creating an app at https:\/\/builder.quantimo.do",
                    "type": "string"
                },
                "combinationOperation": {
                    "description": "The way multiple measurements are aggregated over time",
                    "enum": [
                        "MEAN",
                        "SUM"
                    ],
                    "type": "string"
                },
                "createdAt": {
                    "description": "Ex: 2017-07-29 20:49:54 UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "displayName": {
                    "description": "Ex: Trader Joe's Bedtime Tea",
                    "type": "string"
                },
                "modifiedValue": {
                    "description": "Is the user specified default value or falls back to the last value in user unit. Good for initializing input fields. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "unitAbbreviatedName": {
                    "description": "Ex: \/5",
                    "type": "string"
                },
                "unitCategoryId": {
                    "description": "Ex: 5",
                    "type": "integer"
                },
                "unitCategoryName": {
                    "description": "Ex: Rating",
                    "type": "string"
                },
                "unitId": {
                    "description": "Ex: 10",
                    "type": "integer"
                },
                "unitName": {
                    "description": "Ex: 1 to 5 Rating",
                    "type": "string"
                },
                "defaultValue": {
                    "description": "Default value to use for the measurement when tracking",
                    "format": "float",
                    "type": "number"
                },
                "description": {
                    "description": "Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5\/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1\/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. ",
                    "type": "string"
                },
                "email": {
                    "description": "True if the reminders should be delivered via email",
                    "type": "boolean"
                },
                "fillingValue": {
                    "description": "Ex: 0",
                    "type": "integer"
                },
                "iconIcon": {
                    "description": "Ex: ion-sad-outline",
                    "type": "string"
                },
                "id": {
                    "description": "id for the specific PENDING tracking remidner",
                    "format": "int32",
                    "type": "integer"
                },
                "imageUrl": {
                    "description": "Ex: https:\/\/rximage.nlm.nih.gov\/image\/images\/gallery\/original\/55111-0129-60_RXNAVIMAGE10_B051D81E.jpg",
                    "type": "string"
                },
                "inputType": {
                    "description": "Ex: happiestFaceIsFive",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-happy-outline",
                    "type": "string"
                },
                "lastValue": {
                    "description": "Ex: 3",
                    "format": "double",
                    "type": "number"
                },
                "manualTracking": {
                    "description": "True if this variable is normally tracked via manual user input rather than automatic imports",
                    "type": "boolean"
                },
                "maximumAllowedValue": {
                    "description": "Ex: 5",
                    "type": "integer"
                },
                "minimumAllowedValue": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "mostCommonValue": {
                    "description": "Ex: 3",
                    "format": "double",
                    "type": "number"
                },
                "notificationBar": {
                    "description": "True if the reminders should appear in the notification bar",
                    "type": "boolean"
                },
                "notifiedAt": {
                    "description": "Ex: UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "numberOfUniqueValues": {
                    "description": "Ex: 5",
                    "type": "integer"
                },
                "outcome": {
                    "description": "Indicates whether or not the variable is usually an outcome of interest such as a symptom or emotion",
                    "type": "boolean"
                },
                "pngPath": {
                    "description": "Ex: img\/variable_categories\/emotions.png",
                    "type": "string"
                },
                "pngUrl": {
                    "description": "Ex: https:\/\/web.quantimo.do\/img\/variable_categories\/emotions.png",
                    "type": "string"
                },
                "popUp": {
                    "description": "True if the reminders should appear as a popup notification",
                    "type": "boolean"
                },
                "productUrl": {
                    "description": "Link to associated product for purchase",
                    "type": "string"
                },
                "question": {
                    "description": "Ex: How is your overall mood?",
                    "type": "string"
                },
                "longQuestion": {
                    "description": "Ex: How is your overall mood on a scale of 1 to 5??",
                    "type": "string"
                },
                "reminderEndTime": {
                    "description": "Ex: 01-01-2018",
                    "type": "string"
                },
                "reminderFrequency": {
                    "description": "How often user should be reminded in seconds. Ex: 86400",
                    "type": "integer"
                },
                "reminderSound": {
                    "description": "String identifier for the sound to accompany the reminder",
                    "type": "string"
                },
                "reminderStartTime": {
                    "description": "Earliest time of day at which reminders should appear in UTC HH:MM:SS format",
                    "type": "string"
                },
                "reminderTime": {
                    "description": "UTC ISO 8601 YYYY-MM-DDThh:mm:ss timestamp for the specific time the variable should be tracked in UTC.  This will be used for the measurement startTime if the track endpoint is used.",
                    "type": "string"
                },
                "secondMostCommonValue": {
                    "description": "Ex: 4",
                    "format": "double",
                    "type": "number"
                },
                "secondToLastValue": {
                    "description": "Ex: 1",
                    "format": "double",
                    "type": "number"
                },
                "sms": {
                    "description": "True if the reminders should be delivered via SMS",
                    "type": "boolean"
                },
                "svgUrl": {
                    "description": "Ex: https:\/\/web.quantimo.do\/img\/variable_categories\/emotions.svg",
                    "type": "string"
                },
                "thirdMostCommonValue": {
                    "description": "Ex: 2",
                    "format": "double",
                    "type": "number"
                },
                "thirdToLastValue": {
                    "description": "Ex: 2",
                    "format": "double",
                    "type": "number"
                },
                "title": {
                    "description": "Ex: Rate Overall Mood",
                    "type": "string"
                },
                "total": {
                    "description": "Ex: 3",
                    "format": "double",
                    "type": "number"
                },
                "trackAllActions": {
                    "items": {
                        "$ref": "#\/definitions\/TrackingReminderNotificationTrackAllAction"
                    },
                    "type": "array"
                },
                "trackingReminderId": {
                    "description": "id for the repeating tracking remidner",
                    "format": "int32",
                    "type": "integer"
                },
                "trackingReminderImageUrl": {
                    "description": "Ex: https:\/\/rximage.nlm.nih.gov\/image\/images\/gallery\/original\/55111-0129-60_RXNAVIMAGE10_B051D81E.jpg",
                    "type": "string"
                },
                "trackingReminderNotificationId": {
                    "description": "Ex: 5072482",
                    "type": "integer"
                },
                "trackingReminderNotificationTime": {
                    "description": "UTC ISO 8601 YYYY-MM-DDThh:mm:ss timestamp for the specific time the variable should be tracked in UTC.  This will be used for the measurement startTime if the track endpoint is used.",
                    "type": "string"
                },
                "trackingReminderNotificationTimeEpoch": {
                    "description": "Ex: 1501534124",
                    "type": "integer"
                },
                "trackingReminderNotificationTimeLocal": {
                    "description": "Ex: 15:48:44",
                    "type": "string"
                },
                "trackingReminderNotificationTimeLocalHumanString": {
                    "description": "Ex: 8PM Sun, May 1",
                    "type": "string"
                },
                "updatedAt": {
                    "description": "When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.",
                    "type": "string"
                },
                "userId": {
                    "description": "ID of User",
                    "format": "int32",
                    "type": "integer"
                },
                "userVariableUnitAbbreviatedName": {
                    "description": "Ex: \/5",
                    "type": "string"
                },
                "userVariableUnitCategoryId": {
                    "description": "Ex: 5",
                    "type": "integer"
                },
                "userVariableUnitCategoryName": {
                    "description": "Ex: Rating",
                    "type": "string"
                },
                "userVariableUnitId": {
                    "description": "Ex: 10",
                    "type": "integer"
                },
                "userVariableUnitName": {
                    "description": "Ex: 1 to 5 Rating",
                    "type": "string"
                },
                "userVariableVariableCategoryId": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "userVariableVariableCategoryName": {
                    "description": "Ex: Emotions",
                    "type": "string"
                },
                "valence": {
                    "description": "Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5\/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1\/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. ",
                    "type": "string"
                },
                "variableCategoryId": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "variableCategoryImageUrl": {
                    "description": "Ex: https:\/\/static.quantimo.do\/img\/variable_categories\/theatre_mask-96.png",
                    "type": "string"
                },
                "variableCategoryName": {
                    "description": "Ex: Emotions, Treatments, Symptoms...",
                    "enum": [
                        "Activity",
                        "Books",
                        "Causes of Illness",
                        "Cognitive Performance",
                        "Conditions",
                        "Emotions",
                        "Environment",
                        "Foods",
                        "Goals",
                        "Locations",
                        "Miscellaneous",
                        "Movies and TV",
                        "Music",
                        "Nutrients",
                        "Payments",
                        "Physical Activities",
                        "Physique",
                        "Sleep",
                        "Social Interactions",
                        "Software",
                        "Symptoms",
                        "Treatments",
                        "Vital Signs"
                    ],
                    "type": "string"
                },
                "variableId": {
                    "description": "Id for the variable to be tracked",
                    "format": "int32",
                    "type": "integer"
                },
                "variableImageUrl": {
                    "description": "Ex: https:\/\/image.png",
                    "type": "string"
                },
                "variableName": {
                    "description": "Name of the variable to be used when sending measurements",
                    "type": "string"
                }
            },
            "required": [
                "actionArray",
                "availableUnits",
                "fillingValue",
                "id",
                "trackAllActions"
            ]
        },
        "TrackingReminderNotificationAction": {
            "properties": {
                "action": {
                    "description": "Ex: track",
                    "type": "string"
                },
                "callback": {
                    "description": "Ex: trackThreeRatingAction",
                    "type": "string"
                },
                "modifiedValue": {
                    "description": "Ex: 3",
                    "type": "integer"
                },
                "title": {
                    "description": "Ex: 3\/5",
                    "type": "string"
                },
                "longTitle": {
                    "description": "Ex: Rate 3\/5",
                    "type": "string"
                },
                "shortTitle": {
                    "description": "Ex: 3",
                    "type": "string"
                }
            },
            "required": [
                "action",
                "callback",
                "modifiedValue",
                "title"
            ]
        },
        "TrackingReminderNotificationPost": {
            "properties": {
                "action": {
                    "description": "track records a measurement for the notification.  snooze changes the notification to 1 hour from now. skip deletes the notification.",
                    "enum": [
                        "skip",
                        "snooze",
                        "track"
                    ],
                    "type": "string"
                },
                "id": {
                    "description": "Id of the TrackingReminderNotification",
                    "type": "number"
                },
                "modifiedValue": {
                    "description": "Optional value to be recorded instead of the tracking reminder default value",
                    "type": "number"
                }
            },
            "required": [
                "action",
                "id"
            ]
        },
        "TrackingReminderNotificationTrackAllAction": {
            "properties": {
                "action": {
                    "description": "Ex: trackAll",
                    "type": "string"
                },
                "callback": {
                    "description": "Ex: trackThreeRatingAction",
                    "type": "string"
                },
                "modifiedValue": {
                    "description": "Ex: 3",
                    "type": "integer"
                },
                "title": {
                    "description": "Ex: Rate 3\/5 for all",
                    "type": "string"
                }
            },
            "required": [
                "action",
                "callback",
                "modifiedValue",
                "title"
            ]
        },
        "Unit": {
            "properties": {
                "abbreviatedName": {
                    "description": "Unit abbreviation",
                    "type": "string"
                },
                "advanced": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "category": {
                    "description": "Unit category",
                    "enum": [
                        "Distance",
                        "Duration",
                        "Energy",
                        "Frequency",
                        "Miscellany",
                        "Pressure",
                        "Proportion",
                        "Rating",
                        "Temperature",
                        "Volume",
                        "Weight",
                        "Count"
                    ],
                    "type": "string"
                },
                "categoryId": {
                    "description": "Ex: 6",
                    "type": "integer"
                },
                "categoryName": {
                    "description": "Ex: Miscellany",
                    "type": "string"
                },
                "conversionSteps": {
                    "description": "Conversion steps list",
                    "items": {
                        "$ref": "#\/definitions\/ConversionStep"
                    },
                    "type": "array"
                },
                "id": {
                    "description": "Ex: 29",
                    "type": "integer"
                },
                "manualTracking": {
                    "description": "Ex: 0",
                    "type": "integer"
                },
                "maximumAllowedValue": {
                    "description": "The maximum allowed value for measurements. While you can record a value above this maximum, it will be excluded from the correlation analysis.",
                    "format": "double",
                    "type": "number"
                },
                "maximumValue": {
                    "description": "Ex: 4",
                    "type": "integer"
                },
                "minimumAllowedValue": {
                    "description": "The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.",
                    "format": "double",
                    "type": "number"
                },
                "minimumValue": {
                    "description": "Ex: 0",
                    "type": "integer"
                },
                "name": {
                    "description": "Unit name",
                    "type": "string"
                },
                "unitCategory": {
                    "$ref": "#\/definitions\/UnitCategory"
                }
            },
            "required": [
                "abbreviatedName",
                "category",
                "conversionSteps",
                "maximumValue",
                "name",
                "unitCategory"
            ]
        },
        "UnitCategory": {
            "properties": {
                "id": {
                    "description": "id",
                    "type": "integer"
                },
                "name": {
                    "description": "Category name",
                    "type": "string"
                },
                "standardUnitAbbreviatedName": {
                    "description": "Base unit for in which measurements are to be converted to and stored",
                    "type": "string"
                }
            },
            "required": [
                "name"
            ]
        },
        "User": {
            "properties": {
                "accessToken": {
                    "description": "User access token",
                    "type": "string"
                },
                "accessTokenExpires": {
                    "description": "Ex: 2018-08-08 02:41:19",
                    "type": "string"
                },
                "accessTokenExpiresAtMilliseconds": {
                    "description": "Ex: 1533696079000",
                    "type": "integer"
                },
                "administrator": {
                    "description": "Is user administrator",
                    "type": "boolean"
                },
                "authorizedClients": {
                    "$ref": "#\/definitions\/AuthorizedClients"
                },
                "avatar": {
                    "description": "Ex: https:\/\/lh6.googleusercontent.com\/-BHr4hyUWqZU\/AAAAAAAAAAI\/AAAAAAAIG28\/2Lv0en738II\/photo.jpg?sz=50",
                    "type": "string"
                },
                "avatarImage": {
                    "description": "Ex: https:\/\/lh6.googleusercontent.com\/-BHr4hyUWqZU\/AAAAAAAAAAI\/AAAAAAAIG28\/2Lv0en738II\/photo.jpg?sz=50",
                    "type": "string"
                },
                "capabilities": {
                    "description": "Ex: a:1:{s:13:\"administrator\";b:1;}",
                    "type": "string"
                },
                "card": {
                    "description": "Avatar and info",
                    "$ref": "#\/definitions\/Card"
                },
                "clientId": {
                    "description": "Ex: quantimodo",
                    "type": "string"
                },
                "clientUserId": {
                    "description": "Ex: 118444693184829555362",
                    "type": "string"
                },
                "combineNotifications": {
                    "description": "Ex: 1",
                    "type": "boolean"
                },
                "createdAt": {
                    "description": "When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format",
                    "type": "string"
                },
                "description": {
                    "description": "Your bio will be displayed on your published studies",
                    "type": "string"
                },
                "displayName": {
                    "description": "User display name",
                    "type": "string"
                },
                "earliestReminderTime": {
                    "description": "Earliest time user should get notifications. Ex: 05:00:00",
                    "type": "string"
                },
                "email": {
                    "description": "User email",
                    "type": "string"
                },
                "firstName": {
                    "description": "Ex: Mike",
                    "type": "string"
                },
                "getPreviewBuilds": {
                    "description": "Ex: false",
                    "type": "boolean"
                },
                "hasAndroidApp": {
                    "description": "Ex: false",
                    "type": "boolean"
                },
                "hasChromeExtension": {
                    "description": "Ex: false",
                    "type": "boolean"
                },
                "hasIosApp": {
                    "description": "Ex: false",
                    "type": "boolean"
                },
                "id": {
                    "description": "User id",
                    "type": "integer"
                },
                "lastActive": {
                    "description": "Ex: Date the user last logged in",
                    "type": "string"
                },
                "lastFour": {
                    "description": "Ex: 2009",
                    "type": "string"
                },
                "lastName": {
                    "description": "Ex: Sinn",
                    "type": "string"
                },
                "lastSmsTrackingReminderNotificationId": {
                    "description": "Ex: 1",
                    "type": "string"
                },
                "latestReminderTime": {
                    "description": "Latest time user should get notifications. Ex: 23:00:00",
                    "type": "string"
                },
                "loginName": {
                    "description": "User login name",
                    "type": "string"
                },
                "password": {
                    "description": "Ex: PASSWORD",
                    "type": "string"
                },
                "phoneNumber": {
                    "description": "Ex: 618-391-0002",
                    "type": "string"
                },
                "phoneVerificationCode": {
                    "description": "Ex: 1234",
                    "type": "string"
                },
                "primaryOutcomeVariableId": {
                    "description": "A good primary outcome variable is something that you want to improve and that changes inexplicably. For instance, if you have anxiety, back pain or arthritis which is worse on some days than others, these would be good candidates for primary outcome variables.  Recording their severity and potential factors will help you identify hidden factors exacerbating or improving them. ",
                    "type": "integer"
                },
                "primaryOutcomeVariableName": {
                    "description": "A good primary outcome variable is something that you want to improve and that changes inexplicably. For instance, if you have anxiety, back pain or arthritis which is worse on some days than others, these would be good candidates for primary outcome variables.  Recording their severity and potential factors will help you identify hidden factors exacerbating or improving them. ",
                    "type": "string"
                },
                "pushNotificationsEnabled": {
                    "description": "Ex: 1",
                    "type": "boolean"
                },
                "refreshToken": {
                    "description": "See https:\/\/oauth.net\/2\/grant-types\/refresh-token\/",
                    "type": "string"
                },
                "roles": {
                    "description": "Ex: [\"admin\"]",
                    "type": "string"
                },
                "sendPredictorEmails": {
                    "description": "Ex: 1",
                    "type": "boolean"
                },
                "sendReminderNotificationEmails": {
                    "description": "Ex: 1",
                    "type": "boolean"
                },
                "shareAllData": {
                    "description": "Share all studies, charts, and measurement data with all other users",
                    "type": "boolean"
                },
                "smsNotificationsEnabled": {
                    "description": "Ex: false",
                    "type": "boolean"
                },
                "stripeActive": {
                    "description": "Ex: 1",
                    "type": "boolean"
                },
                "stripeId": {
                    "description": "Ex: cus_A8CEmcvl8jwLhV",
                    "type": "string"
                },
                "stripePlan": {
                    "description": "Ex: monthly7",
                    "type": "string"
                },
                "stripeSubscription": {
                    "description": "Ex: sub_ANTx3nOE7nzjQf",
                    "type": "string"
                },
                "subscriptionEndsAt": {
                    "description": "UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "subscriptionProvider": {
                    "description": "Ex: google",
                    "type": "string"
                },
                "timeZoneOffset": {
                    "description": "Ex: 300",
                    "type": "integer"
                },
                "trackLocation": {
                    "description": "Ex: 1",
                    "type": "boolean"
                },
                "updatedAt": {
                    "description": "When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format",
                    "type": "string"
                },
                "userRegistered": {
                    "description": "Ex: 2013-12-03 15:25:13 UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "userUrl": {
                    "description": "Ex: https:\/\/plus.google.com\/+MikeSinn",
                    "type": "string"
                }
            },
            "required": [
                "accessToken",
                "administrator",
                "displayName",
                "email",
                "id",
                "loginName"
            ]
        },
        "UsersResponse": {
            "required": [
                "users"
            ],
            "properties": {
                "users": {
                    "items": {
                        "$ref": "#\/definitions\/User"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "Users who granted access to their data",
                    "type": "string"
                },
                "summary": {
                    "description": "Users who granted access to their data",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "html": {
                    "description": "Users who granted access to their data",
                    "type": "string"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "UserTag": {
            "properties": {
                "conversionFactor": {
                    "description": "Number by which we multiply the tagged variable value to obtain the tag variable (ingredient) value",
                    "type": "number"
                },
                "taggedVariableId": {
                    "description": "This is the id of the variable being tagged with an ingredient or something.",
                    "type": "integer"
                },
                "tagVariableId": {
                    "description": "This is the id of the ingredient variable whose value is determined based on the value of the tagged variable.",
                    "type": "integer"
                }
            },
            "required": [
                "conversionFactor",
                "tagVariableId",
                "taggedVariableId"
            ]
        },
        "Variable": {
            "properties": {
                "actionArray": {
                    "items": {
                        "$ref": "#\/definitions\/TrackingReminderNotificationAction"
                    },
                    "type": "array"
                },
                "alias": {
                    "description": "User-Defined Variable Setting:  Alternative display name",
                    "type": "string"
                },
                "availableUnits": {
                    "items": {
                        "$ref": "#\/definitions\/Unit"
                    },
                    "type": "array"
                },
                "bestStudyLink": {
                    "description": "Link to study comparing variable with strongest relationship for user or population",
                    "type": "string"
                },
                "bestStudyCard": {
                    "description": "Description of relationship with variable with strongest relationship for user or population",
                    "$ref": "#\/definitions\/Card"
                },
                "bestUserStudyLink": {
                    "description": "Link to study comparing variable with strongest relationship for user",
                    "type": "string"
                },
                "bestUserStudyCard": {
                    "description": "Description of relationship with variable with strongest relationship for user",
                    "$ref": "#\/definitions\/Card"
                },
                "bestPopulationStudyLink": {
                    "description": "Link to study comparing variable with strongest relationship for population",
                    "type": "string"
                },
                "bestPopulationStudyCard": {
                    "description": "Description of relationship with variable with strongest relationship for population",
                    "$ref": "#\/definitions\/Card"
                },
                "optimalValueMessage": {
                    "description": "Description of relationship with variable with strongest relationship for user or population",
                    "type": "string"
                },
                "commonOptimalValueMessage": {
                    "description": "Description of relationship with variable with strongest relationship for population",
                    "type": "string"
                },
                "userOptimalValueMessage": {
                    "description": "Description of relationship with variable with strongest relationship for user",
                    "type": "string"
                },
                "card": {
                    "description": "Card containing instructions, image, text, link and relevant import buttons",
                    "$ref": "#\/definitions\/Card"
                },
                "causeOnly": {
                    "description": "User-Defined Variable Setting: True indicates that this variable is generally a cause in a causal relationship.  An example of a causeOnly variable would be a variable such as Cloud Cover which would generally not be influenced by the behaviour of the user",
                    "type": "boolean"
                },
                "charts": {
                    "$ref": "#\/definitions\/VariableCharts"
                },
                "chartsLinkDynamic": {
                    "description": "Ex: https:\/\/local.quantimo.do\/ionic\/Modo\/www\/#\/app\/charts\/Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29?variableName=Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Ftreatments.png",
                    "type": "string"
                },
                "chartsLinkEmail": {
                    "description": "Ex: mailto:?subject=Check%20out%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20data%21&body=See%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20history%20at%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png%0A%0AHave%20a%20great%20day!",
                    "type": "string"
                },
                "chartsLinkFacebook": {
                    "description": "Ex: https:\/\/www.facebook.com\/sharer\/sharer.php?u=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png",
                    "type": "string"
                },
                "chartsLinkGoogle": {
                    "description": "Ex: https:\/\/plus.google.com\/share?url=https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png",
                    "type": "string"
                },
                "chartsLinkStatic": {
                    "description": "Ex: https:\/\/local.quantimo.do\/api\/v2\/charts?variableName=Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29&userId=230&pngUrl=https%3A%2F%2Fapp.quantimo.do%2Fionic%2FModo%2Fwww%2Fimg%2Fvariable_categories%2Ftreatments.png",
                    "type": "string"
                },
                "chartsLinkTwitter": {
                    "description": "Ex: https:\/\/twitter.com\/home?status=Check%20out%20my%20Trader%20Joes%20Bedtime%20Tea%20%2F%20Sleepytime%20Tea%20%28any%20Brand%29%20data%21%20https%3A%2F%2Flocal.quantimo.do%2Fapi%2Fv2%2Fcharts%3FvariableName%3DTrader%2520Joes%2520Bedtime%2520Tea%2520%252F%2520Sleepytime%2520Tea%2520%2528any%2520Brand%2529%26userId%3D230%26pngUrl%3Dhttps%253A%252F%252Fapp.quantimo.do%252Fionic%252FModo%252Fwww%252Fimg%252Fvariable_categories%252Ftreatments.png%20%40quantimodo",
                    "type": "string"
                },
                "childCommonTagVariables": {
                    "description": "Commonly defined for all users. An example of a parent category variable would be Fruit when tagged with the child sub-type variables Apple.  Child variable (Apple) measurements will be included when the parent category (Fruit) is analyzed.  This allows us to see how Fruit consumption might be affecting without having to record both Fruit and Apple intake.",
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "childUserTagVariables": {
                    "description": "User-Defined Variable Setting: An example of a parent category variable would be Fruit when tagged with the child sub-type variables Apple.  Child variable (Apple) measurements will be included when the parent category (Fruit) is analyzed.  This allows us to see how Fruit consumption might be affecting without having to record both Fruit and Apple intake.",
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "clientId": {
                    "description": "Your QuantiModo client id can be obtained by creating an app at https:\/\/builder.quantimo.do",
                    "type": "string"
                },
                "combinationOperation": {
                    "description": "User-Defined Variable Setting: How to aggregate measurements over time. SUM should be used for things like minutes of exercise.  If you use MEAN for exercise, then a person might exercise more minutes in one day but add separate measurements that were smaller.  So when we are doing correlational analysis, we would think that the person exercised less that day even though they exercised more.  Conversely, we must use MEAN for things such as ratings which cannot be SUMMED.",
                    "enum": [
                        "MEAN",
                        "SUM"
                    ],
                    "type": "string"
                },
                "commonAlias": {
                    "description": "Ex: Anxiety \/ Nervousness",
                    "type": "string"
                },
                "commonTaggedVariables": {
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "commonTagVariables": {
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "createdAt": {
                    "description": "When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format",
                    "type": "string"
                },
                "dataSourceNames": {
                    "description": "Comma-separated list of source names to limit variables to those sources",
                    "type": "string"
                },
                "dataSources": {
                    "description": "These are sources of measurements for this variable",
                    "type": "array",
                    "items": {
                        "$ref": "#\/definitions\/DataSource"
                    }
                },
                "description": {
                    "description": "User-Defined Variable Setting: Ex: Summary to be used in studies.",
                    "type": "string"
                },
                "displayName": {
                    "description": "Ex: Trader Joe's Bedtime Tea",
                    "type": "string"
                },
                "durationOfAction": {
                    "description": "The amount of time over which a predictor\/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus\/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay. Unit: Seconds",
                    "format": "int32",
                    "type": "integer"
                },
                "durationOfActionInHours": {
                    "description": "User-Defined Variable Setting: The amount of time over which a predictor\/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus\/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.  Unit: Hours",
                    "format": "float",
                    "type": "number"
                },
                "earliestFillingTime": {
                    "description": "Earliest filling time",
                    "format": "int32",
                    "type": "integer"
                },
                "earliestMeasurementTime": {
                    "description": "Earliest measurement time",
                    "format": "int32",
                    "type": "integer"
                },
                "earliestSourceTime": {
                    "description": "Earliest source time",
                    "format": "int32",
                    "type": "integer"
                },
                "errorMessage": {
                    "description": "Error message from last analysis",
                    "type": "string"
                },
                "experimentEndTime": {
                    "description": "User-Defined Variable Setting: Latest measurement time to be used in analysis. Format: UTC ISO 8601 YYYY-MM-DDThh:mm:ss.",
                    "type": "string"
                },
                "experimentStartTime": {
                    "description": "User-Defined Variable Setting: Earliest measurement time to be used in analysis. Format: UTC ISO 8601 YYYY-MM-DDThh:mm:ss.",
                    "type": "string"
                },
                "fillingType": {
                    "description": "User-Defined Variable Setting: When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.",
                    "enum": [
                        "none",
                        "zero-filling",
                        "value-filling"
                    ],
                    "type": "string"
                },
                "fillingValue": {
                    "description": "User-Defined Variable Setting: When it comes to analysis to determine the effects of this variable, knowing when it did not occur is as important as knowing when it did occur. For example, if you are tracking a medication, it is important to know when you did not take it, but you do not have to log zero values for all the days when you haven't taken it. Hence, you can specify a filling value (typically 0) to insert whenever data is missing.  Unit: User-specified or common.",
                    "format": "float",
                    "type": "number"
                },
                "iconIcon": {
                    "description": "Ex: ion-sad-outline",
                    "type": "string"
                },
                "id": {
                    "description": "Ex: 95614",
                    "type": "integer"
                },
                "imageUrl": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "informationalUrl": {
                    "description": "Ex: https:\/\/google.com",
                    "type": "string"
                },
                "ingredientOfCommonTagVariables": {
                    "description": "Commonly defined for all users. IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredient of the variable Lollipop could be Sugar.  This way you only have to record Lollipop consumption and we can use this data to see how sugar might be affecting you.",
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "ingredientCommonTagVariables": {
                    "description": "Commonly defined for all users. IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredient of the variable Lollipop could be Sugar.  This way you only have to record Lollipop consumption and we can use this data to see how sugar might be affecting you.",
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "ingredientOfUserTagVariables": {
                    "description": "User-Defined Variable Setting: IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredient of the variable Lollipop could be Sugar.  This way you only have to record Lollipop consumption and we can use this data to see how sugar might be affecting you.",
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "ingredientUserTagVariables": {
                    "description": "User-Defined Variable Setting: IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredient of the variable Lollipop could be Sugar.  This way you only have to record Lollipop consumption and we can use this data to see how sugar might be affecting you.",
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "inputType": {
                    "description": "Type of input field to show for recording measurements",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "joinedCommonTagVariables": {
                    "description": "Commonly defined for all users.  Joining can be used used to merge duplicate variables. For instance, if two variables called Apples (Red Delicious) and Red Delicious Apples are joined, when one of them is analyzed, the measurements for the other will be included as well.",
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "joinedUserTagVariables": {
                    "description": "User-Defined Variable Setting: Joining can be used used to merge duplicate variables. For instance, if two variables called Apples (Red Delicious) and Red Delicious Apples are joined, when one of them is analyzed, the measurements for the other will be included as well.",
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "joinWith": {
                    "description": "Duplicate variables. If the variable is joined with some other variable then it is not shown to user in the list of variables",
                    "format": "int32",
                    "type": "integer"
                },
                "kurtosis": {
                    "description": "Kurtosis",
                    "format": "float",
                    "type": "number"
                },
                "lastProcessedDailyValue": {
                    "description": "Calculated Statistic: Ex: 500. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "lastSuccessfulUpdateTime": {
                    "description": "When this variable or its settings were last updated UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "lastValue": {
                    "description": "Calculated Statistic: Last measurement value in the common unit or user unit if different. Unit: User-specified or common.",
                    "format": "float",
                    "type": "number"
                },
                "latestFillingTime": {
                    "description": "Latest filling time",
                    "format": "int32",
                    "type": "integer"
                },
                "latestMeasurementTime": {
                    "description": "Latest measurement time. Format: Unix-time epoch seconds.",
                    "format": "int32",
                    "type": "integer"
                },
                "latestSourceTime": {
                    "description": "Latest source time. Format: Unix-time epoch seconds.",
                    "format": "int32",
                    "type": "integer"
                },
                "latestUserMeasurementTime": {
                    "description": "Ex: 1501383600. Format: Unix-time epoch seconds.",
                    "type": "integer"
                },
                "latitude": {
                    "description": "Latitude. Unit: User-specified or common.",
                    "format": "float",
                    "type": "number"
                },
                "location": {
                    "description": "Location",
                    "type": "string"
                },
                "longitude": {
                    "description": "Longitude",
                    "format": "float",
                    "type": "number"
                },
                "manualTracking": {
                    "description": "True if the variable is an emotion or symptom rating that is not typically automatically collected by a device or app.",
                    "type": "boolean"
                },
                "maximumAllowedDailyValue": {
                    "description": "User-Defined Variable Setting: The maximum allowed value a daily aggregated measurement. Unit: User-specified or common.",
                    "format": "float",
                    "type": "number"
                },
                "maximumAllowedValue": {
                    "description": "User-Defined Variable Setting: The maximum allowed value a single measurement. While you can record a value above this maximum, it will be excluded from the correlation analysis.  Unit: User-specified or common.",
                    "format": "float",
                    "type": "number"
                },
                "maximumRecordedDailyValue": {
                    "description": "Calculated Statistic: Maximum recorded daily value of this variable. Unit: User-specified or common.",
                    "format": "float",
                    "type": "number"
                },
                "maximumRecordedValue": {
                    "description": "Calculated Statistic: Ex: 1. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "mean": {
                    "description": "Mean. Unit: User-specified or common.",
                    "format": "float",
                    "type": "number"
                },
                "measurementsAtLastAnalysis": {
                    "description": "Number of measurements at last analysis",
                    "format": "int32",
                    "type": "integer"
                },
                "median": {
                    "description": "Median",
                    "format": "float",
                    "type": "number"
                },
                "minimumAllowedValue": {
                    "description": "User-Defined Variable Setting: The minimum allowed value a single measurement. While you can record a value below this minimum, it will be excluded from the correlation analysis. Unit: User-specified or common",
                    "format": "float",
                    "type": "number"
                },
                "minimumAllowedDailyValue": {
                    "description": "User-Defined Variable Setting: The minimum allowed value a daily aggregated measurement.  For instance, you might set to 100 for steps to keep erroneous 0 daily steps out of the analysis. Unit: User-specified or common.",
                    "format": "float",
                    "type": "number"
                },
                "minimumNonZeroValue": {
                    "description": "User-Defined Variable Setting: The minimum allowed non-zero value a single measurement.  For instance, you might set to 100 mL for steps to keep erroneous 0 daily steps out of the analysis. Unit: User-specified or common.",
                    "format": "float",
                    "type": "number"
                },
                "minimumRecordedValue": {
                    "description": "Minimum recorded value of this variable. Unit: User-specified or common.",
                    "format": "float",
                    "type": "number"
                },
                "mostCommonConnectorId": {
                    "description": "Ex: 51",
                    "type": "integer"
                },
                "mostCommonOriginalUnitId": {
                    "description": "Ex: 23",
                    "type": "integer"
                },
                "mostCommonUnitId": {
                    "description": "Most common Unit ID",
                    "format": "int32",
                    "type": "integer"
                },
                "mostCommonValue": {
                    "description": "Calculated Statistic: Most common value. Unit: User-specified or common.",
                    "format": "float",
                    "type": "number"
                },
                "name": {
                    "description": "Ex: Trader Joes Bedtime Tea \/ Sleepytime Tea (any Brand)",
                    "type": "string"
                },
                "numberOfAggregateCorrelationsAsCause": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "numberOfAggregateCorrelationsAsEffect": {
                    "description": "Ex: 310",
                    "type": "integer"
                },
                "numberOfChanges": {
                    "description": "Number of changes",
                    "format": "int32",
                    "type": "integer"
                },
                "numberOfCorrelations": {
                    "description": "Number of correlations for this variable",
                    "format": "int32",
                    "type": "integer"
                },
                "numberOfCorrelationsAsCause": {
                    "description": "numberOfAggregateCorrelationsAsCause plus numberOfUserCorrelationsAsCause",
                    "type": "integer"
                },
                "numberOfCorrelationsAsEffect": {
                    "description": "numberOfAggregateCorrelationsAsEffect plus numberOfUserCorrelationsAsEffect",
                    "type": "integer"
                },
                "numberOfProcessedDailyMeasurements": {
                    "description": "Number of processed measurements",
                    "format": "int32",
                    "type": "integer"
                },
                "numberOfRawMeasurements": {
                    "description": "Ex: 295",
                    "type": "integer"
                },
                "numberOfTrackingReminders": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "numberOfUniqueDailyValues": {
                    "description": "Number of unique daily values",
                    "format": "float",
                    "type": "number"
                },
                "numberOfUniqueValues": {
                    "description": "Ex: 2",
                    "type": "integer"
                },
                "numberOfUserCorrelationsAsCause": {
                    "description": "Ex: 115",
                    "type": "integer"
                },
                "numberOfUserCorrelationsAsEffect": {
                    "description": "Ex: 29014",
                    "type": "integer"
                },
                "numberOfUserVariables": {
                    "description": "Ex: 2",
                    "type": "integer"
                },
                "onsetDelay": {
                    "description": "The amount of time in seconds that elapses after the predictor\/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor\/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.",
                    "format": "int32",
                    "type": "integer"
                },
                "onsetDelayInHours": {
                    "description": "User-Defined Variable Setting: The amount of time in seconds that elapses after the predictor\/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor\/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.",
                    "format": "double",
                    "type": "number"
                },
                "outcome": {
                    "description": "User-Defined Variable Setting: True for variables for which a human would generally want to identify the influencing factors. These include symptoms of illness, physique, mood, cognitive performance, etc.  Generally correlation calculations are only performed on outcome variables",
                    "type": "boolean"
                },
                "outcomeOfInterest": {
                    "description": "Do you want to receive updates on newly discovered factors influencing this variable?",
                    "type": "boolean"
                },
                "parentCommonTagVariables": {
                    "description": "Commonly defined for all users.  An example of a parent category variable would be Fruit when tagged with the child sub-type variables Apple.  Child variable (Apple) measurements will be included when the parent category (Fruit) is analyzed.  This allows us to see how Fruit consumption might be affecting without having to record both Fruit and Apple intake.",
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "parentUserTagVariables": {
                    "description": "User-defined. An example of a parent category variable would be Fruit when tagged with the child sub-type variables Apple.  Child variable (Apple) measurements will be included when the parent category (Fruit) is analyzed.  This allows us to see how Fruit consumption might be affecting without having to record both Fruit and Apple intake.",
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "pngPath": {
                    "description": "Ex: img\/variable_categories\/treatments.png",
                    "type": "string"
                },
                "pngUrl": {
                    "description": "Ex: https:\/\/web.quantimo.do\/img\/variable_categories\/treatments.png",
                    "type": "string"
                },
                "predictorOfInterest": {
                    "description": "Ex: 0",
                    "type": "integer"
                },
                "price": {
                    "description": "Ex: 95.4",
                    "format": "double",
                    "type": "number"
                },
                "productUrl": {
                    "description": "Link to associated product for purchase",
                    "type": "string"
                },
                "public": {
                    "description": "Should this variable show up in automcomplete searches for users who do not already have measurements for it?",
                    "type": "boolean"
                },
                "question": {
                    "description": "Ex: How is your overall mood?",
                    "type": "string"
                },
                "longQuestion": {
                    "description": "Ex: How is your overall mood on a scale of 1 to 5??",
                    "type": "string"
                },
                "rawMeasurementsAtLastAnalysis": {
                    "description": "Ex: 131",
                    "type": "integer"
                },
                "secondMostCommonValue": {
                    "description": "Calculated Statistic: Ex: 1. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "secondToLastValue": {
                    "description": "Calculated Statistic: Ex: 250. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "shareUserMeasurements": {
                    "description": "Would you like to make your measurements publicly visible?",
                    "type": "boolean"
                },
                "skewness": {
                    "description": "Skewness",
                    "format": "float",
                    "type": "number"
                },
                "standardDeviation": {
                    "description": "Standard deviation Ex: 0.46483219855434",
                    "format": "double",
                    "type": "number"
                },
                "status": {
                    "description": "status",
                    "type": "string"
                },
                "subtitle": {
                    "description": "Based on sort filter and can be shown beneath variable name on search list",
                    "type": "string"
                },
                "svgUrl": {
                    "description": "Ex: https:\/\/web.quantimo.do\/img\/variable_categories\/treatments.svg",
                    "type": "string"
                },
                "thirdMostCommonValue": {
                    "description": "Calculated Statistic: Ex: 6. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "thirdToLastValue": {
                    "description": "Calculated Statistic: Ex: 250. Unit: User-specified or common.",
                    "format": "double",
                    "type": "number"
                },
                "trackingInstructions": {
                    "description": "HTML instructions for tracking",
                    "type": "string"
                },
                "trackingInstructionsCard": {
                    "description": "Instructions for tracking with buttons and images",
                    "$ref": "#\/definitions\/Card"
                },
                "unit": {
                    "$ref": "#\/definitions\/Unit"
                },
                "unitAbbreviatedName": {
                    "description": "Ex: count",
                    "type": "string"
                },
                "unitCategoryId": {
                    "description": "Ex: 6",
                    "type": "integer"
                },
                "unitCategoryName": {
                    "description": "Ex: Miscellany",
                    "type": "string"
                },
                "unitId": {
                    "description": "ID of unit to use for this variable",
                    "format": "int32",
                    "type": "integer"
                },
                "unitName": {
                    "description": "User-Defined Variable Setting: Count",
                    "type": "string"
                },
                "upc": {
                    "description": "Universal product code or similar",
                    "type": "string"
                },
                "updated": {
                    "description": "updated",
                    "format": "int32",
                    "type": "integer"
                },
                "updatedAt": {
                    "description": "When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format",
                    "type": "string"
                },
                "updatedTime": {
                    "description": "Ex: 2017-07-30 14:58:26",
                    "type": "string"
                },
                "userId": {
                    "description": "User ID",
                    "format": "int32",
                    "type": "integer"
                },
                "userTaggedVariables": {
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "userTagVariables": {
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "userVariableUnitAbbreviatedName": {
                    "description": "Ex: count",
                    "type": "string"
                },
                "userVariableUnitCategoryId": {
                    "description": "Ex: 6",
                    "type": "integer"
                },
                "userVariableUnitCategoryName": {
                    "description": "Ex: Miscellany",
                    "type": "string"
                },
                "userVariableUnitId": {
                    "description": "Ex: 23",
                    "type": "integer"
                },
                "userVariableUnitName": {
                    "description": "Ex: Count",
                    "type": "string"
                },
                "variableCategory": {
                    "$ref": "#\/definitions\/VariableCategory"
                },
                "joinedVariables": {
                    "description": "Array of Variables that are joined with this Variable",
                    "items": {
                        "$ref": "#\/definitions\/Variable"
                    },
                    "type": "array"
                },
                "valence": {
                    "description": "Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5\/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1\/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. ",
                    "type": "string"
                },
                "variableCategoryId": {
                    "description": "Ex: 6",
                    "type": "integer"
                },
                "variableCategoryName": {
                    "description": "User-Defined Variable Setting: Variable category like Emotions, Sleep, Physical Activities, Treatments, Symptoms, etc.",
                    "enum": [
                        "Activity",
                        "Books",
                        "Causes of Illness",
                        "Cognitive Performance",
                        "Conditions",
                        "Emotions",
                        "Environment",
                        "Foods",
                        "Goals",
                        "Locations",
                        "Miscellaneous",
                        "Movies and TV",
                        "Music",
                        "Nutrients",
                        "Payments",
                        "Physical Activities",
                        "Physique",
                        "Sleep",
                        "Social Interactions",
                        "Software",
                        "Symptoms",
                        "Treatments",
                        "Vital Signs"
                    ],
                    "type": "string"
                },
                "variableId": {
                    "description": "Ex: 96380",
                    "type": "integer"
                },
                "variableName": {
                    "description": "Ex: Sleep Duration",
                    "type": "string"
                },
                "variance": {
                    "description": "Statistic: Ex: 115947037.40816",
                    "format": "double",
                    "type": "number"
                },
                "wikipediaTitle": {
                    "description": "User-Defined Variable Setting: You can help to improve the studies by pasting the title of the most appropriate Wikipedia article for this variable",
                    "type": "string"
                }
            },
            "required": [
                "variableId",
                "name",
                "userId",
                "id"
            ]
        },
        "UserVariableDelete": {
            "properties": {
                "variableId": {
                    "description": "Id of the variable whose measurements should be deleted",
                    "type": "integer"
                }
            },
            "required": [
                "variableId"
            ]
        },
        "VariableCategory": {
            "properties": {
                "appType": {
                    "description": "Ex: mood",
                    "type": "string"
                },
                "causeOnly": {
                    "description": "Ex: false",
                    "type": "boolean"
                },
                "combinationOperation": {
                    "description": "Ex: MEAN",
                    "type": "string"
                },
                "createdTime": {
                    "description": "UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "unitAbbreviatedName": {
                    "description": "Ex: \/5",
                    "type": "string"
                },
                "unitId": {
                    "description": "Ex: 10",
                    "type": "integer"
                },
                "durationOfAction": {
                    "description": "User-Defined Variable Setting: The amount of time over which a predictor\/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus\/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay.  Unit: Seconds",
                    "type": "integer"
                },
                "fillingValue": {
                    "description": "Ex: -1. Unit: Variable category default unit.",
                    "type": "integer"
                },
                "helpText": {
                    "description": "Ex: What emotion do you want to rate?",
                    "type": "string"
                },
                "id": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "imageUrl": {
                    "description": "Ex: https:\/\/static.quantimo.do\/img\/variable_categories\/theatre_mask-96.png",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-happy-outline",
                    "type": "string"
                },
                "manualTracking": {
                    "description": "Ex: true",
                    "type": "boolean"
                },
                "maximumAllowedValue": {
                    "description": "Unit: Variable category default unit.",
                    "type": "string"
                },
                "measurementSynonymSingularLowercase": {
                    "description": "Ex: rating",
                    "type": "string"
                },
                "minimumAllowedValue": {
                    "description": "Unit: Variable category default unit.",
                    "type": "string"
                },
                "moreInfo": {
                    "description": "Ex: Do you have any emotions that fluctuate regularly?  If so, add them so I can try to determine which factors are influencing them.",
                    "type": "string"
                },
                "name": {
                    "description": "Category name",
                    "type": "string"
                },
                "onsetDelay": {
                    "description": "Ex: 0",
                    "type": "integer"
                },
                "outcome": {
                    "description": "Ex: true",
                    "type": "boolean"
                },
                "pngPath": {
                    "description": "Ex: img\/variable_categories\/emotions.png",
                    "type": "string"
                },
                "pngUrl": {
                    "description": "Ex: https:\/\/web.quantimo.do\/img\/variable_categories\/emotions.png",
                    "type": "string"
                },
                "public": {
                    "description": "Ex: true",
                    "type": "boolean"
                },
                "svgPath": {
                    "description": "Ex: img\/variable_categories\/emotions.svg",
                    "type": "string"
                },
                "svgUrl": {
                    "description": "Ex: https:\/\/web.quantimo.do\/img\/variable_categories\/emotions.svg",
                    "type": "string"
                },
                "updated": {
                    "description": "Ex: 1",
                    "type": "integer"
                },
                "updatedTime": {
                    "description": "UTC ISO 8601 YYYY-MM-DDThh:mm:ss",
                    "type": "string"
                },
                "variableCategoryName": {
                    "description": "Ex: Emotions, Treatments, Symptoms...",
                    "enum": [
                        "Activity",
                        "Books",
                        "Causes of Illness",
                        "Cognitive Performance",
                        "Conditions",
                        "Emotions",
                        "Environment",
                        "Foods",
                        "Goals",
                        "Locations",
                        "Miscellaneous",
                        "Movies and TV",
                        "Music",
                        "Nutrients",
                        "Payments",
                        "Physical Activities",
                        "Physique",
                        "Sleep",
                        "Social Interactions",
                        "Software",
                        "Symptoms",
                        "Treatments",
                        "Vital Signs"
                    ],
                    "type": "string"
                },
                "variableCategoryNameSingular": {
                    "description": "Ex: Emotion",
                    "type": "string"
                }
            },
            "required": [
                "name"
            ]
        },
        "VariableCharts": {
            "description": "An object with various chart properties each property contain and svg and Highcharts configuration",
            "properties": {
                "hourlyColumnChart": {
                    "$ref": "#\/definitions\/Chart"
                },
                "monthlyColumnChart": {
                    "$ref": "#\/definitions\/Chart"
                },
                "distributionColumnChart": {
                    "$ref": "#\/definitions\/Chart"
                },
                "weekdayColumnChart": {
                    "$ref": "#\/definitions\/Chart"
                },
                "lineChartWithoutSmoothing": {
                    "$ref": "#\/definitions\/Chart"
                },
                "lineChartWithSmoothing": {
                    "$ref": "#\/definitions\/Chart"
                }
            }
        },
        "Vote": {
            "properties": {
                "causeVariableId": {
                    "description": "Cause variable id",
                    "type": "integer"
                },
                "clientId": {
                    "description": "Your QuantiModo client id can be obtained by creating an app at https:\/\/builder.quantimo.do",
                    "type": "string"
                },
                "createdAt": {
                    "description": "When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format",
                    "type": "string"
                },
                "effectVariableId": {
                    "description": "Effect variable id",
                    "type": "integer"
                },
                "id": {
                    "description": "id",
                    "format": "int32",
                    "type": "integer"
                },
                "updatedAt": {
                    "description": "When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format",
                    "type": "string"
                },
                "userId": {
                    "description": "ID of User",
                    "format": "int32",
                    "type": "integer"
                },
                "value": {
                    "description": "Vote down for implausible\/not-useful or up for plausible\/useful. Vote none to delete a previous vote.",
                    "enum": [
                        "up",
                        "down",
                        "none"
                    ],
                    "type": "string"
                },
                "type": {
                    "description": "Your QuantiModo client id can be obtained by creating an app at https:\/\/builder.quantimo.do",
                    "enum": [
                        "causality",
                        "usefulness"
                    ],
                    "type": "string"
                }
            },
            "required": [
                "causeVariableId",
                "clientId",
                "effectVariableId",
                "userId",
                "value"
            ]
        },
        "VoteDelete": {
            "properties": {
                "cause": {
                    "description": "Cause variable name for the correlation to which the vote pertains",
                    "type": "string"
                },
                "effect": {
                    "description": "Effect variable name for the correlation to which the vote pertains",
                    "type": "string"
                }
            },
            "required": [
                "cause",
                "effect"
            ]
        },
        "Activity": {
            "required": [
                "id",
                "userId",
                "component",
                "type",
                "action",
                "content",
                "primaryLink",
                "itemId",
                "secondaryItemId",
                "dateRecorded",
                "hideSitewide",
                "mpttLeft",
                "mpttRight",
                "isSpam"
            ],
            "properties": {
                "id": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "userId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "component": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "type": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "action": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "content": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "primaryLink": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "itemId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "secondaryItemId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "dateRecorded": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "hideSitewide": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "mpttLeft": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "mpttRight": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "isSpam": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "metaDataArray": {
                    "description": "Additional activity key-value data",
                    "items": {
                        "type": "object"
                    },
                    "type": "array"
                }
            }
        },
        "ActivitiesResponse": {
            "required": [
                "activities"
            ],
            "properties": {
                "activities": {
                    "items": {
                        "$ref": "#\/definitions\/Activity"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "Activity",
                    "type": "string"
                },
                "summary": {
                    "description": "Activity",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "Friend": {
            "required": [
                "id",
                "initiatorUserId",
                "friendUserId",
                "isConfirmed",
                "isLimited",
                "dateCreated"
            ],
            "properties": {
                "id": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "initiatorUserId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "friendUserId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "isConfirmed": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "isLimited": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "dateCreated": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "metaDataArray": {
                    "description": "Additional friend key-value data",
                    "items": {
                        "type": "object"
                    },
                    "type": "array"
                }
            }
        },
        "FriendsResponse": {
            "required": [
                "friends"
            ],
            "properties": {
                "friends": {
                    "items": {
                        "$ref": "#\/definitions\/Friend"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "Friend",
                    "type": "string"
                },
                "summary": {
                    "description": "Friend",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "Group": {
            "required": [
                "id",
                "creatorId",
                "name",
                "slug",
                "description",
                "status",
                "parentId",
                "enableForum",
                "dateCreated"
            ],
            "properties": {
                "id": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "creatorId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "name": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "slug": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "description": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "status": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "parentId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "enableForum": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "dateCreated": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "metaDataArray": {
                    "description": "Additional group key-value data",
                    "items": {
                        "type": "object"
                    },
                    "type": "array"
                }
            }
        },
        "GroupsResponse": {
            "required": [
                "groups"
            ],
            "properties": {
                "groups": {
                    "items": {
                        "$ref": "#\/definitions\/Group"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "Group",
                    "type": "string"
                },
                "summary": {
                    "description": "Group",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "GroupsMember": {
            "required": [
                "id",
                "groupId",
                "userId",
                "inviterId",
                "isAdmin",
                "isMod",
                "userTitle",
                "dateModified",
                "comments",
                "isConfirmed",
                "isBanned",
                "inviteSent"
            ],
            "properties": {
                "id": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "groupId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "userId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "inviterId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "isAdmin": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "isMod": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "userTitle": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "dateModified": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "comments": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "isConfirmed": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "isBanned": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "inviteSent": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "metaDataArray": {
                    "description": "Additional groupsmember key-value data",
                    "items": {
                        "type": "object"
                    },
                    "type": "array"
                }
            }
        },
        "GroupsMembersResponse": {
            "required": [
                "groupsMembers"
            ],
            "properties": {
                "groupsMembers": {
                    "items": {
                        "$ref": "#\/definitions\/GroupsMember"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "GroupsMember",
                    "type": "string"
                },
                "summary": {
                    "description": "GroupsMember",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "MessagesMessage": {
            "required": [
                "id",
                "threadId",
                "senderId",
                "subject",
                "message",
                "dateSent"
            ],
            "properties": {
                "id": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "threadId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "senderId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "subject": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "message": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "dateSent": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "metaDataArray": {
                    "description": "Additional messagesmessage key-value data",
                    "items": {
                        "type": "object"
                    },
                    "type": "array"
                }
            }
        },
        "MessagesMessagesResponse": {
            "required": [
                "messagesMessages"
            ],
            "properties": {
                "messagesMessages": {
                    "items": {
                        "$ref": "#\/definitions\/MessagesMessage"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "MessagesMessage",
                    "type": "string"
                },
                "summary": {
                    "description": "MessagesMessage",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "MessagesNotice": {
            "required": [
                "id",
                "subject",
                "message",
                "dateSent",
                "isActive"
            ],
            "properties": {
                "id": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "subject": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "message": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "dateSent": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "isActive": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "metaDataArray": {
                    "description": "Additional messagesnotice key-value data",
                    "items": {
                        "type": "object"
                    },
                    "type": "array"
                }
            }
        },
        "MessagesNoticesResponse": {
            "required": [
                "messagesNotices"
            ],
            "properties": {
                "messagesNotices": {
                    "items": {
                        "$ref": "#\/definitions\/MessagesNotice"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "MessagesNotice",
                    "type": "string"
                },
                "summary": {
                    "description": "MessagesNotice",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "error": {
                    "description": "Error message",
                    "type": "string"
                },
                "errorMessage": {
                    "description": "Error message",
                    "type": "string"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "MessagesRecipient": {
            "required": [
                "id",
                "userId",
                "threadId",
                "unreadCount",
                "senderOnly",
                "isDeleted"
            ],
            "properties": {
                "id": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "userId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "threadId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "unreadCount": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "senderOnly": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "isDeleted": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "metaDataArray": {
                    "description": "Additional messagesrecipient key-value data",
                    "items": {
                        "type": "object"
                    },
                    "type": "array"
                }
            }
        },
        "MessagesRecipientsResponse": {
            "required": [
                "messagesRecipients"
            ],
            "properties": {
                "messagesRecipients": {
                    "items": {
                        "$ref": "#\/definitions\/MessagesRecipient"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "MessagesRecipient",
                    "type": "string"
                },
                "summary": {
                    "description": "MessagesRecipient",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "Notification": {
            "required": [
                "id",
                "userId",
                "itemId",
                "secondaryItemId",
                "componentName",
                "componentAction",
                "dateNotified",
                "isNew"
            ],
            "properties": {
                "id": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "userId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "itemId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "secondaryItemId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "componentName": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "componentAction": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "dateNotified": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "isNew": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "metaDataArray": {
                    "description": "Additional notification key-value data",
                    "items": {
                        "type": "object"
                    },
                    "type": "array"
                }
            }
        },
        "NotificationsResponse": {
            "required": [
                "notifications"
            ],
            "properties": {
                "notifications": {
                    "items": {
                        "$ref": "#\/definitions\/Notification"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "Notification",
                    "type": "string"
                },
                "summary": {
                    "description": "Notification",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "UserBlog": {
            "required": [
                "id",
                "userId",
                "blogId"
            ],
            "properties": {
                "id": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "userId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "blogId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "metaDataArray": {
                    "description": "Additional userblog key-value data",
                    "items": {
                        "type": "object"
                    },
                    "type": "array"
                }
            }
        },
        "UserBlogsResponse": {
            "required": [
                "userBlogs"
            ],
            "properties": {
                "userBlogs": {
                    "items": {
                        "$ref": "#\/definitions\/UserBlog"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "UserBlog",
                    "type": "string"
                },
                "summary": {
                    "description": "UserBlog",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "XprofileDatum": {
            "required": [
                "id",
                "fieldId",
                "userId",
                "value",
                "lastUpdated"
            ],
            "properties": {
                "id": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "fieldId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "userId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "value": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "lastUpdated": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "metaDataArray": {
                    "description": "Additional xprofiledatum key-value data",
                    "items": {
                        "type": "object"
                    },
                    "type": "array"
                }
            }
        },
        "XprofileDataResponse": {
            "required": [
                "xprofileData"
            ],
            "properties": {
                "xprofileData": {
                    "items": {
                        "$ref": "#\/definitions\/XprofileDatum"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "XprofileDatum",
                    "type": "string"
                },
                "summary": {
                    "description": "XprofileDatum",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "XprofileField": {
            "required": [
                "id",
                "groupId",
                "parentId",
                "type",
                "name",
                "description",
                "isRequired",
                "isDefaultOption",
                "fieldOrder",
                "optionOrder",
                "orderBy",
                "canDelete"
            ],
            "properties": {
                "id": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "groupId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "parentId": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "type": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "name": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "description": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "isRequired": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "isDefaultOption": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "fieldOrder": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "optionOrder": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "orderBy": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "canDelete": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "metaDataArray": {
                    "description": "Additional xprofilefield key-value data",
                    "items": {
                        "type": "object"
                    },
                    "type": "array"
                }
            }
        },
        "XprofileFieldsResponse": {
            "required": [
                "xprofileFields"
            ],
            "properties": {
                "xprofileFields": {
                    "items": {
                        "$ref": "#\/definitions\/XprofileField"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "XprofileField",
                    "type": "string"
                },
                "summary": {
                    "description": "XprofileField",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        },
        "XprofileGroup": {
            "required": [
                "id",
                "name",
                "description",
                "groupOrder",
                "canDelete"
            ],
            "properties": {
                "id": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "name": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "description": {
                    "description": "What do you expect?",
                    "type": "string"
                },
                "groupOrder": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "canDelete": {
                    "description": "What do you expect?",
                    "type": "integer"
                },
                "metaDataArray": {
                    "description": "Additional xprofilegroup key-value data",
                    "items": {
                        "type": "object"
                    },
                    "type": "array"
                }
            }
        },
        "XprofileGroupsResponse": {
            "required": [
                "xprofileGroups"
            ],
            "properties": {
                "xprofileGroups": {
                    "items": {
                        "$ref": "#\/definitions\/XprofileGroup"
                    },
                    "type": "array"
                },
                "description": {
                    "description": "XprofileGroup",
                    "type": "string"
                },
                "summary": {
                    "description": "XprofileGroup",
                    "type": "string"
                },
                "image": {
                    "$ref": "#\/definitions\/Image"
                },
                "avatar": {
                    "description": "Square icon png url",
                    "type": "string"
                },
                "ionIcon": {
                    "description": "Ex: ion-ios-person",
                    "type": "string"
                },
                "html": {
                    "description": "Embeddable list of study summaries with explanation at the top",
                    "type": "string"
                },
                "errors": {
                    "description": "Array of error objects with message property",
                    "items": {
                        "$ref": "#\/definitions\/Error"
                    },
                    "type": "array"
                },
                "status": {
                    "description": "ex. OK or ERROR",
                    "type": "string"
                },
                "success": {
                    "description": "true or false",
                    "type": "boolean"
                },
                "code": {
                    "description": "Response code such as 200",
                    "type": "number"
                },
                "link": {
                    "description": "A super neat url you might want to share with your users!",
                    "type": "string"
                },
                "card": {
                    "description": "A super neat card with buttons and HTML that you can use in your app!",
                    "$ref": "#\/definitions\/Card"
                }
            }
        }
    },
    "host": "app.quantimo.do",
    "info": {
        "contact": {
            "name": "info@quantimo.do"
        },
        "description": "We make it easy to retrieve and analyze normalized user data from a wide array of devices and applications. Check out our [docs and sdk's](https:\/\/github.com\/QuantiModo\/docs) or [contact us](https:\/\/help.quantimo.do).",
        "license": {
            "name": "Apache 2.0",
            "url": "http:\/\/www.apache.org\/licenses\/LICENSE-2.0.html"
        },
        "termsOfService": "https:\/\/quantimo.do\/tos\/",
        "title": "quantimodo",
        "version": "5.8.112511"
    },
    "parameters": {
        "appVersionParam": {
            "description": "Ex: 2.1.1.0",
            "in": "query",
            "name": "appVersion",
            "required": false,
            "type": "string"
        },
        "causeUnitNameParam": {
            "description": "Name for the unit cause measurements to be returned in",
            "in": "query",
            "name": "causeUnitName",
            "required": false,
            "type": "string"
        },
        "causeVariableNameParam": {
            "description": "Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration",
            "in": "query",
            "name": "causeVariableName",
            "required": false,
            "type": "string"
        },
        "causeVariableIdParam": {
            "description": "Variable id of the hypothetical predictor variable.  Ex: 1398",
            "in": "query",
            "name": "causeVariableId",
            "required": false,
            "type": "integer"
        },
        "predictorVariableNameParam": {
            "description": "Name of the hypothetical predictor variable.  Ex: Sleep Duration",
            "in": "query",
            "name": "predictorVariableName",
            "required": false,
            "type": "string"
        },
        "clientIdParam": {
            "description": "Your QuantiModo client id can be obtained by creating an app at https:\/\/builder.quantimo.do",
            "in": "query",
            "name": "clientId",
            "required": false,
            "type": "string"
        },
        "clientSecretParam": {
            "description": "This is the secret for your obtained clientId. We use this to ensure that only your application uses the clientId.  Obtain this by creating a free application at [https:\/\/builder.quantimo.do](https:\/\/builder.quantimo.do).",
            "in": "query",
            "name": "client_secret",
            "required": false,
            "type": "string"
        },
        "clientUserIdParam": {
            "description": "Ex: 74802",
            "in": "query",
            "name": "clientUserId",
            "required": false,
            "type": "integer"
        },
        "codeParam": {
            "description": "Authorization code you received with the previous request.",
            "in": "query",
            "name": "code",
            "required": true,
            "type": "string"
        },
        "connectorNameParam": {
            "description": "Ex: facebook",
            "in": "query",
            "name": "connectorName",
            "required": false,
            "type": "string"
        },
        "connectorNamePathParam": {
            "description": "Lowercase system name of the source application or device. Get a list of available connectors from the \/v3\/connectors\/list endpoint.",
            "enum": [
                "facebook",
                "fitbit",
                "github",
                "googlecalendar",
                "googlefit",
                "medhelper",
                "mint",
                "moodpanda",
                "moodscope",
                "myfitnesspal",
                "mynetdiary",
                "netatmo",
                "rescuetime",
                "runkeeper",
                "slack",
                "sleepcloud",
                "slice",
                "up",
                "whatpulse",
                "withings",
                "worldweatheronline",
                "foursquare",
                "strava",
                "gmail"
            ],
            "in": "path",
            "name": "connectorName",
            "required": true,
            "type": "string"
        },
        "correlationCoefficientParam": {
            "description": "Pearson correlation coefficient between cause and effect after lagging by onset delay and grouping by duration of action",
            "in": "query",
            "name": "correlationCoefficient",
            "required": false,
            "type": "string"
        },
        "createdParam": {
            "description": "These are studies that you have created",
            "in": "query",
            "name": "created",
            "required": false,
            "type": "boolean"
        },
        "downVotedParam": {
            "description": "These are studies that you have down-voted",
            "in": "query",
            "name": "downvoted",
            "required": false,
            "type": "boolean"
        },
        "createdAtParam": {
            "description": "When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.",
            "in": "query",
            "name": "createdAt",
            "required": false,
            "type": "string"
        },
        "doNotConvertParam": {
            "description": "Ex: 1",
            "in": "query",
            "name": "doNotConvert",
            "required": false,
            "type": "boolean"
        },
        "doNotProcessParam": {
            "description": "Ex: true",
            "in": "query",
            "name": "doNotProcess",
            "required": false,
            "type": "boolean"
        },
        "durationOfActionParam": {
            "description": "The amount of time over which a predictor\/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus\/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay. Unit: Seconds",
            "in": "query",
            "name": "durationOfAction",
            "required": false,
            "type": "string"
        },
        "earliestMeasurementTimeParam": {
            "description": "Excluded records with measurement times earlier than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.",
            "in": "query",
            "name": "earliestMeasurementTime",
            "required": false,
            "type": "string"
        },
        "effectOrCauseParam": {
            "description": "Provided variable is the effect or cause",
            "in": "query",
            "name": "effectOrCause",
            "required": false,
            "type": "string"
        },
        "effectUnitNameParam": {
            "description": "Name for the unit effect measurements to be returned in",
            "in": "query",
            "name": "effectUnitName",
            "required": false,
            "type": "string"
        },
        "effectVariableNameParam": {
            "description": "Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood",
            "in": "query",
            "name": "effectVariableName",
            "required": false,
            "type": "string"
        },
        "effectVariableIdParam": {
            "description": "Variable id of the outcome variable of interest.  Ex: 1398",
            "in": "query",
            "name": "effectVariableId",
            "required": false,
            "type": "integer"
        },
        "outcomeVariableNameParam": {
            "description": "Name of the outcome variable of interest.  Ex: Overall Mood",
            "in": "query",
            "name": "outcomeVariableName",
            "required": false,
            "type": "string"
        },
        "exactMatchParam": {
            "description": "Require exact match",
            "in": "query",
            "name": "exactMatch",
            "required": false,
            "type": "boolean"
        },
        "grantTypeParam": {
            "description": "Grant Type can be 'authorization_code' or 'refresh_token'",
            "in": "query",
            "name": "grant_type",
            "required": true,
            "type": "string"
        },
        "groupingTimezoneParam": {
            "description": "The time (in seconds) over which measurements are grouped together",
            "in": "query",
            "name": "groupingTimezone",
            "required": false,
            "type": "string"
        },
        "groupingWidthParam": {
            "description": "The time (in seconds) over which measurements are grouped together",
            "in": "query",
            "name": "groupingWidth",
            "required": false,
            "type": "integer"
        },
        "includeAuthorizedClientsParam": {
            "description": "Return list of apps, studies, and individuals with access to user data",
            "in": "query",
            "name": "includeAuthorizedClients",
            "required": false,
            "type": "boolean"
        },
        "includeChartsParam": {
            "description": "Highcharts configs that can be used if you have highcharts.js included on the page.  This only works if the id or name query parameter is also provided.",
            "in": "query",
            "name": "includeCharts",
            "required": false,
            "type": "boolean"
        },
        "includeDeletedParam": {
            "description": "Include deleted variables",
            "in": "query",
            "name": "includeDeleted",
            "required": false,
            "type": "boolean"
        },
        "includePrivateParam": {
            "description": "Include user-specific variables in results",
            "in": "query",
            "name": "includePrivate",
            "required": false,
            "type": "boolean"
        },
        "includePublicParam": {
            "description": "Include variables the user has no measurements for",
            "in": "query",
            "name": "includePublic",
            "required": false,
            "type": "boolean"
        },
        "includeTagsParam": {
            "description": "Return parent, child, duplicate, and ingredient variables",
            "in": "query",
            "name": "includeTags",
            "required": false,
            "type": "boolean"
        },
        "joinedParam": {
            "description": "These are studies that you have joined",
            "in": "query",
            "name": "joined",
            "required": false,
            "type": "boolean"
        },
        "lastSourceParam": {
            "description": "Limit variables to those which measurements were last submitted by a specific source. So if you have a client application and you only want variables that were last updated by your app, you can include the name of your app here",
            "in": "query",
            "name": "lastSourceName",
            "required": false,
            "type": "string"
        },
        "latestMeasurementTimeParam": {
            "description": "Excluded records with measurement times later than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.",
            "in": "query",
            "name": "latestMeasurementTime",
            "required": false,
            "type": "string"
        },
        "limitParam": {
            "default": 100,
            "description": "The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.",
            "in": "query",
            "name": "limit",
            "required": false,
            "type": "integer"
        },
        "log": {
            "description": "Username or email",
            "in": "query",
            "name": "log",
            "required": false,
            "type": "string"
        },
        "manualTrackingParam": {
            "description": "Only include variables tracked manually by the user",
            "in": "query",
            "name": "manualTracking",
            "required": false,
            "type": "boolean"
        },
        "minMaxFilterParam": {
            "description": "Ex: 1",
            "in": "query",
            "name": "minMaxFilter",
            "required": false,
            "type": "boolean"
        },
        "numberOfRawMeasurementsParam": {
            "description": "Filter variables by the total number of measurements that they have. This could be used of you want to filter or sort by popularity.",
            "in": "query",
            "name": "numberOfRawMeasurements",
            "required": false,
            "type": "string"
        },
        "offsetParam": {
            "description": "OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.",
            "in": "query",
            "minimum": 0,
            "name": "offset",
            "required": false,
            "type": "integer"
        },
        "onlyPastParam": {
            "description": "Ex: 1",
            "in": "query",
            "name": "onlyPast",
            "required": false,
            "type": "boolean"
        },
        "onsetDelayParam": {
            "description": "The amount of time in seconds that elapses after the predictor\/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor\/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.",
            "in": "query",
            "name": "onsetDelay",
            "required": false,
            "type": "string"
        },
        "openParam": {
            "description": "These are studies that anyone can join",
            "in": "query",
            "name": "open",
            "required": false,
            "type": "boolean"
        },
        "outcomesOfInterestParam": {
            "description": "Only include correlations for which the effect is an outcome of interest for the user",
            "in": "query",
            "name": "outcomesOfInterest",
            "required": false,
            "type": "boolean"
        },
        "platform": {
            "description": "Ex: chrome, android, ios, web",
            "in": "query",
            "name": "platform",
            "required": false,
            "type": "string",
            "enum": [
                "chrome",
                "android",
                "ios",
                "web"
            ]
        },
        "populationParam": {
            "description": "These are studies based on the entire population of users that have shared their data",
            "in": "query",
            "name": "population",
            "required": false,
            "type": "boolean"
        },
        "principalInvestigatorUserIdParam": {
            "description": "These are studies created by a specific principal investigator",
            "in": "query",
            "name": "principalInvestigatorUserId",
            "required": false,
            "type": "integer"
        },
        "publicEffectOrCauseParam": {
            "description": "Ex: ",
            "in": "query",
            "name": "publicEffectOrCause",
            "required": false,
            "type": "string"
        },
        "pwd": {
            "description": "User password",
            "in": "query",
            "name": "pwd",
            "required": false,
            "type": "string"
        },
        "recalculate": {
            "description": "Recalculate instead of using cached analysis",
            "in": "query",
            "name": "recalculate",
            "required": false,
            "type": "boolean"
        },
        "redirectUriParam": {
            "description": "The redirect URI is the URL within your client application that will receive the OAuth2 credentials.",
            "in": "query",
            "name": "redirect_uri",
            "required": false,
            "type": "string"
        },
        "reminderTimeParam": {
            "description": "Ex: (lt)2017-07-31 21:43:26",
            "in": "query",
            "name": "reminderTime",
            "required": false,
            "type": "string"
        },
        "responseTypeParam": {
            "description": "If the value is code, launches a Basic flow, requiring a POST to the token endpoint to obtain the tokens. If the value is token id_token or id_token token, launches an Implicit flow, requiring the use of Javascript at the redirect URI to retrieve tokens from the URI #fragment.",
            "in": "query",
            "name": "response_type",
            "required": true,
            "type": "string"
        },
        "scopeParam": {
            "description": "Scopes include basic, readmeasurements, and writemeasurements. The `basic` scope allows you to read user info (displayName, email, etc). The `readmeasurements` scope allows one to read a user's data. The `writemeasurements` scope allows you to write user data. Separate multiple scopes by a space.",
            "in": "query",
            "name": "scope",
            "required": true,
            "type": "string"
        },
        "searchPhraseParam": {
            "description": "Ex: %Body Fat%",
            "in": "query",
            "name": "searchPhrase",
            "required": false,
            "type": "string"
        },
        "sortParam": {
            "description": "Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.",
            "in": "query",
            "name": "sort",
            "required": false,
            "type": "string"
        },
        "sourceNameParam": {
            "description": "ID of the source you want measurements for (supports exact name match only)",
            "in": "query",
            "name": "sourceName",
            "required": false,
            "type": "string"
        },
        "stateParam": {
            "description": "An opaque string that is round-tripped in the protocol; that is to say, it is returned as a URI parameter in the Basic flow, and in the URI",
            "in": "query",
            "name": "state",
            "required": false,
            "type": "string"
        },
        "studyClientIdParam": {
            "description": "Client id for the study you want",
            "in": "query",
            "name": "studyId",
            "required": false,
            "type": "string"
        },
        "synonymsParam": {
            "description": "Ex: McDonalds hotcake",
            "in": "query",
            "name": "synonyms",
            "required": false,
            "type": "string"
        },
        "taggedVariableIdParam": {
            "description": "Id of the tagged variable (i.e. Lollipop) you would like to get variables it can be tagged with (i.e. Sugar).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).",
            "in": "query",
            "name": "taggedVariableId",
            "required": false,
            "type": "integer"
        },
        "tagVariableIdParam": {
            "description": "Id of the tag variable (i.e. Sugar) you would like to get variables it can be tagged to (i.e. Lollipop).  Converted measurements of the tagged variable are included in analysis of the tag variable (i.e. ingredient).",
            "in": "query",
            "name": "tagVariableId",
            "required": false,
            "type": "integer"
        },
        "unitNameParam": {
            "description": "Ex: Milligrams",
            "enum": [
                "% Recommended Daily Allowance",
                "-4 to 4 Rating",
                "0 to 1 Rating",
                "0 to 5 Rating",
                "1 to 10 Rating",
                "1 to 5 Rating",
                "Applications",
                "Beats per Minute",
                "Calories",
                "Capsules",
                "Centimeters",
                "Count",
                "Degrees Celsius",
                "Degrees East",
                "Degrees Fahrenheit",
                "Degrees North",
                "Dollars",
                "Drops",
                "Event",
                "Feet",
                "Grams",
                "Hours",
                "Inches",
                "Index",
                "Kilocalories",
                "Kilograms",
                "Kilometers",
                "Liters",
                "Meters",
                "Micrograms",
                "Micrograms per decilitre",
                "Miles",
                "Milligrams",
                "Milliliters",
                "Millimeters",
                "Millimeters Merc",
                "Milliseconds",
                "Minutes",
                "Pascal",
                "Percent",
                "Pieces",
                "Pills",
                "Pounds",
                "Puffs",
                "Seconds",
                "Serving",
                "Sprays",
                "Tablets",
                "Torr",
                "Units",
                "Yes\/No",
                "per Minute",
                "Doses",
                "Quarts",
                "Ounces",
                "International Units",
                "Meters per Second"
            ],
            "in": "query",
            "name": "unitName",
            "required": false,
            "type": "string"
        },
        "updatedAtParam": {
            "description": "When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.",
            "in": "query",
            "name": "updatedAt",
            "required": false,
            "type": "string"
        },
        "userIdParam": {
            "description": "User's id",
            "in": "query",
            "name": "userId",
            "required": false,
            "type": "number"
        },
        "userVariablesParam": {
            "description": "Variable user settings data",
            "in": "body",
            "name": "userVariables",
            "required": true,
            "schema": {
                "items": {
                    "$ref": "#\/definitions\/Variable"
                },
                "type": "array"
            }
        },
        "valueParam": {
            "description": "Value of measurement",
            "in": "query",
            "name": "value",
            "required": false,
            "type": "string"
        },
        "variableCategoryIdParam": {
            "description": "Ex: 13",
            "in": "query",
            "name": "variableCategoryId",
            "required": false,
            "type": "integer"
        },
        "variableIdParam": {
            "description": "Ex: 13",
            "in": "query",
            "name": "variableId",
            "required": false,
            "type": "integer"
        },
        "variableCategoryNameParam": {
            "description": "Ex: Emotions, Treatments, Symptoms...",
            "enum": [
                "Activities",
                "Books",
                "Causes of Illness",
                "Cognitive Performance",
                "Conditions",
                "Emotions",
                "Environment",
                "Foods",
                "Location",
                "Miscellaneous",
                "Movies and TV",
                "Music",
                "Nutrients",
                "Payments",
                "Physical Activity",
                "Physique",
                "Sleep",
                "Social Interactions",
                "Software",
                "Symptoms",
                "Treatments",
                "Vital Signs",
                "Goals"
            ],
            "in": "query",
            "name": "variableCategoryName",
            "required": false,
            "type": "string"
        },
        "variableIdBodyParam": {
            "description": "Id of the variable whose measurements should be deleted",
            "in": "body",
            "name": "variableId",
            "required": true,
            "schema": {
                "$ref": "#\/definitions\/UserVariableDelete"
            }
        },
        "variableNameParam": {
            "description": "Name of the variable you want measurements for",
            "in": "query",
            "name": "variableName",
            "required": false,
            "type": "string"
        },
        "conciseParam": {
            "description": "Only return field required for variable auto-complete searches.  The smaller size allows for storing more variable results locally reducing API requests.",
            "in": "query",
            "name": "concise",
            "required": false,
            "type": "boolean"
        }
    },
    "paths": {
        "\/v3\/appSettings": {
            "get": {
                "description": "Get the settings for your application configurable at https:\/\/build.quantimo.do",
                "operationId": "getAppSettings",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientSecretParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/AppSettingsResponse"
                        }
                    },
                    "401": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/JsonErrorResponse"
                        }
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "summary": "Get client app settings",
                "tags": [
                    "AppSettings"
                ]
            }
        },
        "\/v2\/measurements\/exportRequest": {
            "post": {
                "description": "Use this endpoint to schedule a CSV export containing all user measurements to be emailed to the user within 24 hours.",
                "operationId": "measurementExportRequest",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "successful operation",
                        "schema": {
                            "type": "integer"
                        }
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Post Request for Measurements CSV",
                "tags": [
                    "measurements"
                ]
            }
        },
        "\/v3\/connect\/mobile": {
            "get": {
                "description": "This page is designed to be opened in a webview.  Instead of using popup authentication boxes, it uses redirection. You can include the user's access_token as a URL parameter like https:\/\/app.quantimo.do\/api\/v3\/connect\/mobile?access_token=123",
                "operationId": "getMobileConnectPage",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    }
                ],
                "produces": [
                    "text\/html"
                ],
                "responses": {
                    "200": {
                        "description": "Mobile connect page was returned"
                    },
                    "401": {
                        "description": "User token is missing"
                    },
                    "403": {
                        "description": "User token is incorrect"
                    }
                },
                "summary": "Mobile connect page",
                "tags": [
                    "connectors"
                ]
            }
        },
        "\/v3\/connectors\/list": {
            "get": {
                "description": "A connector pulls data from other data providers using their API or a screenscraper. Returns a list of all available connectors and information about them such as their id, name, whether the user has provided access, logo url, connection instructions, and the update history.",
                "operationId": "getConnectors",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/GetConnectorsResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "List of Connectors",
                "tags": [
                    "connectors"
                ]
            }
        },
        "\/v3\/connectors\/{connectorName}\/connect": {
            "get": {
                "description": "Attempt to obtain a token from the data provider, store it in the database. With this, the connector to continue to obtain new user data until the token is revoked.",
                "operationId": "connectConnector",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/connectorNamePathParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation"
                    },
                    "401": {
                        "description": "Not Authenticated"
                    },
                    "404": {
                        "description": "Method not found. Could not execute the requested method."
                    },
                    "500": {
                        "description": "Error during update. Unsupported response from update()."
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Obtain a token from 3rd party data source",
                "tags": [
                    "connectors"
                ]
            }
        },
        "\/v3\/connectors\/{connectorName}\/disconnect": {
            "get": {
                "description": "The disconnect method deletes any stored tokens or connection information from the connectors database.",
                "operationId": "disconnectConnector",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/connectorNamePathParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation"
                    },
                    "401": {
                        "description": "Not Authenticated"
                    },
                    "404": {
                        "description": "Method not found. Could not execute the requested method."
                    },
                    "500": {
                        "description": "Error during update. Unsupported response from update()."
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Delete stored connection info",
                "tags": [
                    "connectors"
                ]
            }
        },
        "\/v3\/connectors\/{connectorName}\/update": {
            "get": {
                "description": "The update method tells the QM Connector Framework to check with the data provider (such as Fitbit or MyFitnessPal) and retrieve any new measurements available.",
                "operationId": "updateConnector",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/connectorNamePathParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Connection Successful"
                    },
                    "401": {
                        "description": "Not Authenticated"
                    },
                    "404": {
                        "description": "Method not found. Could not execute the requested method."
                    },
                    "500": {
                        "description": "Error during update. Unsupported response from update()."
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Sync with data source",
                "tags": [
                    "connectors"
                ]
            }
        },
        "\/v3\/correlations": {
            "get": {
                "description": "Get a list of correlations that can be used to display top predictors of a given outcome like mood, for instance.",
                "operationId": "getCorrelations",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/causeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/causeVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/predictorVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/outcomeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/correlationCoefficientParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/outcomesOfInterestParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "description": "Return only public, anonymized and aggregated population data instead of user-specific variables",
                        "in": "query",
                        "name": "commonOnly",
                        "required": false,
                        "type": "boolean"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/GetCorrelationsResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get correlations",
                "tags": [
                    "analytics"
                ]
            }
        },
        "\/v3\/correlations\/explanations": {
            "get": {
                "description": "Get explanations of  correlations based on data from a single user.",
                "operationId": "getCorrelationExplanations",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/causeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/causeVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/predictorVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/outcomeVariableNameParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful Operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/Correlation"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get correlation explanations",
                "tags": [
                    "analytics"
                ]
            }
        },
        "\/v3\/deviceTokens": {
            "post": {
                "description": "Post user token for Android, iOS, or web push notifications",
                "operationId": "postDeviceToken",
                "parameters": [
                    {
                        "description": "The platform and token",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#\/definitions\/DeviceToken"
                        }
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation"
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "summary": "Post DeviceTokens",
                "tags": [
                    "notifications"
                ]
            }
        },
        "\/v3\/feed": {
            "get": {
                "description": "Tracking reminder notifications, messages, and study results",
                "operationId": "getFeed",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/FeedResponse"
                        }
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Tracking reminder notifications, messages, and study results",
                "tags": [
                    "feed"
                ]
            },
            "post": {
                "description": "Post user actions on feed cards",
                "operationId": "postFeed",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "description": "Id of the tracking reminder notification to be snoozed",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "description": "Array of cards to take action on",
                            "items": {
                                "$ref": "#\/definitions\/Card"
                            },
                            "type": "array"
                        }
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Returns new feed cards",
                        "schema": {
                            "$ref": "#\/definitions\/FeedResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Post user interactions with feed",
                "tags": [
                    "feed"
                ]
            }
        },
        "\/v3\/googleIdToken": {
            "post": {
                "description": "Post GoogleIdToken",
                "operationId": "postGoogleIdToken",
                "parameters": [],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation"
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "summary": "Post GoogleIdToken",
                "tags": [
                    "authentication"
                ]
            }
        },
        "\/v3\/integration.js": {
            "get": {
                "description": "Get embeddable connect javascript. Usage:\n  - Embedding in applications with popups for 3rd-party authentication\nwindows.\n    Use `qmSetupInPopup` function after connecting `connect.js`.\n  - Embedding in applications with popups for 3rd-party authentication\nwindows.\n    Requires a selector to block. It will be embedded in this block.\n    Use `qmSetupOnPage` function after connecting `connect.js`.\n  - Embedding in mobile applications without popups for 3rd-party\nauthentication.\n    Use `qmSetupOnMobile` function after connecting `connect.js`.\n    If using in a Cordova application call  `qmSetupOnIonic` function after connecting `connect.js`.",
                "operationId": "getIntegrationJs",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/x-javascript"
                ],
                "responses": {
                    "200": {
                        "description": "Embeddable connect javascript was returned"
                    }
                },
                "summary": "Get embeddable connect javascript",
                "tags": [
                    "connectors"
                ]
            }
        },
        "\/v3\/measurements": {
            "get": {
                "description": "Measurements are any value that can be recorded like daily steps, a mood rating, or apples eaten.",
                "operationId": "getMeasurements",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/variableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/variableCategoryNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/sourceNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/connectorNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/valueParam"
                    },
                    {
                        "$ref": "#\/parameters\/unitNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/earliestMeasurementTimeParam"
                    },
                    {
                        "$ref": "#\/parameters\/latestMeasurementTimeParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Measurement id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/groupingWidthParam"
                    },
                    {
                        "$ref": "#\/parameters\/groupingTimezoneParam"
                    },
                    {
                        "$ref": "#\/parameters\/doNotProcessParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/doNotConvertParam"
                    },
                    {
                        "$ref": "#\/parameters\/minMaxFilterParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/Measurement"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ],
                "summary": "Get measurements for this user",
                "tags": [
                    "measurements"
                ]
            }
        },
        "\/v3\/measurements\/delete": {
            "delete": {
                "description": "Delete a previously submitted measurement",
                "operationId": "deleteMeasurement",
                "parameters": [
                    {
                        "description": "The startTime and variableId of the measurement to be deleted.",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#\/definitions\/MeasurementDelete"
                        }
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "204": {
                        "description": "Successful Operation",
                        "schema": {
                            "$ref": "#\/definitions\/CommonResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "writemeasurements"
                        ]
                    }
                ],
                "summary": "Delete a measurement",
                "tags": [
                    "measurements"
                ]
            }
        },
        "\/v3\/measurements\/post": {
            "post": {
                "description": "You can submit or update multiple measurements in a \"measurements\" sub-array.  If the variable these measurements correspond to does not already exist in the database, it will be automatically added.",
                "operationId": "postMeasurements",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "description": "An array of measurement sets containing measurement items you want to insert.",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/MeasurementSet"
                            },
                            "type": "array"
                        }
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/PostMeasurementsResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "writemeasurements"
                        ]
                    }
                ],
                "summary": "Post a new set or update existing measurements to the database",
                "tags": [
                    "measurements"
                ]
            }
        },
        "\/v3\/measurements\/update": {
            "post": {
                "description": "Update a previously submitted measurement",
                "operationId": "updateMeasurement",
                "parameters": [
                    {
                        "description": "The id as well as the new startTime, note, and\/or value of the measurement to be updated",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#\/definitions\/MeasurementUpdate"
                        }
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful Operation",
                        "schema": {
                            "$ref": "#\/definitions\/CommonResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Update a measurement",
                "tags": [
                    "measurements"
                ]
            }
        },
        "\/v3\/notificationPreferences": {
            "get": {
                "description": "Get NotificationPreferences",
                "operationId": "getNotificationPreferences",
                "parameters": [],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation"
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "summary": "Get NotificationPreferences",
                "tags": [
                    "notifications"
                ]
            }
        },
        "\/v3\/oauth2\/authorize": {
            "get": {
                "description": "You can implement OAuth2 authentication to your application using our **OAuth2** endpoints.  You need to redirect users to `\/api\/v3\/oauth2\/authorize` endpoint to get an authorization code and include the parameters below.   This page will ask the user if they want to allow a client's application to submit or obtain data from their QM account. It will redirect the user to the url provided by the client application with the code as a query parameter or error in case of an error. See the \/api\/v1\/oauth\/access_token endpoint for the next steps.",
                "operationId": "getOauthAuthorizationCode",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientSecretParam"
                    },
                    {
                        "$ref": "#\/parameters\/responseTypeParam"
                    },
                    {
                        "$ref": "#\/parameters\/scopeParam"
                    },
                    {
                        "$ref": "#\/parameters\/redirectUriParam"
                    },
                    {
                        "$ref": "#\/parameters\/stateParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful Operation"
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Request Authorization Code",
                "tags": [
                    "authentication"
                ]
            }
        },
        "\/v3\/oauth2\/token": {
            "get": {
                "description": "Client provides authorization token obtained from \/api\/v3\/oauth2\/authorize to this endpoint and receives an access token. Access token can then be used to query API endpoints. ### Request Access Token After user approves your access to the given scope form the https:\/app.quantimo.do\/v1\/oauth2\/authorize endpoint, you'll receive an authorization code to request an access token. This time make a `POST` request to `\/api\/v1\/oauth\/access_token` with parameters including: * `grant_type` Can be `authorization_code` or `refresh_token` since we are getting the `access_token` for the first time we don't have a `refresh_token` so this must be `authorization_code`. * `code` Authorization code you received with the previous request. * `redirect_uri` Your application's redirect url. ### Refreshing Access Token Access tokens expire at some point, to continue using our api you need to refresh them with `refresh_token` you received along with the `access_token`. To do this make a `POST` request to `\/api\/v1\/oauth\/access_token` with correct parameters, which are: * `grant_type` This time grant type must be `refresh_token` since we have it. * `clientId` Your application's client id. * `client_secret` Your application's client secret. * `refresh_token` The refresh token you received with the `access_token`. Every request you make to this endpoint will give you a new refresh token and make the old one expired. So you can keep getting new access tokens with new refresh tokens. ### Using Access Token Currently we support 2 ways for this, you can't use both at the same time. * Adding access token to the request header as `Authorization: Bearer {access_token}` * Adding to the url as a query parameter `?access_token={access_token}` You can read more about OAuth2 from [here](http:\/\/oauth.net\/2\/)",
                "operationId": "getAccessToken",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientSecretParam"
                    },
                    {
                        "$ref": "#\/parameters\/grantTypeParam"
                    },
                    {
                        "$ref": "#\/parameters\/codeParam"
                    },
                    {
                        "$ref": "#\/parameters\/responseTypeParam"
                    },
                    {
                        "$ref": "#\/parameters\/scopeParam"
                    },
                    {
                        "$ref": "#\/parameters\/redirectUriParam"
                    },
                    {
                        "$ref": "#\/parameters\/stateParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful Operation"
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get a user access token",
                "tags": [
                    "authentication"
                ]
            }
        },
        "\/v3\/pairs": {
            "get": {
                "description": "Pairs cause measurements with effect measurements grouped over the duration of action after the onset delay.",
                "operationId": "getPairs",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/causeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/causeVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/predictorVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/outcomeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectUnitNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/causeUnitNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/onsetDelayParam"
                    },
                    {
                        "$ref": "#\/parameters\/durationOfActionParam"
                    },
                    {
                        "$ref": "#\/parameters\/earliestMeasurementTimeParam"
                    },
                    {
                        "$ref": "#\/parameters\/latestMeasurementTimeParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/sortParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/Pair"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get pairs of measurements for correlational analysis",
                "tags": [
                    "measurements"
                ]
            }
        },
        "\/v3\/shares": {
            "get": {
                "description": "This is a list of individuals, apps, or studies with access to your measurements.",
                "operationId": "getShares",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/appVersionParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    },
                    {
                        "$ref": "#\/parameters\/log"
                    },
                    {
                        "$ref": "#\/parameters\/pwd"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful Operation",
                        "schema": {
                            "$ref": "#\/definitions\/GetSharesResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "writemeasurements"
                        ]
                    }
                ],
                "summary": "Get Authorized Apps, Studies, and Individuals",
                "tags": [
                    "shares"
                ]
            }
        },
        "\/v3\/shares\/delete": {
            "post": {
                "description": "Remove access to user data for a given client_id associated with a given individual, app, or study",
                "operationId": "deleteShare",
                "parameters": [
                    {
                        "description": "Client id of the individual, study, or app that the user wishes to no longer have access to their data",
                        "in": "query",
                        "name": "clientIdToRevoke",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "description": "Ex: I hate you!",
                        "in": "query",
                        "name": "reason",
                        "required": false,
                        "type": "string"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "204": {
                        "description": "Successful Operation",
                        "schema": {
                            "$ref": "#\/definitions\/User"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "writemeasurements"
                        ]
                    }
                ],
                "summary": "Delete share",
                "tags": [
                    "shares"
                ]
            }
        },
        "\/v3\/shares\/invite": {
            "post": {
                "description": "Invite someone to view your measurements",
                "operationId": "inviteShare",
                "parameters": [
                    {
                        "description": "Details about person to share with",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#\/definitions\/ShareInvitationBody"
                        }
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "204": {
                        "description": "Successful Operation",
                        "schema": {
                            "$ref": "#\/definitions\/User"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "writemeasurements"
                        ]
                    }
                ],
                "summary": "Delete share",
                "tags": [
                    "shares"
                ]
            }
        },
        "\/v3\/studies": {
            "get": {
                "description": "If you have enough data, this will be a list of your personal studies, otherwise it will consist of aggregated population studies.",
                "operationId": "getStudies",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/causeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/causeVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/predictorVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/outcomeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/includeChartsParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    },
                    {
                        "$ref": "#\/parameters\/recalculate"
                    },
                    {
                        "$ref": "#\/parameters\/studyClientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/correlationCoefficientParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/outcomesOfInterestParam"
                    },
                    {
                        "$ref": "#\/parameters\/principalInvestigatorUserIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/openParam"
                    },
                    {
                        "$ref": "#\/parameters\/joinedParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdParam"
                    },
                    {
                        "$ref": "#\/parameters\/populationParam"
                    },
                    {
                        "$ref": "#\/parameters\/downVotedParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/GetStudiesResponse"
                        }
                    },
                    "401": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/JsonErrorResponse"
                        }
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get Personal or Population Studies",
                "tags": [
                    "studies"
                ]
            }
        },
        "\/v3\/studies\/open": {
            "get": {
                "description": "These are studies that anyone can join and share their data for the predictor and outcome variables of interest.",
                "operationId": "getOpenStudies",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/causeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/causeVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/predictorVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/outcomeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/includeChartsParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    },
                    {
                        "$ref": "#\/parameters\/recalculate"
                    },
                    {
                        "$ref": "#\/parameters\/studyClientIdParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/GetStudiesResponse"
                        }
                    },
                    "401": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/JsonErrorResponse"
                        }
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "These are open studies that anyone can join",
                "tags": [
                    "studies"
                ]
            }
        },
        "\/v3\/studies\/joined": {
            "get": {
                "description": "These are studies that you are currently sharing your data with.",
                "operationId": "getStudiesJoined",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/causeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/causeVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/predictorVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/outcomeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/correlationCoefficientParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/outcomesOfInterestParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/GetStudiesResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Studies You Have Joined",
                "tags": [
                    "studies"
                ]
            }
        },
        "\/v3\/studies\/created": {
            "get": {
                "description": "These are studies that you have created.",
                "operationId": "getStudiesCreated",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/causeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/causeVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/predictorVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/outcomeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/GetStudiesResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get studies you have created",
                "tags": [
                    "studies"
                ]
            }
        },
        "\/v3\/study\/publish": {
            "post": {
                "description": "Make a study and all related measurements publicly visible by anyone",
                "operationId": "publishStudy",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/causeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/causeVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/predictorVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/outcomeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/includeChartsParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    },
                    {
                        "$ref": "#\/parameters\/recalculate"
                    },
                    {
                        "$ref": "#\/parameters\/studyClientIdParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/PostStudyPublishResponse"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Publish Your Study",
                "tags": [
                    "studies"
                ]
            }
        },
        "\/v3\/study\/join": {
            "post": {
                "description": "Anonymously share measurements for specified variables",
                "operationId": "joinStudy",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/studyClientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/causeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/causeVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/predictorVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/outcomeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/StudyJoinResponse"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Join a Study",
                "tags": [
                    "studies"
                ]
            }
        },
        "\/v3\/study\/create": {
            "post": {
                "description": "Create an individual, group, or population study examining the relationship between a predictor and outcome variable. You will be given a study id which you can invite participants to join and share their measurements for the specified variables.",
                "operationId": "createStudy",
                "parameters": [
                    {
                        "description": "Details about the study you want to create",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#\/definitions\/StudyCreationBody"
                        }
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/PostStudyCreateResponse"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Create a Study",
                "tags": [
                    "studies"
                ]
            }
        },
        "\/v3\/trackingReminderNotifications": {
            "get": {
                "description": "Specific tracking reminder notification instances that still need to be tracked.",
                "operationId": "getTrackingReminderNotifications",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/variableCategoryNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/reminderTimeParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/onlyPastParam"
                    },
                    {
                        "$ref": "#\/parameters\/includeDeletedParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/GetTrackingReminderNotificationsResponse"
                        }
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get specific tracking reminder notifications",
                "tags": [
                    "reminders"
                ]
            },
            "post": {
                "description": "Snooze, skip, or track a tracking reminder notification",
                "operationId": "postTrackingReminderNotifications",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "description": "Id of the tracking reminder notification to be snoozed",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "description": "Array of TrackingReminderNotifications to take action on",
                            "items": {
                                "$ref": "#\/definitions\/TrackingReminderNotificationPost"
                            },
                            "type": "array"
                        }
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful Operation",
                        "schema": {
                            "$ref": "#\/definitions\/CommonResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Snooze, skip, or track a tracking reminder notification",
                "tags": [
                    "reminders"
                ]
            }
        },
        "\/v3\/trackingReminders": {
            "get": {
                "description": "Users can be reminded to track certain variables at a specified frequency with a default value.",
                "operationId": "getTrackingReminders",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/variableCategoryNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/appVersionParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/TrackingReminder"
                            },
                            "type": "array"
                        }
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get repeating tracking reminder settings",
                "tags": [
                    "reminders"
                ]
            },
            "post": {
                "description": "This is to enable users to create reminders to track a variable with a default value at a specified frequency",
                "operationId": "postTrackingReminders",
                "parameters": [
                    {
                        "description": "TrackingReminder that should be stored",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/TrackingReminder"
                            },
                            "type": "array"
                        }
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/PostTrackingRemindersResponse"
                        }
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Store a Tracking Reminder",
                "tags": [
                    "reminders"
                ]
            }
        },
        "\/v3\/trackingReminders\/delete": {
            "delete": {
                "description": "Stop getting notifications to record data for a variable.  Previously recorded measurements will be preserved.",
                "operationId": "deleteTrackingReminder",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "description": "Id of reminder to be deleted",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#\/definitions\/TrackingReminderDelete"
                        }
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "204": {
                        "description": "Successful Operation",
                        "schema": {
                            "$ref": "#\/definitions\/CommonResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Delete Tracking Reminder",
                "tags": [
                    "reminders"
                ]
            }
        },
        "\/v3\/unitCategories": {
            "get": {
                "description": "Get a list of the categories of measurement units such as 'Distance', 'Duration', 'Energy', 'Frequency', 'Miscellany', 'Pressure', 'Proportion', 'Rating', 'Temperature', 'Volume', and 'Weight'.",
                "operationId": "getUnitCategories",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/UnitCategory"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get unit categories",
                "tags": [
                    "units"
                ]
            }
        },
        "\/v3\/units": {
            "get": {
                "description": "Get a list of the available measurement units",
                "operationId": "getUnits",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "description": "Array of units",
                            "items": {
                                "$ref": "#\/definitions\/Unit"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get units",
                "tags": [
                    "units"
                ]
            }
        },
        "\/v3\/user": {
            "get": {
                "description": "Returns user info.  If no userId is specified, returns info for currently authenticated user",
                "operationId": "getUser",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/appVersionParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientUserIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    },
                    {
                        "$ref": "#\/parameters\/log"
                    },
                    {
                        "$ref": "#\/parameters\/pwd"
                    },
                    {
                        "$ref": "#\/parameters\/includeAuthorizedClientsParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/User"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get user info",
                "tags": [
                    "user"
                ]
            }
        },
        "\/v3\/users": {
            "get": {
                "description": "Returns users who have granted access to their data",
                "operationId": "getUsers",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/appVersionParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientUserIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    },
                    {
                        "$ref": "#\/parameters\/log"
                    },
                    {
                        "$ref": "#\/parameters\/pwd"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/UsersResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get users who shared data",
                "tags": [
                    "user"
                ]
            }
        },
        "\/v3\/user\/delete": {
            "delete": {
                "description": "Delete user account. Only the client app that created a user can delete that user.",
                "operationId": "deleteUser",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "description": "Ex: I hate you!",
                        "in": "query",
                        "name": "reason",
                        "required": true,
                        "type": "string"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "204": {
                        "description": "Successful Operation",
                        "schema": {
                            "$ref": "#\/definitions\/CommonResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "writemeasurements"
                        ]
                    }
                ],
                "summary": "Delete user",
                "tags": [
                    "user"
                ]
            }
        },
        "\/v3\/userSettings": {
            "post": {
                "description": "Post UserSettings",
                "operationId": "postUserSettings",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    },
                    {
                        "description": "User settings to update",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#\/definitions\/User"
                        }
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/PostUserSettingsResponse"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "summary": "Post UserSettings",
                "tags": [
                    "user"
                ]
            }
        },
        "\/v3\/userTags": {
            "post": {
                "description": "This endpoint allows users to tag foods with their ingredients.  This information will then be used to infer the user intake of the different ingredients by just entering the foods. The inferred intake levels will then be used to determine the effects of different nutrients on the user during analysis.",
                "operationId": "postUserTags",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "description": "Contains the new user tag data",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#\/definitions\/UserTag"
                        }
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful Operation",
                        "schema": {
                            "$ref": "#\/definitions\/CommonResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Post or update user tags or ingredients",
                "tags": [
                    "variables"
                ]
            }
        },
        "\/v3\/userTags\/delete": {
            "delete": {
                "description": "Delete previously created user tags or ingredients.",
                "operationId": "deleteUserTag",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/taggedVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/tagVariableIdParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "204": {
                        "description": "Successful Operation",
                        "schema": {
                            "$ref": "#\/definitions\/CommonResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Delete user tag or ingredient",
                "tags": [
                    "variables"
                ]
            }
        },
        "\/v3\/variables": {
            "get": {
                "description": "Get variables. If the user has specified variable settings, these are provided instead of the common variable defaults.",
                "operationId": "getVariables",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/includeChartsParam"
                    },
                    {
                        "$ref": "#\/parameters\/numberOfRawMeasurementsParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/variableCategoryNameParam"
                    },
                    {
                        "description": "Name of the variable. To get results matching a substring, add % as a wildcard as the first and\/or last character of a query string parameter. In order to get variables that contain `Mood`, the following query should be used: ?variableName=%Mood%",
                        "in": "query",
                        "name": "name",
                        "required": false,
                        "type": "string"
                    },
                    {
                        "$ref": "#\/parameters\/variableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/sourceNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/earliestMeasurementTimeParam"
                    },
                    {
                        "$ref": "#\/parameters\/latestMeasurementTimeParam"
                    },
                    {
                        "description": "Common variable id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/lastSourceParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/includePublicParam"
                    },
                    {
                        "$ref": "#\/parameters\/manualTrackingParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "description": "UPC or other barcode scan result",
                        "in": "query",
                        "name": "upc",
                        "required": false,
                        "type": "string"
                    },
                    {
                        "$ref": "#\/parameters\/effectOrCauseParam"
                    },
                    {
                        "$ref": "#\/parameters\/publicEffectOrCauseParam"
                    },
                    {
                        "$ref": "#\/parameters\/exactMatchParam"
                    },
                    {
                        "$ref": "#\/parameters\/variableCategoryIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/includePrivateParam"
                    },
                    {
                        "$ref": "#\/parameters\/searchPhraseParam"
                    },
                    {
                        "$ref": "#\/parameters\/synonymsParam"
                    },
                    {
                        "$ref": "#\/parameters\/taggedVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/tagVariableIdParam"
                    },
                    {
                        "description": "Id of the variable you would like to get variables that can be joined to.  This is used to merge duplicate variables.   If joinVariableId is specified, this returns only variables eligible to be joined to the variable specified by the joinVariableId.",
                        "in": "query",
                        "name": "joinVariableId",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "description": "Id of the parent category variable (i.e. Fruit) you would like to get eligible child sub-type variables (i.e. Apple) for.  Child variable measurements will be included in analysis of the parent variable.  For instance, a child sub-type of the parent category Fruit could be Apple.  When Apple is tagged with the parent category Fruit, Apple measurements will be included when Fruit is analyzed.",
                        "in": "query",
                        "name": "parentUserTagVariableId",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "description": "Id of the child sub-type variable (i.e. Apple) you would like to get eligible parent variables (i.e. Fruit) for.  Child variable measurements will be included in analysis of the parent variable.  For instance, a child sub-type of the parent category Fruit could be Apple. When Apple is tagged with the parent category Fruit, Apple measurements will be included when Fruit is analyzed.",
                        "in": "query",
                        "name": "childUserTagVariableId",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "description": "Id of the ingredient variable (i.e. Fructose)  you would like to get eligible ingredientOf variables (i.e. Apple) for.  IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredientOf of variable Fruit could be Apple.",
                        "in": "query",
                        "name": "ingredientUserTagVariableId",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "description": "Id of the ingredientOf variable (i.e. Apple) you would like to get eligible ingredient variables (i.e. Fructose) for.  IngredientOf variable measurements will be included in analysis of the ingredient variable.  For instance, a ingredientOf of variable Fruit could be Apple.",
                        "in": "query",
                        "name": "ingredientOfUserTagVariableId",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "description": "Return only public and aggregated common variable data instead of user-specific variables",
                        "in": "query",
                        "name": "commonOnly",
                        "required": false,
                        "type": "boolean"
                    },
                    {
                        "description": "Return only user-specific variables and data, excluding common aggregated variable data",
                        "in": "query",
                        "name": "userOnly",
                        "required": false,
                        "type": "boolean"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    },
                    {
                        "$ref": "#\/parameters\/includeTagsParam"
                    },
                    {
                        "$ref": "#\/parameters\/recalculate"
                    },
                    {
                        "$ref": "#\/parameters\/variableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/conciseParam"
                    },
                    {
                        "description": "Regenerate charts instead of getting from the cache",
                        "in": "query",
                        "name": "refresh",
                        "required": false,
                        "type": "boolean"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Variables returned",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/Variable"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get variables along with related user-specific analysis settings and statistics",
                "tags": [
                    "variables"
                ]
            },
            "post": {
                "description": "Users can change the parameters used in analysis of that variable such as the expected duration of action for a variable to have an effect, the estimated delay before the onset of action. In order to filter out erroneous data, they are able to set the maximum and minimum reasonable daily values for a variable.",
                "operationId": "postUserVariables",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/includePrivateParam"
                    },
                    {
                        "$ref": "#\/parameters\/userVariablesParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/includePublicParam"
                    },
                    {
                        "$ref": "#\/parameters\/searchPhraseParam"
                    },
                    {
                        "$ref": "#\/parameters\/exactMatchParam"
                    },
                    {
                        "$ref": "#\/parameters\/manualTrackingParam"
                    },
                    {
                        "$ref": "#\/parameters\/variableCategoryNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/variableCategoryIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/synonymsParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful Operation",
                        "schema": {
                            "$ref": "#\/definitions\/CommonResponse"
                        }
                    },
                    "400": {
                        "description": "The received JSON was invalid or malformed"
                    },
                    "401": {
                        "description": "Not Authenticated"
                    },
                    "404": {
                        "description": "Unknown target user ID"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Update User Settings for a Variable",
                "tags": [
                    "variables"
                ]
            }
        },
        "\/v3\/userVariables\/delete": {
            "delete": {
                "description": "Users can delete all of their measurements for a variable",
                "operationId": "deleteUserVariable",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/variableIdBodyParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "204": {
                        "description": "Successful operation"
                    },
                    "400": {
                        "description": "The received JSON was invalid or malformed"
                    },
                    "401": {
                        "description": "Not Authenticated"
                    },
                    "404": {
                        "description": "Unknown target user ID"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Delete All Measurements For Variable",
                "tags": [
                    "variables"
                ]
            }
        },
        "\/v3\/userVariables\/reset": {
            "post": {
                "description": "Reset user settings for a variable to defaults",
                "operationId": "resetUserVariableSettings",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/variableIdBodyParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation"
                    },
                    "400": {
                        "description": "The received JSON was invalid or malformed"
                    },
                    "401": {
                        "description": "Not Authenticated"
                    },
                    "404": {
                        "description": "Unknown target user ID"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Reset user settings for a variable to defaults",
                "tags": [
                    "variables"
                ]
            }
        },
        "\/v3\/variableCategories": {
            "get": {
                "description": "The variable categories include Activity, Causes of Illness, Cognitive Performance, Conditions, Environment, Foods, Location, Miscellaneous, Mood, Nutrition, Physical Activity, Physique, Sleep, Social Interactions, Symptoms, Treatments, Vital Signs, and Goals.",
                "operationId": "getVariableCategories",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/VariableCategory"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Variable categories",
                "tags": [
                    "variables"
                ]
            }
        },
        "\/v3\/votes": {
            "post": {
                "description": "I am really good at finding correlations and even compensating for various onset delays and durations of action. However, you are much better than me at knowing if there's a way that a given factor could plausibly influence an outcome. You can help me learn and get better at my predictions by pressing the thumbs down button for relationships that you think are coincidences and thumbs up once that make logic sense.",
                "operationId": "postVote",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "description": "Contains the cause variable, effect variable, and vote value.",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#\/definitions\/Vote"
                        }
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful Operation",
                        "schema": {
                            "$ref": "#\/definitions\/CommonResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Post or update vote",
                "tags": [
                    "studies"
                ]
            }
        },
        "\/v3\/votes\/delete": {
            "delete": {
                "description": "Delete previously posted vote",
                "operationId": "deleteVote",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "description": "The cause and effect variable names for the predictor vote to be deleted.",
                        "in": "body",
                        "name": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#\/definitions\/VoteDelete"
                        }
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "204": {
                        "description": "Successful Operation",
                        "schema": {
                            "$ref": "#\/definitions\/CommonResponse"
                        }
                    },
                    "401": {
                        "description": "Not Authenticated"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Delete vote",
                "tags": [
                    "studies"
                ]
            }
        },
        "\/v4\/study": {
            "get": {
                "description": "Get Study",
                "operationId": "getStudy",
                "parameters": [
                    {
                        "$ref": "#\/parameters\/causeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/causeVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/effectVariableIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/predictorVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/outcomeVariableNameParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/includeChartsParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    },
                    {
                        "$ref": "#\/parameters\/recalculate"
                    },
                    {
                        "$ref": "#\/parameters\/studyClientIdParam"
                    }
                ],
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/Study"
                        }
                    },
                    "401": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/JsonErrorResponse"
                        }
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "basic"
                        ]
                    }
                ],
                "summary": "Get Study",
                "tags": [
                    "studies"
                ]
            }
        },
        "\/v3\/activities": {
            "get": {
                "operationId": "getActivities",
                "tags": [
                    "Activities"
                ],
                "summary": "Get Activities",
                "description": "Get Activities",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/ActivitiesResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            },
            "post": {
                "operationId": "postActivities",
                "tags": [
                    "Activities"
                ],
                "summary": "Post Activities",
                "description": "Post Activities",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/ActivitiesResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            }
        },
        "\/v3\/friends": {
            "get": {
                "operationId": "getFriends",
                "tags": [
                    "Friends"
                ],
                "summary": "Get Friends",
                "description": "Get Friends",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/FriendsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            },
            "post": {
                "operationId": "postFriends",
                "tags": [
                    "Friends"
                ],
                "summary": "Post Friends",
                "description": "Post Friends",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/FriendsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            }
        },
        "\/v3\/groups": {
            "get": {
                "operationId": "getGroups",
                "tags": [
                    "Groups"
                ],
                "summary": "Get Groups",
                "description": "Get Groups",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/GroupsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            },
            "post": {
                "operationId": "postGroups",
                "tags": [
                    "Groups"
                ],
                "summary": "Post Groups",
                "description": "Post Groups",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/GroupsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            }
        },
        "\/v3\/groupsMembers": {
            "get": {
                "operationId": "getGroupsMembers",
                "tags": [
                    "Groups"
                ],
                "summary": "Get GroupsMembers",
                "description": "Get GroupsMembers",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/GroupsMembersResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            },
            "post": {
                "operationId": "postGroupsMembers",
                "tags": [
                    "Groups"
                ],
                "summary": "Post GroupsMembers",
                "description": "Post GroupsMembers",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/GroupsMembersResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            }
        },
        "\/v3\/messagesMessages": {
            "get": {
                "operationId": "getMessagesMessages",
                "tags": [
                    "Messages"
                ],
                "summary": "Get MessagesMessages",
                "description": "Get MessagesMessages",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/MessagesMessagesResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            },
            "post": {
                "operationId": "postMessagesMessages",
                "tags": [
                    "Messages"
                ],
                "summary": "Post MessagesMessages",
                "description": "Post MessagesMessages",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/MessagesMessagesResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            }
        },
        "\/v3\/messagesNotices": {
            "get": {
                "operationId": "getMessagesNotices",
                "tags": [
                    "Messages"
                ],
                "summary": "Get MessagesNotices",
                "description": "Get MessagesNotices",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/MessagesNoticesResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            },
            "post": {
                "operationId": "postMessagesNotices",
                "tags": [
                    "Messages"
                ],
                "summary": "Post MessagesNotices",
                "description": "Post MessagesNotices",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/MessagesNoticesResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            }
        },
        "\/v3\/messagesRecipients": {
            "get": {
                "operationId": "getMessagesRecipients",
                "tags": [
                    "Messages"
                ],
                "summary": "Get MessagesRecipients",
                "description": "Get MessagesRecipients",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/MessagesRecipientsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            },
            "post": {
                "operationId": "postMessagesRecipients",
                "tags": [
                    "Messages"
                ],
                "summary": "Post MessagesRecipients",
                "description": "Post MessagesRecipients",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/MessagesRecipientsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            }
        },
        "\/v3\/notifications": {
            "get": {
                "operationId": "getNotifications",
                "tags": [
                    "Notifications"
                ],
                "summary": "Get Notifications",
                "description": "Get Notifications",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/NotificationsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            },
            "post": {
                "operationId": "postNotifications",
                "tags": [
                    "Notifications"
                ],
                "summary": "Post Notifications",
                "description": "Post Notifications",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/NotificationsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            }
        },
        "\/v3\/userBlogs": {
            "get": {
                "operationId": "getUserBlogs",
                "tags": [
                    "User"
                ],
                "summary": "Get UserBlogs",
                "description": "Get UserBlogs",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/UserBlogsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            },
            "post": {
                "operationId": "postUserBlogs",
                "tags": [
                    "User"
                ],
                "summary": "Post UserBlogs",
                "description": "Post UserBlogs",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/UserBlogsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            }
        },
        "\/v3\/xprofileData": {
            "get": {
                "operationId": "getXprofileData",
                "tags": [
                    "Xprofile"
                ],
                "summary": "Get XprofileData",
                "description": "Get XprofileData",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/XprofileDataResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            },
            "post": {
                "operationId": "postXprofileData",
                "tags": [
                    "Xprofile"
                ],
                "summary": "Post XprofileData",
                "description": "Post XprofileData",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/XprofileDataResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            }
        },
        "\/v3\/xprofileFields": {
            "get": {
                "operationId": "getXprofileFields",
                "tags": [
                    "Xprofile"
                ],
                "summary": "Get XprofileFields",
                "description": "Get XprofileFields",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/XprofileFieldsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            },
            "post": {
                "operationId": "postXprofileFields",
                "tags": [
                    "Xprofile"
                ],
                "summary": "Post XprofileFields",
                "description": "Post XprofileFields",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/XprofileFieldsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            }
        },
        "\/v3\/xprofileGroups": {
            "get": {
                "operationId": "getXprofileGroups",
                "tags": [
                    "Xprofile"
                ],
                "summary": "Get XprofileGroups",
                "description": "Get XprofileGroups",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/XprofileGroupsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            },
            "post": {
                "operationId": "postXprofileGroups",
                "tags": [
                    "Xprofile"
                ],
                "summary": "Post XprofileGroups",
                "description": "Post XprofileGroups",
                "produces": [
                    "application\/json"
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "items": {
                                "$ref": "#\/definitions\/XprofileGroupsResponse"
                            },
                            "type": "array"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/sortParam"
                    },
                    {
                        "$ref": "#\/parameters\/limitParam"
                    },
                    {
                        "$ref": "#\/parameters\/offsetParam"
                    },
                    {
                        "$ref": "#\/parameters\/updatedAtParam"
                    },
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/createdAtParam"
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            }
        },
        "\/v2\/upload": {
            "get": {
                "operationId": "getUpload",
                "tags": [
                    "Upload"
                ],
                "summary": "Get whatever you uploaded",
                "description": "Get Upload",
                "produces": [
                    "multipart\/form-data"
                ],
                "responses": {
                    "200": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/GetUploadResponse"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                },
                "parameters": [
                    {
                        "$ref": "#\/parameters\/userIdParam"
                    },
                    {
                        "description": "format you want to receive the data in",
                        "in": "query",
                        "name": "format",
                        "required": false,
                        "type": "string",
                        "enum": [
                            "download",
                            "display"
                        ]
                    },
                    {
                        "description": "Id",
                        "in": "query",
                        "name": "id",
                        "required": false,
                        "type": "integer"
                    },
                    {
                        "$ref": "#\/parameters\/clientIdParam"
                    },
                    {
                        "$ref": "#\/parameters\/platform"
                    }
                ],
                "security": [
                    {
                        "access_token": []
                    },
                    {
                        "quantimodo_oauth2": [
                            "readmeasurements"
                        ]
                    }
                ]
            },
            "post": {
                "summary": "Uploads a file.",
                "consumes": [
                    "multipart\/form-data"
                ],
                "parameters": [
                    {
                        "in": "formData",
                        "name": "upfile",
                        "type": "file",
                        "description": "The file to upload."
                    }
                ],
                "responses": {
                    "201": {
                        "description": "Successful operation",
                        "schema": {
                            "$ref": "#\/definitions\/PostUploadResponse"
                        }
                    },
                    "401": {
                        "description": "Not authenticated"
                    },
                    "404": {
                        "description": "Not found"
                    },
                    "500": {
                        "description": "Internal server error"
                    }
                }
            }
        }
    },
    "produces": [
        "application\/json"
    ],
    "schemes": [
        "https"
    ],
    "securityDefinitions": {
        "access_token": {
            "in": "query",
            "name": "access_token",
            "type": "apiKey"
        },
        "client_id": {
            "in": "query",
            "name": "clientId",
            "type": "apiKey"
        },
        "quantimodo_oauth2": {
            "authorizationUrl": "https:\/\/app.quantimo.do\/api\/v1\/oauth\/authorize",
            "flow": "accessCode",
            "scopes": {
                "basic": "Allows you to read user info (display name, email, etc)",
                "readmeasurements": "Allows one to read a user's measurements",
                "writemeasurements": "Allows you to write user measurements"
            },
            "tokenUrl": "https:\/\/app.quantimo.do\/api\/v1\/oauth\/token",
            "type": "oauth2"
        }
    },
    "swagger": "2.0",
    "tags": [
        {
            "description": "Identify the strongest predictors of a given outcome and generate studies",
            "externalDocs": {
                "description": "Try it out",
                "url": "https:\/\/web.quantimo.do\/#\/app\/predictor-search"
            },
            "name": "analytics"
        },
        {
            "description": "Import data from third-party apps and devices like Fitbit and Mint.",
            "externalDocs": {
                "description": "Import your data now",
                "url": "https:\/\/web.quantimo.do\/#\/app\/import"
            },
            "name": "connectors"
        },
        {
            "description": "Measurements are any value that can be recorded like daily steps, a mood rating, or apples eaten.",
            "externalDocs": {
                "description": "See it in action",
                "url": "https:\/\/web.quantimo.do\/#\/app\/history-all-category\/Anything?accessToken=demo"
            },
            "name": "measurements"
        },
        {
            "description": "Users can be reminded to track certain variables at a specified frequency with a default value.",
            "externalDocs": {
                "description": "See it in action",
                "url": "https:\/\/web.quantimo.do\/#\/app\/reminders-inbox?accessToken=demo"
            },
            "name": "reminders"
        },
        {
            "description": "Available units for measurements",
            "externalDocs": {
                "description": "See it in action",
                "url": "https:\/\/web.quantimo.do\/#\/app\/measurement-search?accessToken=demo"
            },
            "name": "units"
        },
        {
            "description": "Get or update user info and settings",
            "externalDocs": {
                "description": "See it in action",
                "url": "https:\/\/web.quantimo.do\/#\/app\/settings?accessToken=demo"
            },
            "name": "user"
        },
        {
            "description": "Can be used for search auto-complete for data types like symptoms, foods and treatments and include statistics",
            "externalDocs": {
                "description": "Search for a variable",
                "url": "https:\/\/web.quantimo.do\/#\/app\/reminder-search?accessToken=demo"
            },
            "name": "variables"
        },
        {
            "description": "Automatically generated natural language studies examining the relationship between a predictor and outcome variable including charts.",
            "externalDocs": {
                "description": "Search for a study",
                "url": "https:\/\/web.quantimo.do\/#\/app\/studies"
            },
            "name": "studies"
        }
    ]
};