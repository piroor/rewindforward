const kREWINDFORWARD_DEBUG = false; 

// type
const kREWINDFORWARD_LINK_TYPE_RELATED = 1;
const kREWINDFORWARD_LINK_TYPE_LABELED = 2;
const kREWINDFORWARD_LINK_TYPE_VIRTUAL = 4;

// rate
const kREWINDFORWARD_LINK_RELATED        = 10;
const kREWINDFORWARD_LINK_RELATED_CUSTOM = 20;
const kREWINDFORWARD_LINK_LABELED        = 2;
const kREWINDFORWARD_LINK_INCREMENTED    = 1;
const kREWINDFORWARD_LINK_SAME_DOMAIN    = 1;
 
// do rewind/fastforward 
function BrowserRewind(aForceToRewind, aEvent)
{
	BrowserRewindOrFastforward('rewind', aForceToRewind, aEvent);
}
function BrowserRewindPrev(aEvent)
{
	if (aEvent && aEvent.type == 'click' && aEvent.button != 1) return;

	var link = rewindforwardGetLinkInMainFrame(
			rewindforwardGetLinksFromAllFrames('prev')
		);
	if (!link) return;

	var usetab = aEvent && aEvent.button == 1;

	if ('referrerBlocked' in gBrowser.selectedTab && gBrowser.selectedTab.referrerBlocked)
		link.referrer = null;

	if (usetab)
		rewindforwardOpenNewTab(link.href, link.referrer);
	else
		rewindforwardLoadLink(link.href, link.referrer, link.view, -1);
}

function BrowserFastforward(aForceToFastforward, aEvent)
{
	BrowserRewindOrFastforward('fastforward', aForceToFastforward, aEvent);
}
function BrowserFastforwardNext(aEvent)
{
	if (aEvent && aEvent.type == 'click' && aEvent.button != 1) return;

	var link = rewindforwardGetLinkInMainFrame(
			rewindforwardGetLinksFromAllFrames('next')
		);
	if (!link) return;

	var usetab = aEvent && aEvent.button == 1;

	if ('referrerBlocked' in gBrowser.selectedTab && gBrowser.selectedTab.referrerBlocked)
		link.referrer = null;

	if (usetab)
		rewindforwardOpenNewTab(link.href, link.referrer);
	else
		rewindforwardLoadLink(link.href, link.referrer, link.view, 1);
}
	
function BrowserRewindOrFastforward(aType, aForce, aEvent) 
{
	if (aEvent && aEvent.type == 'click' && aEvent.button != 1) return;

	var usetab = aEvent && aEvent.button == 1;


	var link = (aType == 'rewind') ?
				(
					rf_shouldFindPrevLinks() ?
						rewindforwardGetLinksFromAllFrames('prev') :
						null
				) :
				(
					rf_shouldFindNextLinks() ?
						rewindforwardGetLinksFromAllFrames('next') :
						null
				);

	if (!aForce && link && link.length) {
		link = rewindforwardGetLinkInMainFrame(link);

		if ('referrerBlocked' in gBrowser.selectedTab && gBrowser.selectedTab.referrerBlocked)
			link.referrer = null;

		if (usetab)
			rewindforwardOpenNewTab(link.href, link.referrer);
		else
			rewindforwardLoadLink(link.href, link.referrer, link.view, (aType == 'rewind' ? -1 : 1 ));

		return;
	}


	var SH      = gBrowser.sessionHistory;
	var current = rewindforwardGetHistoryEntryAt(SH.index);
	var c_host  = current.URI ? current.URI.host : null ;

	var check = (aType == 'rewind') ? function(aIndex) { return aIndex > -1 } : function(aIndex) { return aIndex < SH.count }
	var step  = (aType == 'rewind') ? -1 : 1 ;
	var start = (aType == 'rewind') ? SH.index-1 : SH.index+1 ;

	var entry,
		t_host;
	for (var i = start; check(i); i += step)
	{
		entry  = rewindforwardGetHistoryEntryAt(i);
		t_host = entry.URI ? entry.URI.host : null ;
		if ((c_host && !t_host) || (!c_host && t_host) || (c_host != t_host)) {

			if (rewindforwardGetPref('rewindforward.goToEndPointOfCurrentDomain')) {
				if (i == start) {
					c_host = t_host;
					continue;
				}
				i -= step;
			}

			if (usetab)
				rewindforwardOpenNewTab(entry.URI.spec, entry.referrerURI);
			else {
				try {
					gBrowser.webNavigation.gotoIndex(i);
				}
				catch(e) {
				}
			}
			return;
		}
	}

	if (usetab)
		rewindforwardOpenNewTab(entry.URI.spec, entry.referrerURI);
	else
		gBrowser.webNavigation.gotoIndex((aType == 'rewind') ? 0 : SH.count-1 );
}
 
function rewindforwardGetHistoryEntryAt(aIndex) 
{
	var entry  = gBrowser.sessionHistory.getEntryAtIndex(aIndex, false);
	var info = { URI : null, referrerURI : null };
	if (entry) {
		entry = entry.QueryInterface(Components.interfaces.nsIHistoryEntry)
					.QueryInterface(Components.interfaces.nsISHEntry);
		if (entry.URI)
			info.URI = entry.URI;
		if (entry.referrerURI)
			info.referrerURI = entry.referrerURI;
	}
	return info;
}
 
function rewindforwardOpenNewTab(aURI, aReferrer) 
{
	var tab = ('TabbrowserService' in window) ? gBrowser.addTabInternal(aURI, aReferrer, { parentTab : gBrowser.selectedTab.tabId }) : gBrowser.addTab(aURI, aReferrer) ;

	var loadInBackground = rewindforwardGetPref('browser.tabs.loadInBackground');
	if (aEvent.shiftKey) loadInBackground = !loadInBackground;

	if (loadInBackground) gBrowser.selectedTab = tab;

	if (aEvent.target.localName == 'menuitem')
		aEvent.target.parentNode.hidePopup();
}
 
function rewindforwardLoadLink(aURI, aReferrer, aWindow, aHistoryDirection) 
{
	var win = aWindow || document.commandDispatcher.focusedWindow;
	if (win == window) return;

	var winWrapper = new XPCNativeWrapper(win, 'QueryInterface()');
	var docShell = winWrapper
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIDocShellTreeItem);
	if (docShell.itemType && docShell.itemType != Components.interfaces.nsIDocShellTreeItem.typeContent)
		return;

	// もし読み込むページがすでに前後の履歴にある場合は、そちらを優先する
	if (
		aHistoryDirection != 0 &&
		win == gBrowser.contentWindow // フレーム内については未実装……
		) {
		var SH    = gBrowser.sessionHistory;
		var index = SH.index + (aHistoryDirection > 0 ? 1 : -1 );
		if (index > -1 && index < SH.count) {
			var entry = rewindforwardGetHistoryEntryAt(index);
			if (entry.URI.spec == aURI) {
				gBrowser.webNavigation.gotoIndex(index);
				return;
			}
		}
	}

	docShell.loadURI(aURI, docShell.LOAD_FLAGS_IS_LINK , aReferrer, null, null);
}
 
function rewindforwardNewBrowserBack(aEvent) 
{
	var button = document.getElementById('back-button');
	if (aEvent && aEvent.target.id == 'back-button') {
		if (button.getAttribute('rewindforward-prev') == 'true')
			return BrowserRewindPrev(aEvent);
		else if (button.getAttribute('rewindforward-override') == 'navigation')
			return BrowserRewind(true, aEvent);
	}

	return __rewindforward__BrowserBack(aEvent);
}
 
function rewindforwardNewBrowserForward(aEvent) 
{
	var button = document.getElementById('forward-button');
	if (aEvent && aEvent.target.id == 'forward-button') {
		if (button.getAttribute('rewindforward-next') == 'true')
			return BrowserFastforwardNext(aEvent);
		else if (button.getAttribute('rewindforward-override') == 'navigation')
			return BrowserFastforward(true, aEvent);
	}

	return __rewindforward__BrowserForward(aEvent);
}
  
