import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate, useParams } from 'react-router-dom';
import CheckoutForm from './CheckoutForm';
import OneTimePaymentDetails from '../PaymentDetailsPages/OneTimePaymentDetails';
import 'bootstrap/dist/css/bootstrap.min.css';

const stripePromise = loadStripe(
    'pk_test_51QMX8zCrXpZkt7Cpt7EYqVbgNP6Lm8N1iJ389ej6Wm0UHN5jEGzo0BHZWDGzc5bw3s7GaLGhOIifHgRPpZj3dhvQ00ZSJwQUA6'
);

export default function PaymentFlowOneTime() {
    const { linkId } = useParams();
    const navigate = useNavigate();

    const [clientSecret, setClientSecret] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    // 1) Fetch the “link details” (title, amount, used flag, etc.)
    useEffect(() => {
        if (!linkId) return;
        const fetchPaymentDetails = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8080/api/one-time-payment-links/link/${linkId}/details`
                );
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || 'Failed to load payment link');
                }
                const data = await res.json();
                setPaymentDetails(data);
            } catch (err) {
                setErrorMessage(err.message);
            }
        };
        fetchPaymentDetails();
    }, [linkId]);

    // 2) Once we have the details (and clientSecret not yet set), ask the backend to
    //    create a new PaymentIntent for this one-time payment.
    useEffect(() => {
        if (!paymentDetails || clientSecret) return;
        // if it’s already been used, bail out
        if (paymentDetails.used) return;

        const fetchClientSecret = async () => {
            try {
                const payload = {
                    paymentType: 'oneTime',
                    oneTimePaymentDetailsId: paymentDetails.oneTimePaymentDetailsId,
                    userId: paymentDetails.paymentDetailUserId,
                    amount: paymentDetails.amount,
                };
                const res = await fetch('http://localhost:8080/api/transactions/initiate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                if (!res.ok) {
                    throw new Error(json.error || 'Failed to initiate payment');
                }
                setClientSecret(json.clientSecret);
            } catch (err) {
                setErrorMessage(err.message);
            }
        };

        fetchClientSecret();
    }, [paymentDetails, clientSecret]);

    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
    };

    if (errorMessage) {
        return (
            <div style={containerStyle}>
                <div className="alert alert-danger w-100 text-center">
                    <h2>Payment Link Unavailable</h2>
                    <p>{errorMessage}</p>
                    <button className="btn btn-primary" onClick={() => setErrorMessage('')}>
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (!paymentDetails) {
        return (
            <div style={containerStyle}>
                <div className="text-center mt-5">
                    <p>Loading payment details…</p>
                </div>
            </div>
        );
    }

    // If it’s already been used, don’t even show the form
    if (paymentDetails.used) {
        return (
            <div style={containerStyle}>
                <div className="card shadow text-center p-4">
                    <h4 className="text-danger">This one-time payment link has already been used.</h4>
                    <p>It’s no longer valid for a second transaction.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div
                className="card shadow"
                style={{
                    border: 'none',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    maxWidth: '900px',
                    width: '100%',
                }}
            >
                <div className="card-body row">
                    <div className="col-12 col-md-6 mb-4 mb-md-0">
                        <OneTimePaymentDetails details={paymentDetails} />
                    </div>
                    <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                        {clientSecret ? (
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <CheckoutForm
                                    // on success, redirect to /one-time-success/:linkId
                                    onPaymentSuccess={() => navigate(`/one-time-success/${linkId}`)}
                                    onPaymentError={() => navigate('/payment-status?status=error')}
                                />
                            </Elements>
                        ) : (
                            <div className="text-center">
                                <div className="spinner-border text-primary" role="status" />
                                <p className="mt-3">Initializing payment…</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
