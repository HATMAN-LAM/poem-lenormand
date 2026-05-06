'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';

// 诗歌数据
const POEMS = [
  { id: 1, title: "远和近", author: "顾城", content: ["你", "一会看我", "一会看云", "我觉得", "你看我时很远", "你看云时很近"] },
  { id: 2, title: "错愕", author: "洛夫", content: ["井，以无声的独白", "诉说着", "一小片天空的暧昧", "汲水的女子", "眼看着", "一枚簪子跌落跌落水井", "那个急呀", "她弯下身子去捞", "这才发现自己的脸", "原是世上一面破镜"] },
  { id: 3, title: "错误", author: "郑愁予", content: ["我达达的马蹄是美丽的错误", "我不是归人，是个过客"] },
  { id: 4, title: "远航", author: "许立志", content: ["我想在凌晨五点的流水线上睡去", "我想合上双眼，不再担忧熬夜和加班", "此行的终点是大海，我是一条船"] },
  { id: 5, title: "大雁塔", author: "杨炼", content: ["我象一个人那样站立着", "粗壮的肩膀，昂起的头颅", "面对无边无际的金黄色土地"] },
  { id: 6, title: "十四首十四行诗", author: "夏宇", content: ["时间如水银落地"] },
  { id: 7, title: "距离的组织", author: "卞之琳", content: ["友人带来了雪意和五点钟。"] },
  { id: 8, title: "鹿柴", author: "王维", content: ["复照青苔上"] },
  { id: 9, title: "鸽子", author: "胡适", content: ["有一群鸽子", "在空中游戏", "看他们三三两两", "回环来往", "夷犹如意"] },
  { id: 10, title: "相信未来", author: "食指", content: ["朋友，坚定地相信未来吧", "相信不屈不挠的努力", "相信战胜死亡的年轻", "相信未来、热爱生命"] },
  { id: 11, title: "一代人", author: "顾城", content: ["黑夜给了我黑色的眼睛", "我却用它寻找光明"] },
  { id: 12, title: "断章", author: "卞之琳", content: ["明月装饰了你的窗子", "你装饰了别人的梦"] }
];

const POSITIONS = ["【境】", "【变】", "【悟】"];
const POS_DESC = ["当下的心境与处境", "核心变局与转折", "最终的启示与指引"];

