/*
 *Note:
   Rules for search engines (or some services) should be made strictly.
   Because, if you use a simple rule like "*[text()='>>']", it possibly
   match for texts in search results.
*/


// Google
pref("rewindforward.rule.next.*.google.*",
	"//TABLE[@align='center']//*[text()='Next' or text()='\u6b21\u3078']");
pref("rewindforward.rule.prev.*.google.*",
	"//TABLE[@align='center']//*[text()='Prev' or text()='\u524d\u3078']");

// Infoseek
pref("rewindforward.rule.next.www.infoseek.co.jp",
	"//*[starts-with(text(), '\u6b21\u306e') and contains(text(), '\u4ef6>>')]");
pref("rewindforward.rule.prev.www.infoseek.co.jp",
	"//*[starts-with(text(), '<<\u524d\u306e') and contains(text(), '\u4ef6')]");

// goo
pref("rewindforward.rule.next.search.goo.ne.jp",
	"//*[text()='\u6b21\u306e\u7d50\u679c']");
pref("rewindforward.rule.prev.search.goo.ne.jp",
	"//*[text()='\u524d\u306e\u7d50\u679c']");

// Yahoo! Japan
pref("rewindforward.rule.next.search.yahoo.co.jp",
	"//*[starts-with(text(), '\u6b21\u306e') and contains(text(), '\u4ef6\u3092\u8868\u793a')]");
pref("rewindforward.rule.prev.search.yahoo.co.jp",
	"//*[starts-with(text(), '\u524d\u306e') and contains(text(), '\u4ef6\u3092\u8868\u793a')]");

// Yahoo! Japan Auctions
pref("rewindforward.rule.next.search.auction.yahoo.co.jp",
	"//*[starts-with(text(), '\u6b21\u306e') and contains(text(), '\u4ef6')]");
pref("rewindforward.rule.prev.search.auction.yahoo.co.jp",
	"//*[starts-with(text(), '\u524d\u306e') and contains(text(), '\u4ef6')]");

// Yahoo!
pref("rewindforward.rule.next.search.yahoo.com",
	"//*[text()='Next']");
pref("rewindforward.rule.prev.search.yahoo.com",
	"//*[text()='Prev']");

// Yahoo! Shopping Auctions
pref("rewindforward.rule.next.search.auctions.shopping.yahoo.com",
	"//*[text()='Next >>']");
pref("rewindforward.rule.prev.search.auctions.shopping.yahoo.com",
	"//*[text()='<< Prev']");

// teoma (by Norbert Wienholz)
pref("rewindforward.rule.next.*.teoma.com",
 "//*[text()='>>']");
pref("rewindforward.rule.prev.*.teoma.com",
 "//*[text()='<<']");

// Amazon.co.jp
pref("rewindforward.rule.next.www.amazon.co.jp",
	"(//TD[@align='right']//*[@alt='\u7d9a\u304d\u3092\u898b\u308b'] | //A[text()='\u6b21\u3078'])");
pref("rewindforward.rule.prev.www.amazon.co.jp",
	"(//TD[@align='right']//*[@alt='\u524d\u306e\u30da\u30fc\u30b8'] | //A[text()='\u623b\u308b'])");

// Amazon.com
pref("rewindforward.rule.next.www.amazon.com",
	"(//TD[@align='right']//*[@alt='More Results'] | //A[text()='next'])");
pref("rewindforward.rule.prev.www.amazon.com",
	"(//TD[@align='right']//*[@alt='Previous'] | //A[text()='previous'])");

// AllAbout Japan
pref("rewindforward.rule.next.allabout.co.jp",
	"//*[text()='>>']/preceding:*[text()='\u6b21\u3078']");
pref("rewindforward.rule.prev.allabout.co.jp",
	"//*[text()='<<']/following:*[text()='\u524d\u3078']");



// Bulkfeeds
pref("rewindforward.rule.next.bulkfeeds.net",
	"(//DIV[@class='searchResultNavi']//span[@class='searchResultCurrent']/following-sibling::A)");
pref("rewindforward.rule.prev.bulkfeeds.net",
	"(//DIV[@class='searchResultNavi']//span[@class='searchResultCurrent']/preceding-sibling::A)");