// get next/prev link 
	
// collect "next" and "previous" links from all frames 
function rewindforwardGetLinksFromAllFrames(aType)
{
	return rewindforwardGetLinksFromAllFramesInternal(
		[
			gBrowser.contentWindow
		],
		aType
	);
}
function rewindforwardGetLinksFromAllFramesInternal(aFrames, aType)
{
	var frames;
	var frameWrapper;
	var link;
	var links = [];
	var foundLinks;
	for (var i = 0; i < aFrames.length; i++)
	{
		link = rewindforwardGetFirstLink(aType, aFrames[i]);
		if (link)
			links.push(link);

		try {
			frameWrapper = new XPCNativeWrapper(aFrames[i],
					'frames'
				);
			if (!frameWrapper.frames) continue;

			foundLinks = rewindforwardGetLinksFromAllFramesInternal(frameWrapper.frames, aType);
			if (foundLinks && foundLinks.length)
				links = links.concat(foundLinks);
		}
		catch(e) {
		}
	}

	return links;
}
 
function rewindforwardGetFirstLink(aType, aWindow) 
{
	var w = aWindow || document.commandDispatcher.focusedWindow;
	if (!w || Components.lookupMethod(w, 'top').call(w) != gBrowser.contentWindow)
		w = gBrowser.contentWindow;

	var winWrapper = new XPCNativeWrapper(w,
			'document',
			'QueryInterface()'
		);
	var docWrapper = new XPCNativeWrapper(winWrapper.document,
			'getElementsByTagName()'
		);


	var lastCount = docWrapper.getElementsByTagName('*').length;

	if ('__rewindforward__foundFirstLinks' in w &&
		w.__rewindforward__foundFirstLinks[aType] &&
		w.__rewindforward__foundFirstLinks[aType+'LastCount'] == lastCount)
		return w.__rewindforward__foundFirstLinks[aType];


	var domain;
	try {
		domain = winWrapper
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.currentURI.host;
	}
	catch(e) {
	}

	var result      = {};
	var resultArray = [];
	var links = [].concat(
			rewindforwardGetRelatedLinks(aType, aWindow),
			rewindforwardGetLabeledLinks(aType, aWindow),
			[rewindforwardGetVirtualLink(aType, aWindow)]
		);
	const ioService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
	var uri;

	for (var i in links)
	{
		if (
			!links[i] ||
			links[i].href == (new XPCNativeWrapper((new XPCNativeWrapper(links[i].view, 'location')).location, 'href')).href
			)
			continue;

		if (!(links[i].href in result)) {
			resultArray.push(links[i]);
			result[links[i].href]       = links[i];
			result[links[i].href].index = resultArray.length-1;

			try {
				uri = ioService.newURI(links[i].href, null, null);
				if (uri.host && uri.host == domain)
					result[links[i].href].level += kREWINDFORWARD_LINK_SAME_DOMAIN;
			}
			catch(e) {
			}
		}
		else if (!(result[links[i].href].type & links[i].type)) {
			result[links[i].href].level += links[i].level;
			result[links[i].href].type  += links[i].type;
		}

	}


	if (kREWINDFORWARD_DEBUG) {
		dump('=====REWINDFORWARD FOUND LINKS START=====\n');
		for (i = 0; i < resultArray.length; i++)
			if (resultArray[i])
				dump(resultArray[i].href +' : '+resultArray[i].level+'\n');
		dump('=====REWINDFORWARD FOUND LINKS END=====\n');
	}


	resultArray.sort(function(aA, aB) {
		return (aA.level < aB.level) ? 1 : -1 ;
	});

	if (resultArray.length) {
		if (!('__rewindforward__foundFirstLinks' in w))
			w.__rewindforward__foundFirstLinks = {};

		w.__rewindforward__foundFirstLinks[aType] = resultArray[0];
		w.__rewindforward__foundFirstLinks[aType+'LastCount'] = lastCount;
		return resultArray[0];
	}

	return null;
}
	
// find "next" and "previous" link in a window 
	
function rewindforwardGetRelatedLinks(aType, aWindow) 
{
	var w = aWindow || document.commandDispatcher.focusedWindow;
	if (!w || Components.lookupMethod(w, 'top').call(w) != gBrowser.contentWindow)
		w = gBrowser.contentWindow;

	var winWrapper = new XPCNativeWrapper(w,
			'document',
			'QueryInterface()'
		);
	var docWrapper = new XPCNativeWrapper(winWrapper.document,
			'getElementsByTagName()'
		);

	var lastCount = docWrapper.getElementsByTagName('*').length;

	// use cache
	if ('__rewindforward__foundRelatedLinks' in w &&
		w.__rewindforward__foundRelatedLinks[aType] &&
		w.__rewindforward__foundRelatedLinks[aType+'LastCount'] == lastCount)
		return w.__rewindforward__foundRelatedLinks[aType];

	const rel = aType;
	const rev = (rel == 'next') ? 'prev' : 'next' ;

	var rate = kREWINDFORWARD_LINK_RELATED;


	// get rules to find links
	var customRule;
	var domain;

	const uri = winWrapper
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIWebNavigation)
			.currentURI;
	try {
		domain = encodeURI(uri.host);
	}
	catch(e) {
	}
	if (domain) {
		const pref = Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPref);
		const branch = pref.getBranch('rewindforward.rule.'+rel+'.');

		var count   = { value : 0 };
		const list  = branch.getChildList('', count);

		var regexp  = new RegExp('', 'g');
		var matchingResult = domain.match(
				regexp.compile([
					'(',
					list.join('\n')
						.replace(/^\*\n|\n\*$/g,'')
						.replace(/\n\*\n/g,'\n')
						.replace(/\./g, '\\.')
						.replace(/\?/g, '.')
						.replace(/\*/g, '.+')
						.replace(/\n/g,')|('),
					')'
				].join(''))
			);
		if (matchingResult) {
			// String.match() returns the found word as a first element of the result, so we have to remove it from the list.
			matchingResult.shift();
			// Replace other results to single letters for the next step.
			matchingResult = ['[', matchingResult.join(']['), ']'].join('')
								.replace(/\[(undefined)?\]/g, '/')
								.replace(/\[|\]/g, '');
//dump('result: '+matchingResult+'\n')
			// Which rule matched? We can know it with this step.
			const pos = matchingResult.indexOf(domain);
//dump('found at '+pos+'\n');
			if (pos > -1) {
				// "list[pos]" is the rule. But if there is "*" rule, list[0] is "*" and the rule is "list[pos+1]".
				const offset = rewindforwardGetPref('rewindforward.rule.'+rel+'.*') ? 1 : 0 ;
				const customRuleEntry = list[pos+offset];
//dump('found entry: '+customRuleEntry+'\n');
				customRule = rewindforwardGetPref('rewindforward.rule.'+rel+'.'+customRuleEntry);
			}
		}
		if (!customRule) {
			customRule = rewindforwardGetPref('rewindforward.rule.'+rel+'.*');
		}
		else {
			rate = kREWINDFORWARD_LINK_RELATED_CUSTOM;
		}
	}


	// find "next" or "prev" link with XPath
	var xpath;
	if (customRule) {
		xpath = customRule;
	}
	else {
		xpath = ['(descendant::A | descendant::xhtml:a | descendant::AREA | descendant::xhtml:area | descendant::LINK | descendant::xhtml:link | (descendant::A | descendant::xhtml:a | descendant::AREA | descendant::xhtml:area | descendant::LINK | descendant::xhtml:link)/descendant::*)[not(local-name() = "style" or local-name() = "STYLE" or local-name() = "script" or local-name() = "SCRIPT") and contains(concat(" ", @rel, " "), " ', rel, ' ")]'].join('');
	}
