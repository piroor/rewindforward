function RewindForwardSiteInfoLoader(aURI) 
{
	this.uri = aURI;
	this.init();
}
RewindForwardSiteInfoLoader.prototype = {
	uri         : null,
	request     : null,
	init        : function SIL_init()
	{
		var request = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1']
					.createInstance(Components.interfaces.nsIXMLHttpRequest)
					.QueryInterface(Components.interfaces.nsIDOMEventTarget);
		this.request = request;

		request.open('GET', this.uri, true);
		request.addEventListener('load', this, false);
		request.addEventListener('error', this, false);
		request.send(null);
	},
	handleEvent : function SIL_handleEvent(aEvent)
	{
		switch (aEvent.type)
		{
			case 'load':
			case 'error':
				break;
			default:
				return;
		}
		this.request.removeEventListener('load', this, false);
		this.request.removeEventListener('error', this, false);
		var info = {};

		if (this.request.status == 200) {
			var rules = {};
			var urls  = [];
			var parser = new DOMParser();
			var rulesFound = false;

			// first, try to parse as JSON
			try {
				let data = RewindForwardService.evalInSandbox('('+(this.request.responseText || 'null')+')', this.uri);
				if (data) {
					data.forEach(function(aData) {
						rules[aData.data.url] = aData.data;
						urls.push(aData.data.url);
						rulesFound = true;
					}, this);
				}
			}
			catch(e) {
			}

			// second, try to parse as Infogami Wiki Style
			if (!rulesFound) {
				try {
					let source = this.request.responseText
							.replace(/((\w+)="[^"]+"[^>]*)[\s\r\n](\2)="[^"]+"/, '$1'); // 2007.2.19, fix syntax error on autopagerize wiki
					let doc = parser.parseFromString(source, 'text/xml');
					let textarea = RewindForwardService.evaluateXPath(
							'//*[@class="autopagerize_data"]',
							doc
						);
					for (let i = 0, maxi = textarea.snapshotLength; i < maxi; i++)
					{
						let parsedInfo = this.parseInfo(textarea.snapshotItem(i).textContent);
						if (!parsedInfo) continue;
						rules[parsedInfo.url] = parsedInfo;
						urls.push(parsedInfo.url);
						rulesFound = true;
					}
				}
				catch(e) {
				}
			}

			info.rules = rules;
			info.urls  = urls;
		}

		if (info.urls && info.urls.length &&
			info.rules && rulesFound) {
			let name = encodeURIComponent(this.uri);
			let file = RewindForwardService.siteInfoDirectory.clone();
			file.append(name+'.js');
			RewindForwardService.writeTo(info.toSource(), file, 'UTF-8');
			RewindForwardService.setPref('rewindforward.siteinfo.'+name+'.last', String(Date.now()));
			// clear old data
			RewindForwardService.clearPref('rewindforward.siteinfo.'+name+'.cache');
		}

		delete this.request;
	},
	parseInfo : function SIL_parseInfo(aString)
	{
		var pattern = /^\s*([^:\s]*?)\s*:(.*)$/;
		var info = {};
		aString.split(/\r\n|\r|\n/).forEach(function(aPart) {
			if (!aPart.match(pattern)) return;
			info[RegExp.$1] = RegExp.$2.replace(/^\s*/, '').replace(/\s*$/, '');
		});
		return (info.url && info.nextLink) ? info : null ;
	}
};

