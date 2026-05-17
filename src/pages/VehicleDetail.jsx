import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVehicleById } from '../services/vehicles';
import { createBooking, checkAvailability } from '../services/bookings';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import { FiMapPin, FiUser, FiCalendar, FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

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
        setError(''); // Clear previous errors

        // Validate vehicle ID
        if (!id || id === 'undefined' || id === 'null') {
            console.error('❌ Invalid vehicle ID:', id);
            setError('Invalid vehicle ID. Please check the URL.');
            setLoading(false);
            return;
        }

        console.log('🔍 Fetching vehicle with ID:', id);
        const { vehicle: data, error: fetchError } = await getVehicleById(id);

        if (fetchError) {
            console.error('❌ Error fetching vehicle:', fetchError);
            setError(fetchError);
        } else if (!data) {
            console.error('❌ Vehicle not found for ID:', id);
            setError('Vehicle not found. It may have been removed by the owner.');
        } else {
            console.log('✅ Vehicle loaded successfully:', data.title);
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
        setError(''); // Clear previous errors

        console.log('📅 Checking availability for dates:', bookingData.startDate, 'to', bookingData.endDate);

        // Check availability first
        const { available, error: availError } = await checkAvailability(
            id,
            bookingData.startDate,
            bookingData.endDate
        );

        if (availError) {
            console.error('❌ Error checking availability:', availError);
            setError(`Error checking availability: ${availError}`);
            setBookingLoading(false);
            setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
            return;
        }

        if (!available) {
            console.warn('⚠️ Dates conflict with existing booking');
            setError('❌ These dates are not available - they conflict with an existing booking. Please choose different dates.');
            setBookingLoading(false);
            setShowBookingModal(false);
            setTimeout(() => setError(''), 8000); // Clear error after 8 seconds
            return;
        }

        console.log('✅ Dates are available, initiating Razorpay checkout...');

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

        if (!res) {
            setError('Razorpay SDK failed to load. Are you online?');
            setBookingLoading(false);
            return;
        }

        // Setup Razorpay options
        const amountInPaise = bookingData.totalPrice * 100;
        const options = {
            key: 'rzp_test_SqU3iPDRTL2mEp', // Replace with your actual Razorpay Test Key ID
            amount: amountInPaise.toString(),
            currency: 'INR',
            name: 'Vehicle Rental',
            description: `Booking for ${vehicle.title}`,
            image: vehicle.images?.[0] || 'https://example.com/your_logo',
            handler: async function (response) {
                // On success, save the booking
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
                    pricePerDay: vehicle.pricePerDay,
                    paymentId: response.razorpay_payment_id,
                    status: 'confirmed', // Razorpay was successful
                });

                setBookingLoading(false);

                if (bookingError) {
                    console.error('❌ Error creating booking:', bookingError);
                    setError(`Payment successful but failed to create booking: ${bookingError}`);
                    setTimeout(() => setError(''), 5000); // Clear error after 5 seconds
                    return;
                }

                console.log('✅ Booking created successfully!');
                setShowBookingModal(false);
                setBookingSuccess(true);

                // Redirect to bookings after 2 seconds
                setTimeout(() => {
                    navigate('/my-bookings');
                }, 2000);
            },
            prefill: {
                name: userProfile?.name || user.displayName || '',
                email: userProfile?.email || user.email || '',
                contact: userProfile?.phone || ''
            },
            theme: {
                color: '#3399cc'
            },
            modal: {
                ondismiss: function() {
                    setBookingLoading(false);
                    console.log('Checkout form closed');
                }
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
            console.error('Payment Failed:', response.error);
            setError(`Payment failed: ${response.error.description}`);
            setBookingLoading(false);
        });
        paymentObject.open();
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
