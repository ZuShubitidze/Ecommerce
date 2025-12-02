// importProducts.ts
// import * as admin from "firebase-admin";
import admin from "firebase-admin";
// NEW: Add these lines for debugging
// END NEW
import axios from "axios";
import * as path from "path";
// NEW IMPORTS for ES Module __dirname equivalent
import { fileURLToPath } from "url";
import { dirname } from "path";

// --- Configuration ---
// Path to your service account key file
// Make sure this path is correct relative to where you run the script.
//
// NEW: Using import.meta.url to get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Now __dirname is defined and correctly points to the directory of this script.

const serviceAccountPath = path.resolve(
  __dirname,
  "ecommerce-c1091-firebase-adminsdk-fbsvc-610a4617b4.json"
);
// Replace 'ecommerce-c1091-firebase-adminsdk-xxxxx-xxxxxx.json' with the actual filename.
// For example: 'ecommerce-c1091-firebase-adminsdk-abcde-12345.json'

const firestoreCollectionName = "products"; // The name of the Firestore collection to store your products
const dummyJsonApiUrl = "https://dummyjson.com/products?limit=100"; // Fetch up to 100 products

// --- Initialize Firebase Admin SDK ---
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    // You might need a databaseURL if you're also using Realtime Database
    // databaseURL: "https://<DATABASE_NAME>.firebaseio.com"
  });
  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
  process.exit(1); // Exit if initialization fails
}

const db = admin.firestore();

// --- Define Product Interface (matches dummyjson.com structure) ---
interface DummyJsonProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

interface DummyJsonProductsResponse {
  products: DummyJsonProduct[];
  total: number;
  skip: number;
  limit: number;
}

// --- Main Import Function ---
async function importProducts() {
  console.log(
    `Starting import of products from ${dummyJsonApiUrl} into Firestore collection: '${firestoreCollectionName}'`
  );

  try {
    // 1. Fetch data from dummyjson.com
    console.log("Fetching products from dummyjson.com...");
    const response = await axios.get<DummyJsonProductsResponse>(
      dummyJsonApiUrl
    );
    const productsToImport = response.data.products;
    console.log(`Fetched ${productsToImport.length} products.`);

    if (productsToImport.length === 0) {
      console.log("No products to import. Exiting.");
      return;
    }

    // 2. Prepare for batch writes (more efficient for multiple documents)
    let currentBatch = db.batch(); // Renamed to avoid confusion with `batch` as an integer
    const productsRef = db.collection(firestoreCollectionName);
    let importedCount = 0;
    let batchOperations = 0; // Track operations per batch

    for (const product of productsToImport) {
      const docRef = productsRef.doc(String(product.id)); // Use the dummyjson.com ID as Firestore doc ID

      const productData = { ...product }; // Copy product data
      // If you want Firestore to generate IDs, you'd do:
      // const newDocRef = productsRef.doc();
      // currentBatch.set(newDocRef, productData);
      // batchOperations++;
      // then in the action.payload of your Redux thunk you'd use newDocRef.id

      currentBatch.set(docRef, productData);
      importedCount++;
      batchOperations++;

      if (batchOperations >= 499) {
        // Firestore batch write limit is 500, keep a small buffer
        console.log(`Committing batch of ${batchOperations} operations...`);
        await currentBatch.commit();
        currentBatch = db.batch(); // Start a new batch
        batchOperations = 0;
      }
    }

    // Commit any remaining documents in the final batch
    if (batchOperations > 0) {
      console.log(`Committing final batch of ${batchOperations} operations...`);
      await currentBatch.commit();
    }

    console.log(
      `Successfully imported ${importedCount} products into Firestore collection '${firestoreCollectionName}'.`
    );
  } catch (error: any) {
    console.error("Error during product import:", error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Axios response data:", error.response.data);
      console.error("Axios response status:", error.response.status);
    }
  }
}

// --- Run the import function ---
importProducts()
  .then(() => {
    console.log("Import process finished.");
    process.exit(0); // Exit successfully
  })
  .catch((error) => {
    console.error("Import process failed:", error);
    process.exit(1); // Exit with error
  });
