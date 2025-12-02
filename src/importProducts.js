"use strict";
// importProducts.ts
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var admin = require("firebase-admin");
var axios_1 = require("axios");
var path = require("path");
// --- Configuration ---
// Path to your service account key file
// Make sure this path is correct relative to where you run the script.
var serviceAccountPath = path.resolve(__dirname, "ecommerce-c1091-firebase-adminsdk-xxxxx-xxxxxx.json");
// Replace 'ecommerce-c1091-firebase-adminsdk-xxxxx-xxxxxx.json' with the actual filename.
var firestoreCollectionName = "products"; // The name of the Firestore collection to store your products
var dummyJsonApiUrl = "https://dummyjson.com/products?limit=100"; // Fetch up to 100 products
// --- Initialize Firebase Admin SDK ---
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        // You might need a databaseURL if you're also using Realtime Database
        // databaseURL: "https://<DATABASE_NAME>.firebaseio.com"
    });
    console.log("Firebase Admin SDK initialized successfully.");
}
catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
    process.exit(1); // Exit if initialization fails
}
var db = admin.firestore();
// --- Main Import Function ---
function importProducts() {
    return __awaiter(this, void 0, void 0, function () {
        var response, productsToImport, batch, productsRef, importedCount, _i, productsToImport_1, product, docRef, productData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Starting import of products from ".concat(dummyJsonApiUrl, " into Firestore collection: '").concat(firestoreCollectionName, "'"));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    // 1. Fetch data from dummyjson.com
                    console.log("Fetching products from dummyjson.com...");
                    return [4 /*yield*/, axios_1.default.get(dummyJsonApiUrl)];
                case 2:
                    response = _a.sent();
                    productsToImport = response.data.products;
                    console.log("Fetched ".concat(productsToImport.length, " products."));
                    if (productsToImport.length === 0) {
                        console.log("No products to import. Exiting.");
                        return [2 /*return*/];
                    }
                    batch = db.batch();
                    productsRef = db.collection(firestoreCollectionName);
                    importedCount = 0;
                    _i = 0, productsToImport_1 = productsToImport;
                    _a.label = 3;
                case 3:
                    if (!(_i < productsToImport_1.length)) return [3 /*break*/, 6];
                    product = productsToImport_1[_i];
                    docRef = productsRef.doc(String(product.id));
                    productData = __assign({}, product);
                    // If you want Firestore to generate IDs, you'd do:
                    // const productData = { ...product };
                    // delete productData.id;
                    // batch.set(productsRef.doc(), productData);
                    batch.set(docRef, productData); // Use set() to create or overwrite documents
                    importedCount++;
                    if (!(importedCount % 500 === 0)) return [3 /*break*/, 5];
                    // Firestore batch write limit is 500
                    console.log("Committing batch (".concat(importedCount, " products processed)..."));
                    return [4 /*yield*/, batch.commit()];
                case 4:
                    _a.sent();
                    // Start a new batch for the remaining documents
                    batch = db.batch();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    if (!(importedCount % 500 !== 0 || importedCount === 0)) return [3 /*break*/, 8];
                    console.log("Committing final batch (".concat(importedCount, " products processed overall)..."));
                    return [4 /*yield*/, batch.commit()];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    console.log("Successfully imported ".concat(importedCount, " products into Firestore collection '").concat(firestoreCollectionName, "'."));
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _a.sent();
                    console.error("Error during product import:", error_1.message);
                    if (axios_1.default.isAxiosError(error_1) && error_1.response) {
                        console.error("Axios response data:", error_1.response.data);
                        console.error("Axios response status:", error_1.response.status);
                    }
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// --- Run the import function ---
importProducts()
    .then(function () {
    console.log("Import process finished.");
    process.exit(0); // Exit successfully
})
    .catch(function (error) {
    console.error("Import process failed:", error);
    process.exit(1); // Exit with error
});
