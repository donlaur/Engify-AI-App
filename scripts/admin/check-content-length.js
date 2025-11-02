const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkContentLength() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    const learningContent = await db.collection('learning_content')
      .find({ type: 'ai_adoption_question' })
      .toArray();
    
    console.log('📊 Content Length Analysis:\n');
    
    learningContent.forEach((content, i) => {
      const wordCount = content.content.split(/\s+/).length;
      const charCount = content.content.length;
      
      console.log(`${i + 1}. ${content.title.substring(0, 60)}...`);
      console.log(`   Words: ${wordCount} | Characters: ${charCount}`);
      
      // Show first 200 chars of content
      console.log(`   Preview: ${content.content.substring(0, 200).replace(/\n/g, ' ')}...`);
      console.log('');
    });
    
    // Calculate totals
    const totalWords = learningContent.reduce((sum, c) => sum + c.content.split(/\s+/).length, 0);
    const avgWords = Math.round(totalWords / learningContent.length);
    
    console.log('\n📈 Summary:');
    console.log(`Total Items: ${learningContent.length}`);
    console.log(`Total Words: ${totalWords.toLocaleString()}`);
    console.log(`Average Words per Item: ${avgWords}`);
    
    // Show one full example
    if (learningContent.length > 0) {
      console.log('\n\n📄 Full Example (First Item):\n');
      console.log('Title:', learningContent[0].title);
      console.log('\nContent:\n', learningContent[0].content);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkContentLength();
