import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

// GET /api/user-stats - Get user statistics
export async function GET(_request: NextRequest) {
  try {
    // For MVP, use hardcoded user ID
    const userId = '68ffe3d1e4cf6420d1fdc474';
    
    const db = await getDb();
    
    // Get or create user stats
    let userStats = await db.collection('user_stats').findOne({ userId });
    
    if (!userStats) {
      // Create initial stats
      userStats = {
        userId,
        daysLoggedIn: 0,
        lastLoginDate: null,
        loginDates: [],
        totalSessions: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection('user_stats').insertOne(userStats);
    }
    
    // Check if user has logged in today
    const today = new Date().toDateString();
    const lastLogin = userStats.lastLoginDate ? new Date(userStats.lastLoginDate).toDateString() : null;
    
    if (lastLogin !== today) {
      // New day login - increment days
      await db.collection('user_stats').updateOne(
        { userId },
        { 
          $push: { loginDates: new Date() },
          $set: { 
            lastLoginDate: new Date(),
            updatedAt: new Date()
          },
          $inc: { 
            daysLoggedIn: 1,
            totalSessions: 1 
          }
        }
      );
      
      userStats.daysLoggedIn += 1;
      userStats.totalSessions += 1;
      userStats.lastLoginDate = new Date();
    } else {
      // Same day login - just increment sessions
      await db.collection('user_stats').updateOne(
        { userId },
        { 
          $inc: { totalSessions: 1 },
          $set: { updatedAt: new Date() }
        }
      );
      
      userStats.totalSessions += 1;
    }
    
    return NextResponse.json({
      success: true,
      data: {
        daysLoggedIn: userStats.daysLoggedIn,
        totalSessions: userStats.totalSessions,
        lastLoginDate: userStats.lastLoginDate,
        streak: calculateStreak(userStats.loginDates || []),
      }
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}

// Calculate current login streak
function calculateStreak(loginDates: Date[]): number {
  if (loginDates.length === 0) return 0;
  
  const dates = loginDates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
  let streak = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      break;
    }
  }
  
  return streak;
}
