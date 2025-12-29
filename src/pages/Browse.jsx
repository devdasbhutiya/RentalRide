import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getVehicles } from '../services/vehicles';
import VehicleCard from '../components/VehicleCard';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';

const Browse = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        type: searchParams.get('type') || 'all',
        location: searchParams.get('search') || '',
        minPrice: '',
        maxPrice: '',
        available: true
    });

    useEffect(() => {
        loadVehicles();
    }, []);

    useEffect(() => {
        // Update filters from URL params
        setFilters(prev => ({
            ...prev,
            type: searchParams.get('type') || 'all',
            location: searchParams.get('search') || ''
        }));
    }, [searchParams]);

    const loadVehicles = async () => {
        setLoading(true);
        const { vehicles: data, error: fetchError } = await getVehicles({
            type: filters.type !== 'all' ? filters.type : undefined,
            available: filters.available
        });

        if (fetchError) {
            setError(fetchError);
        } else {
            setVehicles(data);
        }
        setLoading(false);
    };

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const applyFilters = () => {
        loadVehicles();
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({
            type: 'all',
            location: '',
            minPrice: '',
            maxPrice: '',
            available: true
        });
        setSearchParams({});
    };

    // Client-side filtering for search and price
    const filteredVehicles = vehicles.filter(vehicle => {
        if (filters.location && !vehicle.location.toLowerCase().includes(filters.location.toLowerCase()) &&
            !vehicle.title.toLowerCase().includes(filters.location.toLowerCase())) {
            return false;
        }
        if (filters.minPrice && vehicle.pricePerDay < Number(filters.minPrice)) {
            return false;
        }
        if (filters.maxPrice && vehicle.pricePerDay > Number(filters.maxPrice)) {
            return false;
        }
        if (filters.type !== 'all' && vehicle.type !== filters.type) {
            return false;
        }
        return true;
    });

    return (
        <div className="browse-page">
            <div className="browse-header">
                <h1>Browse Vehicles</h1>
                <p>Find the perfect vehicle for your needs</p>
            </div>

            <div className="browse-container">
                {/* Filters Sidebar */}
                <aside className={`filters-sidebar ${showFilters ? 'active' : ''}`}>
                    <div className="filters-header">
                        <h3>Filters</h3>
                        <button className="close-filters" onClick={() => setShowFilters(false)}>
                            <FiX />
                        </button>
                    </div>

                    <div className="filter-group">
                        <label>Search</label>
                        <div className="search-input">
                            <FiSearch />
                            <input
                                type="text"
                                name="location"
                                value={filters.location}
                                onChange={handleFilterChange}
                                placeholder="Location or vehicle name"
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Vehicle Type</label>
                        <select name="type" value={filters.type} onChange={handleFilterChange}>
                            <option value="all">All Types</option>
                            <option value="car">🚗 Cars</option>
                            <option value="bike">🏍️ Bikes</option>
                            <option value="scooter">🛵 Scooters</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Price Range (₹/day)</label>
                        <div className="price-range">
                            <input
                                type="number"
                                name="minPrice"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                                placeholder="Min"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                name="maxPrice"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    <div className="filter-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="available"
                                checked={filters.available}
                                onChange={handleFilterChange}
                            />
                            <span>Show only available</span>
                        </label>
                    </div>

                    <div className="filter-actions">
                        <button className="btn btn-primary" onClick={applyFilters}>
                            Apply Filters
                        </button>
                        <button className="btn btn-outline" onClick={clearFilters}>
                            Clear All
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="browse-main">
                    <div className="browse-toolbar">
                        <span className="results-count">
                            {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
                        </span>
                        <button
                            className="btn btn-outline filter-toggle"
                            onClick={() => setShowFilters(true)}
                        >
                            <FiFilter /> Filters
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading vehicles...</p>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <p>{error}</p>
                            <button onClick={loadVehicles} className="btn btn-primary">
                                Try Again
                            </button>
                        </div>
                    ) : filteredVehicles.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">🔍</span>
                            <h3>No vehicles found</h3>
                            <p>Try adjusting your filters or search terms</p>
                            <button onClick={clearFilters} className="btn btn-outline">
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="vehicles-grid">
                            {filteredVehicles.map(vehicle => (
                                <VehicleCard key={vehicle.id} vehicle={vehicle} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Browse;
