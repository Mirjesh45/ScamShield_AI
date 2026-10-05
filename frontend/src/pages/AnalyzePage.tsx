import React, { useState } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Link2, 
  Image as ImageIcon, 
  Upload, 
  X, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  FileText, 
  RefreshCw,
  ExternalLink,
  Shield,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../api/client';
import { AnalysisResult, InputType } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { IndicatorCard } from '../components/IndicatorCard';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ReportModal } from '../components/ReportModal';

export const AnalyzePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<InputType>('message');
  
  // Inputs
  const [messageText, setMessageText] = useState('');
  const [emailSender, setEmailSender] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [urlInput, setUrlInput] = useState('');
  
  // Image Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [extractedOcrText, setExtractedOcrText] = useState<string>('');

  // Execution state
  const [saveHistory, setSaveHistory] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // Clear inputs
  const handleClear = () => {
    setMessageText('');
    setEmailSender('');
    setEmailSubject('');
    setEmailBody('');
    setUrlInput('');
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setExtractedOcrText('');
    setErrorMsg(null);
    setResult(null);
  };

  // Sample Presets for Immediate Testing
  const loadMessageSample = (type: string) => {
    setErrorMsg(null);
    if (type === 'prize') {
      setMessageText('Congratulations! You have won ₹50,000. Click this link immediately to claim your prize: http://claim-prize-funds.xyz/rewards');
    } else if (type === 'kyc') {
      setMessageText('Dear Customer, your SBI bank account has been suspended due to pending e-KYC. Visit https://sbi-kyc-portal.secure-net.cc immediately to verify Aadhaar & PAN or account will be permanently blocked.');
    } else if (type === 'upi') {
      setMessageText('PhonePe Reward: You received a cashback voucher of Rs 2,499! Click here and enter your 6-digit UPI PIN to credit funds to your bank account: http://phonepe-rewards.biz/claim');
    } else if (type === 'job') {
      setMessageText('Amazon HR: Your resume was shortlisted for part-time data entry. Earn 3000 to 5000 INR per day working 1 hour from home. Contact manager on Telegram @hr_vip_task to start.');
    } else if (type === 'safe') {
      setMessageText('Your OTP for Amazon login is 491029. Valid for 10 minutes. Do not share this OTP with anyone for security purposes.');
    }
  };

  const loadEmailSample = (type: string) => {
    setErrorMsg(null);
    if (type === 'paypal') {
      setEmailSender('security-update@paypal-support.xyz');
      setEmailSubject('URGENT: Unauthorized login detected from Moscow');
      setEmailBody('Dear Member,\n\nWe detected a login attempt on your PayPal account from an unrecognized IP address in Moscow, Russia. Your account has been temporarily restricted.\n\nTo restore your account and verify your identity, visit our verification portal within 24 hours:\nhttps://paypal-account-security-center.com.co/resolve?token=98214\n\nThank you,\nPayPal Security Team');
    } else if (type === 'delivery') {
      setEmailSender('customs-notice@fedex-shipments.biz');
      setEmailSubject('Shipment FDX-99214 on hold: Customs surcharge required');
      setEmailBody('Hello,\n\nYour FedEx parcel #FDX-99214 has arrived at our distribution hub but cannot be delivered due to unpaid customs clearance charges of $3.50.\n\nPlease pay the outstanding fee immediately to avoid return to sender:\nhttp://fedex-parcel-redelivery-tracking.support-info.biz/delivery\n\nFedEx Logistics Team');
    } else if (type === 'safe') {
      setEmailSender('alex.chen@workplace.com');
      setEmailSubject('Engineering Sync: Architecture Review for Q4');
      setEmailBody('Hi team,\n\nAttached is the meeting agenda for tomorrow\'s architecture review at 10:00 AM UTC. Please review the design doc on our internal wiki before the call.\n\nBest,\nAlex');
    }
  };

  const loadUrlSample = (type: string) => {
    setErrorMsg(null);
    if (type === 'sbi') {
      setUrlInput('https://sbi-kyc-portal.secure-net.cc');
    } else if (type === 'fastflux') {
      setUrlInput('http://paypal-account-security-center.com.co/resolve?token=98214');
    } else if (type === 'ip') {
      setUrlInput('http://192.168.1.105:8080/netflix-free-premium/login.php');
    } else if (type === 'safe') {
      setUrlInput('https://github.com/microsoft/vscode');
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setErrorMsg(null);
  };

  // Perform Analysis
  const handleAnalyze = async () => {
    setErrorMsg(null);
    setLoading(true);
    setResult(null);

    try {
      let res: AnalysisResult;
      if (activeTab === 'message') {
        if (!messageText.trim()) throw new Error('Please enter a message to analyze.');
        res = await api.analyzeMessage(messageText, saveHistory);
      } else if (activeTab === 'email') {
        if (!emailBody.trim()) throw new Error('Please enter email body content to analyze.');
        res = await api.analyzeEmail(emailSender, emailSubject, emailBody, saveHistory);
      } else if (activeTab === 'url') {
        if (!urlInput.trim()) throw new Error('Please enter a URL to analyze.');
        res = await api.analyzeUrl(urlInput, saveHistory);
      } else {
        if (!selectedFile) throw new Error('Please select or upload a screenshot to analyze.');
        res = await api.analyzeImage(selectedFile, saveHistory);
        if (res.extracted_text) {
          setExtractedOcrText(res.extracted_text);
        }
      }
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs">
          <Shield className="w-3.5 h-3.5" />
          <span>Multi-Vector Detection Console</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Cyber Threat & Scam Analyzer
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Submit suspicious messages, phishing emails, unknown URLs, or screenshot imagery for deep forensic AI inspection.
        </p>
      </div>

      {/* 4 Tabs */}
      <div className="flex border-b border-[#1F2A44] gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => { setActiveTab('message'); setResult(null); setErrorMsg(null); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium text-xs sm:text-sm border-t border-x transition-all shrink-0 ${
            activeTab === 'message'
              ? 'bg-[#0D1424] text-cyan-300 border-cyan-500/40 border-b-2 border-b-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0D1424]/40'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          Message
        </button>

        <button
          onClick={() => { setActiveTab('email'); setResult(null); setErrorMsg(null); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium text-xs sm:text-sm border-t border-x transition-all shrink-0 ${
            activeTab === 'email'
              ? 'bg-[#0D1424] text-cyan-300 border-cyan-500/40 border-b-2 border-b-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0D1424]/40'
          }`}
        >
          <Mail className="w-4 h-4 text-cyan-400" />
          Email
        </button>

        <button
          onClick={() => { setActiveTab('url'); setResult(null); setErrorMsg(null); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium text-xs sm:text-sm border-t border-x transition-all shrink-0 ${
            activeTab === 'url'
              ? 'bg-[#0D1424] text-cyan-300 border-cyan-500/40 border-b-2 border-b-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0D1424]/40'
          }`}
        >
          <Link2 className="w-4 h-4 text-cyan-400" />
          URL
        </button>

        <button
          onClick={() => { setActiveTab('image'); setResult(null); setErrorMsg(null); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium text-xs sm:text-sm border-t border-x transition-all shrink-0 ${
            activeTab === 'image'
              ? 'bg-[#0D1424] text-cyan-300 border-cyan-500/40 border-b-2 border-b-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0D1424]/40'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          Screenshot (OCR)
        </button>
      </div>

      {/* Main Analysis Input Container */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1424] border border-[#1F2A44] shadow-xl space-y-6">
        {/* TAB 1: MESSAGE */}
        {activeTab === 'message' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Suspicious Message Content
              </label>
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Try:
                </span>
                <button onClick={() => loadMessageSample('prize')} className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-cyan-300 border border-[#1F2A44] text-[11px]">
                  Prize Scam
                </button>
                <button onClick={() => loadMessageSample('kyc')} className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-cyan-300 border border-[#1F2A44] text-[11px]">
                  Bank KYC Alert
                </button>
                <button onClick={() => loadMessageSample('upi')} className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-cyan-300 border border-[#1F2A44] text-[11px]">
                  UPI Reward
                </button>
                <button onClick={() => loadMessageSample('job')} className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-cyan-300 border border-[#1F2A44] text-[11px]">
                  Telegram Job
                </button>
                <button onClick={() => loadMessageSample('safe')} className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-emerald-300 border border-[#1F2A44] text-[11px]">
                  Legitimate OTP
                </button>
              </div>
            </div>

            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Paste a suspicious message here... e.g. 'Congratulations! You have won ₹50,000. Click this link immediately to claim your prize.'"
              className="w-full p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-400 font-mono transition-all resize-y"
            />
          </div>
        )}

        {/* TAB 2: EMAIL */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Email Details
              </label>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Try:
                </span>
                <button onClick={() => loadEmailSample('paypal')} className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-cyan-300 border border-[#1F2A44] text-[11px]">
                  PayPal Spoof
                </button>
                <button onClick={() => loadEmailSample('delivery')} className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-cyan-300 border border-[#1F2A44] text-[11px]">
                  FedEx Invoice
                </button>
                <button onClick={() => loadEmailSample('safe')} className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-emerald-300 border border-[#1F2A44] text-[11px]">
                  Authentic Team Sync
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">Sender Email / Address</label>
                <input
                  type="text"
                  value={emailSender}
                  onChange={(e) => setEmailSender(e.target.value)}
                  placeholder="e.g. support@paypal-notification.biz"
                  className="w-full p-3 rounded-xl bg-[#070B14] border border-[#1F2A44] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-400 font-mono transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">Email Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. URGENT: Your account access has been restricted"
                  className="w-full p-3 rounded-xl bg-[#070B14] border border-[#1F2A44] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-400 font-sans transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">Email Body Content</label>
              <textarea
                rows={5}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Paste the full email body text and any included links..."
                className="w-full p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-400 font-mono transition-all resize-y"
              />
            </div>
          </div>
        )}

        {/* TAB 3: URL */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Suspicious URL or Link
              </label>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Try:
                </span>
                <button onClick={() => loadUrlSample('sbi')} className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-cyan-300 border border-[#1F2A44] text-[11px]">
                  SBI Phishing .cc
                </button>
                <button onClick={() => loadUrlSample('fastflux')} className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-cyan-300 border border-[#1F2A44] text-[11px]">
                  PayPal Token Link
                </button>
                <button onClick={() => loadUrlSample('ip')} className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-cyan-300 border border-[#1F2A44] text-[11px]">
                  Direct IP Host
                </button>
                <button onClick={() => loadUrlSample('safe')} className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-emerald-300 border border-[#1F2A44] text-[11px]">
                  Official GitHub URL
                </button>
              </div>
            </div>

            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/login.php?verify=1"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[#070B14] border border-[#1F2A44] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder:text-slate-400 font-mono transition-all"
              />
            </div>

            {/* URL Features telemetry reminder */}
            <div className="p-3 rounded-lg bg-[#070B14] border border-[#1F2A44] flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
              <span>SCAN TARGETS:</span>
              <span className="text-slate-300">HTTPS Protocol</span>
              <span className="text-slate-300">Entropy & Obfuscation</span>
              <span className="text-slate-300">TLD Reputation</span>
              <span className="text-slate-300">Punycode Spoofing</span>
              <span className="text-slate-300">Subdomain Depth</span>
            </div>
          </div>
        )}

        {/* TAB 4: SCREENSHOT */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                Upload Suspicious Screenshot (PNG, JPG, WEBP)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Try Sample:
                </span>
                <button 
                  onClick={() => {
                    const blob = new Blob(["demo-bank-kyc"], { type: "image/png" });
                    const file = new File([blob], "sbi_kyc_suspension_alert.png", { type: "image/png" });
                    handleFileSelect(file);
                  }}
                  className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-cyan-300 border border-[#1F2A44] text-[11px]"
                >
                  Bank KYC Screenshot
                </button>
                <button 
                  onClick={() => {
                    const blob = new Blob(["demo-lottery"], { type: "image/png" });
                    const file = new File([blob], "kbc_lottery_prize_whatsapp.png", { type: "image/png" });
                    handleFileSelect(file);
                  }}
                  className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-cyan-300 border border-[#1F2A44] text-[11px]"
                >
                  KBC Prize Winner Screenshot
                </button>
                <button 
                  onClick={() => {
                    const blob = new Blob(["demo-delivery"], { type: "image/png" });
                    const file = new File([blob], "fedex_parcel_redelivery.png", { type: "image/png" });
                    handleFileSelect(file);
                  }}
                  className="px-2 py-0.5 rounded bg-[#131D33] text-slate-300 hover:text-cyan-300 border border-[#1F2A44] text-[11px]"
                >
                  FedEx Delivery Notice
                </button>
              </div>
            </div>

            {/* Dropzone */}
            <div className="relative border-2 border-dashed border-[#1F2A44] hover:border-cyan-500/50 rounded-2xl p-6 text-center transition-all bg-[#070B14]">
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'image'}
                    </p>
                  </div>
                  <p className="text-xs text-cyan-400 font-mono">Click or drag another image to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 rounded-xl bg-[#131D33] border border-[#1F2A44] flex items-center justify-center text-slate-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Drag and drop your screenshot here, or <span className="text-cyan-400 font-semibold underline">browse files</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG, WEBP up to 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Extracted text preview if already processed */}
            {extractedOcrText && (
              <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] space-y-2">
                <span className="text-xs font-semibold text-cyan-400 uppercase font-mono block">
                  OCR Extracted Text Preview
                </span>
                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-[#0D1424] p-3 rounded-lg border border-[#1F2A44]">
                  {extractedOcrText}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Controls & Privacy Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1F2A44]">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
            <input
              type="checkbox"
              checked={saveHistory}
              onChange={(e) => setSaveHistory(e.target.checked)}
              className="rounded bg-[#070B14] border-[#1F2A44] text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span>Store in analysis history (with automatic PII sanitization)</span>
          </label>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleClear}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#1F2A44] hover:bg-[#131D33] text-slate-300 font-medium text-xs transition-colors"
            >
              Clear
            </button>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
            >
              <Shield className="w-4 h-4" />
              {loading ? 'Analyzing...' : `Analyze ${activeTab.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State with Stage Indicators */}
      {loading && <LoadingIndicator inputType={activeTab} />}

      {/* 5. ANALYSIS RESULT & EXPLAINABLE AI */}
      {result && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Detection & Risk Assessment
            </h3>
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1424] hover:bg-[#131D33] border border-[#1F2A44] text-xs font-mono text-cyan-400 hover:border-cyan-500/40 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Generate Incident Report
            </button>
          </div>

          {/* Standardized Risk Gauge */}
          <RiskGauge
            score={result.risk_score}
            level={result.risk_level}
            classification={result.classification}
            confidence={result.confidence}
            category={result.category}
          />

          {/* OCR Extracted Text if from image */}
          {result.extracted_text && (
            <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Screenshot OCR Extracted Text
                </span>
                {result.image_info && (
                  <span className="text-[11px] font-mono text-cyan-400">
                    Engine: {result.image_info.ocr_engine} • Dimensions: {result.image_info.dimensions}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-200 font-mono leading-relaxed bg-[#070B14] p-4 rounded-xl border border-[#1F2A44]">
                {result.extracted_text}
              </p>
            </div>
          )}

          {/* Explainable AI: Why This Was Flagged */}
          <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                Why This Was Flagged (Explainable AI)
              </h4>
              <p className="text-xs text-slate-400">
                Transparent breakdown of forensic indicators, linguistic cues, and infrastructure anomalies detected by ScamShield AI.
              </p>
            </div>

            {/* Forensic Explanation Text */}
            <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] text-xs text-slate-200 leading-relaxed font-sans">
              {result.explanation}
            </div>

            {/* List of Detected Indicator Cards */}
            {result.indicators.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {result.indicators.map((ind, idx) => (
                  <IndicatorCard key={idx} indicator={ind} index={idx} />
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#070B14] border border-[#1F2A44] text-xs text-slate-400 text-center font-mono">
                No high-risk threat indicators matched. Content appears benign.
              </div>
            )}
          </div>

          {/* Extracted URLs if any */}
          {result.extracted_urls && result.extracted_urls.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Extracted URLs Checked ({result.extracted_urls.length})
              </h4>
              <div className="space-y-2">
                {result.extracted_urls.map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#070B14] border border-[#1F2A44] text-xs font-mono">
                    <span className="text-cyan-300 break-all">{u}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0 ml-2">
                      Inspected
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Defensive Actions */}
          <div className="p-6 rounded-2xl bg-[#0D1424] border border-[#1F2A44] space-y-4">
            <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Recommended Safety Playbook
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#070B14] border border-[#1F2A44]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200 leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Advisory Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300/90 font-mono">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{result.advisory_disclaimer}</span>
          </div>
        </div>
      )}

      {/* Incident Report Modal */}
      {showReportModal && result && (
        <ReportModal result={result} onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
};
