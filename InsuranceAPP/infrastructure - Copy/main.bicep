param location string = 'canadacentral'
param vmName string = 'insureapi-vm'
param vmSize string = 'Standard_B2s'
param adminUsername string = 'azureuser'
@secure()
param adminPassword string
@secure()
param sqlAdminPassword string

// Network resources
resource vnet 'Microsoft.Network/virtualNetworks@2023-04-01' = {
  name: 'insureapi-vnet'
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: ['10.0.0.0/16']
    }
    subnets: [
      {
        name: 'default'
        properties: {
          addressPrefix: '10.0.0.0/24'
        }
      }
    ]
  }
}

// Changed to Standard SKU
resource publicIP 'Microsoft.Network/publicIPAddresses@2023-04-01' = {
  name: 'insureapi-pip'
  location: location
  sku: {
    name: 'Standard' // Changed from 'Basic'
  }
  properties: {
    publicIPAllocationMethod: 'Static' // Standard requires Static
  }
}

// Network Security Group (no changes needed)
resource nsg 'Microsoft.Network/networkSecurityGroups@2023-04-01' = {
  name: 'insureapi-nsg'
  location: location
  properties: {
    securityRules: [
      {
        name: 'SSH'
        properties: {
          priority: 100
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '22'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
        }
      }
      {
        name: 'HTTP'
        properties: {
          priority: 101
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '80'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
        }
      }
      {
        name: 'HTTPS'
        properties: {
          priority: 102
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourcePortRange: '*'
          destinationPortRange: '443'
          sourceAddressPrefix: '*'
          destinationAddressPrefix: '*'
        }
      }
    ]
  }
}

// Network Interface (update for Standard SKU)
resource nic 'Microsoft.Network/networkInterfaces@2023-04-01' = {
  name: 'insureapi-nic'
  location: location
  properties: {
    ipConfigurations: [
      {
        name: 'ipconfig1'
        properties: {
          privateIPAllocationMethod: 'Dynamic'
          publicIPAddress: {
            id: publicIP.id
          }
          subnet: {
            id: vnet.properties.subnets[0].id
          }
        }
      }
    ]
    networkSecurityGroup: {
      id: nsg.id
    }
  }
}

// Ubuntu 22.04 LTS VM (unchanged)
resource vm 'Microsoft.Compute/virtualMachines@2023-03-01' = {
  name: vmName
  location: location
  properties: {
    hardwareProfile: {
      vmSize: vmSize
    }
    storageProfile: {
      imageReference: {
        publisher: 'Canonical'
        offer: '0001-com-ubuntu-server-jammy'
        sku: '22_04-lts-gen2'
        version: 'latest'
      }
      osDisk: {
        name: '${vmName}-osdisk'
        createOption: 'FromImage'
        diskSizeGB: 128
        managedDisk: {
          storageAccountType: 'Premium_LRS'
        }
      }
    }
    osProfile: {
      computerName: vmName
      adminUsername: adminUsername
      adminPassword: adminPassword
      linuxConfiguration: {
        disablePasswordAuthentication: false
      }
    }
    networkProfile: {
      networkInterfaces: [
        {
          id: nic.id
        }
      ]
    }
  }
}

// SQL Server Module (unchanged)
module sql './modules/sql.bicep' = {
  name: 'sqlDeploy'
  params: {
    dbName: 'insurance-api'
    location: location
    sqlAdminPassword: sqlAdminPassword
  }
}

// Storage Account Module (unchanged)
module storage './modules/storage.bicep' = {
  name: 'storageDeploy'
  params: {
    storageName: 'insureapistaccount'
    location: location
  }
}

// Outputs
output vmPublicIP string = publicIP.properties.ipAddress
output sshCommand string = 'ssh ${adminUsername}@${publicIP.properties.ipAddress}'
output sqlServerFqdn string = sql.outputs.sqlServerFqdn
