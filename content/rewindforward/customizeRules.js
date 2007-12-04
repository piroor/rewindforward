// this bases on "config.js" in Firefox

const gPromptService = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
const gPrefService = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
const gPrefBranch = gPrefService.getBranch(null).QueryInterface(Components.interfaces.nsIPrefBranchInternal);


var gFunctionsBroadcaster;




var gDomainHash = {};
var gDomainArray = [];
var gDomainView  = gDomainArray;
var gFastIndex;
var gSortedColumn = 'domainCol';
var view = {
	get rowCount() { return gDomainView.length; },
	getCellText : function(index, colOrColID) {
		if (!(index in gDomainView)) return '';
		return gDomainView[index][typeof colOrColID == 'string' ? colOrColID : colOrColID.id ];
	},
	getRowProperties : function(index, prop) {},
	getCellProperties : function(index, col, prop) {},
	getColumnProperties : function(col, prop) {},
	treebox : null,
	selection : null,
	isContainer : function(index) { return false; },
	isContainerOpen : function(index) { return false; },
	isContainerEmpty : function(index) { return false; },
	isSorted : function() { return true; },
	canDrop : function(index, orientation) { return false; },
	drop : function(row, orientation) {},
	setTree : function(out) { this.treebox = out; },
	getParentIndex: function(rowIndex) { return -1; },
	hasNextSibling: function(rowIndex, afterIndex) { return false; },
	getLevel: function(index) { return 1; },
	getImageSrc: function(row, col) { return ''; },
	toggleOpenState : function(index) {},
	cycleHeader: function(colOrColID) {
		var col = typeof colOrColID == 'string' ? colOrColID : colOrColID.id ;
		var index = this.selection.currentIndex;
		if (col == gSortedColumn)
			gSortDirection = -gSortDirection;
		if (col == gSortedColumn && gFastIndex == gDomainArray.length) {
			gDomainArray.reverse();
			if (gDomainView != gDomainArray)
				gDomainView.reverse();
			if (index >= 0)
				index = gDomainView.length - index - 1;
		}
		else {
			var pref = null;
			if (index >= 0) {
				if (gDomainArray != gDomainView)
					index = gDomainView.length - index - 1;
				else
					pref = gDomainArray[index];
			}
			var old = document.getElementById(gSortedColumn);
			old.setAttribute('sortDirection', '');
			gDomainArray.sort(gSortFunction = gSortFunctions[col]);
			if (gDomainView != gDomainArray) {
				if (col == gSortedColumn)
					gDomainView.reverse();
				else
					gDomainView.sort(gSortFunction);
			}
			gSortedColumn = col;
			if (pref)
				index = getIndexOfDomain(pref);
		}
		col.element.setAttribute('sortDirection', gSortDirection > 0 ? 'ascending' : 'descending' );
		this.treebox.invalidate();
		if (index >= 0) {
			this.selection.select(index);
			this.treebox.ensureRowIsVisible(index);
		}
		gFastIndex = gDomainArray.length;
	},
	selectionChanged : function() {},
	cycleCell: function(row, col) {},
	isEditable: function(row, col) {return false; },
	setCellValue: function(row, col, value) {},
	setCellText: function(row, col, value) {},
	performAction: function(action) {},
	performActionOnRow: function(action, row) {},
	performActionOnCell: function(action, row, col) {},
	isSeparator: function(index) {return false; }
};

function getIndexOfDomain(domain)
{
	var low  = -1,
		high = gFastIndex;
	var index = (low + high) >> 1;
	while (index > low)
	{
		var mid = gDomainArray[index];
		if (mid == domain)
			return index;
		if (gSortFunction(mid, domain) < 0)
			low = index;
		else
			high = index;
		index = (low + high) >> 1;
	}
	for (index = gFastIndex; index < gDomainArray.length; ++index)
		if (gDomainArray[index] == domain)
			break;
	return index;
}

function getViewIndexOfDomain(domain)
{
	var low  = -1,
		high = gDomainView.length;
	var index = (low + high) >> 1;
	while (index > low)
	{
		var mid = gDomainView[index];
		if (mid == domain)
			return index;
		if (gSortFunction(mid, domain) < 0)
			low = index;
		else
			high = index;
		index = (low + high) >> 1;
	}
	return -1;
}

function getNearestIndexOfDomain(domain)
{
	var low  = -1,
		high = gFastIndex;
	var index = (low + high) >> 1;
	while (index > low)
	{
		if (gSortFunction(gDomainArray[index], domain) < 0)
			low = index;
		else
			high = index;
		index = (low + high) >> 1;
	}
	return high;
}

