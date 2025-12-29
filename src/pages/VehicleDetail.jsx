import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVehicleById } from '../services/vehicles';
import { createBooking, checkAvailability } from '../services/bookings';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import { FiMapPin, FiUser, FiCalendar, FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const VehicleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, userProfile } = useAuth();

    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        loadVehicle();
    }, [id]);

    const loadVehicle = async () => {
        setLoading(true);
        const { vehicle: data, error: fetchError } = await getVehicleById(id);

        if (fetchError) {
            setError(fetchError);
        } else {
            setVehicle(data);
        }
        setLoading(false);
    };

    const handleBookClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setShowBookingModal(true);
    };

    const handleBookingConfirm = async (bookingData) => {
        setBookingLoading(true);

        // Check availability first
        const { available, error: availError } = await checkAvailability(
            id,
            bookingData.startDate,
            bookingData.endDate
        );

        if (availError) {
            setError(availError);
            setBookingLoading(false);
            return;
        }

        if (!available) {
            setError('❌ These dates are not available - they conflict with an existing booking. Please choose different dates.');
            setBookingLoading(false);
            setShowBookingModal(false);
            return;
        }

        // Create booking
        const { error: bookingError } = await createBooking({
            vehicleId: id,
            vehicleTitle: vehicle.title,
            vehicleImage: vehicle.images?.[0] || '',
            renterId: user.uid,
            renterName: userProfile?.name || user.displayName || 'Unknown',
            ownerId: vehicle.ownerId,
            ownerName: vehicle.ownerName,
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            totalDays: bookingData.totalDays,
            totalPrice: bookingData.totalPrice,
            pricePerDay: vehicle.pricePerDay
        });

        setBookingLoading(false);

        if (bookingError) {
            setError(bookingError);
            return;
        }

        setShowBookingModal(false);
        setBookingSuccess(true);

        // Redirect to bookings after 2 seconds
        setTimeout(() => {
            navigate('/my-bookings');
        }, 2000);
    };

    const nextImage = () => {
        if (vehicle?.images?.length > 1) {
            setCurrentImageIndex((prev) =>
                prev === vehicle.images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (vehicle?.images?.length > 1) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? vehicle.images.length - 1 : prev - 1
            );
        }
    };

    const typeIcons = {
        car: '🚗',
        bike: '🏍️',
        scooter: '🛵'
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading vehicle details...</p>
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="error-container">
                <h2>Vehicle not found</h2>
                <p>{error || 'The vehicle you are looking for does not exist.'}</p>
                <button onClick={() => navigate('/browse')} className="btn btn-primary">
                    Browse Vehicles
                </button>
            </div>
        );
    }

    return (
        <div className="vehicle-detail-page">
            {bookingSuccess && (
                <div className="success-overlay">
                    <div className="success-message">
                        <span className="success-icon">✓</span>
                        <h2>Booking Successful!</h2>
                        <p>Redirecting to your bookings...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-error" style={{ margin: '2rem auto', maxWidth: '800px' }}>
                    {error}
                </div>
            )}

            <div className="vehicle-detail-container">
                {/* Image Gallery */}
                <div className="vehicle-gallery">
                    <div className="gallery-main">
                        {vehicle.images && vehicle.images.length > 0 ? (
                            <>
                                <img
                                    src={vehicle.images[currentImageIndex]}
                                    alt={vehicle.title}
                                />
                                {vehicle.images.length > 1 && (
                                    <>
                                        <button className="gallery-nav prev" onClick={prevImage}>
                                            <FiChevronLeft />
                                        </button>
                                        <button className="gallery-nav next" onClick={nextImage}>
                                            <FiChevronRight />
                                        </button>
                                        <div className="gallery-dots">
                                            {vehicle.images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="no-image-large">
                                <span>{typeIcons[vehicle.type] || '🚗'}</span>
                            </div>
                        )}
                    </div>

                    {vehicle.images && vehicle.images.length > 1 && (
                        <div className="gallery-thumbs">
                            {vehicle.images.map((img, index) => (
                                <button
                                    key={index}
                                    className={`thumb ${index === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                >
                                    <img src={img} alt={`${vehicle.title} ${index + 1}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Vehicle Info */}
                <div className="vehicle-info">
                    <div className="vehicle-header">
                        <span className="vehicle-type-badge">
                            {typeIcons[vehicle.type]} {vehicle.type}
                        </span>
                        <span className={`availability-status ${vehicle.available ? 'available' : 'unavailable'}`}>
                            {vehicle.available ? '✓ Available' : '✗ Unavailable'}
                        </span>
                    </div>

                    <h1 className="vehicle-title">{vehicle.title}</h1>

                    <div className="vehicle-brand-model">
                        {vehicle.brand} {vehicle.model} • {vehicle.year}
                    </div>

                    <div className="vehicle-location">
                        <FiMapPin /> {vehicle.location}
                    </div>

                    <div className="vehicle-owner">
                        <FiUser /> Listed by <strong>{vehicle.ownerName}</strong>
                    </div>

                    <div className="vehicle-price-card">
                        <div className="price">
                            <span className="amount">₹{vehicle.pricePerDay}</span>
                            <span className="period">/day</span>
                        </div>

                        {vehicle.available && user?.uid !== vehicle.ownerId ? (
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleBookClick}
                                disabled={bookingLoading}
                            >
                                <FiCalendar /> {bookingLoading ? 'Processing...' : 'Book Now'}
                            </button>
                        ) : user?.uid === vehicle.ownerId ? (
                            <p className="owner-note">This is your listing</p>
                        ) : (
                            <p className="unavailable-note">Currently unavailable</p>
                        )}
                    </div>

                    {vehicle.description && (
                        <div className="vehicle-description">
                            <h3>Description</h3>
                            <p>{vehicle.description}</p>
                        </div>
                    )}

                    {vehicle.features && vehicle.features.length > 0 && (
                        <div className="vehicle-features">
                            <h3>Features</h3>
                            <ul className="features-list">
                                {vehicle.features.map((feature, index) => (
                                    <li key={index}>
                                        <FiCheck /> {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <BookingModal
                vehicle={vehicle}
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                onConfirm={handleBookingConfirm}
            />
        </div>
    );
};

export default VehicleDetail;
