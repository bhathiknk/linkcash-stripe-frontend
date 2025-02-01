import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

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

    const paymentElementOptions = {
        layout: 'accordion',
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ textAlign: 'center', color: '#333' }}>Stripe Payment Test</h2>
            <form id="payment-form" onSubmit={handleSubmit}>
                <PaymentElement id="payment-element" options={paymentElementOptions} />
                <button
                    type="submit"
                    disabled={isProcessing || !stripe || !elements}
                    style={{
                        width: '100%',
                        backgroundColor: '#0070f3',
                        color: '#fff',
                        padding: '10px 0',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginTop: '20px',
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                </button>
            </form>
            {message && (
                <div
                    id="payment-message"
                    style={{
                        marginTop: '20px',
                        textAlign: 'center',
                        color: message.includes('successful') ? 'green' : 'red',
                        fontWeight: 'bold',
                    }}
                >
                    {message}
                </div>
            )}
            <div
                style={{
                    fontSize: '12px',
                    marginTop: '10px',
                    textAlign: 'center',
                    color: '#666',
                }}
            >
                Payment methods are dynamically displayed based on customer location, order amount, and currency.
            </div>
        </div>
    );
}

export default CheckoutForm;