// はてなダイアリー
pref("rewindforward.rule.next.d.hatena.ne.jp",
	"(//*[@class='calendar']//*[text()='\u6b21\u306e3\u65e5\u5206>']|//*[@href and ((starts-with(text(), '\u6b21\u306e') and contains(text(), '\u65e5\u5206>')) or text()='\u6b21\u306e\u65e5>')])");
pref("rewindforward.rule.prev.d.hatena.ne.jp",
	"(//*[@class='calendar']//*[text()='<\u524d\u306e3\u65e5\u5206']|//*[@href and ((starts-with(text(), '<\u524d\u306e') and contains(text(), '\u65e5\u5206')) or text()='<\u524d\u306e\u65e5')])");

// ココログ
pref("rewindforward.rule.next.*.cocolog-nifty.com",
	"//*[@id='container']//*[@class='content']//*[contains(text(), '\u00bb')]");
//pref("rewindforward.rule.prev.*.cocolog-nifty.com",
//	"//*[@id='container']//*[@class='content']//*[start-with(text(), '\u00ab')]");
pref("rewindforward.rule.prev.*.cocolog-nifty.com",
	"//*[@id='container']//*[@class='content']//*[contains(text(), '\u00ab')]");

// Mixi
pref("rewindforward.rule.next.mixi.jp",
	"//*[contains(test(), '\u6708\u306e\u30ab\u30ec\u30f3\u30c0\u30fc')]/following:*[text()='\uff1e']");
pref("rewindforward.rule.prev.mixi.jp",
	"//*[contains(test(), '\u6708\u306e\u30ab\u30ec\u30f3\u30c0\u30fc')]/preceding:*[text()='\uff1c']");

// チャンネル北国tv
pref("rewindforward.rule.next.ch.kitaguni.tv",
	"//*[@id='menu']//*[@href][4]");
pref("rewindforward.rule.prev.ch.kitaguni.tv",
	"//*[@id='menu']//*[@href][1]");

// tdiary.net
pref("rewindforward.rule.next.*.tdiary.net",
	"//*[@rel='next']");
pref("rewindforward.rule.prev.*.tdiary.net",
	"//*[@rel='prev']");

// livejournal
pref("rewindforward.rule.next.www.livejournal.com",
	"//*[@class='new']//*[@alt='Forward']");
pref("rewindforward.rule.prev.www.livejournal.com",
	"//*[@class='new']//*[@alt='Back']");

// myprofile
pref("rewindforward.rule.next.www.myprofile.ne.jp",
	"//*[contains(text(), '\u3010') and contains(text(), '\u3011')]/following:*[@href]");
pref("rewindforward.rule.prev.www.myprofile.ne.jp",
	"//*[contains(text(), '\u3010') and contains(text(), '\u3011')]/preceding:*[@href]");

// livedoor Blog
pref("rewindforward.rule.next.blog.livedoor.jp",
	"//*[@class='menu']//*[text()='\u6b21\u306e\u8a18\u4e8b']");
pref("rewindforward.rule.prev.blog.livedoor.jp",
	"//*[@class='menu']//*[text()='\u524d\u306e\u8a18\u4e8b']");

// jugem
pref("rewindforward.rule.next.*.jugem.cc",
	"(//*[@class='linktext']//*[@href and (text()=//*[@class='entry_title']//text())]/following::*[@href]|//*[@class='calendar_month']//*[text()='>>'])");
pref("rewindforward.rule.prev.*.jugem.cc",
	"(//*[@class='linktext']//*[@href and (text()=//*[@class='entry_title']//text())]/preceding::*[@href]|//*[@class='calendar_month']//*[text()='<<'])");

// Seesaa BLOG
pref("rewindforward.rule.next.*.seesaa.net",
	"//*[@class='navi']//*[@href][3]");
pref("rewindforward.rule.prev.*.seesaa.net",
	"//*[@class='navi']//*[@href][1]");

// excite blog
pref("rewindforward.rule.next.*.exblog.jp",
	"(//*[@href and text()='\u6b21\u306e\u30da\u30fc\u30b8 >']|//*[@class='CAL']//*[text()='>'])");
pref("rewindforward.rule.prev.*.exblog.jp",
	"(//*[@href and text()='< \u524d\u306e\u30da\u30fc\u30b8']|//*[@class='CAL']//*[text()='<'])");

// melma! blog
pref("rewindforward.rule.next.blog.melma.com",
	"(//*[@href and starts-with(text(), '\u6b21\u306e') and contains(text(), '\u4ef6>')]|//*[@class='calendar-next-month']//*[@href])");
