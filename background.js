chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
        let headers = details.requestHeaders;
        for (let i = 0; i < headers.length; i++) {
            if (headers[i].name.toLowerCase() === 'user-agent') {
                headers[i].value = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
                break;
            }
        }
        return { requestHeaders: headers };
    },
    { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]
);

chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        return { cancel: details.url.indexOf("paywall") !== -1 };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
'use strict';
var ext_api = (typeof browser === 'object') ? browser : chrome;
var url_loc = (typeof browser === 'object') ? 'firefox' : 'chrome';
var manifestData = ext_api.runtime.getManifest();
var ext_name = manifestData.name;
var ext_version = manifestData.version;
var ext_manifest_version = manifestData.manifest_version;
var navigator_ua = navigator.userAgent;
var navigator_ua_mobile = navigator_ua.toLowerCase().includes('mobile');
var kiwi_browser = navigator_ua_mobile && (url_loc === 'chrome') && !navigator_ua.toLowerCase().includes('yabrowser') && (navigator_ua.includes('Chrome/') && navigator_ua.match(/Chrome\/(\d+)/)[1] < 116);

if (ext_manifest_version === 3)
    self.importScripts('sites.js');

if (typeof ext_api.action !== 'object') {
    ext_api.action = ext_api.browserAction;
}

var dompurify_sites = [];
var optin_setcookie = false;
var optin_update = true;
var blocked_referer = false;
var domain;

// defaultSites are loaded from sites.js at installation extension

var restrictions = {
    'autohebdo.fr': /\/www\.autohebdo\.fr\//,
    'bloomberg.com': /^((?!\.bloomberg\.com\/news\/terminal\/).)*$/,
    'bloombergadria.com': /^((?!\.bloombergadria\.com\/video\/).)*$/,
    'dailywire.com': /^((?!\.dailywire\.com\/(episode|show|videos|watch)).)*$/,
    'economictimes.com': /\.economictimes\.com($|\/($|(__assets|prime)(\/.+)?|.+\.cms))/,
    'espn.com': /^((?!espn\.com\/watch).)*$/,
    'esquire.com': /^((?!\/classic\.esquire\.com\/).)*$/,
    'expresso.pt': /^((?!\/tribuna\.expresso\.pt\/).)*$/,
    'foreignaffairs.com': /^((?!\/reader\.foreignaffairs\.com\/).)*$/,
    'ft.com': /^((?!\/cn\.ft\.com\/).)*$/,
    'hilltimes.com': /^((?!\.hilltimes\.com\/slideshow\/).)*$/,
    'hindustantimes.com': /^((?!\/epaper\.hindustantimes\.com\/).)*$/,
    'ilsole24ore.com': /^((?!\/ntplus.+\.ilsole24ore\.com\/).)*$/,
    'lasegunda.com': /^((?!\/www\.lasegunda\.com\/).)*$/,
    'livemint.com': /^((?!\/epaper\.livemint\.com\/).)*$/,
    'lopinion.fr': /^((?!\.lopinion\.fr\/lejournal).)*$/,
    'mid-day.com': /^((?!\/epaper\.mid-day\.com\/).)*$/,
    'nytimes.com': /^((?!\/(help|myaccount|timesmachine)\.nytimes\.com\/).)*$/,
    'nzz.ch': /^((?!\/epaper\.nzz\.ch\/).)*$/,
    'quora.com': /^((?!quora\.com\/search\?q=).)*$/,
    'science.org': /^((?!\.science\.org\/doi\/).)*$/,
    'statista.com': /^((?!\.statista\.com\/study\/).)*$/,
    'study.com': /\/study\.com\/.+\/lesson\//,
    'tagesspiegel.de': /^((?!\/(background|checkpoint)\.tagesspiegel\.de\/).)*$/,
    'techinasia.com': /\.techinasia\.com\/.+/,
    'thehindu.com': /^((?!epaper\.thehindu\.com).)*$/,
    'thehindubusinessline.com': /^((?!epaper\.thehindubusinessline\.com).)*$/,
    'thetimes.com': /^((?!epaper\.thetimes\.com).)*$/,
    'uol.com.br': /^((?!(conta|email|piaui\.folha)\.uol\.com\.br).)*$/,
}

for (let domain of au_news_corp_domains)
    restrictions[domain] = new RegExp('^((?!todayspaper\\.' + domain.replace(/\./g, '\\.') + '\\/).)*$');
for (let domain of ch_media_domains)
    restrictions[domain] = new RegExp('^((?!epaper\\.' + domain.replace(/\./g, '\\.') + '\\/).)*$');

if (typeof browser !== 'object') {
    for (let domain of [])
        restrictions[domain] = new RegExp('((\\/|\\.)' + domain.replace(/\./g, '\\.') + '\\/$|' + restrictions[domain].toString().replace(/(^\/|\/$)/g, '') + ')');
}

// Don't remove cookies before/after page load
var allow_cookies = [];
var remove_cookies = [];
// select specific cookie(s) to hold/drop from remove_cookies domains
var remove_cookies_select_hold, remove_cookies_select_drop;

// Set User-Agent
var use_google_bot, use_bing_bot, use_facebook_bot, use_useragent_custom, use_useragent_custom_obj;
// Set Referer
var use_facebook_referer, use_google_referer, use_twitter_referer, use_referer_custom, use_referer_custom_obj;
// Set random IP-address
var random_ip = {};
var use_random_ip = [];
// concat all sites with change of headers (useragent, referer or random ip)
var change_headers;

// block paywall-scripts
var blockedRegexes = {};
var blockedRegexesDomains = [];
var blockedRegexesGeneral = {};
var blockedJsInline = {};
var blockedJsInlineDomains = [];

