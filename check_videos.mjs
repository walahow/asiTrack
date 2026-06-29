import { MongoClient } from "mongodb";

const uri = "mongodb://latifhamzah106_db_user:hmTo05wrJokvV8F5@ac-lpa2icr-shard-00-00.kebmnj4.mongodb.net:27017,ac-lpa2icr-shard-00-01.kebmnj4.mongodb.net:27017,ac-lpa2icr-shard-00-02.kebmnj4.mongodb.net:27017/?ssl=true&replicaSet=atlas-chq1pv-shard-0&authSource=admin&appName=ClusterSingapore";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("hypnomom_db");
    const videos = await db.collection("videos").find({}).toArray();
    console.log(JSON.stringify(videos, null, 2));
  } finally {
    await client.close();
  }
}
run();