pref("rewindforward.rule.prev.blog.melma.com",
	"(//*[@href and starts-with(text(), '<\u524d\u306e') and contains(text(), '\u4ef6')]|//*[@class='calendar-prev-month']//*[@href])");

// BLOCK BLOG
pref("rewindforward.rule.next.*.bblog.jp",
	"//*[@class='recent_entries']//*[@href and (@title=//H3[@class='title']//*[not(@class='category')]//text())]/preceding::*[@href]");
pref("rewindforward.rule.prev.*.bblog.jp",
	"//*[@class='recent_entries']//*[@href and (@title=//H3[@class='title']//*[not(@class='category')]//text())]/following::*[@href]");

// goo BLOG
pref("rewindforward.rule.next.blog.goo.ne.jp",
	"//*[@href and descendant::text()='\u6b21\u306e\u8a18\u4e8b\u3078']");
pref("rewindforward.rule.prev.blog.goo.ne.jp",
	"//*[@href and descendant::text()='\u524d\u306e\u8a18\u4e8b\u3078']");





// MozillaZine Forum
pref("rewindforward.rule.next.forums.mozillazine.org",
	"//*[@class='nav']//*[text()='Next']");
pref("rewindforward.rule.prev.forums.mozillazine.org",
	"//*[@class='nav']//*[text()='Previous']");

// ITMedia
pref("rewindforward.rule.next.www.itmedia.co.jp",
	"//*[text()='\u6b21\u306e\u30da\u30fc\u30b8']");
pref("rewindforward.rule.prev.www.itmedia.co.jp",
	"//*[text()='\u524d\u306e\u30da\u30fc\u30b8']");

// IT Pro
pref("rewindforward.rule.next.itpro.nikkeibp.co.jp",
	"//*[@href and text()='NEXT>']");
pref("rewindforward.rule.prev.itpro.nikkeibp.co.jp",
	"//*[@href and text()='<BACK']");





// 2ch
pref("rewindforward.rule.next.*.2ch.net",
	"//*[@href and (starts-with(text(), '\u6b211') or text()='\u6b21' or text()='\u7d9a\u304d')]");
pref("rewindforward.rule.prev.*.2ch.net",
	"//*[@href and (starts-with(text(), '\u524d1') or text()='\u524d')]");

pref("rewindforward.rule.next.*.bbspink.com",
	"//*[@href and (starts-with(text(), '\u6b211') or text()='\u6b21' or text()='\u7d9a\u304d')]");
pref("rewindforward.rule.prev.*.bbspink.com",
	"//*[@href and (starts-with(text(), '\u524d1') or text()='\u524d')]");

// JBBS/したらば
pref("rewindforward.rule.next.jbbs.livedoor.jp",
	"//*[@href and (text()='\u6b21\u306e\u30da\u30fc\u30b8') or text()='\u65b0\u7740\u8868\u793a']");
pref("rewindforward.rule.prev.jbbs.livedoor.jp",
	"//*[@href and text()='\u524d\u306e\u30da\u30fc\u30b8']");





// from http://swdyh.infogami.com/autopagerize

// Dailymotion
pref("rewindforward.rule.next.www.dailymotion.com",
	"(//div[@class='dm_widget_pagination'])[last()]/div[@class='next']/a");
pref("rewindforward.rule.prev.www.dailymotion.com",
	"(//div[@class='dm_widget_pagination'])[last()]/div[@class='prev']/a");

// Blogger
pref("rewindforward.rule.next.*.blogspot.com",
	"id('Blog1_blog-pager-newer-link')");
pref("rewindforward.rule.prev.*.blogspot.com",
	"id('Blog1_blog-pager-older-link')");

// It's Knuttz
pref("rewindforward.rule.next.knuttz.net",
	"((//div[@class='navigator'])[last()]//a)[last()]");

// tumblr(dashboard)
pref("rewindforward.rule.next.www.tumblr.com",
	"id('posts')/following-sibling::div[2]//a[last()]");

// tumblr(dashboard)
pref("rewindforward.rule.next.*.tumblr.com",
	"//div[@id='content' or @id='container']/div[last()]/a[last()]");

// CNET Venture View
pref("rewindforward.rule.next.v.japan.cnet.com",
	"//div[@class='next']/a");

// Last.fm Charts
pref("rewindforward.rule.next.www.last.fm",
	"//a[@class='nextlink']");
