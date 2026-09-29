import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { api } from '../../services/api';
import { 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  AlertCircle,
  Package, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Trash2,
  TrendingUp,
  History,
  ShieldCheck,
  X,
  Loader2,
  ArrowRight,
  Check,
  Languages,
  Globe,
  ImageIcon,
  Camera,
  Plus
} from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { id: 'en-IN', name: 'English', nativeName: 'English (India)', code: 'en-IN', greeting: 'Hello! I am your AI Inventory Assistant. Speak or type to manage your inventory.', prompt: 'e.g. "Add 20 Amul milk", "Delete Maggi", "Set Amul milk price to 35"...' },
  { id: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', code: 'hi-IN', greeting: 'नमस्ते! मैं आपका AI इन्वेंट्री सहायक हूँ। आप बोलकर या लिखकर स्टॉक अपडेट कर सकते हैं।', prompt: 'जैसे "20 अमूल दूध जोड़ो", "मैगी हटाओ", "कम स्टॉक वाले सामान दिखाओ"...' },
  { id: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish', code: 'en-IN', greeting: 'Namaste! Main aapka AI Inventory Assistant hoon. Bolkar ya type karke stock update karein.', prompt: 'Jaise "Add 20 Amul milk", "Delete Maggi", "Low stock items dikhao"...' }
];

export default function ShopkeeperVoiceAssistant({ isOpen, onClose }) {
  const { 
    selectedStore, 
    loadStoreData, 
    showNotification,
    isVoiceAssistantOpen,
    setIsVoiceAssistantOpen
  } = useStore();

  const activeIsOpen = isOpen !== undefined ? isOpen : isVoiceAssistantOpen;
  const handleClose = onClose || (() => setIsVoiceAssistantOpen(false));

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'audit'
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('nexretail_assistant_lang') || 'en-IN';
  });
  const [isSelectingLanguage, setIsSelectingLanguage] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [searchQueryInputs, setSearchQueryInputs] = useState({});
  const [showSearchInputs, setShowSearchInputs] = useState({});

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  // Initialize greeting on first load or language change
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `${activeLangObj.greeting}\n\nManaging inventory for **${selectedStore?.name || 'Your Store'}**.\n\nYou can say:\n• "Add 20 Amul milk"\n• "Remove 5 Amul milk"\n• "Delete Maggi from my inventory"\n• "Set Amul Milk price to ₹35"\n• "What products are low in stock?"\n• "Inventory summary"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [selectedLanguage, selectedStore]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  // Load audit logs when switching to audit tab
  useEffect(() => {
    if (activeTab === 'audit' && activeIsOpen) {
      loadAuditLogs();
    }
  }, [activeTab, activeIsOpen]);

  const loadAuditLogs = async () => {
    setLoadingAuditLogs(true);
    try {
      const logs = await api.getAiAuditLogs([]);
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error('Failed to load AI audit logs:', err);
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  // Web Speech API Initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && selectedLanguage) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = activeLangObj.code;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setIsListening(false);
        if (spokenText && spokenText.trim()) {
          handleSendCommand(spokenText.trim());
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLanguage, activeLangObj.code]);

  const speakText = (text) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Remove markdown asterisks and bullet symbols for clean speech
      const cleanSpeech = text
        .replace(/[*#_•`]/g, '')
        .replace(/₹/g, 'rupees ')
        .trim();
      const utterance = new SpeechSynthesisUtterance(cleanSpeech);
      utterance.rate = 1.0;
      utterance.lang = activeLangObj.code;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          setIsListening(false);
        }
      } else {
        showNotification('Voice recognition not supported in this browser. Please type your command.', 'info');
      }
    }
  };

  /**
   * Send Natural Language Command to Backend API
   */
  const handleSendCommand = async (commandText) => {
    if (!commandText || !commandText.trim() || isLoading) return;

    const trimmed = commandText.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.sendAiCommand(trimmed);

      const candidateResults = response.candidateImageResults || (response.pendingAction ? response.pendingAction.candidateImageResults : null) || [];
      const reliableFound = response.reliableImagesFound !== undefined ? response.reliableImagesFound : (candidateResults.length > 0);

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        type: response.type || 'MESSAGE',
        intent: response.intent,
        text: response.reply,
        productName: response.productName || (response.pendingAction ? response.pendingAction.productName : null),
        pendingAction: response.pendingAction || null,
        candidates: response.candidates || null,
        candidateImages: response.candidateImages || (response.pendingAction ? response.pendingAction.candidateImages : null),
        candidateImageResults: candidateResults,
        reliableImagesFound: reliableFound,
        selectedImageUrl: response.selectedImageUrl || (response.pendingAction ? response.pendingAction.imageUrl : null),
        selectedImageSourceUrl: response.pendingAction ? response.pendingAction.imageSourceUrl : null,
        selectedImageSourceName: response.pendingAction ? response.pendingAction.imageSourceName : null,
        items: response.items || null,
        summary: response.summary || null,
        isDestructive: response.isDestructive || false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMsg]);
      speakText(response.reply);
    } catch (error) {
      console.error('AI assistant error:', error);
      const errMsg = error.message || 'I could not process that request. Please try again.';
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          type: 'ERROR',
          text: `⚠️ Error: ${errMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      speakText(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle user selecting a photo option from internet photo candidates
   */
  const handleSelectProductPhoto = (msgId, photoItem) => {
    const photoUrl = typeof photoItem === 'string' ? photoItem : photoItem?.imageUrl;
    const sourceUrl = typeof photoItem === 'object' ? photoItem?.sourceUrl : null;
    const sourceName = typeof photoItem === 'object' ? photoItem?.sourceName : null;

    setChatMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          selectedImageUrl: photoUrl,
          selectedImageSourceUrl: sourceUrl,
          selectedImageSourceName: sourceName,
          pendingAction: m.pendingAction ? {
            ...m.pendingAction,
            imageUrl: photoUrl,
            imageSourceUrl: sourceUrl,
            imageSourceName: sourceName
          } : null
        };
      }
      return m;
    }));
  };

  /**
   * Refine or search again for product photos from web with custom query
   */
  const handleRefinePhotoSearch = async (msgId, query) => {
    if (!query || !query.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.searchProductImages(query.trim());
      const results = res.candidateImageResults || res.results || [];
      const imageUrls = res.images || results.map(r => r.imageUrl);
      const reliable = res.reliableImagesFound !== undefined ? res.reliableImagesFound : (results.length > 0);

      setChatMessages(prev => prev.map(m => {
        if (m.id === msgId) {
          const firstImg = results.length > 0 ? results[0] : null;
          return {
            ...m,
            candidateImages: imageUrls,
            candidateImageResults: results,
            reliableImagesFound: reliable,
            selectedImageUrl: firstImg ? firstImg.imageUrl : (imageUrls[0] || null),
            selectedImageSourceUrl: firstImg ? firstImg.sourceUrl : null,
            selectedImageSourceName: firstImg ? firstImg.sourceName : null,
            pendingAction: m.pendingAction ? {
              ...m.pendingAction,
              candidateImages: imageUrls,
              candidateImageResults: results,
              imageUrl: firstImg ? firstImg.imageUrl : (imageUrls[0] || null),
              imageSourceUrl: firstImg ? firstImg.sourceUrl : null,
              imageSourceName: firstImg ? firstImg.sourceName : null
            } : null
          };
        }
        return m;
      }));
      setShowSearchInputs(prev => ({ ...prev, [msgId]: false }));
      if (showNotification) {
        showNotification(results.length > 0 ? `Found ${results.length} photos for "${query}"` : `No photos found for "${query}"`, results.length > 0 ? 'success' : 'info');
      }
    } catch (e) {
      console.error('Failed to search photos:', e);
      if (showNotification) showNotification('Failed to search photos: ' + e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Upload user's custom photo file
   */
  const handleUploadCustomPhoto = async (msgId, file) => {
    if (!file || !selectedStore?.id) return;
    setIsLoading(true);
    try {
      const res = await api.uploadProductImage(selectedStore.id, file);
      if (res && res.imageUrl) {
        handleSelectProductPhoto(msgId, {
          imageUrl: res.imageUrl,
          sourceUrl: 'Local Upload',
          sourceName: 'Your Device'
        });
        if (showNotification) showNotification('Custom photo uploaded successfully', 'success');
      }
    } catch (e) {
      console.error('Failed to upload custom photo:', e);
      if (showNotification) showNotification('Failed to upload photo: ' + (e.message || 'Error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Continue without photo
   */
  const handleContinueWithoutPhoto = (msgId) => {
    setChatMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          selectedImageUrl: null,
          selectedImageSourceUrl: null,
          selectedImageSourceName: null,
          pendingAction: m.pendingAction ? {
            ...m.pendingAction,
            imageUrl: null,
            imageSourceUrl: null,
            imageSourceName: null
          } : null
        };
      }
      return m;
    }));
    if (showNotification) showNotification('Proceeding without photo', 'info');
  };

  /**
   * Handle updating editable fields on pending action (e.g. price, stock)
   */
  const handleUpdatePendingField = (msgId, field, value) => {
    setChatMessages(prev => prev.map(m => {
      if (m.id === msgId && m.pendingAction) {
        return {
          ...m,
          pendingAction: {
            ...m.pendingAction,
            [field]: value
          }
        };
      }
      return m;
    }));
  };

  /**
   * Confirm or Cancel a Pending Mutation Action
   */
  const handleConfirmAction = async (msgId, pendingAction, confirmed) => {
    if (!pendingAction || isLoading) return;

    setIsLoading(true);

    try {
      if (!confirmed) {
        // Cancel action
        setChatMessages(prev => prev.map(m => {
          if (m.id === msgId) {
            return {
              ...m,
              actionStatus: 'CANCELLED',
              text: `${m.text}\n\n❌ Action cancelled by shopkeeper.`
            };
          }
          return m;
        }));
        speakText('Action cancelled.');
        setIsLoading(false);
        return;
      }

      // Execute confirmed action via backend API
      const result = await api.confirmAiAction(pendingAction, true);

      // Mark message as completed in UI
      setChatMessages(prev => prev.map(m => {
        if (m.id === msgId) {
          return {
            ...m,
            actionStatus: 'CONFIRMED',
            resultMessage: result.message,
            updatedProduct: result.updatedProduct
          };
        }
        return m;
      }));

      // Add success confirmation message
      const successMsg = {
        id: Date.now(),
        sender: 'ai',
        type: 'SUCCESS',
        text: result.message || '✓ Action successfully executed and inventory updated.',
        updatedProduct: result.updatedProduct,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, successMsg]);

      // Speak confirmation
      speakText(result.message || 'Action executed successfully.');

      // Refresh store products and sales in frontend StoreContext so tables update in real time!
      if (selectedStore?.id) {
        await loadStoreData(selectedStore.id);
      }
      showNotification('Inventory successfully updated via AI Assistant', 'success');

    } catch (error) {
      console.error('Confirmation error:', error);
      const errMsg = error.message || 'Failed to update inventory. Please try again.';
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'ai',
          type: 'ERROR',
          text: `⚠️ Execution failed: ${errMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      speakText(errMsg);
      showNotification(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle candidate selection during disambiguation
   */
  const handleSelectCandidate = (candidate, parentMsg) => {
    if (!candidate || !candidate.name) return;

    if (parentMsg.intent === 'ADD_STOCK' && parentMsg.pendingAction) {
      const updatedPending = {
        ...parentMsg.pendingAction,
        storeProductId: candidate.id,
        productName: candidate.name,
        currentStock: candidate.currentStock,
        projectedStock: candidate.currentStock + (parentMsg.pendingAction.quantity || 1)
      };
      // Send a command specifying the exact candidate
      handleSendCommand(`Add ${parentMsg.pendingAction.quantity || 1} ${candidate.name}`);
    } else if (parentMsg.intent === 'DELETE_PRODUCT') {
      handleSendCommand(`Delete ${candidate.name} from my inventory`);
    } else if (parentMsg.intent === 'UPDATE_PRICE') {
      handleSendCommand(`Set ${candidate.name} price`);
    } else {
      handleSendCommand(`What is the stock of ${candidate.name}?`);
    }
  };

  if (!activeIsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-end p-0 sm:p-4">
      {/* Drawer Container (Slide-over on desktop/tablet, full screen on mobile) */}
      <div className="bg-white w-full sm:max-w-xl sm:rounded-3xl h-full sm:h-[90vh] sm:max-h-[760px] shadow-2xl flex flex-col border-0 sm:border border-slate-200 overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white">Vyapar AI &bull; Inventory Assistant</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live DB</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate max-w-[240px] sm:max-w-xs">
                Store: <strong>{selectedStore?.name || 'Gupta Kirana'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Language Switcher */}
            <button
              onClick={() => setIsSelectingLanguage(!isSelectingLanguage)}
              className="bg-slate-800/90 hover:bg-slate-700 text-slate-200 px-2 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-1 transition"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeLangObj.name}</span>
            </button>

            {/* Voice Mute / Unmute */}
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition"
              title={speechEnabled ? "Mute Voice Response" : "Enable Voice Response"}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition"
              title="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Chat vs Audit Log */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 py-2 shrink-0">
          <button
            onClick={() => { setActiveTab('chat'); setIsSelectingLanguage(false); }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'chat' && !isSelectingLanguage
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-emerald-600" />
            <span>Assistant Chat</span>
          </button>
          <button
            onClick={() => { setActiveTab('audit'); setIsSelectingLanguage(false); }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'audit' && !isSelectingLanguage
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span>Activity Audit Log</span>
          </button>
        </div>

        {/* Language Picker Screen */}
        {isSelectingLanguage ? (
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Select Assistant Language</h4>
              <p className="text-xs text-slate-500">The assistant will transcribe and respond in this language.</p>
            </div>
            <div className="space-y-2 max-w-sm mx-auto pt-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isCurrent = lang.id === selectedLanguage;
                return (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setSelectedLanguage(lang.id);
                      localStorage.setItem('nexretail_assistant_lang', lang.id);
                      setIsSelectingLanguage(false);
                      showNotification(`Language set to ${lang.name}`, 'success');
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                      isCurrent
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{lang.name}</div>
                      <div className="text-[11px] text-slate-500">{lang.nativeName}</div>
                    </div>
                    {isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'audit' ? (
          /* Audit Log View */
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>AI Inventory Mutation Audit Log</span>
                </h4>
                <p className="text-[10px] text-slate-500">Every inventory mutation is recorded permanently in the database.</p>
              </div>
              <button
                onClick={loadAuditLogs}
                disabled={loadingAuditLogs}
                className="text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center space-x-1 font-semibold"
              >
                <RotateCcw className={`w-3 h-3 ${loadingAuditLogs ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingAuditLogs ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs">Loading audit trail...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No AI actions recorded yet. Perform an action like "Add 20 Amul milk" to see logs here.
              </div>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="bg-white border border-slate-200 p-3 rounded-2xl shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${log.result === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span>{log.action}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <strong>Command:</strong> <em>"{log.command}"</em>
                    </div>
                    <div className="text-[11px] text-slate-800 bg-slate-50 rounded-lg p-1.5 font-medium border border-slate-100">
                      {log.details}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>User: {log.userName}</span>
                      <span className={`font-bold ${log.result === 'SUCCESS' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {log.result}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Assistant Chat View */
          <>
            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/60">
              {chatMessages.map(msg => {
                const isAi = msg.sender === 'ai';

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAi && (
                      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[88%] rounded-2xl p-3.5 text-xs shadow-2xs space-y-2.5 ${
                      isAi 
                        ? 'bg-white text-slate-800 border border-slate-200' 
                        : 'bg-emerald-700 text-white'
                    }`}>
                      {/* Main Message Text */}
                      <p className="leading-relaxed whitespace-pre-line font-medium text-xs">
                        {msg.text}
                      </p>

                      {/* 1. Confirmation Required Card */}
                      {msg.type === 'CONFIRMATION_REQUIRED' && msg.pendingAction && !msg.actionStatus && (
                        <div className={`border rounded-2xl p-3 space-y-2.5 mt-2 ${
                          msg.isDestructive 
                            ? 'bg-rose-50 border-rose-300' 
                            : 'bg-emerald-50/70 border-emerald-300'
                        }`}>
                          {/* Alert Header */}
                          <div className="flex items-center space-x-1.5">
                            {msg.isDestructive ? (
                              <>
                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span className="font-bold text-rose-900 text-xs uppercase tracking-wide">
                                  Confirm Deletion
                                </span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="font-bold text-emerald-900 text-xs uppercase tracking-wide">
                                  Action Required
                                </span>
                              </>
                            )}
                          </div>

                          {/* Action Details Grid */}
                          <div className="bg-white/90 rounded-xl p-2.5 text-[11px] text-slate-700 space-y-1 border border-slate-200">
                            <div className="font-bold text-slate-900 text-xs">
                              {msg.pendingAction.productName || 'Product'}
                            </div>

                            {msg.pendingAction.action === 'ADD_STOCK' && (
                              <div className="flex justify-between items-center pt-1">
                                <span className="text-slate-500">Stock Change:</span>
                                <span className="font-mono font-bold text-emerald-700">
                                  {msg.pendingAction.currentStock} → <span className="text-emerald-900 text-xs font-extrabold">{msg.pendingAction.projectedStock}</span> (+{msg.pendingAction.delta})
                                </span>
                              </div>
                            )}

                            {msg.pendingAction.action === 'REDUCE_STOCK' && (
                              <div className="flex justify-between items-center pt-1">
                                <span className="text-slate-500">Stock Change:</span>
                                <span className="font-mono font-bold text-amber-700">
                                  {msg.pendingAction.currentStock} → <span className="text-amber-900 text-xs font-extrabold">{msg.pendingAction.projectedStock}</span> ({msg.pendingAction.delta})
                                </span>
                              </div>
                            )}

                            {msg.pendingAction.action === 'RECORD_SALE' && (
                              <div className="flex justify-between items-center pt-1">
                                <span className="text-slate-500">Record Sale of:</span>
                                <span className="font-mono font-bold text-indigo-700">
                                  {msg.pendingAction.quantity} units (Total: ₹{msg.pendingAction.totalAmount})
                                </span>
                              </div>
                            )}

                            {msg.pendingAction.action === 'UPDATE_PRICE' && (
                              <div className="flex justify-between items-center pt-1">
                                <span className="text-slate-500">Price Update:</span>
                                <span className="font-mono font-bold text-slate-900">
                                  ₹{msg.pendingAction.oldPrice} → <span className="text-emerald-700 font-extrabold text-xs">₹{msg.pendingAction.newPrice}</span>
                                </span>
                              </div>
                            )}

                            {msg.pendingAction.action === 'DELETE_PRODUCT' && (
                              <div className="text-rose-700 text-[11px] font-medium pt-0.5">
                                Current stock: <strong>{msg.pendingAction.currentStock} units</strong>. This product will be deactivated from this store.
                              </div>
                            )}

                            {msg.pendingAction.action === 'CREATE_PRODUCT' && (
                              <div className="space-y-2 pt-1 text-slate-700">
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-400 block text-[10px]">Category:</span>
                                    <span className="font-semibold text-slate-800">{msg.pendingAction.category || 'General'}</span>
                                  </div>
                                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                    <span className="text-slate-400 block text-[10px]">Package Size:</span>
                                    <span className="font-semibold text-slate-800">{msg.pendingAction.packageQuantity} {msg.pendingAction.unit}</span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-1">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                      Unit Price (₹)
                                    </label>
                                    <div className="relative">
                                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">₹</span>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={msg.pendingAction.price ?? 60}
                                        onChange={(e) => handleUpdatePendingField(msg.id, 'price', parseFloat(e.target.value) || 0)}
                                        className="w-full pl-6 pr-2 py-1 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                                      Initial Stock
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={msg.pendingAction.stockQuantity ?? 20}
                                      onChange={(e) => handleUpdatePendingField(msg.id, 'stockQuantity', parseInt(e.target.value, 10) || 0)}
                                      className="w-full px-2.5 py-1 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Photo Chooser Gallery for CREATE_PRODUCT and UPDATE_PHOTO */}
                            {(msg.pendingAction.action === 'CREATE_PRODUCT' || msg.pendingAction.action === 'UPDATE_PHOTO') && (
                              <div className="space-y-2 pt-2 border-t border-slate-200">
                                <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                                  <span className="flex items-center space-x-1.5 text-emerald-800">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Real Packshot Photos (Web):</span>
                                  </span>
                                  {msg.candidateImageResults && msg.candidateImageResults.length > 0 && (
                                    <span className="text-[10px] text-slate-500 font-medium">
                                      {msg.candidateImageResults.length} verified results
                                    </span>
                                  )}
                                </div>

                                {/* Case A: Candidate Images Available */}
                                {((msg.candidateImageResults && msg.candidateImageResults.length > 0) || (msg.candidateImages && msg.candidateImages.length > 0)) && (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                                    {(msg.candidateImageResults && msg.candidateImageResults.length > 0
                                      ? msg.candidateImageResults
                                      : (msg.candidateImages || []).map(url => ({ imageUrl: url, title: msg.pendingAction.productName, sourceName: 'web' }))
                                    ).map((item, imgIdx) => {
                                      const imgUrl = item.imageUrl;
                                      const isSelected = (msg.pendingAction.imageUrl || msg.selectedImageUrl) === imgUrl;
                                      return (
                                        <button
                                          key={imgIdx}
                                          type="button"
                                          onClick={() => handleSelectProductPhoto(msg.id, item)}
                                          className={`relative rounded-xl overflow-hidden border-2 transition-all p-1.5 text-left flex flex-col justify-between group cursor-pointer ${
                                            isSelected
                                              ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-md bg-emerald-50/40'
                                              : 'border-slate-200 hover:border-emerald-400 bg-white hover:shadow-xs'
                                          }`}
                                        >
                                          {/* Image Preview */}
                                          <div className="w-full aspect-square rounded-lg overflow-hidden bg-white border border-slate-100 flex items-center justify-center p-1 relative">
                                            <img
                                              src={item.thumbnailUrl || imgUrl}
                                              alt={item.title || `Option ${imgIdx + 1}`}
                                              className="w-full h-full object-contain"
                                              loading="lazy"
                                              onError={(e) => {
                                                if (item.thumbnailUrl && e.target.src !== imgUrl) {
                                                  e.target.src = imgUrl;
                                                }
                                              }}
                                            />
                                            {isSelected && (
                                              <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-1 shadow-sm">
                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                              </div>
                                            )}
                                            {item.relevanceScore > 0 && (
                                              <div className="absolute bottom-1 left-1 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                                {item.relevanceScore}% Match
                                              </div>
                                            )}
                                          </div>

                                          {/* Title & Source Domain Badge */}
                                          <div className="pt-1.5 px-0.5 space-y-0.5">
                                            <div className="text-[11px] font-semibold text-slate-800 line-clamp-1 group-hover:text-emerald-700" title={item.title}>
                                              {item.title || `Option ${imgIdx + 1}`}
                                            </div>
                                            <div className="flex items-center space-x-1 text-[9px] text-slate-500 font-medium">
                                              <Globe className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                              <span className="truncate">{item.sourceName || 'web'}</span>
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Case B: Explicit Fallback Card when no reliable images are found */}
                                {(!msg.candidateImageResults || msg.candidateImageResults.length === 0) && (!msg.candidateImages || msg.candidateImages.length === 0) && (
                                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2.5">
                                    <div className="flex items-start space-x-2 text-amber-900">
                                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                      <div className="text-xs">
                                        <p className="font-bold">No reliable internet photo found</p>
                                        <p className="text-[11px] text-amber-800 mt-0.5">
                                          Could not find a verified match for "{msg.pendingAction.productName}". You can:
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => setShowSearchInputs(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                        className="text-[11px] font-semibold px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 rounded-lg transition"
                                      >
                                        🔍 Search Again
                                      </button>
                                      <label className="text-[11px] font-semibold px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 rounded-lg transition cursor-pointer flex items-center space-x-1">
                                        <Camera className="w-3 h-3 text-amber-700" />
                                        <span>Upload Photo</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                              handleUploadCustomPhoto(msg.id, e.target.files[0]);
                                            }
                                          }}
                                        />
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => handleContinueWithoutPhoto(msg.id)}
                                        className="text-[11px] font-semibold px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition"
                                      >
                                        Continue Without Photo
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Search Again Inline Input */}
                                {showSearchInputs[msg.id] && (
                                  <div className="flex items-center space-x-1.5 pt-1">
                                    <input
                                      type="text"
                                      placeholder="Refine search (e.g. Amul Butter 100g pack)..."
                                      value={searchQueryInputs[msg.id] || ''}
                                      onChange={(e) => setSearchQueryInputs(prev => ({ ...prev, [msg.id]: e.target.value }))}
                                      className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 bg-white"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleRefinePhotoSearch(msg.id, searchQueryInputs[msg.id] || msg.pendingAction.productName);
                                        }
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRefinePhotoSearch(msg.id, searchQueryInputs[msg.id] || msg.pendingAction.productName)}
                                      className="px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
                                    >
                                      Search
                                    </button>
                                  </div>
                                )}

                                {/* Selection Status bar */}
                                <div className="flex items-center justify-between pt-1 text-[11px]">
                                  {msg.pendingAction.imageUrl ? (
                                    <div className="text-emerald-700 flex items-center space-x-1 font-medium">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Photo selected for product</span>
                                      <button
                                        type="button"
                                        onClick={() => handleContinueWithoutPhoto(msg.id)}
                                        className="text-slate-400 hover:text-slate-600 underline ml-2 cursor-pointer text-[10px]"
                                      >
                                        (Remove photo)
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-slate-500 italic">No photo attached (will use default placeholder)</div>
                                  )}
                                  <label className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer flex items-center space-x-1 text-[11px]">
                                    <Camera className="w-3 h-3" />
                                    <span>Upload Own</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                          handleUploadCustomPhoto(msg.id, e.target.files[0]);
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Confirmation Buttons */}
                          <div className="flex items-center space-x-2 pt-1">
                            <button
                              onClick={() => handleConfirmAction(msg.id, msg.pendingAction, true)}
                              disabled={isLoading}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white transition shadow-xs flex items-center justify-center space-x-1.5 ${
                                msg.isDestructive
                                  ? 'bg-rose-600 hover:bg-rose-700'
                                  : 'bg-emerald-600 hover:bg-emerald-700'
                              }`}
                            >
                              {isLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {msg.isDestructive 
                                  ? 'Confirm Delete' 
                                  : msg.pendingAction?.action === 'CREATE_PRODUCT'
                                    ? 'Confirm & Add Product'
                                    : 'Confirm Update'}
                              </span>
                            </button>

                            <button
                              onClick={() => handleConfirmAction(msg.id, msg.pendingAction, false)}
                              disabled={isLoading}
                              className="py-2 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. Action Executed Badge */}
                      {msg.actionStatus === 'CONFIRMED' && (
                        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 text-xs text-emerald-900 flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold">
                            {msg.resultMessage || 'Action confirmed & database updated.'}
                          </span>
                        </div>
                      )}

                      {/* 3. Action Cancelled Badge */}
                      {msg.actionStatus === 'CANCELLED' && (
                        <div className="bg-slate-100 border border-slate-200 rounded-xl p-2 text-xs text-slate-500 italic">
                          Action was cancelled.
                        </div>
                      )}

                      {/* 4. Disambiguation Candidates Card */}
                      {msg.type === 'AMBIGUOUS' && msg.candidates && (
                        <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-3 space-y-2 mt-2">
                          <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide flex items-center space-x-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Select matching product:</span>
                          </div>
                          <div className="space-y-1.5">
                            {msg.candidates.map((cand) => (
                              <button
                                key={cand.id}
                                onClick={() => handleSelectCandidate(cand, msg)}
                                className="w-full text-left bg-white hover:bg-amber-100/70 border border-amber-200 rounded-xl p-2 text-xs transition flex items-center justify-between group shadow-2xs"
                              >
                                <div>
                                  <div className="font-bold text-slate-900 group-hover:text-amber-900">{cand.name}</div>
                                  <div className="text-[10px] text-slate-500">
                                    Current Stock: <strong className="text-slate-700">{cand.currentStock}</strong> | Price: ₹{cand.price}
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-amber-600 opacity-60 group-hover:opacity-100 shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4b. Generic Staple Disambiguation Card (e.g. "Butter", "Milk") */}
                      {msg.type === 'DISAMBIGUATE_PRODUCT' && msg.candidates && (
                        <div className="bg-emerald-50/70 border border-emerald-300 rounded-2xl p-3 space-y-2 mt-2">
                          <div className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide flex items-center space-x-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Select Brand Variant to Add:</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {msg.candidates.map((cand, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSendCommand(`Add ${cand.name} ${cand.package || '100g'}`)}
                                className="text-left bg-white hover:bg-emerald-100/70 border border-emerald-200 rounded-xl p-2.5 text-xs transition flex items-center justify-between group shadow-2xs cursor-pointer"
                              >
                                <div>
                                  <div className="font-bold text-slate-900 group-hover:text-emerald-900">{cand.name}</div>
                                  <div className="text-[10px] text-slate-500">
                                    Pack: <strong className="text-slate-700">{cand.package || 'Standard'}</strong> • {cand.category || 'Grocery'}
                                  </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4c. Product Already in Inventory Card */}
                      {msg.type === 'ALREADY_EXISTS' && (
                        <div className="bg-sky-50/70 border border-sky-300 rounded-2xl p-3 space-y-2 mt-2">
                          <div className="text-[11px] font-bold text-sky-900 uppercase tracking-wide flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                            <span>Already In Your Inventory</span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            Quick actions for this existing product:
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <button
                              onClick={() => {
                                const name = msg.productName || (msg.text ? msg.text.match(/"([^"]+)"/)?.[1] : '');
                                if (name) handleSendCommand(`Add 10 ${name}`);
                              }}
                              className="bg-white hover:bg-sky-100 border border-sky-300 text-sky-800 text-[11px] font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3 text-sky-600" />
                              <span>+10 Stock</span>
                            </button>
                            <button
                              onClick={() => {
                                const name = msg.productName || (msg.text ? msg.text.match(/"([^"]+)"/)?.[1] : '');
                                if (name) handleSendCommand(`Add 25 ${name}`);
                              }}
                              className="bg-white hover:bg-sky-100 border border-sky-300 text-sky-800 text-[11px] font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3 text-sky-600" />
                              <span>+25 Stock</span>
                            </button>
                            <button
                              onClick={() => {
                                const name = msg.productName || (msg.text ? msg.text.match(/"([^"]+)"/)?.[1] : '');
                                if (name) handleSendCommand(`What is the stock of ${name}?`);
                              }}
                              className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer"
                            >
                              Check Stock
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 5. Item List Cards (e.g. low stock products) */}
                      {msg.items && msg.items.length > 0 && (
                        <div className="space-y-1 pt-1">
                          {msg.items.map((item, idx) => (
                            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-[11px] flex items-center justify-between">
                              <span className="font-semibold text-slate-800 truncate max-w-[190px]">{item.name}</span>
                              <div className="flex items-center space-x-2 shrink-0">
                                <span className="font-mono text-rose-700 font-bold">{item.stock ?? 0} left</span>
                                <button
                                  onClick={() => handleSendCommand(`Add 20 ${item.name}`)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold transition"
                                >
                                  +20
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Standalone Image Search Results Gallery */}
                      {msg.intent === 'SEARCH_IMAGES' && msg.candidateImages && msg.candidateImages.length > 0 && (
                        <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                          <div className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Web Photos Found:</span>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {msg.candidateImages.map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="rounded-xl overflow-hidden aspect-square border border-slate-200 shadow-2xs group relative">
                                <img
                                  src={imgUrl}
                                  alt={`Product photo ${imgIdx + 1}`}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className={`text-[10px] text-right ${isAi ? 'text-slate-400' : 'text-emerald-200'}`}>
                        {msg.timestamp}
                      </div>
                    </div>

                    {!isAi && (
                      <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center space-x-2 text-slate-500 text-xs py-2 px-1">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs shadow-2xs flex items-center space-x-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span className="text-slate-600 font-medium">Processing your request...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto text-[11px] scrollbar-none shrink-0">
              <span className="text-slate-400 shrink-0 text-[10px] font-semibold">Quick test:</span>
              <button
                onClick={() => handleSendCommand('Add Amul Butter 100 grams for ₹60 with 25 units')}
                className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-lg shrink-0 font-medium transition flex items-center space-x-1"
                title="Add product and choose photo from web"
              >
                <span>✨ Add Butter (AI Photo)</span>
              </button>
              <button
                onClick={() => handleSendCommand('Find photos for Amul Butter')}
                className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-1 rounded-lg shrink-0 font-medium transition flex items-center space-x-1"
              >
                <span>📷 Photos for Butter</span>
              </button>
              <button
                onClick={() => handleSendCommand('Add 20 Amul milk')}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0 font-medium transition"
              >
                +20 Amul milk
              </button>
              <button
                onClick={() => handleSendCommand('Delete Maggi from my inventory')}
                className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg shrink-0 font-medium transition"
              >
                Delete Maggi
              </button>
              <button
                onClick={() => handleSendCommand('What products are low in stock?')}
                className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg shrink-0 font-medium transition"
              >
                Low Stock
              </button>
              <button
                onClick={() => handleSendCommand('Set Amul Milk price to 35')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg shrink-0 transition"
              >
                Price to ₹35
              </button>
              <button
                onClick={() => handleSendCommand('Inventory summary')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg shrink-0 transition"
              >
                Summary
              </button>
            </div>

            {/* Bottom Input & Voice Trigger Bar */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCommand(inputText);
                }}
                className="flex items-center space-x-2"
              >
                {/* Voice Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-2xl transition shadow-sm flex items-center justify-center ${
                    isListening 
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  title={isListening ? `Listening... Speak now!` : `Speak command (${activeLangObj.name})`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isListening ? "Listening... Speak now!" : activeLangObj.prompt}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 transition"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="p-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-2xl transition shadow-xs flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