var gPrefListener = {
	observe: function(subject, topic, prefName)
	{
		if (topic != 'nsPref:changed')
			return;

		var domainName = decodeURI(prefName.replace(/^rewindforward\.rule\.[^\.]+\./, ''));

		var index = gDomainArray.length;
		if (
			!RewindForwardService.getPref('rewindforward.rule.prev.'+domainName) &&
			!RewindForwardService.getPref('rewindforward.rule.next.'+domainName) &&
			domainName in gDomainHash
			) {
			index = getViewIndexOfDomain(gDomainHash[domainName]);
			gDomainArray.splice(index, 1);
			gDomainView = gDomainArray;
			delete gDomainHash[domainName];
			view.treebox.rowCountChanged(index, -1);

			var next = index in gDomainArray ? gDomainArray[index] :
						gDomainArray.length ? gDomainArray[index-1] :
						null ;

			gFastIndex = gDomainArray.length;

			if (next)
				setTimeout(gotoRule, 0, next.domainCol);
			else
				gFunctionsBroadcaster.setAttribute('disabled', true);
		}
		else if (domainName in gDomainHash) {
			index = getViewIndexOfDomain(gDomainHash[domainName]);
			fetchPref(domainName, getIndexOfDomain(gDomainHash[domainName]));
			if (index >= 0) {
				gDomainView[index] = gDomainHash[domainName];
				view.treebox.invalidateRow(index);
			}
			if (gSortedColumn == 'prevCol' || gSortedColumn == 'nextCol')
				gFastIndex = 1;
		}
		else {
			fetchPref(domainName, index);
			if (index == gFastIndex) {
				var domain = gDomainArray.pop();
				index = getNearestIndexOfDomain(domain);
				gDomainArray.splice(index, 0, domain);
				gFastIndex = gDomainArray.length;
			}
			if (gDomainView == gDomainArray)
				view.treebox.rowCountChanged(index, 1);
		}
	}
};

function prefObject(prefName, prefIndex)
{
	this.domainCol = prefName;
}
prefObject.prototype =
{
	prevCol : '',
	nextCol : ''
};

function fetchPref(prefName, prefIndex)
{
	var pref = new prefObject(prefName);

	gDomainHash[prefName] = pref;
	gDomainArray[prefIndex] = pref;

	pref.prevCol = RewindForwardService.getPref('rewindforward.rule.prev.'+prefName, '');
	pref.nextCol = RewindForwardService.getPref('rewindforward.rule.next.'+prefName, '');
}




var gBundle = null;
function onLoad()
{
	gBundle = document.getElementById('stringBundle');
	gFunctionsBroadcaster = document.getElementById('functions-for-tree');

	var domainCount = { value: 0 };
	var domainArray = gPrefBranch.getChildList('rewindforward.rule.prev.', domainCount);

	var prefName;
	for (var i = 0; i < domainCount.value; ++i) 
	{
		if (!domainArray[i] || !RewindForwardService.getPref(domainArray[i])) continue;
		var prefName = domainArray[i].replace(/^rewindforward\.rule\.[^\.]+\./, '');
		fetchPref(prefName, gDomainArray.length);
	}

	var descending = document.getElementsByAttribute('sortDirection', 'descending');
	if (descending.item(0)) {
		gSortedColumn = descending[0].id;
		gSortDirection = -1;
	}
	else {
		var ascending = document.getElementsByAttribute('sortDirection', 'ascending');
		if (ascending.item(0))
			gSortedColumn = ascending[0].id;
		else
			document.getElementById(gSortedColumn).setAttribute('sortDirection', 'ascending');
	}
	gSortFunction = gSortFunctions[gSortedColumn];
	gDomainArray.sort(gSortFunction);
	gFastIndex = gDomainArray.length;

	gPrefBranch.addObserver('rewindforward.rule.', gPrefListener, false);
	document.getElementById('rulesTree').view = view;
}

function onUnload()
{
	gPrefBranch.removeObserver('rewindforward.rule.', gPrefListener);
	document.getElementById('rulesTree').view = null;
}






var gSortDirection = 1; // 1 is ascending; -1 is descending

function domainColSortFunction(x, y)
{
	try {
		if (x.domainCol > y.domainCol)
			return gSortDirection;
		if (x.domainCol < y.domainCol) 
			return -gSortDirection;
	}
	catch(e) {
	}
	return 0;
}

function prevColSortFunction(x, y)
{
	try {
		if (x.prevCol > y.prevCol)
			return gSortDirection;
		if (x.prevCol < y.prevCol) 
			return -gSortDirection;
	}
	catch(e) {
		return 0;
	}
	return domainColSortFunction(x, y);
}

function nextColSortFunction(x, y)
{
	try {
		if (x.nextCol > y.nextCol)
			return gSortDirection;
		if (x.nextCol < y.nextCol) 
			return -gSortDirection;
	}
	catch(e) {
		return 0;
	}
	return domainColSortFunction(x, y);
}