//dump('XPATH: '+xpath+'\n');
	var links = rewindforwardGetLinksFromXPath(xpath, winWrapper.document, rate, kREWINDFORWARD_LINK_TYPE_RELATED);

	// find reverse links
	if (!customRule && !links.length) {
		xpath = ['descendant::*[not(local-name() = "style" or local-name() = "STYLE" or local-name() = "script" or local-name() = "SCRIPT") and contains(concat(" ", @rev, " "), " ', rev, ' ")]'].join('');
		links = rewindforwardGetLinksFromXPath(xpath, winWrapper.document, kREWINDFORWARD_LINK_RELATED);
	}

	if (!('__rewindforward__foundRelatedLinks' in w))
		w.__rewindforward__foundRelatedLinks = {};

//dump('FOUND RELATED LINKS: '+links.length+'\n')
	w.__rewindforward__foundRelatedLinks[aType] = links;
	w.__rewindforward__foundRelatedLinks[aType+'LastCount'] = lastCount;

	return links;
}
 
function rewindforwardGetLabeledLinks(aType, aWindow) 
{
	var w = aWindow || document.commandDispatcher.focusedWindow;
	if (!w || Components.lookupMethod(w, 'top').call(w) != gBrowser.contentWindow)
		w = gBrowser.contentWindow;

	var winWrapper = new XPCNativeWrapper(w,
			'document',
			'QueryInterface()'
		);
	var docWrapper = new XPCNativeWrapper(winWrapper.document,
			'getElementsByTagName()'
		);

	var lastCount = docWrapper.getElementsByTagName('*').length;

	// use cache
	if ('__rewindforward__foundLabeledLinks' in w &&
		w.__rewindforward__foundLabeledLinks[aType] &&
		w.__rewindforward__foundLabeledLinks[aType+'LastCount'] == lastCount)
		return w.__rewindforward__foundLabeledLinks[aType];

	const rel = aType;

	var links = [];

	var xpath;
	xpath = ['(descendant::A | descendant::xhtml:a | descendant::AREA | descendant::xhtml:area | descendant::LINK | descendant::xhtml:link | (descendant::A | descendant::xhtml:a | descendant::AREA | descendant::xhtml:area | descendant::LINK | descendant::xhtml:link)/descendant::*)[not(local-name() = "style" or local-name() = "STYLE" or local-name() = "script" or local-name() = "SCRIPT")'];

	var positivePatterns = [];

	var matchingPatterns = document.getElementById(rel == 'next' ? 'Browser:Fastforward' : 'Browser:Rewind' ).getAttribute('patterns');
	if (matchingPatterns) {
		positivePatterns = matchingPatterns.split('|');
		xpath.push(' and contains(concat(@alt, " ", @title, " ", @src, " ", text()), "');
		xpath.push(matchingPatterns.replace(/\|/g, '") or contains(concat(@alt, " ", @title, " ", @src, " ", text()), "'));
		xpath.push('")');
	}

	matchingPatterns = document.getElementById(rel == 'next' ? 'Browser:Fastforward' : 'Browser:Rewind' ).getAttribute('patterns-blacklist');
	if (matchingPatterns) {
		xpath.push(' and not(contains(concat(@alt, " ", @title, " ", @src, " ", text()), "');
		xpath.push(matchingPatterns.replace(/\|/g, '") or contains(concat(@alt, " ", @title, " ", @src, " ", text()), "'));
		xpath.push('"))');
	}


	xpath.push(']');
	xpath = xpath.join('');

	links = rewindforwardGetLinksFromXPath(xpath, winWrapper.document, kREWINDFORWARD_LINK_LABELED, kREWINDFORWARD_LINK_TYPE_LABELED);

	var i, j;
	for (i = 0; i < links.length; i++)
	{
		links[i].level--;
		for (j = 0; j < positivePatterns.length; j++)
		{
			if (links[i].label.indexOf(positivePatterns[j]) > -1)
				links[i].level++;
		}
	}

	if (!('__rewindforward__foundLabeledLinks' in w))
		w.__rewindforward__foundLabeledLinks = {};

	w.__rewindforward__foundLabeledLinks[aType] = links;
	w.__rewindforward__foundLabeledLinks[aType+'LastCount'] = lastCount;

	return links;
}
 
function rewindforwardGetLinksFromXPath(aXPath, aXMLDocument, aLevel, aType) 
{
	const XHTMLNS = 'http://www.w3.org/1999/xhtml';
	const XLinkNS = 'http://www.w3.org/1999/xlink';

	var nodes = [];

	// http://www.hawk.34sp.com/stdpls/xml/
	// http://www.hawk.34sp.com/stdpls/xml/dom_xpath.html
	// http://www.homoon.jp/users/www/doc/CR-css3-selectors-20011113.shtml
	const xmlDoc  = aXMLDocument;
	var docWrapper = new XPCNativeWrapper(xmlDoc,
			'documentElement',
			'createNSResolver()',
			'createExpression()',
			'location'
		);
	const context = docWrapper.documentElement;
//	const type    = XPathResult.FIRST_ORDERED_NODE_TYPE;
	const type    = XPathResult.ORDERED_NODE_ITERATOR_TYPE;
//	const resolver  = xmlDoc.createNSResolver(xmlDoc.documentElement);
	const resolver = {
		lookupNamespaceURI : function(aPrefix)
		{
			switch (aPrefix)
			{
				case 'xhtml':
					return XHTMLNS;
				default:
					return '';
			}
		}
	};

	try {
		var expression = docWrapper.createExpression(aXPath, resolver);
		var result = expression.evaluate(context, type, null);
	}
	catch(e) {
		dump('rewindforwardGetLinksFromXPath >>>>>> ERROR <<<<<<<\n'+e+'\n');
		return nodes;
	}


	var link;
	var node;
	var nodeWrapper;
	do {
		try {
			node = result.iterateNext();
		}
		catch(e) {
			node = null;
		}
		if (!node) break;

		nodeWrapper = new XPCNativeWrapper(node,
				'nodeType',
				'parentNode',
				'localName'
			);

		if (nodeWrapper.nodeType != Node.ELEMENT_NODE)
			node = nodeWrapper.parentNode;
		while (
			node &&
			(nodeWrapper = new XPCNativeWrapper(node,
					'nodeType',
					'parentNode',
					'localName'
				)) &&
			!/^(a|area|link)$/.test((nodeWrapper.localName || '').toLowerCase()) &&
			nodeWrapper.parentNode
			)
			node = nodeWrapper.parentNode;

		if (nodeWrapper.nodeType != Node.ELEMENT_NODE)
			continue;

		nodeWrapper = new XPCNativeWrapper(node,
				'getAttributeNS()',
				'getAttribute()',
				'textContent'
			);

		link = {
				level : aLevel,
				label : (
						rewindforwardGetNativeProperty(node, 'title') ||
						nodeWrapper.getAttributeNS(XLinkNS, 'title') ||
						nodeWrapper.getAttributeNS(XHTMLNS, 'title') ||
						nodeWrapper.getAttribute('title') ||
						nodeWrapper.textContent
						),
				href : (
						rewindforwardGetNativeProperty(node, 'href') ||
						nodeWrapper.getAttributeNS(XLinkNS, 'href') ||
						nodeWrapper.getAttributeNS(XHTMLNS, 'href') ||
						nodeWrapper.getAttribute('href')
						),
				referrer : Components.classes['@mozilla.org/network/io-service;1']
				                     .getService(Components.interfaces.nsIIOService)
				                     .newURI(docWrapper.location, null, null),
				view : rewindforwardGetDocShellFromDocument(xmlDoc)
						.QueryInterface(Components.interfaces.nsIWebNavigation)
						.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
						.getInterface(Components.interfaces.nsIDOMWindow),
				type : (aType || 0)
			};

		if (link.href) nodes.push(link);

	} while(true);

	return nodes;
}
  
