import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserBookings, cancelBooking } from '../services/bookings';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiMapPin, FiX, FiExternalLink } from 'react-icons/fi';
import { format } from 'date-fns';

const MyBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadBookings();
    }, [user]);

    const loadBookings = async () => {
        if (!user) return;

        setLoading(true);
        const { bookings: data, error: fetchError } = await getUserBookings(user.uid);

        if (fetchError) {
            setError(fetchError);
        } else {
            setBookings(data);
        }
        setLoading(false);
    };

    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        const { error } = await cancelBooking(bookingId);

        if (error) {
            setError(error);
            return;
        }

        setBookings(bookings.map(b =>
            b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
    };

    const filterOptions = [
        { value: 'all', label: 'All Bookings' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const statusConfig = {
        pending: { color: 'warning', label: 'Pending Approval', icon: '⏳' },
        confirmed: { color: 'success', label: 'Confirmed', icon: '✓' },
        cancelled: { color: 'error', label: 'Cancelled', icon: '✗' },
        completed: { color: 'info', label: 'Completed', icon: '★' }
    };

    const formatDate = (date) => {
        if (date?.toDate) {
            return format(date.toDate(), 'MMM dd, yyyy');
        }
        return format(new Date(date), 'MMM dd, yyyy');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your bookings...</p>
            </div>
        );
    }

    return (
        <div className="my-bookings-page">
            <div className="page-header">
                <h1>My Bookings</h1>
                <p>View and manage your vehicle rentals</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Filters */}
            <div className="bookings-filters">
                {filterOptions.map(option => (
                    <button
                        key={option.value}
                        className={`filter-btn ${filter === option.value ? 'active' : ''}`}
                        onClick={() => setFilter(option.value)}
                    >
                        {option.label}
                        {option.value !== 'all' && (
                            <span className="count">
                                {bookings.filter(b => b.status === option.value).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            <div className="bookings-content">
                {filteredBookings.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📅</span>
                        <h3>No bookings found</h3>
                        <p>{filter === 'all'
                            ? "You haven't made any bookings yet"
                            : `No ${filter} bookings`}
                        </p>
                        <Link to="/browse" className="btn btn-primary">
                            Browse Vehicles
                        </Link>
                    </div>
                ) : (
                    <div className="bookings-grid">
                        {filteredBookings.map(booking => {
                            const status = statusConfig[booking.status];

                            return (
                                <div key={booking.id} className="booking-card">
                                    <div className="booking-header">
                                        <div className="booking-image">
                                            {booking.vehicleImage ? (
                                                <img src={booking.vehicleImage} alt={booking.vehicleTitle} />
                                            ) : (
                                                <div className="no-image">🚗</div>
                                            )}
                                        </div>
                                        <div className="booking-title">
                                            <h3>{booking.vehicleTitle}</h3>
                                            <p className="owner-name">by {booking.ownerName}</p>
                                        </div>
                                        <span className={`status-badge ${status.color}`}>
                                            {status.icon} {status.label}
                                        </span>
                                    </div>

                                    <div className="booking-body">
                                        <div className="booking-dates">
                                            <FiCalendar />
                                            <span>
                                                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                                            </span>
                                        </div>

                                        <div className="booking-duration">
                                            {booking.totalDays} day{booking.totalDays !== 1 ? 's' : ''}
                                        </div>

                                        <div className="booking-price">
                                            <span className="label">Total Paid</span>
                                            <span className="amount">₹{booking.totalPrice}</span>
                                        </div>
                                    </div>

                                    <div className="booking-footer">
                                        <Link
                                            to={`/vehicle/${booking.vehicleId}`}
                                            className="btn btn-sm btn-outline"
                                        >
                                            <FiExternalLink /> View Vehicle
                                        </Link>

                                        {booking.status === 'pending' && (
                                            <button
                                                className="btn btn-sm btn-error"
                                                onClick={() => handleCancelBooking(booking.id)}
                                            >
                                                <FiX /> Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
