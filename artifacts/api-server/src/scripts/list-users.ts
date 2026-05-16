import mongoose from "mongoose";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const collections = await mongoose.connection.db!.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));

  for (const col of collections) {
    const docs = await mongoose.connection.db!.collection(col.name).find({}).limit(5).toArray();
    console.log(`\n--- ${col.name} (${docs.length} docs) ---`);
    console.log(JSON.stringify(docs.map(d => ({ _id: d._id, username: d.username, email: d.email, plan: d.plan })), null, 2));
  }

  await mongoose.disconnect();
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