function rewindforwardGetVirtualLink(aType, aWindow) 
{
	if (!rf_shouldUseVirtualLinks()) return null;

	var w = aWindow || document.commandDispatcher.focusedWindow;
	if (!w || Components.lookupMethod(w, 'top').call(w) != gBrowser.contentWindow)
		w = gBrowser.contentWindow;

	var winWrapper = new XPCNativeWrapper(w,
			'document',
			'QueryInterface()'
		);
	var docWrapper = new XPCNativeWrapper(winWrapper.document,
			'getElementsByTagName()'
		);

	var lastCount = docWrapper.getElementsByTagName('*').length;

	// use cache
	if ('__rewindforward__foundVirtualLink' in w &&
		w.__rewindforward__foundVirtualLink[aType] &&
		w.__rewindforward__foundVirtualLink[aType+'LastCount'] == lastCount) {
		return w.__rewindforward__foundVirtualLink[aType].href ? w.__rewindforward__foundVirtualLink[aType] : null ;
	}

	var link = {
			level   : kREWINDFORWARD_LINK_INCREMENTED,
			href    : rewindforwardIncrementPageURI(
				aType == 'next' ? 1 : -1 ,
				(new XPCNativeWrapper((new XPCNativeWrapper(w, 'location')).location, 'href')).href
			),
			virtual : true,
			view    : w,
			type    : kREWINDFORWARD_LINK_TYPE_VIRTUAL
		};

	if (!('__rewindforward__foundVirtualLink' in w))
		w.__rewindforward__foundVirtualLink = {};

	w.__rewindforward__foundVirtualLink[aType] = link;
	w.__rewindforward__foundVirtualLink[aType+'LastCount'] = lastCount;

	return link.href ? link : null ;
}
	
function rewindforwardIncrementPageURI(aCount, aURI) 
{
	var res = aURI.match(/^\w+:\/\/[^\/]+\/([^0-9]*|.+[0-9]+[^0-9]+)([0-9]+)[^0-9]*$/);
	if (!res || !res[2]) return null;

	var prefix = res[1];
	var num    = res[2];

	var newNum = String(Number(num.replace(/^0+/, ''))+aCount);
	while (newNum.length < num.length)
		newNum = '0' + newNum;

	var newURI = [
			aURI.substring(0, aURI.lastIndexOf(prefix)+prefix.length),
			newNum,
			aURI.substring(aURI.lastIndexOf(prefix)+prefix.length+num.length, aURI.length)
		].join('');

	return newURI;
}
   
// get the link in the most largest frame, from an array of links 
function rewindforwardGetLinkInMainFrame(aLinks)
{
	if (!aLinks || !aLinks.length) return null;

	var link = null;
	var lastSize = 0;
	var newSize;
	for (var i in aLinks)
	{
		viewWrapper = new XPCNativeWrapper(aLinks[i].view,
				'innerWidth',
				'innerHeight'
			);
		newSize = viewWrapper.innerWidth * viewWrapper.innerHeight;
		if (newSize <= lastSize) continue;

		lastSize = newSize;
		link = aLinks[i];
	}

	return link;
}
  
// update UI 
	
