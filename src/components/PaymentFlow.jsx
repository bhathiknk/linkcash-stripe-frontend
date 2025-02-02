/* PaymentFlow.jsx */

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import CheckoutForm from './CheckoutForm';
import PaymentDetails from './PaymentDetails';
import OneTimePaymentPage from './OneTimePaymentPage';

const stripePromise = loadStripe('pk_test_51QMX8zCrXpZkt7Cpt7EYqVbgNP6Lm8N1iJ389ej6Wm0UHN5jEGzo0BHZWDGzc5bw3s7GaLGhOIifHgRPpZj3dhvQ00ZSJwQUA6');

function getLinkInfoFromUrl() {
    const url = window.location.href;
    const oneTimeMatch = url.match(/\/one-time\/([^/]+)/);
    const regularMatch = url.match(/\/link\/([^/]+)/);
    if (oneTimeMatch) {
        return { linkId: oneTimeMatch[1], isOneTime: true };
    }
    if (regularMatch) {
        return { linkId: regularMatch[1], isOneTime: false };
    }
    return { linkId: null, isOneTime: false };
}

function ErrorModal({ message, onClose }) {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'white',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999,
            }}
        >
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Payment Link Unavailable</h2>
                <p style={{ marginBottom: '1rem' }}>{message}</p>
                <p style={{ marginBottom: '2rem' }}>
                    This one-time payment link has already been used. Please contact support or request a new payment link.
                </p>

            </div>
        </div>
    );
}

function PaymentFlow() {
    const [clientSecret, setClientSecret] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [isOneTime, setIsOneTime] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const { linkId, isOneTime } = getLinkInfoFromUrl();
        setIsOneTime(isOneTime);
        if (linkId) {
            fetchPaymentDetails(linkId, isOneTime);
        }
    }, []);

    const fetchPaymentDetails = async (linkId, isOneTimePayment) => {
        try {
            const apiUrl = isOneTimePayment
                ? `http://localhost:8080/api/one-time-payment-links/link/${linkId}/details`
                : `http://localhost:8080/api/payment-links/link/${linkId}/details`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData);
            }
            const data = await response.json();
            setPaymentDetails(data);
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const fetchClientSecret = async () => {
        try {
            if (paymentDetails) {
                const apiUrl = isOneTime
                    ? 'http://localhost:8080/api/one-time-transactions/initiate'
                    : 'http://localhost:8080/api/payments/initiate';
                const requestBody = isOneTime
                    ? {
                        oneTimePaymentDetailsId: paymentDetails.oneTimePaymentDetailsId,
                        userId: paymentDetails.paymentDetailUserId,
                        amount: paymentDetails.amount,
                    }
                    : {
                        paymentDetailId: paymentDetails.paymentDetailId,
                        userId: paymentDetails.paymentDetailUserId,
                        amount: paymentDetails.amount,
                    };
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to initiate payment');
                }
                const data = await response.json();
                setClientSecret(data.clientSecret);
            }
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    useEffect(() => {
        if (paymentDetails && !clientSecret) {
            fetchClientSecret();
        }
    }, [paymentDetails, clientSecret]);

    if (errorMessage) {
        return (
            <ErrorModal
                message={errorMessage}
                onClose={() => {
                    setErrorMessage('');
                    setPaymentDetails(null);
                    setClientSecret(null);
                }}
            />
        );
    }

    return (
        <div className="container py-4">
            {paymentDetails ? (
                <div className="row">
                    <div
                        className="col-12 col-md-6 d-flex flex-column justify-content-center align-items-center mb-4"
                        style={{ minHeight: '50vh' }}
                    >
                        {isOneTime ? (
                            <OneTimePaymentPage details={paymentDetails} />
                        ) : (
                            <PaymentDetails details={paymentDetails} />
                        )}
                    </div>
                    <div className="col-12 col-md-6">
                        {clientSecret ? (
                            <Elements
                                stripe={stripePromise}
                                options={{ clientSecret, appearance: { theme: 'stripe' } }}
                            >
                                <CheckoutForm
                                    onPaymentSuccess={() => navigate('/payment-status?status=success')}
                                    onPaymentError={() => navigate('/payment-status?status=error')}
                                />
                            </Elements>
                        ) : (
                            <div className="text-center mt-4">
                                <div className="spinner-border text-primary" role="status" />
                                <p>Initializing payment...</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center mt-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p>Loading payment details...</p>
                </div>
            )}
        </div>
    );
}

export default PaymentFlow;
