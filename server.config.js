module.exports = {
  // Mongo properties
  mongodbUri: process.env.MONGODB_URI,
  db: 'covid_db',
  resourceCollection: 'covid_col',
  alertsCollection: 'alerts_col',
  adminsCollection: 'admins_col',

  // REST server properties
  resourcePath: '/ibcovid',
  resourceAlertsPath: '/alerts',
  serverIp: process.env.SERVER_IP,
  serverPort: 3100
}