export default function PoemLenormand() {
  const [drawnCards, setDrawnCards] = useState([]);
  const [flipped, setFlipped] = useState([false, false, false]);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false); // 新增状态：是否显示对话框
  
  const chatEndRef = useRef(null);

  // 判断是否所有牌都已翻开
  const allFlipped = flipped.every(f => f) && drawnCards.length === 3;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping, showChatbot]);

  const drawCards = () => {
    const shuffled = [...POEMS].sort(() => 0.5 - Math.random());
    setDrawnCards(shuffled.slice(0, 3));
    setFlipped([false, false, false]);
    setChatMessages([]);
    setShowChatbot(false); // 洗牌时隐藏对话框
  };

  const handleFlip = (index) => {
    if (!drawnCards.length) return;
    const newFlipped = [...flipped];
    newFlipped[index] = true;
    setFlipped(newFlipped);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !showChatbot) return;
    
    const userMsg = { role: 'user', content: inputValue };
    setChatMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg.content,
          poems: drawnCards
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: data.reply
        }]);
      } else {
        throw new Error(data.error || "请求失败");
      }
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "抱歉，诗神暂时失去了联系，请检查网络或 API 设置后稍后再试。"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      {/* Header */}
      <motion.div layout className="text-center mb-8 mt-4 z-10">
        <h1 className="text-3xl font-light text-zinc-100 tracking-widest mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-zinc-500" />
          现代诗雷诺曼
          <Sparkles className="w-5 h-5 text-zinc-500" />
        </h1>
        <p className="text-zinc-500 text-sm tracking-widest">以诗为镜，照见悲欢</p>
      </motion.div>

      {/* Action Button */}
      <motion.div layout className="mb-8 z-10">
        {!drawnCards.length ? (
          <button 
            onClick={drawCards}
            className="px-8 py-3 bg-zinc-100 text-zinc-900 rounded-full hover:bg-white transition-colors tracking-widest font-medium shadow-lg shadow-zinc-100/10"
          >
            抽取诗歌牌
          </button>
        ) : (
          <button 
            onClick={drawCards}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" /> 重新洗牌
          </button>
        )}
      </motion.div>

      {/* Main Content Area: Cards + Chat */}
      <div className="w-full max-w-[1600px] mx-auto flex flex-col xl:flex-row items-start justify-center gap-8 xl:gap-16 relative px-2 md:px-6">
        
        {/* Left Section: Cards & Interpret Button */}
        <motion.div 
          layout
          className={`flex flex-col items-center w-full ${showChatbot ? 'xl:w-2/3' : ''}`}
        >
          {/* Cards Row */}
          <motion.div 
            layout
            className={`flex w-full ${
              showChatbot 
                ? 'flex-row flex-wrap justify-center items-start gap-4 xl:gap-8' 
                : 'flex-col md:flex-row justify-center items-center gap-6 lg:gap-10'
            }`}
          >
            <AnimatePresence mode="popLayout">
              {drawnCards.map((poem, index) => (
                <motion.div 
                  layout
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  // 只有当点击解签(showChatbot为true)时，卡片才缩小腾出空间
                  className={`flex flex-col items-center ${showChatbot ? 'w-48 md:w-52 xl:w-60' : 'w-64 lg:w-72'}`}
                >
                  <motion.div layout className="mb-3 text-center h-10">
                    <div className="text-zinc-100 font-medium tracking-widest text-sm">{POSITIONS[index]}</div>
                    {/* 翻开前显示位置说明 */}
                    {!flipped[index] && <div className="text-xs text-zinc-600 mt-1">{POS_DESC[index]}</div>}
                  </motion.div>
                  
                  <div 
                    className="relative w-full aspect-[2/3] cursor-pointer"
                    onClick={() => handleFlip(index)}
                    style={{ perspective: '1000px' }}
                  >
                    <motion.div
                      className="w-full h-full relative"
                      initial={false}
                      animate={{ rotateY: flipped[index] ? 180 : 0 }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Card Back */}
                      <div 
                        className="absolute w-full h-full bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center shadow-2xl"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <div className="w-4/5 h-4/5 border border-zinc-800/50 rounded-lg flex items-center justify-center">
                          <div className="w-12 h-12 border border-zinc-700 rotate-45 flex items-center justify-center">
                            <div className="w-2 h-2 bg-zinc-600 rounded-full"></div>
                          </div>
                        </div>
                      </div>

                      {/* Card Front */}
                      <div 
                        className="absolute w-full h-full bg-zinc-100 text-zinc-900 rounded-xl p-4 xl:p-5 shadow-2xl flex flex-col"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        <div className="text-center mb-4">
                          <h3 className="text-base xl:text-lg font-bold tracking-widest mb-1">{poem.title}</h3>
                          <p className="text-xs text-zinc-500">{poem.author}</p>
                        </div>
                        <div className="flex-grow flex flex-col justify-center items-center gap-2">
                          {poem.content.map((line, i) => (
                            <p key={i} className="text-xs text-center leading-relaxed font-medium text-zinc-800">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* 解签按钮：当三张牌全部翻开，且尚未显示 Chatbot 时出现 */}
          <AnimatePresence>
            {allFlipped && !showChatbot && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ duration: 0.4 }}
                className="mt-12 mb-8"
              >
                <button
                  onClick={() => setShowChatbot(true)}
                  className="group relative px-8 py-3 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-full hover:bg-zinc-700 hover:text-white transition-all duration-300 tracking-widest font-medium shadow-lg flex items-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <MessageSquare className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">开始解签</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right Section: Chatbox */}
        <AnimatePresence>
          {showChatbot && (
            <motion.div 
              initial={{ opacity: 0, x: 50, width: '0%' }}
              animate={{ opacity: 1, x: 0, width: '100%' }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
              className="xl:w-1/3 w-full xl:max-w-lg bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col shadow-2xl backdrop-blur-sm xl:sticky xl:top-8 mt-8 xl:mt-0"
              style={{ height: 'calc(100vh - 12rem)', minHeight: '500px' }}
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-zinc-800/80 flex items-center gap-3 bg-zinc-900/50 rounded-t-2xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium tracking-widest text-zinc-300">解签</span>
              </div>

              {/* Messages Area */}
              <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
                {chatMessages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center space-y-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-2">
                      <Sparkles className="w-6 h-6 text-zinc-500" />
                    </div>
                    <p className="text-zinc-300 font-medium tracking-widest">牌阵已成，静候佳音。</p>
                    <p className="text-zinc-500 text-sm max-w-md leading-relaxed">
                      请在下方输入你心中的疑问。<br/>无论是关于事业的迷茫，还是感情的羁绊，诗歌都会为你照亮前路。
                    </p>
                  </motion.div>
                )}
                
                {chatMessages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[90%] rounded-2xl px-5 py-4 text-sm leading-loose tracking-wide ${
                      msg.role === 'user' 
                        ? 'bg-zinc-200 text-zinc-900 rounded-tr-sm shadow-md' 
                        : 'bg-zinc-800/80 text-zinc-300 rounded-tl-sm shadow-md'
                    }`}>
                      {msg.content.split('\n').map((line, idx) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <div key={idx} className="font-bold text-zinc-100 mt-4 mb-2">{line.replace(/\*\*/g, '')}</div>;
                        }
                        return <span key={idx}>{line}<br/></span>;
                      })}
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-zinc-800/80 rounded-2xl rounded-tl-sm px-5 py-4 flex gap-2 items-center shadow-md">
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-zinc-900/80 border-t border-zinc-800/80 rounded-b-2xl">
                <div className="relative flex items-center">
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                        handleSendMessage();
                      }
                    }}
                    placeholder="在此输入你的问题..."
                    className="flex-grow bg-zinc-950 border border-zinc-700 rounded-xl pl-5 pr-14 py-3 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 transition-colors shadow-inner"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="absolute right-2 bg-zinc-200 text-zinc-900 p-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}