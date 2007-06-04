/*
 *Note:
   Rules for search engines (or some services) should be made strictly.
   Because, if you use a simple rule like "*[text()='>>']", it possibly
   match for texts in search results.
*/


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

// はてなアンテナ
pref("rewindforward.rule.next.a.hatena.ne.jp",
	"id('pager_bottom')/a[@class='navi_next']");

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

// はてなブックマーク - タグ・キーワード
// はてなブックマーク - 注目エントリー
// はてなブックマーク
pref("rewindforward.rule.next.b.hatena.ne.jp",
	"(//div[@class='pager'])[last()]/a[last()]|//div[@class="pager"]/a[last()]|//div[@class="pager"][last()]//a[last()]");

// MozillaZine Forums
// MozillaZine Forums (topic)
pref("rewindforward.rule.next.forums.mozillazine.org",
	"id('main')/form/table[last()]//a[text()='Next']|//a[starts-with(@href, 'viewtopic.php') and text()='Next']");
pref("rewindforward.rule.prev.forums.mozillazine.org",
	"id('main')/form/table[last()]//a[text()='Previous']|//a[starts-with(@href, 'viewtopic.php') and text()='Previous']");

// Twitter検索
pref("rewindforward.rule.next.twitter.1x1.jp",
	"//a[text()='>>']");
pref("rewindforward.rule.prev.twitter.1x1.jp",
	"//a[text()='<<']");

// YouTube(results)
// YouTube(profile_videos)
pref("rewindforward.rule.next.*.youtube.com",
	"id('mainContentWithNav')/div[1]/a[last()][text()='Next']|//div[@class='pagingDiv']/a[last()]");

// Ziddyちゃんの「私を社食に連れてって」
pref("rewindforward.rule.next.japan.zdnet.com",
	"id('paging_next')");

// Flickr (set - 詳細ページ)
// Flickr (set - サムネイルページ)
// Flickr (search - 検索結果)
// Flickr (tags)
// Flickr (groups/pool)
// Flickr (favorites)
// Flickr (その他)
pref("rewindforward.rule.next.*.flickr.com",
	"//a[@class='Next']");

// userscripts.org
pref("rewindforward.rule.next.userscripts.org",
	"id('content')//a[text()='Next page']");

// マイコミジャーナル(articles/column)
pref("rewindforward.rule.next.journal.mycom.co.jp",
	"//li[@class='nextBtn']/a[last()]");
pref("rewindforward.rule.prev.journal.mycom.co.jp",
	"//li[@class='nextBtn']/a[first()]");

// Vintage Photographs
pref("rewindforward.rule.next.community.livejournal.com",
	"id('skiplinks')/li[last()]/a");
pref("rewindforward.rule.prev.community.livejournal.com",
	"id('skiplinks')/li[first()]/a");

// Twitter(doing)
pref("rewindforward.rule.next.twitter.com",
	"//div[@class='pagination']/a[last()]");
pref("rewindforward.rule.prev.twitter.com",
	"//div[@class='pagination']/a[first()]");

// del.icio.us
pref("rewindforward.rule.next.del.icio.us",
	"//a[@accesskey='e']");

// YahooJapan検索
pref("rewindforward.rule.next.search.yahoo.co.jp",
	"id('yschpg')/p/big[last()]/a|//*[starts-with(text(), '\u6b21\u306e') and contains(text(), '\u4ef6\u3092\u8868\u793a')]");
pref("rewindforward.rule.prev.search.yahoo.co.jp",
	"id('yschpg')/p/big[first()]/a|//*[starts-with(text(), '\u524d\u306e') and contains(text(), '\u4ef6\u3092\u8868\u793a')]");

// Yahoo! Japan Auctions
pref("rewindforward.rule.next.search.auction.yahoo.co.jp",
	"//td[@align='right' and @width='1%']/small/b[last()]/a|//*[starts-with(text(), '\u6b21\u306e') and contains(text(), '\u4ef6')]");
pref("rewindforward.rule.prev.search.auction.yahoo.co.jp",
	"//td[@align='right' and @width='1%']/small/b[first()]/a|//*[starts-with(text(), '\u524d\u306e') and contains(text(), '\u4ef6')]");

// UP板＠おっちゃんねる サムネイル一覧
pref("rewindforward.rule.next.up.nm78.com",
	"//p[@class='menu']/a[last()]");
pref("rewindforward.rule.prev.up.nm78.com",
	"//p[@class='menu']/a[first()]");

// はてなカウンター(ログ)
pref("rewindforward.rule.next.counter.hatena.ne.jp",
	"//div[@class='pager'][last()]/a[last()]");

// はてな匿名ダイアリー
pref("rewindforward.rule.next.anond.hatelabo.jp",
	"//div[@class='pager-l'][last()]/a[last()]");

// reddit.com
pref("rewindforward.rule.next.*.reddit.com",
	"id('main')/p[@class='menu']/a[last()]");
pref("rewindforward.rule.prev.*.reddit.com",
	"id('main')/p[@class='menu']/a[first()]");

// Amazon.co.jp
pref("rewindforward.rule.next.www.amazon.co.jp",
	"//a[@class='paginationNext'][last()]|(//TD[@align='right']//*[@alt='\u7d9a\u304d\u3092\u898b\u308b'] | //A[text()='\u6b21\u3078'])");
pref("rewindforward.rule.prev.www.amazon.co.jp",
	"(//TD[@align='right']//*[@alt='\u524d\u306e\u30da\u30fc\u30b8'] | //A[text()='\u623b\u308b'])");

// Amazon.com
pref("rewindforward.rule.next.www.amazon.com",
	"//a[@class='paginationNext'][last()]|(//TD[@align='right']//*[@alt='More Results'] | //A[text()='next'])");
