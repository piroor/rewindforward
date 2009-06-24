pref("rewindforward.override_button.back",        true);
pref("rewindforward.override_button.forward",     true);
pref("rewindforward.goToEndPointOfCurrentDomain", false);
pref("rewindforward.find_prev_links",             false);
pref("rewindforward.find_next_links",             true);
pref("rewindforward.related.virtual_link.enabled", true);
pref("rewindforward.related.use.label",           true);
pref("rewindforward.related.use.customRules",     true);
pref("rewindforward.related.use.siteInfo",        true);
pref("rewindforward.gonextprev.enabled",          true);
pref("rewindforward.gonextprev.prev.keys",        " ,shift|VK_PAGE_UP");
pref("rewindforward.gonextprev.next.keys",        " |VK_PAGE_DOWN");
pref("rewindforward.gonextprev.exceptions",       "docs.google.*|fastladder.com|mail.google.*|maps.google.*|reader.livedoor.com|www.bloglines.com/myblogs|www.google.*/calendar/|www.google.*/reader/");
pref("rewindforward.use_another_icons",           false);

pref("rewindforward.matchingPatterns.prev", "\u524d|\u623b|\u30e2\u30c9\u30eb|\u3082\u3069\u308b|\u307e\u3048\u3078|prev|previous|back|return|before|Prev|Previous|Back|Return|Before|PREV|PREVIOUS|BACK|RETURN|BEFORE|<<|<-|<=|\u2190|\uff1c|\u226a|\u00ab");
pref("rewindforward.matchingPatterns.prev.blacklist", "\u623b\u308b/\u9032\u3080|\u300c\u623b\u308b\u300d|\"Back\"|\u30c8\u30e9\u30c3\u30af\u30d0\u30c3\u30af|backup|Backup|BackUp|back up|Back up|Back Up|trackback|Trackback|TrackBack|writeback|Writeback|WriteBack|wayback|Wayback|WayBack");
pref("rewindforward.matchingPatterns.next", "\u6b21|\u9032|\u5148|\u30c4\u30ae|\u3064\u304e\u3078|next|forward|after|ahead|Next|Forward|After|Ahead|NEXT|FORWARD|AFTER|AHEAD|>>|->|=>|\u2192|\uff1e|\u226b|\u00bb");
pref("rewindforward.matchingPatterns.next.blacklist", "\u623b\u308b/\u9032\u3080|\u300c\u9032\u3080\u300d|\"Forward\"|Fastforward|FASTFORWARD|\u76ee\u6b21");

pref("rewindforward.siteinfo.importFrom", "http://wedata.net/databases/AutoPagerize/items.json|http://piro.sakura.ne.jp/siteinfo");
// http://userjs.oh.land.to/pagerization/convert.php?file=siteinfo.v5 : 404 on 2008.2.19
pref("rewindforward.siteinfo.expire", 86400000);

pref("extensions.{FA4658DE-935B-4f39-AED3-0B5034DDE225}.name", "chrome://rewindforward/locale/rewindforward.properties");
pref("extensions.{FA4658DE-935B-4f39-AED3-0B5034DDE225}.description", "chrome://rewindforward/locale/rewindforward.properties");