function rewindforwardUpdateButtons(aFindLinks) 
{
	var frames = Components.lookupMethod(gBrowser.contentWindow, 'frames').call(gBrowser.contentWindow);
	if (frames.length) {
		function checkSubFramesAreCompletelyLoaded(aFrames)
		{
			var result = true;
			for (var i = 0; i < aFrames.length; i++)
			{
				if (Components.lookupMethod(aFrames[i], 'top').call(aFrames[i]) != gBrowser.contentWindow)
					return false;
				if (result)
					result = checkSubFramesAreCompletelyLoaded(Components.lookupMethod(aFrames[i], 'frames').call(aFrames[i]))
			}
			return result;
		}
		if (!checkSubFramesAreCompletelyLoaded(frames)) {
			window.setTimeout(rewindforwardUpdateButtons, 10, aFindLinks);
			return;
		}
	}

	var nav = gBrowser.webNavigation;

	var broadcaster, disabled, link;

	var toEndPoint = rewindforwardGetPref('rewindforward.goToEndPointOfCurrentDomain');
	var navigationTooltipAttr = toEndPoint ? 'tooltiptext-navigation-toEndPoint' : 'tooltiptext-navigation' ;

	var rewindButton   = document.getElementById('rewind-button');
	var rewirdMenuItem = document.getElementById('rewindMenuItem');
	var prevButton     = document.getElementById('rewind-prev-button');
	var backButton     = rf_shouldOverrideBackButtons() ? document.getElementById('back-button') : null ;
	if (rewindButton || prevButton || backButton) {
		link = rewindforwardGetLinkInMainFrame(
			rewindforwardGetLinksFromAllFrames('prev')
		);
		if (backButton && !backButton.getAttribute('rewindforward-original-tooltip')) {
			backButton.setAttribute('rewindforward-original-tooltip', backButton.getAttribute('tooltiptext'));
			backButton.setAttribute('rewindforward-original-label',   backButton.getAttribute('label'));
		}

		if (prevButton && !prevButton.hidden) {
			broadcaster = document.getElementById('Browser:RewindPrev');
			disabled    = broadcaster.hasAttribute('disabled');
			if (disabled == Boolean(link)) {
				if (disabled || link)
					broadcaster.removeAttribute('disabled');
				else
					broadcaster.setAttribute('disabled', true);
			}
			if (!link) {
				prevButton.setAttribute('tooltiptext', broadcaster.getAttribute('tooltiptext-link-blank'));
			}
			else {
				prevButton.setAttribute('tooltiptext', broadcaster.getAttribute('tooltiptext-link').replace(/%s/gi, (link.label || link.href).replace(/\s+/g, ' ')));
			}
		}

		if (rewindButton ||
			((!rewindButton || !rewindButton.hidden) && backButton && !backButton.hidden)) {
			if (!aFindLinks || !rf_shouldFindPrevLinks() ||
				(prevButton && !prevButton.hidden))
				link = null;
			else if (!link) {
				link = rewindforwardGetLinkInMainFrame(
					rewindforwardGetLinksFromAllFrames('prev')
				);
			}

			broadcaster = document.getElementById('Browser:Rewind');
			disabled    = broadcaster.hasAttribute('disabled');
			if (disabled == Boolean(link) || disabled == nav.canGoBack) {
				if (disabled || link || nav.canGoBack)
					broadcaster.removeAttribute('disabled');
				else
					broadcaster.setAttribute('disabled', true);
			}
			if (!link) {
				if (rewindButton) {
					rewindButton.setAttribute('label',       broadcaster.getAttribute('label-navigation'));
					rewindButton.setAttribute('tooltiptext', broadcaster.getAttribute(navigationTooltipAttr));
					rewindButton.setAttribute('mode', 'navigation');
				}
				broadcaster.setAttribute('mode', 'navigation');

				rewirdMenuItem.setAttribute('tooltiptext', rewirdMenuItem.getAttribute(navigationTooltipAttr));
				rewirdMenuItem = document.getElementById(rewirdMenuItem.id+'-clone');
				if (rewirdMenuItem)
					rewirdMenuItem.setAttribute('tooltiptext', rewirdMenuItem.getAttribute(navigationTooltipAttr));
			}
			else {
				if (rewindButton) {
					rewindButton.setAttribute('label',       broadcaster.getAttribute('label-link'));
					rewindButton.setAttribute('tooltiptext', broadcaster.getAttribute('tooltiptext-link').replace(/%s/gi, (link.label || link.href).replace(/\s+/g, ' ')));
					rewindButton.setAttribute('mode', 'link');
				}
				broadcaster.setAttribute('mode', 'link');
			}

			if (backButton) {
				backButton.removeAttribute('rewindforward-override');
				if (
					(rewindButton && !rewindButton.hidden) ||
					broadcaster.getAttribute('disabled') == 'true' ||
					(!link && gBrowser.sessionHistory.index <= 1)
					) {
					backButton.setAttribute('label',       backButton.getAttribute('rewindforward-original-label'));
					backButton.setAttribute('tooltiptext', backButton.getAttribute('rewindforward-original-tooltip'));
					if (nav.canGoBack)
						backButton.removeAttribute('disabled');
					else
						backButton.setAttribute('disabled', true);
				}
				else {
					if (!link) {
						backButton.setAttribute('label',       broadcaster.getAttribute('label-navigation'));
						backButton.setAttribute('tooltiptext', broadcaster.getAttribute(navigationTooltipAttr));
						backButton.setAttribute('rewindforward-override', 'navigation');
						backButton.removeAttribute('disabled');
					}
					else {
						backButton.setAttribute('label',       broadcaster.getAttribute('label-link'));
						backButton.setAttribute('tooltiptext', broadcaster.getAttribute('tooltiptext-link').replace(/%s/gi, (link.label || link.href).replace(/\s+/g, ' ')));
						backButton.setAttribute('rewindforward-override', 'link');
						backButton.removeAttribute('disabled');
					}
				}
			}
		}
	}


	var fastforwardButton   = document.getElementById('fastforward-button');
	var fastforwardMenuItem = document.getElementById('fastforwardMenuItem');
	var nextButton          = document.getElementById('fastforward-next-button');
	var forwardButton       = rf_shouldOverrideForwardButtons() ? document.getElementById('forward-button') : null ;
	if (fastforwardButton || nextButton || forwardButton) {
		link = rewindforwardGetLinkInMainFrame(
			rewindforwardGetLinksFromAllFrames('next')
		);
		if (forwardButton && !forwardButton.getAttribute('rewindforward-original-tooltip')) {
			forwardButton.setAttribute('rewindforward-original-tooltip', forwardButton.getAttribute('tooltiptext'));
			forwardButton.setAttribute('rewindforward-original-label',   forwardButton.getAttribute('label'));
		}

		if (nextButton && !nextButton.hidden) {
			broadcaster = document.getElementById('Browser:FastforwardNext');
			disabled    = broadcaster.hasAttribute('disabled');
			if (disabled == Boolean(link)) {
				if (disabled || link)
					broadcaster.removeAttribute('disabled');
				else
					broadcaster.setAttribute('disabled', true);
			}
			if (!link) {
				nextButton.setAttribute('tooltiptext', broadcaster.getAttribute('tooltiptext-link-blank'));
			}
			else {
				nextButton.setAttribute('tooltiptext', broadcaster.getAttribute('tooltiptext-link').replace(/%s/gi, (link.label || link.href).replace(/\s+/g, ' ')));
			}
		}

		if (fastforwardButton ||
			((!fastforwardButton || !fastforwardButton.hidden) && forwardButton && !forwardButton.hidden)) {
			if (!aFindLinks || !rf_shouldFindNextLinks() ||
				(nextButton && !nextButton.hidden))
				link = null;
			else if (!link) {
				link = rewindforwardGetLinkInMainFrame(
					rewindforwardGetLinksFromAllFrames('next')
				);
			}

			broadcaster = document.getElementById('Browser:Fastforward');
			disabled    = broadcaster.hasAttribute('disabled');
			if (disabled == Boolean(link) || disabled == nav.canGoForward) {
				if (disabled || link || nav.canGoForward)
					broadcaster.removeAttribute('disabled');
				else
					broadcaster.setAttribute('disabled', true);
			}
			if (!link) {
				if (fastforwardButton) {
					fastforwardButton.setAttribute('label',       broadcaster.getAttribute('label-navigation'));
					fastforwardButton.setAttribute('tooltiptext', broadcaster.getAttribute(navigationTooltipAttr));
					fastforwardButton.setAttribute('mode', 'navigation');
				}
				broadcaster.setAttribute('mode', 'navigation');

				fastforwardMenuItem.setAttribute('tooltiptext', fastforwardMenuItem.getAttribute(navigationTooltipAttr));
				fastforwardMenuItem = document.getElementById(fastforwardMenuItem.id+'-clone');
				if (fastforwardMenuItem)
					fastforwardMenuItem.setAttribute('tooltiptext', fastforwardMenuItem.getAttribute(navigationTooltipAttr));
			}
			else {
				if (fastforwardButton) {
					fastforwardButton.setAttribute('label',       broadcaster.getAttribute('label-link'));
					fastforwardButton.setAttribute('tooltiptext', broadcaster.getAttribute('tooltiptext-link').replace(/%s/gi, (link.label || link.href).replace(/\s+/g, ' ')));
					fastforwardButton.setAttribute('mode', 'link');
				}
				broadcaster.setAttribute('mode', 'link');
			}

			if (forwardButton) {
				forwardButton.removeAttribute('rewindforward-override');
				if (
					(fastforwardButton && !fastforwardButton.hidden) ||
					broadcaster.getAttribute('disabled') == 'true' ||
					(!link && gBrowser.sessionHistory.index >= gBrowser.sessionHistory.count-2)
					) {
					forwardButton.setAttribute('label',       forwardButton.getAttribute('rewindforward-original-label'));
					forwardButton.setAttribute('tooltiptext', forwardButton.getAttribute('rewindforward-original-tooltip'));
					if (nav.canGoForward)
						forwardButton.removeAttribute('disabled');
					else
						forwardButton.setAttribute('disabled', true);
				}
				else {
					if (!link) {
						forwardButton.setAttribute('label',       broadcaster.getAttribute('label-navigation'));
						forwardButton.setAttribute('tooltiptext', broadcaster.getAttribute(navigationTooltipAttr));
						forwardButton.setAttribute('rewindforward-override', 'navigation');
						forwardButton.removeAttribute('disabled');
					}
					else {
						forwardButton.setAttribute('label',       broadcaster.getAttribute('label-link'));
						forwardButton.setAttribute('tooltiptext', broadcaster.getAttribute('tooltiptext-link').replace(/%s/gi, (link.label || link.href).replace(/\s+/g, ' ')));
						forwardButton.setAttribute('rewindforward-override', 'link');
						forwardButton.removeAttribute('disabled');
					}
				}
			}
		}
	}
}
 
