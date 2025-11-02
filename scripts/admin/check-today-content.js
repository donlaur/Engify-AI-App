const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkTodayContent() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log('📊 Content Created Today:\n');
    
    // Check patterns
    const patterns = await db.collection('patterns').countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    console.log(`Patterns: ${patterns}`);
    
    // Check learning_content
    const learningContent = await db.collection('learning_content').find({
      createdAt: { $gte: today, $lt: tomorrow }
    }).toArray();
    console.log(`\nLearning Content: ${learningContent.length}`);
    
    if (learningContent.length > 0) {
      console.log('\n📚 Learning Content Details:');
      learningContent.forEach((content, i) => {
        console.log(`\n${i + 1}. ${content.title || 'Untitled'}`);
        console.log(`   Type: ${content.type}`);
        console.log(`   Category: ${content.category}`);
        console.log(`   Tags: ${content.tags?.join(', ') || 'None'}`);
        if (content.metadata?.sourceTitle) {
          console.log(`   Source: ${content.metadata.sourceTitle}`);
        }
      });
    }
    
    // Check affiliate_config
    const affiliateLinks = await db.collection('affiliate_config').countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    console.log(`\n\nAffiliate Links: ${affiliateLinks}`);
    
    // Check partnership_outreach
    const partnerships = await db.collection('partnership_outreach').countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    console.log(`Partnership Outreach: ${partnerships}`);
    
    // Check web_content
    const webContent = await db.collection('web_content').countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    console.log(`Web Content: ${webContent}`);
    
    // Get all learning_content for overview
    const allLearning = await db.collection('learning_content').find({}).toArray();
    console.log(`\n\n📖 Total Learning Content in DB: ${allLearning.length}`);
    
    const types = {};
    allLearning.forEach(content => {
      types[content.type] = (types[content.type] || 0) + 1;
    });
    
    console.log('\nBreakdown by Type:');
    Object.entries(types).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkTodayContent();
