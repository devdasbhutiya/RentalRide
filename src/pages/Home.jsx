import { Link } from 'react-router-dom';
import { FiSearch, FiShield, FiDollarSign, FiClock } from 'react-icons/fi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
    };

    const categories = [
        { type: 'car', icon: '🚗', title: 'Cars', description: 'Comfortable rides for long journeys' },
        { type: 'bike', icon: '🏍️', title: 'Bikes', description: 'Feel the freedom on two wheels' },
        { type: 'scooter', icon: '🛵', title: 'Scooters', description: 'Perfect for city commutes' }
    ];

    const features = [
        { icon: <FiSearch />, title: 'Easy Search', description: 'Find your perfect vehicle in seconds' },
        { icon: <FiShield />, title: 'Verified Owners', description: 'All vehicle owners are verified' },
        { icon: <FiDollarSign />, title: 'Best Prices', description: 'Competitive rates guaranteed' },
        { icon: <FiClock />, title: '24/7 Support', description: 'We\'re here whenever you need us' }
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Find Your Perfect <span className="gradient-text">Ride</span>
                    </h1>
                    <p className="hero-subtitle">
                        Rent cars, bikes, and scooters from verified owners in your city.
                        Start your journey today!
                    </p>

                    <form onSubmit={handleSearch} className="hero-search">
                        <div className="search-input-wrapper">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by location, vehicle type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>

                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">500+</span>
                            <span className="stat-label">Vehicles</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">1000+</span>
                            <span className="stat-label">Happy Renters</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">50+</span>
                            <span className="stat-label">Cities</span>
                        </div>
                    </div>
                </div>

                <div className="hero-image">
                    <div className="hero-blob"></div>
                    <div className="vehicle-showcase">
                        <span className="showcase-item car">🚗</span>
                        <span className="showcase-item bike">🏍️</span>
                        <span className="showcase-item scooter">🛵</span>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="section-header">
                    <h2>Browse by Category</h2>
                    <p>Choose the type of vehicle that suits your needs</p>
                </div>

                <div className="categories-grid">
                    {categories.map((category) => (
                        <Link
                            key={category.type}
                            to={`/browse?type=${category.type}`}
                            className="category-card"
                        >
                            <span className="category-icon">{category.icon}</span>
                            <h3>{category.title}</h3>
                            <p>{category.description}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Why Choose RentRide?</h2>
                    <p>We make vehicle rental simple, safe, and affordable</p>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Have a Vehicle to Rent?</h2>
                    <p>List your car, bike, or scooter and start earning today!</p>
                    <Link to="/add-vehicle" className="btn btn-primary btn-lg">
                        List Your Vehicle
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