function rewindforwardFillPopupMenu(aEvent) 
{
	var popup = aEvent.target;
	var node  = document.getElementById(popup.getAttribute('ref-command'));
	return rewindforwardFillPopupMenuInternal(aEvent, node);
}
function rewindforwardFillPopupMenuInternal(aEvent, aCommandNode, aShowBackForwardCommand)
{
	var popup = aEvent.target;
	var node = aCommandNode;

	var showMenu = false;

	rewindforwardUpdateBackForwardPopup(popup, node);

	var isBackForwardMenu = (popup.firstChild.getAttribute('rewindforward-menuitem-backforward') == 'true');


	// fill up history items
	if (!isBackForwardMenu && !rf_shouldFillHistoryMenu()) {
		if (popup.lastChild.localName != 'menuseparator' && 'deleteHistoryItems' in window)
			deleteHistoryItems(popup);
	}
	else {
		showMenu = (node.id == 'Browser:Rewind') ?
				__rewindforward__BrowserBackMenu(aEvent) :
				__rewindforward__BrowserForwardMenu(aEvent) ;

		if (showMenu && (!isBackForwardMenu || aShowBackForwardCommand)) {
			var current,
				prev;
			for (var i = popup.childNodes.length-1; i > /*-1*/2; i--)
			{
				if (!popup.childNodes[i].getAttribute('index')) break;

				current = prev;
				prev = rewindforwardGetHistoryEntryAt(parseInt(popup.childNodes[i-1].getAttribute('index')));
				if (!current) continue;

				if (
					(!current.URI.host && prev.URI.host) ||
					(current.URI.host && !prev.URI.host) ||
					(current.URI.host != prev.URI.host)
					)
					popup.insertBefore(document.createElement('menuseparator'), popup.childNodes[i]).setAttribute('index', -1);
			}
		}
	}

	var nav = gBrowser.webNavigation;

	if (isBackForwardMenu) {
		if (aShowBackForwardCommand) {
			popup.childNodes[0].removeAttribute('hidden');
			popup.childNodes[1].removeAttribute('hidden');
			if (node.id == 'Browser:Rewind' ? !nav.canGoBack : !nav.canGoForward )
				popup.childNodes[0].setAttribute('disabled', true);
			else
				popup.childNodes[0].removeAttribute('disabled');
		}
		else {
			popup.childNodes[0].setAttribute('hidden', true);
			popup.childNodes[1].setAttribute('hidden', true);
		}
	}
	var offset = isBackForwardMenu ? 2 : 0 ;

	var linkButton = document.getElementById(node.id == 'Browser:Rewind' ? 'rewind-prev-button' : 'fastforward-next-button' );
	if (linkButton || node.getAttribute('mode') == 'navigation') {
		popup.childNodes[0+offset].setAttribute('hidden', true);
		popup.childNodes[1+offset].setAttribute('hidden', true);
	}
	else {
		popup.childNodes[0+offset].removeAttribute('hidden');
		if (!popup.childNodes[1+offset].nextSibling)
			popup.childNodes[1+offset].setAttribute('hidden', true);
		else
			popup.childNodes[1+offset].removeAttribute('hidden');

		if (
			node.hasAttribute('disabled') ||
			(node.id == 'Browser:Rewind' ? !nav.canGoBack : !nav.canGoForward )
			)
			popup.childNodes[0+offset].setAttribute('disabled', true);
		else
			popup.childNodes[0+offset].removeAttribute('disabled');

		showMenu = true;
	}

	return showMenu;
}
function rewindforwardUpdateBackForwardPopup(aPopup, aCommandNode)
{
	if (!aPopup.hasChildNodes() ||
		(aPopup.childNodes[0].getAttribute('rewindforward-menuitem') != 'true')) {

		aPopup.insertBefore(document.createElement('menuseparator'), aPopup.firstChild);
		var id   = aCommandNode.id == 'Browser:Rewind' ? 'rewindMenuItem' : 'fastforwardMenuItem';
		var item = document.getElementById(id).cloneNode(true);
		item.setAttribute('id', id+'-clone');
		aPopup.insertBefore(item, aPopup.firstChild);

		aPopup.insertBefore(document.createElement('menuseparator'), aPopup.firstChild);
		aPopup.insertBefore(document.createElement('menuitem'), aPopup.firstChild);
		aPopup.firstChild.setAttribute('label', document.getElementById(aCommandNode.id == 'Browser:Rewind' ? 'back-button' : 'forward-button').getAttribute('rewindforward-original-label'));
		aPopup.firstChild.setAttribute('rewindforward-menuitem', true);
		aPopup.firstChild.setAttribute('rewindforward-menuitem-backforward', true);
		aPopup.firstChild.setAttribute('class', 'menuitem-iconic');
		aPopup.firstChild.setAttribute('oncommand', '__rewindforward__Browser'+(aCommandNode.id == 'Browser:Rewind' ? 'Back' : 'Forward' )+'(event); event.stopPropagation(); this.parentNode.hidePopup();');
		aPopup.firstChild.setAttribute('onclick', 'if ("checkForMiddleClick" in window) { checkForMiddleClick(this, event); }; event.stopPropagation();');
	}
}
function rewindforwardNewBrowserBackMenu(aEvent)
{
	var button = document.getElementById('back-button');
	return rewindforwardFillPopupMenuInternal(aEvent, document.getElementById('Browser:Rewind'),
		button.getAttribute('rewindforward-override') ? true : false );
}
function rewindforwardNewBrowserForwardMenu(aEvent)
{
	var button = document.getElementById('forward-button');
	return rewindforwardFillPopupMenuInternal(aEvent, document.getElementById('Browser:Fastforward'),
		button.getAttribute('rewindforward-override') ? true : false );
}
  
// event listeners 
	
var gRewindforwardOnLoadObserver = { 
		observe : function(aSubject, aTopic, aData)
		{
			if (aTopic != 'EndDocumentLoad' &&
				aTopic != 'FailDocumentLoad')
				return;

			if (
				(rf_shouldFindPrevLinks() || rf_shouldFindNextLinks()) &&
				aSubject &&
				!('__rewindforward__event_handled' in aSubject)
				) {
				aSubject.__rewindforward__event_handled = true;

				aSubject.addEventListener('DOMAttrModified', rewindforwardMutationEventListener, true);
				aSubject.addEventListener('DOMSubtreeModified', rewindforwardMutationEventListener, true);
				aSubject.addEventListener('DOMNodeInserted', rewindforwardMutationEventListener, true);
				aSubject.addEventListener('DOMNodeInsertedIntoDocument', rewindforwardMutationEventListener, true);

				aSubject.addEventListener('unload', rewindforwardUnloadEventListener, false);
			}

			rewindforwardUpdateButtons(true);
		}
	};
 
function rewindforwardMutationEventListener(aEvent) 
{
	if (!rf_shouldFindPrevLinks() && !rf_shouldFindNextLinks()) return;

	const XHTMLNS = 'http://www.w3.org/1999/xhtml';
	const XLinkNS = 'http://www.w3.org/1999/xlink';

	var node;
	try {
		node = aEvent.originalTarget || aEvent.target;
	}
	catch(e) {
		node = aEvent.target;
	}

	var nodeWrapper = new XPCNativeWrapper(node,
			'nodeType',
			'getAttributeNS()',
			'getAttribute()'
		);

	if (
		nodeWrapper.nodeType == Node.ELEMENT_NODE &&
		rewindforwardGetNativeProperty(node, 'namespaceURI') == 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'
		)
		return;

	var rel = nodeWrapper.getAttributeNS(XLinkNS, 'rel') ||
			nodeWrapper.getAttributeNS(XHTMLNS, 'rel') ||
			nodeWrapper.getAttribute('rel') ||
			'';
	var rev = nodeWrapper.getAttributeNS(XLinkNS, 'rev') ||
			nodeWrapper.getAttributeNS(XHTMLNS, 'rev') ||
			nodeWrapper.getAttribute('rev') ||
			'';
	if (!rel && !rev) return;

	if (rel.match(/\b(next|prev)\b/) || rev.match(/\b(next|prev)\b/))
		rewindforwardUpdateButtons(true);
}
 
function rewindforwardUnloadEventListener(aEvent) 
{
	if (!aEvent.target) return;

	var doc = aEvent.target;
	var w   = 'document' in doc ? doc :
			rewindforwardGetDocShellFromDocument(rewindforwardGetNativeProperty(doc, 'ownerDocument') || doc)
			.QueryInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIDOMWindow);

	if (!w) return;

	document.getElementById('Browser:RewindPrev').setAttribute('disabled', true);
	document.getElementById('Browser:Rewind').setAttribute('disabled', true);
	document.getElementById('Browser:FastforwardNext').setAttribute('disabled', true);
	document.getElementById('Browser:Fastforward').setAttribute('disabled', true);

	w.removeEventListener('DOMAttrModified', w.rewindforwardMutationEventListener, true);
	w.removeEventListener('DOMSubtreeModified', w.rewindforwardMutationEventListener, true);
	w.removeEventListener('DOMNodeInserted', w.rewindforwardMutationEventListener, true);
	w.removeEventListener('DOMNodeInsertedIntoDocument', w.rewindforwardMutationEventListener, true);

	w.removeEventListener('unload', w.rewindforwardUnloadEventListener, false);
}
 
