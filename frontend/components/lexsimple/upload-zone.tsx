'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onFileUpload: (file: File) => void
  onTextPaste: (text: string) => void
}

const fileTypes = [
  { ext: 'PDF', color: 'bg-white/8 text-white/70 border border-white/15 font-mono' },
  { ext: 'DOCX', color: 'bg-white/8 text-white/70 border border-white/15 font-mono' },
  { ext: 'TXT', color: 'bg-white/8 text-white/70 border border-white/15 font-mono' },
]

export function UploadZone({ onFileUpload, onTextPaste }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)
  const [pastedText, setPastedText] = useState('')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      onFileUpload(file)
    }
  }, [onFileUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload(file)
    }
  }, [onFileUpload])

  const handleTextSubmit = () => {
    if (pastedText.trim()) {
      onTextPaste(pastedText.trim())
    }
  }

  if (showTextInput) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <div className="w-full max-w-3xl">
          <div className="bg-[#141414] border border-white/10 rounded-xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Paste your contract text</h2>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste the full text of your legal document here..."
              className="w-full h-64 bg-[#0f0f0f] border border-white/15 rounded-xl p-4 text-white/80 text-sm resize-none focus:outline-none focus:border-[#76B900] placeholder:text-white/30 transition-all"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowTextInput(false)}
                className="px-4 py-2.5 text-sm font-medium text-white/50 hover:text-white transition-colors"
              >
                Back to upload
              </button>
              <button
                onClick={handleTextSubmit}
                disabled={!pastedText.trim()}
                className="px-6 py-2.5 bg-[#76B900] hover:bg-[#8fd400] text-black font-bold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze Document
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
      <div className="w-full max-w-xl">
        {/* Upload Card */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border border-dashed rounded-xl p-12 text-center transition-all cursor-pointer bg-transparent',
            isDragging 
              ? 'border-[#76B900]/60' 
              : 'border-white/20 hover:border-[#76B900]/60'
          )}
        >
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex justify-center mb-6">
            <Upload className="w-12 h-12 text-white/80" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Drop your contract here
          </h2>
          <p className="text-sm text-white/50 mb-6">
            PDF, DOCX, TXT — up to 50 pages
          </p>

          {/* File Type Badges */}
          <div className="flex justify-center gap-2 mb-6">
            {fileTypes.map((type) => (
              <span
                key={type.ext}
                className={cn('px-3 py-1 rounded-md text-xs', type.color)}
              >
                {type.ext}
              </span>
            ))}
          </div>
        </div>

        {/* Or divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-white/40 text-sm font-medium">or</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        {/* Paste text button */}
        <button
          onClick={() => setShowTextInput(true)}
          className="w-full py-3 border border-white/10 rounded-xl text-white/50 font-medium hover:text-white hover:border-white/25 transition-all text-sm flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Paste contract text
        </button>

        {/* Sample documents */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-xs mb-3 font-medium">Try a sample document:</p>
          <div className="flex justify-center gap-2">
            <button 
              onClick={() => onTextPaste(sampleLease)}
              className="px-3 py-1.5 text-xs text-white/50 font-medium hover:text-white transition-all"
            >
              Lease Agreement
            </button>
            <button 
              onClick={() => onTextPaste(sampleNDA)}
              className="px-3 py-1.5 text-xs text-white/50 font-medium hover:text-white transition-all"
            >
              NDA
            </button>
            <button 
              onClick={() => onTextPaste(sampleEmployment)}
              className="px-3 py-1.5 text-xs text-white/50 font-medium hover:text-white transition-all"
            >
              Employment Contract
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sample documents for demo
const sampleLease = `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement ("Agreement") is entered into as of January 15, 2025, by and between:

LANDLORD: Pacific Property Management LLC ("Landlord")
TENANT: John Smith ("Tenant")

PROPERTY ADDRESS: 1250 Oak Street, Apt 4B, San Francisco, CA 94117

1. TERM
The lease term shall commence on February 1, 2025 and terminate on January 31, 2026 ("Initial Term"). This lease shall automatically renew for successive one-year periods unless either party provides written notice of termination at least 7 days prior to the end of the current term.

2. RENT
Tenant agrees to pay monthly rent of $2,400.00, due on the first day of each month. A late fee of $150 will be assessed for any payment received after the 5th day of the month.

3. SECURITY DEPOSIT
Tenant shall deposit $4,800.00 as security deposit. Landlord may retain all or any portion of the deposit for any damages, unpaid rent, cleaning costs, or other charges as Landlord deems necessary in its sole discretion.

4. UTILITIES
Tenant shall be responsible for all utilities including electricity, gas, water, trash, and internet service.

5. MODIFICATIONS
Landlord reserves the right to modify any terms of this Agreement upon 5 days written notice to Tenant. Continued occupancy after such notice constitutes acceptance of modified terms.

6. EARLY TERMINATION
Tenant may terminate this lease early by providing 60 days written notice and paying a termination fee equal to 2 months' rent. Landlord may terminate for any reason with 30 days notice.

7. LATE PAYMENT INTEREST
Any amounts owed by Tenant that remain unpaid for more than 10 days shall accrue interest at a rate of 24% per annum.

8. INDEMNIFICATION
Tenant shall indemnify, defend, and hold harmless Landlord from and against any and all claims, damages, losses, and expenses arising from Tenant's occupancy of the premises or any act or omission of Tenant.

9. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California. Any disputes shall be resolved through binding arbitration in San Francisco, CA, and Tenant waives the right to a jury trial.

10. RENEWAL
Upon expiration of the Initial Term, Landlord may adjust the monthly rent by any amount, effective upon 7 days written notice.

SIGNATURES:
Landlord: Pacific Property Management LLC
Tenant: John Smith
Date: January 15, 2025`

const sampleNDA = `MUTUAL NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of March 1, 2025, by and between:

DISCLOSING PARTY: TechStart Inc., a Delaware corporation ("Company")
RECEIVING PARTY: Innovation Labs LLC ("Recipient")

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any and all information disclosed by either party, whether orally, in writing, or by any other means, that relates to the disclosing party's business operations, including but not limited to trade secrets, customer lists, financial information, business strategies, technical data, software, and all other proprietary information.

2. OBLIGATIONS
The Receiving Party agrees to:
(a) Hold all Confidential Information in strict confidence
(b) Not disclose Confidential Information to any third parties
(c) Use Confidential Information solely for the purpose of evaluating a potential business relationship
(d) Return or destroy all Confidential Information upon request

3. TERM
This Agreement shall remain in effect for a period of 5 years from the date of execution. The confidentiality obligations shall survive termination for an additional 10 years.

4. EXCEPTIONS
This Agreement does not apply to information that:
(a) Was publicly available prior to disclosure
(b) Becomes publicly available through no fault of the Receiving Party
(c) Was independently developed by the Receiving Party

5. STANDARD CARVE-OUTS
Information previously known to the Receiving Party, obtained from a third party legally entitled to disclose it, or required by law to be disclosed shall not be subject to confidentiality obligations.

6. LIMITATION OF LIABILITY
Both parties' aggregate liability under this Agreement shall be limited to fees paid in the preceding 12 months, excluding gross negligence and willful misconduct.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Delaware.

SIGNATURES:
TechStart Inc.
Innovation Labs LLC
Date: March 1, 2025`

const sampleEmployment = `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into as of April 1, 2025, by and between:

EMPLOYER: GlobalTech Solutions Inc. ("Company")
EMPLOYEE: Sarah Johnson ("Employee")

1. POSITION AND DUTIES
Employee shall serve as Senior Software Engineer. Employee agrees to devote full business time and best efforts to the Company's business.

2. COMPENSATION
Base Salary: $185,000 per year, payable bi-weekly
Signing Bonus: $15,000 (repayable if Employee voluntarily terminates within 12 months)
Annual Bonus: Up to 20% of base salary at Company's discretion

3. BENEFITS
Employee shall be eligible for standard company benefits including health insurance, dental, vision, and 401(k) matching up to 4%.

4. START DATE
Employment shall commence on April 15, 2025.

5. INTELLECTUAL PROPERTY
All inventions, discoveries, improvements, and works of authorship created by Employee during the term of employment, whether or not created during working hours or using Company resources, shall be the sole and exclusive property of the Company. Employee hereby assigns all rights to such intellectual property to the Company.

6. NON-COMPETE
For a period of 3 years following termination of employment, Employee shall not:
(a) Work for any competing business anywhere in the United States
(b) Solicit any Company customers or employees
(c) Engage in any business that competes with the Company

7. NON-SOLICITATION
For 2 years after termination, Employee shall not directly or indirectly solicit, recruit, or hire any Company employee.

8. TERMINATION
Company may terminate this Agreement at any time for any reason with 2 weeks notice. Employee may terminate with 4 weeks notice.

9. SEVERANCE
If terminated without cause, Employee shall receive 2 weeks of base salary as severance.

10. CONFIDENTIALITY
Employee shall not disclose any Company confidential information during or after employment.

11. ARBITRATION
Any disputes arising from this Agreement shall be resolved through binding arbitration. Employee waives the right to jury trial and participation in class action lawsuits.

12. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties. Company reserves the right to modify any terms at its sole discretion.

SIGNATURES:
GlobalTech Solutions Inc.
Sarah Johnson
Date: April 1, 2025`
