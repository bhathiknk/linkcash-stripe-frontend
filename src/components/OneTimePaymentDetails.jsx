/* OneTimePaymentDetails.jsx */
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function OneTimePaymentDetails({ details }) {
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

    const importantBoxStyles = {
        backgroundColor: '#fff3cd',
        color: '#856404',
        border: '1px solid #ffeeba',
        padding: '1rem',
        borderRadius: '0.25rem',
        marginTop: '1rem'
    };

    if (!details) {
        return <p>Loading payment details...</p>;
    }

    return (
        <div style={cardStyles}>
            <h3 className="text-primary">{details.title}</h3>
            <p className="text-secondary">{details.description}</p>
            <div style={amountBoxStyles}>
                <strong>Amount: </strong>£{details.amount}
            </div>
            <div style={importantBoxStyles}>
                <strong>Important:</strong> This payment link can only be used one time.
                Once the payment is completed, this link will no longer be accessible.
            </div>
        </div>
    );
}

export default OneTimePaymentDetails;
