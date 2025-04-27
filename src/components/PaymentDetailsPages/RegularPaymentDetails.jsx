import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function RegularPaymentDetails({ details }) {
    return (
        <div className="text-center">
            <h3 className="text-primary fw-bold mb-3">{details.title}</h3>
            <p className="text-muted small">{details.description}</p>
            <div className="bg-light rounded p-3 mt-4">
                <h5 className="text-dark mb-0">Amount</h5>
                <h2 className="text-success fw-bold mt-2">£{details.amount}</h2>
            </div>
            {details.expireAfter && (
                <div className="bg-warning-subtle rounded p-2 mt-3">
                    <p className="text-warning m-0"><strong>Expires:</strong> {details.expireAfter}</p>
                </div>
            )}
        </div>
    );
}

export default RegularPaymentDetails;
