/* CheckoutForm.jsx */
import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import stripeLogo from './Assets/Powered by Stripe - blurple.svg'; // Ensure this file exists in your assets folder

function CheckoutForm({ onPaymentSuccess, onPaymentError }) {
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
            redirect: 'if_required'
        });

        if (error) {
            setMessage(error.message);
            setIsProcessing(false);
            if (onPaymentError) onPaymentError();
            return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            setMessage('Payment successful! Your transaction will be processed.');
            if (onPaymentSuccess) onPaymentSuccess();
        } else {
            setMessage('Payment failed. Please try again.');
            if (onPaymentError) onPaymentError();
        }
        setIsProcessing(false);
    };

    // Inline styles for CheckoutForm container and payment element wrapper
    const checkoutFormWrapperStyles = {
        background: '#ffffff',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
    };

    const paymentElementWrapperStyles = {
        marginBottom: '1rem'
    };

    return (
        <div style={checkoutFormWrapperStyles}>
            <h4 className="text-center mb-3">Secure Payment</h4>
            <form onSubmit={handleSubmit}>
                <div style={paymentElementWrapperStyles} className="mb-3">
                    <PaymentElement />
                </div>
                <button
                    type="submit"
                    disabled={isProcessing || !stripe || !elements}
                    className="btn btn-primary w-100"
                >
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                </button>
            </form>

            {message && (
                <div
                    className={`alert mt-3 ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}
                >
                    {message}
                </div>
            )}

            <small className="text-muted d-block text-center mt-2">
                Payment methods vary by location and amount.
            </small>

            <div className="text-center mt-3">
                <img
                    src={stripeLogo}
                    alt="Powered by Stripe"
                    style={{ height: '24px', verticalAlign: 'middle' }}
                />
            </div>
        </div>
    );
}

export default CheckoutForm;
