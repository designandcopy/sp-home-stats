const generateTimestamp = require("./helpers").generateTimestamp
const findSubStr = require("./helpers").findSubStr
/*

	EXTRACTOR FUNCTIONS

*/

// expects 'article', obj representing single article link
// returns either '123456' style article id or 'external' for e.g. bento
const getArticleIDFromURL = el => {
  if (el.articleID) {
    return el.articleID
  } else {
    const extract = el.url.match(/\d{6,}(?=\.html)/)
    if (extract) {
      return extract[0]
    } else {
      return "external"
    }
  }
}

// checks for signs of paid content links
// returns bool
const checkPaid = el => {
  // paid content has a data attr for the article ID
  if (el.articleID > 0) {
    return true
  } else {
    return findSubStr(el.premiumclassnames, ".spiegelplus")
  }
}

// checks for signs of teaser
// returns bool
const checkTeaser = el => el.classnames.indexOf("asset") === -1

/*

	MAIN

*/

module.exports = function(data) {
  // get the current datetime
  const retrieved = generateTimestamp()
  // process main articles
  const dataMainArea = data.postsInMainContent.map((article, i) => {
    const isPaidContent = checkPaid(article)
    const fallbackArticleID = getArticleIDFromURL(article)
    const hasTeaser = checkTeaser(article)
    return Object.assign({}, article, {
      position: i + 1,
      articleID: fallbackArticleID,
      paidcontent: isPaidContent,
      hasTeaser,
      retrieved,
      area: "main"
    })
  })

  // process spiegel plus module container in main area
  const dataPlusModuleBox = data.postsInPlusModuleBox.map((article, i) => {
    const fallbackArticleID = getArticleIDFromURL(article)
    return Object.assign({}, article, {
      position: i + 1,
      articleID: fallbackArticleID,
      paidcontent: true,
      hasTeaser: "unknown", //TODO
      retrieved,
      area: "spiegel plus modulebox"
    })
  })

  // process sidebar
  const dataSidebar = data.postsInSideBarWidget.map((article, i) => {
    const fallbackArticleID = getArticleIDFromURL(article)
    return Object.assign({}, article, {
      position: i + 1,
      articleID: fallbackArticleID,
      paidcontent: true,
      hasTeaser: "unknown", //TODO
      retrieved,
      area: "sidebar"
    })
  })

  const collectedData = []
  collectedData.push(dataMainArea, dataPlusModuleBox, dataSidebar)
  const result = [].concat(...collectedData)

  return result
}
