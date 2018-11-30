# Prototype Smart Lock

Prototype of a smart lock blockchain network with minimal functionality.

## Usage
### Setup Blockchain Network
1. Download the latest [release](https://github.com/qn0x/smart-lock-prototype/releases) (``.bna`` file)
2. Go to [The Official Playground](https://composer-playground.mybluemix.net/) website
3. Select "Deploy a new business network"
4. Choose name, description and create an admin card (admin@<network name>)
5. For the starting template choose "Upload or drop" a network and upload the file downloaded in step 1
6. connect to the network and choose the tab "Test"

### Network Initialization
1. add a new vendor
2. go to ID registry (admin -> ID Registry)
3. Issue new ID, as a participant, choose the vendorID you created
4. hover over the ID list and click "use now" (now you are a vendor)
5. click "submit transaction", choose "initializeNetwork" and choose first/lastname

### Basic Smart Lock Network
1. Issue an ID for the user who was created during initialization (choose a name and use the userID in participant)
2. login as the new user
3. create a new lock, for the vendor use the vendorID from the created vendor
4. submit transaction "RegisterLock" with the lockID
5. grant yourself access to the lock: submit transaction "GrantUnlock" with the lockID and your own userID
Now a basic network with a lock, an owner and a vendor is up and running.

### Grant a key to a new user
1. As an OWNER, create a new user with the role "GUEST"
2. submit transaction "GrantUnlock" with the lock and the user you want to grant a key to
