import { Link } from 'react-router-dom';
import { FiMapPin, FiStar } from 'react-icons/fi';

const VehicleCard = ({ vehicle }) => {
    const { id, title, type, brand, pricePerDay, location, images, available } = vehicle;

    const typeIcons = {
        car: '🚗',
        bike: '🏍️',
        scooter: '🛵'
    };

    return (
        <Link to={`/vehicle/${id}`} className="vehicle-card">
            <div className="vehicle-card-image">
                {images && images.length > 0 ? (
                    <img src={images[0]} alt={title} loading="lazy" />
                ) : (
                    <div className="no-image">
                        <span>{typeIcons[type] || '🚗'}</span>
                    </div>
                )}
                <span className={`availability-badge ${available ? 'available' : 'unavailable'}`}>
                    {available ? 'Available' : 'Unavailable'}
                </span>
                <span className="type-badge">{typeIcons[type]} {type}</span>
            </div>

            <div className="vehicle-card-content">
                <h3 className="vehicle-title">{title}</h3>
                <p className="vehicle-brand">{brand}</p>

                <div className="vehicle-meta">
                    <span className="vehicle-location">
                        <FiMapPin /> {location}
                    </span>
                </div>

                <div className="vehicle-footer">
                    <span className="vehicle-price">
                        <strong>₹{pricePerDay}</strong>
                        <span>/day</span>
                    </span>
                    <button className="btn btn-sm btn-primary">View Details</button>
                </div>
            </div>
        </Link>
    );
};

export default VehicleCard;
