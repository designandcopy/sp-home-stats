const scrapeIt = require("scrape-it")
const fs = require("fs")

const allarticles =
  "#content-main .teaser .article-title" +
  "," +
  "#content-main .teaser .article-list li"

const scrapeSpiegelOnlineHome = scrapeIt(
  "http://spiegel.de",
  {
    // get all posts
    postsInMainContent: {
      listItem: allarticles,
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
  },
  (err, page) => {
    // send the scraped info to the parser function
    formatData(err || page)
  }
)

formatData = data => {
  // timestamp
  const prettyDate = () => {
    const now = new Date()
    return now.toISOString()
  }
  const retrieved = prettyDate()

  // process main articles
  const dataMainArea = data.postsInMainContent.map((article, i) => {
		const getArticleIDFromURL = article.url.match(/\d{6,}(?=\.html)/)
		const fallbackArticleID = getArticleIDFromURL != null ? getArticleIDFromURL.toString() : undefined
    const paidcontent = article.articleID > 0 || article.classnames != undefined
    return Object.assign(
      {},
			article,
      {
				position: i + 1,
				articleid: fallbackArticleID,
        paidcontent,
        retrieved,
        area: "main"
      }
    )
  })

  // process spiegel plus module container in main area
  const dataPlusModuleBox = data.postsInPlusModuleBox.map((article, i) => {
  return Object.assign(
      {},
			article,
      {
        position: i + 1,
        paidcontent: true,
        retrieved,
        area: "spiegel plus modulebox"
      }
    )
  })

  // process sidebar
  const dataSidebar = data.postsInSideBarWidget.map((article, i) => {
    let fallbackArticleID = article.url.match(/\d{6,}(?=\.html)/)
    return Object.assign(
      {},
			article,
      {
        position: i + 1,
        articleid: fallbackArticleID,
        paidcontent: true,
        retrieved,
        area: "sidebar"
      }
    )
  })

  const collectedData = []
	collectedData.push(dataMainArea, dataPlusModuleBox, dataSidebar)

  const finalData = [].concat(...collectedData)

  console.log(JSON.stringify(finalData))
}