const gSortFunctions = {
	domainCol: domainColSortFunction, 
	prevCol: prevColSortFunction, 
	nextCol: nextColSortFunction
};





const gClipboardHelper = Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper);
function copyDomain()
{
	gClipboardHelper.copyString(gDomainView[view.selection.currentIndex].domainCol);
}
function copyXPath()
{
	gClipboardHelper.copyString([
		gDomainView[view.selection.currentIndex].prevCol,
		gDomainView[view.selection.currentIndex].nextCol,
		''
	].join('\n'));
}

function DeleteSelected()
{
	var entry = gDomainView[view.selection.currentIndex];
	try {
		gPrefBranch.clearUserPref('rewindforward.rule.next.'+entry.domainCol);
		gPrefBranch.clearUserPref('rewindforward.rule.prev.'+entry.domainCol);
	}
	catch(e) {
		RewindForwardService.setPref('rewindforward.rule.next.'+entry.domainCol, '');
		RewindForwardService.setPref('rewindforward.rule.prev.'+entry.domainCol, '');
	}
}

function NewRule()
{
	var result = { value: '' };
	var dummy = { value: 0 };
	if (gPromptService.prompt(
		window,
		gBundle.getString('new_title'),
		gBundle.getString('new_prompt'),
		result,
		null,
		dummy)) {
		var pref;
		if (result.value in gDomainHash)
			pref = gDomainHash[result.value];
		else
			pref = { domainCol : result.value, prevCol : '', nextCol : '' };

		var count = 0;
		if (modifyPrev(pref)) count++;
		if (modifyNext(pref)) count++;
		if (count)
			setTimeout(gotoRule, 0, result.value);
	}
}

function gotoRule(domain) {
	var index = domain in gDomainHash ? getViewIndexOfDomain(gDomainHash[domain]) : -1;
	if (index >= 0) {
		view.selection.select(index);
		view.treebox.ensureRowIsVisible(index);
	}
	else {
		view.selection.clearSelection();
		view.selection.currentIndex = -1;
	}
}


function modifySelectedPrev()
{
	return modifyPrev(gDomainView[view.selection.currentIndex]);
}
function modifySelectedNext()
{
	return modifyNext(gDomainView[view.selection.currentIndex]);
}

function modifyPrev(entry)
{
	var result = { value : entry.prevCol };
	var dummy = { value: 0 };
	if (!gPromptService.prompt(
			window,
			gBundle.getString('modify_title_prev'),
			gBundle.getFormattedString('modify_prompt_prev', [entry.domainCol]),
			result,
			null,
			dummy))
		return false;

	RewindForwardService.setPref('rewindforward.rule.prev.'+encodeURI(entry.domainCol), result.value);
	return true;
}
function modifyNext(entry)
{
	var result = { value : entry.nextCol };
	var dummy = { value: 0 };
	if (!gPromptService.prompt(
			window,
			gBundle.getString('modify_title_next'),
			gBundle.getFormattedString('modify_prompt_next', [entry.domainCol]),
			result,
			null,
			dummy))
		return false;

	RewindForwardService.setPref('rewindforward.rule.next.'+encodeURI(entry.domainCol), result.value);
	return true;
}








function reset()
{
	var count, rules;
	var type = ['next', 'prev'];
	var i, j;
	for (i in type)
	{
		count = { value: 0 };
		rules = gPrefBranch.getChildList('rewindforward.rule.'+type[i]+'.', count);
		for (var i in rules)
		{
			try{
				gPrefBranch.clearUserPref(rules[i]);
			}
			catch(e) {
			}
		}
	}
}


function onEnter(aEvent)
{
	if (
		!gDomainView[view.selection.currentIndex] ||
		(
			aEvent.keyCode != aEvent.DOM_VK_ENTER &&
			aEvent.keyCode != aEvent.DOM_VK_RETURN
		)
		)
		return;

	aEvent.preventDefault();
	aEvent.stopPropagation();

	if (modifySelectedPrev())
		modifySelectedNext();
}

function onSelect()
{
	gFunctionsBroadcaster.removeAttribute('disabled');
}

function onTreeClick(aEvent)
{
	if (aEvent.button != 0) return;

	var row = {};
	var col = {};
	var obj = {};
	view.treebox.getCellAt(aEvent.clientX, aEvent.clientY, row, col, obj);

	switch (typeof col.value == 'string' ? col.value : col.value.id )
	{
		case 'domainCol':
//			modifySelectedPrev();
//			modifySelectedNext();
			break;
		case 'prevCol':
			modifySelectedPrev();
			break;
		case 'nextCol':
			modifySelectedNext();
			break;
	}
}
