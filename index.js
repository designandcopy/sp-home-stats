const scrapeIt = require("scrape-it")

const scrapeSpiegelOnlineHome = scrapeIt(
  "http://spiegel.de",
  {
    // get all posts
    mainposts: {
      listItem: "#js-column-dynamic-ref .article-title",
      data: {
        // the prefix part of the headline
        intro: ".article-title .headline-intro",
        // the core bit of the headline
        title: ".article-title .headline",
        articleID: {
          selector: ".spiegelplus",
          // this data attribute handily contains the LP article ID
          attr: "data-lp-article-id"
        }
      }
    },
    // get the spiegel plus module box
    plusmodulebox: {
      listItem: ".module-box.spiegelplus .spiegelplus.js-lp-article-link",
      data: {
        // the prefix part of the headline
        intro: ".headline-intro",
        // the core bit of the headline
        title: ".headline",
        articleID: {
          attr: "data-lp-article-id"
        }
      }
    }
  },
  (err, page) => {
    // send the scraped info to the parser function
    parseScrapedArticleTitles(err || page)
  }
)

parseScrapedArticleTitles = data => {
  // main articles
  const result = data.mainposts.map((article, i) =>
    Object.assign({}, article, { position: i + 1 })
  )
  const onlySpiegelPlus = result.filter(stuff => stuff.articleID > 0)

  // spiegel plus module box
  const result2 = data.plusmodulebox.map((article, i) =>
    Object.assign({}, article, { position: i + 1 })
  )

  console.log("MAIN CONTENT")
  console.log("----------------------------")
  console.log(onlySpiegelPlus)
  console.log("SPIEGEL PLUS MODULE BOX")
  console.log("----------------------------")
  console.log(result2)
}
