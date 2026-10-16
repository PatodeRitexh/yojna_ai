import logging
from typing import Any
from sqlalchemy.orm import Session
from app.models.models import Scheme, UserProfile, User
from app.core.config import settings

logger = logging.getLogger(__name__)

DISCLAIMER = (
    "Informational Guidance Only: Yojana AI provides guidance based on publicly verified "
    "government scheme records. Final eligibility and approvals are determined exclusively "
    "by the respective government departments and competent issuing authorities."
)

def search_relevant_schemes(query: str, db: Session, limit: int = 3) -> list[Scheme]:
    """Retrieves schemes relevant to the user's prompt."""
    query_terms = [t.lower() for t in query.split() if len(t) > 2]
    all_schemes = db.query(Scheme).all()
    
    scored_schemes = []
    for s in all_schemes:
        score = 0
        text_corpus = f"{s.official_name} {s.category} {s.short_summary} {s.benefits_summary} {' '.join(s.applicable_states or [])} {' '.join(s.target_beneficiaries or [])}".lower()
        
        for term in query_terms:
            if term in text_corpus:
                score += 1
                if term in s.official_name.lower():
                    score += 2
        
        if score > 0:
            scored_schemes.append((score, s))
            
    scored_schemes.sort(key=lambda x: x[0], reverse=True)
    return [s for _, s in scored_schemes[:limit]]


def query_assistant(
    user_query: str,
    db: Session,
    user: User | None = None,
    scheme_id: str | None = None
) -> dict[str, Any]:
    """Processes user query with RAG retrieval over verified scheme records."""
    target_schemes = []
    if scheme_id:
        s = db.query(Scheme).filter(Scheme.id == scheme_id).first()
        if s:
            target_schemes.append(s)
            
    if not target_schemes:
        target_schemes = search_relevant_schemes(user_query, db)

    context_snippets = []
    sources = []
    relevant_data = []

    for s in target_schemes:
        context_snippets.append(
            f"Scheme: {s.official_name}\n"
            f"Category: {s.category.title()} | Level: {s.government_level.title()}\n"
            f"Benefits: {s.benefits_summary}\n"
            f"Required Documents: {', '.join(s.required_documents or [])}\n"
            f"Application Process: {s.application_process}\n"
            f"Official Link: {s.official_application_url}\n"
        )
        sources.append(s.official_source_url)
        relevant_data.append({
            "id": s.id,
            "name": s.official_name,
            "benefits": s.benefits_summary,
            "official_url": s.official_application_url
        })

    context_str = "\n---\n".join(context_snippets) if context_snippets else "No specific scheme record matched the query keywords."

    user_info = ""
    if user and user.profile:
        p = user.profile
        user_info = (
            f"User Profile: State={p.state}, Category={p.category}, Occupation={p.occupation}, "
            f"Education={p.education_level} ({p.course_stream}), Income=₹{p.annual_family_income}."
        )

    # Try Gemini API if key is present
    if settings.GEMINI_API_KEY:
        try:
            import httpx
            system_prompt = (
                "You are Yojana AI, an intelligent, objective government scheme advisor for Indian citizens.\n"
                "Answer the user's question using ONLY the provided verified government scheme context.\n"
                "Do NOT invent dates, eligibility criteria, or benefit amounts.\n"
                "If the context does not contain sufficient information, state that the user should verify on the official department portal.\n"
                "Always cite the official portal name and link."
            )
            full_prompt = (
                f"{system_prompt}\n\n"
                f"{user_info}\n\n"
                f"Verified Scheme Database Records:\n{context_str}\n\n"
                f"User Question: {user_query}\n\n"
                f"Response:"
            )
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL_NAME}:generateContent?key={settings.GEMINI_API_KEY}"
            resp = httpx.post(url, json={"contents": [{"parts": [{"text": full_prompt}]}]}, timeout=10.0)
            if resp.status_code == 200:
                ai_text = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                return {
                    "reply": ai_text,
                    "relevant_schemes": relevant_data,
                    "sources": list(set(sources)),
                    "disclaimer": DISCLAIMER
                }
        except Exception as e:
            logger.info("Assistant LLM call failed or timed out: %s. Using structured knowledge base reply.", e)

    # Structured Knowledge Base Reply Fallback
    if target_schemes:
        first = target_schemes[0]
        reply_lines = [
            f"Based on our verified database, **{first.official_name}** is relevant to your inquiry.",
            f"• **Benefits:** {first.benefits_summary}",
            f"• **Required Documents:** {', '.join(first.required_documents or ['Aadhaar', 'Income Certificate'])}.",
            f"• **How to Apply:** {first.application_process}",
            f"You can apply and verify detailed guidelines at the official portal: [{first.source_authority}]({first.official_application_url})."
        ]
        if len(target_schemes) > 1:
            reply_lines.append(f"\nOther related schemes include: {', '.join(s.official_name for s in target_schemes[1:])}.")
        reply = "\n\n".join(reply_lines)
    else:
        reply = (
            "I could not locate an exact scheme matching those criteria in our current verified database. "
            "We recommend checking the official Indian National Portal ([services.india.gov.in](https://services.india.gov.in/)) "
            "or the [myScheme](https://www.myscheme.gov.in/) portal for recently published programs."
        )

    return {
        "reply": reply,
        "relevant_schemes": relevant_data,
        "sources": list(set(sources)),
        "disclaimer": DISCLAIMER
    }
