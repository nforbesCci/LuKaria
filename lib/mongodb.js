import dns from 'dns';
import { MongoClient } from 'mongodb';

// Node's c-ares often fails SRV lookups on ISP DNS (querySrv ECONNREFUSED).
// Prefer public resolvers when the URI still uses mongodb+srv://.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // ignore — setServers unavailable in some runtimes
}

/**
 * Lazy async factory so this module never throws at import time when MONGODB_URI
 * is unset (e.g. static analysis, partial builds). Callers get a rejected promise
 * only when they await the client without env configured.
 */
async function createMongoClient() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your MONGODB_URI to .env.local');
  }
  const uri = process.env.MONGODB_URI;
  const options = {};

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  const client = new MongoClient(uri, options);
  return client.connect();
}

/** Single shared connection promise (invoked once per process when first awaited). */
export const clientPromise = createMongoClient();

/**
 * Get MongoDB client
 * @returns {Promise<MongoClient>}
 */
export async function getMongoClient() {
  return clientPromise;
}

/**
 * Get database instance
 * @param {string} dbName - Database name (optional, uses MONGODB_DB from env)
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getDatabase(dbName = null) {
  const client = await clientPromise;
  const databaseName = dbName || process.env.MONGODB_DB || 'lukaria';
  return client.db(databaseName);
}

/**
 * Get collection
 * @param {string} collectionName - Collection name
 * @param {string} dbName - Database name (optional)
 * @returns {Promise<import('mongodb').Collection>}
 */
export async function getCollection(collectionName, dbName = null) {
  const db = await getDatabase(dbName);
  return db.collection(collectionName);
}

export default clientPromise;
