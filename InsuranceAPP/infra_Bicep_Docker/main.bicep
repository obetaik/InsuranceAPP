param location string = 'canadacentral'
@secure()
param sqlAdminPassword string

module storage './modules/storage.bicep' = {
  name: 'storageDeploy'
  params: {
    storageName: 'insureapistaccount'
    location: location
  }
}

module sql './modules/sql.bicep' = {
  name: 'sqlDeploy'
  params: {
    dbName: 'insurance-api'
    location: location
    sqlAdminPassword: sqlAdminPassword
  }
}

module app './modules/appservice.bicep' = {
  name: 'appDeploy'
  params: {
    location: location
    sqlServerName: sql.outputs.sqlServerName
  }
}
