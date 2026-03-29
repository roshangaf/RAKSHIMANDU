"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User, Bot, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export default function SupportChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! Welcome to RAKSHIMANDU Support. How can we help you tonight?", sender: "bot", time: "11:55 PM" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, sender: "user", time: "11:58 PM" };
    setMessages([...messages, userMsg]);
    setInput("");
    
    // Auto-reply simulation
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "I've notified one of our night couriers to check on your request. Someone will be with you in a moment.", 
        sender: "bot", 
        time: "11:59 PM" 
      }]);
    }, 1500);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col max-w-4xl">
        <header className="mb-6">
          <h1 className="text-4xl font-headline flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-accent" />
            NIGHT SUPPORT
          </h1>
          <p className="text-muted-foreground">Always awake. Always here to help.</p>
        </header>

        <Card className="flex-1 flex flex-col bg-card border-white/5 overflow-hidden min-h-[500px]">
          <CardHeader className="bg-secondary/30 p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <Bot className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div>
                <p className="font-bold text-sm">NOSH ASSISTANT</p>
                <p className="text-[10px] text-green-400 font-bold tracking-widest uppercase">Online & Active</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.sender === 'user' 
                  ? 'bg-accent text-accent-foreground rounded-tr-none' 
                  : 'bg-secondary rounded-tl-none'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-1 opacity-60 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>

          <CardFooter className="p-4 bg-secondary/10 border-t">
            <div className="flex w-full gap-2">
              <Input 
                placeholder="Type your message..." 
                className="bg-card border-white/5 h-12"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button size="icon" className="h-12 w-12 bg-accent hover:bg-accent/80" onClick={handleSend}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
