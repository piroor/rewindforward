/*
 *Note:
   Rules for search engines (or some services) should be made strictly.
   Because, if you use a simple rule like "*[text()='>>']", it possibly
   match for texts in search results.
*/


// Infoseek
pref("rewindforward.rule.next.search.www.infoseek.co.jp",
	"//span[@class='sl-next']/a");
pref("rewindforward.rule.prev.search.www.infoseek.co.jp",
	"//span[@class='sl-back']/a");

// goo
pref("rewindforward.rule.next.search.goo.ne.jp",
	"id('paging')/a[last()][child::strong]");
pref("rewindforward.rule.prev.search.goo.ne.jp",
	"id('paging')/a[1][child::strong]");

// teoma (by Norbert Wienholz)
pref("rewindforward.rule.next.*.teoma.com",
 "//*[text()='>>']");
pref("rewindforward.rule.prev.*.teoma.com",
 "//*[text()='<<']");

// AllAbout Japan
pref("rewindforward.rule.next.allabout.co.jp",
	"//a[child::img[contains(@src, 'icn_next.gif')]]");
pref("rewindforward.rule.prev.allabout.co.jp",
	"//a[child::img[contains(@src, 'icn_back.gif')]]");



// Bulkfeeds
pref("rewindforward.rule.next.bulkfeeds.net",
	"//span[@class='searchResultCurrent']/following-sibling::A");
pref("rewindforward.rule.prev.bulkfeeds.net",
	"//span[@class='searchResultCurrent']/preceding-sibling::A");




// ココログ
pref("rewindforward.rule.next.*.cocolog-nifty.com",
	"//*[@class='entry-nav']//*[contains(text(), '\u00bb')]");
pref("rewindforward.rule.prev.*.cocolog-nifty.com",
	"//*[@class='entry-nav']//*[contains(text(), '\u00ab')]");

// Mixi
pref("rewindforward.rule.next.mixi.jp",
	"//a[contains(text(), '\u6b21\u3092\u8868\u793a')]");
pref("rewindforward.rule.prev.mixi.jp",
	"//a[contains(text(), '\u524d\u3092\u8868\u793a')]");

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


// Getchu.com 詳細検索
// Getchu.com カレンダー
pref("rewindforward.rule.next.www.getchu.com",
	"//a[@title='next page']|//center/a[last()]");

// SHOUTcast
pref("rewindforward.rule.next.www.shoutcast.com",
	"//a[text()='[ Next ]']");

// fc2 blog
pref("rewindforward.rule.next.*.blog*.fc2.com",
	"//div[@class='pageLink']/a[last()]");

// 2ch.ru/g
pref("rewindforward.rule.next.2ch.ru",
	"//body/table[last()]/tbody/tr/td[last()]/form");

// FFFFOUND!
pref("rewindforward.rule.next.ffffound.com",
	"id('paging-next')");

// Style.com
pref("rewindforward.rule.next.www.style.com",
	"(//a[@class='paginator'])[last()]");

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
	"(//div[@class='pager'])[last()]/a[last()]|//div[@class='pager']/a[last()]|//div[@class='pager'][last()]//a[last()]");

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
	"//li[@class='nextBtn']/a[1]");

// Vintage Photographs
pref("rewindforward.rule.next.community.livejournal.com",
	"id('skiplinks')/li[last()]/a");
pref("rewindforward.rule.prev.community.livejournal.com",
	"id('skiplinks')/li[1]/a");

// Twitter(doing)
pref("rewindforward.rule.next.twitter.com",
	"//div[@class='pagination']/a[last()]");
pref("rewindforward.rule.prev.twitter.com",
	"//div[@class='pagination']/a[1]");

// del.icio.us
pref("rewindforward.rule.next.del.icio.us",
	"//a[@accesskey='e']");

// Yahoo! Shopping Auctions
pref("rewindforward.rule.next.search.auctions.shopping.yahoo.com",
	"//*[text()='Next >>']");
pref("rewindforward.rule.prev.search.auctions.shopping.yahoo.com",
	"//*[text()='<< Prev']");

// Yahoo! Japan Auctions
pref("rewindforward.rule.next.search.auction.yahoo.co.jp",
	"//td[@align='right' and @width='1%']/small/b[last()]/a");
pref("rewindforward.rule.prev.search.auction.yahoo.co.jp",
	"//td[@align='right' and @width='1%']/small/b[1]/a");

// Yahoo検索
pref("rewindforward.rule.next.*.yahoo.*",
	"id('yschpg')//big[last()]/a | id('yshppg')//big[last()]/a");
pref("rewindforward.rule.prev.*.yahoo.*",
	"id('yschpg')//big[1]/a | id('yshppg')//big[1]/a");

// UP板＠おっちゃんねる サムネイル一覧
pref("rewindforward.rule.next.up.nm78.com",
	"//p[@class='menu']/a[last()]");
pref("rewindforward.rule.prev.up.nm78.com",
	"//p[@class='menu']/a[1]");

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
	"id('main')/p[@class='menu']/a[1]");

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
	"//ul[@class='page s']/li[1]/a");

// はてなダイアリー
pref("rewindforward.rule.next.*.d.hatena.ne.jp",
	"//div[@class='calendar']/a[last()]");
pref("rewindforward.rule.next.d.hatena.ne.jp",
	"//div[@class='calendar']/a[last()]");
pref("rewindforward.rule.prev.*.d.hatena.ne.jp",
	"//div[@class='calendar']/a[1]");
pref("rewindforward.rule.prev.d.hatena.ne.jp",
	"//div[@class='calendar']/a[1]");


