const DATABASE_NAME = 'converta-private-library';
const DATABASE_VERSION = 1;
const STORE_NAME = 'outputs';
let databasePromise;

function openDatabase() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('This browser does not support local IndexedDB storage.'));
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Could not open local storage.'));
      request.onblocked = () => reject(new Error('Local storage is busy in another tab. Close the other tab and try again.'));
    }).catch((error) => {
      databasePromise = undefined;
      throw error;
    });
  }
  return databasePromise;
}

async function transact(mode, operation) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    let request;
    try {
      request = operation(store);
    } catch (error) {
      reject(error);
      return;
    }
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('The local file operation failed.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('The local file operation was interrupted.'));
  });
}

export const saveOutput = (id, blob) => transact('readwrite', (store) => store.put(blob, id));
export const readOutput = (id) => transact('readonly', (store) => store.get(id));
export const deleteOutput = (id) => transact('readwrite', (store) => store.delete(id));
export const clearOutputs = () => transact('readwrite', (store) => store.clear());
