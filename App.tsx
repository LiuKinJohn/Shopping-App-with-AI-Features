import { useState, useEffect, useRef } from "react";
import { Product, CartItem, RedNotePost } from "./types";
import { products } from "./data/products";
import { ChatMessage, Message } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { ShoppingCart } from "./components/ShoppingCart";
import { ProductDetail } from "./components/ProductDetail";
import { generateAIResponse } from "./utils/aiResponses";
import { Sparkles } from "lucide-react";
import { toast } from "sonner@2.0.3";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "你好呀！👋 我是基于小红书社区洞察的AI购物助手。\n\n我会分析小红书的真实用户评价、讨论和体验，帮你做出最好的购物决策。\n\n你可以：\n• 询问任何产品类别\n• 查看真实用户的评价\n• 上传图片找相似商品\n• 获取社区热门推荐\n\n今天想发现什么好物呢？",
      timestamp: new Date(),
    },
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, image?: File) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: content || "我上传了一张图片",
      image: image ? URL.createObjectURL(image) : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(content, !!image);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse.message,
        products: aiResponse.products,
        redNotePosts: aiResponse.redNotePosts,
        redNoteComments: aiResponse.redNoteComments,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        toast.success(`已将 ${product.name} 再次加入购物车！`);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success(`${product.name} 已加入购物车！`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.info("商品已从购物车移除");
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleRedNoteClick = (post: RedNotePost) => {
    // Find the product associated with this post
    const product = products.find(p => p.id === post.productId);
    if (product) {
      setSelectedProduct(product);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <div>
                <h1>AI购物助手</h1>
                <p className="text-sm text-muted-foreground">
                  和AI聊天，发现好物
                </p>
              </div>
            </div>
            <ShoppingCart
              items={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
                onRedNoteClick={handleRedNoteClick}
              />
            ))}
            {isProcessing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="flex-shrink-0">
        <div className="container mx-auto max-w-4xl">
          <ChatInput onSendMessage={handleSendMessage} disabled={isProcessing} />
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetail
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}