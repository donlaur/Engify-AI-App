"""
Lambda Handler for Engineering Leadership Discussion Prep Tool
Multi-Perspective Analysis for Engineering Problems

Use Case: Engineering leaders input a problem/situation, get comprehensive 
analysis from 4 roles (Director, Manager, Tech Lead, Architect) before meetings 
or ARB reviews. Perfect for preparing for engineering+product leadership 
discussions.

Beta-optimized: 5-minute timeout, single invocation, no chunking, RAG-enhanced
"""

import json
import os
import asyncio
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

def get_rag_context(situation: str, additional_context: str, db) -> str:
    """
    Get relevant prompts and patterns from MongoDB for agent context injection.
    Uses existing text indexes for fast search.
    
    Args:
        situation: The user's situation/problem
        additional_context: Additional context provided
        db: MongoDB database instance (can be None)
    
    Returns:
        Formatted context string with prompts and patterns, or empty string if no DB/search fails
    """
    if db is None:
        return ""
    
    context_parts = []
    search_query = f"{situation} {additional_context}".strip()
    
    if not search_query:
        return ""
    
    # Search prompts collection using text index (includes enriched fields)
    try:
        prompts = list(db['prompts'].find(
            {
                '$text': {'$search': search_query},
                'isPublic': True,
                'active': {'$ne': False}
            },
            {
                'score': {'$meta': 'textScore'},
                'title': 1,
                'description': 1,
                'pattern': 1,
                'category': 1,
                'tags': 1,
                # Enriched fields for better context
                'whatIs': 1,
                'whyUse': 1,
                'caseStudies': 1,
                'examples': 1,
                'useCases': 1,
                'bestPractices': 1,
                'seoKeywords': 1,
                'caseStudiesText': 1,  # Flattened text field
                'examplesText': 1,  # Flattened text field
            }
        ).sort([('score', {'$meta': 'textScore'})]).limit(5))
        
        if prompts:
            context_parts.append("## Relevant Prompts from Engify.ai Library:")
            for p in prompts:
                pattern = p.get('pattern', 'unknown')
                category = p.get('category', '')
                desc = p.get('description', '')[:200]
                title = p.get('title', 'Untitled')
                
                # Build enriched context
                enriched_context = []
                
                # Add whatIs if available
                what_is = p.get('whatIs', '')
                if what_is:
                    enriched_context.append(f"What it is: {what_is[:150]}")
                
                # Add whyUse if available (array of strings)
                why_use = p.get('whyUse', [])
                if why_use and isinstance(why_use, list):
                    why_use_text = '; '.join(why_use[:3])  # First 3 reasons
                    if why_use_text:
                        enriched_context.append(f"Why use: {why_use_text[:150]}")
                
                # Add useCases if available
                use_cases = p.get('useCases', [])
                if use_cases and isinstance(use_cases, list):
                    use_cases_text = '; '.join(use_cases[:2])  # First 2 use cases
                    if use_cases_text:
                        enriched_context.append(f"Use cases: {use_cases_text[:150]}")
                
                # Add case study summary if available
                case_studies = p.get('caseStudies', [])
                if case_studies and isinstance(case_studies, list) and len(case_studies) > 0:
                    first_case = case_studies[0]
                    if isinstance(first_case, dict):
                        case_title = first_case.get('title', '')
                        case_context = first_case.get('context', '') or first_case.get('scenario', '')
                        if case_title or case_context:
                            enriched_context.append(f"Example: {case_title} - {case_context[:100]}")
                
                # Build full context string
                base_context = f"- **{title}** ({pattern} pattern, {category} category): {desc}"
                if enriched_context:
                    base_context += f"\n  - {' | '.join(enriched_context)}"
                
                context_parts.append(base_context)
    except Exception as e:
        error_msg = str(e).lower()
        # Check if error is related to text index (index missing, being rebuilt, etc.)
        is_index_error = (
            'text index' in error_msg or
            'no text index' in error_msg or
            'index not found' in error_msg or
            'canonical index' in error_msg or
            'error code 27' in error_msg or  # MongoDB error code for index not found
            'errno 27' in error_msg
        )
        
        if is_index_error:
            print(f"Text index unavailable (may be rebuilding), using fallback search: {e}")
        else:
            print(f"Prompt search error: {e}")
        
        # Fallback: Try regex search if text index fails (includes enriched fields)
        try:
            query_words = search_query.lower().split()[:3]  # First 3 words
            if query_words:
                regex_pattern = '|'.join(query_words)
                # Enhanced fallback search includes flattened text fields
                prompts = list(db['prompts'].find({
                    'isPublic': True,
                    'active': {'$ne': False},
                    '$or': [
                        {'title': {'$regex': regex_pattern, '$options': 'i'}},
                        {'description': {'$regex': regex_pattern, '$options': 'i'}},
                        {'whatIs': {'$regex': regex_pattern, '$options': 'i'}},
                        {'useCases': {'$regex': regex_pattern, '$options': 'i'}},
                        {'caseStudiesText': {'$regex': regex_pattern, '$options': 'i'}},  # Flattened case studies
                        {'examplesText': {'$regex': regex_pattern, '$options': 'i'}},  # Flattened examples
                        {'tags': {'$in': query_words}},
                        {'seoKeywords': {'$in': query_words}}
                    ]
                }, {
                    'title': 1,
                    'description': 1,
                    'whatIs': 1,
                    'whyUse': 1,
                    'useCases': 1,
                }).limit(3))
                
                if prompts:
                    context_parts.append("## Relevant Prompts:")
                    for p in prompts:
                        title = p.get('title', 'Untitled')
                        desc = p.get('description', '')[:150]
                        what_is = p.get('whatIs', '')
                        enriched_info = f" ({what_is[:100]})" if what_is else ""
                        context_parts.append(
                            f"- **{title}**: {desc}{enriched_info}"
                        )
        except Exception as e2:
            print(f"Fallback prompt search error: {e2}")
    
    # Search patterns collection
    try:
        patterns = list(db['patterns'].find(
            {
                '$text': {'$search': search_query}
            },
            {
                'score': {'$meta': 'textScore'},
                'name': 1,
                'description': 1,
                'category': 1
            }
        ).sort([('score', {'$meta': 'textScore'})]).limit(3))
        
        if patterns:
            context_parts.append("\n## Relevant Prompt Patterns:")
            for pat in patterns:
                name = pat.get('name', 'Unknown')
                desc = pat.get('description', '')[:150]
                context_parts.append(f"- **{name}**: {desc}")
    except Exception as e:
        print(f"Pattern search error: {e}")
        # Fallback: Try regex search
        try:
            query_words = search_query.lower().split()[:2]
            if query_words:
                patterns = list(db['patterns'].find({
                    '$or': [
                        {'name': {'$regex': '|'.join(query_words), '$options': 'i'}},
                        {'description': {'$regex': '|'.join(query_words), '$options': 'i'}}
                    ]
                }).limit(2))
                
                if patterns:
                    context_parts.append("\n## Relevant Patterns:")
                    for pat in patterns:
                        context_parts.append(
                            f"- **{pat.get('name', 'Unknown')}**: {pat.get('description', '')[:100]}"
                        )
        except Exception as e2:
            print(f"Fallback pattern search error: {e2}")
    
    return "\n".join(context_parts) if context_parts else ""

