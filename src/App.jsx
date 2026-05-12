import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  ShoppingCart, Menu, X, ChevronRight, Star, Heart, 
  MapPin, Users, Info, ArrowRight, CheckCircle2, 
  Settings, Plus, Trash2, Edit2, Save, Package, CreditCard, Truck, Loader2, AlertCircle, MessageCircle, Send
} from 'lucide-react';
import './App.css';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Kváskový chléb Sklizeň', price: 65, producer: 'Pekařství Krusta', image: 'https://images.unsplash.com/photo-1585478259715-876a6a81fc08?q=80&w=1000&auto=format&fit=crop', category: 'Pekárna', stock: 24 },
  { id: 2, name: 'Čerstvé farmářské mléko', price: 42, producer: 'Farma u Dubu', image: 'https://images.unsplash.com/photo-1550583724-125581cc2532?q=80&w=1000&auto=format&fit=crop', category: 'Mléčné výrobky', stock: 15 },
  { id: 3, name: 'Lesní med výběrový', price: 245, producer: 'Včelařství Novák', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1000&auto=format&fit=crop', category: 'Spíž', stock: 40 }
];

const CATEGORIES = ['Vše', 'Pekárna', 'Maso', 'Mléčné výrobky', 'Zahrada', 'Spíž'];

function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [view, setView] = useState('shop'); 
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Vše');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Dobrý den! Jsem váš Bohemia Gourmet asistent. S čím vám mohu dnes pomoci?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) { setView('success'); setCart([]); }
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = (product) => { setCart([...cart, product]); setIsCartOpen(true); };
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handleAiChat = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMsgs = [...chatMessages, { role: 'user', text: userInput }];
    setChatMessages(newMsgs);
    setUserInput('');
    setIsAiLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Jsi asistent luxusního českého e-shopu Bohemia Gourmet. Odpovídej česky, zdvořile a prémiově. 
      Naše produkty: ${products.map(p => p.name).join(', ')}. 
      Uživatel se ptá: ${userInput}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setChatMessages([...newMsgs, { role: 'ai', text: response.text() }]);
    } catch (error) {
      setChatMessages([...newMsgs, { role: 'ai', text: 'Omlouvám se, momentálně mám výpadek. Zkuste to prosím později.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    setCheckoutError(null);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, origin: window.location.origin }),
      });
      if (!response.ok) throw new Error('Server neodpovídá.');
      const session = await response.json();
      if (session.url) window.location.href = session.url;
    } catch (error) { setCheckoutError('Chyba při propojování se Stripe.'); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="app">
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-content">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="logo" onClick={() => setView('shop')} style={{cursor: 'pointer'}}>
            <span className="logo-main">BOHEMIA</span>
            <span className="logo-sub">GOURMET</span>
          </div>

          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {isMobileMenuOpen && <button className="close-menu" onClick={() => setIsMobileMenuOpen(false)}><X size={32} /></button>}
            <button className="admin-link" onClick={() => { setView(view === 'admin' ? 'shop' : 'admin'); setIsMobileMenuOpen(false); }}>Admin</button>
          </div>

          <div className="nav-actions">
            <button className="cart-trigger" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={24} />
              {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
            </button>
          </div>
        </div>
      </nav>

      <main style={{paddingTop: view === 'shop' ? '0' : '120px'}}>
        {view === 'shop' && (
          <>
            <section className="hero">
              <div className="hero-overlay"></div>
              <div className="container hero-content">
                <h1>To nejlepší z české země <br/>přímo k vám domů.</h1>
                <p>Výběrové potraviny od lokálních farmářů doručené s péčí až k vašim dveřím.</p>
                <button className="cta-button" onClick={() => document.getElementById('kategorie').scrollIntoView({ behavior: 'smooth' })}>Prozkoumat nabídku</button>
              </div>
            </section>
            <section className="categories container" id="kategorie">
              <div className="category-tabs">
                {CATEGORIES.map(cat => (
                  <button key={cat} className={`category-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
                ))}
              </div>
            </section>
            <section className="products container">
              <div className="product-grid">
                {(activeCategory === 'Vše' ? products : products.filter(p => p.category === activeCategory)).map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image-wrapper">
                      <img src={product.image} alt={product.name} />
                      <button className="add-to-cart-overlay" onClick={() => addToCart(product)}>Do košíku</button>
                    </div>
                    <div className="product-info">
                      <div className="product-meta"><span className="category-tag">{product.category}</span><span className="stock-tag">{product.stock}ks</span></div>
                      <h3>{product.name}</h3>
                      <p className="producer">{product.producer}</p>
                      <div className="product-footer"><span className="price">{product.price} Kč</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {view === 'checkout' && (
          <section className="checkout-view container fade-in">
            <div className="checkout-grid">
              <div className="checkout-form-section">
                <h2>Pokladna</h2>
                <div className="checkout-info">
                  <p>Přesměrujeme vás na bránu Stripe.</p>
                  {checkoutError && <div className="error-box"><AlertCircle size={20} /><span>{checkoutError}</span></div>}
                  <button className="pay-button" onClick={handleStripeCheckout} disabled={isProcessing}>
                    {isProcessing ? <><Loader2 className="animate-spin" /> Přesměrovávám...</> : `Zaplatit ${totalPrice + 99} Kč`}
                  </button>
                </div>
              </div>
              <div className="checkout-summary">
                <h3>Shrnutí</h3>
                {cart.map((item, i) => <div key={i} className="summary-item"><span>{item.name}</span><span>{item.price} Kč</span></div>)}
                <div className="summary-grand-total"><span>Celkem</span><span>{totalPrice + 99} Kč</span></div>
              </div>
            </div>
          </section>
        )}

        {view === 'success' && (
          <section className="success-view container fade-in">
            <div className="success-card">
              <CheckCircle2 size={80} color="var(--accent)" />
              <h2>Platba byla úspěšná!</h2>
              <button className="cta-button" onClick={() => { setView('shop'); window.history.replaceState({}, document.title, "/"); }}>Zpět</button>
            </div>
          </section>
        )}

        {view === 'admin' && (
          <section className="admin-view container fade-in">
            <div className="admin-header"><h1>Admin</h1><button className="add-btn" onClick={() => setEditingProduct({})}>Přidat</button></div>
            <div className="admin-table">
              {products.map(p => (
                <div key={p.id} className="table-row">
                  <strong>{p.name}</strong><span>{p.stock} ks</span><strong>{p.price} Kč</strong>
                  <div className="actions"><button onClick={() => setEditingProduct(p)}><Edit2 size={18} /></button></div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* AI Chatbot */}
      <div className="chatbot-bubble" onClick={() => setIsChatOpen(!isChatOpen)}>
        {isChatOpen ? <X size={30} /> : <MessageCircle size={30} />}
      </div>
      
      {isChatOpen && (
        <div className="chatbot-window">
          <div className="chat-header">
            <span>Bohemia Asistent</span>
            <button onClick={() => setIsChatOpen(false)}><X size={20} /></button>
          </div>
          <div className="chat-messages">
            {chatMessages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>{m.text}</div>
            ))}
            {isAiLoading && <div className="msg ai"><Loader2 className="animate-spin" /> Přemýšlím...</div>}
          </div>
          <form className="chat-input-area" onSubmit={handleAiChat}>
            <input 
              placeholder="Zeptejte se na naše potraviny..." 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button className="chat-send-btn"><Send size={20} /></button>
          </form>
        </div>
      )}

      {/* Cart Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header"><h2>Košík</h2><button onClick={() => setIsCartOpen(false)}><X size={24} /></button></div>
        <div className="cart-items">
          {cart.map((item, idx) => (
            <div key={idx} className="cart-item">
              <img src={item.image} alt="" />
              <div className="cart-item-info"><h4>{item.name}</h4><p>{item.price} Kč</p></div>
              <button onClick={() => { const n = [...cart]; n.splice(idx,1); setCart(n); }}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        {cart.length > 0 && <div className="cart-footer"><button className="checkout-btn" onClick={() => { setView('checkout'); setIsCartOpen(false); }}>Zaplatit {totalPrice} Kč</button></div>}
      </div>
      <div className={`overlay ${isCartOpen || isMobileMenuOpen ? 'visible' : ''}`} onClick={() => { setIsCartOpen(false); setIsMobileMenuOpen(false); }}></div>
      <footer className="footer"><p>&copy; 2026 Bohemia Gourmet. Prémiové české potraviny.</p></footer>
    </div>
  );
}

export default App;