// unhide text on amp-page
var amp_unhide;
// redirect to amp-page
var amp_redirect;
// block contentScript
var cs_block;
// clear localStorage in contentScript
var cs_clear_lclstrg;
// code for contentScript
var cs_code;
// load text from json (script[type="application/ld+json"])
var ld_json;
// load text from json (script#__NEXT_DATA__)
var ld_json_next;
// load text from json (script source)
var ld_json_source;
// load text from json (link[rel="alternate"][type="application/json"][href])
var ld_json_url;
// load text from archive.is
var ld_archive_is;
// load text from Google webcache
var ld_google_webcache;
// add external link to article
var add_ext_link;

// custom: block javascript
var block_js_custom = [];
var block_js_custom_ext = [];

// manifest v3
var gpw_domains;
var rule_excluded_base_domains;

function initSetRules() {
    allow_cookies = [];
    remove_cookies = [];
    remove_cookies_select_drop = {};
    remove_cookies_select_hold = {};
    use_google_bot = [];
    use_bing_bot = [];
    use_facebook_bot = [];
    use_useragent_custom = [];
    use_useragent_custom_obj = {};
    use_facebook_referer = [];
    use_google_referer = [];
    use_twitter_referer = [];
    use_referer_custom = [];
    use_referer_custom_obj = {};
    random_ip = {};
    change_headers = [];
    amp_unhide = [];
    amp_redirect = {};
    cs_block = {};
    cs_clear_lclstrg = [];
    cs_code = {};
    ld_json = {};
    ld_json_next = {};
    ld_json_source = {};
    ld_json_url = {};
    ld_archive_is = {};
    ld_google_webcache = {};
    add_ext_link = {};
    block_js_custom = [];
    block_js_custom_ext = [];
    blockedRegexes = {};
    blockedRegexesDomains = [];
    blockedRegexesGeneral = {};
    blockedJsInline = {};
    blockedJsInlineDomains = [];
    init_custom_flex_domains();
}

const userAgentDesktopG = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const userAgentMobileG = "Chrome/115.0.5790.171 Mobile Safari/537.36 (compatible ; Googlebot/2.1 ; +http://www.google.com/bot.html)";

const userAgentDesktopB = "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)";
const userAgentMobileB = "Chrome/115.0.5790.171 Mobile Safari/537.36 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)";

const userAgentDesktopF = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';

var enabledSites = [];
var disabledSites = [];
var optionSites = {};
var customSites = {};
var customSites_grouped_domains = [];
var customSites_domains = [];
var updatedSites = {};
var updatedSites_new = [];
var updatedSites_domains_new = [];
var excludedSites = [];

