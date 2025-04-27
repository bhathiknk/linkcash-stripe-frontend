import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import stripeLogo from '../Assets/Powered by Stripe - blurple.svg';

function CheckoutForm({ onPaymentSuccess, onPaymentError }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
            setMessage('Stripe.js has not loaded yet.');
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
            setMessage('Payment successful!');
            if (onPaymentSuccess) onPaymentSuccess(paymentIntent.id);
        } else {
            setMessage('Payment failed.');
            if (onPaymentError) onPaymentError();
        }
        setIsProcessing(false);
    };

    return (
        <div>
            <h4 className="text-center mb-3 text-primary">Secure Payment</h4>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <PaymentElement />
                </div>
                <button
                    type="submit"
                    disabled={isProcessing || !stripe || !elements}
                    className="btn btn-primary w-100 fw-bold"
                >
                    {isProcessing ? 'Processing...' : 'Pay £ Now'}
                </button>
            </form>

            {message && (
                <div className={`alert mt-3 ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                </div>
            )}

            <div className="text-center mt-3">
                <img src={stripeLogo} alt="Powered by Stripe" style={{ height: '24px', verticalAlign: 'middle' }} />

            </div>
        </div>
    );
}

export default CheckoutForm;
