/* components/OneTimePaymentPage.jsx */

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function OneTimePaymentPage({ details }) {
    if (!details) {
        return <p>Loading payment details...</p>;
    }

    return (
        <div className="text-center">
            <h3 className="text-primary">{details.title}</h3>
            <p className="text-secondary">{details.description}</p>
            <p>
                <strong>Amount: </strong>
                <span className="text-success">£{details.amount}</span>
            </p>
            <div
                className="p-3 mt-3 rounded"
                style={{
                    backgroundColor: '#fff3cd',
                    color: '#ff0202',
                    border: '1px solid #ffeeba'
                }}
            >
                <strong>Important:</strong> This payment link can only be used one time.
                Once the payment is completed, this link will no longer be accessible.
            </div>
        </div>
    );
}

export default OneTimePaymentPage;
