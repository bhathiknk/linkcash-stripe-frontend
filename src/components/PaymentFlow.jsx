import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import CheckoutForm from './PaymentFlows/CheckoutForm';
import RegularPaymentDetails from './PaymentDetailsPages/RegularPaymentDetails';
import OneTimePaymentDetails from './PaymentDetailsPages/OneTimePaymentDetails';
import GroupPaymentDetails from './PaymentDetailsPages/GroupPaymentDetails';
import 'bootstrap/dist/css/bootstrap.min.css';

const stripePromise = loadStripe('pk_test_51QMX8zCrXpZkt7Cpt7EYqVbgNP6Lm8N1iJ389ej6Wm0UHN5jEGzo0BHZWDGzc5bw3s7GaLGhOIifHgRPpZj3dhvQ00ZSJwQUA6');

function getLinkInfoFromUrl() {
    const url = window.location.href;
    const oneTimeMatch = url.match(/\/one-time\/([^/]+)/);
    const regularMatch = url.match(/\/link\/([^/]+)/);
    const groupMatch = url.match(/\/group-payment\/([^/]+)/);

    if (oneTimeMatch) return { linkId: oneTimeMatch[1], isOneTime: true, isGroup: false };
    if (regularMatch) return { linkId: regularMatch[1], isOneTime: false, isGroup: false };
    if (groupMatch) return { linkId: groupMatch[1], isOneTime: false, isGroup: true };

    return { linkId: null, isOneTime: false, isGroup: false };
}

function ErrorModal({ message, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(255,255,255,0.95)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
        }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h2 className="mb-3">Payment Link Unavailable</h2>
                <p className="mb-5" style={{ color: 'red' }}>{message}</p>
                <button className="btn btn-primary" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

function PaymentFlow() {
    const [clientSecret, setClientSecret] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [isOneTime, setIsOneTime] = useState(false);
    const [isGroup, setIsGroup] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const { linkId, isOneTime, isGroup } = getLinkInfoFromUrl();
        setIsOneTime(isOneTime);
        setIsGroup(isGroup);
        if (linkId) {
            fetchPaymentDetails(linkId, isOneTime, isGroup);
        }
    }, []);

    const fetchPaymentDetails = async (linkId, isOneTimePayment, isGroupPayment) => {
        try {
            const apiUrl = isGroupPayment
                ? `http://localhost:8080/api/group-payment-links/link/${linkId}/details`
                : isOneTimePayment
                    ? `http://localhost:8080/api/one-time-payment-links/link/${linkId}/details`
                    : `http://localhost:8080/api/payment-links/link/${linkId}/details`;

            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData);
            }
            const data = await response.json();
            console.log("Fetched Payment Details:", data);
            setPaymentDetails(data);
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const fetchClientSecret = async (paymentType, payload) => {
        try {
            const apiUrl = 'http://localhost:8080/api/transactions/initiate';
            const requestBody = { paymentType, ...payload };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
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

    useEffect(() => {
        if (paymentDetails && !clientSecret && !isGroup) {
            const payload = isOneTime
                ? {
                    oneTimePaymentDetailsId: paymentDetails.oneTimePaymentDetailsId,
                    userId: paymentDetails.paymentDetailUserId,
                    amount: paymentDetails.amount
                }
                : {
                    paymentDetailId: paymentDetails.paymentDetailId,
                    userId: paymentDetails.paymentDetailUserId,
                    amount: paymentDetails.amount
                };
            fetchClientSecret(isOneTime ? 'oneTime' : 'regular', payload);
        }
    }, [paymentDetails, clientSecret, isGroup, isOneTime]);

    useEffect(() => {
        if (selectedMember && isGroup) {
            fetchClientSecret('group', {
                groupPaymentId: paymentDetails.groupPaymentId,
                memberPaymentId: selectedMember.memberPaymentId,
                amount: selectedMember.assignedAmount
            });
        }
    }, [selectedMember]);

    const renderPaymentDetails = () => {
        if (isOneTime) return <OneTimePaymentDetails details={paymentDetails} />;
        if (isGroup)
            return (
                <GroupPaymentDetails
                    details={paymentDetails}
                    selectedMember={selectedMember}
                    onSelectMember={(member) => {
                        setSelectedMember(member);
                    }}
                />
            );
        return <RegularPaymentDetails details={paymentDetails} />;
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem'
        }}>
            {errorMessage ? (
                <ErrorModal message={errorMessage} onClose={() => setErrorMessage('')} />
            ) : paymentDetails ? (
                <div className="card shadow" style={{
                    border: 'none',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    maxWidth: '900px',
                    width: '100%'
                }}>
                    <div className="card-body row">
                        <div className="col-12 col-md-6 mb-4 mb-md-0">
                            {renderPaymentDetails()}
                        </div>
                        <div className="col-12 col-md-6">
                            {isGroup && paymentDetails.isCompleted ? (
                                <div className="text-center mt-4">
                                    <h4 className="text-success">Group Payment Complete</h4>
                                    <p>All members have completed their payments.</p>
                                </div>
                            ) : (
                                clientSecret ? (
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <CheckoutForm
                                            onPaymentSuccess={() => navigate('/payment-status?status=success')}
                                            onPaymentError={() => navigate('/payment-status?status=error')}
                                        />
                                    </Elements>
                                ) : (
                                    <div className="text-center mt-4">
                                        {isGroup && !selectedMember ? (
                                            <p>Please select your name to proceed with payment.</p>
                                        ) : (
                                            <div>
                                                <div className="spinner-border text-primary" role="status" />
                                                <p>Initializing payment...</p>
                                            </div>
                                        )}
                                    </div>
                                )
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

export default PaymentFlow;
