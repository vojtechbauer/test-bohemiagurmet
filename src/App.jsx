import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X, ChevronRight, Star, Heart, MapPin, Users, Info, ArrowRight, CheckCircle2 } from 'lucide-react';
import './App.css';

// Mock Data
import breadImg from './assets/product_bread_1778571852824.png';
import milkImg from './assets/product_milk_1778571867251.png';
import honeyImg from './assets/product_honey_1778571931268.png';
import farmerImg from './assets/producer_farmer.png';

const PRODUCTS = [
  {
    id: 1,
    name: 'Kváskový chléb Sklizeň',
    price: 65,
    producer: 'Pekařství Krusta',
    image: breadImg,
    category: 'Pekárna',
    origin: 'Praha'
  },
  {
    id: 2,
    name: 'Čerstvé farmářské mléko',
    price: 42,
    producer: 'Farma u Dubu',
    image: milkImg,
    category: 'Mléčné výrobky',
    origin: 'Šumava'
  },
  {
    id: 3,
    name: 'Lesní med výběrový',
    price: 245,
    producer: 'Včelařství Novák',
    image: honeyImg,
    category: 'Spíž',
    origin: 'Beskydy'
  },
  {
    id: 4,
    name: 'Hovězí steak (Dry-aged)',
    price: 890,
    producer: 'Masna Amaso',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop',
    category: 'Maso',
    origin: 'Jižní Čechy'
  },
  {
    id: 5,
    name: 'Bio jablka Gala',
    price: 89,
    producer: 'Sady Chelčice',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=1000&auto=format&fit=crop',
    category: 'Zahrada',
    origin: 'Jižní Čechy'
  }
];

