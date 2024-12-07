import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        <div className="details-container">
            <h4 className="text-primary">{details.title}</h4>
            <p className="text-secondary">{details.description}</p>
            <p>
                <strong>Amount:</strong> <span className="text-success">£{details.amount}</span>
            </p>
            <p>
                <strong>Expires After:</strong> {details.expireAfter}
            </p>
        </div>
    );
}

export default PaymentDetails;
