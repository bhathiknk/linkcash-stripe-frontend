import React from 'react';
import './PaymentDetails.css'; // Optional: Add additional custom styling
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap styles

function PaymentDetails({ details }) {
    if (!details) {
        return (
            <div className="loading-container d-flex flex-column align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading payment details...</p>
            </div>
        );
    }

    return (
        <div className="card payment-details shadow-sm">
            <div className="card-body">
                <h2 className="card-title text-primary">{details.title}</h2>
                <p className="card-text text-secondary">{details.description}</p>
                <p className="card-text">
                    <strong>Amount:</strong> <span className="text-success">${details.amount}</span>
                </p>
                <p className="card-text">
                    <strong>Expires After:</strong> {details.expireAfter}
                </p>
            </div>
        </div>
    );
}

export default PaymentDetails;
