import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { 
  ShoppingCart, Menu, X, ChevronRight, Star, Heart, 
  MapPin, Users, Info, ArrowRight, CheckCircle2, 
  Settings, Plus, Trash2, Edit2, Save, Package, CreditCard, Truck, Loader2, AlertCircle
} from 'lucide-react';
import './App.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CATEGORIES = ['Vše', 'Pekárna', 'Maso', 'Mléčné výrobky', 'Zahrada', 'Spíž'];

// Sample Premium Products for Seeding
const SEED_PRODUCTS = [
  { name: 'Kváskový chléb Sklizeň', price: 65, producer: 'Pekařství Krusta', category: 'Pekárna', stock: 24, image: 'https://images.unsplash.com/photo-1585478259715-876a6a81fc08?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Hovězí svíčková (BIO)', price: 890, producer: 'Farma Mitrov', category: 'Maso', stock: 5, image: 'https://images.unsplash.com/photo-1544022613-e87ce7526ed1?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Farmářské máslo 82%', price: 58, producer: 'Mlékárna Krasolesí', category: 'Mléčné výrobky', stock: 40, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Pálavský Ryzlink (Pozdní sběr)', price: 345, producer: 'Vinařství Sonberk', category: 'Spíž', stock: 12, image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Šunka od kosti (výběrová)', price: 450, producer: 'Uzeniny Amaso', category: 'Maso', stock: 15, image: 'https://images.unsplash.com/photo-1524063221847-15c7329095d8?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Lesní med z Beskyd', price: 245, producer: 'Včelařství Novák', category: 'Spíž', stock: 30, image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Čerstvá vajíčka (volný chov)', price: 85, producer: ' Statek u Dubu', category: 'Mléčné výrobky', stock: 50, image: 'https://images.unsplash.com/photo-1518569109129-e3776d89b380?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Domácí borůvková marmeláda', price: 125, producer: 'Babiččina spíž', category: 'Spíž', stock: 20, image: 'https://images.unsplash.com/photo-1502209524164-abd935c1f3ec?q=80&w=1000&auto=format&fit=crop' }
];

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [view, setView] = useState('shop'); 
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Vše');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync Products & Seed Data
  useEffect(() => {
    const checkAndSeed = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      if (querySnapshot.empty) {
        console.log("Seeding initial products...");
        for (const p of SEED_PRODUCTS) {
          await addDoc(collection(db, "products"), p);
        }
      }
    };

    checkAndSeed();

    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
      setIsLoading(false);
    });
    
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) { setView('success'); setCart([]); }
    
    return () => { unsub(); window.removeEventListener('scroll', handleScroll); };
  }, []);

  const addToCart = (product) => { setCart([...cart, product]); setIsCartOpen(true); };
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const saveProduct = async (e) => {
    e.preventDefault();
    const data = {
      name: editingProduct.name,
      price: Number(editingProduct.price),
      producer: editingProduct.producer,
      category: editingProduct.category || 'Pekárna',
      stock: Number(editingProduct.stock),
      image: editingProduct.image || 'https://images.unsplash.com/photo-1585478259715-876a6a81fc08?q=80&w=1000&auto=format&fit=crop'
    };

    try {
      if (editingProduct.id) {
        await updateDoc(doc(db, "products", editingProduct.id), data);
      } else {
        await addDoc(collection(db, "products"), data);
      }
      setEditingProduct(null);
    } catch (err) {
      alert('Chyba při ukládání: ' + err.message);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Opravdu smazat?')) {
      await deleteDoc(doc(db, "products", id));
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
      const session = await response.json();
      if (session.url) window.location.href = session.url;
    } catch (error) { setCheckoutError('Chyba při propojování se Stripe.'); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="app">
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-content">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
          <div className="logo" onClick={() => setView('shop')} style={{cursor: 'pointer'}}><span className="logo-main">BOHEMIA</span><span className="logo-sub">GOURMET</span></div>
          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {isMobileMenuOpen && <button className="close-menu" onClick={() => setIsMobileMenuOpen(false)}><X size={32} /></button>}
            <button className="admin-link" onClick={() => { setView(view === 'admin' ? 'shop' : 'admin'); setIsMobileMenuOpen(false); }}>Admin</button>
          </div>
          <div className="nav-actions">
            <button className="cart-trigger" onClick={() => setIsCartOpen(true)}><ShoppingCart size={24} />{cart.length > 0 && <span className="cart-count">{cart.length}</span>}</button>
          </div>
        </div>
      </nav>

      <main style={{paddingTop: view === 'shop' ? '0' : '120px'}}>
        {view === 'shop' && (
          <>
            <section className="hero"><div className="hero-overlay"></div><div className="container hero-content"><h1>Prémiové delikatesy <br/>z českých farem.</h1><p>Vybíráme pro vás to nejlepší, co naše země nabízí. Doručeno čerstvé do 24 hodin.</p><button className="cta-button" onClick={() => document.getElementById('kategorie').scrollIntoView({ behavior: 'smooth' })}>Prozkoumat nabídku</button></div></section>
            <section className="categories container" id="kategorie"><div className="category-tabs">{CATEGORIES.map(cat => (<button key={cat} className={`category-tab ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>))}</div></section>
            <section className="products container">
              {isLoading ? <div className="loader"><Loader2 className="animate-spin" /> Načítám čerstvé zásoby...</div> : (
                <div className="product-grid">
                  {(activeCategory === 'Vše' ? products : products.filter(p => p.category === activeCategory)).map(product => (
                    <div key={product.id} className="product-card">
                      <div className="product-image-wrapper"><img src={product.image} alt={product.name} /><button className="add-to-cart-overlay" onClick={() => addToCart(product)}>Do košíku</button></div>
                      <div className="product-info">
                        <div className="product-meta"><span className="category-tag">{product.category}</span><span className="stock-tag">{product.stock}ks skladem</span></div>
                        <h3>{product.name}</h3><p className="producer">{product.producer}</p><div className="product-footer"><span className="price">{product.price} Kč</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {view === 'checkout' && (
          <section className="checkout-view container fade-in">
            <div className="checkout-grid">
              <div className="checkout-form-section">
                <h2>Pokladna</h2>
                <div className="checkout-info">
                  <p>Budete přesměrováni na platební bránu Stripe.</p>
                  {checkoutError && <div className="error-box"><AlertCircle size={20} /><span>{checkoutError}</span></div>}
                  <button className="pay-button" onClick={handleStripeCheckout} disabled={isProcessing}>{isProcessing ? <><Loader2 className="animate-spin" /> Přesměrovávám...</> : `Zaplatit ${totalPrice + 99} Kč`}</button>
                </div>
              </div>
              <div className="checkout-summary"><h3>Shrnutí</h3>{cart.map((item, i) => <div key={i} className="summary-item"><span>{item.name}</span><span>{item.price} Kč</span></div>)}<div className="summary-grand-total"><span>Celkem s dopravou</span><span>{totalPrice + 99} Kč</span></div></div>
            </div>
          </section>
        )}

        {view === 'success' && <section className="success-view container fade-in"><div className="success-card"><CheckCircle2 size={80} color="var(--accent)" /><h2>Děkujeme za nákup!</h2><p>Vaše objednávka se už připravuje k odeslání.</p><button className="cta-button" onClick={() => { setView('shop'); window.history.replaceState({}, document.title, "/"); }}>Zpět do obchodu</button></div></section>}

        {view === 'admin' && (
          <section className="admin-view container fade-in">
            <div className="admin-header"><h1>Správa skladu</h1><button className="add-btn" onClick={() => setEditingProduct({ name: '', price: 0, producer: '', stock: 0 })}><Plus size={20} /> Přidat položku</button></div>
            <div className="admin-table">
              {products.map(p => (
                <div key={p.id} className="table-row">
                  <strong>{p.name}</strong><span>{p.stock} ks</span><strong>{p.price} Kč</strong>
                  <div className="actions"><button onClick={() => setEditingProduct(p)}><Edit2 size={18} /></button><button onClick={() => deleteProduct(p.id)} className="delete"><Trash2 size={18} /></button></div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Product Modal */}
      {editingProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingProduct.id ? 'Upravit produkt' : 'Nový produkt'}</h2>
            <form onSubmit={saveProduct}>
              <div className="form-group"><label>Název</label><input required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} /></div>
              <div className="form-group"><label>Cena (Kč)</label><input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} /></div>
              <div className="form-group"><label>Výrobce</label><input required value={editingProduct.producer} onChange={e => setEditingProduct({...editingProduct, producer: e.target.value})} /></div>
              <div className="form-group"><label>Skladem (ks)</label><input type="number" required value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} /></div>
              <div className="form-group"><label>Kategorie</label><select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="form-group"><label>URL obrázku</label><input value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} placeholder="https://..." /></div>
              <div className="modal-actions"><button type="button" onClick={() => setEditingProduct(null)}>Zrušit</button><button type="submit" className="save-btn">Uložit produkt</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header"><h2>Košík</h2><button onClick={() => setIsCartOpen(false)}><X size={24} /></button></div>
        <div className="cart-items">{cart.map((item, idx) => (<div key={idx} className="cart-item"><img src={item.image} alt="" /><div className="cart-item-info"><h4>{item.name}</h4><p>{item.price} Kč</p></div><button onClick={() => { const n = [...cart]; n.splice(idx,1); setCart(n); }}><Trash2 size={16} /></button></div>))}</div>
        {cart.length > 0 && <div className="cart-footer"><button className="checkout-btn" onClick={() => { setView('checkout'); setIsCartOpen(false); }}>K pokladně ({totalPrice} Kč)</button></div>}
      </div>
      <div className={`overlay ${isCartOpen || isMobileMenuOpen ? 'visible' : ''}`} onClick={() => { setIsCartOpen(false); setIsMobileMenuOpen(false); }}></div>
      <footer className="footer container"><p>&copy; 2026 Bohemia Gourmet. Prémiové české potraviny přímo od výrobců.</p></footer>
    </div>
  );
}

export default App;
