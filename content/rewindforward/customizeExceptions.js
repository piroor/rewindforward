// this bases on "config.js" in Firefox

var gPromptService = Components.classes['@mozilla.org/embedcomp/prompt-service;1'].getService(Components.interfaces.nsIPromptService);
var gPrefService = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
var gPrefBranch = gPrefService.getBranch(null).QueryInterface(Components.interfaces.nsIPrefBranch);

var KEY = 'rewindforward.gonextprev.exceptions';


var gList;
var gFunctionsBroadcaster;

function onLoad()
{
	gBundle = document.getElementById('stringBundle');
	gFunctionsBroadcaster = document.getElementById('functions-for-tree');
	gList = document.getElementById('rulesTree');
	initList();
}

function onUnload()
{
	var items = gList.childNodes;
	var rules = [];
	for (var i = 0, maxi = items.length; i < maxi; i++)
	{
		rules.push(items[i].getAttribute('label'));
	}
	rules = rules.join('|');
	var orig = RewindForwardService.getPref(KEY);
	if (orig != rules)
		RewindForwardService.setPref(KEY, rules);
}

function initList()
{
	var range = document.createRange();
	range.selectNodeContents(gList);
	range.deleteContents();
	range.detach();

	var rules = RewindForwardService.getPref(KEY);
	rules.split('|').sort().forEach(function(aItem) { addSite(aItem); });

	gFunctionsBroadcaster.setAttribute('disabled', true);
}

function addSite(aSite)
{
	var item = document.createElement('listitem');
	item.setAttribute('label', aSite);
	item.setAttribute('value', aSite);
	gList.appendChild(item);
	return item;
}



function DeleteSelected()
{
	if (!gList.selectedItem) return;

	var next = gList.selectedItem.nextSibling || gList.selectedItem.previousSibling;
	gList.removeChild(gList.selectedItem);
	if (next)
		gList.selectedItem = next;
	else
		gFunctionsBroadcaster.setAttribute('disabled', true);
}

function NewSite()
{
	var result = { value: '' };
	var dummy = { value: 0 };
	if (gPromptService.prompt(
		window,
		gBundle.getString('new_site_title'),
		gBundle.getString('new_site_prompt'),
		result,
		null,
		dummy)) {
		var site = result.value;
		if (site) {
			gList.selectedItem = addSite(site);
			onSelect();
		}
	}
}

function modifySelected()
{
	if (!gList.selectedItem) return;

	var result = { value: gList.selectedItem.getAttribute('label') };
	var dummy = { value: 0 };
	if (gPromptService.prompt(
		window,
		gBundle.getString('modify_site_title'),
		gBundle.getString('modify_site_prompt'),
		result,
		null,
		dummy)) {
		var site = result.value;
		if (site) {
			gList.selectedItem.setAttribute('label', site);
			gList.selectedItem.setAttribute('value', site);
			onSelect();
		}
		else {
			DeleteSelected();
		}
	}
}


function reset()
{
	try {
		gPrefBranch.clearUserPref(KEY);
	}
	catch(e) {
	}
	initList();
}


function onEnter(aEvent)
{
	if (!gList.selectedItem) return;

	if (aEvent.keyCode == aEvent.DOM_VK_ENTER ||
		aEvent.keyCode == aEvent.DOM_VK_RETURN) {
		modifySelected();
		aEvent.stopPropagation();
		aEvent.preventDefault();
	}
}

function onSelect()
{
	gFunctionsBroadcaster.removeAttribute('disabled');
}

function onTreeClick(aEvent)
{
	if (aEvent.button != 0) return;
	modifySelected();
}
