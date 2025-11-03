"""
Lambda Handler for Scrum Meeting Multi-Agent Workflow
Beta-optimized: 5-minute timeout, single invocation, no chunking
"""

import json
import os
from datetime import datetime
from pymongo import MongoClient
from agents.scrum_meeting import app

# Initialize MongoDB connection (cached across invocations)
_db = None
_client = None

def get_db():
    """Get MongoDB database connection (cached across Lambda invocations)"""
    global _db, _client
    
    if _db is not None:
        return _db
    
    mongo_uri = os.getenv('MONGODB_URI')
    if not mongo_uri:
        return None  # Continue without MongoDB if not configured
    
    try:
        _client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        _db = _client.get_database('engify')
        return _db
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        return None  # Continue without MongoDB if connection fails

async def handler(event, context):
    """
    Lambda handler for scrum meeting multi-agent workflow.
    Beta: 5-minute timeout, single invocation, no chunking.
    """
    try:
        # Parse request body
        if isinstance(event.get('body'), str):
            body = json.loads(event.get('body', '{}'))
        else:
            body = event.get('body', {})
        
        agenda = body.get('agenda', '').strip()
        topics = body.get('topics', [])
        
        if not agenda:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': 'Agenda is required'})
            }
        
        # Initialize state
        initial_state = {
            'agenda': agenda,
            'topics': topics if isinstance(topics, list) else [],
            'current_topic': topics[0] if topics and len(topics) > 0 else agenda,
            'scrum_master_notes': '',
            'pm_notes': '',
            'po_notes': '',
            'engineer_notes': '',
            'action_items': [],
            'next_sprint_goals': [],
            'blockers': [],
            'turn_count': 0,
            'max_turns': 12,  # Beta: Limit to 12 turns (3 rounds × 4 agents)
        }
        
        # Run workflow (beta: single invocation, 5-minute timeout)
        result = await app.ainvoke(initial_state)
        
        # Save to MongoDB if available
        meeting_id = None
        db = get_db()
        if db:
            try:
                meeting_id = db.meetings.insert_one({
                    'agenda': agenda,
                    'topics': topics,
                    'result': result,
                    'created_at': datetime.utcnow()
                }).inserted_id
            except Exception as e:
                print(f"Failed to save meeting to MongoDB: {e}")
        
        # Return result
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'success': True,
                'meeting_id': str(meeting_id) if meeting_id else None,
                'summary': {
                    'action_items': result.get('action_items', []),
                    'blockers': result.get('blockers', []),
                    'next_sprint_goals': result.get('next_sprint_goals', []),
                },
                'conversation': {
                    'scrum_master': result.get('scrum_master_notes', ''),
                    'pm': result.get('pm_notes', ''),
                    'po': result.get('po_notes', ''),
                    'engineer': result.get('engineer_notes', ''),
                },
                'turn_count': result.get('turn_count', 0),
            })
        }
    
    except Exception as e:
        print(f"Lambda handler error: {e}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to run scrum meeting'
            })
        }

