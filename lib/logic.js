// Model: Lock

/**
 * Closes a given open lock.
 * 
 * @param {de.hftl.lock.CloseLock} tx Transaction to process
 * @transaction
 */
function closeLock(tx) {
    var lock = tx.lock;

    // check if lock is open first
    if (lock.state == "UNLOCKED") {
        return getAssetRegistry('de.hftl.lock.Lock')
            .then(function (assetRegistry) {
                return assetRegistry.update(lock);
            });
    }
}

/**
 * Unlocks a given lock with a given key.
 *
 * @param {de.hftl.lock.Unlock} tx Transaction to process
 * @transaction
 */
function unlock(tx) {
    let key = tx.lockKey;
    var lock = tx.lock;

    // check if key fits the lock, if key is expired, if lock is open and if there are any other keys in use
    if (key.lock.getIdentifier() == lock.getIdentifier()
        && !isExpired(lock.expirationDate)
        && lock.state == "LOCKED"
        && lock.keyInUse.length < 1) {
        lock.state = "UNLOCKED";
        // update the lock state
        return getAssetRegistry('de.hftl.lock.Lock')
            .then(function (assetRegistry) {
                return assetRegistry.update(lock);
            });
    }


}

/*******************************************************************************************/

// Model: Permissions

/**
 * Grants a new key to a user.
 * 
 * @param {de.hftl.permissions.GrantUnlock} tx Transactions to proccess
 * @transaction
 */
function grantKey(tx) {
    // generate a random id
    let id = generateID();

    // create a new key
    var factory = getFactory();
    var key = factory.newResource('de.hftl.lock', 'LockKey', id);
    if (tx.expirationDate !== null) {
        key.expirationDate = tx.expirationDate;
    }
    key.lock = tx.lock;
    key.owner = tx.grantee;
    key.issuer = getCurrentParticipant();

    // add the new key to the key asset registry.
    return getAssetRegistry('de.hftl.lock.LockKey')
        .then(function (lockKeyRegistry) {
            return lockKeyRegistry.add(key);
        })
        // update the grantee's collection of keys
        .then(function () {
            tx.grantee.keys.push(key);
            return updateUserInRegistry(tx.grantee);
        });

}

/**
 * Revokes a key from a user.
 * 
 * @param {de.hftl.permissions.RevokeUnlock} tx Transactions to proccess
 * @transaction
 */
function revokeKey(tx) {
    let keyToRemove = tx.lockKey;
    let revokee = tx.revokee;

    // update the revokee's collection of keys
    var index = revokee.keys.indexOf(keyToRemove);
    if (index > -1) {
        revokee.keys.splice(index, 1);
    }

    // delete key asset
    return getAssetRegistry('de.hftl.lock.LockKey')
        .then(function (lockKeyRegistry) {
            return lockKeyRegistry.remove(keyToRemove);
        });

}

/**
 * Grants a user owner permissions.
 * 
 * @param {de.hftl.permissions.GrantOwner} tx Transactions to proccess
 * @transaction
 */
function grantOwner(tx) {
    let grantee = tx.grantee;
    grantee.UserRole = "OWNER";
    return updateUserInRegistry(grantee);
}

/**
 * Revokes a user's owner permissions.
 * 
 * @param {de.hftl.permissions.RevokeOwner} tx Transactions to proccess
 * @transaction
 */
function revokeOwner(tx) {
    let revokee = tx.revokee;
    revokee.UserRole = "USER";
    return updateUserInRegistry(revokee);
}

/*******************************************************************************************/

// Model: Vendor

/**
 * Resets a lock.
 * 
 * @param {de.hftl.vendor.ResetLock} tx Transactions to proccess
 * @transaction
 */
function resetLock(tx) {
    let lockToReset = tx.lock;

    // set lock state to closed
    lockToReset.state = "CLOSED"

    // delete/invalidate all keys that fit the lock
    deleteKeysForLock(lockToReset);
}

/**
 * Removes a lock.
 * 
 * @param {de.hftl.vendor.RemoveLock} tx Transactions to proccess
 * @transaction
 */
function removeLock(tx) {
    let lockToRemove = tx.lock;

    // delete/invalidate all keys that fit the lock
    deleteKeysForLock(lockToRemove);

    return getParticipantRegistry('de.hftl.lock.Lock')
        .then(function (lockRegistry) {
            return lockRegistry.remove(lockToRemove);
        });
}

/**
 * Registers a lock with a vendor.
 * 
 * @param {de.hftl.vendor.RegisterLock} tx Transactions to proccess
 * @transaction
 */
function registerLock(tx) {
    let lockToRegister = tx.lock;
    let vendor = lockToRegister.vendor;
    vendor.locks.push(lockToRegister);
    return getParticipantRegistry('de.hftl.vendor.Vendor')
        .then(function (vendorRegistry) {
            return vendorRegistry.update(vendor);
        });
}

/**
 * Initializes the blockchain network.
 * Can only be done by a vendor, creates an inital user as an owner.
 * 
 * @param {de.hftl.vendor.InitializeNetwork} tx Transactions to proccess
 * @transaction
 */
function initializeNetwork(tx) {
    let id = generateID();
    let factory = getFactory();
    let firstUser = factory.newResource('de.hftl.user', 'User', id);
    firstUser.firstName = tx.firstName;
    firstUser.lastName = tx.lastName;
    firstUser.UserRole = "OWNER";
    firstUser.vendor = getCurrentParticipant();

    return getParticipantRegistry('de.hftl.user.User')
        .then(function (userRegistry) {
            return userRegistry.add(firstUser);
        });
}

/*******************************************************************************************/
/*******************************************************************************************/

// Helper functions

/**
 * Checks if a date is in the past.
 */
function isExpired(date) {
    let now = new Date();
    (date < now) ? true : false;
}

/**
 * Generates a new random ID
 */
function generateID() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Updates a given user in the ParticipantRegistry of the network.
 */
function updateUserInRegistry(userToUpdate) {
    return getParticipantRegistry('de.hftl.user.User')
        .then(function (participantRegistry) {
            return participantRegistry.update(userToUpdate);
        });
}

/**
 * Deletes all keys in the registry for a given lock.
 * Relationsships are updated automatically by the framwork.
 */
function deleteKeysForLock(lock) {
    let keyRegistry = getAssetRegistry('de.hftl.lock.LockKey');
    let allKeys = keyRegistry.getAll();
    let keysToRemove;

    for (var key in allKeys) {
        if (key.lock.getIdentifier() == lock.getIdentifier()) {
            keysToRemove.push(key);
        }
    }
    keyRegistry.removeAll(keysToRemove);
}
