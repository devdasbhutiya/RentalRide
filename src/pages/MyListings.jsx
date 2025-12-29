import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserVehicles, deleteVehicle, toggleVehicleAvailability } from '../services/vehicles';
import { getOwnerBookings, updateBookingStatus } from '../services/bookings';
import { useAuth } from '../context/AuthContext';
import { FiEdit2, FiTrash2, FiEye, FiPlus, FiCheck, FiX, FiClock } from 'react-icons/fi';

const MyListings = () => {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('vehicles');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user) return;

        setLoading(true);

        const [vehiclesResult, bookingsResult] = await Promise.all([
            getUserVehicles(user.uid),
            getOwnerBookings(user.uid)
        ]);

        if (vehiclesResult.error) {
            setError(vehiclesResult.error);
        } else {
            setVehicles(vehiclesResult.vehicles);
        }

        if (!bookingsResult.error) {
            setBookings(bookingsResult.bookings);
        }

        setLoading(false);
    };

    const handleToggleAvailability = async (vehicleId, currentStatus) => {
        const { error } = await toggleVehicleAvailability(vehicleId, !currentStatus);

        if (error) {
            setError(error);
            return;
        }

        setVehicles(vehicles.map(v =>
            v.id === vehicleId ? { ...v, available: !currentStatus } : v
        ));
    };

    const handleDelete = async (vehicleId) => {
        const { error } = await deleteVehicle(vehicleId);

        if (error) {
            setError(error);
            return;
        }

        setVehicles(vehicles.filter(v => v.id !== vehicleId));
        setDeleteConfirm(null);
    };

    const handleBookingAction = async (bookingId, action) => {
        const { error } = await updateBookingStatus(bookingId, action);

        if (error) {
            setError(error);
            return;
        }

        setBookings(bookings.map(b =>
            b.id === bookingId ? { ...b, status: action } : b
        ));
    };

    const typeIcons = {
        car: '🚗',
        bike: '🏍️',
        scooter: '🛵'
    };

    const statusColors = {
        pending: 'warning',
        confirmed: 'success',
        cancelled: 'error',
        completed: 'info'
    };

    const pendingBookings = bookings.filter(b => b.status === 'pending');

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your listings...</p>
            </div>
        );
    }

    return (
        <div className="my-listings-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>My Listings</h1>
                    <p>Manage your vehicles and booking requests</p>
                </div>
                <Link to="/add-vehicle" className="btn btn-primary">
                    <FiPlus /> Add Vehicle
                </Link>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'vehicles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('vehicles')}
                >
                    My Vehicles ({vehicles.length})
                </button>
                <button
                    className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    Booking Requests
                    {pendingBookings.length > 0 && (
                        <span className="badge">{pendingBookings.length}</span>
                    )}
                </button>
            </div>

            {/* Vehicles Tab */}
            {activeTab === 'vehicles' && (
                <div className="listings-content">
                    {vehicles.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">🚗</span>
                            <h3>No vehicles listed yet</h3>
                            <p>Start earning by listing your first vehicle</p>
                            <Link to="/add-vehicle" className="btn btn-primary">
                                <FiPlus /> Add Your First Vehicle
                            </Link>
                        </div>
                    ) : (
                        <div className="listings-grid">
                            {vehicles.map(vehicle => (
                                <div key={vehicle.id} className="listing-card">
                                    <div className="listing-image">
                                        {vehicle.images && vehicle.images.length > 0 ? (
                                            <img src={vehicle.images[0]} alt={vehicle.title} />
                                        ) : (
                                            <div className="no-image">
                                                <span>{typeIcons[vehicle.type]}</span>
                                            </div>
                                        )}
                                        <span className={`status-badge ${vehicle.available ? 'available' : 'unavailable'}`}>
                                            {vehicle.available ? 'Available' : 'Unavailable'}
                                        </span>
                                    </div>

                                    <div className="listing-content">
                                        <h3>{vehicle.title}</h3>
                                        <p className="listing-meta">{vehicle.brand} • {vehicle.location}</p>
                                        <p className="listing-price">₹{vehicle.pricePerDay}/day</p>

                                        <div className="listing-actions">
                                            <Link to={`/vehicle/${vehicle.id}`} className="btn btn-sm btn-outline">
                                                <FiEye /> View
                                            </Link>
                                            <button
                                                className={`btn btn-sm ${vehicle.available ? 'btn-warning' : 'btn-success'}`}
                                                onClick={() => handleToggleAvailability(vehicle.id, vehicle.available)}
                                            >
                                                {vehicle.available ? 'Mark Unavailable' : 'Mark Available'}
                                            </button>
                                            <button
                                                className="btn btn-sm btn-error"
                                                onClick={() => setDeleteConfirm(vehicle.id)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Delete Confirmation Modal */}
                                    {deleteConfirm === vehicle.id && (
                                        <div className="delete-modal">
                                            <p>Delete this listing?</p>
                                            <div className="modal-actions">
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => setDeleteConfirm(null)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-error"
                                                    onClick={() => handleDelete(vehicle.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
                <div className="bookings-content">
                    {bookings.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📅</span>
                            <h3>No booking requests yet</h3>
                            <p>Booking requests for your vehicles will appear here</p>
                        </div>
                    ) : (
                        <div className="bookings-list">
                            {bookings.map(booking => (
                                <div key={booking.id} className="booking-card">
                                    <div className="booking-vehicle">
                                        <h4>{booking.vehicleTitle}</h4>
                                        <span className={`status-badge ${statusColors[booking.status]}`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="booking-details">
                                        <p><strong>Renter:</strong> {booking.renterName}</p>
                                        <p>
                                            <strong>Dates:</strong>{' '}
                                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                        </p>
                                        <p><strong>Total:</strong> ₹{booking.totalPrice}</p>
                                    </div>

                                    {booking.status === 'pending' && (
                                        <div className="booking-actions">
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                            >
                                                <FiCheck /> Confirm
                                            </button>
                                            <button
                                                className="btn btn-sm btn-error"
                                                onClick={() => handleBookingAction(booking.id, 'cancelled')}
                                            >
                                                <FiX /> Decline
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyListings;
