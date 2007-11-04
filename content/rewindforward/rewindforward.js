var RewindForwardService = { 
	initialized : false,
	 
	// constant properties 
	
	kFOUND_PREFIX   : 'rewindforward-found-first-links-', 
	kRELATED_PREFIX : 'rewindforward-found-related-links-',
	kLABELED_PREFIX : 'rewindforward-found-labeled-links-',
	kVIRTUAL_PREFIX : 'rewindforward-found-virtual-links-',

	kGENERATED_ID_PREFIX : 'rewindforward-found-link-',

	domainRegExp : /^\w+:\/\/([^:\/]+)(\/|$)/,

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
 
	getDocShellFromDocument : function(aDocument, aRootDocShell) 
	{
		var doc = aDocument;
		if (!doc) return null;

		const kDSTreeNode = Components.interfaces.nsIDocShellTreeNode;
		const kDSTreeItem = Components.interfaces.nsIDocShellTreeItem;
		const kWebNav     = Components.interfaces.nsIWebNavigation;

		if (doc.defaultView)
			return doc.defaultView
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
	},
 
	getLinkProperty : function(aNode, aProp) 
	{
		var value = aNode[aProp];
		if (value) return value;
		try {
			value = aNode.getAttributeNS(XLinkNS, aProp);
			if (value) return value;
		}
		catch(e) {
		}
		return aNode.getAttribute(aProp) || '';
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
		var links = [].concat(
				this.getRelatedLinks(aType, aWindow),
				this.getLabeledLinks(aType, aWindow),
				[this.getVirtualLink(aType, aWindow)]
			);

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

		var customRule = this.getCustomRuleFromSiteInfo(w.location.href, rel);
		if (!customRule.rule) customRule = this.getCustomRule(w.location.href, rel);
		if (customRule.rule) {
			rate = customRule.rate;
			customRule = customRule.rule;
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

		if (rel != 'next') return result;

		var matchingResult;
		var pos;
		var regexp = new RegExp();
		var rule;
		for (var i in this.siteInfo)
		{
			if (!this.siteInfo[i].urlsRule)
				this.siteInfo[i].urlsRule = new RegExp('^('+this.siteInfo[i].urls.join(')|^(')+')');

			if (!(matchingResult = (aURI || '').match(this.siteInfo[i].urlsRule)))
				continue;

			for (var j in this.siteInfo[i].rules)
			{
				if (!regexp.compile(j).test(aURI))
					continue;
				rule = this.siteInfo[i].rules[j][rel+'Link'];
				if (rule) {
					result.rule = rule;
					result.rate = this.kLINK_RELATED_CUSTOM;
				}
				break;
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
		const XHTMLNS = 'http://www.w3.org/1999/xhtml';
		const XLinkNS = 'http://www.w3.org/1999/xlink';

		var links = [];

		// http://www.hawk.34sp.com/stdpls/xml/
		// http://www.hawk.34sp.com/stdpls/xml/dom_xpath.html
		// http://www.homoon.jp/users/www/doc/CR-css3-selectors-20011113.shtml
		const xmlDoc  = aXMLDocument;
		const context = xmlDoc.documentElement;
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
			var expression = xmlDoc.createExpression(aXPath, resolver);
			var result = expression.evaluate(context, type, null);
		}
		catch(e) {
			dump('this.getLinksFromXPath >>>>>> ERROR <<<<<<<\n'+e+'\n');
			return links;
		}


		var link;
		var node;
		do {
			try {
				node = result.iterateNext();
			}
			catch(e) {
				node = null;
			}
			if (!node) break;

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
					label : (this.getLinkProperty(node, 'title') || node.textContent);
					href  : this.getLinkProperty(node, 'href'),
					type  : (aType || 0)
				};

			if (link.href) links.push(link);

		} while(true);

		return links;
	},
 
	getVirtualLink : function(aType, aWindow) 
	{
		if (!this.shouldUseVirtualLinks) return null;

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
		this.updateRewindButton(aFindLinks);
		this.updateFastforwardButton(aFindLinks);
	},
	 
	updateRewindButton : function(aFindLinks) 
	{
		var nav = gBrowser.webNavigation;

		var broadcaster, disabled, link;

		var toEndPoint = this.getPref('rewindforward.goToEndPointOfCurrentDomain');
		var navigationTooltipAttr = toEndPoint ? 'tooltiptext-navigation-toEndPoint' : 'tooltiptext-navigation' ;

		var rewindButton   = document.getElementById('rewind-button');
		var rewirdMenuItem = document.getElementById('rewindMenuItem');
		var prevButton     = document.getElementById('rewind-prev-button');
		var backButton     = this.shouldOverrideBackButtons ? document.getElementById('back-button') : null ;

		if (!rewindButton && !prevButton && !backButton) return;

		link = this.getLinkInMainFrame(this.getLinksFromAllFrames('prev'));
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

		if ((!rewindButton || rewindButton.hidden) && (!backButton || backButton.hidden)) return;

		if (!aFindLinks || !this.shouldFindPrevLinks ||
			(prevButton && !prevButton.hidden)) {
			link = null;
		}
		else if (!link) {
			link = this.getLinkInMainFrame(this.getLinksFromAllFrames('prev'));
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

		if (!backButton) return;

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
	},
 
	updateFastforwardButton : function(aFindLinks) 
	{
		var nav = gBrowser.webNavigation;

		var broadcaster, disabled, link;

		var toEndPoint = this.getPref('rewindforward.goToEndPointOfCurrentDomain');
		var navigationTooltipAttr = toEndPoint ? 'tooltiptext-navigation-toEndPoint' : 'tooltiptext-navigation' ;

		var fastforwardButton   = document.getElementById('fastforward-button');
		var fastforwardMenuItem = document.getElementById('fastforwardMenuItem');
		var nextButton          = document.getElementById('fastforward-next-button');
		var forwardButton       = this.shouldOverrideForwardButtons ? document.getElementById('forward-button') : null ;

		if (!fastforwardButton && !nextButton && !forwardButton) return;

		link = this.getLinkInMainFrame(
			this.getLinksFromAllFrames('next')
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

		if ((!fastforwardButton || fastforwardButton.hidden) && (!forwardButton || forwardButton.hidden)) return;

		if (!aFindLinks || !this.shouldFindNextLinks ||
			(nextButton && !nextButton.hidden)) {
			link = null;
		}
		else if (!link) {
			link = this.getLinkInMainFrame(
				this.getLinksFromAllFrames('next')
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

		if (!forwardButton) return;

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
		if (!isBackForwardMenu && !this.shouldFillHistoryMenu) {
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
				if (aEvent.originalTarget == document)
					this.destroy();
				else
					this.onDocumentUnload(aEvent);
				return;

			case 'DOMAttrModified':
			case 'DOMSubtreeModified':
			case 'DOMNodeInserted':
			case 'DOMNodeInsertedIntoDocument':
				this.onDocumentModified(aEvent);
				return;
		}
	},
	 
	onDocumentModified : function(aEvent) 
	{
		if (!this.shouldFindPrevLinks && !this.shouldFindNextLinks) return;

		const XHTMLNS = 'http://www.w3.org/1999/xhtml';
		const XLinkNS = 'http://www.w3.org/1999/xlink';

		var node;
		try {
			node = aEvent.originalTarget || aEvent.target;
		}
		catch(e) {
			node = aEvent.target;
		}

		if (
			node.nodeType == Node.ELEMENT_NODE &&
			node.namespaceURI == 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'
			)
			return;

		var rel = this.getLinkProperty(node, 'rel');
		var rev = this.getLinkProperty(node, 'rev');
		if (!rel && !rev) return;

		if (rel.match(/\b(next|prev)\b/) || rev.match(/\b(next|prev)\b/))
			this.updateButtons(true);
	},
 
	onDocumentUnload : function(aEvent) 
	{
		if (!aEvent.target) return;

		var doc = aEvent.target;
		var w   = 'document' in doc ? doc :
				this.getDocShellFromDocument(doc.ownerDocument || doc)
				.QueryInterface(Components.interfaces.nsIWebNavigation)
				.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
				.getInterface(Components.interfaces.nsIDOMWindow);

		if (!w) return;

		document.getElementById('Browser:RewindPrev').setAttribute('disabled', true);
		document.getElementById('Browser:Rewind').setAttribute('disabled', true);
		document.getElementById('Browser:FastforwardNext').setAttribute('disabled', true);
		document.getElementById('Browser:Fastforward').setAttribute('disabled', true);

		w.removeEventListener('DOMAttrModified', this, true);
		w.removeEventListener('DOMSubtreeModified', this, true);
		w.removeEventListener('DOMNodeInserted', this, true);
		w.removeEventListener('DOMNodeInsertedIntoDocument', this, true);

		w.removeEventListener('unload', this, false);
	},
 
	onKeyPress : function(aEvent) 
	{
		const node = aEvent.originalTarget || aEvent.target;
		if (!node || !this.getPref('rewindforward.gonextprev.enabled')) return;

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
			if (aTopic != 'EndDocumentLoad' &&
				aTopic != 'FailDocumentLoad')
				return;

			if (
				(this.shouldFindPrevLinks || this.shouldFindNextLinks) &&
				aSubject &&
				!aSubject.document.documentElement.getAttribute('__rewindforward__event_handled')
				) {
				aSubject.document.documentElement.setAttribute('__rewindforward__event_handled', true);

				aSubject.addEventListener('DOMAttrModified', this, true);
				aSubject.addEventListener('DOMSubtreeModified', this, true);
				aSubject.addEventListener('DOMNodeInserted', this, true);
				aSubject.addEventListener('DOMNodeInsertedIntoDocument', this, true);

				aSubject.addEventListener('unload', this, false);
			}

			this.updateButtons(true);
		},
  
	// siteinfo 
	 
	siteInfo : {}, 
 
	initSiteInfo : function() 
	{
		var uris = this.getPref('rewindforward.siteinfo.importFrom').split('|');
		var expire = this.getPref('rewindforward.siteinfo.expire');
		var now = Date.now();
		var cache;
		var lastUpdate;
		for (var i in uris)
		{
			cache = this.getPref('rewindforward.siteinfo.'+encodeURIComponent(uris[i])+'.cache');
			lastUpdate = (this.getPref('rewindforward.siteinfo.'+encodeURIComponent(uris[i])+'.lastUpdate') || 0);
			if (!cache || now >= expire + lastUpdate) {
				new RewindForwardSiteInfoLoader(uris[i]);
			}
			else {
				this.siteInfo[uris[i]] = eval(cache);
			}
			window.setTimeout(
				'new RewindForwardSiteInfoLoader("'+uris[i]+'")',
				now - lastUpdate + expire
			);
		}
	},
  
	// initialize 
	 
	init : function() 
	{
		if (this.initialized) return;
		this.initialized = true;

		window.removeEventListener('load', this, false);

		eval('window.UpdateBackForwardButtons = '+
			window.UpdateBackForwardButtons.toSource().replace(
				/\}\)$/,
				<><![CDATA[
					RewindForwardService.updateButtons(document.getElementById('Browser:Stop').hasAttribute('disabled'));
				})]]></>
			)
		);

		eval('window.BrowserBack = '+
			window.BrowserBack.toSource().replace(
				'{',
				<><![CDATA[
				{
					if ((function(aEvent) {
							var button = document.getElementById('back-button');
							if (aEvent && aEvent.target.id == 'back-button') {
								if (button.getAttribute('rewindforward-prev') == 'true') {
									BrowserRewindPrev(aEvent);
									return true;
								}
								else if (button.getAttribute('rewindforward-override') == 'navigation') {
									BrowserRewind(true, aEvent);
									return true;
								}
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
							var button = document.getElementById('forward-button');
							if (aEvent && aEvent.target.id == 'forward-button') {
								if (button.getAttribute('rewindforward-next') == 'true') {
									BrowserFastforwardNext(aEvent);
									return true;
								}
								else if (button.getAttribute('rewindforward-override') == 'navigation') {
									BrowserFastforward(true, aEvent);
									return true;
								}
							}
							return false;
						})(arguments.length ? arguments[0] : null ))
						return;
				]]></>
			)
		);

		window.__rewindforward__BrowserBackMenu = window.BrowserBackMenu;
		window.BrowserBackMenu = this.newBrowserBackMenu;
		window.__rewindforward__BrowserForwardMenu = window.BrowserForwardMenu;
		window.BrowserForwardMenu = this.newBrowserForwardMenu;

		const observerService = Components.classes['@mozilla.org/observer-service;1']
							.getService(Components.interfaces.nsIObserverService);
		observerService.addObserver(this, 'EndDocumentLoad', false);
		observerService.addObserver(this, 'FailDocumentLoad', false);

		window.addEventListener('keypress', this, true);
		window.addEventListener('unload', this, false);

		if (this.getPref('rewindforward.use_another_icons'))
			document.documentElement.setAttribute('rewindforward-anothericon', true);
		else
			document.documentElement.removeAttribute('rewindforward-anothericon');

		this.initSiteInfo();

		this.initialShow();
	},
	
	initialShow : function() 
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

			if (!this.getPref(PREFROOT+'.initialshow.rewind-button')) {
				if (currentset.indexOf('rewind-button') < 0) {
					if (currentset.indexOf('back-button') < 0)
						buttons.push('rewind-button');
					else {
						currentset = currentset.replace(/back-button/, 'rewind-button,back-button');
						buttons = currentset.split(',');
					}
				}
				this.setPref(PREFROOT+'.initialshow.rewind-button', true);
			}
			if (!this.getPref(PREFROOT+'.initialshow.fastforward-button')) {
				if (currentset.indexOf('fastforward-button') < 0) {
					if (currentset.indexOf('back-button') < 0)
						buttons.push('fastforward-button');
					else {
						currentset = currentset.replace(/forward-button/, 'forward-button,fastforward-button');
						buttons = currentset.split(',');
					}
				}
				this.setPref(PREFROOT+'.initialshow.fastforward-button', true);
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
	},
  
	destroy : function() 
	{
		const observerService = Components.classes['@mozilla.org/observer-service;1']
							.getService(Components.interfaces.nsIObserverService);
		observerService.removeObserver(this, 'EndDocumentLoad', false);
		observerService.removeObserver(this, 'FailDocumentLoad', false);

		window.removeEventListener('keypress', this, true);
		window.removeEventListener('unload', this, false);
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
 
	get shouldFindNextLinks() 
	{
		return this.getPref('rewindforward.find_next_links');
	},
	get shouldFindPrevLinks()
	{
		return this.getPref('rewindforward.find_prev_links');
	},
	get shouldUseVirtualLinks()
	{
		return this.getPref('rewindforward.virtual_link.enabled');
	},
	get shouldFillHistoryMenu()
	{
		return this.getPref('rewindforward.fill_history_menu');
	},
	get shouldOverrideBackButtons()
	{
		return this.getPref('rewindforward.override_button.back');
	},
	get shouldOverrideForwardButtons()
	{
		return this.getPref('rewindforward.override_button.forward');
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
 