function rewindforwardOnKeyPressEventHandler(aEvent) 
{
	const node = aEvent.originalTarget || aEvent.target;
	if (!node || !isAvailableAutoGoNextPrevForRewindforward()) return;

	// ignore events from chrome windows
	var docShell = rewindforwardGetDocShellFromDocument(rewindforwardGetNativeProperty(node, 'ownerDocument'));
	if (docShell.itemType &&
		docShell.itemType != Components.interfaces.nsIDocShellTreeItem.typeContent)
		return;

	var nodeWrapper = new XPCNativeWrapper(node,
			'nodeType',
			'localName'
		);

	// ignore events sent from input fields
	if (nodeWrapper.nodeType != Node.ELEMENT_NODE) node= node.parentNode;
	if (
		!aEvent.ctrlKey &&
		!aEvent.altKey &&
		!aEvent.metaKey &&
		(
			/textbox|input|textarea|menulist|select/.test(nodeWrapper.localName.toLowerCase()) ||
			rewindforwardGetNativeProperty(rewindforwardGetNativeProperty(node, 'ownerDocument'), 'designMode') == 'on'
		)
		)
		return;

	var win = docShell
			.QueryInterface(Components.interfaces.nsIWebNavigation)
			.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
			.getInterface(Components.interfaces.nsIDOMWindow);

	const Y    = Components.lookupMethod(win, 'scrollY').call(win); // pageYOffset
	const maxY = Components.lookupMethod(win, 'scrollMaxY').call(win);

	// if we're not on top or bottom, do nothing
	if (Y > 5 && Y < maxY-5) return;


	// detect what key-combination is pressesd
	var keys = {
			next : getNextPageKeysForRewindforward(), // "next" links take precedence over "previous".
			prev : getPrevPageKeysForRewindforward()
		},
		keyPressed = false,
		modifierst,
		target,
		mainKey,
		i;
	for (target in keys)
	{
		keys[target] = (keys[target] || '').split('|');
		for (i in keys[target])
		{
			if (!keys[target][i]) continue;

			mainKey = keys[target][i].split(',')[0].toUpperCase();
			if (mainKey.length == 1) { // charCode
				if (
					(!aEvent.charCode && aEvent.keyCode) ||
					(String.fromCharCode(aEvent.charCode).toUpperCase() != mainKey)
					)
					continue;
			}
			else if (mainKey.indexOf('VK_') == 0) { // keyCode
				if (
					(aEvent.charCode && !aEvent.keyCode) ||
					(aEvent.keyCode != aEvent['DOM_'+mainKey])
					)
					continue;
			}
			else
				continue;

			modifiers = (keys[target][i] || '').toLowerCase();
			if (
				(/shift/.test(modifiers)   != aEvent.shiftKey) ||
				(/control/.test(modifiers) != aEvent.ctrlKey) ||
				(/alt/.test(modifiers)     != aEvent.altKey) ||
				(/meta/.test(modifiers)    != aEvent.metaKey)
				)
				continue;

			keyPressed = true;
			break;
		}
		if (keyPressed) break;
	}
	if (!keyPressed) return;


	if ((Y > 5 && target == 'prev') || (Y < maxY-5 && target == 'next'))
		return;

	var direction = (target == 'prev') ? -1 : 1 ;

	target = rewindforwardGetFirstLink(target);
	if (!target) return;

	const ioService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
	var href = (new XPCNativeWrapper(win, 'location')).location.href;
	var referrer = ioService.newURI( href, null, null);
	rewindforwardLoadLink(target.href, referrer, win, direction);
}
 
/* function rewindforwardOnFocusEventHandler(aEvent) 
{
	const target = aEvent.originalTarget || aEvent.target;
	if (!target) return;

	var win = 'document' in target ? win.document : null ;
	if (!win) {
		docShell = rewindforwardGetDocShellFromDocument(target.ownerDocument || target);
		win      = docShell
				.QueryInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIDOMWindow);
	}

	// ignore events from chrome windows
	var docShell = docShell ||
			win
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsIDocShellTreeItem);
	if (  (
		docshell.itemType &&
		docShell.itemType != Components.interfaces.nsIDocShellTreeItem.typeContent
		)||
		win.location.href == gLastFocusedPage
		)
		return;

	gLastFocusedPage = win.location.href;

	rewindforwardUpdateButtons(true);
}

var gLastFocusedPage = null;
*/
 
function rewindforwardGetDocShellFromDocument(aDocument, aRootDocShell) 
{
	var doc = aDocument;
	if (!doc) return null;

	doc = new XPCNativeWrapper(doc,
			'QueryInterface()',
			'defaultView'
		);

	const kDSTreeNode = Components.interfaces.nsIDocShellTreeNode;
	const kDSTreeItem = Components.interfaces.nsIDocShellTreeItem;
	const kWebNav     = Components.interfaces.nsIWebNavigation;

	if (doc.defaultView)
		return (new XPCNativeWrapper(doc.defaultView, 'QueryInterface()'))
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(kWebNav)
				.QueryInterface(Components.interfaces.nsIDocShell);

	var aRootDocShell = aRootDocShell
			.QueryInterface(kDSTreeNode)
			.QueryInterface(kDSTreeItem)
			.QueryInterface(kWebNav);
	var docShell = aRootDocShell;
	traceDocShellTree:
	do {
		if (docShell.document == aDocument)
			return docShell;

		if (docShell.childCount) {
			docShell = docShell.getChildAt(0);
			docShell = docShell
				.QueryInterface(kDSTreeNode)
				.QueryInterface(kWebNav);
		}
		else {
			parentDocShell = docShell.parent.QueryInterface(kDSTreeNode);
			while (docShell.childOffset == parentDocShell.childCount-1)
			{
				docShell = parentDocShell;
				if (docShell == aRootDocShell || !docShell.parent)
					break traceDocShellTree;
				parentDocShell = docShell.parent.QueryInterface(kDSTreeNode);
			}
			docShell = parentDocShell.getChildAt(docShell.childOffset+1)
				.QueryInterface(kDSTreeNode)
				.QueryInterface(kWebNav);
		}
	} while (docShell != aRootDocShell);

	return null;
}
 
function rewindforwardGetNativeProperty(aNode, aPropName) 
{
	try {
		var wrapper = new XPCNativeWrapper(aNode, aPropName);
		return wrapper[aPropName];
	}
	catch(e) {
	}
	return void(0);
}
  
// prefs 
	
function rewindforwardLoadDefaultPrefs() 
{
	const ioService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
	const uri = ioService.newURI('chrome://rewindforward/content/default.js', null, null);
	var content;
	try {
		var channel = ioService.newChannelFromURI(uri);
		var stream  = channel.open();

		var scriptableStream = Components.classes['@mozilla.org/scriptableinputstream;1'].createInstance(Components.interfaces.nsIScriptableInputStream);
		scriptableStream.init(stream);

		content = scriptableStream.read(scriptableStream.available());

		scriptableStream.close();
		stream.close();
	}
	catch(e) {
	}

	if (!content) return;


	const DEFPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getDefaultBranch(null);
	function pref(aPrefstring, aValue)
	{
		rewindforwardSetPref(aPrefstring, aValue, DEFPrefs);
	}
	var user_pref = pref; // alias

	eval(content);
}
 
function rewindforwardGetPref(aPrefstring, aDefault, aPrefBranch) 
{
	const branch = aPrefBranch || Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch);

	const knsISupportsString = ('nsISupportsWString' in Components.interfaces) ? Components.interfaces.nsISupportsWString : Components.interfaces.nsISupportsString;
	try {
		switch (branch.getPrefType(aPrefstring))
		{
			case branch.PREF_STRING:
				return branch.getComplexValue(aPrefstring, knsISupportsString).data;
				break;
			case branch.PREF_INT:
				return branch.getIntPref(aPrefstring);
				break;
			default:
				return branch.getBoolPref(aPrefstring);
				break;
		}
	}
	catch(e) {
	}

	return (aDefault === void(0)) ? null : aDefault ;
}
 
