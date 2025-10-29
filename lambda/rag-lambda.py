import json
import os
from typing import List, Dict, Any, Optional
import boto3
from botocore.exceptions import ClientError

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for text inputs
    TODO: Replace with actual embedding service (AWS Bedrock, OpenAI, etc.)
    """
    # Mock embeddings for now - replace with real embedding service
    return [[0.1] * 384 for _ in texts]

def search_knowledge_base(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Search the knowledge base for relevant documents
    TODO: Replace with MongoDB Atlas Vector Search
    """
    # Mock search results based on query keywords
    if 'chain of thought' in query.lower():
        return [
            {
                '_id': 'prompt-001',
                'title': 'Chain of Thought Prompting',
                'content': 'Chain of Thought (CoT) is a prompting technique that asks the AI to think step by step before answering. This dramatically improves accuracy on complex reasoning tasks.',
                'category': 'patterns',
                'tags': ['reasoning', 'step-by-step', 'accuracy'],
                'score': 1.0
            }
        ]
    elif 'few-shot' in query.lower():
        return [
            {
                '_id': 'prompt-002',
                'title': 'Few-Shot Learning',
                'content': 'Few-Shot Learning provides 2-5 examples of input -> output pairs, then asks the AI to complete a similar task. Best for classification and formatting tasks.',
                'category': 'patterns',
                'tags': ['examples', 'classification', 'formatting'],
                'score': 0.95
            }
        ]
    elif 'okr' in query.lower():
        return [
            {
                '_id': 'workbench-001',
                'title': 'OKR Workbench',
                'content': 'The OKR Workbench helps you generate effective Objectives and Key Results with AI assistance. It provides templates, alignment checks, and progress tracking.',
                'category': 'workbench',
                'tags': ['okr', 'goals', 'strategy'],
                'score': 0.9
            }
        ]
    elif 'retrospective' in query.lower():
        return [
            {
                '_id': 'workbench-002',
                'title': 'Retrospective Diagnostician',
                'content': 'The Retrospective Diagnostician helps design and facilitate effective team retrospectives. It generates agendas, identifies problems, and creates action items.',
                'category': 'workbench',
                'tags': ['retrospective', 'agile', 'team'],
                'score': 0.9
            }
        ]
    elif 'tech debt' in query.lower():
        return [
            {
                '_id': 'workbench-003',
                'title': 'Tech Debt Strategist',
                'content': 'The Tech Debt Strategist helps build compelling business cases for technical debt remediation. It calculates ROI, assesses risks, and creates implementation plans.',
                'category': 'workbench',
                'tags': ['tech-debt', 'business-case', 'strategy'],
                'score': 0.9
            }
        ]
    else:
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
        
        # Search knowledge base
        results = search_knowledge_base(query, top_k)
        
        # Generate query embedding
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
        print(f"Error in Lambda handler: {str(e)}")
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

def health_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Health check endpoint for Lambda"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'status': 'ok',
            'service': 'engify-rag-lambda',
            'version': '1.0.0',
            'message': 'RAG Lambda service running',
            'timestamp': context.aws_request_id if context else 'unknown'
        })
    }