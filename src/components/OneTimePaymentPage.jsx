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
        </div>
    );
}

export default OneTimePaymentPage;