function prep_regex_str(str, domain = '') {
    if (domain)
        str = str.replace(/{domain}/g, domain.replace(/\./g, '\\.'));
    return str.replace(/^\//, '').replace(/\/\//g, '/').replace(/([^\\])\/$/, "$1")
}

var add_session_rule;
if (ext_manifest_version === 3) {

    add_session_rule = function (domain, rule, blockedRegexes_rule = '', blockedRegexesGeneral_rule = '', blockedJsInline_rule = '') {
        function regexToUrlFilter(rule, regex, domain) {
            let urlFilter;
            if (!regex.match(/([([|+*{]|\\[a-z\?])/)) {
                let match_domain = gpw_domains.concat(['tinypass.com', domain]).find(x => regex.replace(/\\/g, '').match(new RegExp(x.replace(/\./, '\\.'))));
                urlFilter = regex.replace(/\\/g, '');
                if (match_domain)
                    urlFilter = '||' + urlFilter.replace(/^[\.\/]/g, '');
                delete rule.condition.regexFilter;
                rule.condition.urlFilter = urlFilter;
            }
            if (!urlFilter)
                regex_id++;
        }
        domain_id++;
        if (block_js_custom.includes(domain) || block_js_custom_ext.includes(domain)) {
            rule_id++;
            let rule_regex;
            let url_filter;
            let allow = false;
            if (block_js_custom.includes(domain)) {
                rule_regex = "[\\/\\.]" + domain.replace(/\./g, '\\.') + "\\/";
                url_filter = '||' + domain;
                if (block_js_custom_ext.includes(domain))
                    url_filter = '*';
            } else if (block_js_custom_ext.includes(domain)) {
                url_filter = '*';
                allow = true;
            }

            let block_rule = {
                "id": rule_id,
                "priority": 1,
                "action": {
                    "type": "block"
                },
                "condition": {
                    "initiatorDomains": [domain],
                    "urlFilter": url_filter,
                    "resourceTypes": ["script"]
                }
            };

            ext_api.declarativeNetRequest.updateSessionRules({
                addRules: [block_rule],
                removeRuleIds: [rule_id]
            },)

            if (allow) {
                rule_id++;
                let allow_rule = {
                    "id": rule_id,
                    "priority": 2,
                    "action": {
                        "type": "allow"
                    },
                    "condition": {
                        "initiatorDomains": [domain],
                        "urlFilter": '||' + domain,
                        "resourceTypes": ["script"]
                    }
                };

                ext_api.declarativeNetRequest.updateSessionRules({
                    addRules: [allow_rule],
                    removeRuleIds: [rule_id]
                },)
            }

        } else if (blockedRegexes_rule) {
            rule_id++;
            let rule_regex = blockedRegexes_rule;
            if (rule_regex instanceof RegExp)
                rule_regex = rule_regex.source;

            let block_rule = {
                "id": rule_id,
                "priority": 1,
                "action": {
                    "type": "block"
                },
                "condition": {
                    "initiatorDomains": [domain],
                    "regexFilter": rule_regex,
                    "resourceTypes": ["script", "xmlhttprequest"]
                }
            };

            regexToUrlFilter(block_rule, rule_regex, domain);
            ext_api.declarativeNetRequest.updateSessionRules({
                addRules: [block_rule],
                removeRuleIds: [rule_id]
            },)
        }

        if (blockedRegexesGeneral_rule) {
            rule_id++;
            let rule_regex = blockedRegexesGeneral_rule.block_regex;
            if (rule_regex instanceof RegExp)
                rule_regex = rule_regex.source;
            let rule_excluded_domains = excludedSites.concat(rule_excluded_base_domains, blockedRegexesGeneral_rule.excluded_domains);

            let block_rule = {
                "id": rule_id,
                "priority": 1,
                "action": {
                    "type": "block"
                },
                "condition": {
                    "excludedInitiatorDomains": rule_excluded_domains,
                    "regexFilter": rule_regex,
                    "resourceTypes": ["script", "xmlhttprequest"]
                }
            };

            regexToUrlFilter(block_rule, rule_regex, domain);
            ext_api.declarativeNetRequest.updateSessionRules({
                addRules: [block_rule],
                removeRuleIds: [rule_id]
            },)
        }

        let header_rule = {};
        if (!rule.allow_cookies || rule.useragent || rule.useragent_custom || rule.referer || rule.referer_custom || rule.random_ip) {
            rule_id++;
            header_rule = {
                "id": rule_id,
                "priority": 1,
                "action": {
                    "type": "modifyHeaders",
                    "requestHeaders": []
                },
                "condition": {
                    "urlFilter": "||" + domain,
                    "resourceTypes": ["main_frame", "sub_frame", "xmlhttprequest"]
                }
            };

            if (!allow_cookies.includes(domain)) {
                header_rule.action.requestHeaders.push({
                    "header": "Cookie",
                    "operation": "set",
                    "value": ""
                });
            }

            let mobile = navigator.userAgent.toLowerCase().includes('mobile');
            let useUserAgentMobile = mobile && !['theatlantic.com'].includes(domain);

            let userAgentG = useUserAgentMobile ? userAgentMobileG : userAgentDesktopG;
            let userAgentB = useUserAgentMobile ? userAgentMobileB : userAgentDesktopB;

            if (rule.useragent || rule.useragent_custom) {
                if (rule.useragent === 'googlebot') {
                    let googlebotEnabled = !(es_grupo_vocento_domains.includes(domain) && mobile);
                    if (googlebotEnabled) {
                        if (['economictimes.com', 'economictimes.indiatimes.com'].includes(domain)) {
                            header_rule.condition.urlFilter = '||' + domain + '/*.cms';
                        }
                        header_rule.action.requestHeaders.push({
                            "header": "User-Agent",
                            "operation": "set",
                            "value": userAgentG
                        });
                        header_rule.action.requestHeaders.push({
                            "header": "Referer",
                            "operation": "set",
                            "value": "https://www.google.com/"
                        });
                        header_rule.action.requestHeaders.push({
                            "header": "X-Forwarded-For",
                            "operation": "set",
                            "value": "66.249.66.1"
                        });
                    }
                } else if (rule.useragent === 'bingbot') {
                    header_rule.action.requestHeaders.push({
                        "header": "User-Agent",
                        "operation": "set",
                        "value": userAgentB
                    });
                } else if (rule.useragent === 'facebookbot') {
                    header_rule.action.requestHeaders.push({
                        "header": "User-Agent",
                        "operation": "set",
                        "value": userAgentDesktopF
                    });
                }
                if (rule.useragent_custom) {
                    header_rule.action.requestHeaders.push({
                        "header": "User-Agent",
                        "operation": "set",
                        "value": use_useragent_custom_obj[domain]
                    });
                }
            } else if (rule.referer || rule.referer_custom) {
                if (use_google_referer.includes(domain)) {
                    header_rule.action.requestHeaders.push({
                        "header": "Referer",
                        "operation": "set",
                        "value": "https://www.google.com/"
                    });
                } else if (use_facebook_referer.includes(domain)) {
                    header_rule.action.requestHeaders.push({
                        "header": "Referer",
                        "operation": "set",
                        "value": "https://www.facebook.com/"
                    });
                } else if (use_twitter_referer.includes(domain)) {
                    header_rule.action.requestHeaders.push({
                        "header": "Referer",
                        "operation": "set",
                        "value": "https://t.co/"
                    });
                }
                if (rule.referer_custom) {
                    header_rule.action.requestHeaders.push({
                        "header": "Referer",
                        "operation": "set",
                        "value": use_referer_custom_obj[domain]
                    });
                }
            }

            if (rule.random_ip) {
                let randomIP_val;
                if (rule.random_ip === 'eu')
                    randomIP_val = randomIP(185, 185);
                else
                    randomIP_val = randomIP();
                header_rule.action.requestHeaders.push({
                    "header": "X-Forwarded-For",
                    "operation": "set",
                    "value": randomIP_val
                });
            }

            if (header_rule.action.requestHeaders.length) {
                ext_api.declarativeNetRequest.updateSessionRules({
                    addRules: [header_rule],
                    removeRuleIds: [rule_id]
                },)
            } else
                rule_id--;
        }

        if (blockedJsInline_rule) {
            rule_id++;
            regex_id++;
            let block_inline_rule = {
                "id": rule_id,
                "priority": 1,
                "action": {
                    "type": "modifyHeaders",
                    "responseHeaders": [{
                        "header": "Content-Security-Policy",
                        "operation": "set",
                        "value": "script-src *;"
                    }
                    ]
                },
                "condition": {
                    "initiatorDomains": [domain],
                    "regexFilter": blockedJsInline_rule.source,
                    "resourceTypes": ["main_frame", "sub_frame"]
                }
            }

            ext_api.declarativeNetRequest.updateSessionRules({
                addRules: [block_inline_rule],
                removeRuleIds: [rule_id]
            },)
        }
    }

} // manifest v3

function addRules(domain, rule) {
    if (rule.remove_cookies > 0 || rule.hasOwnProperty('remove_cookies_select_hold') || !(rule.hasOwnProperty('allow_cookies') || rule.hasOwnProperty('remove_cookies_select_drop')) || rule.cs_clear_lclstrg)
        cs_clear_lclstrg.push(domain);
    if (rule.hasOwnProperty('remove_cookies_select_drop') || rule.hasOwnProperty('remove_cookies_select_hold')) {
        rule.allow_cookies = 1;
        rule.remove_cookies = 1;
    }
    if (rule.allow_cookies > 0 && !allow_cookies.includes(domain))
        allow_cookies.push(domain);
    if (rule.remove_cookies > 0 && !remove_cookies.includes(domain))
        remove_cookies.push(domain);
    if (rule.hasOwnProperty('remove_cookies_select_drop'))
        remove_cookies_select_drop[domain] = rule.remove_cookies_select_drop;
    if (rule.hasOwnProperty('remove_cookies_select_hold'))
        remove_cookies_select_hold[domain] = rule.remove_cookies_select_hold;
    if (rule.hasOwnProperty('block_regex')) {
        if (rule.block_regex instanceof RegExp)
            blockedRegexes[domain] = rule.block_regex;
        else {
            try {
                blockedRegexes[domain] = new RegExp(prep_regex_str(rule.block_regex, domain));
            } catch (e) {
                console.log(`regex not valid, error: ${e}`);
            }
        }
    }
    if (rule.hasOwnProperty('block_regex_general')) {
        if (rule.block_regex_general instanceof RegExp)
            blockedRegexesGeneral[domain] = { block_regex: rule.block_regex_general };
        else {
            try {
                blockedRegexesGeneral[domain] = { block_regex: new RegExp(prep_regex_str(rule.block_regex_general, domain)) };
            } catch (e) {
                console.log(`regex not valid, error: ${e}`);
            }
        }
        blockedRegexesGeneral[domain]['excluded_domains'] = rule.excluded_domains ? rule.excluded_domains : [];
    }
    if (rule.hasOwnProperty('block_js_inline')) {
        if (rule.block_js_inline instanceof RegExp)
            blockedJsInline[domain] = rule.block_js_inline;
        else {
            try {
                blockedJsInline[domain] = new RegExp(prep_regex_str(rule.block_js_inline, domain));
            } catch (e) {
                console.log(`regex not valid, error: ${e}`);
            }
        }
    }
    if (rule.useragent) {
        switch (rule.useragent) {
            case 'googlebot':
                if (!use_google_bot.includes(domain))
                    use_google_bot.push(domain);
                break;
            case 'bingbot':
                if (!use_bing_bot.includes(domain))
                    use_bing_bot.push(domain);
                break;
            case 'facebookbot':
                if (!use_facebook_bot.includes(domain))
                    use_facebook_bot.push(domain);
                break;
        }
    } else if (rule.useragent_custom) {
        if (!use_useragent_custom.includes(domain)) {
            use_useragent_custom.push(domain);
            use_useragent_custom_obj[domain] = rule.useragent_custom;
        }
    }
    if (rule.referer) {
        switch (rule.referer) {
            case 'facebook':
                if (!use_facebook_referer.includes(domain))
                    use_facebook_referer.push(domain);
                break;
            case 'google':
                if (!use_google_referer.includes(domain))
                    use_google_referer.push(domain);
                break;
            case 'twitter':
                if (!use_twitter_referer.includes(domain))
                    use_twitter_referer.push(domain);
                break;
        }
    } else if (rule.referer_custom) {
        if (!use_referer_custom.includes(domain)) {
            use_referer_custom.push(domain);
            use_referer_custom_obj[domain] = rule.referer_custom;
        }
    }
    if (rule.random_ip) {
        random_ip[domain] = rule.random_ip;
    }
    if (rule.amp_unhide > 0 && !amp_unhide.includes(domain))
        amp_unhide.push(domain);
    if (rule.amp_redirect)
        amp_redirect[domain] = rule.amp_redirect;
    if (rule.cs_block)
        cs_block[domain] = 1;
    if (rule.cs_code) {
        if (typeof rule.cs_code === 'string') {
            try {
                rule.cs_code = JSON.parse(rule.cs_code);
            } catch (e) {
                console.log(`cs_code not valid: ${rule.cs_code} error: ${e}`);
            }
        }
        if (typeof rule.cs_code === 'object')
            cs_code[domain] = rule.cs_code;
    }
    if (rule.ld_json)
        ld_json[domain] = rule.ld_json;
    if (rule.ld_json_next)
        ld_json_next[domain] = rule.ld_json_next;
    if (rule.ld_json_source)
        ld_json_source[domain] = rule.ld_json_source;
    if (rule.ld_json_url)
        ld_json_url[domain] = rule.ld_json_url;
    if (rule.ld_archive_is)
        ld_archive_is[domain] = rule.ld_archive_is;
    if (rule.ld_google_webcache)
        ld_google_webcache[domain] = rule.ld_google_webcache;
    if (rule.ld_json || rule.ld_json_next || rule.ld_json_source || rule.ld_json_url || rule.ld_archive_is || rule.ld_google_webcache || rule.cs_dompurify)
        if (!dompurify_sites.includes(domain))
            dompurify_sites.push(domain);
    if (rule.add_ext_link && rule.add_ext_link_type)
        add_ext_link[domain] = { css: rule.add_ext_link, type: rule.add_ext_link_type };

    // custom
    if (rule.block_js > 0)
        block_js_custom.push(domain);
    if (rule.block_js_ext > 0)
        block_js_custom_ext.push(domain);

    if (ext_manifest_version === 3)
        add_session_rule(domain, rule, blockedRegexes[domain], blockedRegexesGeneral[domain], blockedJsInline[domain]);
}

var rule_id = 0;
var regex_id = 0;
var domain_id = 0;
function set_rules(sites, sites_updated, sites_custom) {
    initSetRules();
    let prev_rule_id = rule_id;
    rule_id = 0;
    regex_id = 0;
    domain_id = 0;
    for (let site in sites) {
        let site_domain = sites[site].toLowerCase();
        let custom = false;
        if (!site_domain.match(/^(###$|#options_)/)) {
            let rule = {};
            let site_default = defaultSites.hasOwnProperty(site) ? site : Object.keys(defaultSites).find(default_key => compareKey(default_key, site));
            if (site_default) {
                rule = defaultSites[site_default];
                let site_updated = Object.keys(sites_updated).find(updated_key => compareKey(updated_key, site));
                if (site_updated) {
                    rule = sites_updated[site_updated];
                    if (rule.nofix && rule.group) {
                        enabledSites.splice(enabledSites.indexOf(site_domain), 1);
                        nofix_sites.push(site_domain);
                    }
                }
            } else if (sites_updated.hasOwnProperty(site)) { // updated (new) sites
                rule = sites_updated[site];
            } else if (sites_custom.hasOwnProperty(site)) { // custom (new) sites
                rule = sites_custom[site];
                custom = true;
            } else
                continue;
            let domains = [site_domain];
            let group = false;
            if (rule.hasOwnProperty('group')) {
                domains = (typeof rule.group !== 'string') ? rule.group : rule.group.split(',');
                group = true;
            }
            let rule_default = {};
            if (rule.hasOwnProperty('exception')) {
                for (let key in rule)
                    rule_default[key] = rule[key];
            }
            for (let domain of domains) {
                let custom_in_group = false;
                if (rule_default.hasOwnProperty('exception')) {
                    let exception_rule = rule_default.exception.filter(x => domain === x.domain || (typeof x.domain !== 'string' && x.domain.includes(domain)));
                    if (exception_rule.length > 0)
                        rule = exception_rule[0];
                    else
                        rule = rule_default;
                }
                // custom domain for default site(group)
                if (!custom) {
                    let isCustomSite = matchDomain(customSites_domains, domain);
                    let customSite_title = isCustomSite ? Object.keys(customSites).find(key => customSites[key].domain === isCustomSite) : '';
                    if (customSite_title && !customSitesExt_remove.includes(isCustomSite)) {
                        // add default block_regex
                        let block_regex_default = '';
                        if (rule.hasOwnProperty('block_regex'))
                            block_regex_default = rule.block_regex;
                        rule = {};
                        for (let key in sites_custom[customSite_title])
                            rule[key] = sites_custom[customSite_title][key];
                        if (block_regex_default && !rule.block_regex_ignore_default) {
                            if (rule.hasOwnProperty('block_regex')) {
                                if (block_regex_default instanceof RegExp)
                                    block_regex_default = block_regex_default.source;
                                rule.block_regex = '(' + block_regex_default + '|' + prep_regex_str(rule.block_regex, domain) + ')';
                            } else
                                rule.block_regex = block_regex_default;
                        }
                        if (group)
                            custom_in_group = true;
                        else
                            custom = true;
                    } else {
                        if (rule.nofix) {
                            enabledSites.splice(enabledSites.indexOf(domain), 1);
                            nofix_sites.push(domain);
                        }
                    }
                }
                addRules(domain, rule);
            }
        }
    }
    blockedRegexesDomains = Object.keys(blockedRegexes);
    blockedJsInlineDomains = Object.keys(blockedJsInline);
    if (ext_manifest_version === 2)
        disableJavascriptInline();
    use_random_ip = Object.keys(random_ip);
    change_headers = use_google_bot.concat(use_bing_bot, use_facebook_bot, use_useragent_custom, use_facebook_referer, use_google_referer, use_twitter_referer, use_referer_custom, use_random_ip);

    if (ext_manifest_version === 3) {
        let block_rules_length = Object.keys(blockedRegexes).length;
        console.log('block_rules: ' + block_rules_length);
        console.log('regex_rules (max. 1000): ' + regex_id);
        console.log('total_rules (max. 5000): ' + rule_id);
        console.log('domains: ' + domain_id);

        let fake_rules = [];
        let fake_rules_ids = [];
        for (let i = rule_id + 1; i < prev_rule_id + 1; i++) {
            fake_rules.push({
                "id": i,
                "priority": 1,
                "action": {
                    "type": "allow"
                },
                "condition": {
                    "urlFilter": "###",
                    "resourceTypes": ["main_frame"]
                }
            });
            fake_rules_ids.push(i);
        }

        ext_api.declarativeNetRequest.updateSessionRules({
            removeRuleIds: fake_rules_ids
        }, () => {
            if (ext_api.runtime.lasterror)
                console.log(ext_api.runtime.lasterrror.message)
        });
    }

}// manifest v3

// add grouped sites to en/disabledSites (and exclude sites)
function add_grouped_enabled_domains(groups) {
    for (let key in groups) {
        if (enabledSites.includes(key))
            enabledSites = enabledSites.concat(groups[key]);
        else
            disabledSites = disabledSites.concat(groups[key]);
    }
    // custom
    for (let site in customSites) {
        let group = customSites[site].group;
        if (group) {
            let group_array = group.split(',');
            if (enabledSites.includes(customSites[site].domain))
                enabledSites = enabledSites.concat(group_array);
            else
                disabledSites = disabledSites.concat(group_array);
        }
    }
    for (let site of excludedSites) {
        if (enabledSites.includes(site)) {
            enabledSites.splice(enabledSites.indexOf(site), 1);
            disabledSites.push(site);
        }
    }
}


if (ext_manifest_version === 2) {

    // Google AMP cache redirect
    ext_api.webRequest.onBeforeRequest.addListener(function (details) {
        var url = details.url.split('?')[0];
        var updatedUrl;
        if (matchUrlDomain('cdn.ampproject.org', url))
            updatedUrl = 'https://' + url.split(/cdn\.ampproject\.org\/[a-z]\/s\//)[1];
        else if (matchUrlDomain('google.com', url))
            updatedUrl = 'https://' + url.split(/\.google\.com\/amp\/s\//)[1];
        return { redirectUrl: decodeURIComponent(updatedUrl) };
    },
        { urls: ["*://*.cdn.ampproject.org/*/s/*", "*://*.google.com/amp/s/*"], types: ["main_frame"] },
        ["blocking"]
    );

    // inkl bypass
    ext_api.webRequest.onBeforeRequest.addListener(function (details) {
        if (!isSiteEnabled(details)) {
            return;
        }
        var updatedUrl = details.url.replace(/etok=[\w]*&/, '');
        if (details.url.includes('/signin?') && details.url.includes('redirect_to='))
            updatedUrl = 'https://www.inkl.com' + decodeURIComponent(updatedUrl.split('redirect_to=')[1]);
        return { redirectUrl: updatedUrl };
    },
        { urls: ["*://*.inkl.com/*"], types: ["main_frame"] },
        ["blocking"]
    );

    const userAgentMobile = "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.5790.171 Mobile Safari/537.36";

    // webcache.googleusercontent.com set user-agent to Chrome (on Firefox for Android)
    if ((typeof browser === 'object') && navigator_ua_mobile) {
        ext_api.webRequest.onBeforeSendHeaders.addListener(function (details) {
            let headers = details.requestHeaders;
            headers = headers.map(function (header) {
                if (header.name.toLowerCase() === 'user-agent')
                    header.value = userAgentMobile;
                return header;
            });
            return {
                requestHeaders: headers
            };
        }, {
            urls: ["*://webcache.googleusercontent.com/*"],
            types: ["main_frame", "xmlhttprequest"]
        },
            ["blocking", "requestHeaders"]);
    }

    // Australia News Corp redirect subscribe to amp
    var au_news_corp_subscr = au_news_corp_domains.map(domain => '*://www.' + domain + '/subscribe/*');
    ext_api.webRequest.onBeforeRequest.addListener(function (details) {
        if (!isSiteEnabled(details) || details.url.includes('/digitalprinteditions') || !(details.url.includes('dest=') && details.url.split('dest=')[1].split('&')[0])) {
            return;
        }
        var updatedUrl = decodeURIComponent(details.url.split('dest=')[1].split('&')[0]) + '?amp';
        return {
            redirectUrl: updatedUrl
        };
    }, {
        urls: au_news_corp_subscr,
        types: ["main_frame"]
    },
        ["blocking"]);

    // fix nytimes x-frame-options (hidden iframe content)
    ext_api.webRequest.onHeadersReceived.addListener(function (details) {
        if (!isSiteEnabled(details)) {
            return;
        }
        var headers = details.responseHeaders;
        headers = headers.map(function (header) {
            if (header.name === 'x-frame-options')
                header.value = 'SAMEORIGIN';
            return header;
        });
        return {
            responseHeaders: headers
        };
    }, {
        urls: ["*://*.nytimes.com/*"]
    },
        ['blocking', 'responseHeaders']);

}// manifest v2

function blockJsInlineListener(details) {
    let domain = matchUrlDomain(blockedJsInlineDomains, details.url);
    let matched = domain && details.url.match(blockedJsInline[domain]);
    if (matched && optin_setcookie && ['uol.com.br'].includes(domain))
        matched = false;
    if (!isSiteEnabled(details) || !matched)
        return;
    var headers = details.responseHeaders;
    headers.push({
        'name': 'Content-Security-Policy',
        'value': "script-src *;"
    });
    return {
        responseHeaders: headers
    };
}

function disableJavascriptInline() {
    // block inline script
    ext_api.webRequest.onHeadersReceived.removeListener(blockJsInlineListener);
    var block_js_inline_urls = [];
    for (let domain in blockedJsInline)
        block_js_inline_urls.push("*://*." + domain + "/*");
    if (block_js_inline_urls.length)
        ext_api.webRequest.onHeadersReceived.addListener(blockJsInlineListener, {
            'types': ['main_frame', 'sub_frame'],
            'urls': block_js_inline_urls
        },
            ['blocking', 'responseHeaders']);
}

if (typeof browser !== 'object') {
    var focus_changed = false;
    ext_api.windows.onFocusChanged.addListener((windowId) => {
        if (windowId > 0)
            focus_changed = true;
    });
}

if (ext_manifest_version === 2) {

    var extraInfoSpec = ['blocking', 'requestHeaders'];
    if (ext_api.webRequest.OnBeforeSendHeadersOptions.hasOwnProperty('EXTRA_HEADERS'))
        extraInfoSpec.push('extraHeaders');

    ext_api.webRequest.onBeforeSendHeaders.addListener(function (details) {
        var requestHeaders = details.requestHeaders;

        var header_referer = '';
        if (details.originUrl)
            header_referer = details.originUrl;
        else {
            for (let n in requestHeaders) {
                if (requestHeaders[n].name.toLowerCase() == 'referer') {
                    header_referer = requestHeaders[n].value;
                    break;
                }
            }
            var blocked_referer_domains = [];
            if (!header_referer && details.initiator) {
                header_referer = details.initiator;
                if (!blocked_referer && matchUrlDomain(blocked_referer_domains, details.url) && ['script', 'xmlhttprequest'].includes(details.type)) {
                    for (let domain of blocked_referer_domains)
                        restrictions[domain] = new RegExp('((\\/|\\.)' + domain.replace(/\./g, '\\.') + '($|\\/$)|' + restrictions[domain].toString().replace(/(^\/|\/$)/g, '') + ')');
                    blocked_referer = true;
                }
            }
        }

        // block external javascript for custom sites (optional)
        if (['script'].includes(details.type)) {
            let domain_blockjs_ext = matchUrlDomain(block_js_custom_ext, header_referer);
            if (domain_blockjs_ext && !matchUrlDomain(domain_blockjs_ext, details.url) && isSiteEnabled({ url: header_referer }))
                return { cancel: true };
        }

        // check for blocked regular expression: domain enabled, match regex, block on an internal or external regex
        if (['script', 'xmlhttprequest'].includes(details.type)) {
            let domain = matchUrlDomain(blockedRegexesDomains, header_referer);
            if (domain && details.url.match(blockedRegexes[domain]) && isSiteEnabled({ url: header_referer }))
                return { cancel: true };
        }

        // block general paywall scripts
        if (['script', 'xmlhttprequest'].includes(details.type)) {
            for (let domain in blockedRegexesGeneral) {
                if (details.url.match(blockedRegexesGeneral[domain].block_regex) && !(matchUrlDomain(excludedSites.concat(disabledSites, blockedRegexesGeneral[domain].excluded_domains), header_referer)))
                    return { cancel: true };
            }
        }

        if (!isSiteEnabled(details)) {
            return;
        }

        // block javascript of (sub)domain for custom sites (optional)
        var domain_blockjs = matchUrlDomain(block_js_custom, details.url);
        if (domain_blockjs && details.type === 'script') {
            return { cancel: true };
        }

        var useUserAgentMobile = false;
        var setReferer = false;

        var ignore_types = ['font', 'image', 'stylesheet'];

        if (matchUrlDomain(change_headers, details.url) && !ignore_types.includes(details.type)) {
            var mobile = details.requestHeaders.filter(x => x.name.toLowerCase() === "user-agent" && x.value.toLowerCase().includes("mobile")).length;
            var googlebotEnabled = matchUrlDomain(use_google_bot, details.url) &&
                !(matchUrlDomain(es_grupo_vocento_domains, details.url) && mobile) &&
                !(matchUrlDomain(['economictimes.com', 'economictimes.indiatimes.com'], details.url) && !details.url.split(/\?|#/)[0].endsWith('.cms')) &&
                !(matchUrlDomain('nytimes.com', details.url) && details.url.includes('.nytimes.com/live/')) &&
                !(matchUrlDomain('uol.com.br', details.url) && !matchUrlDomain('folha.uol.com.br', details.url));
            var bingbotEnabled = matchUrlDomain(use_bing_bot, details.url);
            var facebookbotEnabled = matchUrlDomain(use_facebook_bot, details.url);
            var useragent_customEnabled = matchUrlDomain(use_useragent_custom, details.url);

            // if referer exists, set it
            requestHeaders = requestHeaders.map(function (requestHeader) {
                if (requestHeader.name === 'Referer') {
                    if (googlebotEnabled || matchUrlDomain(use_google_referer, details.url)) {
                        requestHeader.value = 'https://www.google.com/';
                    } else if (matchUrlDomain(use_facebook_referer, details.url)) {
                        requestHeader.value = 'https://www.facebook.com/';
                    } else if (matchUrlDomain(use_twitter_referer, details.url)) {
                        requestHeader.value = 'https://t.co/';
                    } else if (domain = matchUrlDomain(use_referer_custom, details.url)) {
                        requestHeader.value = use_referer_custom_obj[domain];
                    }
                    setReferer = true;
                }
                if (requestHeader.name === 'User-Agent') {
                    useUserAgentMobile = requestHeader.value.toLowerCase().includes("mobile") && !matchUrlDomain(['theatlantic.com'], details.url);
                }
                return requestHeader;
            });

            // otherwise add it
            if (!setReferer) {
                if (googlebotEnabled || matchUrlDomain(use_google_referer, details.url)) {
                    requestHeaders.push({
                        name: 'Referer',
                        value: 'https://www.google.com/'
                    });
                } else if (matchUrlDomain(use_facebook_referer, details.url)) {
                    requestHeaders.push({
                        name: 'Referer',
                        value: 'https://www.facebook.com/'
                    });
                } else if (matchUrlDomain(use_twitter_referer, details.url)) {
                    requestHeaders.push({
                        name: 'Referer',
                        value: 'https://t.co/'
                    });
                } else if (domain = matchUrlDomain(use_referer_custom, details.url)) {
                    requestHeaders.push({
                        name: 'Referer',
                        value: use_referer_custom_obj[domain]
                    });
                }
            }

            // override User-Agent to use Googlebot
            if (googlebotEnabled) {
                requestHeaders.push({
                    "name": "User-Agent",
                    "value": useUserAgentMobile ? userAgentMobileG : userAgentDesktopG
                })
                requestHeaders.push({
                    "name": "X-Forwarded-For",
                    "value": "66.249.66.1"
                })
            }

            // override User-Agent to use Bingbot
            else if (bingbotEnabled) {
                requestHeaders.push({
                    "name": "User-Agent",
                    "value": useUserAgentMobile ? userAgentMobileB : userAgentDesktopB
                })
            }

            // override User-Agent to use Facebookbot
            else if (facebookbotEnabled) {
                requestHeaders.push({
                    "name": "User-Agent",
                    "value": userAgentDesktopF
                })
            }

            // override User-Agent to custom
            else if (domain = useragent_customEnabled) {
                requestHeaders.push({
                    "name": "User-Agent",
                    "value": use_useragent_custom_obj[domain]
                })
            }

            // random IP for sites in use_random_ip
            let domain_random = matchUrlDomain(use_random_ip, details.url);
            if (domain_random && !googlebotEnabled) {
                let randomIP_val;
                if (random_ip[domain_random] === 'eu')
                    randomIP_val = randomIP(185, 185);
                else
                    randomIP_val = randomIP();
                requestHeaders.push({
                    "name": "X-Forwarded-For",
                    "value": randomIP_val
                })
            }
        }

        // remove cookies before page load
        if (!matchUrlDomain(allow_cookies, details.url)) {
            requestHeaders = requestHeaders.map(function (requestHeader) {
                if (requestHeader.name === 'Cookie') {
                    requestHeader.value = '';
                }
                return requestHeader;
            });
        }

        return { requestHeaders: requestHeaders };
    }, {
        urls: ['*://*/*']
    }, extraInfoSpec);
    // extraInfoSpec is ['blocking', 'requestHeaders'] + possible 'extraHeaders'

}// manifest v2


ext_api.tabs.onUpdated.addListener(function (tabId, info, tab) { updateBadge(tab); });
ext_api.tabs.onActivated.addListener(function (activeInfo) { if (activeInfo.tabId) ext_api.tabs.get(activeInfo.tabId, updateBadge); });

function updateBadge(activeTab) {
    if (ext_api.runtime.lastError || !activeTab || !activeTab.active)
        return;
    let badgeText = '';
    let color = 'red';
    let currentUrl = activeTab.url;
    if (currentUrl) {
        if (isSiteEnabled({ url: currentUrl })) {
            badgeText = 'ON';
            color = 'red';
        } else if (matchUrlDomain(enabledSites, currentUrl)) {
            badgeText = 'ON-';
            color = 'orange';
        } else if (matchUrlDomain(disabledSites, currentUrl)) {
            badgeText = 'OFF';
            color = 'blue';
        } else if (matchUrlDomain(nofix_sites, currentUrl)) {
            badgeText = 'X';
            color = 'silver';
        }
        if (matchUrlDomain('webcache.googleusercontent.com', currentUrl))
            badgeText = '';

        let isDefaultSite = matchUrlDomain(defaultSites_domains, currentUrl);

        if (!isDefaultSite) {
            badgeText = 'C';
        }

        if (color && badgeText)
            ext_api.action.setBadgeBackgroundColor({ color: color });
        ext_api.action.setBadgeText({ text: badgeText });
    } else {
        ext_api.action.setBadgeText({ text: badgeText });
    }
}


function filterObject(obj, filterFn, mapFn = function (val, key) {
    return [key, val];
}) {
    return Object.fromEntries(Object.entries(obj).
        filter(([key, val]) => filterFn(val, key)).map(([key, val]) => mapFn(val, key)));
}

function compareKey(firstStr, secondStr) {
    return firstStr.toLowerCase().replace(/\s\(.*\)/, '') === secondStr.toLowerCase().replace(/\s\(.*\)/, '');
}

function isSiteEnabled(details) {
    var enabledSite = matchUrlDomain(enabledSites, details.url);
    if (!ext_name.startsWith('Bypass Paywalls Clean') || !(self_hosted || /0$/.test(ext_version)))
        enabledSite = '';
    if (enabledSite in restrictions) {
        return restrictions[enabledSite].test(details.url);
    }
    return !!enabledSite;
}

function matchDomain(domains, hostname = '') {
    var matched_domain = false;
    if (typeof domains === 'string')
        domains = [domains];
    domains.some(domain => (hostname === domain || hostname.endsWith('.' + domain)) && (matched_domain = domain));
    return matched_domain;
}

function urlHost(url) {
    if (/^http/.test(url)) {
        try {
            return new URL(url).hostname;
        } catch (e) {
            console.log(`url not valid: ${url} error: ${e}`);
        }
    }
    return url;
}

function matchUrlDomain(domains, url) {
    return matchDomain(domains, urlHost(url));
}

function prepHostname(hostname) {
    return hostname.replace(/^(www|m|account|amp(\d)?|edition|eu|mobil|wap)\./, '');
}

function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function stripUrl(url) {
    return url.split(/[\?#]/)[0];
}

function decode_utf8(str) {
    return decodeURIComponent(escape(str));
}

function randomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function randomIP(range_low = 0, range_high = 223) {
    let rndmIP = [];
    for (let n = 0; n < 4; n++) {
        if (n === 0)
            rndmIP.push(range_low + randomInt(range_high - range_low + 1));
        else
            rndmIP.push(randomInt(255) + 1);
    }
    return rndmIP.join('.');
}

// Refresh the current tab (http)
function refreshCurrentTab() {
    ext_api.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        if (tabs && tabs[0] && /^http/.test(tabs[0].url)) {
            if (ext_api.runtime.lastError)
                return;
            ext_api.tabs.update(tabs[0].id, {
                url: tabs[0].url
            });
        }
    });
}
