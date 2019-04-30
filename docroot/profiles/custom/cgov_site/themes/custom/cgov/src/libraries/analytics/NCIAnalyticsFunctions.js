
var NCIAnalytics = {


    /* ********************************************************************** */
    glossifiedTerm: function(sender, linkText, blogLink){
        var clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'glossifiedTerm');
        
        clickParams.Props = {
            45: "Glossified Term",
            50: linkText,
            67: "D=pageName"
        };
        
        if(blogLink) {
            clickParams.Props[66] = "Blog_" + s.prop44 + "_" + NCIAnalytics.blogLocation() + '_BodyGlossifiedTerm';
        }

        clickParams.Events = [56];
    
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    BlogRelatedLinksClick: function(sender, linkText, pageName, index){
        clickParams = new NCIAnalytics.ClickParams(sender, 'nciglobal', 'o', 'BlogRelatedLinkClick');
        var prop66_String = "";
        if(NCIAnalytics.blogLocation()){
            clickParams.Events = [57];
            prop66_String = "Blog_" + s.prop44 + "_" + NCIAnalytics.blogLocation() + "_RelatedResource:" + index;
        }
        else{
            clickParams.Events = [59];
            prop66_String = s.prop44 + "_RelatedResource:" + index;
        }
        clickParams.Props = {
            66: prop66_String,
            67: pageName,
            50: linkText
        };
        
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    BlogCardClick: function(sender, linkText, containerIndex, pageName) {
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'BlogFeatureCardClick');

        clickParams.Props = {
            66: "Blog_" + s.prop44 + "_" + NCIAnalytics.blogLocation() + "_BlogCard:" + containerIndex,
            67: pageName,
            50: linkText
        };

        clickParams.Events = [54];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    FeaturedPostsClick: function(sender, linkText, containerIndex, pageName) {
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'FeaturedPostsClick');

        clickParams.Props = {
            66: "Blog_" + s.prop44 + "_" + NCIAnalytics.blogLocation() + "_FeaturedPosts:" + containerIndex,
            67: pageName,
            50: linkText
        };

        clickParams.Events = [54];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    CategoryClick: function(sender, linkText, containerIndex, pageName) {
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'CategoryClick');

        clickParams.Props = {
            66: "Blog_" + s.prop44 + "_" + NCIAnalytics.blogLocation() + "_Category:" + containerIndex,
            67: pageName,
            50: linkText
        };

        clickParams.Events = [55];
        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    OlderNewerClick: function(sender, olderNewer, pageName) {
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'OlderNewerClick');

        clickParams.Props = {
            66: "Blog_" + s.prop44 + "_" + NCIAnalytics.blogLocation() + "_" + olderNewer,
            67: pageName
        };

        if (NCIAnalytics.blogLocation() == "Post") {
            clickParams.Events = [55];
        }

        clickParams.LogToOmniture();
    },
    /* ********************************************************************** */
    TableSortHeaderClick: function(sender, pageName) {
        clickParams = new NCIAnalytics.ClickParams(sender,
            'nciglobal', 'o', 'SortTableHeaderClick');

        clickParams.Props = {
            05: "table_sort",
            67: pageName
        }
        clickParams.LogToOmniture(); 
    },
    /* ********************************************************************** */
    ProfilePanelLinkClick: function(sender, linkText, pageName) {
        clickParams = new NCIAnalytics.ClickParams (sender,
            'nciglobal', 'o', 'ProfilePanelLinkClick'); 
        
        clickParams.Props = {
            66: "InstitutionCard_" + pageName + "_" + linkText,
            67: 'D=pageName'
        }
        clickParams.LogToOmniture();
    }
};


/* ********************************************************************** */
/* ********************************************************************** */
/* ********************************************************************** */
/* ********************************************************************** */
/* ********************************************************************** */

NCIAnalytics.blogLocation = function() {
    if (document.querySelector('body.cgvblogpost')) {
        return 'Post';
    } else if (document.querySelector('body.cgvblogseries')) {
        return 'Series';
    } else if (document.querySelector('body.cgvtopicpage')) {
        return 'Category';
    } else return '';
}

/**
 * defines page detail value, primary focus is pdq page sections as of initial logic
 * this logic should be part of the initial page load call (s.prop28)
 * @author Evolytics <nci@evolytics.com>
 * @since 2016-08-12
 */
