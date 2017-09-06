exports.generateTimestamp = function () {
  const now = new Date()
  return now.toISOString()
}

exports.findSubStr = (item, substr) => {
  if (item && substr) {
    return item.indexOf(substr) !== -1
  }
}
