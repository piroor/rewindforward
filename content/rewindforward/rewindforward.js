var RewindForwardService = { 
	initialized : false,
	
	// constant properties 
	
	kFOUND_PREFIX   : 'rewindforward-found-first-links-', 
	kRELATED_PREFIX : 'rewindforward-found-related-links-',
	kLABELED_PREFIX : 'rewindforward-found-labeled-links-',
	kVIRTUAL_PREFIX : 'rewindforward-found-virtual-links-',

	kGENERATED_ID_PREFIX : 'rewindforward-found-link-',

	domainRegExp : /^\w+:\/\/([^:\/]+)(\/|$)/,
	gonextprevExceptions : /[^\w\W]/,

	NSResolver : {
		lookupNamespaceURI : function(aPrefix)
		{
			switch (aPrefix)
			{
				case 'xul':
					return 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
				case 'html':
				case 'xhtml':
					return 'http://www.w3.org/1999/xhtml';
				case 'xlink':
					return 'http://www.w3.org/1999/xlink';
				default:
					return '';
			}
		}
	},
 
	// type 
	kLINK_TYPE_RELATED : 1,
	kLINK_TYPE_LABELED : 2,
	kLINK_TYPE_VIRTUAL : 4,
 
	// rate 
	kLINK_RELATED        : 10,
	kLINK_RELATED_CUSTOM : 20,
	kLINK_LABELED        : 2,
	kLINK_INCREMENTED    : 1,
	kLINK_SAME_DOMAIN    : 1,
  
	// utils 
	
	evaluateXPath : function(aExpression, aContext, aType) 
	{
		if (!aType) aType = XPathResult.ORDERED_NODE_SNAPSHOT_TYPE;
		try {
			var xpathResult = (aContext ? (aContext.ownerDocument || aContext) : document).evaluate(
					aExpression,
					aContext,
					this.NSResolver,
					aType,
					null
				);
		}
		catch(e) {
			return {
				singleNodeValue : null,
				snapshotLength  : 0,
				snapshotItem    : function() {
					return null
				}
			};
		}
		return xpathResult;
	},
 
	getEventTargetId : function(aEvent) 
	{
		if (aEvent.sourceEvent) aEvent = aEvent.sourceEvent;
		var node = aEvent.originalTarget || aEvent.target;
		return this.evaluateXPath(
				'ancestor::*[@id][1]/attribute::id',
				node,
				XPathResult.STRING_TYPE
			).stringValue;
	},
 
	getDocShellFromDocument : function(aDocument) 
	{
		var doc = aDocument;
		if (!doc) return null;

		if (doc.defaultView)
			return doc.defaultView
					.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(Components.interfaces.nsIWebNavigation)
					.QueryInterface(Components.interfaces.nsIDocShell);

		return null;
	},
 
	getLinkProperty : function(aNode, aProp) 
	{
		if (aNode.nodeType != Node.ELEMENT_NODE)
			aNode = aNode.parentNode;

		return aNode[aProp] ||
				aNode.getAttributeNS('http://www.w3.org/1999/xlink', aProp) ||
				aNode.getAttributeNS('http://www.w3.org/1999/xhtml', aProp) ||
				aNode.getAttribute(aProp) ||
				'';
	},
 
	getHistoryEntryAt : function(aIndex) 
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
	},
 
	openNewTab : function(aURI, aReferrer) 
	{
		var tab = ('TabbrowserService' in window) ? gBrowser.addTabInternal(aURI, aReferrer, { parentTab : gBrowser.selectedTab.tabId }) : gBrowser.addTab(aURI, aReferrer) ;

		var loadInBackground = this.getPref('browser.tabs.loadInBackground');
		if (aEvent.shiftKey) loadInBackground = !loadInBackground;

		if (loadInBackground) gBrowser.selectedTab = tab;

		if (aEvent.target.localName == 'menuitem')
			aEvent.target.parentNode.hidePopup();
	},
 
	loadLink : function(aURI, aReferrer, aWindow, aHistoryDirection) 
	{
		var win = aWindow || document.commandDispatcher.focusedWindow;
		if (win == window) return;

		var docShell = win
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
				var entry = this.getHistoryEntryAt(index);
				if (entry.URI.spec == aURI) {
					gBrowser.webNavigation.gotoIndex(index);
					return;
				}
			}
		}

		docShell.loadURI(aURI, docShell.LOAD_FLAGS_IS_LINK , aReferrer, null, null);
	},
  
	// do rewind/fastforward 
	
	goRewind : function(aForceToRewind, aEvent) 
	{
		this.rewindOrFastforward('rewind', aForceToRewind, aEvent);
	},
 
	goPrevious : function(aEvent) 
	{
		if (aEvent && aEvent.type == 'click' && aEvent.button != 1) return;

		var link = this.getLinkInMainFrame(
				this.getLinksFromAllFrames('prev')
			);
		if (!link) return;

		var usetab = aEvent && aEvent.button == 1;

		if ('referrerBlocked' in gBrowser.selectedTab && gBrowser.selectedTab.referrerBlocked)
			link.referrer = null;

		if (usetab)
			this.openNewTab(link.href, link.referrer);
		else
			this.loadLink(link.href, link.referrer, link.view, -1);
	},
 
	goFastforward : function(aForceToFastforward, aEvent) 
	{
		this.rewindOrFastforward('fastforward', aForceToFastforward, aEvent);
	},
 
	goNext : function(aEvent) 
	{
		if (aEvent && aEvent.type == 'click' && aEvent.button != 1) return;

		var link = this.getLinkInMainFrame(
				this.getLinksFromAllFrames('next')
			);
		if (!link) return;

		var usetab = aEvent && aEvent.button == 1;

		if ('referrerBlocked' in gBrowser.selectedTab && gBrowser.selectedTab.referrerBlocked)
			link.referrer = null;

		if (usetab)
			this.openNewTab(link.href, link.referrer);
		else
			this.loadLink(link.href, link.referrer, link.view, 1);
	},
 
	rewindOrFastforward : function(aType, aForce, aEvent) 
	{
		if (aEvent && aEvent.type == 'click' && aEvent.button != 1) return;

		var usetab = aEvent && aEvent.button == 1;


		var link = (aType == 'rewind') ?
					(
						this.shouldFindPrevLinks ?
							this.getLinksFromAllFrames('prev') :
							null
					) :
					(
						this.shouldFindNextLinks ?
							this.getLinksFromAllFrames('next') :
							null
					);

		if (!aForce && link && link.length) {
			link = this.getLinkInMainFrame(link);

			if ('referrerBlocked' in gBrowser.selectedTab && gBrowser.selectedTab.referrerBlocked)
				link.referrer = null;

			if (usetab)
				this.openNewTab(link.href, link.referrer);
			else
				this.loadLink(link.href, link.referrer, link.view, (aType == 'rewind' ? -1 : 1 ));

			return;
		}


		var SH      = gBrowser.sessionHistory;
		var current = this.getHistoryEntryAt(SH.index);
		var c_host  = this.domainRegExp.test(current.URI.spec) ? RegExp.$1 : null ;

		var check = (aType == 'rewind') ? function(aIndex) { return aIndex > -1 } : function(aIndex) { return aIndex < SH.count }
		var step  = (aType == 'rewind') ? -1 : 1 ;
		var start = (aType == 'rewind') ? SH.index-1 : SH.index+1 ;

		var entry,
			t_host;
		for (var i = start; check(i); i += step)
		{
			entry  = this.getHistoryEntryAt(i);
			t_host = this.domainRegExp.test(entry.URI.spec) ? RegExp.$1 : null ;
			if ((c_host && !t_host) || (!c_host && t_host) || (c_host != t_host)) {

				if (this.getPref('rewindforward.goToEndPointOfCurrentDomain')) {
					if (i == start) {
						c_host = t_host;
						continue;
					}
					i -= step;
				}

				if (usetab)
					this.openNewTab(entry.URI.spec, entry.referrerURI);
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
			this.openNewTab(entry.URI.spec, entry.referrerURI);
		else
			gBrowser.webNavigation.gotoIndex((aType == 'rewind') ? 0 : SH.count-1 );
	},
  
	// get next/prev link 
	
	// collect "next" and "previous" links from all frames 
	getLinksFromAllFrames : function(aType)
	{
		return this.getLinksFromAllFramesInternal(
			[gBrowser.contentWindow],
			aType
		);
	},
	
	getLinksFromAllFramesInternal : function(aFrames, aType) 
	{
		var frames;
		var link;
		var links = [];
		var foundLinks;
		for (var i = 0; i < aFrames.length; i++)
		{
			link = this.getFirstLink(aType, aFrames[i]);
			if (link) {
				links.push(link);
			}

			try {
				if (!aFrames[i].frames) continue;

				foundLinks = this.getLinksFromAllFramesInternal(aFrames[i].frames, aType);
				if (foundLinks && foundLinks.length)
					links = links.concat(foundLinks);
			}
			catch(e) {
			}
		}

		return links;
	},
  
	// find "next" and "previous" link in a window 
	getFirstLink : function(aType, aWindow)
	{
		var w = aWindow || document.commandDispatcher.focusedWindow;
		if (!w || w.top != gBrowser.contentWindow)
			w = gBrowser.contentWindow;

		var d = w.document;
		if (!d.documentElement) return null;

		var lastCount = d.getElementsByTagName('*').length;
		var referrer = Components.classes['@mozilla.org/network/io-service;1']
						.getService(Components.interfaces.nsIIOService)
						.newURI(w.location.href, null, null);

		var lastResult = d.documentElement.getAttribute(this.kFOUND_PREFIX + aType);
		if (lastResult &&
			d.documentElement.getAttribute(this.kFOUND_PREFIX + aType+'LastCount') == lastCount) {
			lastResult = eval(lastResult);
			lastResult.referrer = referrer;
			lastResult.view = w;
			return lastResult;
		}

		var domain = this.domainRegExp.test(w.location.href) ? RegExp.$1 : null ;
		var result      = {};
		var resultArray = [];
		var links = this.getRelatedLinks(aType, aWindow);
		if (this.getPref('rewindforward.related.use.label'))
			links = links.concat(this.getLabeledLinks(aType, aWindow));
		if (this.getPref('rewindforward.related.virtual_link.enabled'))
			links.push(this.getVirtualLink(aType, aWindow));

		links = links.filter(function(aLink) {
			return aLink ? true : false ;
		});

		var uri;
		for (var i in links)
		{
			if (links[i].href == w.location.href) continue;

			uri = links[i].href;
			if (!(uri in result)) {
				result[uri] = links[i];
				links[i].index = resultArray.length-1;
				if (this.domainRegExp.test(uri) && RegExp.$1 == domain)
					result[uri].level = (result[uri].level || 0) + this.kLINK_SAME_DOMAIN;
				resultArray.push(result[uri]);
			}
			else if (!(result[uri].type & links[i].type)) {
				result[uri].level = (result[uri].level || 0) + links[i].level;
				result[uri].type  = (result[uri].type || 0)  + links[i].type;
			}
		}

		resultArray.sort(function(aA, aB) {
			return aB.level - aA.level;
		});

		if (resultArray.length) {
			d.documentElement.setAttribute(this.kFOUND_PREFIX + aType, resultArray[0].toSource());
			d.documentElement.setAttribute(this.kFOUND_PREFIX + aType+'LastCount', lastCount);

			resultArray[0].referrer = referrer;
			resultArray[0].view = w;

			return resultArray[0];
		}

		return null;
	},
	
	getRelatedLinks : function(aType, aWindow) 
	{
		var w = aWindow || document.commandDispatcher.focusedWindow;
		if (!w || w.top != gBrowser.contentWindow)
			w = gBrowser.contentWindow;

		var d = w.document;
		var lastCount = d.getElementsByTagName('*').length;

		// use cache
		var lastResult = d.documentElement.getAttribute(this.kRELATED_PREFIX + aType);
		if (lastResult &&
			d.documentElement.getAttribute(this.kRELATED_PREFIX + aType+'LastCount') == lastCount) {
			lastResult = eval(lastResult);
			return lastResult;
		}

		const rel = aType;
		const rev = (rel == 'next') ? 'prev' : 'next' ;

		var rate = this.kLINK_RELATED;

		var customRule;
		if (this.getPref('rewindforward.related.use.siteInfo'))
			customRule = this.getCustomRuleFromSiteInfo(w.location.href, rel);
		if ((!customRule || !customRule.rule) &&
			this.getPref('rewindforward.related.use.customRules'))
			customRule = this.getCustomRule(w.location.href, rel);

		// find "next" or "prev" link with XPath
		var xpath;
		if (customRule && customRule.rule) {
			xpath = customRule.rule;
			rate = customRule.rate;
		}
		else {
			xpath = ['(descendant::A | descendant::xhtml:a | descendant::AREA | descendant::xhtml:area | descendant::LINK | descendant::xhtml:link | (descendant::A | descendant::xhtml:a | descendant::AREA | descendant::xhtml:area | descendant::LINK | descendant::xhtml:link)/descendant::*)[not(local-name() = "style" or local-name() = "STYLE" or local-name() = "script" or local-name() = "SCRIPT") and contains(concat(" ", @rel, " "), " ', rel, ' ")]'].join('');
		}
	//dump('XPATH: '+xpath+'\n');
		var links = this.getLinksFromXPath(xpath, d, rate, this.kLINK_TYPE_RELATED);

		// find reverse links
		if (!customRule && !links.length) {
			xpath = ['descendant::*[not(local-name() = "style" or local-name() = "STYLE" or local-name() = "script" or local-name() = "SCRIPT") and contains(concat(" ", @rev, " "), " ', rev, ' ")]'].join('');
			links = this.getLinksFromXPath(xpath, d, this.kLINK_RELATED);
		}


	//dump('FOUND RELATED LINKS: '+links.length+'\n')
		d.documentElement.setAttribute(this.kRELATED_PREFIX + aType, links.toSource());
		d.documentElement.setAttribute(this.kRELATED_PREFIX + aType+'LastCount', lastCount);

		return links;
	},
	getCustomRule : function(aURI, aRelation)
	{
		var customRule;
		var rel = aRelation;
		var result = {
				rule : '',
				rate : 0
			};
		var domain = this.domainRegExp.test(aURI) ? RegExp.$1 : null ;
		if (!domain) return result;

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
				const offset = this.getPref('rewindforward.rule.'+rel+'.*') ? 1 : 0 ;
				const customRuleEntry = list[pos+offset];
//dump('found entry: '+customRuleEntry+'\n');
				customRule = this.getPref('rewindforward.rule.'+rel+'.'+customRuleEntry);
			}
		}
		if (!customRule) {
			customRule = this.getPref('rewindforward.rule.'+rel+'.*');
			result.rate = this.kLINK_RELATED;
		}
		else {
			result.rate = this.kLINK_RELATED_CUSTOM;
		}

		result.rule = customRule;
		return result;
	},
	getCustomRuleFromSiteInfo : function(aURI, aRelation)
	{
		var rel = aRelation;
		var result = {
				rule : '',
				rate : 0
			};

		var matchingResult;
		var pos;
		var regexp = new RegExp();
		var rule;

		for (var i in this.siteInfo)
		{
			if (!this.siteInfo[i].urls) continue;

			if (!this.siteInfo[i].urlsRule)
				this.siteInfo[i].urlsRule = new RegExp('^('+(this.siteInfo[i].urls.join(')|^(') || '[^\s\w]')+')');

			if (!this.siteInfo[i].urlsRule.test(aURI || ''))
				continue;

			// we have to find rule from last because the last rule of duplicated rules should be applied.
			findRule:
			for (var j = this.siteInfo[i].urls.length-1; j > -1; j--)
			{
				if (!regexp.compile(this.siteInfo[i].urls[j]).test(aURI))
					continue;

				rule = this.siteInfo[i].rules[this.siteInfo[i].urls[j]][rel+'Link'];
				if (rule) {
					result.rule = (result.rule ? result.rule+'|' : '' ) + rule;
					result.rate = this.kLINK_RELATED_CUSTOM;
					break findRule;
				}
			}

/*
			matchingResult.shift();
			matchingResult = ['[', matchingResult.join(']['), ']'].join('')
								.replace(/\[(undefined)?\]/g, '/')
								.replace(/\[|\]/g, '');
dump('result: '+matchingResult+'\n')
			pos = matchingResult.indexOf(aURI);
dump('found at '+pos+'\n');
			if (pos > -1) {
dump('found entry: '+this.siteInfo[i].urls[pos]+'\n');
				result.rule = this.siteInfo[i].rules[this.siteInfo[i].urls[pos]].nextLink;
				result.rate = this.kLINK_RELATED_CUSTOM;
				break;
			}
*/
		}
		return result;
	},
 
	getLabeledLinks : function(aType, aWindow) 
	{
		var w = aWindow || document.commandDispatcher.focusedWindow;
		if (!w || w.top != gBrowser.contentWindow)
			w = gBrowser.contentWindow;

		var d = w.document;
		var lastCount = d.getElementsByTagName('*').length;

		// use cache
		var lastResult = d.documentElement.getAttribute(this.kLABELED_PREFIX + aType);
		if (lastResult &&
			d.documentElement.getAttribute(this.kLABELED_PREFIX + aType+'LastCount') == lastCount) {
			lastResult = eval(lastResult);
			return lastResult;
		}

		const rel = aType;

		var links = [];

		var xpath;
		xpath = ['(descendant::A | descendant::xhtml:a | descendant::AREA | descendant::xhtml:area | descendant::LINK | descendant::xhtml:link | (descendant::A | descendant::xhtml:a | descendant::AREA | descendant::xhtml:area | descendant::LINK | descendant::xhtml:link)/descendant::*)[not(local-name() = "style" or local-name() = "STYLE" or local-name() = "script" or local-name() = "SCRIPT")'];

		var positivePatterns = [];

		var matchingPatterns = this.getPref('rewindforward.matchingPatterns.'+rel);
		if (matchingPatterns) {
			positivePatterns = matchingPatterns.split('|');
			xpath.push(' and contains(concat(@alt, " ", @title, " ", @src, " ", text()), "');
			xpath.push(matchingPatterns.replace(/\|/g, '") or contains(concat(@alt, " ", @title, " ", @src, " ", text()), "'));
			xpath.push('")');
		}

		matchingPatterns = this.getPref('rewindforward.matchingPatterns.'+rel+'.blacklist');
		if (matchingPatterns) {
			xpath.push(' and not(contains(concat(@alt, " ", @title, " ", @src, " ", text()), "');
			xpath.push(matchingPatterns.replace(/\|/g, '") or contains(concat(@alt, " ", @title, " ", @src, " ", text()), "'));
			xpath.push('"))');
		}


		xpath.push(']');
		xpath = xpath.join('');

		links = this.getLinksFromXPath(xpath, d, this.kLINK_LABELED, this.kLINK_TYPE_LABELED);

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

		d.documentElement.setAttribute(this.kLABELED_PREFIX + aType, links.toSource());
		d.documentElement.setAttribute(this.kLABELED_PREFIX + aType+'LastCount', lastCount);

		return links;
	},
 
	getLinksFromXPath : function(aXPath, aXMLDocument, aLevel, aType) 
	{
		var links = [];
		var result;
		try {
			result = this.evaluateXPath(aXPath, aXMLDocument);
		}
		catch(e) {
			dump('this.getLinksFromXPath >>>>>> ERROR <<<<<<<\n'+e+'\n');
			return links;
		}

		var link;
		var node;
		for (var i = 0, maxi = result.snapshotLength; i < maxi; i++)
		{
			node = result.snapshotItem(i);

			if (node.nodeType != Node.ELEMENT_NODE)
				node = node.parentNode;
			while (
				node &&
				!/^(a|area|link)$/.test((node.localName || '').toLowerCase()) &&
				node.parentNode
				)
				node = node.parentNode;

			if (node.nodeType != Node.ELEMENT_NODE)
				continue;

			link = {
					level : aLevel,
					label : (this.getLinkProperty(node, 'title') || node.textContent),
					href  : this.getLinkProperty(node, 'href'),
					type  : (aType || 0)
				};

			if (link.href) links.push(link);
		}

		return links;
	},
 
	getVirtualLink : function(aType, aWindow) 
	{
		var w = aWindow || document.commandDispatcher.focusedWindow;
		if (!w || w.top != gBrowser.contentWindow)
			w = gBrowser.contentWindow;

		var d = w.document;
		var lastCount = d.getElementsByTagName('*').length;

		// use cache
		var lastResult = d.documentElement.getAttribute(this.kVIRTUAL_PREFIX + aType);
		if (lastResult &&
			d.documentElement.getAttribute(this.kVIRTUAL_PREFIX + aType+'LastCount') == lastCount) {
			lastResult = eval(lastResult);
			return lastResult.href ? lastResult : null ;
		}

		var link = {
				level   : this.kLINK_INCREMENTED,
				href    : this.incrementPageURI(
					aType == 'next' ? 1 : -1 ,
					w.location.href
				),
				virtual : true,
				type    : this.kLINK_TYPE_VIRTUAL
			};

		d.documentElement.setAttribute(this.kVIRTUAL_PREFIX + aType, link.toSource());
		d.documentElement.setAttribute(this.kVIRTUAL_PREFIX + aType+'LastCount', lastCount);

		return link.href ? link : null ;
	},
	
	incrementPageURI : function(aCount, aURI) 
	{
		var res = aURI.match(/^\w+:\/\/[^\/]+\/([^0-9]*|.+[0-9]+[^0-9]+)([0-9]+)([^0-9]*)$/);
		if (!res || !res[2]) return null;

		var prefix = res[1];
		var num    = res[2];
		var suffix = res[3];
		if (suffix && !/^[.\/]/.test(suffix)) return null;

		var newNum = String(Number(num.replace(/^0+/, ''))+aCount);
		while (newNum.length < num.length)
			newNum = '0' + newNum;

		var newURI = [
				aURI.substring(0, aURI.lastIndexOf(prefix)+prefix.length),
				newNum,
				aURI.substring(aURI.lastIndexOf(prefix)+prefix.length+num.length, aURI.length)
			].join('');

		return newURI;
	},
   
	// get the link in the most largest frame, from an array of links 
	getLinkInMainFrame : function(aLinks)
	{
		if (!aLinks || !aLinks.length) return null;

		var link = null;
		var lastSize = 0;
		var newSize;
		for (var i in aLinks)
		{
			newSize = aLinks[i].view.innerWidth * aLinks[i].view.innerHeight;
			if (newSize <= lastSize) continue;

			lastSize = newSize;
			link = aLinks[i];
		}

		return link;
	},
  
