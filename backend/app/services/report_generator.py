import io
import csv
from typing import List, Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_csv_report(transactions: List[Dict[str, Any]]) -> str:
    """
    Generates a CSV string format for transactions report.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Date", "Merchant", "Amount", "Type", "Category", "Payment Method", "Notes", "Source"])
    
    for t in transactions:
        writer.writerow([
            t.get("id"),
            str(t.get("date")),
            t.get("merchant"),
            t.get("amount"),
            t.get("type"),
            t.get("category"),
            t.get("payment_method"),
            t.get("notes", ""),
            t.get("source", "Manual")
        ])
        
    return output.getvalue()

def generate_pdf_report(user_name: str, income: float, total_expense: float, health_score: Dict[str, Any], transactions: List[Dict[str, Any]]) -> bytes:
    """
    Generates a professional PDF Financial Report byte string using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=22,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=12
    )
    
    sub_title = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#3B82F6'),
        spaceAfter=15
    )

    body_style = styles['Normal']
    
    elements = []
    
    # Title
    elements.append(Paragraph("IntelliWealth - Personal Financial Intelligence Report", title_style))
    elements.append(Paragraph(f"Generated for: <b>{user_name}</b>", sub_title))
    elements.append(Spacer(1, 10))
    
    # Executive Summary Table
    savings = max(0.0, income - total_expense)
    summary_data = [
        ["Metric", "Value"],
        ["Monthly Income", f"₹{income:,.2f}"],
        ["Total Expense", f"₹{total_expense:,.2f}"],
        ["Monthly Savings", f"₹{savings:,.2f}"],
        ["Financial Health Score", f"{health_score.get('score', 75)}/100 ({health_score.get('tier', 'Good')})"]
    ]
    
    t_summary = Table(summary_data, colWidths=[200, 250])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
    ]))
    elements.append(t_summary)
    elements.append(Spacer(1, 20))
    
    # Financial Health Recommendations
    elements.append(Paragraph("<b>AI Financial Recommendations:</b>", styles['Heading3']))
    for sugg in health_score.get("suggestions", []):
        elements.append(Paragraph(f"• {sugg}", body_style))
        elements.append(Spacer(1, 4))
        
    elements.append(Spacer(1, 20))
    
    # Recent Transactions Table
    elements.append(Paragraph("<b>Recent Transactions:</b>", styles['Heading3']))
    tx_data = [["Date", "Merchant", "Category", "Type", "Amount"]]
    for t in transactions[:15]: # Top 15
        date_str = str(t.get("date"))[:10]
        amt_str = f"₹{t.get('amount'):,.2f}"
        tx_data.append([date_str, str(t.get("merchant")), str(t.get("category")), str(t.get("type")), amt_str])
        
    t_tx = Table(tx_data, colWidths=[80, 120, 100, 70, 80])
    t_tx.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#3B82F6')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('FONTSIZE', (0,0), (-1,-1), 9),
    ]))
    elements.append(t_tx)
    
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