NCIAnalytics.buildPageDetail = function() {
    var hash = document.location.hash,
        return_val = '';

    // find name of current pdq section
    hash = hash.replace(/#?(section|link)\//g, '');
    hash = hash.replace(/#/g, '');		
    if (hash) {
        selector = document.querySelector('#' + hash + ' h2');
        if(selector) {
            return_val = selector.textContent.toLowerCase();
        }
	}

    // add '/' as prefix, if return_val exists and '/' not already present
    if (return_val && return_val.indexOf('/') != 0) {
        return_val = '/' + return_val;
    }
    return (return_val);
};

/**
 * Start page load timer for use with custom link tracking
 */
NCIAnalytics.startPageLoadTimer = function () {
    window.pageLoadedAtTime = new Date().getTime();
}

/**
 * Start the pageLoadTimer if the DOM is loaded or document.readyState == complete
 */
if (document.readyState === "complete" ||
   (document.readyState !== "loading" && !document.documentElement.doScroll)) { 
    NCIAnalytics.startPageLoadTimer(); 
} else {
    document.addEventListener('DOMContentLoaded', NCIAnalytics.startPageLoadTimer);
}

/**
 * dynamic link tracking for http://www.cancer.gov/grants-training
 * tracks clicks on all links to an oga or cct page, including time from page load to link click
 * @author Evolytics <nci@evolytics.com>
 * @since 2016-08-12
 */
if (trimmedPathname === '/grants-training') {
    var grantsTrainingLinks = document.querySelectorAll("#content a[href*='grants-training']");
    var linksArray = [].slice.call(grantsTrainingLinks);

    // Add the 'click' event listener to each link containting 'grants-training'
    linksArray.forEach(function(element) {
        element.addEventListener('click', setTimeToClick)
    });

    // Set the "timetoclick" event (106) for specified grants-training links
    function setTimeToClick(e) {	
        var href = e.target.href;
        destinationSiteSection = '';

        // identify destination site section; used to determine whether or not to send a call
        if (oga_pattern.test(href)) {
            destinationSiteSection = 'oga';
        } else if (cct_pattern.test(href)) {
            destinationSiteSection = 'cct'
        }
		
        if (destinationSiteSection && window.pageLoadedAtTime) {
            var linkText = e.target.textContent.toLowerCase().substring(0, 89).trim();
            var linkClickedAtTime = new Date().getTime();    

            NCIAnalytics.GlobalLinkTrack({
                sender: this,
                label: (destinationSiteSection) ? destinationSiteSection + '_' + linkText : linkText,
                timeToClickLink: Math.round((linkClickedAtTime - window.pageLoadedAtTime) / 1000), // calculate time to click
                eventList: 'timetoclick' // specify success event (event106)
            });
        }
    };

}

/***********************************************************************************************************
/**
 * Creates or updates specified cookie
 * @param {string} pv_cookieName - name of cookie to create/update
 * @param {string} pv_cookieValue - value to store in cookie
 * @param {string=} pv_expireDays - optional number of days to store cookie (defaults to session expiration)
 * @example this.cookieWrite('my_cookie', 'example', '10');
 */
NCIAnalytics.cookieWrite = function(pv_cookieName, pv_cookieValue, pv_expireDays) {
    var exdate = (pv_expireDays) ? new Date() : '';
    if (exdate) {
        exdate.setDate(exdate.getDate() + pv_expireDays || 0);
        exdate = exdate.toUTCString();
    }

    var h = window.location.hostname;
    h = h.split('.');
    h = h.splice(h.length - 2, 2); //grab lst 2 positions of hostname (ie//"example.com")
    h = h.join('.');

    var aryCookieCrumbs = [];
    aryCookieCrumbs.push(pv_cookieName + '=' + encodeURI(pv_cookieValue));
    aryCookieCrumbs.push('path=/');
    aryCookieCrumbs.push('domain=' + h);
    if (exdate) {
        aryCookieCrumbs.push('expires=' + exdate);
    }
    document.cookie = aryCookieCrumbs.join(';');
}

/**
 * Retrieve cookie value
 * @param {string} c_name - name of cookie to retrieve
 * @return {string} cookie value
 * @example this.getCookie('cookie_name'); => {string} cookie value
 */
NCIAnalytics.cookieRead = function(c_name) {
    if (document.cookie.length > 0) {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            var c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return decodeURI(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

/**
 * calculate visible page percentages on page load and max percent of previous page viewed based on scroll depth
 * @author Evolytics <nci@evolytics.com>
 * @since 2016-09-30
 * @returns {object}
 * @param {object} payload
 * @param {Boolean} payload.updateOnly - Restricts functionality when updating data; Typically only used with onscroll
 * @param {Boolean} payload.reset - Simulates a true page load/broswer referesh on SPA pages
 * @param {string} payload.source - Identifies location where call to getScrollDetails occurred 
 * @param {string} payload.pageOverride - Override value for last element of TrackingString properties
 * @requires s
 */
NCIAnalytics.getScrollDetails = function(payload) {
    var previousPageScroll = NCIAnalytics.previousPageMaxVerticalTrackingString || '',
        pageSection = '';
		
    page = s.pageName + ((pageSection) ? '/' + pageSection : '');

    if (payload) {
        // only grab the previousPageScroll value from cookie if NOT a scroll update
        if (payload.updateOnly != true) {
            previousPageScroll = NCIAnalytics.cookieRead('nci_scroll');
            NCIAnalytics.cookieWrite('nci_scroll', ''); // assume we only want to use the value once
        }

        // manual reset for pages that update length without a page load/refresh (simulate a new page load)
        if (payload.reset === true) {
            NCIAnalytics.maxVerticalScroll = 0;
            NCIAnalytics.maxPageHeight = 0;
            NCIAnalytics.scrollDetails_orig = "";
        }

        // allows for special handling based on where the getScrollDetails() call originates
        if (payload.source) {
            // console.info('source: ' + payload.source);
        }

        // allow for override of page property
        if (payload.pageOverride) {
            page = payload.pageOverride;
        }
    }

    page = page.replace(/www\.cancer\.gov/i, '').replace(/\s/gi, '-').toLowerCase();

    var maxVerticalScroll = NCIAnalytics.maxVerticalScroll || 0,
        maxPageHeight = NCIAnalytics.maxPageHeight || 0,
        viewportHeight = window.innerHeight,
        verticalScrollDistance = window.pageYOffset,
        fullPageHeight = (function() {
            var body = document.body,
                html = document.documentElement;

            var height = Math.max(body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight
            );
            return (height);
        })();

    // calculate max scroll distance, always choosing larger of current scroll distance and max distance already recorded
    NCIAnalytics.maxVerticalScroll = (verticalScrollDistance > maxVerticalScroll) ? verticalScrollDistance : maxVerticalScroll;
    NCIAnalytics.maxPageHeight = (fullPageHeight > maxPageHeight) ? fullPageHeight : maxPageHeight;

    // calculate percentages and total pixels viewed
    var totalPageViewed = NCIAnalytics.maxVerticalScroll + viewportHeight;
    percentAboveFoldAtLoad = Math.round(100 * (viewportHeight / fullPageHeight)),
        percentOfTotalPageViewed = Math.round(100 * (totalPageViewed / NCIAnalytics.maxPageHeight));

    // create object for packaging up the data
    function updateScrollDetails(pv_scrollObject) {
        var retVal = pv_scrollObject || {};

        // measurements
        retVal.viewportHeight = viewportHeight; // px
        retVal.fullPageHeight = fullPageHeight; // px
        retVal.verticalScrollDistance = verticalScrollDistance; // px
        retVal.maxVerticalScroll = NCIAnalytics.maxVerticalScroll; // px
        retVal.maxPageHeight = NCIAnalytics.maxPageHeight; // px
        retVal.totalPageViewed = totalPageViewed; // px

        // capture percentAboveFoldAtLoad and generate tracking string
        retVal.percentAboveFoldAtLoad = (percentAboveFoldAtLoad === Infinity) ? 100 : percentAboveFoldAtLoad;
        // retVal.percentAboveFoldAtLoadTrackingString = retVal.percentAboveFoldAtLoad + 'pct|' +
        //     NCIAnalytics.maxPageHeight + 'px|' + page;

        retVal.percentOfTotalPageViewed = (percentOfTotalPageViewed === Infinity) ? 100 : percentOfTotalPageViewed;
        retVal.previousPageMaxVerticalTrackingString = previousPageScroll;

        return (retVal);
    }

    NCIAnalytics.scrollDetails = updateScrollDetails();

    // set cookie for capture on next page (or next non-updateOnly call to this function)
    NCIAnalytics.cookieWrite('nci_scroll', 
        NCIAnalytics.scrollDetails.percentOfTotalPageViewed + 'pct|' + 
        NCIAnalytics.scrollDetails.percentAboveFoldAtLoad + 'pct|' +
        NCIAnalytics.maxPageHeight + 'px|' + 
        page
    );

    // preserve values captured first time function is called (on page load)
    if (!NCIAnalytics.scrollDetails_orig || NCIAnalytics.scrollDetails_orig == "") {
        NCIAnalytics.scrollDetails_orig = updateScrollDetails();
    }

    // send analytics call
    if(payload && payload.sendCall === true) {
        var hash = document.location.hash || '';
        // If this is a PDQ page, track scroll pct as a click event 
        if(hash.match(/^(#link|#section)/) != null) {      
            NCIAnalytics.GlobalLinkTrack({
                // percentAboveFoldAtLoadTrackingString: NCIAnalytics.scrollDetails.percentAboveFoldAtLoadTrackingString,
                previousPageMaxVerticalTrackingString: NCIAnalytics.scrollDetails.previousPageMaxVerticalTrackingString
            })
        }
    }

    // console.table(NCIAnalytics.scrollDetails);
    return (NCIAnalytics.scrollDetails);
};

/**
 * builds page detail-like string, including pageName and hash value
 * for pdq content, checks for section name in html based on provided hash/section id
 * @param {object} payload
 * @param {string} payload.hash
 * @param {string} payload.page
 * @returns {string}
 */
function buildPageOverride(payload) {
    var retVal = '',
        section = '',
        hash = payload.hash,
        page = payload.page;

    retVal = page || '';

    // clean up the hash, if needed
    hash = hash.replace(/^\#?section\//i, '');

    // get the page detail (section name) string
    section = NCIAnalytics.buildPageDetail();
    section = (section) ? section : hash; // default to hash value if nothing returns from buildPageDetail()
    section = section.replace(/^\//, '');
    
    // stitch it all together
    retVal += (section) ? '/' + section : '';

    return(retVal);
}

/**
 * watches for any change in value for specified variables
 * @param {object} payload
 * @param {string} payload.name - name of variable being monitored; stored in window scope as window[payload.name]
 * @param payload.value
 * @param {function} payload.callback - action to complete if variable value changes
 */
function changeMonitor(payload) {
  var variableName = payload.name,
      variableValue = payload.value;
  
  if(window[variableName] != variableValue) {
    // console.info('window["' + variableName + '"] has changed from ' + window[variableName] + ' to "' + variableValue + '"');
    var fireCallback = true;

    if(variableName === 'hash' && variableValue.indexOf('#link/') > -1) { fireCallback = false; }

    if(fireCallback) {
        if(payload.callback) {
          payload.callback();
        }
    }
    window[variableName] = variableValue;                 
  }
}

/**
 * cross-browser eventListener logic
 * @author Evolytics <nci@evolytics.com>
 */
function attachEvents(payload) {
    var element = payload.element,
        event = payload.event,
        action = payload.action;

    if (element['addEventListener']) {
        element['addEventListener'](event, action);
    } else if (element['attachEvent']) {
        element['attachEvent']('on' + event, action);
    }
}

// trigger initial NCIAnalytics.getScrollDetails() call on window.load, but can be called inline, prior
// to calling adobe's s.t() method
attachEvents({
    element: window,
    event: 'load',
    action: function() {
        NCIAnalytics.getScrollDetails({
            source: 'window.load',
            //sendCall: true, 
            pageOverride: buildPageOverride({page: s.pageName, hash: document.location.hash})
        });
    }
});

// on scroll, start timer. once scroll stops, run specified function...
var timer;
attachEvents({
    element: window,
    event: 'scroll',
    action: function() {
        clearTimeout(timer);
        timer = setTimeout(function() {
            NCIAnalytics.getScrollDetails({
                updateOnly: true,
                source: 'window.scroll',
                pageOverride: buildPageOverride({page: s.pageName, hash: document.location.hash})
            })
        }, 150);
    }
});

/**
 * monitor for changes in document.location.hash
 */  
attachEvents({
    element: window,
    event: 'hashchange',
    action: function() {
        changeMonitor({
            name: 'hash',
            value: document.location.hash,
            callback: function() {
                setTimeout(function() {
                    NCIAnalytics.getScrollDetails({
                        source: 'hashMonitor', // optional; identifies where getScrollInfo call origniated
                        reset: true, // clears history, treating the dynamic content as a brand new page load
                        sendCall: true, // sends link tracking call with scroll data
                        pageOverride: buildPageOverride({
                            page: s.pageName,
                            hash: document.location.hash
                        })
                    });
                }, 100); // wait 100ms after change; allows for page resizing and content updates to complete
            }
        });
    }
});


/** 
 * determine if variable is null, undefined or blank ("") 
 * @param variable {string}
 * @author Evolytics <nci@evolytics.com>
 * @since 2017-04-28
 * @returns {Boolean}
 */
NCIAnalytics.isVarEmpty = function(variable) {
    if ((variable === null) || (typeof(variable) === "undefined" || (variable === ""))) {
        return true;
    } else {
        return false;
    }
}

/**
 * get any value from the query string
 * @param pv_queryParam {string} - accepts multiple comma-delimited param names; will return value of first param found
 * @param pv_url {string=} - if NOT provided, defaults to current page url/address;
 */
NCIAnalytics.getQueryString = function(pv_queryParam, pv_url) {
    var returnVal = '',
        fullSubString,
        splitSubString;
    
    fullSubString = (pv_url) ? pv_url.slice(pv_url.indexOf("?") + 1) : window.location.search.substring(1);

    subStringArray = fullSubString.split("&");
    queryParamArray = pv_queryParam.split(",");

    if(subStringArray.length > 0) {        
        for (var i = 0, maxi = subStringArray.length; i < maxi; i++) { // loop through params in query string
            paramValue = subStringArray[i].split("=");
            for (var ii = 0, maxii = queryParamArray.length; ii < maxii; ii++) { //loop through params in pv_queryParam
                if (paramValue[0].toLowerCase() == queryParamArray[ii].toLowerCase()) {
                    returnVal = (paramValue[1]) ? unescape(paramValue[1]) : "";
                    returnVal = returnVal.replace(/\+/g, " "); //replace "+" with " "
                    returnVal = returnVal.replace(/^\s+|\s+$/g, ""); //trim trailing and leading spaces from string
                    return returnVal;
                }
            }
        }
    }
    return(returnVal);
}

/**
 * build channel stack cookie for cross-visit participation
 * @param payload {object} 
 * @param payload.cookieName {string} - cookie name
 * @param payload.cookieValue {string} - value to add to cookie
 * @param payload.returnLength {number} - number of items to stack
 * @param payload.delimiter {string} - delimiter for stacked values
 * @param payload.expire {number} - number of days until cookie expires
 */
NCIAnalytics.crossVisitParticipation = function(payload) {
    var cookieValue = (payload.cookieValue) ? payload.cookieValue.replace("'", "") : "",
        cookieArray = (NCIAnalytics.cookieRead(payload.cookieName)) ? NCIAnalytics.cookieRead(payload.cookieName).split(",") : "",
        expireDate = payload.expire, //new Date(),
        returnValue;

    if (cookieValue) {
        if ((cookieArray == "none") || (NCIAnalytics.isVarEmpty(cookieArray))) { //does the cookie exist, with data?
            newCookieArray = [cookieValue]; //build the new array with payload.cookieValue
            NCIAnalytics.cookieWrite(payload.cookieName, newCookieArray, expireDate); //create the new cookie
            return (cookieValue); //return new string
        } else {
            var mostRecent = cookieArray[0];
            if (mostRecent != cookieValue) { //is the current payload.cookieValue same as last?
                cookieArray.unshift(cookieValue); //if not, add it
                if (cookieArray.length >= payload.returnLength) {
                    cookieArray.length = payload.returnLength
                }; //make sure array length matches payload.returnLength
                NCIAnalytics.cookieWrite(payload.cookieName, cookieArray, expireDate); //update the cookie with new values
            }
        }
    }
    returnValue = (cookieArray) ? cookieArray.reverse().join(payload.delimiter) : ''; //build the return string using payload.delimiter
    return (returnValue);
}


NCIAnalytics.urs = {
    config: {
        campaignPrefixDelimiter: '_',

        // referring url categories
        internalDomains: ['cancer.gov', 'nci.nih.gov', 'smokefree.gov'],
        searchEngines: [
            'alibaba.com', 'aol.', 'ask.com', 'baidu.com', 'bing.com', 'duckduckgo.com',
            'google.', 'msn.com', 'search.yahoo.', 'yandex.'
        ],
        socialNetworks: [
            'facebook.com', 'flickr.com', 'instagram.com', 'linkedin.com', 'pinterest.com', 'plus.google.com', 
            'reddit.com', 't.co', 'tumblr.com', 'twitter.com', 'yelp.com', 'youtube.com'
        ],
        govDomains: ['.gov'], // specific gov domains; change to '.gov' to include all gov domains
        eduDomains: ['.edu'], // specific edu domains; change to '.edu' to include all edu domains

        // cid/tracking code patterns for channel recogniation
        pattEmail: /^(e(b|m)_)|((eblast|email)\|)/i,
        pattPaidSocial: /^psoc_/i,
        pattSocial: /^((soc|tw|fb)_|(twitter|facebook)\||sf\d{8}$)/i,
        pattSem: /^(sem|ppc)_/i,
        pattAffiliate: /^aff_/i,
        pattPartner: /^ptnr_/i,
        pattDisplay: /^bn_/i,
        pattDr: /^dr_/i, // direct response
        pattInternal: /^int_/i,

        // channel stacking (cross visit participation)
        channelStackDepth: 5,
        channelStackDelimiter: '>',
        channelStackExpire: 180, // cookie expiration days
        channelStackCookie: 'nci_urs_stack' // name of channel stack cookie
    },

    /**
     * @description retieves list of # most recent marketing channel sources for visitor 
     * @param payload {object}
     * @param payload.channel {string}
     * @param payload.ursCookie {string}
     * @author Evolytics <nci@evolytics.com>
     * @since 2017-04-28
     * @returns {object}
     */
    getStacked: function(payload) {
        var ursCookie = payload.ursCookie,
            channel = payload.channel,
            returnValue = '';

        if (channel) {
            returnValue = NCIAnalytics.crossVisitParticipation({
                cookieName: ursCookie,
                cookieValue: channel,
                returnLength: this.config.channelStackDepth,
                delimiter: this.config.channelStackDelimiter,
                expire: this.config.channelStackExpire
            });
        }

        return (returnValue);
    },

    /**
     * returns the tracking code (channel) prefix for use with channel stacking
     * @author Evolytics <nci@evolytics.com>
     * @since 2017-04-28
     * @param campaign {string=} - tracking code (cid, utm_, etc.)
     * @param delimiter {string=} - character separating tracking code prefix from rest of string
     * @returns {string}
     */
    getPrefix: function(campaign, delimiter) {
        var returnValue = '';
        delimiter = delimiter || '_';
        if (campaign) {
            returnValue = campaign.split(delimiter)[0];
        }
        return (returnValue);
    },

    /**
     * @param refDomain {string} - referring domain (hostname)
     * @param referrer {string} - full referring url
     * @param searchEngines {array} - array of known search engines
     */
    getSeoStatus: function(refDomain, searchEngines, referrer) {
        var refDomain = refDomain,
            isSeo = false,
            isGoogle = (referrer.indexOf('.google.') > -1) ? true : false,
            isYahoo = (referrer.indexOf('search.yahoo.com') > -1) ? true : false,
            isYandex = (referrer.indexOf('.yandex.') > -1) ? true : false;

        if (isGoogle || isYahoo || isYandex) {
            isSeo = true;
        } else if (referrer && searchEngines.indexOf(refDomain) > -1) {
            isSeo = true;
        }

        return (isSeo);
    },

    /**
     * urs logic
     * @param payload {object}
     * @param payload.campaign {string=} - tracking code
     * @param payload.referrer {string=} - referring url
     * @author Evolytics <nci@evolytics.com>
     * @since 2017-04-28
     * @returns {object}
     * @example NCIAnalytics.urs.get({ campaign: 'ppc_sample_tracking_code', 'https://www.google.com/' });
     */
    get: function(payload) {
        var trafficType = '',
            ursValue = '',
            ursPrefix = '',
            seoKeyword = ppcKeyword = '',
            refDomain = refSubDomain = '',
            isInternalDomain = false,
            campaign = (payload.campaign) ? payload.campaign : '',
            referrer = (payload.referrer) ? payload.referrer : ((document.referrer) ? document.referrer : '');


        // extract referring domain from referrer; exclude subdomain/cname
        var refInfo = (function(referrer) {
            var info = {
                domain: '',
                subDomain: '',
                tld: ''
            };
            if (referrer) {
                info.domain = referrer.split('/')[2].split('.'); // get hostname from referring url
                info.subDomain = info.domain.join('.'); // full domain, including subdomain/cname
                info.domain = (info.domain.length > 2) ? info.domain.slice(1, info.domain.length) : info.domain;
                info.tld = info.domain[info.domain.length - 1];
                info.domain = info.domain.join('.'); // strip subdomain/cname from hostname
            }
            return (info);
        })(referrer);

        var tld = refInfo.tld,
            refDomain = refInfo.domain,
            refSubDomain = refInfo.subDomain;

        // determine marketing channel based on business rules and regex patterns set in this.urs.config
        if (!campaign && !referrer && !refDomain) {
            trafficType = 'direct-dnt';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattDisplay) > -1) {
            trafficType = 'display';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattAffiliate) > -1) {
            trafficType = 'affiliate';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattPartner) > -1) {
            trafficType = 'partner';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattDr) > -1) {
            trafficType = 'dr';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattEmail) > -1) {
            trafficType = 'email';
            ursValue = campaign;

            // account for non-compliant tracking code schema
            if (/^eblast\|/i.test(campaign)) {
                this.config.campaignPrefixDelimiter = '|';
            }
        } else if (campaign.search(this.config.pattSocial) > -1) {
            trafficType = 'social';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattPaidSocial) > -1) {
            trafficType = 'paid_social';
            ursValue = campaign;
        } else if (campaign.search(this.config.pattSem) > -1) {
            trafficType = 'paid_search';
            ursValue = campaign;

            // look for paid search keyword
            if (referrer) {
                ppcKeyword = NCIAnalytics.getQueryString('q,query,search', referrer);
            }
            ppcKeyword = (ppcKeyword) ? ppcKeyword : ('not provided|' + ((refDomain) ? refDomain : trafficType));

            // internal tracking code
        } else if (campaign.search(this.config.pattInternal) > -1) {
            trafficType = 'internal';
            ursValue = campaign;

            // unknown/unrecognized tracking code prefix
        } else if (campaign) { // catch campaigns with unexpected or unknown prefix
            trafficType = 'unknown';
            ursValue = campaign;

            // internal domains (do not track as referrer/channel)
        } else if (referrer && (this.config.internalDomains.indexOf(refDomain) > -1 || this.config.internalDomains.indexOf(refSubDomain) > -1)) {
            trafficType = 'internal-dnt';
            ursValue = '';

            // known social -- include before [seo] because of 'plus.google.com'
        } else if ((referrer && this.config.socialNetworks.indexOf(refDomain) > -1) || refSubDomain === 'plus.google.com') {
            trafficType = 'social';
            ursValue = '[soc]_' + refDomain;

            // known seo
        } else if (this.getSeoStatus(refDomain, this.config.searchEngines, referrer)) {
            trafficType = 'organic_search';
            ursValue = '[seo]_' + refDomain;

            // look for seo keyword
            seoKeyword = NCIAnalytics.getQueryString('q,query,search,text', referrer);
            seoKeyword = (seoKeyword) ? seoKeyword : ('not provided|' + ((refDomain) ? refDomain : trafficType));

            // known government domains
        } else if (referrer && tld === 'gov' && this.config.internalDomains.indexOf(refDomain) < 0) {
            trafficType = 'government_domains';
            ursValue = '[gov]_' + refDomain;

            // known education domains
        } else if (referrer && tld === 'edu') {
            trafficType = 'education_domains';
            ursValue = '[edu]_' + refDomain;

            // unknown referring domains
        } else if (referrer && this.config.govDomains.indexOf(refDomain) < 0) {
            trafficType = 'referring_domains';
            ursValue = '[ref]_' + refDomain;
        }

        ursPrefix = this.getPrefix(ursValue, this.config.campaignPrefixDelimiter);

        // if campaign has an unknown prefix (identified above), set trafficType to match ursPrefix
        if (trafficType === 'unknown') {
            trafficType = ursPrefix;
        }

        if (ursValue != '' && trafficType != 'organic_search') {
            seoKeyword = 'not organic search';
        }

        if (ursValue != '' && trafficType != 'paid_search') {
            ppcKeyword = 'not paid search';
        }

        // return urs information for use in analytics calls
        return ({
            campaign: campaign,
            referrer: referrer,
            refDomain: refDomain,
            value: ursValue,
            prefix: ursPrefix,
            stacked: this.getStacked({
                channel: ursPrefix,
                ursCookie: this.config.channelStackCookie
            }),
            trafficType: trafficType,
            seoKeyword: seoKeyword,
            ppcKeyword: ppcKeyword
        });
    }
}