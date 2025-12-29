import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVehicleById, updateVehicle } from '../services/vehicles';
import { useAuth } from '../context/AuthContext';
import { FiUpload, FiX, FiPlus, FiCheck } from 'react-icons/fi';

const EditVehicle = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        type: 'car',
        title: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        description: '',
        pricePerDay: '',
        location: '',
        available: true,
        features: []
    });

    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [newFeature, setNewFeature] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadVehicle();
    }, [id]);

    const loadVehicle = async () => {
        const { vehicle, error } = await getVehicleById(id);

        if (error || !vehicle) {
            setError(error || 'Vehicle not found');
            setLoading(false);
            return;
        }

        // Check if user owns this vehicle
        if (vehicle.ownerId !== user.uid) {
            setError('You do not have permission to edit this vehicle');
            setLoading(false);
            return;
        }

        setFormData({
            type: vehicle.type || 'car',
            title: vehicle.title || '',
            brand: vehicle.brand || '',
            model: vehicle.model || '',
            year: vehicle.year || new Date().getFullYear(),
            description: vehicle.description || '',
            pricePerDay: vehicle.pricePerDay || '',
            location: vehicle.location || '',
            available: vehicle.available !== undefined ? vehicle.available : true,
            features: vehicle.features || []
        });

        setExistingImages(vehicle.images || []);
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (existingImages.length + newImages.length + files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        setNewImages(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const addFeature = () => {
        if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (feature) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter(f => f !== feature)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        if (!formData.title || !formData.brand || !formData.pricePerDay || !formData.location) {
            setError('Please fill in all required fields');
            setSaving(false);
            return;
        }

        const vehicleData = {
            ...formData,
            pricePerDay: Number(formData.pricePerDay),
            year: Number(formData.year),
            images: existingImages // Keep existing images
        };

        const { error: updateError } = await updateVehicle(id, vehicleData, newImages);

        setSaving(false);

        if (updateError) {
            setError(updateError);
            return;
        }

        setSuccess(true);
        setTimeout(() => {
            navigate('/my-listings');
        }, 2000);
    };

    const vehicleTypes = [
        { value: 'car', icon: '🚗', label: 'Car' },
        { value: 'bike', icon: '🏍️', label: 'Bike' },
        { value: 'scooter', icon: '🛵', label: 'Scooter' }
    ];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading vehicle details...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="success-page">
                <div className="success-content">
                    <div className="success-icon">
                        <FiCheck />
                    </div>
                    <h2>Vehicle Updated Successfully!</h2>
                    <p>Your changes have been saved</p>
                </div>
            </div>
        );
    }

    return (
        <div className="add-vehicle-page">
            <div className="page-header">
                <h1>Edit Your Vehicle</h1>
                <p>Update the details of your vehicle listing</p>
            </div>

            <form onSubmit={handleSubmit} className="add-vehicle-form">
                {error && <div className="alert alert-error">{error}</div>}

                {/* Vehicle Type */}
                <div className="form-section">
                    <h3>Vehicle Type</h3>
                    <div className="type-selector">
                        {vehicleTypes.map(type => (
                            <label
                                key={type.value}
                                className={`type-option ${formData.type === type.value ? 'selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="type"
                                    value={type.value}
                                    checked={formData.type === type.value}
                                    onChange={handleChange}
                                />
                                <span className="type-icon">{type.icon}</span>
                                <span className="type-label">{type.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Images */}
                <div className="form-section">
                    <h3>Images</h3>
                    <div className="image-upload-area">
                        <div className="image-previews">
                            {/* Existing images */}
                            {existingImages.map((image, index) => (
                                <div key={`existing-${index}`} className="image-preview">
                                    <img src={image} alt={`Existing ${index + 1}`} />
                                    <button
                                        type="button"
                                        className="remove-image"
                                        onClick={() => removeExistingImage(index)}
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ))}

                            {/* New image previews */}
                            {newImagePreviews.map((preview, index) => (
                                <div key={`new-${index}`} className="image-preview">
                                    <img src={preview} alt={`New ${index + 1}`} />
                                    <button
                                        type="button"
                                        className="remove-image"
                                        onClick={() => removeNewImage(index)}
                                    >
                                        <FiX />
                                    </button>
                                    <span className="new-badge">New</span>
                                </div>
                            ))}

                            {existingImages.length + newImages.length < 5 && (
                                <label className="upload-btn">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleNewImageChange}
                                        hidden
                                    />
                                    <FiUpload />
                                    <span>Upload</span>
                                </label>
                            )}
                        </div>
                        <p className="upload-hint">Upload up to 5 images total (First image will be the cover)</p>
                    </div>
                </div>

                {/* Basic Info */}
                <div className="form-section">
                    <h3>Basic Information</h3>

                    <div className="form-group">
                        <label htmlFor="title">Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Royal Enfield Classic 350"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="brand">Brand *</label>
                            <input
                                type="text"
                                id="brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="e.g., Royal Enfield"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="model">Model</label>
                            <input
                                type="text"
                                id="model"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                placeholder="e.g., Classic 350"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="year">Year</label>
                            <input
                                type="number"
                                id="year"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                min="1990"
                                max={new Date().getFullYear() + 1}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your vehicle, its condition, any special features..."
                            rows="4"
                        />
                    </div>
                </div>

                {/* Pricing & Location */}
                <div className="form-section">
                    <h3>Pricing & Location</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="pricePerDay">Price per Day (₹) *</label>
                            <input
                                type="number"
                                id="pricePerDay"
                                name="pricePerDay"
                                value={formData.pricePerDay}
                                onChange={handleChange}
                                placeholder="500"
                                min="1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">Location *</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g., Mumbai, Maharashtra"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="available"
                                checked={formData.available}
                                onChange={handleChange}
                            />
                            <span>Available for rent immediately</span>
                        </label>
                    </div>
                </div>

                {/* Features */}
                <div className="form-section">
                    <h3>Features</h3>

                    <div className="features-input">
                        <input
                            type="text"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Add a feature (e.g., ABS, Helmet included)"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        />
                        <button type="button" className="btn btn-outline" onClick={addFeature}>
                            <FiPlus /> Add
                        </button>
                    </div>

                    {formData.features.length > 0 && (
                        <div className="features-list">
                            {formData.features.map((feature, index) => (
                                <span key={index} className="feature-tag">
                                    {feature}
                                    <button type="button" onClick={() => removeFeature(feature)}>
                                        <FiX />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => navigate('/my-listings')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Update Vehicle'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditVehicle;
