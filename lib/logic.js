// Model: Lock

/**
 * Closes an open lock.
 * 
 * @param {de.hftl.lock.CloseLock} tx Transaction to process
 * @transaction
 */
function closeLock(tx) {
    let lock = tx.lock;

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
    let lock = tx.lock;

    // check if the key fits the lock first
    if (key.lock.getIdentifier() == lock.getIdentifier() && !isExpired(lock.expirationDate)) {
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
    var id = Math.random().toString(36).substr(2, 9);

    // create a new key
    var factory = getFactory();
    var key = factory.newResource('de.hftl.lock', 'LockKey', id);
    if (tx.expirationDate !== null) {
        key.expirationDate = tx.expirationDate;
    }
    key.lock = tx.lock;
    owner = tx.owner;
    issuer = tx.issuer;

    return getAssetRegistry('de.hftl.lock.LockKey')
    .then(function (lockKeyRegistry) {
        // Add the new key to the lockkey asset registry.
        return lockKeyRegistry.add(key);
    })
    .then(function() {
        // update the grantee's collection of keys
        tx.grantee.keys.push(key);
        return getParticipantRegistry('de.hftl.user.User')
        .then(function (userRegistry) {
            return userRegistry.update(tx.grantee);
        });
    });

}

/**
 * Revokes a key from a user.
 * 
 * @param {de.hftl.permissions.RevokeUnlock} tx Transactions to proccess
 * @transaction
 */
function revokeKey(tx) {
    // delete LockKey asset


    // update the revokee's collection of keys

}

/**
 * Grants a user owner permissions.
 * 
 * @param {de.hftl.permissions.GrantOwner} tx Transactions to proccess
 * @transaction
 */
function grantOwner(tx) {
}

/**
 * Revokes a user's owner permissions.
 * 
 * @param {de.hftl.permissions.RevokeOwner} tx Transactions to proccess
 * @transaction
 */
function revokeOwner(tx) {
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
}

/**
 * Removes a lock.
 * 
 * @param {de.hftl.vendor.RemoveLock} tx Transactions to proccess
 * @transaction
 */
function removeLock(tx) {
}

/**
 * Registers a lock.
 * 
 * @param {de.hftl.vendor.RegisterLock} tx Transactions to proccess
 * @transaction
 */
function registerLock(tx) {
}

/**
 * Initializes the blockchain network.
 * 
 * @param {de.hftl.vendor.InitializeNetwork} tx Transactions to proccess
 * @transaction
 */
function initializeNetwork(tx) {
}

/*******************************************************************************************/
/*******************************************************************************************/

// Helper functions

/**
 * Checks if a date is in the past.
 */
function isExpired(date) {
    let now = new Date();
    if (date < now) {
        return true;
    } else {
        return false;
    }
}