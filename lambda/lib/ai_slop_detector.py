"""
AI Slop Detection for Generated Content
Detects AI-generated patterns and quality issues
"""

import re
from typing import Dict, List

def detect_ai_slop(text: str) -> Dict:
    """
    Detect AI-generated content patterns and quality issues
    
    Args:
        text: Article content to analyze
    
    Returns:
        {
            'ai_probability': float,  # 0-1 (0=human, 1=AI)
            'quality_score': float,   # 0-10 (10=best)
            'flags': list,            # Specific issues found
            'recommendations': list,  # How to improve
            'metrics': dict          # Detailed metrics
        }
    """
    flags = []
    recommendations = []
    
    text_lower = text.lower()
    word_count = len(text.split())
    
    # 1. AI Slop Phrases
    slop_phrases = [
        'delve', 'delve into', 'delving',
        'leverage', 'leveraging',
        'utilize', 'utilization',
        'robust', 'seamless', 'cutting-edge', 'state-of-the-art',
        'revolutionary', 'game-changing', 'transformative',
        'it\'s important to note', 'it should be noted',
        'in today\'s fast-paced world', 'in this day and age',
        'at the end of the day', 'first and foremost',
        'it goes without saying', 'needless to say'
    ]
    
    slop_count = 0
    slop_found = []
    for phrase in slop_phrases:
        count = text_lower.count(phrase)
        if count > 0:
            slop_count += count
            slop_found.append({'phrase': phrase, 'count': count})
    
    if slop_count > 0:
        flags.append(f"AI slop phrases: {slop_count} total")
        recommendations.append("Remove AI slop phrases, use natural language")
    
    # 2. Em Dash Overuse (AI loves em dashes)
    em_dash_count = text.count('—')
    em_dash_ratio = (em_dash_count / (word_count / 100)) if word_count > 0 else 0
    
    if em_dash_ratio > 1:  # More than 1 per 100 words
        flags.append(f"Overuse of em dashes ({em_dash_count} total, {em_dash_ratio:.1f} per 100 words)")
        recommendations.append("Replace em dashes with periods or colons")
    
    # 3. Sentence Length Uniformity
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    sentence_lengths = [len(s.split()) for s in sentences]
    
    std_dev = 0
    if len(sentence_lengths) > 5:
        avg_length = sum(sentence_lengths) / len(sentence_lengths)
        variance = sum((x - avg_length) ** 2 for x in sentence_lengths) / len(sentence_lengths)
        std_dev = variance ** 0.5
        
        # AI text has low variance (uniform sentences)
        if std_dev < 5:
            flags.append(f"Uniform sentence length (std dev: {std_dev:.1f})")
            recommendations.append("Vary sentence length (mix short punchy + long complex)")
    
    # 4. Hedging Language (AI is overly cautious)
    hedges = ['may', 'might', 'could', 'possibly', 'generally', 
              'typically', 'often', 'usually', 'in most cases']
    
    hedge_count = sum(text_lower.count(h) for h in hedges)
    hedge_ratio = hedge_count / word_count if word_count > 0 else 0
    
    if hedge_ratio > 0.02:  # >2% hedging
        flags.append(f"Excessive hedging language ({hedge_ratio*100:.1f}%)")
        recommendations.append("Be more direct, reduce qualifiers")
    
    # 5. Vague Claims Without Citations
    vague_phrases = [
        'many experts', 'studies show', 'research indicates',
        'it\'s widely known', 'it\'s well established', 'it\'s commonly accepted'
    ]
    
    vague_count = sum(text_lower.count(p) for p in vague_phrases)
    if vague_count > 2:
        flags.append(f"Vague claims without citations ({vague_count}x)")
        recommendations.append("Add specific citations and sources")
    
    # 6. Personal Experience Markers (good = human)
    personal_markers = [
        'i tried', 'i tested', 'in my experience', 'i found',
        'we built', 'we discovered', 'our team', 'i noticed',
        'after testing', 'when i used'
    ]
    
    personal_count = sum(text_lower.count(p) for p in personal_markers)
    if personal_count == 0:
        flags.append("No personal experience markers")
        recommendations.append("Add personal testing/experience ('I tested...', 'We found...')")
    
    # 7. Specific Examples (good = human)
    has_code = '```' in text or '`' in text
    has_numbers = any(char.isdigit() for char in text)
    has_links = 'http' in text or '[' in text and ']' in text
    
    if not has_code:
        flags.append("No code examples")
        recommendations.append("Add code examples with syntax highlighting")
    if not has_numbers:
        flags.append("No specific numbers/data")
        recommendations.append("Add specific metrics, measurements, or data")
    if not has_links:
        flags.append("No citations/links")
        recommendations.append("Add citations to sources (Reddit, GitHub, docs)")
    
    # 8. Generic Structures (AI patterns)
    generic_patterns = [
        'there are several reasons why',
        'let\'s explore the key factors',
        'here are some important considerations',
        'in conclusion, it\'s clear that',
        'to summarize, we\'ve discussed'
    ]
    
    generic_count = sum(text_lower.count(p) for p in generic_patterns)
    if generic_count > 1:
        flags.append(f"Generic AI structures ({generic_count}x)")
        recommendations.append("Use more direct, specific language")
    
    # Calculate AI probability
    # More flags = higher AI probability
    flag_weight = len(flags) * 0.08  # Each flag adds 8%
    slop_weight = min(0.3, slop_count * 0.02)  # Slop phrases add up to 30%
    uniformity_weight = 0.2 if std_dev < 5 else 0
    
    ai_probability = min(1.0, flag_weight + slop_weight + uniformity_weight)
    
    # Calculate quality score (inverse of AI probability)
    quality_score = max(0, 10 - (ai_probability * 10))
    
    # Adjust quality based on positive signals
    if personal_count > 0:
        quality_score += 0.5
    if has_code:
        quality_score += 0.5
    if has_numbers:
        quality_score += 0.3
    if has_links:
        quality_score += 0.3
    
    quality_score = min(10, quality_score)
    
    return {
        'ai_probability': round(ai_probability, 2),
        'quality_score': round(quality_score, 1),
        'flags': flags,
        'recommendations': recommendations,
        'metrics': {
            'word_count': word_count,
            'slop_count': slop_count,
            'slop_phrases': slop_found,
            'em_dash_count': em_dash_count,
            'em_dash_ratio': round(em_dash_ratio, 2),
            'sentence_count': len(sentences),
            'avg_sentence_length': round(sum(sentence_lengths) / len(sentence_lengths), 1) if sentence_lengths else 0,
            'sentence_std_dev': round(std_dev, 1),
            'hedge_count': hedge_count,
            'hedge_ratio': round(hedge_ratio, 3),
            'vague_count': vague_count,
            'personal_count': personal_count,
            'has_code': has_code,
            'has_numbers': has_numbers,
            'has_links': has_links,
        }
    }

