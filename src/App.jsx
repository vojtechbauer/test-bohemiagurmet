import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  ShoppingCart, Menu, X, ChevronRight, Star, Heart, 
  MapPin, Users, Info, ArrowRight, CheckCircle2, 
  Settings, Plus, Trash2, Edit2, Save, Package, CreditCard, Truck, Loader2, AlertCircle
} from 'lucide-react';
import './App.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
  const [view, setView] = useState('shop'); 
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Vše');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      setView('success');
      setCart([]);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
    setIsCartOpen(true);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    setCheckoutError(null);

    try {
      // Robust call via Vite Proxy (/api/...)
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cart, 
          origin: window.location.origin 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server neodpovídá správně.');
      }

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('Server nevrátil platební odkaz.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error.message === 'Failed to fetch' 
        ? 'Backend server neběží. Spusťte prosím Spustit_Eshop.bat' 
        : error.message
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderShop = () => {
    const filteredProducts = activeCategory === 'Vše' ? products : products.filter(p => p.category === activeCategory);
    return (
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
              <button key={cat} className={`category-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </section>
        <section className="products container">
          <div className="product-grid">
            {filteredProducts.map(product => (
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
    );
  };

  const renderCheckout = () => (
    <section className="checkout-view container fade-in">
      <div className="checkout-grid">
        <div className="checkout-form-section">
          <h2>Pokladna</h2>
          <div className="checkout-info">
            <p>Přesměrujeme vás na zabezpečenou bránu Stripe.</p>
            <div className="shipping-methods">
              <div className="method-card active">
                <Truck size={20} />
                <div><span>Kurýr Bohemia Gourmet</span><small>Doručení do 24 hodin</small></div>
                <span>99 Kč</span>
              </div>
            </div>

            {checkoutError && (
              <div className="error-box">
                <AlertCircle size={20} />
                <span>{checkoutError}</span>
              </div>
            )}

            <button className="pay-button" onClick={handleStripeCheckout} disabled={isProcessing}>
              {isProcessing ? <><Loader2 className="animate-spin" /> Přesměrovávám...</> : `Zaplatit ${totalPrice + 99} Kč přes Stripe`}
            </button>
          </div>
        </div>
        <div className="checkout-summary">
          <h3>Shrnutí objednávky</h3>
          {cart.map((item, i) => (
            <div key={i} className="summary-item"><span>{item.name}</span><span>{item.price} Kč</span></div>
          ))}
          <div className="summary-total"><span>Doprava</span><span>99 Kč</span></div>
          <div className="summary-grand-total"><span>Celkem</span><span>{totalPrice + 99} Kč</span></div>
        </div>
      </div>
    </section>
  );

  const renderSuccess = () => (
    <section className="success-view container fade-in">
      <div className="success-card">
        <CheckCircle2 size={80} color="var(--accent)" />
        <h2>Platba byla úspěšná!</h2>
        <p>Děkujeme. Platbu nyní uvidíte ve svém Stripe dashboardu.</p>
        <button className="cta-button" onClick={() => { setView('shop'); window.history.replaceState({}, document.title, "/"); }}>Zpět do obchodu</button>
      </div>
    </section>
  );

  const renderAdmin = () => (
    <section className="admin-view container fade-in">
      <div className="admin-header"><h1>Admin</h1><button className="add-btn" onClick={() => setEditingProduct({})}>Přidat</button></div>
      <div className="admin-table">
        {products.map(p => (
          <div key={p.id} className="table-row">
            <strong>{p.name}</strong>
            <span>{p.stock} ks</span>
            <strong>{p.price} Kč</strong>
            <div className="actions">
              <button onClick={() => setEditingProduct(p)}><Edit2 size={18} /></button>
              <button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="delete"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="app">
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-content">
          <div className="logo" onClick={() => setView('shop')} style={{cursor: 'pointer'}}><span className="logo-main">BOHEMIA</span><span className="logo-sub">GOURMET</span></div>
          <div className="nav-links">
            <button className="admin-link" onClick={() => setView(view === 'admin' ? 'shop' : 'admin')}>Admin</button>
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
        {view === 'shop' && renderShop()}
        {view === 'checkout' && renderCheckout()}
        {view === 'admin' && renderAdmin()}
        {view === 'success' && renderSuccess()}
      </main>
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header"><h2>Košík</h2><button onClick={() => setIsCartOpen(false)}><X size={24} /></button></div>
        <div className="cart-items">
          {cart.map((item, idx) => (
            <div key={idx} className="cart-item">
              <img src={item.image} alt="" /><div className="cart-item-info"><h4>{item.name}</h4><p>{item.price} Kč</p></div>
              <button onClick={() => { const n = [...cart]; n.splice(idx,1); setCart(n); }}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        {cart.length > 0 && <div className="cart-footer"><button className="checkout-btn" onClick={() => { setView('checkout'); setIsCartOpen(false); }}>Zaplatit {totalPrice} Kč</button></div>}
      </div>
      <div className={`overlay ${isCartOpen ? 'visible' : ''}`} onClick={() => setIsCartOpen(false)}></div>
    </div>
  );
}

export default App;