pref("rewindforward.rule.prev.www.amazon.com",
	"(//TD[@align='right']//*[@alt='Previous'] | //A[text()='previous'])");

// yaplog!
pref("rewindforward.rule.next.yaplog.jp",
	"//ul[@class='page s']/li[last()]/a");
pref("rewindforward.rule.prev.yaplog.jp",
	"//ul[@class='page s']/li[first()]/a");

// はてなダイアリー
pref("rewindforward.rule.next.*.d.hatena.ne.jp",
	"//div[@class='calendar']/a[contains(@href, '?of=')][1]");

// はてなグループ
pref("rewindforward.rule.next.*.g.hatena.ne.jp",
	"//div[@class='calendar']/a[contains(@href, '?of=')][1]");

// Google Scholar
pref("rewindforward.rule.next.scholar.google.com",
	"//div[@class='n']/table/tbody/tr/td[last()]/a");

// CPAN Search
pref("rewindforward.rule.next.search.cpan.org",
	"//div[@class='pages']//td//a[first()]");

// TTYShare Recent entries
pref("rewindforward.rule.next.ttyshare.com",
	"id('pager')/p[@class='pages']/a[@class='next']");

// 田原総一朗の政財界「ここだけの話」
// 日経BPネット (ネットマーケティング)
// 日経BPネット (ビジネススタイル/ワークスタイル/L-Cruise/環境)
// 日経BPネット (セカンドステージ)
pref("rewindforward.rule.next.www.nikkeibp.co.jp",
	"id('p_next') | id('pages')//a[last()] | id('pages')/a[last()] | //img[contains(@src ,'p_next.gif')]/parent::a");
pref("rewindforward.rule.prev.www.nikkeibp.co.jp",
	"id('pages')//a[first()] | id('pages')/a[first()]");

// oebit
pref("rewindforward.rule.next.oebit.jp",
	"id('PageTextLinkBack')//a");

// Open Tech Press
pref("rewindforward.rule.next.opentechpress.jp",
	"//div[@class='body']/a[@title='\u6b21\u306e\u30da\u30fc\u30b8']");

// テクノラティ
pref("rewindforward.rule.next.technorati.*",
	"//a[@class='next-page']");

// The Babes of Flickr
pref("rewindforward.rule.next.flickrbabes.com",
	"//span[@class='previous']/a");
pref("rewindforward.rule.prev.flickrbabes.com",
	"//span[@class='next']/a");

// You Sexy Thing
pref("rewindforward.rule.next.www.feedfinder.net",
	"//a[contains(text(), 'Next Page')][last()]");

// SUPERMODELS.NL
pref("rewindforward.rule.next.supermodels.nl",
	"//a[text()='Next page']");

// ACM Digital Library
pref("rewindforward.rule.next.portal.acm.org",
	"//a[contains(text(), 'next')][last()]");

// 楽天
pref("rewindforward.rule.next.esearch.rakuten.co.jp",
	"//b[starts-with(text(),'\u6b21')]/parent::a");

// teacup.com
pref("rewindforward.rule.next.teacup.com",
	"//a[@class='PL_JUMP'][last()]");
pref("rewindforward.rule.prev.teacup.com",
	"//a[@class='PL_JUMP'][first()]");

// thomas mayer
pref("rewindforward.rule.next.thomasmayerarchive.de",
	"//a[@class='paging'][starts-with(text()'Next page')]");

// eBum.com
pref("rewindforward.rule.next.www.abum.com",
	"//a[@class='next']");

// ITMedia
pref("rewindforward.rule.next.www.itmedia.co.jp",
	"id('next')/a|//*[text()='\u6b21\u306e\u30da\u30fc\u30b8']");
pref("rewindforward.rule.prev.www.itmedia.co.jp",
	"//*[text()='\u524d\u306e\u30da\u30fc\u30b8']");

// TECHSCORE
pref("rewindforward.rule.next.www.techscore.com",
	"//img[@src='/image/next.gif']/parent::a");

// http://blog-log.jugem.jp/
pref("rewindforward.rule.next.blog-log.jugem.jp",
	"id('txt-page-next')/a");

// SCRAPTURE
pref("rewindforward.rule.next.scrapture.org",
	"//div[@class='pages']//a[last()]");
pref("rewindforward.rule.prev.scrapture.org",
	"//div[@class='pages']//a[first()]");

// ALTphotos
pref("rewindforward.rule.next.www.altphotos.com",
	"//a[text()='NEXT>' or text()='>>']");

// ニコニコ動画
pref("rewindforward.rule.next.www.nicovideo.jp",
	"//a[child::img[@src='img/common/pager_next_on.gif']]");
pref("rewindforward.rule.prev.www.nicovideo.jp",
	"//a[child::img[@src='img/common/pager_back_on.gif']]");

// メリットデメリット
pref("rewindforward.rule.next.jp.meritdemerit.com",
	"id('main')/a[contains(text(),'Next')]");

// Google News
pref("rewindforward.rule.next.news.google.*",
	"id('navbar')/table/tbody/tr/td[last()]/a");

// Google
pref("rewindforward.rule.next.*.google.*",
	"id('navbar')/table/tbody/tr/td[last()]/a | //TABLE[@align='center']//*[text()='Next' or text()='\u6b21\u3078']");
pref("rewindforward.rule.prev.*.google.*",
	"id('navbar')/table/tbody/tr/td[first()]/a | //TABLE[@align='center']//*[text()='Prev' or text()='\u524d\u3078']");

// photobucket
pref("rewindforward.rule.next.*.photobucket.com",
	"//a[text()='next']");