def print_detection_report(detection: Dict) -> None:
    """Print formatted detection report"""
    print("\n" + "="*60)
    print("AI SLOP DETECTION REPORT")
    print("="*60)
    
    print(f"\n📊 Overall Scores:")
    print(f"   AI Probability: {detection['ai_probability']*100:.0f}%")
    print(f"   Quality Score: {detection['quality_score']}/10")
    
    if detection['flags']:
        print(f"\n⚠️  Flags ({len(detection['flags'])}):")
        for flag in detection['flags']:
            print(f"   - {flag}")
    else:
        print(f"\n✅ No flags detected")
    
    if detection['recommendations']:
        print(f"\n💡 Recommendations:")
        for rec in detection['recommendations']:
            print(f"   - {rec}")
    
    metrics = detection['metrics']
    print(f"\n📈 Metrics:")
    print(f"   Words: {metrics['word_count']:,}")
    print(f"   Sentences: {metrics['sentence_count']}")
    print(f"   Avg Sentence Length: {metrics['avg_sentence_length']} words")
    print(f"   Sentence Variation (std dev): {metrics['sentence_std_dev']}")
    print(f"   AI Slop Phrases: {metrics['slop_count']}")
    print(f"   Em Dashes: {metrics['em_dash_count']} ({metrics['em_dash_ratio']} per 100 words)")
    print(f"   Personal Markers: {metrics['personal_count']}")
    print(f"   Has Code: {'✅' if metrics['has_code'] else '❌'}")
    print(f"   Has Numbers: {'✅' if metrics['has_numbers'] else '❌'}")
    print(f"   Has Links: {'✅' if metrics['has_links'] else '❌'}")
    
    if metrics['slop_phrases']:
        print(f"\n🚫 AI Slop Phrases Found:")
        for slop in metrics['slop_phrases']:
            print(f"   - '{slop['phrase']}' ({slop['count']}x)")
    
    print("\n" + "="*60)
    
    # Overall verdict
    if detection['quality_score'] >= 8:
        print("✅ PASS: Article meets quality standards")
    elif detection['quality_score'] >= 6:
        print("⚠️  REVIEW: Article needs minor improvements")
    else:
        print("❌ REJECT: Article needs major revision or regeneration")
    
    print("="*60 + "\n")
