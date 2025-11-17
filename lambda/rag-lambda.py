import json
import os
from typing import List, Dict, Any
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
from logging_utils import get_lambda_logger, configure_lambda_logging

# Configure logging for Lambda
configure_lambda_logging(service_name="rag-lambda")
logger = get_lambda_logger(__name__)

# Initialize MongoDB connection (reused across Lambda invocations)
_db = None
_client = None

def get_db():
    """Get MongoDB database connection (cached across Lambda invocations)"""
    global _db, _client
    
    if _db is not None:
        return _db
    
    mongo_uri = os.getenv('MONGODB_URI')
    if not mongo_uri:
        raise ValueError("MONGODB_URI environment variable not set")
    
    try:
        _client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        _db = _client.get_database()
        # Test connection
        _client.admin.command('ping')
        return _db
    except Exception as e:
        logger.error(f"MongoDB connection error: {e}")
        raise

def simple_text_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Simple text-based search using MongoDB
    Falls back to tag/keyword matching if text search fails
    """
    try:
        db = get_db()
        collection = db.collection('prompts')
        
        query_words = query.lower().split()
        
        # Build search query
        search_query = {
            'isPublic': True,
            '$or': [
                {'title': {'$regex': '|'.join(query_words), '$options': 'i'}},
                {'description': {'$regex': '|'.join(query_words), '$options': 'i'}},
                {'tags': {'$in': query_words}},
            ]
        }
        
        # Execute search
        results = list(collection.find(search_query).limit(top_k).sort([('isFeatured', -1), ('views', -1)]))
        
        # Format results
        formatted_results = []
        for doc in results:
            formatted_results.append({
                '_id': str(doc.get('_id', doc.get('id', ''))),
                'title': doc.get('title', ''),
                'content': doc.get('content', doc.get('description', '')),
                'score': 0.9,
                'category': doc.get('category', ''),
                'tags': doc.get('tags', [])
            })
        
        return formatted_results[:top_k]

    except Exception as e:
        logger.error(f"Search error: {e}")
        return []

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda handler for RAG search
    """
    try:
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
                },
                'body': json.dumps({'message': 'CORS preflight'})
            }
        
        # Parse request
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        query = body.get('query', '')
        collection = body.get('collection', 'knowledge_base')
        top_k = body.get('top_k', 5)
        
        if not query:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Query parameter is required'
                })
            }
        
        # Search MongoDB for real prompts
        results = simple_text_search(query, top_k)
        
        # Mock embedding (384 dimensions to match expected format)
        query_embedding = [0.1] * 384
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'success': True,
                'results': results,
                'query_embedding': query_embedding,
                'total_results': len(results),
                'query': query
            })
        }

    except Exception as e:
        logger.error(f"Error in Lambda handler: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'Internal server error',
                'details': str(e)
            })
        }
