// global
var oga_pattern = /grants\-training\/grants/gi,
    cct_pattern = /grants\-training\/training/gi,
    pdq_pattern = /pdq/gi,
    trimmedPathname = document.location.pathname.replace(/\/$/, '');

var NCIAnalytics = {

    displayAlerts: false,
    stringDelimiter: '|',
    fieldDelimiter: '~',

    /**
     * Determines site section based on page path; Returns empty string if no match is found; Used as c66 prefix
     * @author Evolytics <nci@evolytics.com>
     * @since 2016-08-08
     * @param {string=} pagePathOverride - Optional override to use in place of document.location.pathname
     * @returns {string}
     */
    siteSection: (function(pagePathOverride) {
        var path = pagePathOverride || document.location.pathname;

        if(oga_pattern.test(path)) { return('oga'); }
        if(cct_pattern.test(path)) { return('cct'); }
        if(pdq_pattern.test(path)) { return('pdq'); }

        return('');

    })(),

    SelectedOptionList: function(listId, delimiter) {
        // get all selected options under the given id
        var selected = document.getElementById(listId).selectedOptions;

        if (selected.length > 0) {
            var selArray = [].slice.call(selected);
            return (
                selArray.map(function(option) {
                    return option.textContent;  // return the text of each option
                })
                .join(delimiter));  // join array with delimiter
        }
        return '';
    },


    ClickParams: function(sender, reportSuites, linkType, linkName) {
        /*
         The facility for defining report suites by the parameter reportSuites
         has been discontinued - now report suites are defined in the s_account variable
         set in the Omniture s_code.js file.  The supporting code for the parameter method
         has been retained in case the requirements change.
         */
        this.sender = sender;
        this.ReportSuites = (s_account !== 'undefined') ? s_account : 'ncidevelopment'; // Formerly the reportSuites argument
        this.LinkType = linkType;
        this.LinkName = linkName;
        this.Props = {};
        this.Evars = {};
        this.Events = {};
        this.EventsWithIncrementors = {};

        this.LogToOmniture = function() {

            // Only fire off click events if the s_gi() function is found
            var local_s;
            if (typeof(s_gi) === 'function' && this.ReportSuites) {
                local_s = s_gi(this.ReportSuites);
            } else {
                return;
            }
            local_s.linkTrackVars = '';

            // add language prop8 - Warning: adding prop8 to individual onclick functions will cause duplication
            local_s['prop8'] = s.prop8;
            local_s.linkTrackVars += 'channel,';
            local_s.linkTrackVars += 'prop8';

            for (var i in this.Props) {
                local_s['prop' + i] = this.Props[i];

                if (local_s.linkTrackVars.length > 0)
                    local_s.linkTrackVars += ',';

                local_s.linkTrackVars += 'prop' + i;
            }

            // add link page prop (prop67) to all link tracking calls when not already present; existing values are given preference
            if(!this.Props[67]) {

                local_s['prop67'] = 'D=pageName';

                if (local_s.linkTrackVars.length > 0)
                  local_s.linkTrackVars += ',';
                
                local_s.linkTrackVars += 'prop67';
            }

            // add engagement score (event92) to all link tracking calls
            if(s.mainCGovIndex >= 0) {
                try {
                    var engagementScore = '';
                    var engagementObject = 'NCIEngagement';

                    // depends on engagement plugin
                    engagementScore = window[engagementObject].getAndResetEngagementCookie() || 0;

                    if (engagementScore && parseInt(engagementScore) > 0) {
                        // add the engagement event, but check to see if EventsWithIncrementors is an array before doing so
                        if (this.EventsWithIncrementors && this.EventsWithIncrementors.hasOwnProperty('push')) {
                            this.EventsWithIncrementors.push('92=' + engagementScore); // add to existing events
                        } else {
                            this.EventsWithIncrementors = ['92=' + engagementScore]; // it's the only event
                        }
                    }
                } catch (err) {
                    /** console.log(err); */
                }
            }
            
            // add link.href value (prop4) to all link tracking calls when not already present; existing values are given preference
            if(!this.Props[4]) {
                local_s['prop4'] = 'D=pev1';

                if (local_s.linkTrackVars.length > 0)
                  local_s.linkTrackVars += ',';
                
                local_s.linkTrackVars += 'prop4';
            }

            // add language eVar2 - Warning: adding eVar2 to individual onclick functions will cause duplication
            local_s['eVar2'] = s.eVar2;
            if (local_s.linkTrackVars.length > 0)
                local_s.linkTrackVars += ',';
            local_s.linkTrackVars += 'eVar2';

            for (var i in this.Evars) {
                local_s['eVar' + i] = this.Evars[i];

                if (local_s.linkTrackVars.length > 0)
                    local_s.linkTrackVars += ',';

                local_s.linkTrackVars += 'eVar' + i;
            }

            if (this.Events.length > 0) {
                var eventsString = '';
                if (local_s.linkTrackVars.length > 0)
                    local_s.linkTrackVars += ',';
                local_s.linkTrackVars += 'events';

                for (var i = 0; i < this.Events.length; i++) {
                    if (eventsString.length > 0)
                        eventsString += ',';

                    eventsString += 'event' + this.Events[i];
                }
                local_s.linkTrackEvents = eventsString;
                local_s.events = eventsString;
            }

            // provide support for events including values (event999=4) or serial ids (event999:abc123)
            if (this.EventsWithIncrementors.length > 0) {
                var eventNum = '',
                    eventsString = '',
                    cleanEventsString = '';
                if (local_s.linkTrackVars.length > 0 && local_s.linkTrackVars.indexOf('events') < 0)
                    local_s.linkTrackVars += ',';
                local_s.linkTrackVars += 'events';

                for (var i = 0; i < this.EventsWithIncrementors.length; i++) {
                    if (eventsString.length > 0)
                        eventsString += ',';

                    eventNum = 'event' + this.EventsWithIncrementors[i];
                    eventsString += eventNum;

                    cleanEventsString = eventNum.split(':');
                    cleanEventsString = cleanEventsString[0].split('=');
                    cleanEventsString = cleanEventsString[0];

                }
                local_s.linkTrackEvents = (local_s.linkTrackEvents) ? local_s.linkTrackEvents + ',' + cleanEventsString : cleanEventsString;
                local_s.events = (local_s.events) ? local_s.events + ',' + eventsString : eventsString;;
            }

            local_s.tl(sender, this.LinkType, this.LinkName);

            //Clear events and all props and eVars set in this click event image request
            local_s.events = '';
            for (var i in this.Props) {
                local_s['prop' + i] = '';
            }
            for (var i in this.Evars) {
                local_s['eVar' + i] = '';
            }

            if (NCIAnalytics.displayAlerts) {
                var alertString =
                    'ScriptBuilder:\n' +
                    'local_s.linkTrackVars=' + local_s.linkTrackVars;
                if (local_s.linkTrackEvents != 'None')
                    alertString += '\nlocal_s.linkTrackEvents=' + local_s.linkTrackEvents;

                if (local_s.linkTrackVars.length > 0) {
                    var linkTrackVarArray = local_s.linkTrackVars.split(',');
                    for (var i = 0; i < linkTrackVarArray.length; i++) {
                        if (linkTrackVarArray[i] != 'events') {
                            alertString += '\nlocal_s.' + linkTrackVarArray[i];
                            alertString += '=' + local_s[linkTrackVarArray[i]];
                        }
                    }
                }
                alertString += '\nReport Suites=' + this.ReportSuites;
                alertString += '\nLink Type=' + this.LinkType;
                alertString += '\nLink Name=' + this.LinkName;
                alert(alertString);
            }
        }
    },

    //*********************** onclick functions ************************************************************
    SiteWideSearch: function(sender) {
        var searchType = 'sitewide';
        var keyword = ' ';
        if (document.getElementById('swKeyword') && document.getElementById('swKeyword').value)
        {
            keyword = document.getElementById('swKeyword').value;
        }
        if (document.getElementById('swKeywordQuery') && document.getElementById('swKeywordQuery').value)
        {
            keyword = document.getElementById('swKeywordQuery').value;
        }
        if (s.prop8.toLowerCase() == 'spanish')
            searchType += '_spanish';

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'SiteWideSearch');
        clickParams.Props = {
            11: searchType,
            14: keyword
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1',
            14: keyword
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    PageNotFound: function(sender){
        var language = sender.dataset.language;
        var searchType = 'pagenotfoundsearch';
        var keyword = document.getElementById('nfKeyword').value;

        if (language === 'es'){
            searchType += '_spanish';
        }

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'PageNotFound');
        clickParams.Props = {
            11: searchType,
            14: keyword
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1',
            14: keyword
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    SiteWideSearchResultsSearch: function(sender, keyWordTextBoxID, searchRadioButtonsID) {
        var keyword = document.getElementById(keyWordTextBoxID).value;
        var e = document.getElementsByName(searchRadioButtonsID);

        for (var i = 0; i < e.length; i++) {
            if (e[i].checked) {
                if (e[i].value == 2) {
                    var searchType = 'sitewide_bottom_withinresults';
                    break;
                }
                else {
                    var searchType = 'sitewide_bottom_new';
                    break;
                }
            }
        }

        if (s.prop8.toLowerCase() == 'spanish')
            searchType += '_spanish';

        // the Omniture s_code file generates 'class does not support Automation' errors on the
        // dataSrc, dataFld, and dataFormatAs properties the 'SEARCH' Image button = therefore reference to
        // the control is being set to null instead of sender
        clickParams = new NCIAnalytics.ClickParams(this,
            'nciglobal', 'o', 'SiteWideSearchResultsSearch');
        clickParams.Props = {
            11: searchType,
            14: keyword
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1',
            14: keyword
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    SiteWideSearchResults: function(sender, isBestBet, resultIndex) {
        var searchModule = (isBestBet) ? 'best_bets' : 'generic';

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'SiteWideSearchResults');
        clickParams.Props = {
            12: searchModule,
            13: resultIndex
        };
        clickParams.Evars = {
            12: searchModule
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    CTSearchResults: function(sender, resultIndex) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal,nciclinicaltrials', 'o', 'CTSearchResults');
        clickParams.Props = {
            13: resultIndex
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    TermsDictionarySearch: function(sender, isSpanish) {
        var prop24Contents = (document.getElementById('radioStarts').checked) ? 'starts with' : 'contains';
        
        NCIAnalytics.TermsDictionarySearchCore(sender,
            document.getElementById('AutoComplete1').value,
            prop24Contents,
            'TermsDictionarySearch',
            isSpanish);
    },

    //******************************************************************************************************
    GeneticsDictionarySearch: function(sender, searchString, isStartsWith) {
        var prop24Contents = (isStartsWith) ? 'starts with' : 'contains';

        clickParams = new NCIAnalytics.ClickParams(sender,
            '', 'o', 'GeneticsDictionarySearch');
        clickParams.Props = {
            11: 'dictionary_genetics',
            22: searchString,
            24: prop24Contents
        };
        clickParams.Evars = {
            11: 'dictionary_genetics',
            13: '+1',
            26: prop24Contents
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //Created this function to be consistent with the Term Dictionary search.
    //Since, we are not sure if the doc sites are using this function; Dion recommend I leave
    //the original function GeneticsDictionarySearch alone.
    //******************************************************************************************************
    GeneticsDictionarySearchNew: function(sender) {
        var prop24Contents = (document.getElementById('radioStarts').checked) ? 'starts with' : 'contains';

        clickParams = new NCIAnalytics.ClickParams(sender,
            '', 'o', 'GeneticsDictionarySearch');
        clickParams.Props = {
            11: 'dictionary_genetics',
            22: document.getElementById('AutoComplete1').value,
            24: prop24Contents
        };
        clickParams.Evars = {
            11: 'dictionary_genetics',
            13: '+1',
            26: prop24Contents
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();

    },

    //******************************************************************************************************
    GeneticsDictionarySearchAlphaList: function(sender, value) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            '', 'o', 'GeneticsDictionarySearchAlphaList');
        clickParams.Props = {
            11: 'dictionary_genetics',
            22: value,
            24: 'starts with'
        };
        clickParams.Evars = {
            11: 'dictionary_genetics',
            13: '+1',
            26: 'starts with'
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    GeneticsDictionaryResults: function(sender, resultIndex) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            '', 'o', 'GeneticsDictionaryResults');
        clickParams.Props = {
            13: resultIndex
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    TermsDictionarySearchAlphaList: function(sender, value) {

        NCIAnalytics.TermsDictionarySearchCore(sender,
            value,
            'starts with',
            'TermsDictionarySearchAlphaList',
            false);
    },

    //******************************************************************************************************
    TermsDictionarySearchAlphaListSpanish: function(sender, value) {

        NCIAnalytics.TermsDictionarySearchCore(sender,
            value,
            'starts with',
            'TermsDictionarySearchAlphaList',
            true);
    },

    //******************************************************************************************************
    TermsDictionarySearchCore: function(sender, value, prop24Contents, linkName, isSpanish) {

        if (isSpanish)
            var searchType = 'diccionario';
        else
            var searchType = 'dictionary_terms';

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', linkName);
        clickParams.Props = {
            11: searchType,
            22: value,
            24: prop24Contents
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1',
            26: prop24Contents
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    TermsDictionaryResults: function(sender, resultIndex) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'TermsDictionaryResults');
        clickParams.Props = {
            13: resultIndex
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    DrugDictionarySearch: function(sender) {
        var prop24Contents = (document.getElementById('radioStarts').checked) ? 'starts with' : 'contains';

        NCIAnalytics.DrugDictionarySearchCore(sender,
            document.getElementById('AutoComplete1').value,
            prop24Contents,
            'DrugDictionarySearch');
    },

    //******************************************************************************************************
    DrugDictionarySearchAlphaList: function(sender, value) {

        NCIAnalytics.DrugDictionarySearchCore(sender,
            value,
            'starts with',
            'DrugDictionarySearchAlphaList');
    },

    //******************************************************************************************************
    DrugDictionarySearchCore: function(sender, value, prop24Contents, linkName) {
        var searchType = 'dictionary_drugs';

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal,ncidrugdictionary', 'o', linkName);
        clickParams.Props = {
            11: searchType,
            22: value,
            24: prop24Contents
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1',
            26: prop24Contents
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    DrugDictionaryResults: function(sender, resultIndex) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal,ncidrugdictionary', 'o', 'DrugDictionaryResults');
        clickParams.Props = {
            13: resultIndex
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    FeaturedClinicalTrialSearch: function(sender) {
        var searchType = 'clinicaltrials_featured';
        var keyword = document.getElementById('keyword').value;

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'FeaturedClinicalTrialSearch');
        clickParams.Props = {
            11: searchType,
            22: keyword
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1'
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    NewsSearch: function(sender, searchType) {
        var keyword = document.getElementById('keyword').value;
        var startDate = document.getElementById('startMonth').options[document.getElementById('startMonth').selectedIndex].text.replace(/^\s+|\s+$/g, '') + ' '
            + document.getElementById('startYear').value;
        var endDate = document.getElementById('endMonth').options[document.getElementById('endMonth').selectedIndex].text + ' '
            + document.getElementById('endYear').value;

        NCIAnalytics.KeywordDateRangeSearch(sender, searchType, keyword, startDate, endDate);
    },

    //******************************************************************************************************
    GeneticServicesDirectorySearch: function(sender) {
        var searchType = 'genetics';
        var typeOfCancer = '';
        var familyCancerSyndrome = '';
        var city = document.getElementById(ids.txtCity).value;
        var state = '';
        var country = '';
        var lastName = document.getElementById(ids.txtLastName).value;
        var searchCriteria = '';
        var specialty = '';
        var selected = '';
        var list;

        //get Type(s) of Cancer
        typeOfCancer = NCIAnalytics.SelectedOptionList(ids.selCancerType,
            NCIAnalytics.stringDelimiter);

        // get Family Cancer Syndrome
        familyCancerSyndrome = NCIAnalytics.SelectedOptionList(ids.selCancerFamily,
            NCIAnalytics.stringDelimiter);

        //get State(s)
        state = NCIAnalytics.SelectedOptionList(ids.selState,
            NCIAnalytics.stringDelimiter);

        //get Country(ies)
        country = NCIAnalytics.SelectedOptionList(ids.selCountry,
            NCIAnalytics.stringDelimiter);

        searchCriteria =
            [typeOfCancer, familyCancerSyndrome, city, state, country, lastName]
                .join(NCIAnalytics.fieldDelimiter);
        specialty = [typeOfCancer, familyCancerSyndrome].join(NCIAnalytics.fieldDelimiter);

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'GeneticServicesDirectorySearch');
        clickParams.Props = {
            11: searchType,
            22: searchCriteria,
            23: specialty
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1',
            25: specialty
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    KeywordDateRangeSearch: function(sender, searchType, keyword, startDate, endDate) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'KeywordDateRangeSearch');
        clickParams.Props = {
            11: searchType,
            22: keyword
        };
        clickParams.Evars = {
            11: searchType,
            23: startDate,
            24: endDate,
            13: '+1'
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    KeywordSearch: function(sender, searchType) {
        var keyword = document.getElementById('keyword').value;

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'KeywordSearch');
        clickParams.Props = {
            11: searchType,
            22: keyword
        };
        clickParams.Evars = {
            11: searchType,
            13: '+1'
        };
        clickParams.Events = [2];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    SearchResults: function(sender, resultIndex) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'SearchResults');
        clickParams.Props = {
            13: resultIndex
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    PDFLink: function(sender) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'd', 'PDFLink');
        clickParams.Evars = {
            30: '+1'
        };
        clickParams.Events = [6];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************

    DownloadKindleClick: function(sender) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'd', 'DownloadKindleClick');
        clickParams.Evars = {
            30: '+1'
        };
        clickParams.Events = [22];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************

    DownloadOtherEReaderClick: function(sender) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'd', 'DownloadOtherEReaderClick');
        clickParams.Evars = {
            30: '+1'
        };
        clickParams.Events = [23];
        clickParams.LogToOmniture();
    },


    //******************************************************************************************************
    eMailLink: function(sender) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'eMailLink');

        clickParams.Props = {
            43: 'Email',
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + 'email'
        };

        clickParams.Events = [17];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    HelpLink: function(sender) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'HelpLink');
        clickParams.Events = [5];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    PrintLink: function(sender) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'PrintLink');

        clickParams.Props = {
            43: 'Print',
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + 'print'
        };

        clickParams.Events = [17];
        clickParams.LogToOmniture();
    },
    //******************************************************************************************************
    CTSPrintResults_TopLinkClick: function(sender, linkVal, printID){
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'CTSPrintResults_TopLinkClick');

        clickParams.Props = {
            21: 'CTSPrintPage_' + linkVal,
            62: 'Clinical Trials: Print Results Page',
            67: s.pageName + '_' + printID
        };            
        
        clickParams.Evars = {
            62: 'Clinical Trials: Print Results Page',
        };
        if(linkVal == "Email" || linkVal == "Print Page"){
            clickParams.Events = [17];
        }
        clickParams.LogToOmniture();
    },
    //******************************************************************************************************
    CTSPrintResults_VewUpdatesLinkClick: function(sender, printID){
        clickParams = new NCIAnalytics.ClickParams(sender,'nciglobal', 'o', ' CTSPrintResults_VewUpdatesLinkClick');

        var link = sender.href;
        clickParams.Props = {
            21: 'CTSPrintPage_CheckUpdates_' + sender.attr('id'),
            62: 'Clinical Trials: Print Results Page',
            67: s.pageName + '_' + printID
        };
        
        clickParams.Evars = {
            62: 'Clinical Trials: Print Results Page'
        };

        clickParams.LogToOmniture();
    },
	//******************************************************************************************************
	// Original method for old basic form - kept to not break Analytics
    CTSResultsPrintSelectedClick: function(sender, location, hasSelectAll, totalChecked, checkedPages){
        NCIAnalytics.CTSResultsPrintSelectedWithFormClick(sender, location, hasSelectAll, totalChecked, checkedPages, "clinicaltrials_basic");
    },
	//******************************************************************************************************
    CTSResultsPrintSelectedWithFormClick: function(sender, location, hasSelectAll, totalChecked, checkedPages, formName){
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'CTSResultsPrintSelectedClick');
        clickParams.Events = [48];
        clickParams.Props = {
            21: 'CTSPrintSelected_' + location + '_' + hasSelectAll + '_' + totalChecked + '_' + checkedPages,
            67: 'D=pageName',
            74: formName + '|print selected'
        };
        clickParams.LogToOmniture();
    },
	//******************************************************************************************************
	// Original method for old basic form - kept to not break Analytics
    CTSResultsMaxSelectedClick: function(sender) { 
        NCIAnalytics.CTSResultsSelectedErrorClick(sender, "clinicaltrials_basic", "maxselectionreached"); 
    },
    //******************************************************************************************************
    // Replacing CTSResultsMaxSelectedClick 
    CTSResultsSelectedErrorClick: function(sender, formName, errorText) { 
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'CTSResultsSelectedErrorClick'); 
        clickParams.Events = [41]; 
        clickParams.Props = { 
            74: formName + '|error', 
            75: 'printselected|' + errorText
        }; 
        clickParams.LogToOmniture(); 
    },
	//******************************************************************************************************
	// Original method for old basic form - kept to not break Analytics
	CTStartOverClick: function(sender) { 
        NCIAnalytics.CTStartOverWithFormClick(sender, "clinicaltrials_basic", "start over"); 
    },
    //******************************************************************************************************
    CTStartOverWithFormClick: function(sender, formName, linkText) { 
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'CTStartOverClick'); 
        clickParams.Events = [49]; 
        clickParams.Props = { 
            67: 'D=pageName',
            74: formName + '|' + linkText
        }; 
        clickParams.LogToOmniture(); 
    },
    //******************************************************************************************************
    SendToPrinterLink: function(sender) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'SendToPrinterLink');
        clickParams.Events = [14];
        clickParams.LogToOmniture();
    },
    //******************************************************************************************************
    HeaderLink: function(sender, headerName) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'HeaderLink-' + headerName);
        clickParams.Props = {
            36: headerName
        };
        clickParams.Evars = {
            36: headerName
        };
        clickParams.Events = [16];
        clickParams.LogToOmniture();
    },
    //******************************************************************************************************
    FooterLink: function(sender, footerName) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'FooterLink-' + footerName);
        clickParams.Props = {
            36: footerName
        };
        clickParams.Evars = {
            36: footerName
        };
        clickParams.Events = [16];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    RightNavLink: function(sender, label) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'RightNavLink-');

        clickParams.Props = {
            27: sender.innerHTML, // Right Navigation Section Clicked c27
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + sender.innerHTML.toLowerCase()
        };
        clickParams.Evars = {
            49: sender.innerHTML // Right Navigation Section Clicked v49 | visit | recent
        };

        clickParams.Events = [8];
        clickParams.LogToOmniture();
    },
	
    //******************************************************************************************************
    BulletinSubscription: function(sender) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'BulletinSubscription');
        clickParams.Events = [9];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    GenericLinkTrack: function(sender, label) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'GenericLinkTrack');
        clickParams.Props = {
            4: sender.href,
            5: sender.innerHTML,
            28: label
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    LinkTracking: function(toLink, fromLink, label) {

        clickParams = new NCIAnalytics.ClickParams(this,
            'nciglobal', 'o', 'LinkTracking');
        clickParams.Props = {
            4: toLink,
            5: fromLink + NCIAnalytics.stringDelimiter + toLink
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    CustomLink: function(sender, linkName) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', linkName);
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    /**
     * Generic / global link tracking method
     * @param {object} payload
     * @param {object=} [payload.sender=true] - html element clicked, defaults to Boolean true
     * @param {string} payload.label - text of link clicked
     * @param {string} payload.eventList - used to specify adobe success events
     * @param {string} payload.timeToClickLink - time (in seconds) elapsed from page load to first link clicked
     * @example NCIAnalytics.GlobalLinkTrack({sender:this, label:this.textContent, siteSection: 'oga', eventList: 'ogapreaward'});
     */
    GlobalLinkTrack: function(payload) {
      var events = '', eventsWithIncrementors = '', // placeholder for success events, if needed
        sender = payload.sender || true, // default to Boolean true if no object passed
        label = payload.label || '',
        section = this.siteSection || '',
        hash = document.location.hash,
        isTrackable = true;
      
      if(payload.eventList) {
        switch(payload.eventList.toLowerCase()) {
          case 'ogapreaward':   events = [101]; break;
          case 'ogareceiving':  events = [102]; break;
          case 'ogacloseout':   events = [103]; break;
          case 'cctappdownload':events = [104]; break;
          case 'ccthowtoapply': events = [105]; break;
          case 'timetoclick':   eventsWithIncrementors = (payload.timeToClickLink) ? ['106=' + payload.timeToClickLink] : ''; break;
        }
      }

      var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'GlobalLinkTrack');
      var pageDetail = NCIAnalytics.buildPageDetail() || '';	  

      clickParams.Props = {
          28: s.pageName + pageDetail,      
          48: payload.previousPageMaxVerticalTrackingString || '',
      };
      if(!clickParams.Props[48]) { clickParams.Props[66] = (((section) ? section + '_' : '') + label.toLowerCase()); }

      clickParams.Events = events;
      clickParams.EventsWithIncrementors = eventsWithIncrementors;      
      clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    BookmarkShareClick: function(sender) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'BookmarkShareClick');

        var linkText = (sender.title) ? sender.title : sender[0].title;

        clickParams.Props = {
            43: sender.title,
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + 'social-share_' + linkText.toLowerCase()
        };

        clickParams.Events = [17];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    CustomTweetClick: function(sender, eventCode){
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', eventCode);
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    MegaMenuClick: function(sender, tree) {
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'MegaMenuClick');

        var pageName = sender.ownerDocument.location.hostname + sender.ownerDocument.location.pathname; // this is the URL
        if (typeof pageNameOverride !== 'undefined')
            localPageName = pageNameOverride;

        /*
         * tree.length == 1 : section/tab level
         * tree.length == 2 : subsection level
         * tree.length == 3 : link level
         */

        if (typeof tree[1] === 'undefined') {
            clickParams.Props = {
                53: tree[0].text,
                54: tree[0].text,
                55: tree[0].text,
                56: pageName
            };
            clickParams.Evars = {
                53: tree[0].text
            };
        }

        if (typeof tree[1] !== 'undefined') {
            // click was sub-section or link-level
            clickParams.Props = {
                53: tree[1].text,
                54: tree[0].text,
                55: tree[0].text,
                56: pageName
            };
            clickParams.Evars = {
                53: tree[1].text
            };
        }

        if (typeof tree[2] !== 'undefined') {
            // click was link-level
            clickParams.Props = {
                53: tree[2].text,
                54: tree[1].text,
                55: tree[0].text,
                56: pageName
            };
            clickParams.Evars = {
                53: tree[2].text
            };
        }

        clickParams.Events = [26];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    MegaMenuDesktopReveal: function(sender, menuText) {
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'MegaMenuDesktopReveal');

        clickParams.Events = [28];
        clickParams.Evars = {
            52: menuText,
            43: "Mega Menu"
        };
        clickParams.Props = {
            52: menuText
        };
        clickParams.LogToOmniture();
    },


    //******************************************************************************************************
    MegaMenuMobileReveal: function(sender) {
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'MegaMenuMobileReveal');

        clickParams.Events = [28];
        clickParams.Evars = {
            43: "Hamburger Menu"
        };
        clickParams.LogToOmniture();
    },


    //******************************************************************************************************
    MegaMenuMobileAccordionClick: function(sender, isExpanded, tree) {
        var state = isExpanded?"Expand":"Collapse";

        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'MegaMenuMobileAccordionClick');

        clickParams.Events = isExpanded?[34]:[35];
        clickParams.Props = {
            73: state + "|" + tree
        };
        clickParams.LogToOmniture();
    },


    //******************************************************************************************************
    MegaMenuMobileLinkClick: function(sender, url, linkText, linkUrl, heading, subHeading) {
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'MegaMenuMobileLinkClick');

        clickParams.Events = [26];
        clickParams.Evars = {
            53: heading
        };
        clickParams.Props = {
            53: heading,
            54: subHeading,
            55: linkText,
            56: url
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    LogoClick: function(sender) {
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'Logolick');

        var pageName = sender.ownerDocument.location.hostname + sender.ownerDocument.location.pathname; // this is the URL
        if (typeof pageNameOverride !== 'undefined')
            localPageName = pageNameOverride;

        clickParams.Props = {
            53: 'NCI Logo',
            56: pageName
        };

        clickParams.Evars = {
            53: 'NCI Logo'
        };

        clickParams.Events = [26];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    UtilityBarClick: function(sender, linkText) {
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'UtilityBarDictionaryClick');

        var pageName = sender.ownerDocument.location.hostname + sender.ownerDocument.location.pathname; // this is the URL
        if (typeof pageNameOverride !== 'undefined')
            localPageName = pageNameOverride;

        clickParams.Props = {
            36: linkText,
            53: linkText,
            56: pageName
        };

        clickParams.Evars = {
            36: linkText,
            53: linkText
        };

        clickParams.Events = [16];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    CardClick: function(sender, cardTitle, linkText, container, containerIndex) {
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'FeatureCardClick');

        var pageName = sender.ownerDocument.location.hostname + sender.ownerDocument.location.pathname; // this is the URL
        if (typeof pageNameOverride !== 'undefined')
            localPageName = pageNameOverride;

        var position = container + ":" + containerIndex;

        clickParams.Props = {
            57: cardTitle,
            58: linkText,
            59: position,
            60: pageName
        };

        clickParams.Events = [27];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    TimelyContentZoneTab: function(sender, tabTitle) {
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'TimelyContentZoneTab');
        clickParams.Props = {
            37: tabTitle
        };
        clickParams.Evars = {
            37: tabTitle
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    TimelyContentZoneLink: function(e, panelTitle) {
        var targ;
        if (!e) var e = window.event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;

        if (targ.nodeName == 'IMG')
            targ = targ.parentNode;

        if (targ.nodeName == 'EM')
            targ = targ.parentNode;

        if (targ.nodeName == 'A') {
            var linkText = "";
            var isTag = false;

            clickParams = new NCIAnalytics.ClickParams(this,
                'nciglobal', 'o', 'TimelyContentZoneLink');

            for (i = 0; i < targ.innerHTML.length; i++) {
                if (targ.innerHTML.charAt(i) == "<")
                    isTag = true;

                if (!isTag)
                    linkText = linkText + targ.innerHTML.charAt(i);

                if (targ.innerHTML.charAt(i) == ">")
                    isTag = false;

            }

            var prefixCheck = targ.innerHTML.toLowerCase();
            if (prefixCheck.search("video_icon.jpg") > -1)
                linkText = "Video: " + linkText;
            else if (prefixCheck.search("audio_icon.jpg") > -1)
                linkText = "Audio: " + linkText;

            clickParams.Props = {
                38: linkText,
                39: targ.href,
                40: panelTitle
            };
            clickParams.Evars = {
                38: linkText,
                39: targ.href,
                40: panelTitle
            };
            clickParams.LogToOmniture();
        }
    },

    //******************************************************************************************************
    QuestionsAboutCancerFooter: function(sender) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'QuestionsAboutCancerFooter');
        clickParams.Events = [5];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    QuestionsAboutCancerHeader: function(sender) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'QuestionsAboutCancerHeader');
        clickParams.Events = [18];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    FindCancerTypeBox: function(sender) {

        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'FindCancerTypeBox');
        clickParams.Events = [19];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    TileCarousel: function(sender, tileTitle, tileURL) {
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'TileCarousel');
        clickParams.Props = {
            41: tileTitle,
            42: tileURL
        };
        clickParams.Evars = {
            41: tileTitle,
            42: tileURL
        };
        clickParams.Events = [20];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    VideoCarouselClickSwipe: function(sender, value) {
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'VideoCarouselClickSwipe');

        clickParams.Props = {
            66: value,
            67: 'D=pageName'
        };

        clickParams.Events = [63];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    VideoCarouselComplete: function(sender, value) {
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'VideoCarouselComplete');

        clickParams.Props = {
            66: value,
            67: 'D=pageName'
        };

        clickParams.Events = [64];
        clickParams.LogToOmniture();
    },

    /* ********************************************************************** */
    ImageCarouselClickSwipe: function(sender, title, type, direction, imgNum, pageName) {
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'ImageCarouselClick');

        clickParams.Props = {
            66: "imgcar_" + title + "_" + type + "_" + direction + "_" + imgNum,
            67: pageName
        };

        clickParams.Events = [62];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    LinkTrackTagBuilder: function(e) {

        if (e.button == 0) {  // Left mouse button pressed
            var linkElement = NCIAnalytics.GetElement(NCIAnalytics.GetEventTarget(e), 'A');

            if (linkElement != null &&
                linkElement.href != null &&
                linkElement.href != '' &&
                (linkElement.onclick == null ||
                linkElement.onclick.toString().indexOf('NCIAnalytics') == -1)) {

                NCIAnalytics.LinkTracking(NCIAnalytics.DissectLink(linkElement.href), location.pathname);
            }
        }
    },

    //******************************************************************************************************
    DissectLink: function(theLink) {

        if (theLink.indexOf('clickpassthrough') != -1) {
            var theLinkBreakout = theLink.split('&');
            for (var i = 0; i < theLinkBreakout.length; i++) {
                if (theLinkBreakout[i].indexOf('redirectUrl') != -1) {
                    return unescape(theLinkBreakout[i].substring(12));
                    break;
                }
            }
        }
        else {
            var theLinkBreakout = theLink.split('//');
            if (theLinkBreakout.length > 1)
                return theLinkBreakout[1];
            else
                return theLink;
        }
    },

    //******************************************************************************************************
    GetElement: function(startingNode, elementType) {

        try {

            var currentNode = startingNode;

            while (currentNode != null && currentNode.tagName != 'BODY') {
                if (currentNode.tagName == elementType) {
                    return currentNode;
                    break;
                }
                else {
                    currentNode = currentNode.parentNode;
                }
            }
        } catch (err) { }

    },

    //******************************************************************************************************
    GetEventTarget: function(e) {
        var target = (e.target) ? e.target : e.srcElement;

        if (target != null) {
            if (target.nodeType == 3)
                target = target.parentNode;
        }
        return target;
    },

    //******************************************************************************************************
    Resize: function(sender, viewPort) {
        var width = 'ResizedTo' + viewPort;
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', width);
        clickParams.Evars = {
            5: viewPort
        };
        clickParams.Events = [7];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    OnThisPageClick: function(sender, linkText, pageName) {
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'OnThisPageClick');
        linkText = "OnThisPage_" + linkText;
        href = sender.getAttribute ? sender.getAttribute('href') : sender[0].getAttribute('href');
        clickParams.Props = {
            4: href,
            66: linkText,
            67: "D=pageName"
        };
        clickParams.Events = [29];

        // account for cct 'how to apply' success event
        if(linkText.search(/^OnThisPage_how\sto\sapply/gi) > -1) {
            clickParams.Events.push(105);
        }

        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    InThisSectionClick: function(sender, linkText, pageName) {
        clickParams = new NCIAnalytics.ClickParams (sender, 'nciglobal', 'o', 'InThisSectionClick'); 
        
        clickParams.Props = {
            66: "InThisSection_" + linkText,
            67: "D=pageName"
        };
        clickParams.Events = [69];

        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    PDQMobileClick: function(sender, linkText, isExpanded, pageName) {
        var state = isExpanded?"AccordionSectionExpand_":"AccordionSectionCollapse_";
        clickParams = new NCIAnalytics.ClickParams (sender, 'nciglobal', 'o', 'PDQMobileClick');
        
        clickParams.Events = isExpanded?[31]:[32];
        
        clickParams.Props = {
            66: state + linkText,
            67: "D=pageName"
        };
        
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    BackToTopReveal: function(sender, reveal) {
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'BackToTopReveal');

        clickParams.Events = [20];
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    BackToTopClick: function(sender, isUtilityBarVisible) {
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'BackToTopClick');

        clickParams.Events = [21];
        clickParams.Props = {
            50: isUtilityBarVisible?"UtilityBarShowing":"UtilityBarHidden"
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    SectionMenuButtonClick: function(sender, heading) {
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'SectionMenuButtonClick');

        clickParams.Events = [30];
        clickParams.Evars = {
            43: "Section Menu",
            45: heading
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    SectionAccordionClick: function(sender, url, isExpanded, heading, parent) {
        var state = isExpanded?"Expand":"Collapse";
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'SectionAccordionClick');

        clickParams.Events = isExpanded?[31]:[32];
        clickParams.Evars = {
            43: "Section Menu",
            45: heading
        };
        clickParams.Props = {
            68: state + "|" + parent,
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + state.toLowerCase() + "|" + parent.toLowerCase()
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    SectionLinkClick: function(sender, url, heading, linkText, depth) {
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'SectionLinkClick');

        clickParams.Events = [33];

        // account for cct 'how to apply' success event
        if(linkText.search(/^how\sto\sapply/gi) > -1) {
            clickParams.Events.push(105);
        }

        clickParams.Evars = {
            43: "Section Menu",
            45: heading
        };
        clickParams.Props = {
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + linkText.toLowerCase(),
            69: heading,
            70: linkText,
            71: depth,
            72: url
        };
        clickParams.LogToOmniture();
    },

    //******************************************************************************************************
    fontResizer: function(sender, fontSize, onload) {
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'fontResizer');

        if(!onload){
            clickParams.Events = [36];
        }
        clickParams.Props = {
            42: fontSize,
            66: ((NCIAnalytics.siteSection) ? NCIAnalytics.siteSection + '_' : '') + 'font-resize_' + ((fontSize) ? fontSize.toLowerCase() : '')
        };
        clickParams.LogToOmniture();
    },

    /******************************************************************************************************
    * General accordion click tracking
    * sender - the element responsible for this event.
    * accordionId - identifier for the whole accordion 
	* sectionId - identifier for the clicked accordion section
	* name - readable accordion section name
	* action - expand or collapse
	*/
    AccordionClick: function(sender, accordionId, sectionId, name, action) {
        clickParams = new NCIAnalytics.ClickParams(this, 'nciglobal', 'o', 'LinkTracking');

        var accordionInfo = accordionId;
        if(sectionId) accordionInfo += ('|' + sectionId);
        if(name) accordionInfo += ('|' + name);
        if(action) accordionInfo += ('|' + action);
        clickParams.Props = {
            41: accordionInfo
        };
        clickParams.LogToOmniture();
    },

    // Home Page Delighter Click
    // sender - the element responsible for this event.
    // type - the delighter type.
    // value - pageName
    HomePageDelighterClick: function(sender, type, value) {
        if( type === 'hp_find'){
            clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'HomePageFindDelighter');
            clickParams.Props = {
                5 : 'hp_find ct delighter|' + value,
				66 : 'delighter_findclinicaltrials'
            };
            clickParams.LogToOmniture();
        }
    },

	// Record that an item in the delighter rail was clicked.
	// sender - the element responsible for this event.
	// type - the delighter type.
	RecordDelighterRailClick: function(sender, type) {
		var pageName = s.pageName;
		if( type === 'livehelp'){
			clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'DelighterLiveChat');
			clickParams.Props = {
				5 : 'rrail_chat with us|' + pageName
			};
			clickParams.LogToOmniture();
		}
	},

	// Record that the proactive chat prompt was displayed.
	// sender - the element responsible for this event.
	RecordProactiveChatPromptDisplay: function(sender){
		var pageName = s.pageName;
		clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'ProactiveChat');
		clickParams.Props = {
			5 : 'livehelp_proactive chat - display|' + pageName
		};
		clickParams.Events = [45];
		clickParams.LogToOmniture();
	},

	// Record that the proactive "Chat Now" button was clicked.
	// sender - the element responsible for this event.
	RecordProactiveChatPromptClick: function(sender){
		var pageName = s.pageName;
		clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'ProactiveChat');
		clickParams.Props = {
			5 : 'livehelp_proactive chat - launch|' + pageName
		};
		clickParams.Events = [44];
		clickParams.LogToOmniture();
	},

	// Record that the proactive chat prompt was dismissed.
	// sender - the element responsible for this event.
	RecordProactiveChatPromptDismissal: function(sender){
		var pageName = s.pageName;
		clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'ProactiveChat');
		clickParams.Props = {
			5 : 'livehelp_proactive chat - dismiss|' + pageName
		};
		clickParams.Events = [43];
		clickParams.LogToOmniture();
	},
	
	/******************************************************************************************************
	* Track clicks on CTS feedback form
	* sender - the element responsible for this event.
	*/	
	FeedbackFormClick: function(sender, value){
		var pageName = s.pageName;
		clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'FeedbackForm');
		clickParams.Props = {
			5 : value + '|' + pageName
		};
		clickParams.LogToOmniture();
	},
	
    /******************************************************************************************************
	* Track link clicks on CTS pages
	* sender - the element responsible for this event.
	* type - info about which component is being tracked
	* value - pagename 
	*/
	SimpleCTSLink: function(sender, type, value) {
		clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'CTSLink');
		clickParams.Props = {
			5: type + '|' + value
		};
		clickParams.LogToOmniture();
	},

	/******************************************************************************************************
	* Original method for old basic form - kept to not break Analytics
	*/
	CTSResultsClick: function(sender, rank, custom) {
		var type = 'clinicaltrials_basic';
        if(custom) {
            type = 'clinicaltrials_custom';
        }
		NCIAnalytics.CTSResultsWithFormClick(sender, rank, type);
	},
    /******************************************************************************************************
	* Track search result click on CTS Results page
	* sender - the element responsible for this event
	* rank - the position of the selected item on a given page
	*/
	CTSResultsWithFormClick: function(sender, rank, formName) {
		clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'CTSLink');
		clickParams.Events = [42];
		clickParams.Props = {
			12: formName,
			13: rank
		};
		clickParams.Evars = {
			12: formName
		};
		clickParams.LogToOmniture();
    },
    

    SPLF_Lang: function() {
        //alert('Lang');
    },
    //******************************************************************************************************
    VideoSplashImageClick: function(sender, video, pageName) {
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'OnThisPageClick');

        clickParams.Props = {
            66: "VideoStart_" + video,
            67: pageName
        };
        clickParams.Events = [51];
        clickParams.LogToOmniture();
    },
    //******************************************************************************************************
    BRPiconClick: function(sender, file, pageName) {
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'OnThisPageClick');

        clickParams.Props = {
            66: "FileDownload_" + file,
            67: pageName
        };
        clickParams.Events = [52];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    BlogArchiveLinkClick: function(sender, pageName){
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'BlogArchiveDateClick');

        urlParam = function(name){
            var results = new RegExp("[\?&].*\[" + name + "\]=([^&#]*)").exec(sender.href);
            if (results==null){
                return "";
            }
            else{
                return results[1] || 0;
            }
        }
        
        var year = urlParam('[year]');
        var month = urlParam('[month]');
        clickParams.Props = {
            66: "Blog_" + s.prop44 + "_" + NCIAnalytics.blogLocation() + "_Archive",
            67: pageName,
            50: year + (month ? (":" + month) : "")
        };
        clickParams.Events = [55];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    BlogSubscribeClick: function(sender, pageName){
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'BlogSubscribeClick');

        clickParams.Props = {
            66: "Blog_" + s.prop44 + "_" + NCIAnalytics.blogLocation() + "_Subscribe",
            67: pageName
        };

        clickParams.Events = [58];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    BlogArchiveAccordionClick: function(sender, pageName, collapse){
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'BlogAccordionAction');
        var expandCollapse = "";
        if(collapse){
            expandCollapse = "_Collapse:Archive";
        }
        else{
            expandCollapse = "_Expand:Archive";
        }
        
        clickParams.Props = {
            66: "Blog_" + s.prop44 + "_" + NCIAnalytics.blogLocation() + expandCollapse,
            67: pageName
        };
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    BlogBodyLinkClick: function(sender, linkText, pageName){
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'BlogBodyLinkClick');
        
        var linkType = "_BodyLink";
        clickParams.Props = {
            50: linkText,
            66: "Blog_" + s.prop44 + "_" + NCIAnalytics.blogLocation() + linkType,
            67: pageName
        };

        clickParams.Events = [56];

        clickParams.LogToOmniture();
    },

};

export { NCIAnalytics };
