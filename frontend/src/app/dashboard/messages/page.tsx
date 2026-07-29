"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getReceivedRequests, getSentRequests } from "@/api/requests";
import { getConversation, uploadMessageFile, markMessagesAsRead } from "@/api/messages";
import { useSocket } from "@/hooks/useSocket";
import { Send, User as UserIcon, Paperclip, X } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  profilePicture?: string;
};

type Message = {
  _id?: string;
  senderId: string;
  receiverId: string;
  content?: string;
  fileUrl?: string;
  fileType?: string;
  createdAt?: string;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContacts();
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      fetchConversation(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (message: Message) => {
      // Only append if it belongs to the current conversation
      if (
        selectedContact &&
        (message.senderId === selectedContact.id || message.receiverId === selectedContact.id)
      ) {
        setMessages((prev) => [...prev, message]);
        // If WE received this message (not sent by us), mark it as read immediately
        // and tell the navbar to refresh so the badge doesn't increment
        if (message.senderId === selectedContact.id) {
          markMessagesAsRead(selectedContact.id).catch(() => {});
          window.dispatchEvent(new CustomEvent("skillswap:refresh-counts"));
        }
      } else {
        // Message is for a different contact — just refresh navbar count
        window.dispatchEvent(new CustomEvent("skillswap:refresh-counts"));
      }
    });

    socket.on("online_users", (users: string[]) => {
      setOnlineUsers(new Set(users));
    });

    socket.on("user_online", (userId: string) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
    });

    socket.on("user_offline", (userId: string) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    return () => {
      socket.off("receive_message");
      socket.off("online_users");
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [socket, selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const [receivedRes, sentRes] = await Promise.all([
        getReceivedRequests(),
        getSentRequests(),
      ]);

      const acceptedContacts: Contact[] = [];

      receivedRes.data.requests.forEach((req: any) => {
        if (req.status === "accepted" || req.status === "completed") {
          acceptedContacts.push({
            id: req.senderId._id,
            name: `${req.senderId.firstName} ${req.senderId.lastName}`,
            profilePicture: req.senderId.imageUrl,
          });
        }
      });

      sentRes.data.requests.forEach((req: any) => {
        if (req.status === "accepted" || req.status === "completed") {
          acceptedContacts.push({
            id: req.receiverId._id,
            name: `${req.receiverId.firstName} ${req.receiverId.lastName}`,
            profilePicture: req.receiverId.imageUrl,
          });
        }
      });

      // Remove duplicates just in case
      const uniqueContacts = acceptedContacts.filter((contact, index, self) =>
        index === self.findIndex((t) => t.id === contact.id)
      );

      setContacts(uniqueContacts);
    } catch (error) {
      console.error("Failed to fetch contacts", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (contactId: string) => {
    try {
      const res = await getConversation(contactId);
      setMessages(res.data);
      // Mark all messages from this contact as read
      try {
        await markMessagesAsRead(contactId);
        // Tell the navbar to immediately refresh badge counts
        window.dispatchEvent(new CustomEvent("skillswap:refresh-counts"));
      } catch {
        // Non-critical — don't block
      }
    } catch (error) {
      console.error("Failed to fetch conversation", error);
    }
  };


  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedContact) {
      alert("No contact selected.");
      return;
    }
    if (!inputMessage.trim() && !selectedFile) {
      return; // Button is disabled anyway
    }
    if (isUploading) {
      alert("Still uploading file...");
      return;
    }
    if (!socket) {
      alert("Socket is not initialized. Please refresh the page.");
      return;
    }
    if (!isConnected) {
      alert("Chat is disconnected. Please wait or refresh the page.");
      return;
    }

    let fileUrl = undefined;
    let fileType = undefined;

    if (selectedFile) {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await uploadMessageFile(formData);
        if (res.data) {
          fileUrl = res.data.fileUrl;
          fileType = res.data.fileType;
        }
      } catch (error) {
        console.error("Failed to upload file", error);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    socket.emit("send_message", {
      receiverId: selectedContact.id,
      content: inputMessage.trim(),
      fileUrl,
      fileType,
    });

    setInputMessage("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#2A367E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden flex h-[calc(100vh-140px)] max-h-[800px]">
      {/* Contacts Sidebar */}
      <div className="w-1/3 border-r border-[#E2E8F0] flex flex-col bg-gray-50">
        <div className="p-4 border-b border-[#E2E8F0] bg-white">
          <h2 className="text-xl font-bold text-[#0D1236]">Messages</h2>
          {!isConnected && <span className="text-xs text-red-500">Connecting...</span>}
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm text-center">
              No accepted swap requests yet.
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-[#E2E8F0] ${
                  selectedContact?.id === contact.id ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-gray-100 border-l-4 border-l-transparent"
                }`}
              >
                <div className="relative w-10 h-10 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {contact.profilePicture ? (
                      <img src={contact.profilePicture} alt={contact.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={20} className="text-gray-500" />
                    )}
                  </div>
                  {onlineUsers.has(contact.id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-[#0D1236]">{contact.name}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-[#E2E8F0] flex items-center gap-3 bg-white shadow-sm z-10">
              <div className="relative w-10 h-10 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {selectedContact.profilePicture ? (
                    <img src={selectedContact.profilePicture} alt={selectedContact.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={20} className="text-gray-500" />
                  )}
                </div>
                {onlineUsers.has(selectedContact.id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-[#0D1236]">{selectedContact.name}</h3>
                {onlineUsers.has(selectedContact.id) && (
                  <p className="text-xs text-green-600 font-medium">Online</p>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">
                  Say hi to start the conversation!
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.senderId === user?.id || msg.senderId === user?._id;
                  return (
                    <div key={index} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMine
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                        }`}
                      >
                        {msg.fileUrl && (
                          <div className="mb-2">
                            {msg.fileType?.startsWith("image/") ? (
                              <img src={msg.fileUrl} alt="Attachment" className="max-w-full rounded-lg max-h-60 object-contain" />
                            ) : (
                              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline text-sm break-all">
                                <Paperclip size={16} />
                                View Attachment
                              </a>
                            )}
                          </div>
                        )}
                        {msg.content && <p>{msg.content}</p>}
                        {msg.createdAt && (
                          <span className={`text-[10px] block mt-1 ${isMine ? "text-blue-100 text-right" : "text-gray-400"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-[#E2E8F0]">
              {selectedFile && (
                <div className="mb-2 flex items-center gap-2 bg-gray-100 p-2 rounded-lg text-sm w-max max-w-full">
                  <span className="truncate text-gray-900">{selectedFile.name}</span>
                  <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-gray-500 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
              )}
              <form onSubmit={sendMessage} className="flex gap-2 items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-500 hover:text-blue-600 p-2 transition-colors"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={(!inputMessage.trim() && !selectedFile) || isUploading}
                  className="bg-blue-600 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
