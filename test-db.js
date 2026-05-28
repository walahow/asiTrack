const mongoose = require('mongoose');

mongoose.connect("mongodb://latifhamzah106_db_user:hmTo05wrJokvV8F5@ac-lpa2icr-shard-00-00.kebmnj4.mongodb.net:27017,ac-lpa2icr-shard-00-01.kebmnj4.mongodb.net:27017,ac-lpa2icr-shard-00-02.kebmnj4.mongodb.net:27017/?ssl=true&replicaSet=atlas-chq1pv-shard-0&authSource=admin&appName=ClusterSingapore").then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}), 'users');
  const users = await User.find({ username: { $ne: 'admin' } });
  console.log(JSON.stringify(users.map(u => ({ username: u.username, fcm_tokens: u.fcm_tokens })), null, 2));
  process.exit(0);
}).catch(console.error);
