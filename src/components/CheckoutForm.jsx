import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import 'bootstrap/dist/css/bootstrap.min.css';

function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
            setMessage('Stripe.js has not loaded yet. Please try again.');
            return;
        }

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {},
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message);
            setIsProcessing(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            setMessage('Payment successful! Your transaction will be processed.');
        } else {
            setMessage('Payment failed. Please try again.');
        }
        setIsProcessing(false);
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <h4 className="mb-3 text-center">Secure Payment</h4>
            <form onSubmit={handleSubmit}>
                <PaymentElement />
                <button
                    type="submit"
                    disabled={isProcessing || !stripe || !elements}
                    className="btn btn-primary w-100 mt-3"
                >
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                </button>
            </form>
            {message && (
                <div
                    className="alert mt-3"
                    style={{ color: message.includes('successful') ? 'green' : 'red' }}
                >
                    {message}
                </div>
            )}
            <small className="text-muted d-block mt-2 text-center">
                Payment methods are displayed based on your location, order amount, and currency.
            </small>
        </div>
    );
}

export default CheckoutForm;