// はてなグループ
pref("rewindforward.rule.next.*.g.hatena.ne.jp",
	"//div[@class='calendar']/a[contains(@href, '?of=')][last()]|//div[@class='calendar']/a[last()]");
pref("rewindforward.rule.prev.*.g.hatena.ne.jp",
	"//div[@class='calendar']/a[contains(@href, '?of=')][1]|//div[@class='calendar']/a[1]");

// Google Scholar
pref("rewindforward.rule.next.scholar.google.com",
	"//div[@class='n']/table/tbody/tr/td[last()]/a");

// CPAN Search
pref("rewindforward.rule.next.search.cpan.org",
	"//div[@class='pages']//td//a[last()]");
pref("rewindforward.rule.prev.search.cpan.org",
	"//div[@class='pages']//td//a[1]");

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
	"id('pages')//a[1] | id('pages')/a[1]");

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
	"//a[@class='PL_JUMP'][1]");

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
	"//div[@class='pages']//a[1]");

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
	"id('navbar')/table/tbody/tr/td[1]/a | //TABLE[@align='center']//*[text()='Prev' or text()='\u524d\u3078']");

// photobucket
pref("rewindforward.rule.next.*.photobucket.com",
	"//a[text()='next']");

// pigmotel
pref("rewindforward.rule.next.www.pigmotel.com",
	"//a[@class='next']");

// Orbium
pref("rewindforward.rule.next.sasapanda.net",
	"//div[@class='previous']/a[1]");

// Wikipedia検索
pref("rewindforward.rule.next.athlon64.fsij.org",
	"//a[@class='navi'][last()]");

// 1470.net 新着メモ
pref("rewindforward.rule.next.1470.net",
	"(//div[@class='pageNavigationArea']//a)[last()]");

// Saaf
pref("rewindforward.rule.next.saaf.jp",
	"//a[@class='next']");

// find.2ch.net
pref("rewindforward.rule.next.find.2ch.net",
	"//a[text()='\u6b21\u3078']");

// Wassr 日本中のひとこと、MYページ
pref("rewindforward.rule.next.wassr.jp",
	"(//div[@class='PageNav']/p/a)[last()]");

// 日経BP ITpro コラム
pref("rewindforward.rule.next.itpro.nikkeibp.co.jp",
	"//a[text()='>>']|//*[@href and text()='NEXT>']");
pref("rewindforward.rule.prev.itpro.nikkeibp.co.jp",
	"//a[text()='<<']|//*[@href and text()='<BACK']");

// 日経BP ITpro コラム
pref("rewindforward.rule.next.business.nikkeibp.co.jp",
	"//img[@src='/nboimgs/btn_next.gif']/parent::a");
pref("rewindforward.rule.prev.business.nikkeibp.co.jp",
	"//img[@src='/nboimgs/btn_back.gif']/parent::a");

// デジタルARENA
pref("rewindforward.rule.next.arena.nikkeibp.co.jp",
	"(id('articlecontent')/ul[@class='page']//a)[last()]");
pref("rewindforward.rule.prev.arena.nikkeibp.co.jp",
	"(id('articlecontent')/ul[@class='page']//a)[1]");

// [Z]ZAPAブロ〜グ2.0
pref("rewindforward.rule.next.zapanet.info",
	"//div[@class='in']/div[@class='ido']/span[@class='next']/a");

// Son of a BIT
pref("rewindforward.rule.next.uchihara.info",
	"//a[4]");

// danbooru
pref("rewindforward.rule.next.miezaru.donmai.us",
	"(id('paginator')/a[@class='arrow'])[last()]");
pref("rewindforward.rule.prev.miezaru.donmai.us",
	"(id('paginator')/a[@class='arrow'])[1]");

// @IT
pref("rewindforward.rule.next.www.atmarkit.co.jp",
	"//a[contains(img/@src,'/images/next.gif')]");
pref("rewindforward.rule.prev.www.atmarkit.co.jp",
	"//a[contains(img/@src,'/images/prev.gif')]");

// はてな検索
pref("rewindforward.rule.next.search.hatena.ne.jp",
	"id('hatena-search-pager')/strong[last()]/a");
pref("rewindforward.rule.prev.search.hatena.ne.jp",
	"id('hatena-search-pager')/strong[1]/a");

// LifeHacker (VIEW: Blog)
pref("rewindforward.rule.next.lifehacker.com",
	"//a[contains(string(.), 'next')]");

// デイリーポータルZ
pref("rewindforward.rule.next.portal.nifty.com",
	"(//td[@width='640' and @align='center']//a[contains(string(.), '\uff1e')])[last()]");
pref("rewindforward.rule.prev.portal.nifty.com",
	"(//td[@width='640' and @align='center']//a[contains(string(.), '\uff1c')])[last()]");

// CodeZine
pref("rewindforward.rule.next.codezine.jp",
	"//td[@class='pg_bar_next']/a");

// Iconlet
pref("rewindforward.rule.next.www.iconlet.com",
	"id('index')/a[text()='Next']");

// クックパッド(レシピ検索)
pref("rewindforward.rule.next.cookpad.com",
	"//div[@align='center']/a[text()='\u6b21\u3078\u00bb']");

// screenfluent
pref("rewindforward.rule.next.screenfluent.com",
	"id('containernavibot')/a[last()]");

// Engadget Japanese
pref("rewindforward.rule.next.japanese.engadget.com",
	"//a[starts-with(text(),'\u6b21\u306e')]");

// livedoor クリップ - マイクリップ
// livedoor クリップ - 人気ページ
// livedoor クリップ
pref("rewindforward.rule.next.clip.livedoor.com",
	"//a[@class='pager-next']|//a[@class='pager-yesterday']");