def handler(event, context):
    """
    Lambda handler wrapper for async handler.
    Lambda Python runtime doesn't automatically await async handlers,
    so we wrap it with asyncio.run().
    """
    return asyncio.run(async_handler(event, context))

async def async_handler(event, context):
    """
    Lambda handler for engineering leadership discussion prep tool.
    Provides multi-perspective analysis on engineering problems from 4 roles.
    Beta: 5-minute timeout, single invocation, no chunking.
    
    Use Case: Leaders input a problem, get comprehensive perspectives before 
    meetings or ARB reviews.
    
    Note: When invoked directly via Lambda SDK (not API Gateway),
    the payload is passed directly as the event object.
    """
    try:
        # Parse request payload
        # Direct Lambda invocation: payload is the event itself
        # API Gateway format: payload is in event.body (string or dict)
        if isinstance(event, dict):
            # Check if this is API Gateway format (has 'body' field)
            if 'body' in event:
                # API Gateway format - parse body
                if isinstance(event.get('body'), str):
                    body = json.loads(event.get('body', '{}'))
                else:
                    body = event.get('body', {})
            else:
                # Direct Lambda SDK invocation - event IS the payload
                body = event
        else:
            # Fallback: treat as empty dict
            body = {}
        
        situation = body.get('situation', '').strip()
        context = body.get('context', '').strip()
        
        if not situation:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': 'Situation is required'})
            }
        
        # Get RAG context from MongoDB (prompts + patterns)
        db = get_db()
        rag_context = get_rag_context(situation, context, db)
        
        # Initialize state
        initial_state = {
            'situation': situation,
            'context': context,
            'rag_context': rag_context,  # Injected context for agents
            'current_topic': situation,  # Start with situation as first topic
            'director_notes': '',
            'manager_notes': '',
            'tech_lead_notes': '',
            'architect_notes': '',
            'recommendations': [],
            'implementation_plan': [],
            'risks_and_mitigations': [],
            'turn_count': 0,
            'max_turns': 12,  # Beta: Limit to 12 turns (3 rounds × 4 agents)
        }
        
        # Run workflow (beta: single invocation, 5-minute timeout)
        result = await app.ainvoke(initial_state)
        
        # Save to MongoDB if available
        session_id = None
        db = get_db()
        if db is not None:
            try:
                session_data = {
                    "timestamp": datetime.utcnow(),
                    "situation": situation,
                    "context": context,
                    "rag_context": rag_context,
                    "conversation": {
                        "director": result.get('director_notes', ''),
                        "manager": result.get('manager_notes', ''),
                        "tech_lead": result.get('tech_lead_notes', ''),
                        "architect": result.get('architect_notes', ''),
                    },
                    "summary": {
                        "recommendations": result.get('recommendations', []),
                        "implementation_plan": result.get('implementation_plan', []),
                        "risks_and_mitigations": result.get('risks_and_mitigations', []),
                    },
                    "turn_count": result.get('turn_count', 0),
                }
                insert_result = db['ai_integration_sessions'].insert_one(session_data)
                session_id = str(insert_result.inserted_id)
            except Exception as e:
                print(f"Failed to save session to MongoDB: {e}")
        
        # Return result
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'success': True,
                'session_id': str(session_id) if session_id else None,
                'summary': {
                    'recommendations': result.get('recommendations', []),
                    'implementation_plan': result.get('implementation_plan', []),
                    'risks_and_mitigations': result.get('risks_and_mitigations', []),
                },
                'conversation': {
                    'director': result.get('director_notes', ''),
                    'manager': result.get('manager_notes', ''),
                    'tech_lead': result.get('tech_lead_notes', ''),
                    'architect': result.get('architect_notes', ''),
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
                'message': 'Failed to run engineering leadership analysis'
            })
        }

