import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate, useParams } from 'react-router-dom';
import CheckoutForm from './CheckoutForm';
import RegularPaymentDetails from '../PaymentDetailsPages/RegularPaymentDetails';
import 'bootstrap/dist/css/bootstrap.min.css';

const stripePromise = loadStripe('pk_test_51QMX8zCrXpZkt7Cpt7EYqVbgNP6Lm8N1iJ389ej6Wm0UHN5jEGzo0BHZWDGzc5bw3s7GaLGhOIifHgRPpZj3dhvQ00ZSJwQUA6');

function PaymentFlowRegular() {
    const { linkId } = useParams();
    const navigate = useNavigate();

    const [clientSecret, setClientSecret] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (linkId) {
            fetchPaymentDetails(linkId);
        }
    }, [linkId]);

    const fetchPaymentDetails = async (linkId) => {
        try {
            const apiUrl = `http://localhost:8080/api/payment-links/link/${linkId}/details`;
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData);
            }
            const data = await response.json();
            console.log('Fetched Regular Payment Details:', data);
            setPaymentDetails(data);
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    useEffect(() => {
        if (paymentDetails && !clientSecret) {
            const payload = {
                paymentDetailId: paymentDetails.paymentDetailId,
                userId: paymentDetails.paymentDetailUserId,
                amount: paymentDetails.amount,
            };
            fetchClientSecret('regular', payload);
        }
    }, [paymentDetails, clientSecret]);

    const fetchClientSecret = async (paymentType, payload) => {
        try {
            const apiUrl = 'http://localhost:8080/api/transactions/initiate';
            const requestBody = { paymentType, ...payload };

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
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
    };

    return (
        <div style={containerStyle}>
            {errorMessage ? (
                <div className="alert alert-danger" role="alert">
                    <h2>Payment Link Unavailable</h2>
                    <p>{errorMessage}</p>
                    <button className="btn btn-primary" onClick={() => setErrorMessage('')}>
                        Close
                    </button>
                </div>
            ) : paymentDetails ? (
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
                            <RegularPaymentDetails details={paymentDetails} />
                        </div>
                        <div className="col-12 col-md-6">
                            {clientSecret ? (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <CheckoutForm
                                        onPaymentSuccess={() => navigate(`/regular-success/${linkId}`)}
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
                </div>
            ) : (
                <div className="text-center mt-5">
                    <p>Loading payment details...</p>
                </div>
            )}
        </div>
    );
}

export default PaymentFlowRegular;
