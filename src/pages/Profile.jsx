import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, signOut } from '../services/auth';
import { FiUser, FiMail, FiPhone, FiSave, FiLogOut } from 'react-icons/fi';

const Profile = () => {
    const navigate = useNavigate();
    const { user, userProfile } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (userProfile) {
            setFormData({
                name: userProfile.name || user?.displayName || '',
                email: userProfile.email || user?.email || '',
                phone: userProfile.phone || ''
            });
        }
    }, [userProfile, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const { error: updateError } = await updateUserProfile(user.uid, {
            name: formData.name,
            phone: formData.phone
        });

        setLoading(false);

        if (updateError) {
            setError(updateError);
            return;
        }

        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <FiUser />
                    </div>
                    <h1>{formData.name || 'User'}</h1>
                    <p>{formData.email}</p>
                </div>

                <div className="profile-card">
                    <h2>Profile Information</h2>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="name">
                                <FiUser /> Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                <FiMail /> Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="disabled"
                            />
                            <p className="form-hint">Email cannot be changed</p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">
                                <FiPhone /> Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            <FiSave /> {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                <div className="profile-card danger-zone">
                    <h2>Account Actions</h2>
                    <button
                        className="btn btn-error"
                        onClick={handleSignOut}
                    >
                        <FiLogOut /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
