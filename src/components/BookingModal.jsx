import { useState } from 'react';
import { FiX, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { format, differenceInDays } from 'date-fns';

const BookingModal = ({ vehicle, isOpen, onClose, onConfirm }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const today = format(new Date(), 'yyyy-MM-dd');

    const calculateTotal = () => {
        if (!startDate || !endDate) return 0;
        const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
        return days > 0 ? days * vehicle.pricePerDay : 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            setError('End date must be after start date');
            return;
        }

        const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;

        onConfirm({
            startDate,
            endDate,
            totalDays: days,
            totalPrice: calculateTotal()
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <FiX />
                </button>

                <h2 className="modal-title">Book This Vehicle</h2>
                <p className="modal-subtitle">{vehicle.title}</p>

                <form onSubmit={handleSubmit} className="booking-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="startDate">
                                <FiCalendar /> Start Date
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                min={today}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="endDate">
                                <FiCalendar /> End Date
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                min={startDate || today}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div className="booking-summary">
                        <div className="summary-row">
                            <span>Price per day</span>
                            <span>₹{vehicle.pricePerDay}</span>
                        </div>
                        {startDate && endDate && (
                            <>
                                <div className="summary-row">
                                    <span>Number of days</span>
                                    <span>{differenceInDays(new Date(endDate), new Date(startDate)) + 1}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>₹{calculateTotal()}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                        <FiDollarSign /> Confirm Booking
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
