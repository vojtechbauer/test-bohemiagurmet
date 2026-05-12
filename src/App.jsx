import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  ShoppingCart, Menu, X, ChevronRight, Star, Heart, 
  MapPin, Users, Info, ArrowRight, CheckCircle2, 
  Settings, Plus, Trash2, Edit2, Save, Package, CreditCard, Truck, Loader2
} from 'lucide-react';
import './App.css';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Checkout Form Component
const CheckoutForm = ({ total, onSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    // In a real app, you would create a PaymentIntent on your server
    // Here we simulate the process for the demo
    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else {
      console.log('[PaymentMethod]', paymentMethod);
      // Simulate backend success
      setTimeout(() => {
        setProcessing(false);
        onSuccess();
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="premium-form stripe-form">
      <div className="card-element-container">
        <label>Informace o kartě</label>
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#1A1A1A',
              '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#9e2146' },
          },
        }} />
      </div>
      {error && <div className="payment-error">{error}</div>}
      <div className="checkout-actions">
        <button type="button" className="outline-button" onClick={onBack}>Zpět</button>
        <button type="submit" disabled={!stripe || processing} className="pay-button">
          {processing ? <><Loader2 className="animate-spin" /> Zpracovávám...</> : `Zaplatit ${total} Kč`}
        </button>
      </div>
      <p className="stripe-note">Zabezpečené platby zajišťuje Stripe. Vaše údaje jsou v bezpečí.</p>
    </form>
  );
};

// Initial Mock Data
const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Kváskový chléb Sklizeň',
    price: 65,
    producer: 'Pekařství Krusta',
    image: 'https://images.unsplash.com/photo-1585478259715-876a6a81fc08?q=80&w=1000&auto=format&fit=crop',
    category: 'Pekárna',
    origin: 'Praha',
    stock: 24
  },
  {
    id: 2,
    name: 'Čerstvé farmářské mléko',
    price: 42,
    producer: 'Farma u Dubu',
    image: 'https://images.unsplash.com/photo-1550583724-125581cc2532?q=80&w=1000&auto=format&fit=crop',
    category: 'Mléčné výrobky',
    origin: 'Šumava',
    stock: 15
  },
  {
    id: 3,
    name: 'Lesní med výběrový',
    price: 245,
    producer: 'Včelařství Novák',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1000&auto=format&fit=crop',
    category: 'Spíž',
    origin: 'Beskydy',
    stock: 40
  }
];

const CATEGORIES = ['Vše', 'Pekárna', 'Maso', 'Mléčné výrobky', 'Zahrada', 'Spíž'];

function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [view, setView] = useState('shop'); // 'shop', 'checkout', 'admin', 'success'
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Vše');
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const saveProduct = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get('imageFile');
    
    const handleSave = (imgUrl) => {
      const newProduct = {
        id: editingProduct?.id || Date.now(),
        name: formData.get('name'),
        price: Number(formData.get('price')),
        producer: formData.get('producer'),
        category: formData.get('category'),
        stock: Number(formData.get('stock')),
        image: imgUrl || editingProduct?.image || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1000&auto=format&fit=crop',
        origin: formData.get('origin')
      };

      if (editingProduct?.id) {
        setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
      } else {
        setProducts([...products, newProduct]);
      }
      setEditingProduct(null);
    };

    if (file && file.size > 0) {
      const reader = new FileReader();
      reader.onloadend = () => handleSave(reader.result);
      reader.readAsDataURL(file);
    } else {
      handleSave();
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
                  <div className="product-meta">
                    <span className="category-tag">{product.category}</span>
                    <span className="stock-tag">{product.stock > 0 ? `Skladem: ${product.stock}ks` : 'Vyprodáno'}</span>
                  </div>
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
          <Elements stripe={stripePromise}>
            <CheckoutForm 
              total={totalPrice + 99} 
              onSuccess={() => setView('success')}
              onBack={() => setView('shop')}
            />
          </Elements>
        </div>
        <div className="checkout-summary">
          <h3>Shrnutí objednávky</h3>
          {cart.map((item, i) => (
            <div key={i} className="summary-item">
              <span>{item.name}</span>
              <span>{item.price} Kč</span>
            </div>
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
        <h2>Platba proběhla úspěšně!</h2>
        <p>Děkujeme za váš nákup. Potvrzení jsme odeslali na váš e-mail.</p>
        <button className="cta-button" onClick={() => { setView('shop'); setCart([]); }}>Zpět do obchodu</button>
      </div>
    </section>
  );

  const renderAdmin = () => (
    <section className="admin-view container fade-in">
      <div className="admin-header">
        <h1>Správa e-shopu</h1>
        <button className="add-btn" onClick={() => setEditingProduct({})}><Plus size={20} /> Přidat položku</button>
      </div>
      {editingProduct && (
        <div className="admin-modal">
          <form className="premium-form" onSubmit={saveProduct}>
            <h2>{editingProduct.id ? 'Upravit produkt' : 'Nový produkt'}</h2>
            <div className="form-row">
              <input name="name" defaultValue={editingProduct.name} placeholder="Název" required />
              <input name="price" defaultValue={editingProduct.price} placeholder="Cena" type="number" required />
            </div>
            <div className="form-row">
              <input name="producer" defaultValue={editingProduct.producer} placeholder="Výrobce" required />
              <select name="category" defaultValue={editingProduct.category || 'Pekárna'}>
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-row">
              <input name="stock" defaultValue={editingProduct.stock} placeholder="Sklad" type="number" required />
              <input name="origin" defaultValue={editingProduct.origin} placeholder="Původ" required />
            </div>
            <div className="form-group">
              <label>Obrázek</label>
              <input name="imageFile" type="file" accept="image/*" />
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setEditingProduct(null)}>Zrušit</button>
              <button type="submit" className="save-btn">Uložit</button>
            </div>
          </form>
        </div>
      )}
      <div className="admin-table">
        <div className="table-header"><span>Produkt</span><span>Sklad</span><span>Cena</span><span>Akce</span></div>
        {products.map(p => (
          <div key={p.id} className="table-row">
            <div className="p-info"><strong>{p.name}</strong><small>{p.producer}</small></div>
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
          <div className="logo" onClick={() => setView('shop')} style={{cursor: 'pointer'}}>
            <span className="logo-main">BOHEMIA</span>
            <span className="logo-sub">GOURMET</span>
          </div>
          <div className="nav-links">
            <button className={`admin-link ${view === 'admin' ? 'active' : ''}`} onClick={() => setView(view === 'admin' ? 'shop' : 'admin')}>
              <Settings size={20} /> Admin
            </button>
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
              <img src={item.image} alt="" />
              <div className="cart-item-info"><h4>{item.name}</h4><p>{item.price} Kč</p></div>
              <button onClick={() => removeFromCart(idx)}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="total"><span>Celkem</span><span>{totalPrice} Kč</span></div>
            <button className="checkout-btn" onClick={() => { setView('checkout'); setIsCartOpen(false); }}>K pokladně</button>
          </div>
        )}
      </div>
      <div className={`overlay ${isCartOpen ? 'visible' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <footer className="footer"><p>&copy; 2026 Bohemia Gourmet.</p></footer>
    </div>
  );
}

export default App;
