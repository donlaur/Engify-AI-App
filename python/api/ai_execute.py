"""
AI Execution API - Execute prompts with multiple AI providers
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
import os
import openai
import anthropic
import google.generativeai as genai

app = FastAPI()

# Configure AI clients
openai.api_key = os.getenv('OPENAI_API_KEY')
anthropic_client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
genai.configure(api_key=os.getenv('GOOGLE_AI_API_KEY'))

class AIRequest(BaseModel):
    prompt: str
    provider: Literal['openai', 'anthropic', 'google']
    model: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 1000

class AIResponse(BaseModel):
    response: str
    provider: str
    model: str
    tokens_used: Optional[int] = None

@app.post("/api/ai/execute", response_model=AIResponse)
async def execute_ai(request: AIRequest):
    """Execute AI prompt with specified provider"""
    try:
        if request.provider == 'openai':
            model = request.model or 'gpt-4-turbo-preview'
            response = openai.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": request.prompt}],
                temperature=request.temperature,
                max_tokens=request.max_tokens
            )
            return AIResponse(
                response=response.choices[0].message.content,
                provider='openai',
                model=model,
                tokens_used=response.usage.total_tokens
            )
        
        elif request.provider == 'anthropic':
            model = request.model or 'claude-3-sonnet-20240229'
            message = anthropic_client.messages.create(
                model=model,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                messages=[{"role": "user", "content": request.prompt}]
            )
            return AIResponse(
                response=message.content[0].text,
                provider='anthropic',
                model=model,
                tokens_used=message.usage.input_tokens + message.usage.output_tokens
            )
        
        elif request.provider == 'google':
            model_name = request.model or 'gemini-pro'
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                request.prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=request.temperature,
                    max_output_tokens=request.max_tokens
                )
            )
            return AIResponse(
                response=response.text,
                provider='google',
                model=model_name
            )
        
        else:
            raise HTTPException(status_code=400, detail="Invalid provider")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "providers": ["openai", "anthropic", "google"]}
