import type { AnalysisReport, RiskFlag, Fact, Section, AgentStatus, DraftProposal } from './types'

// Generate a realistic analysis based on document content
export function generateMockAnalysis(documentText: string): AnalysisReport {
  const isLease = documentText.toLowerCase().includes('lease') || documentText.toLowerCase().includes('rent')
  const isEmployment = documentText.toLowerCase().includes('employee') || documentText.toLowerCase().includes('employment')
  const isNDA = documentText.toLowerCase().includes('confidential') || documentText.toLowerCase().includes('non-disclosure')

  const docType = isLease ? 'lease' : isEmployment ? 'employment_contract' : isNDA ? 'NDA' : 'service_agreement'
  
  // Detect jurisdiction
  const hasCA = documentText.toLowerCase().includes('california') || documentText.toLowerCase().includes('san francisco')
  const jurisdiction = hasCA ? 'California' : 'United States'

  // Generate risk flags based on content analysis
  const riskFlags: RiskFlag[] = []

  // Auto-renewal detection
  if (documentText.toLowerCase().includes('automatically renew') || documentText.toLowerCase().includes('auto-renew')) {
    const noticeMatch = documentText.match(/(\d+)\s*days?\s*(prior|notice|before)/i)
    const noticeDays = noticeMatch ? parseInt(noticeMatch[1]) : 7
    
    if (noticeDays < 30) {
      riskFlags.push({
        id: 'risk-1',
        clauseRef: '§ 1',
        severity: 'RED',
        category: 'Auto-Renewal',
        headline: `Auto-renews with only ${noticeDays} days notice — CA standard is 60`,
        explanation: `This lease automatically renews unless you provide notice ${noticeDays} days in advance. California law typically requires 60 days notice for lease renewals. You could be locked into another year without realizing it.`,
        suggestion: 'Request to change the notice period to at least 60 days to give yourself adequate time to make a decision.',
        marketNorm: '60 days',
        docValue: `${noticeDays} days`,
        deviation: 'HIGH'
      })
    }
  }

  // Unilateral modification detection
  if (documentText.toLowerCase().includes('reserves the right to modify') || documentText.toLowerCase().includes('sole discretion')) {
    riskFlags.push({
      id: 'risk-2',
      clauseRef: '§ 5',
      severity: 'RED',
      category: 'Unilateral Amendment',
      headline: 'Landlord can change terms with minimal notice',
      explanation: 'The other party can modify the terms of this agreement at their discretion with minimal notice. This creates uncertainty about your obligations and could result in unexpected changes.',
      suggestion: 'Request mutual consent for any modifications, or at minimum, require 30 days written notice.',
      marketNorm: 'Mutual consent',
      docValue: 'Unilateral',
      deviation: 'HIGH'
    })
  }

  // Security deposit issues
  if (documentText.toLowerCase().includes('sole discretion') && documentText.toLowerCase().includes('deposit')) {
    riskFlags.push({
      id: 'risk-3',
      clauseRef: '§ 3',
      severity: 'RED',
      category: 'Deposit',
      headline: 'Vague deposit forfeiture conditions',
      explanation: 'The conditions for withholding your security deposit are undefined and left to the landlord\'s sole discretion. This could result in losing your deposit without clear justification.',
      suggestion: 'Request specific, itemized conditions under which the deposit may be withheld, consistent with California Civil Code §1950.5.',
      marketNorm: 'Itemized conditions',
      docValue: 'Sole discretion',
      deviation: 'HIGH'
    })
  }

  // Late payment interest
  if (documentText.match(/(\d+)%?\s*(per\s*annum|apr|interest)/i)) {
    const rateMatch = documentText.match(/(\d+)%?\s*(per\s*annum|apr|interest)/i)
    const rate = rateMatch ? parseInt(rateMatch[1]) : 0
    if (rate > 18) {
      riskFlags.push({
        id: 'risk-4',
        clauseRef: '§ 7',
        severity: 'RED',
        category: 'Interest Rate',
        headline: `${rate}% late payment interest exceeds legal limits`,
        explanation: `The ${rate}% annual interest rate on late payments may exceed California's usury limits. Courts may not enforce rates this high, but you should negotiate a lower rate.`,
        suggestion: 'Request a late payment interest rate no higher than 10% per annum.',
        marketNorm: '10% max',
        docValue: `${rate}%`,
        deviation: 'HIGH'
      })
    }
  }

  // Arbitration/Jury waiver
  if (documentText.toLowerCase().includes('arbitration') || documentText.toLowerCase().includes('waives') && documentText.toLowerCase().includes('jury')) {
    riskFlags.push({
      id: 'risk-5',
      clauseRef: '§ 9',
      severity: 'RED',
      category: 'Arbitration',
      headline: 'Mandatory arbitration waives your jury rights',
      explanation: 'This agreement requires you to resolve disputes through binding arbitration, waiving your right to a jury trial. Arbitration can be faster but may favor repeat business users.',
      suggestion: 'Consider whether arbitration is acceptable or request the right to opt for court proceedings for disputes above a certain amount.',
    })
  }

  // Asymmetric termination
  if (documentText.toLowerCase().includes('terminate') && (documentText.toLowerCase().includes('for any reason') || documentText.toLowerCase().includes('without cause'))) {
    riskFlags.push({
      id: 'risk-6',
      clauseRef: '§ 6',
      severity: 'AMBER',
      category: 'Termination',
      headline: 'Asymmetric termination rights favor the other party',
      explanation: 'The other party can terminate with less notice or fewer restrictions than you can. This creates an imbalance that could leave you unexpectedly without housing or employment.',
      suggestion: 'Request equal termination rights for both parties.',
      marketNorm: 'Equal rights',
      docValue: 'Asymmetric',
      deviation: 'MEDIUM'
    })
  }

  // Non-compete (for employment)
  if (documentText.toLowerCase().includes('non-compete') || documentText.toLowerCase().includes('shall not work')) {
    const durationMatch = documentText.match(/(\d+)\s*years?/i)
    const duration = durationMatch ? parseInt(durationMatch[1]) : 0
    if (duration > 1) {
      riskFlags.push({
        id: 'risk-7',
        clauseRef: '§ 6',
        severity: 'RED',
        category: 'Non-Compete',
        headline: `${duration}-year non-compete may be unenforceable in CA`,
        explanation: `California generally does not enforce non-compete agreements under Business and Professions Code §16600. The ${duration}-year restriction is likely unenforceable, but could still create complications.`,
        suggestion: 'Note that California law generally prohibits non-compete clauses. Consider requesting removal or narrowing significantly.',
        marketNorm: 'Not enforceable in CA',
        docValue: `${duration} years`,
        deviation: 'HIGH'
      })
    }
  }

  // IP assignment (for employment)
  if (documentText.toLowerCase().includes('intellectual property') && documentText.toLowerCase().includes('sole and exclusive property')) {
    riskFlags.push({
      id: 'risk-8',
      clauseRef: '§ 5',
      severity: 'RED',
      category: 'IP Rights',
      headline: 'Overly broad IP assignment includes personal work',
      explanation: 'This clause assigns all inventions you create during employment to the company, even those created outside work hours or without company resources. California Labor Code §2870 limits this.',
      suggestion: 'Request carve-outs for inventions created entirely on your own time without company resources.',
      marketNorm: 'Work-related only',
      docValue: 'All inventions',
      deviation: 'HIGH'
    })
  }

  // Indemnification
  if (documentText.toLowerCase().includes('indemnify') && documentText.toLowerCase().includes('defend') && documentText.toLowerCase().includes('hold harmless')) {
    riskFlags.push({
      id: 'risk-9',
      clauseRef: '§ 8',
      severity: 'AMBER',
      category: 'Indemnification',
      headline: 'Broad indemnification shifts risk to you',
      explanation: 'You are agreeing to indemnify and defend the other party against claims arising from your use of the premises or services. This is standard but the scope may be broader than necessary.',
      suggestion: 'Request that indemnification be limited to claims arising from your negligence or willful misconduct.',
    })
  }

  // Add some green flags
  if (documentText.toLowerCase().includes('confidential')) {
    riskFlags.push({
      id: 'risk-green-1',
      clauseRef: '§ 10',
      severity: 'GREEN',
      category: 'Standard',
      headline: 'Standard confidentiality provisions',
      explanation: 'The confidentiality terms are standard for this type of agreement and protect both parties appropriately.',
      suggestion: 'No changes recommended.',
    })
  }

  riskFlags.push({
    id: 'risk-green-2',
    clauseRef: '§ 4',
    severity: 'GREEN',
    category: 'Standard',
    headline: 'Utilities arrangement is standard',
    explanation: 'The allocation of utility responsibilities is typical for this type of agreement.',
    suggestion: 'No changes recommended.',
  })

  // Generate facts
  const facts: Fact[] = []

  // Extract monetary values
  const rentMatch = documentText.match(/\$?([\d,]+)(?:\.00)?\s*(?:per month|monthly|\/month)/i)
  if (rentMatch) {
    facts.push({
      id: 'fact-1',
      label: 'Monthly Rent',
      value: `$${rentMatch[1]}`,
      clauseRef: '§ 2',
      category: 'payment'
    })
  }

  const depositMatch = documentText.match(/deposit[^$]*\$?([\d,]+)/i)
  if (depositMatch) {
    facts.push({
      id: 'fact-2',
      label: 'Security Deposit',
      value: `$${depositMatch[1]}`,
      clauseRef: '§ 3',
      category: 'payment'
    })
  }

  const salaryMatch = documentText.match(/\$?([\d,]+)\s*per year/i)
  if (salaryMatch) {
    facts.push({
      id: 'fact-3',
      label: 'Base Salary',
      value: `$${salaryMatch[1]}/year`,
      clauseRef: '§ 2',
      category: 'payment'
    })
  }

  // Extract dates
  const dateMatches = documentText.match(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi)
  if (dateMatches && dateMatches.length > 0) {
    facts.push({
      id: 'fact-4',
      label: 'Agreement Date',
      value: dateMatches[0],
      clauseRef: '§ 1',
      category: 'date'
    })
    if (dateMatches.length > 1) {
      facts.push({
        id: 'fact-5',
        label: 'End Date',
        value: dateMatches[dateMatches.length - 1],
        clauseRef: '§ 1',
        category: 'date'
      })
    }
  }

  // Party names
  const landlordMatch = documentText.match(/LANDLORD:\s*([^\n("]+)/i)
  const tenantMatch = documentText.match(/TENANT:\s*([^\n("]+)/i)
  const employerMatch = documentText.match(/EMPLOYER:\s*([^\n("]+)/i)
  const employeeMatch = documentText.match(/EMPLOYEE:\s*([^\n("]+)/i)

  if (landlordMatch) {
    facts.push({ id: 'fact-6', label: 'Landlord', value: landlordMatch[1].trim(), clauseRef: 'Preamble', category: 'party' })
  }
  if (tenantMatch) {
    facts.push({ id: 'fact-7', label: 'Tenant', value: tenantMatch[1].trim(), clauseRef: 'Preamble', category: 'party' })
  }
  if (employerMatch) {
    facts.push({ id: 'fact-8', label: 'Employer', value: employerMatch[1].trim(), clauseRef: 'Preamble', category: 'party' })
  }
  if (employeeMatch) {
    facts.push({ id: 'fact-9', label: 'Employee', value: employeeMatch[1].trim(), clauseRef: 'Preamble', category: 'party' })
  }

  // Renewal notice period
  const noticeMatch = documentText.match(/(\d+)\s*days?\s*(?:prior|notice|before)/i)
  if (noticeMatch) {
    facts.push({
      id: 'fact-10',
      label: 'Renewal Notice',
      value: `${noticeMatch[1]} days`,
      clauseRef: '§ 1',
      category: 'termination'
    })
  }

  // Late fee
  const lateFeeMatch = documentText.match(/late fee[^$]*\$?([\d,]+)/i)
  if (lateFeeMatch) {
    facts.push({
      id: 'fact-11',
      label: 'Late Fee',
      value: `$${lateFeeMatch[1]}`,
      clauseRef: '§ 2',
      category: 'payment'
    })
  }

  // Jurisdiction
  facts.push({
    id: 'fact-12',
    label: 'Governing Law',
    value: jurisdiction,
    clauseRef: '§ 9',
    category: 'jurisdiction'
  })

  // Add nulls for missing important facts
  if (!facts.find(f => f.label === 'Early Termination Fee')) {
    facts.push({
      id: 'fact-null-1',
      label: 'Early Termination Fee',
      value: null,
      clauseRef: 'Not found',
      category: 'payment'
    })
  }

  // Generate sections
  const sections: Section[] = [
    {
      id: 'section-1',
      title: 'Term and Renewal',
      original: 'The lease term shall commence on February 1, 2025 and terminate on January 31, 2026. This lease shall automatically renew for successive one-year periods unless either party provides written notice of termination at least 7 days prior to the end of the current term.',
      simplified: 'Your lease starts February 1, 2025 and ends January 31, 2026. After that, it automatically renews for another year unless you give written notice 7 days before it ends. This is a very short notice window — most leases require 30-60 days.',
      readingGrade: 8,
      hasAmbiguity: false
    },
    {
      id: 'section-2',
      title: 'Rent and Payment',
      original: 'Tenant agrees to pay monthly rent of $2,400.00, due on the first day of each month. A late fee of $150 will be assessed for any payment received after the 5th day of the month.',
      simplified: 'You pay $2,400 per month, due on the 1st. If you pay after the 5th, you owe an extra $150 late fee.',
      readingGrade: 6,
      hasAmbiguity: false
    },
    {
      id: 'section-3',
      title: 'Security Deposit',
      original: 'Tenant shall deposit $4,800.00 as security deposit. Landlord may retain all or any portion of the deposit for any damages, unpaid rent, cleaning costs, or other charges as Landlord deems necessary in its sole discretion.',
      simplified: 'You pay a $4,800 security deposit. The landlord can keep some or all of it for damages, unpaid rent, or cleaning — but the vague "sole discretion" language is concerning. California law requires itemized deductions.',
      readingGrade: 7,
      hasAmbiguity: true
    },
    {
      id: 'section-4',
      title: 'Modifications',
      original: 'Landlord reserves the right to modify any terms of this Agreement upon 5 days written notice to Tenant. Continued occupancy after such notice constitutes acceptance of modified terms.',
      simplified: 'The landlord can change any terms with just 5 days notice, and if you stay, you automatically agree. This is unusual and gives the landlord significant power to alter your agreement.',
      readingGrade: 8,
      hasAmbiguity: true
    },
    {
      id: 'section-5',
      title: 'Termination',
      original: 'Tenant may terminate this lease early by providing 60 days written notice and paying a termination fee equal to 2 months\' rent. Landlord may terminate for any reason with 30 days notice.',
      simplified: 'To leave early, you need to give 60 days notice AND pay 2 months rent as a penalty. But the landlord can kick you out with only 30 days notice for any reason. This is unbalanced.',
      readingGrade: 7,
      hasAmbiguity: false
    },
    {
      id: 'section-6',
      title: 'Dispute Resolution',
      original: 'Any disputes shall be resolved through binding arbitration in San Francisco, CA, and Tenant waives the right to a jury trial.',
      simplified: 'If there\'s a disagreement, you must go through arbitration — no court, no jury. This is common but limits your legal options.',
      readingGrade: 8,
      hasAmbiguity: false
    }
  ]

  // Calculate overall risk score
  const redCount = riskFlags.filter(f => f.severity === 'RED').length
  const amberCount = riskFlags.filter(f => f.severity === 'AMBER').length
  const overallScore = Math.min(10, 3 + redCount * 1.5 + amberCount * 0.7)

  return {
    classification: {
      docType,
      jurisdiction,
      partyRoles: {
        user: isLease ? 'Tenant' : isEmployment ? 'Employee' : 'Receiving Party',
        counterparty: isLease ? 'Landlord' : isEmployment ? 'Employer' : 'Disclosing Party'
      },
      confidence: 0.94
    },
    riskFlags,
    facts,
    sections,
    overallScore,
    executiveSummary: `This ${docType.replace('_', ' ')} contains ${redCount} critical risks requiring immediate attention, including ${riskFlags[0]?.headline.toLowerCase() || 'unusual terms'}. The agreement appears to favor the ${isLease ? 'landlord' : isEmployment ? 'employer' : 'disclosing party'} with several non-standard provisions. We recommend negotiating the flagged clauses before signing.`
  }
}

export function generateAgentStatuses(): AgentStatus[] {
  return [
    { name: 'Classifier Agent', model: 'nemotron-nano-9b', status: 'pending' },
    { name: 'Risk Scanner Agent', model: 'nemotron-super-120b', status: 'pending' },
    { name: 'Extractor Agent', model: 'nemotron-nano-9b', status: 'pending' },
    { name: 'Simplifier Agent', model: 'nemotron-nano-9b', status: 'pending' },
    { name: 'Report Builder Agent', model: 'nemotron-super-120b', status: 'pending' },
  ]
}

export function generateDraftProposal(flag: { clauseRef: string; category: string; headline: string }): DraftProposal {
  // Generate contextual drafts based on the risk type
  const proposals: Record<string, DraftProposal> = {
    'Auto-Renewal': {
      original: 'This lease shall automatically renew for successive one-year periods unless either party provides written notice of termination at least 7 days prior to the end of the current term.',
      proposed: 'This lease shall automatically renew for successive one-year periods unless either party provides written notice of termination at least 60 days prior to the end of the current term. Landlord shall provide Tenant with a renewal reminder notice at least 90 days before the end of the current term.',
      changeSummary: 'Changed notice period from 7 days to 60 days and added landlord reminder requirement.',
      riskDelta: { before: 'RED', after: 'GREEN' }
    },
    'Unilateral Amendment': {
      original: 'Landlord reserves the right to modify any terms of this Agreement upon 5 days written notice to Tenant. Continued occupancy after such notice constitutes acceptance of modified terms.',
      proposed: 'Any modifications to this Agreement shall require mutual written consent of both parties. Neither party may unilaterally modify the terms of this Agreement.',
      changeSummary: 'Changed from unilateral modification to mutual consent requirement.',
      riskDelta: { before: 'RED', after: 'GREEN' }
    },
    'Deposit': {
      original: 'Landlord may retain all or any portion of the deposit for any damages, unpaid rent, cleaning costs, or other charges as Landlord deems necessary in its sole discretion.',
      proposed: 'Landlord may retain portions of the deposit only for: (a) unpaid rent, (b) damage beyond normal wear and tear as documented with photographs, (c) cleaning costs if unit is left less clean than at move-in. Landlord shall provide an itemized statement within 21 days of move-out per California Civil Code §1950.5.',
      changeSummary: 'Added specific conditions and itemization requirement per California law.',
      riskDelta: { before: 'RED', after: 'GREEN' }
    },
    'Interest Rate': {
      original: 'Any amounts owed by Tenant that remain unpaid for more than 10 days shall accrue interest at a rate of 24% per annum.',
      proposed: 'Any amounts owed by Tenant that remain unpaid for more than 10 days shall accrue interest at a rate of 10% per annum, the maximum rate permitted under California law.',
      changeSummary: 'Reduced interest rate from 24% to 10% to comply with California usury limits.',
      riskDelta: { before: 'RED', after: 'GREEN' }
    },
    'Non-Compete': {
      original: 'For a period of 3 years following termination of employment, Employee shall not work for any competing business anywhere in the United States.',
      proposed: 'Employee agrees to maintain confidentiality of Company proprietary information following termination. [Note: Non-compete clause removed as unenforceable under California Business and Professions Code §16600.]',
      changeSummary: 'Removed unenforceable non-compete clause, retained confidentiality obligations.',
      riskDelta: { before: 'RED', after: 'GREEN' }
    },
    'IP Rights': {
      original: 'All inventions, discoveries, improvements, and works of authorship created by Employee during the term of employment, whether or not created during working hours or using Company resources, shall be the sole and exclusive property of the Company.',
      proposed: 'All inventions, discoveries, improvements, and works of authorship created by Employee during the term of employment that (a) relate to Company business, (b) are created during working hours, OR (c) are created using Company resources, shall be the property of the Company. Inventions created entirely on Employee\'s own time without Company resources and unrelated to Company business are excluded per California Labor Code §2870.',
      changeSummary: 'Added California Labor Code §2870 carve-outs for personal inventions.',
      riskDelta: { before: 'RED', after: 'GREEN' }
    }
  }

  return proposals[flag.category] || {
    original: `[Original clause from ${flag.clauseRef}]`,
    proposed: `[Proposed revision addressing: ${flag.headline}]`,
    changeSummary: 'Revised clause to address the identified risk.',
    riskDelta: { before: 'RED', after: 'AMBER' }
  }
}