const CATEGORIES = ['Vše', 'Pekárna', 'Maso', 'Mléčné výrobky', 'Zahrada', 'Spíž'];

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Vše');
  const [wishlist, setWishlist] = useState([]);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  
  const productsRef = useRef(null);

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

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const handleCheckout = () => {
    setIsCheckoutSuccess(true);
    setTimeout(() => {
      setIsCheckoutSuccess(false);
      setCart([]);
      setIsCartOpen(false);
    }, 3000);
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    setNewsletterSubscribed(true);
    setTimeout(() => setNewsletterSubscribed(false), 5000);
  };

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredProducts = activeCategory === 'Vše' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="app">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-content">
          <div className="logo" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} style={{cursor: 'pointer'}}>
            <span className="logo-main">BOHEMIA</span>
            <span className="logo-sub">GOURMET</span>
          </div>
          
          <div className="nav-links">
            <a href="#kategorie">Kategorie</a>
            <a href="#vyrobci">Výrobci</a>
            <a href="#pribeh">Náš příběh</a>
          </div>

          <div className="nav-actions">
            <button className="cart-trigger" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={24} />
              {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
            </button>
            <button className="mobile-menu"><Menu size={24} /></button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="fade-in">To nejlepší z české země <br/>přímo k vám domů.</h1>
          <p className="fade-in">Výběrové potraviny od lokálních farmářů a mistrů svého řemesla, doručené s péčí až k vašim dveřím.</p>
          <button className="cta-button fade-in" onClick={scrollToProducts}>
            Prozkoumat nabídku <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="categories container" id="kategorie">
        <div className="section-header">
          <h2>Naše kolekce</h2>
          <p>Pečlivě vybrané pro vaši kuchyni</p>
        </div>
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="products container" ref={productsRef}>
        <div className="section-header">
          <h2>{activeCategory === 'Vše' ? 'Doporučujeme' : activeCategory}</h2>
          <p>To nejčerstvější od našich výrobců</p>
        </div>
        <div className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.name} />
                  <button 
                    className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(product.id)}
                  >
                    <Heart size={20} fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
                  </button>
                  <button className="add-to-cart-overlay" onClick={() => addToCart(product)}>Do košíku</button>
                </div>
                <div className="product-info">
                  <div className="product-meta">
                    <span className="category-tag">{product.category}</span>
                    <span className="origin-tag"><MapPin size={12} /> {product.origin}</span>
                  </div>
                  <h3>{product.name}</h3>
                  <p className="producer">{product.producer}</p>
                  <div className="product-footer">
                    <span className="price">{product.price} Kč</span>
                    <div className="rating">
                      <Star size={14} fill="var(--primary)" color="var(--primary)" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">Omlouváme se, v této kategorii momentálně nemáme žádné produkty.</div>
          )}
        </div>
      </section>

      {/* Producers Section */}
      <section className="producers" id="vyrobci">
        <div className="container producer-content">
          <div className="producer-image">
            <img src={farmerImg} alt="Naši výrobci" />
          </div>
          <div className="producer-text">
            <div className="badge">NAŠI VÝROBCI</div>
            <h2>Příběhy za každým soustem</h2>
            <p>Spolupracujeme s více než 50 lokálními farmáři, pekaři a řemeslníky, kteří do své práce dávají srdce. Známe každého z nich osobně.</p>
            <div className="producer-stats">
              <div className="stat">
                <h3>50+</h3>
                <span>Lokálních farem</span>
              </div>
              <div className="stat">
                <h3>100%</h3>
                <span>Prověřený původ</span>
              </div>
            </div>
            <button className="outline-button">Seznámit se s výrobci <ArrowRight size={18} /></button>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="story container" id="pribeh">
        <div className="story-grid">
          <div className="story-card">
            <Users size={32} className="story-icon" />
            <h3>Lokální komunita</h3>
            <p>Podporujeme české hospodářství a vracíme život do našich regionů.</p>
          </div>
          <div className="story-card">
            <Info size={32} className="story-icon" />
            <h3>Transparentnost</h3>
            <p>U každého produktu přesně víte, kdo ho vyrobil a odkud pochází.</p>
          </div>
          <div className="story-card">
            <CheckCircle2 size={32} className="story-icon" />
            <h3>Kvalita bez kompromisů</h3>
            <p>Vybíráme jen to, co bychom sami s radostí naservírovali své rodině.</p>
          </div>
        </div>
      </section>

      {/* Cart Drawer */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Váš košík</h2>
          <button onClick={() => setIsCartOpen(false)}><X size={24} /></button>
        </div>
        <div className="cart-items">
          {isCheckoutSuccess ? (
            <div className="success-message">
              <CheckCircle2 size={64} color="var(--accent)" />
              <h3>Objednávka přijata!</h3>
              <p>Děkujeme za váš nákup. Brzy vás budeme kontaktovat.</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="empty-cart">
              <ShoppingCart size={48} />
              <p>Košík je prázdný</p>
              <button className="shop-now-btn" onClick={() => {setIsCartOpen(false); scrollToProducts();}}>Začít nakupovat</button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p>{item.price} Kč</p>
                </div>
                <button className="remove-item" onClick={() => removeFromCart(idx)}><X size={16} /></button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && !isCheckoutSuccess && (
          <div className="cart-footer">
            <div className="total">
              <span>Celkem</span>
              <span>{totalPrice} Kč</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>Pokračovat k platbě</button>
          </div>
        )}
      </div>
      <div className={`overlay ${isCartOpen ? 'visible' : ''}`} onClick={() => setIsCartOpen(false)}></div>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-main">BOHEMIA</span>
              <span className="logo-sub">GOURMET</span>
            </div>
            <p>Spojujeme poctivé české výrobce s lidmi, kteří milují kvalitu a tradici.</p>
          </div>
          <div className="footer-links">
            <h4>Odkazy</h4>
            <a href="#kategorie" onClick={(e) => {e.preventDefault(); scrollToProducts();}}>Kategorie</a>
            <a href="#vyrobci">Výrobci</a>
            <a href="#pribeh">Náš příběh</a>
          </div>
          <div className="footer-newsletter">
            <h4>Zůstaňte v obraze</h4>
            <p>Dostávejte novinky o čerstvých úrodách.</p>
            <form className="newsletter-input" onSubmit={handleNewsletter}>
              {newsletterSubscribed ? (
                <div className="newsletter-success">
                  <CheckCircle2 size={18} /> Odebírání potvrzeno!
                </div>
              ) : (
                <>
                  <input type="email" placeholder="Váš e-mail" required />
                  <button type="submit">Odebírat</button>
                </>
              )}
            </form>
          </div>
        </div>
        <div className="footer-bottom container">
          <p>&copy; 2026 Bohemia Gourmet. Všechna práva vyhrazena.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
