require('./env-patch.cjs');
const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb+srv://production-user:andamanexcursion2025@andamanexcursion.25fs7ny.mongodb.net/?retryWrites=true&w=majority&appName=andaman-excursion';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    
    let dbName = 'test';
    const dbs = await client.db().admin().listDatabases();
    const dbNames = dbs.databases.map(d => d.name);
    if (dbNames.includes('andaman-excursion')) dbName = 'andaman-excursion';
    
    const db = client.db(dbName);
    const pagesCollection = db.collection('pages');
    const boatPage = await pagesCollection.findOne({ slug: 'boat' });
    
    if (boatPage) {
       const blocks = boatPage.pageContent?.content || boatPage.layout || [];
       let found = false;
       for (let i = 0; i < blocks.length; i++) {
           const block = blocks[i];
           if (block.blockType === 'thingsToDo') {
               console.log('Updating thingsToDo block specialWord to use & instead of and...');
               boatPage.pageContent.content[i].specialWord = 'Ross Island &\nNorth Bay Island';
               
               const result = await pagesCollection.updateOne(
                   { _id: boatPage._id },
                   { $set: { "pageContent.content": boatPage.pageContent.content } }
               );
               console.log('Update result:', result.modifiedCount === 1 ? 'SUCCESS' : 'SUCCESS (No changes detected)');
               found = true;
           }
       }
       if (!found) {
          console.log('Could not find the thingsToDo block to update.');
       }
    } else {
       console.log('Boat page not found.');
    }
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}

run();
