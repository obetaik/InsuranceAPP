param location string = 'canadacentral'
param sqlServerName string
param containerRegistryName string = 'insureapiacr'
param imageName string = 'insurance-api'
param imageTag string = 'latest'

// App Service Plan (Linux required for containers)
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: 'insureapi-plan'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

// Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: containerRegistryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// App Service with Docker container
resource webApp 'Microsoft.Web/sites@2022-09-01' = {
  name: 'insureapi-backend'
  location: location
  kind: 'app,linux,container'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${containerRegistry.properties.loginServer}/${imageName}:${imageTag}'
      alwaysOn: true
      appCommandLine: ''
    }
  }
  identity: {
    type: 'SystemAssigned'
  }
}

// App Settings (environment variables)
resource appSettings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: webApp
  name: 'appsettings'
  properties: {
    // Laravel Base Configuration
    APP_NAME: 'insureapi-backend'
    APP_ENV: 'production'
    APP_DEBUG: 'false'
    APP_URL: 'https://${webApp.properties.defaultHostName}'
    APP_KEY: '' // Set this after deployment using: php artisan key:generate --show

    // Database Configuration
    DB_CONNECTION: 'sqlsrv'
    DB_HOST: '${sqlServerName}.database.windows.net'
    DB_PORT: '1433'
    DB_DATABASE: 'insurance-api'
    DB_USERNAME: 'sqladmin@${sqlServerName}'
    DB_PASSWORD: '' // Set via Key Vault or parameter

    // Auth0 Configuration (Update with your actual values)
    AUTH0_DOMAIN: 'dev-lt5r-7nw.us.auth0.com'
    AUTH0_CLIENT_ID: 'JPydg3oDfxWBlDsV4dwEtbXxvi4Cz8rk'
    AUTH0_CLIENT_SECRET: '' // Set via Key Vault
    AUTH0_AUDIENCE: 'https://dev-lt5r-7nw.us.auth0.com/api/v2/'

    // Container Settings
    WEBSITES_PORT: '80'
    WEBSITES_ENABLE_APP_SERVICE_STORAGE: 'true'
  }
}

output appUrl string = 'https://${webApp.properties.defaultHostName}'
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
