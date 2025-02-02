/* RegularPaymentDetails.jsx */
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function RegularPaymentDetails({ details }) {
    // Inline styles for the payment details card
    const cardStyles = {
        background: '#ffffff',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
    };

    const amountBoxStyles = {
        backgroundColor: '#dff4c8',
        color: '#0f5e00',
        border: '1px solid #c3e6cb',
        padding: '0.75rem',
        borderRadius: '0.25rem',
        marginTop: '1rem',
        fontSize: '1.2rem'
    };

    const expireBoxStyles = {
        backgroundColor: '#ffe5b4',
        color: '#d35400',
        border: '1px solid #ffeeba',
        padding: '0.75rem',
        borderRadius: '0.25rem',
        marginTop: '1rem',
        fontSize: '1rem'
    };

    if (!details) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading payment details...</p>
            </div>
        );
    }

    return (
        <div style={cardStyles}>
            <h3 className="text-primary">{details.title}</h3>
            <p className="text-secondary">{details.description}</p>
            <div style={amountBoxStyles}>
                <strong>Amount: </strong>£{details.amount}
            </div>
            {details.expireAfter && (
                <div style={expireBoxStyles}>
                    <strong>Expires After: </strong>
                    {details.expireAfter}
                </div>
            )}
        </div>
    );
}

export default RegularPaymentDetails;
