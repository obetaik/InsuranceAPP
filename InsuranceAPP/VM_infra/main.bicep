targetScope = 'resourceGroup'

@description('Azure region - Canada Central is close to Brampton and low cost')
param location string = 'canadacentral'

@description('Storage account name - exactly as given')
param storageAccountName string = 'projectstacct'

@description('Web app name - exactly as given (Laravel backend)')
param appServiceName string = 'personal-insurance-api'

@description('SQL Server name (globally unique)')
param sqlServerName string = 'projectsqlserver'

@description('SQL Database name - exactly as given')
param sqlDatabaseName string = 'insurance_api'

@description('SQL admin username')
param sqlAdministratorLogin string = 'sqladmin'

@description('SQL admin password - keep secure!')
@secure()
param sqlAdministratorLoginPassword string

@description('App Service Plan SKU - S1 for auto-scaling + VNet integration')
param appServicePlanSku string = 'S1'

var vnetName = 'project-vnet'
var vnetAddressPrefix = '10.0.0.0/16'
var integrationSubnetName = 'integration-subnet'
var integrationSubnetPrefix = '10.0.0.0/24'
var peSubnetName = 'pe-subnet'
var peSubnetPrefix = '10.0.1.0/24'
var nsgName = 'project-nsg'
var appServicePlanName = 'project-asp'
var appInsightsName = 'project-appinsights'
var privateDnsZoneName = 'privatelink.database.windows.net'

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: true
    minimumTlsVersion: 'TLS1_2'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    staticWebsite: {
      enabled: true
      indexDocument: 'index.html'
      errorDocument404Path: '404.html'
    }
  }
}

resource appServicePlan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: appServicePlanSku
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource nsg 'Microsoft.Network/networkSecurityGroups@2024-05-01' = {
  name: nsgName
  location: location
  properties: {
    securityRules: [
      {
        name: 'AllowVNetInBound'
        properties: {
          priority: 100
          direction: 'Inbound'
          access: 'Allow'
          protocol: '*'
          sourceAddressPrefix: 'VirtualNetwork'
          destinationAddressPrefix: 'VirtualNetwork'
          sourcePortRange: '*'
          destinationPortRange: '*'
        }
      }
      {
        name: 'DenyAllInBound'
        properties: {
          priority: 4096
          direction: 'Inbound'
          access: 'Deny'
          protocol: '*'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
          sourcePortRange: '*'
          destinationPortRange: '*'
        }
      }
    ]
  }
}

resource vnet 'Microsoft.Network/virtualNetworks@2024-05-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [
        vnetAddressPrefix
      ]
    }
  }
}

resource integrationSubnet 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' = {
  parent: vnet
  name: integrationSubnetName
  properties: {
    addressPrefix: integrationSubnetPrefix
    delegations: [
      {
        name: 'delegation'
        properties: {
          serviceName: 'Microsoft.Web/serverFarms'
        }
      }
    ]
    networkSecurityGroup: {
      id: nsg.id
    }
  }
}

resource peSubnet 'Microsoft.Network/virtualNetworks/subnets@2024-05-01' = {
  parent: vnet
  name: peSubnetName
  properties: {
    addressPrefix: peSubnetPrefix
    privateEndpointNetworkPolicies: 'Disabled'
    networkSecurityGroup: {
      id: nsg.id
    }
  }
}

resource webApp 'Microsoft.Web/sites@2024-04-01' = {
  name: appServiceName
  location: location
  kind: 'app'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    virtualNetworkSubnetId: integrationSubnet.id
    vnetRouteAllEnabled: true
    httpsOnly: true
  }
  siteConfig: {
    linuxFxVersion: 'PHP|8.3'
    alwaysOn: true
    appSettings: [
      {
        name: 'DB_HOST'
        value: sqlServer.properties.fullyQualifiedDomainName
      }
      {
        name: 'DB_DATABASE'
        value: sqlDatabaseName
      }
      {
        name: 'DB_USERNAME'
        value: sqlAdministratorLogin
      }
      {
        name: 'DB_PASSWORD'
        value: sqlAdministratorLoginPassword
      }
      {
        name: 'DB_CONNECTION'
        value: 'sqlsrv'
      }
      {
        name: 'DB_PORT'
        value: '1433'
      }
      {
        name: 'APP_ENV'
        value: 'production'
      }
      {
        name: 'APP_DEBUG'
        value: 'false'
      }
      // Add any other Laravel .env variables here (e.g., AUTH0 settings)
    ]
  }
}

resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdministratorLogin
    administratorLoginPassword: sqlAdministratorLoginPassword
    version: '12.0'
    publicNetworkAccess: 'Disabled'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
  }
}

resource privateEndpoint 'Microsoft.Network/privateEndpoints@2024-05-01' = {
  name: '${sqlServer.name}-pe'
  location: location
  properties: {
    subnet: {
      id: peSubnet.id
    }
    privateLinkServiceConnections: [
      {
        name: '${sqlServer.name}-pe-conn'
        properties: {
          privateLinkServiceId: sqlServer.id
          groupIds: [
            'sqlServer'
          ]
        }
      }
    ]
  }
}

resource privateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: privateDnsZoneName
  location: 'global'
}

resource privateDnsZoneLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  parent: privateDnsZone
  name: 'vnet-link'
  location: 'global'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: vnet.id
    }
  }
}

resource privateDnsZoneGroup 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups@2024-05-01' = {
  parent: privateEndpoint
  name: 'default'
  properties: {
    privateDnsZoneConfigs: [
      {
        name: 'config1'
        properties: {
          privateDnsZoneId: privateDnsZone.id
        }
      }
    ]
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

resource autoScaleSetting 'Microsoft.Insights/autoscalesettings@2022-10-01' = {
  name: '${appServicePlan.name}-autoscale'
  location: location
  properties: {
    targetResourceUri: appServicePlan.id
    profiles: [
      {
        name: 'defaultProfile'
        capacity: {
          minimum: '1'
          maximum: '3'
          default: '1'
        }
        rules: [
          {
            metricTrigger: {
              metricName: 'CpuPercentage'
              metricResourceUri: appServicePlan.id
              timeGrain: 'PT1M'
              statistic: 'Average'
              timeWindow: 'PT10M'
              timeAggregation: 'Average'
              operator: 'GreaterThan'
              threshold: 70
            }
            scaleAction: {
              direction: 'Increase'
              type: 'ChangeCount'
              value: '1'
              cooldown: 'PT5M'
            }
          }
          {
            metricTrigger: {
              metricName: 'CpuPercentage'
              metricResourceUri: appServicePlan.id
              timeGrain: 'PT1M'
              statistic: 'Average'
              timeWindow: 'PT10M'
              timeAggregation: 'Average'
              operator: 'LessThan'
              threshold: 30
            }
            scaleAction: {
              direction: 'Decrease'
              type: 'ChangeCount'
              value: '1'
              cooldown: 'PT5M'
            }
          }
        ]
      }
    ]
  }
}

output appServiceUrl string = 'https://${webApp.name}.azurewebsites.net'
output storageStaticUrl string = 'https://${storageAccount.name}.z13.web.core.windows.net'
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
