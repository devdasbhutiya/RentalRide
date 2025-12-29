import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3 className="footer-logo">
                        <span className="logo-icon">🚗</span>
                        RentRide
                    </h3>
                    <p className="footer-description">
                        Find and rent the perfect vehicle for your journey.
                        From cars to bikes to scooters, we've got you covered.
                    </p>
                    <div className="social-links">
                        <a href="#" className="social-link"><FiFacebook /></a>
                        <a href="#" className="social-link"><FiTwitter /></a>
                        <a href="#" className="social-link"><FiInstagram /></a>
                    </div>
                </div>

                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul className="footer-links">
                        <li><Link to="/browse">Browse Vehicles</Link></li>
                        <li><Link to="/add-vehicle">List Your Vehicle</Link></li>
                        <li><Link to="/my-bookings">My Bookings</Link></li>
                        <li><Link to="/profile">My Profile</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Vehicle Types</h4>
                    <ul className="footer-links">
                        <li><Link to="/browse?type=car">Cars</Link></li>
                        <li><Link to="/browse?type=bike">Bikes</Link></li>
                        <li><Link to="/browse?type=scooter">Scooters</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Contact Us</h4>
                    <ul className="footer-contact">
                        <li><FiMail /> hirenrajodiya2121@gmail.com</li>
                        <li><FiPhone /> +91 8140503644</li>
                        <li><FiMapPin /> 1 samadhan society Ahmedabad</li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} RentRide. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
