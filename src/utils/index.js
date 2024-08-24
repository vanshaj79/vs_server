import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
export const connectDB = async () => {
    try {
        await client.connect();
        const db = client.db(process.env.DB_Name);
        return db;
    } catch (error) {
        console.error("Database connection error:", error);
        throw new Error("Failed to connect to the database");
    }
};

// export const fetchCollectionData = async (collectionName) => {
//     try {
//         const db = await connectDB();
//         const collection = db.collection(collectionName);
//         const data = await collection.find({}).toArray();
//         return data;
//     } catch (error) {
//         console.error(`Error fetching data from ${collectionName}:`, error);
//         throw new Error(`Failed to fetch data from ${collectionName}`);
//     } finally {
//         await client.close();
//     }
// };
