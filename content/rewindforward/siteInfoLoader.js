function RewindForwardSiteInfoLoader(aURI) 
{
	this.uri = aURI;
	this.init();
}
RewindForwardSiteInfoLoader.prototype = {
	uri         : null,
	request     : null,
	init        : function()
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
	handleEvent : function(aEvent)
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
			try {
				var source = this.request.responseText
						.replace(/((\w+)="[^"]+"[^>]*)[\s\r\n](\2)="[^"]+"/, '$1'); // 2007.2.19, fix syntax error on autopagerize wiki
				var doc = parser.parseFromString(source, 'text/xml');
				var textarea = RewindForwardService.evaluateXPath(
						'//*[@class="autopagerize_data"]',
						doc
					);
				var parsedInfo;
				for (var i = 0, maxi = textarea.snapshotLength; i < maxi; i++)
				{
					parsedInfo = this.parseInfo(textarea.snapshotItem(i).textContent);
					if (!parsedInfo) continue;
					rules[parsedInfo.url] = parsedInfo;
					urls.push(parsedInfo.url);
					rulesFound = true;
				}
			}
			catch(e) {
			}

			info.rules = rules;
			info.urls  = urls;
		}

		if (info.urls && info.urls.length &&
			info.rules && rulesFound) {
			RewindForwardService.setPref(
				'rewindforward.siteinfo.'+encodeURIComponent(this.uri)+'.cache',
				info.toSource());
			RewindForwardService.setPref(
				'rewindforward.siteinfo.'+encodeURIComponent(this.uri)+'.last',
				String(Date.now()));
		}

		delete this.request;
	},
	parseInfo : function(aString)
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