function rewindforwardSetPref(aPrefstring, aValue, aPrefBranch) 
{
	const branch = aPrefBranch || Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch);

	switch (typeof aValue)
	{
		case 'string':
			const knsISupportsString = ('nsISupportsWString' in Components.interfaces) ? Components.interfaces.nsISupportsWString : Components.interfaces.nsISupportsString;
			var string = ('@mozilla.org/supports-wstring;1' in Components.classes) ?
					Components.classes['@mozilla.org/supports-wstring;1'].createInstance(this.knsISupportsString) :
					Components.classes['@mozilla.org/supports-string;1'].createInstance(knsISupportsString) ;
			string.data = aValue;
			branch.setComplexValue(aPrefstring, knsISupportsString, string);
			break;
		case 'number':
			branch.setIntPref(aPrefstring, parseInt(aValue));
			break;
		default:
			branch.setBoolPref(aPrefstring, aValue);
			break;
	}
}
 
function rf_shouldFindNextLinks() 
{
	return rewindforwardGetPref('rewindforward.find_next_links', true);
};

function rf_shouldFindPrevLinks()
{
	return rewindforwardGetPref('rewindforward.find_prev_links', false);
};

function rf_shouldUseVirtualLinks()
{
	return rewindforwardGetPref('rewindforward.virtual_link.enabled', true);
};

function rf_shouldFillHistoryMenu()
{
	return rewindforwardGetPref('rewindforward.fill_history_menu', true);
};

function rf_shouldOverrideBackButtons()
{
	return rewindforwardGetPref('rewindforward.override_button.back', true);
};
function rf_shouldOverrideForwardButtons()
{
	return rewindforwardGetPref('rewindforward.override_button.forward', true);
};



function getNextPageKeysForRewindforward()
{
	return rewindforwardGetPref('rewindforward.gonextprev.next.keys', ' |VK_PAGE_DOWN');
};

function getPrevPageKeysForRewindforward()
{
	return rewindforwardGetPref('rewindforward.gonextprev.prev.keys', ' ,shift|VK_PAGE_UP');
};

function isAvailableAutoGoNextPrevForRewindforward()
{
	return rewindforwardGetPref('rewindforward.gonextprev.enabled', true);
};
  
// initialize 
var gRewindforwardInitialized = false;
	
function rewindforwardInit() 
{
	if (gRewindforwardInitialized) return;
	gRewindforwardInitialized = true;

	rewindforwardLoadDefaultPrefs();

	window.__rewindforward__UpdateBackForwardButtons = window.UpdateBackForwardButtons;
	window.UpdateBackForwardButtons = function()
	{
		__rewindforward__UpdateBackForwardButtons();
		rewindforwardUpdateButtons(
			(
				document.getElementById('Browser:Stop') ||
				document.getElementById('canStop') || // for Mozilla Suite
				document.getElementById('menuitem-stop') // for Mozilla Suite
			).hasAttribute('disabled')
		);
	};

	window.__rewindforward__BrowserBack = window.BrowserBack;
	window.BrowserBack = window.rewindforwardNewBrowserBack;
	window.__rewindforward__BrowserForward = window.BrowserForward;
	window.BrowserForward = window.rewindforwardNewBrowserForward;

	window.__rewindforward__BrowserBackMenu = window.BrowserBackMenu;
	window.BrowserBackMenu = window.rewindforwardNewBrowserBackMenu;
	window.__rewindforward__BrowserForwardMenu = window.BrowserForwardMenu;
	window.BrowserForwardMenu = window.rewindforwardNewBrowserForwardMenu;



	const observerService = Components.classes['@mozilla.org/observer-service;1']
						.getService(Components.interfaces.nsIObserverService);
	observerService.addObserver(gRewindforwardOnLoadObserver, 'EndDocumentLoad', false);
	observerService.addObserver(gRewindforwardOnLoadObserver, 'FailDocumentLoad', false);

	window.addEventListener('keypress', rewindforwardOnKeyPressEventHandler, true);

	window.addEventListener('unload', rewindforwardDestruct, false);

//	gBrowser.addEventListener('focus', rewindforwardOnFocusEventHandler, true);

	if (rewindforwardGetPref('rewindforward.use_another_icons'))
		document.documentElement.setAttribute('rewindforward-anothericon', true);
	else
		document.documentElement.removeAttribute('rewindforward-anothericon');

	rewindforwardInitialShow();
}
	
function rewindforwardInitialShow() 
{
	// show custom buttons only in the initial startup
	const PREFROOT = 'extensions.{FA4658DE-935B-4f39-AED3-0B5034DDE225}';
	var bar = document.getElementById('nav-bar');
	if (bar && bar.currentSet) {

		var STRBUNDLE = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService);
		var msg = STRBUNDLE.createBundle('chrome://rewindforward/locale/rewindforward.properties');

		var PromptService = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);


		var currentset = bar.currentSet;
		var buttons = currentset.replace(/__empty/, '').split(',');

		if (!rewindforwardGetPref(PREFROOT+'.initialshow.rewind-button')) {
			if (currentset.indexOf('rewind-button') < 0) {
				if (currentset.indexOf('back-button') < 0)
					buttons.push('rewind-button');
				else {
					currentset = currentset.replace(/back-button/, 'rewind-button,back-button');
					buttons = currentset.split(',');
				}
			}
			rewindforwardSetPref(PREFROOT+'.initialshow.rewind-button', true);
		}
		if (!rewindforwardGetPref(PREFROOT+'.initialshow.fastforward-button')) {
			if (currentset.indexOf('fastforward-button') < 0) {
				if (currentset.indexOf('back-button') < 0)
					buttons.push('fastforward-button');
				else {
					currentset = currentset.replace(/forward-button/, 'forward-button,fastforward-button');
					buttons = currentset.split(',');
				}
			}
			rewindforwardSetPref(PREFROOT+'.initialshow.fastforward-button', true);
		}
		currentset = bar.currentSet.replace(/__empty/, '');
		var newset = buttons.join(',');
		if (currentset != newset &&
			PromptService.confirmEx(
				window,
				msg.GetStringFromName('initialshow_confirm_title'),
				msg.GetStringFromName('initialshow_confirm_text'),
				(PromptService.BUTTON_TITLE_YES * PromptService.BUTTON_POS_0) +
				(PromptService.BUTTON_TITLE_NO  * PromptService.BUTTON_POS_1),
				null, null, null, null, {}
			) == 0) {
			bar.currentSet = newset;
			bar.setAttribute('currentset', newset);
				document.persist(bar.id, 'currentset');
		}
		if ('BrowserToolboxCustomizeDone' in window)
			window.setTimeout('BrowserToolboxCustomizeDone(true);', 0);
	}
}
  
function rewindforwardDestruct() 
{
	const observerService = Components.classes['@mozilla.org/observer-service;1']
						.getService(Components.interfaces.nsIObserverService);
	observerService.removeObserver(gRewindforwardOnLoadObserver, 'EndDocumentLoad', false);
	observerService.removeObserver(gRewindforwardOnLoadObserver, 'FailDocumentLoad', false);

	window.removeEventListener('keypress', rewindforwardOnKeyPressEventHandler, true);

//	gBrowser.removeEventListener('focus', rewindforwardOnFocusEventHandler, true);

	window.removeEventListener('load', rewindforwardInit, false);
//	window.removeEventListener('unload', rewindforwardDestruct, false);
}
 
window.addEventListener('load', rewindforwardInit, false); 
window.addEventListener('load', rewindforwardInit, false); // failsafe
  
