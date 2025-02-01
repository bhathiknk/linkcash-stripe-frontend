import React from 'react';

function OneTimePaymentPage({ details }) {
    if (!details) {
        return <p>Loading payment details...</p>;
    }

    return (
        <div>
            <h2>{details.title}</h2>
            <p>{details.description}</p>
            <p><strong>Amount:</strong> ${details.amount}</p>
        </div>
    );
}

export default OneTimePaymentPage;
