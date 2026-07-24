import re
import google.generativeai as genai
from typing import Dict, Any, List
from app.core.config import settings

# Configure Gemini if key is provided
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    except Exception:
        pass

def process_ai_chat(message: str, user_profile: Dict[str, Any], transactions: List[Dict[str, Any]], health_score: Dict[str, Any]) -> Dict[str, Any]:
    """
    Processes user financial queries with LLM or domain financial engine.
    """
    query = message.lower().strip()
    
    # Calculate user context variables
    income = user_profile.get("monthly_income", 75000)
    currency = user_profile.get("preferred_currency", "INR")
    curr_symbol = "₹" if currency == "INR" else ("$" if currency == "USD" else "€")
    
    total_spent = sum(t["amount"] for t in transactions if t.get("type") == "expense")
    total_income = sum(t["amount"] for t in transactions if t.get("type") == "income") or income
    
    cat_spent = {}
    for t in transactions:
        if t.get("type") == "expense":
            cat = t.get("category", "Miscellaneous")
            cat_spent[cat] = cat_spent.get(cat, 0.0) + t.get("amount", 0.0)

    # Check if Gemini API is available
    if settings.GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            system_prompt = f"""
            You are IntelliWealth's elite AI Financial Assistant.
            User Profile:
            - Monthly Income: {curr_symbol}{income:,.2f}
            - Risk Preference: {user_profile.get('risk_preference')}
            - Financial Goals: {user_profile.get('financial_goals')}
            - Total Recorded Expenses: {curr_symbol}{total_spent:,.2f}
            - Financial Health Score: {health_score.get('score')}/100 ({health_score.get('tier')})
            - Category Expenses: {cat_spent}
            
            Answer the user's question concisely with accurate financial principles, encouraging tone, markdown formatting, bullet points, and actionable advice.
            Important: Always state that investment advice is for educational purposes only.
            """
            response = model.generate_content(f"{system_prompt}\n\nUser Question: {message}")
            if response and response.text:
                return {
                    "reply": response.text,
                    "suggested_prompts": [
                        "How can I save ₹5,000 this month?",
                        "Explain SIP vs Mutual Funds",
                        "Why is my Financial Score low?"
                    ]
                }
        except Exception:
            pass # Fall through to smart rules engine

    # --- Smart Financial Domain Response Engine ---
    
    # Query 1: Spending on Food / Specific Category
    if "food" in query or "dining" in query or "swiggy" in query or "zomato" in query:
        food_amt = cat_spent.get("Food", 0.0)
        return {
            "reply": f"📊 **Food & Dining Spending Breakdown**\n\nYou have spent **{curr_symbol}{food_amt:,.2f}** on Food and Dining out of your total recorded expenses of {curr_symbol}{total_spent:,.2f}.\n\n💡 **Tip**: Cooking at home during weekdays or setting a dedicated food budget of {curr_symbol}{max(3000, food_amt*0.7):,.0f} can free up surplus savings for your emergency fund!",
            "suggested_prompts": ["How can I save ₹5,000?", "Show last month's report", "Explain SIP"]
        }

    # Query 2: How to save money
    if "save" in query or "reduction" in query or "reduce" in query:
        return {
            "reply": f"💡 **3 Actionable Steps to Save {curr_symbol}5,000+ Monthly:**\n\n"
                     f"1. **Enforce the 50/30/20 Rule**: Allocate 50% to Needs, 30% to Wants, and 20% ({curr_symbol}{income*0.20:,.0f}) straight to Savings.\n"
                     f"2. **Audit Subscriptions**: Cancel streaming/apps you haven't used in the past 30 days.\n"
                     f"3. **Set Category Budgets**: Put a strict limit on Shopping & Entertainment in the IntelliWealth Budget Planner.\n\n"
                     f"🎯 **Potential Monthly Savings Identified:** {curr_symbol}5,000+",
            "suggested_prompts": ["Why is my Financial Score low?", "Explain Emergency Fund", "How much did I spend on food?"]
        }

    # Query 3: Explain SIP / Mutual Funds / ETF
    if "sip" in query or "mutual fund" in query or "etf" in query or "stock" in query:
        return {
            "reply": "📈 **Educational Overview: Systemic Investment Plan (SIP)**\n\n"
                     "• **Definition**: A SIP allows you to invest a fixed amount regularly (e.g. monthly) in mutual funds or index ETFs.\n"
                     "• **Benefits**: Rupee Cost Averaging (buys more units when market drops), compounding growth, and disciplined investing without market timing.\n"
                     "• **Risk Level**: Depends on underlying fund (Equity = Moderate to High, Debt = Low).\n\n"
                     "⚠️ *Note: Educational info only. Build a 3-6 month emergency fund before starting stock market SIPs.*",
            "suggested_prompts": ["What is ETF?", "How to build an Emergency Fund?", "Explain Risk Management"]
        }

    # Query 4: Financial Health Score
    if "score" in query or "health" in query or "low" in query or "why" in query:
        score = health_score.get("score", 72)
        tier = health_score.get("tier", "Good")
        suggs = "\n".join([f"• {s}" for s in health_score.get("suggestions", [])])
        return {
            "reply": f"🏥 **Your Financial Health Score: {score}/100 ({tier})**\n\n"
                     f"Your score is computed from 6 pillars: Savings Rate, Debt Ratio, Budget Discipline, Emergency Fund, Income Stability, and Investment Habits.\n\n"
                     f"**Key Recommendations to boost your score:**\n{suggs}",
            "suggested_prompts": ["How to build Emergency Fund?", "Explain SIP", "How much did I spend on food?"]
        }

    # Query 5: Report summary
    if "report" in query or "summary" in query:
        return {
            "reply": f"📑 **Monthly Financial Summary Report**\n\n"
                     f"• **Monthly Income**: {curr_symbol}{income:,.2f}\n"
                     f"• **Total Expenses**: {curr_symbol}{total_spent:,.2f}\n"
                     f"• **Net Savings**: {curr_symbol}{max(0, income - total_spent):,.2f}\n"
                     f"• **Financial Health Score**: {health_score.get('score', 72)}/100\n\n"
                     f"Head to the **Reports** page to download the complete PDF or CSV report!",
            "suggested_prompts": ["How can I save ₹5,000?", "Explain Mutual Funds", "What is ETF?"]
        }

    # Default general response
    return {
        "reply": f"🤖 **IntelliWealth AI Assistant**\n\nI can analyze your spending patterns, explain investment terms (SIP, Mutual Funds, ETFs, Bonds), calculate loan EMIs, or help you boost your Financial Health Score!\n\nAsk me anything like:\n• *'How much did I spend on food?'*\n• *'How can I save {curr_symbol}5,000?'*\n• *'Explain SIP and Mutual Funds'*\n• *'Why is my Financial Score low?'*",
        "suggested_prompts": ["How much did I spend on food?", "How can I save ₹5,000?", "Explain SIP", "Why is my Financial Score low?"]
    }
