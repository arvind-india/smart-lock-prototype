# Prototype Smart Lock

Prototype for a smart lock blockchain network with minimal functions.

## Implemented Functions
1. Add/Remove users
2. etc.

## Usage
### Setup Blockchain Network
1. Download the latest [release](https://github.com/qn0x/smart-lock-prototype/releases) (``.bna`` file)
2. Go to [The Official Playground](https://composer-playground.mybluemix.net/) website
3. Select "Deploy a new business network"
4. Choose name, description and create an admin card
5. For the starting template choose "Upload or drop" a network and upload the file downloaded in step 1

### Initialization
1. add a new vendor
2. submit transaction "initializeNetwork"
3. login as user
4. add new lock
5. submit transaction "registerLock"
Now a basic network with a lock, an owner and a vendor is up and running.

## Functional Restrictions

## Known Issues
- IDs are not secure. They are only pseudo-randomly generated.
- über SystemACL können teilweise Regeln übergangen werden
