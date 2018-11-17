/**
* Unlocks a given lock with a given key.
*
* @param {de.hftl.lock.Unlock} tx The unlock transaction to process
* @transaction
*/
function unlock(tx) {
    var key = tx.lockKey;
    var lock = tx.lock;

    // check if the key fits the lock first
    if (key.lock.getIdentifier() == lock.getIdentifier() && !isExpired(lock.expirationDate)) {
        lock.state.UNLOCKED;
        var timestamp = new Date();
        lock.unlockLog.push(timestamp);
        // update the lock state
        return getAssetRegistry('de.hftl.lock.Lock')
            .then(function (assetRegistry) {
                return assetRegistry.update(lock);
            });
    }
}


/*******************************************************************************************/
/*******************************************************************************************/

// Helper functions

/**
 * Checks if a date is in the past.
 */
function isExpired(date) {
    var now = new Date();
    if (date < now) {
        return true;
    } else {
        return false;
    }
}