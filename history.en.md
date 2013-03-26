# History

 - 2.1.2009091201
   * Fixed: Errors on switching focus of tabs disappeared. (regression on 2.1.2009091101)
 - 2.1.2009091101
   * [bug 515529](https://bugzilla.mozilla.org/show_bug.cgi?id=515529)
 - 2.1.2009091001
   * [bug 515529](https://bugzilla.mozilla.org/show_bug.cgi?id=515529)
 - 2.1.2009072703
   * Fixed: Permission error on saving SITEINFO cache on Linux disappeared. (Note: If you run one of versions from 2.1.2009072701 to 2.1.2009072702, you have to remove old directory manually. Please remove the directory "~/.mozilla/firefox/profile/rewindforward".
 - 2.1.2009072702
   * Fixed: Initializing error disappeared.
 - 2.1.2009072701
   * Fixed: Crash caused by too long regular expressions disappeared.
 - 2.1.2009062501
   * Works on Firefox 3.5.
   * Theme on Mac OS X is updated for Firefox 3.5.
   * Improved: "Prev." and "Next" are available in the popup menu on "Back" and "Forward" buttons.
   * Improved: Now [SITEINFOs for AutoPagerize on Wedata](http://wedata.net/databases/AutoPagerize/items) is used instead of old style SITEINFOs.
   * Fixed: Menu-separators are correctly inserted to the popup on "Back" and "Forward" buttons.
 - 2.1.2008062002
   * Broken package is replaced.
 - 2.1.2008062001
   * Fixed: Small toolbar icons are shown with default-theme-like style correctly in Firefox 3 on Windows.
 - 2.1.2008052701
   * Fixed: Initial dialog to confirm adding the toolbar button is shown correctly in Mac OS X.
 - 2.1.2008042801
   * Fixed: Themes are updated for the latest Trunk.
 - 2.1.2008042201
   * Works on Firefox 3 beta5.
   * Improved: New appearance for Firefox 3 is available.
   * Improved: Changing of buttons' appearance is applied immediately.
   * Fixed: "Previous Page" and "Next Page" buttons unified to "Back" and "Forward" buttons work correctly.
 - 2.0.2008022701
   * Fixed: Manually reloaded SiteInfo is applied immediately.
 - 2.0.2008022501
   * Updated: Italian locale is updated. (by Godai71.Extenzilla)
 - 2.0.2008022301
   * Fixed: Exceptions for the auto-loading of next pages by scrolling on bottom of pages work correctly.
   * Added: Italian locale is available. (by Godai71.Extenzilla)
 - 2.0.2008021904
   * Fixed: Some problems on parsing SiteInfo disappeared.
 - 2.0.2008021903
   * Fixed: SiteInfo for AutoPagerize is loaded correctly.
 - 2.0.2008021902
   * Fixed: Site info for Hatena Group is corrected.
   * Modified: Custom site info for this extension is available on line.
 - 2.0.2008021901
   * Modified: Previous and next pages are detected for bakground tabs when they are loaded.
   * Fixed: SiteInfo for AutoPagerize is loaded correctly.
   * Fixed: Sequencial URIs are detected correctly.
 - 2.0.2008021701
   * Improved: Works on Firefox 3 beta3.
   * Fixed: Syntax errors in SiteInfo(s) for AutoPagerize are ignored correctly. Many broken behaviors of Firefox will disappear.
 - 2.0.2007120901
   * Fixed: English locale is corrected.
 - 2.0.2007120601
   * Improved: Exceptions can be customizable for the auto-loading of next pages by scrolling on bottom of pages.
   * Improved: Each condition to find links which is to next/previous pages can be enabled or disabled separately.
   * Fixed: XPath expressions to find next/pvevious links can be cuztomized correctly.
   * Fixed: "Back" and "Forward" menuitems in the popup of toolbar buttons work correctly.
 - 2.0.2007110603
   * Fixed: "Back" and "Forward" buttons don't turn to "Rewind" and "Fastforward" if there is real "Rewind" and "Fastforward" button.
 - 2.0.2007110602
   * Fixed: "Rewind" and "Fastforward" buttons don't turn to "Prev" and "Next" if there is real "Prev" or "Next" button.
 - 2.0.2007110601
   * Fixed: "Rewind" and "Fastforward" becomes "Next" and "Prev" correctly.
   * Fixed: Dropped entry of English locale is corrected.
   * Fixed: Buttons are initialized before and after customizing toolbar.
 - 2.0.2007110501
   * Fixed: Links are found from rules correctly.
 - 2.0.2007110401
   * Improved: [Site info for AutoPagerize](http://swdyh.infogami.com/autopagerize) is automatically imported.
 - 1.4.2007061801
   * Improved: Rules to find the link to the next page are imported from [the rules for AutoPagerize](http://swdyh.infogami.com/autopagerize).
   * Fixed: Initializing problem about toolbar buttons disappeared.
 - 1.4.2006100801
   * Modified: Default theme is recreated for Firefox 2.0.
   * Fixed: Initial startup problem (toolbar is not initialized) is solved.
 - 1.4.20060427
   * Fixed: "Forward" button doesn't change to "Fastforward" if you're browsing last 2 pages of the session history.
 - 1.4.20060406
   * Fixed: The auto-loading feature for scrolling on the top or the end of sequencial webpages ignores incorrect key-events correctly. By this change, Gmail and some other services are available.
   * Improved: Menu-icons are available for "Back" and "Forward" menuitem in the popup of these buttons which work as "Rewind" or "Fastforward".
 - 1.4.20060405
   * Improved: You can use "Back" and "Forward" buttons as "Rewind/Previous Page" and "Fastforward/Next Page" button, if you don't want to put custom buttons in the toolbar.
   * Fixed: XPath rules for blog.goo.ne.jp are updated.
 - 1.3.20060113
   * Fixed: Empty navigation-bar doesn't show initializing dialog anymore.
 - 1.3.20051105
   * Improved: This extension inserts its toolbar buttons to the navigation toolbar on the first startup automatically.
   * Improved: This extension shows confirming dialog on the first startup.
 - 1.3.20051020
   * Fixed: Works correctly on Firefox 1.5 branch.
 - 1.3.20050429
   * Improved: "Back" or "Forward" will be done instead of loading the link, if you've already visited the "previous" or "next" page.
 - 1.3.20050428
   * Improved: Behavior of "Rewind" and "Fastforward" feature becomes customizable.
   * Improved: Detecting of Next or Previous pages becomes better.
   * Fixed: "Load the next page from the end of the page" feature works correctly on Firefox 1.0.3. (by jzkey)
 - 1.3.20050420
   * Fixed: Some internal operations are brushed up.
 - 1.3.20050419
   * Fixed: Some fatal errors disappeared.
 - 1.3.20050418
   * Modified: Codes to access content area become secure.
 - 1.3.20050409
   * Fixed: Works on Firefox 1.0.3 RC builds correctly (maybe).
 - 1.3.20050314
   * Fixed: Auto-detection for related pages (the next or the previous) works correctly when the page is loaded completely.
 - 1.3.20050305
   * Improved: Auto-detection priority for related pages (the next or the previous) is modified.
 - 1.3.20050218
   * Improved: Auto-detection for related pages (the next or the previous) is improved on a few points.
 - 1.3.20050202
   * Fixed: Parsing of sequential URIs gets more intelligent on a few points.
   * Improved: This version can parse webpages with frames. (The largest frame will be parsed as the main frame.)
 - 1.2.20041216
   * Fixed: Automatic loading on the end (or the top) of webpages by overscrolling action is available for sequential URIs.
   * Fixed: IP addresses and port numbers are ignored by the auto-discovering feature.
 - 1.2.20041214
   * Improved: A new feature is available: you can visit next or previous page if the URI seems sequential.
 - 1.2.20041018
   * Improved: Switching speed of tabs is improved. Found links are cached for each tab.
 - 1.2.20040920
   * Fixed: Right-click on buttons are ignored correctly.
   * Modified: Icons of buttons are renewed.
 - 1.2.20040919
   * Improved: "Next page" and "Previous page" buttons are available.
 - 1.2.20040708
   * Fixed: Setting to disable automatic transferring to next/previous page for scrolling on end/start of pages has worked correctly.
   * Fixed: Lost-settings problem has disappeared.
   * Improved: Finding operation of next/previous pages has been optimized for too many user-defined rules.
 - 1.2.20040703
   * Fixed: Initializing error has been resolved.
   * Modified: Default buttons have been redesigned for Firefox 0.9 Theme. (But this version includes old buttons for Qute theme.)
   * Improved: "Next" and "Previous" buttons have been enabled/disabled separately like Opera.
   * Improved: Rules for MozillaZine Forum and ITMedia(japan) have been available.
 - 1.2.20040622
   * Fixed: Global rule specified for any domain with "*" works correctly.
 - 1.2.20040621
   * Fixed: Icons for Mozilla Suite has corrected on a few point.
   * Fixed: "Add" button has been enabled by default for matching patterns.
   * Improved: Rules for www.teoma.com have been available. (by Norbert Wienholz)
 - 1.2.20040612
   * Fixed: Matching rules dialog has been available in English.
   * Fixed: Broken appearance of matching rules has disappeared in Firefox 0.9 branch or others.
   * Fixed: Buttons and menu items have been disabled when no row is selected.
   * Modified:  `!important`  rules have disappeared from the default theme.
 - 1.2.20040611
   * Improved: A new dialog for customizing rules to find Next and Previous pages has been available.
   * improved: Wildcards have been available for domain names.
   * Fixed: Next and previous pages in frames have been loaded into the frame correctly.
   * Fixed: Autoloading of next/previous pages on the bottom/top of webpages has worked correctly for no-scrollbar pages.
 - 1.2.20040607
   * Improved: XPath expressions to find next and previous pages have been customizable.
   * Improved: Next or previous pages have been loaded automatically when you scroll down/up on the end/start of pages.
   * Improved: Related pages have been found from texts more smartly.
 - 1.1.20040523
   * Fixed: Errors on Mozilla Suite have disappeared.
   * Fixed: Nodes which are not "link" have been ignored correctly.
 - 1.1.20040517
   * Improved: This has worked on Mozilla Suite and Netscape 7.
   * Improved: History items have been available in the context menu on buttons.
 - 1.0.20040516
   * Improved: Some links have been presumed related pages by their labels.
   * Fixed: Related links have worked correctly.
   * Fixed: Reverse links have been found correctly.
   * Improved: The feature to find related pages has been able to be disabled.
 - 1.0.20040515
   * This is the first version.
   * Improved: Middle-click has been available to open target in new tab.