// update UI 
	
	updateButtons : function(aFindLinks) 
	{
		var frames = gBrowser.contentWindow.frames;
		if (frames.length) {
			if (!this.checkSubFramesAreCompletelyLoaded(frames)) {
				window.setTimeout(this.delayedUpdateButtons, 10, aFindLinks, this);
				return;
			}
		}

		this.updateButton({
			base        : document.getElementById('back-button'),
			navigation  : document.getElementById('rewind-button'),
			link        : document.getElementById('rewind-prev-button'),
			menuItem    : document.getElementById('rewindMenuItem'),
			linkBroadcaster : document.getElementById('Browser:RewindPrev'),
			navigationBroadcaster : document.getElementById('Browser:Rewind'),
			type        : 'prev',
			canMove     : gBrowser.webNavigation.canGoBack,
			canSkip     : gBrowser.sessionHistory.index > 1,
			canOverride : this.getPref('rewindforward.override_button.back'),
			findLinks   : aFindLinks && this.shouldFindPrevLinks
		});
		this.updateButton({
			base        : document.getElementById('forward-button'),
			navigation  : document.getElementById('fastforward-button'),
			link        : document.getElementById('fastforward-next-button'),
			menuItem    : document.getElementById('fastforwardMenuItem'),
			linkBroadcaster : document.getElementById('Browser:FastforwardNext'),
			navigationBroadcaster : document.getElementById('Browser:Fastforward'),
			type        : 'next',
			canMove     : gBrowser.webNavigation.canGoForward,
			canSkip     : gBrowser.sessionHistory.count - gBrowser.sessionHistory.index > 2,
			canOverride : this.getPref('rewindforward.override_button.forward'),
			findLinks   : aFindLinks && this.shouldFindNextLinks
		});
	},
	
	updateButton : function(aInfo) 
	{
		var disabled;
		var toEndPoint = this.getPref('rewindforward.goToEndPointOfCurrentDomain');
		var navigationTooltipAttr = toEndPoint ? 'tooltiptext-navigation-toEndPoint' : 'tooltiptext-navigation' ;

		if (!aInfo.navigation && !aInfo.link && !aInfo.base) return;

		if (aInfo.base &&
			!aInfo.base.getAttribute('rewindforward-original-tooltip')) {
			aInfo.base.setAttribute('rewindforward-original-tooltip',
				aInfo.base.getAttribute('tooltiptext'));
			aInfo.base.setAttribute('rewindforward-original-label',
				aInfo.base.getAttribute('label'));
		}

		var link = this.getLinkInMainFrame(this.getLinksFromAllFrames(aInfo.type));

		if (aInfo.link) {
			disabled = aInfo.linkBroadcaster.hasAttribute('disabled');
			if (disabled == Boolean(link)) {
				if (disabled || link)
					aInfo.linkBroadcaster.removeAttribute('disabled');
				else
					aInfo.linkBroadcaster.setAttribute('disabled', true);
			}
			if (link) {
				aInfo.link.setAttribute('tooltiptext',
					aInfo.linkBroadcaster.getAttribute('tooltiptext-link')
						.replace(/%s/gi, (link.label || link.href).replace(/\s+/g, ' ')));
			}
			else {
				aInfo.link.setAttribute('tooltiptext',
					aInfo.linkBroadcaster.getAttribute('tooltiptext-link-blank'));
			}
		}

		if (!aInfo.navigation && !aInfo.base)
			return;

		if (!aInfo.findLinks || aInfo.link) link = null;

		disabled = aInfo.navigationBroadcaster.hasAttribute('disabled');
		if (disabled == Boolean(link) || disabled == aInfo.canMove) {
			if (disabled || link || aInfo.canMove)
				aInfo.navigationBroadcaster.removeAttribute('disabled');
			else
				aInfo.navigationBroadcaster.setAttribute('disabled', true);
		}
		if (!link) {
			if (aInfo.navigation) {
				aInfo.navigation.setAttribute('label',
					aInfo.navigationBroadcaster.getAttribute('label-navigation'));
				aInfo.navigation.setAttribute('tooltiptext',
					aInfo.navigationBroadcaster.getAttribute(navigationTooltipAttr));
				aInfo.navigation.setAttribute('mode',
					'navigation');
			}
			aInfo.navigationBroadcaster.setAttribute('mode', 'navigation');

			aInfo.menuItem.setAttribute('tooltiptext',
				aInfo.menuItem.getAttribute(navigationTooltipAttr));
			aInfo.menuItem = document.getElementById(aInfo.menuItem.id+'-clone');
			if (aInfo.menuItem)
				aInfo.menuItem.setAttribute('tooltiptext',
					aInfo.menuItem.getAttribute(navigationTooltipAttr));
		}
		else {
			if (aInfo.navigation) {
				aInfo.navigation.setAttribute('label',
					aInfo.navigationBroadcaster.getAttribute('label-link'));
				aInfo.navigation.setAttribute('tooltiptext',
					aInfo.navigationBroadcaster.getAttribute('tooltiptext-link')
						.replace(/%s/gi, (link.label || link.href)
						.replace(/\s+/g, ' ')));
				aInfo.navigation.setAttribute('mode',
					'link');
				link = null;
			}
			aInfo.navigationBroadcaster.setAttribute('mode', 'link');
		}

		if (!aInfo.base) return;

		aInfo.base.removeAttribute('rewindforward-override');
		if (
			!aInfo.canOverride ||
			(!link && (aInfo.navigation || !aInfo.canSkip))
			) {
			aInfo.base.setAttribute('label',
				aInfo.base.getAttribute('rewindforward-original-label'));
			aInfo.base.setAttribute('tooltiptext',
				aInfo.base.getAttribute('rewindforward-original-tooltip'));
			if (aInfo.canMove)
				aInfo.base.removeAttribute('disabled');
			else
				aInfo.base.setAttribute('disabled', true);
		}
		else {
			if (!link) {
				aInfo.base.setAttribute('label',
					aInfo.navigationBroadcaster.getAttribute('label-navigation'));
				aInfo.base.setAttribute('tooltiptext',
					aInfo.navigationBroadcaster.getAttribute(navigationTooltipAttr));
				aInfo.base.setAttribute('rewindforward-override',
					'navigation');
				aInfo.base.removeAttribute('disabled');
			}
			else {
				aInfo.base.setAttribute('label',
					aInfo.navigationBroadcaster.getAttribute('label-link'));
				aInfo.base.setAttribute('tooltiptext',
					aInfo.navigationBroadcaster.getAttribute('tooltiptext-link')
						.replace(/%s/gi, (link.label || link.href)
						.replace(/\s+/g, ' ')));
				aInfo.base.setAttribute('rewindforward-override',
					'link');
				aInfo.base.removeAttribute('disabled');
			}
		}
	},
 
	readyToCustomize : function() 
	{
		this.readyToCustomizeButton({
			base : (this.getPref('rewindforward.override_button.back') ?
							document.getElementById('back-button') : null ),
			navigation  : document.getElementById('rewind-button'),
			navigationBroadcaster : document.getElementById('Browser:Rewind')
		});
		this.readyToCustomizeButton({
			base : (this.getPref('rewindforward.override_button.forward') ?
							document.getElementById('forward-button') : null ),
			navigation  : document.getElementById('fastforward-button'),
			navigationBroadcaster : document.getElementById('Browser:Fastforward')
		});
	},
	readyToCustomizeButton : function(aInfo)
	{
		if (aInfo.base) {
			aInfo.base.removeAttribute('rewindforward-override');
			if (aInfo.base.hasAttribute('rewindforward-original-label')) {
				aInfo.base.setAttribute('label',
					aInfo.base.getAttribute('rewindforward-original-label'));
				aInfo.base.setAttribute('tooltiptext',
					aInfo.base.getAttribute('rewindforward-original-tooltip'));
			}
		}

		if (aInfo.navigation) {
			aInfo.navigation.setAttribute('label',
				aInfo.navigationBroadcaster.getAttribute('label-navigation'));
			aInfo.navigation.setAttribute('tooltiptext',
				aInfo.navigationBroadcaster.getAttribute(this.getPref('rewindforward.goToEndPointOfCurrentDomain') ? 'tooltiptext-navigation-toEndPoint' : 'tooltiptext-navigation'));
			aInfo.navigation.setAttribute('mode',
				'navigation');
			aInfo.navigationBroadcaster.setAttribute('mode',
				'navigation');
		}
	},
 
	checkSubFramesAreCompletelyLoaded : function(aFrames) 
	{
		var result = true;
		for (var i = 0; i < aFrames.length; i++)
		{
			if (aFrames[i].top != gBrowser.contentWindow)
				return false;
			if (result)
				result = this.checkSubFramesAreCompletelyLoaded(aFrames[i].frames);
		}
		return result;
	},
 
	delayedUpdateButtons : function(aFindLinks, aSelf) 
	{
		aSelf.updateButtons(aFindLinks);
	},
  
	fillPopupMenu : function(aEvent) 
	{
		var popup = aEvent.target;
		var node  = document.getElementById(popup.getAttribute('ref-command'));
		return this.fillPopupMenuInternal(aEvent, node);
	},
	
	fillPopupMenuInternal : function(aEvent, aCommandNode, aShowBackForwardCommand) 
	{
		var popup = aEvent.target;
		var node = aCommandNode;

		var showMenu = false;

		this.updateBackForwardPopup(popup, node);

		var isBackForwardMenu = (popup.firstChild.getAttribute('rewindforward-menuitem-backforward') == 'true');


		// fill up history items
		if (!isBackForwardMenu && !this.getPref('rewindforward.fill_history_menu')) {
			if (popup.lastChild.localName != 'menuseparator' && 'deleteHistoryItems' in window)
				deleteHistoryItems(popup);
		}
		else {
			showMenu = (node.id == 'Browser:Rewind') ?
					window.__rewindforward__BrowserBackMenu(aEvent) :
					window.__rewindforward__BrowserForwardMenu(aEvent) ;

			if (showMenu && (!isBackForwardMenu || aShowBackForwardCommand)) {
				var current,
					prev;
				for (var i = popup.childNodes.length-1; i > /*-1*/2; i--)
				{
					if (!popup.childNodes[i].getAttribute('index')) break;

					current = prev;
					prev = this.getHistoryEntryAt(parseInt(popup.childNodes[i-1].getAttribute('index')));
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
	},
 
	updateBackForwardPopup : function(aPopup, aCommandNode) 
	{
		if (aPopup.hasChildNodes() &&
			(aPopup.childNodes[0].getAttribute('rewindforward-menuitem') == 'true'))
			return;

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
		aPopup.firstChild.setAttribute('oncommand', 'Browser'+(aCommandNode.id == 'Browser:Rewind' ? 'Back' : 'Forward' )+'(event); event.stopPropagation(); this.parentNode.hidePopup();');
		aPopup.firstChild.setAttribute('onclick', 'if ("checkForMiddleClick" in window) { checkForMiddleClick(this, event); }; event.stopPropagation();');
	},
  
	newBrowserBackMenu : function(aEvent) 
	{
		var button = document.getElementById('back-button');
		return RewindForwardService.fillPopupMenuInternal(aEvent, document.getElementById('Browser:Rewind'),
			button.getAttribute('rewindforward-override') ? true : false );
	},
	newBrowserForwardMenu : function(aEvent)
	{
		var button = document.getElementById('forward-button');
		return RewindForwardService.fillPopupMenuInternal(aEvent, document.getElementById('Browser:Fastforward'),
			button.getAttribute('rewindforward-override') ? true : false );
	},
	newFillHistoryMenu : function(aPopup) // Firefox 3
	{
		this.__rewindforward__FillHistoryMenu(aPopup);

		var nodes = aPopup.childNodes;

		var current,
			prev;
		for (var i = nodes.length-1; i > -1; i--)
		{
			if (!nodes[i].getAttribute('index')) break;

			current = RewindForwardService.getHistoryEntryAt(parseInt(nodes[i].getAttribute('index')));
			if (!prev) {
				prev = current;
				continue;
			}

			if (
				(!current.URI.host && prev.URI.host) ||
				(current.URI.host && !prev.URI.host) ||
				(current.URI.host != prev.URI.host)
				)
				aPopup.insertBefore(document.createElement('menuseparator'), nodes[i+1]).setAttribute('index', -1);

			prev = current;
		}
	},
  
	// handle events 
	
	handleEvent : function(aEvent) 
	{
		switch (aEvent.type)
		{
			case 'keypress':
				this.onKeyPress(aEvent);
				return;

			case 'load':
				this.init();
				return;

			case 'unload':
				this.destroy();
				return;

			case 'DOMContentLoaded':
				this.onDocumentLoad(aEvent);
				return;

			case 'DOMAttrModified':
			case 'DOMSubtreeModified':
			case 'DOMNodeInserted':
			case 'DOMNodeInsertedIntoDocument':
				this.onDocumentModified(aEvent);
				return;
		}
	},
	
	onDocumentLoad : function(aEvent) 
	{
		if (!aEvent.target) return;

		var doc = aEvent.target;
		var w   = 'document' in doc ? doc :
				this.getDocShellFromDocument(doc.ownerDocument || doc);

		if (!w) return;

		w = w.QueryInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIDOMWindow);

		if (w.top == window) return;

		if (w.top == gBrowser.contentWindow) {
			this.updateButtons(true);
		}
		else {
			window.setTimeout(function(aSelf) {
				aSelf.getLinksFromAllFramesInternal([w], 'next');
				window.setTimeout(function(aSelf) {
					aSelf.getLinksFromAllFramesInternal([w], 'prev');
				}, 100, aSelf);
			}, 100, this);
		}
	},
 
	onDocumentModified : function(aEvent) 
	{
		if (!this.shouldFindPrevLinks && !this.shouldFindNextLinks) return;

		var node;
		try {
			node = aEvent.originalTarget || aEvent.target;
		}
		catch(e) {
			node = aEvent.target;
		}

		if (node.ownerDocument == document || node.document == document)
			return;

		var rel = this.getLinkProperty(node, 'rel');
		var rev = this.getLinkProperty(node, 'rev');
		if (!rel && !rev) return;

		if (
			node.ownerDocument.defaultView.top == gBrowser.contentWindow &&
			(rel.match(/\b(next|prev)\b/) || rev.match(/\b(next|prev)\b/))
			)
			this.updateButtons(true);
	},
 
	onKeyPress : function(aEvent) 
	{
		const node = aEvent.originalTarget || aEvent.target;
		if (
			!node ||
			!this.getPref('rewindforward.gonextprev.enabled') ||
			this.gonextprevExceptions.test(node.ownerDocument.defaultView.location.href)
			)
			return;

		// ignore events from chrome windows
		var docShell = this.getDocShellFromDocument(node.ownerDocument);
		if (docShell.itemType &&
			docShell.itemType != Components.interfaces.nsIDocShellTreeItem.typeContent)
			return;

		// ignore events sent from input fields
		if (node.nodeType != Node.ELEMENT_NODE) node= node.parentNode;
		if (
			!aEvent.ctrlKey &&
			!aEvent.altKey &&
			!aEvent.metaKey &&
			(
				/textbox|input|textarea|menulist|select/.test(node.localName.toLowerCase()) ||
				node.ownerDocument.designMode == 'on'
			)
			)
			return;

		var win = docShell
				.QueryInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIDOMWindow);

		const Y    = win.scrollY; // pageYOffset
		const maxY = win.scrollMaxY;

		// if we're not on top or bottom, do nothing
		if (Y > 5 && Y < maxY-5) return;


		// detect what key-combination is pressesd
		var keys = {
				next : this.getPref('rewindforward.gonextprev.next.keys'), // "next" links take precedence over "previous".
				prev : this.getPref('rewindforward.gonextprev.prev.keys')
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

		target = this.getFirstLink(target);
		if (!target) return;

		const ioService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
		var referrer = ioService.newURI(win.location.href, null, null);
		this.loadLink(target.href, referrer, win, direction);
	},
  
	observe : function(aSubject, aTopic, aData) 
	{
		if (aTopic != 'nsPref:changed') return;

		switch (aData)
		{
			case 'rewindforward.gonextprev.exceptions':
				this.gonextprevExceptions = this.gonextprevExceptions.compile(
					'^(' +
					this.getPref(aData)
						.split('|')
						.map(function(aItem) {
							if (!/^\w+:\/\//.test(aItem))
								aItem = 'https?://'+aItem;
							return aItem.replace(/\./g, '\\.')
									.replace(/\*/g, '.*');
						})
						.join('|') +
					')'
				);
				return;

			case 'rewindforward.use_another_icons':
				if (this.getPref(aData))
					document.documentElement.setAttribute('rewindforward-anothericon', true);
				else
					document.documentElement.removeAttribute('rewindforward-anothericon');
				return;

			case 'rewindforward.override_button.back':
			case 'rewindforward.override_button.forward':
			case 'rewindforward.goToEndPointOfCurrentDomain':
			case 'rewindforward.find_prev_links':
			case 'rewindforward.find_next_links':
			case 'rewindforward.related.virtual_link.enabled':
			case 'rewindforward.related.use.label':
			case 'rewindforward.related.use.customRules':
			case 'rewindforward.related.use.siteInfo':
			case 'rewindforward.gonextprev.enabled':
				this.updateButtons(true);
				return;

			default:
				if (!/^rewindforward\.siteinfo\.(.+)\.cache/.test(aData)) return;
				var uri = decodeURIComponent(RegExp.$1);
				var cache = this.getPref(aData);
				if (cache)
					this.siteInfo[uri] = eval(cache);
				else
					this.siteInfo[uri] = null;
		}
	},
	domain : 'rewindforward',
  
	// siteinfo 
	
	siteInfo : {}, 
	siteInfoUpdateTimer : {},
 
	initSiteInfo : function(aForce) 
	{
		var uris = this.getPref('rewindforward.siteinfo.importFrom').split('|');
		var expire = this.getPref('rewindforward.siteinfo.expire');
		var now = Date.now();
		var cache;
		var lastUpdate;
		for (var i in uris)
		{
			cache = this.getPref('rewindforward.siteinfo.'+encodeURIComponent(uris[i])+'.cache');
			last  = parseInt(this.getPref('rewindforward.siteinfo.'+encodeURIComponent(uris[i])+'.last') || 0);
			if (aForce || !cache || now >= expire + last) {
				new RewindForwardSiteInfoLoader(uris[i]);
				last = now;
			}
			else {
				this.siteInfo[uris[i]] = eval(cache);
			}
			if (this.siteInfoUpdateTimer[uris[i]]) {
				window.clearTimeout(this.siteInfoUpdateTimer[uris[i]]);
			}
			this.siteInfoUpdateTimer[uris[i]] = window.setTimeout(
				function(aURI, aSelf)
				{
					new RewindForwardSiteInfoLoader(aURI);
					delete aSelf.siteInfoUpdateTimer[aURI];
				},
				last + expire - now,
				uris[i],
				this
			);
		}
	},
  
	// initialize 
	
	init : function() 
	{
		if (this.initialized || !('gBrowser' in window)) return;
		this.initialized = true;

		window.removeEventListener('load', this, false);

		var func = ('UpdateBackForwardButtons' in window) ? 'UpdateBackForwardButtons' : // Firefox 2
				'UpdateBackForwardCommands' ; // Firefox 3
		eval('window.'+func+' = '+
			window[func].toSource().replace(
				/(\}\)?)$/,
				<><![CDATA[
					RewindForwardService.updateButtons(document.getElementById('Browser:Stop').hasAttribute('disabled'));
				$1]]></>
			)
		);

		eval('window.BrowserBack = '+
			window.BrowserBack.toSource().replace(
				'{',
				<><![CDATA[
				{
					if ((function(aEvent) {
							if (!aEvent || (RewindForwardService.getEventTargetId(aEvent) != 'back-button'))
								return false;
							var button = document.getElementById('back-button');
							if (button.getAttribute('rewindforward-override') == 'link') {
								BrowserRewindPrev(aEvent);
								return true;
							}
							else if (button.getAttribute('rewindforward-override') == 'navigation') {
								BrowserRewind(true, aEvent);
								return true;
							}
							return false;
						})(arguments.length ? arguments[0] : null ))
						return;
				]]></>
			)
		);
		eval('window.BrowserForward = '+
			window.BrowserForward.toSource().replace(
				'{',
				<><![CDATA[
				{
					if ((function(aEvent) {
							if (!aEvent || (RewindForwardService.getEventTargetId(aEvent) != 'forward-button'))
								return false;
							var button = document.getElementById('forward-button');
							if (button.getAttribute('rewindforward-override') == 'link') {
								BrowserFastforwardNext(aEvent);
								return true;
							}
							else if (button.getAttribute('rewindforward-override') == 'navigation') {
								BrowserFastforward(true, aEvent);
								return true;
							}
							return false;
						})(arguments.length ? arguments[0] : null ))
						return;
				]]></>
			)
		);

		if (window.BrowserBackMenu) { // Firefox 2
			window.__rewindforward__BrowserBackMenu = window.BrowserBackMenu;
			window.BrowserBackMenu = this.newBrowserBackMenu;
			window.__rewindforward__BrowserForwardMenu = window.BrowserForwardMenu;
			window.BrowserForwardMenu = this.newBrowserForwardMenu;
		}
		else { // Firefox 3
			window.__rewindforward__FillHistoryMenu = window.FillHistoryMenu;
			window.FillHistoryMenu = this.newFillHistoryMenu;
		}

		if ('BrowserCustomizeToolbar' in window) {
			eval('window.BrowserCustomizeToolbar = '+
				window.BrowserCustomizeToolbar.toSource().replace(
					'{',
					'{ RewindForwardService.readyToCustomize(); '
				)
			);
		}
		var toolbox = document.getElementById('navigator-toolbox') || // Firefox 3
					document.getElementById('navigator-toolbox'); // Firefox 2
		if (toolbox.customizeDone) {
			toolbox.__rewindforward__customizeDone = toolbox.customizeDone;
			toolbox.customizeDone = function(aChanged) {
				this.__rewindforward__customizeDone(aChanged);
				(window.UpdateBackForwardButtons || window.UpdateBackForwardCommands)(gBrowser.webNavigation);
			};
		}
		if ('BrowserToolboxCustomizeDone' in window) {
			window.__rewindforward__BrowserToolboxCustomizeDone = window.BrowserToolboxCustomizeDone;
			window.BrowserToolboxCustomizeDone = function(aChanged) {
				window.__rewindforward__BrowserToolboxCustomizeDone.apply(window, arguments);
				(window.UpdateBackForwardButtons || window.UpdateBackForwardCommands)(gBrowser.webNavigation);
			};
		}

		window.addEventListener('keypress', this, true);
		window.addEventListener('unload', this, false);

		gBrowser.addEventListener('DOMContentLoaded', this, true);
		gBrowser.addEventListener('DOMAttrModified', this, true);
		gBrowser.addEventListener('DOMSubtreeModified', this, true);
		gBrowser.addEventListener('DOMNodeInserted', this, true);
		gBrowser.addEventListener('DOMNodeInsertedIntoDocument', this, true);

		this.addPrefListener(this);
		this.observe(null, 'nsPref:changed', 'rewindforward.gonextprev.exceptions');
		this.observe(null, 'nsPref:changed', 'rewindforward.use_another_icons');

		this.initSiteInfo();

		this.initialShow();
	},
	
	initialShow : function() 
	{
		// show custom buttons only in the initial startup
		const PREFROOT = 'extensions.{FA4658DE-935B-4f39-AED3-0B5034DDE225}';
		var bar = document.getElementById('navigation-toolbar') || // Firefox 3
				document.getElementById('nav-bar'); // Firefox 2
		if (bar && bar.currentSet) {

			var STRBUNDLE = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService);
			var msg = STRBUNDLE.createBundle('chrome://rewindforward/locale/rewindforward.properties');

			var PromptService = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);


			var currentset = bar.currentSet;
			var buttons = currentset.replace(/__empty/, '').split(',');

			if (!this.getPref(PREFROOT+'.initialshow.rewind-button')) {
				var backRegExp = /(unified-back-forward-button|back-button|forward-button)/;
				if (currentset.indexOf('rewind-button') < 0) {
					if (!backRegExp.test(currentset))
						buttons.push('rewind-button');
					else {
						currentset = currentset.replace(backRegExp, 'rewind-button,$1');
						buttons = currentset.split(',');
					}
				}
				this.setPref(PREFROOT+'.initialshow.rewind-button', true);
			}
			if (!this.getPref(PREFROOT+'.initialshow.fastforward-button')) {
				var forwardRegExp = /(unified-back-forward-button|forward-button|back-button)/;
				if (currentset.indexOf('fastforward-button') < 0) {
					if (!forwardRegExp.test(currentset))
						buttons.push('fastforward-button');
					else {
						currentset = currentset.replace(forwardRegExp, '$1,fastforward-button');
						buttons = currentset.split(',');
					}
				}
				this.setPref(PREFROOT+'.initialshow.fastforward-button', true);
			}
			currentset = bar.currentSet.replace(/__empty/, '');
			var newset = buttons.join(',');
			if (currentset != newset &&
				PromptService.confirmEx(
					null,
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
	},
  
	destroy : function() 
	{
		window.removeEventListener('keypress', this, true);
		window.removeEventListener('unload', this, false);

		gBrowser.removeEventListener('DOMContentLoaded', this, true);
		gBrowser.removeEventListener('DOMAttrModified', this, true);
		gBrowser.removeEventListener('DOMSubtreeModified', this, true);
		gBrowser.removeEventListener('DOMNodeInserted', this, true);
		gBrowser.removeEventListener('DOMNodeInsertedIntoDocument', this, true);

		for (var i in this.siteInfoUpdateTimer)
		{
			window.clearTimeout(this.siteInfoUpdateTimer[i]);
		}

		this.removePrefListener(this);
	},
  
	// prefs 
	
	getPref : function(aPrefstring, aPrefBranch) 
	{
		const branch = aPrefBranch || Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch);
		try {
			switch (branch.getPrefType(aPrefstring))
			{
				case branch.PREF_STRING:
					return decodeURIComponent(escape(branch.getCharPref(aPrefstring)));
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

		return null;
	},
 
	setPref : function(aPrefstring, aValue, aPrefBranch) 
	{
		const branch = aPrefBranch || Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch);
		switch (typeof aValue)
		{
			case 'string':
				branch.setCharPref(aPrefstring, unescape(encodeURIComponent(aValue)));
				break;
			case 'number':
				branch.setIntPref(aPrefstring, parseInt(aValue));
				break;
			default:
				branch.setBoolPref(aPrefstring, aValue);
				break;
		}
	},
 
	addPrefListener : function(aObserver) 
	{
		var domains = ('domains' in aObserver) ? aObserver.domains : [aObserver.domain] ;
		try {
			var pbi = Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch).QueryInterface(Components.interfaces.nsIPrefBranchInternal);
			for (var i = 0; i < domains.length; i++)
				pbi.addObserver(domains[i], aObserver, false);
		}
		catch(e) {
		}
	},
 
	removePrefListener : function(aObserver) 
	{
		var domains = ('domains' in aObserver) ? aObserver.domains : [aObserver.domain] ;
		try {
			var pbi = Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch).QueryInterface(Components.interfaces.nsIPrefBranchInternal);
			for (var i = 0; i < domains.length; i++)
				pbi.removeObserver(domains[i], aObserver, false);
		}
		catch(e) {
		}
	},
 
	get shouldFindNextLinks() 
	{
		return this.getPref('rewindforward.find_next_links');
	},
	get shouldFindPrevLinks()
	{
		return this.getPref('rewindforward.find_prev_links');
	}
  
}; 
window.addEventListener('load', RewindForwardService, false);
  
function BrowserRewind(aForceToRewind, aEvent) 
{
	RewindForwardService.goRewind(aForceToRewind, aEvent);
}
function BrowserRewindPrev(aEvent)
{
	RewindForwardService.goPrevious(aEvent);
}

function BrowserFastforward(aForceToFastforward, aEvent)
{
	RewindForwardService.goFastforward(aForceToFastforward, aEvent);
}
function BrowserFastforwardNext(aEvent)
{
	RewindForwardService.goNext(aEvent);
}
 
// backward compatibility 
function rewindforwardGetLinksFromAllFrames(aType)
{
	return RewindForwardService.getLinksFromAllFrames(aType);
}
function rewindforwardGetLinkInMainFrame(aLinks)
{
	return RewindForwardService.getLinkInMainFrame(aLinks);
}
 
