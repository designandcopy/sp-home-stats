const scrapeIt = require("scrape-it")

const allarticles =
  "#content-main .teaser .article-title" +
  "," +
  "#content-main .teaser .article-list li"

const scrapeSpiegelOnlineHome = scrapeIt(
  "http://spiegel.de",
  {
    // get all posts
    mainContentArea: {
      listItem: allarticles,
      name: "links",
      data: {
        location: {
          selector: "a",
          attr: "href"
        },
        // the prefix part of the headline
        headlineintro: ".headline-intro, .asset-headline-intro",
        // the core bit of the headline
        headline: ".headline, .asset-headline",
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
    plusmodulebox: {
      listItem:
        "#content-main .module-box.spiegelplus .spiegelplus.js-lp-article-link",
      data: {
        location: {
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
    sidebar: {
      listItem: ".column-small .asset-box li > a.spiegelplus",
      data: {
        location: {
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
  const retrieved = new Date() // timestamp

  // process main articles
  const articlesMainArea = data.mainContentArea.map((article, i) => {
    const paidcontent = article.articleID > 0 || article.classnames != undefined
    return Object.assign({}, article, {
      position: i + 1,
      paidcontent,
      retrieved,
      area: "main"
    })
  })

  // process spiegel plus module container in main area
  const articlesPlusModuleBox = data.plusmodulebox.map((article, i) =>
    Object.assign({}, article, {
      position: i + 1,
      paidcontent: true,
      retrieved,
      area: "spiegel plus modulebox"
    })
  )

  // process sidebar
  const articlesSidebar = data.sidebar.map((article, i) =>
    Object.assign({}, article, {
      position: i + 1,
      paidcontent: true,
      retrieved,
      area: "sidebar"
    })
  )

  /* filtering the results for SpiegelPlus articles only */

  // get just the paid articles in the "main content area"
  // const mainPlusArticles = mainArticlesWithIndex.filter(
  //   article => article.articleID > 0 || article.classnames != undefined
  // )

  console.log("---------------------------------------------")
  console.log("---------------------------------------------")
  console.log("MAIN ARTICLE AREA:")
  console.log("---------------------------------------------")

  articlesMainArea.map(article => {
    console.log(article)
    console.log("---------------------------------------------")
  })

  console.log("---------------------------------------------")
  console.log("---------------------------------------------")
  console.log("SPIEGEL PLUS MODULE BOX:")
  console.log("---------------------------------------------")

  articlesPlusModuleBox.map(article => {
    console.log(article)
    console.log("---------------------------------------------")
  })

  console.log("---------------------------------------------")
  console.log("---------------------------------------------")
  console.log("SPIEGEL PLUS SIDEBAR WIDGET:")
  console.log("---------------------------------------------")

  articlesSidebar.map(article => {
    console.log(article)
    console.log("---------------------------------------------")
  })
}
