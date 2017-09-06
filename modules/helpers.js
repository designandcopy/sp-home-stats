exports.generateTimestamp = function () {
  const now = new Date()
  return now.toISOString()
}
