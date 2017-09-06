module.exports = {
  site: "http://spiegel.de",
  selectors: {
    // get all posts
    postsInMainContent: {
			listItem: "#content-main .teaser .article-title, #content-main .teaser .article-list li",
      name: "links",
      data: {
        url: {
          selector: "a",
          attr: "href"
        },
        // the core bit of the headline
        headline: ".headline, .asset-headline",
        // the prefix part of the headline
        headlineintro: ".headline-intro, .asset-headline-intro",
        articleID: {
          selector: ".spiegelplus",
          // this data attr contains the LP article ID
          attr: "data-lp-article-id"
        },
        classnames: {
          selector: ".headline, .asset-headline",
          // premium articles without teaser lack the data attr
          attr: "class"
        },
        premiumclassnames: {
          selector: ".spiegelplus",
          // premium articles without teaser lack the data attr
          attr: "class"
        }
      }
    },
    // get the spiegel plus module box
    postsInPlusModuleBox: {
      listItem:
        "#content-main .module-box.spiegelplus .spiegelplus.js-lp-article-link",
      data: {
        url: {
          attr: "href"
        },
        // the core bit of the headline
        headline: ".headline",
        // the prefix part of the headline
        headlineintro: ".headline-intro",
        articleID: {
          attr: "data-lp-article-id"
        },
        classnames: {
          selector: ".headline, .asset-headline",
          // premium articles without teaser lack the data attr
          attr: "class"
        }
      }
    },
    postsInSideBarWidget: {
      listItem: ".column-small .asset-box li > a.spiegelplus",
      data: {
        url: {
          attr: "href"
        },
        // the core bit of the headline
        headline: ".asset-headline",
        // the prefix part of the headline
        headlineintro: ".asset-headline-intro",
        articleID: {
          attr: "data-lp-article-id"
        }
      }
    }
  }
}

