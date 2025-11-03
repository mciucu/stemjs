// Class for working with IndexedDB for large data storage
// Similar to StorageMap but using IndexedDB instead of localStorage/sessionStorage
// IndexedDB has much larger storage limits (typically 50MB+ to several GB)
export class IndexedDBMap {
    dbName: string;
    storeName: string;
    version: number;
    private dbPromise: Promise<IDBDatabase> | null = null;

    constructor(dbName: string, storeName: string = "default", version: number = 1) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
    }

    private getDB(): Promise<IDBDatabase> {
        if (!this.dbPromise) {
            this.dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName, this.version);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);

                request.onupgradeneeded = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName);
                    }
                };
            });
        }
        return this.dbPromise;
    }

    async get(key: string): Promise<any> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, "readonly");
                const store = transaction.objectStore(this.storeName);
                const request = store.get(key);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            return null;
        }
    }

    async set(key: string, value: any): Promise<boolean> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);
                const request = store.put(value, key);

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            return false;
        }
    }

    async delete(key: string): Promise<boolean> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(key);

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            return false;
        }
    }

    async has(key: string): Promise<boolean> {
        const value = await this.get(key);
        return value !== undefined && value !== null;
    }

    async keys(): Promise<string[]> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, "readonly");
                const store = transaction.objectStore(this.storeName);
                const request = store.getAllKeys();

                request.onsuccess = () => resolve(request.result as string[]);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            return [];
        }
    }

    async clear(): Promise<boolean> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.storeName, "readwrite");
                const store = transaction.objectStore(this.storeName);
                const request = store.clear();

                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            return false;
        }
    }
}