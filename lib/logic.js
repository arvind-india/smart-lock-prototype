/**
* A transaction processor function description
* @param {de.hftl.lock.Unlock} tx The unlock transaction to process
* @transaction
*/
function unlock(tx) {
    var key = tx.lockKey;
    var lock = tx.lock;
    // check if the key fits the lock
    if (key.lock.lockId == lock.lockId) {
        lock.state.UNLOCKED;
        var timestamp = new Date();
        lock.unlockLog.push(timestamp);
        return getAssetRegistry('de.hftl.lock.Lock')
        .then(function (assetRegistry) {
            // Update the asset in the asset registry.
            return assetRegistry.update(lock);

        });
    }
}