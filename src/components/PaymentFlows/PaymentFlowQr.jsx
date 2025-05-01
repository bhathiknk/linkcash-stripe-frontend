import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import QRpaymentDetails from '../PaymentDetailsPages/QRpaymentDetails';
import { FaLock, FaStore } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const stripePromise = loadStripe('pk_test_51QMX8zCrXpZkt7Cpt7EYqVbgNP6Lm8N1iJ389ej6Wm0UHN5jEGzo0BHZWDGzc5bw3s7GaLGhOIifHgRPpZj3dhvQ00ZSJwQUA6');

function PaymentFlowQr() {
    const { qrCode } = useParams();
    const navigate = useNavigate();

    const [shopData, setShopData] = useState(null);
    const [billData, setBillData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [clientSecret, setClientSecret] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false); // NEW

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/shops/qrcode/${qrCode}`);
                if (!response.ok) throw new Error(await response.text());
                const data = await response.json();
                setShopData(data);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setLoading(false);
            }
        };
        if (qrCode) fetchShopData();
    }, [qrCode]);

    const handleFetchBill = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/bills/${pin}`);
            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();
            setBillData(data);
            setShowPinModal(false);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    useEffect(() => {
        if (billData && !clientSecret && shopData) {
            const payload = {
                paymentType: 'shop',
                shopId: shopData.shopId,
                billId: billData.billId,
                amount: billData.total
            };
            fetchClientSecret(payload);
        }
    }, [billData, clientSecret, shopData]);

    const fetchClientSecret = async (payload) => {
        try {
            const response = await fetch('http://localhost:8080/api/transactions/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Failed to initiate payment');
            const data = await response.json();
            setClientSecret(data.clientSecret);
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handlePaymentSuccess = () => {
        setPaymentProcessing(true); // show loader
        setTimeout(() => {
            navigate(`/payment-success?billId=${billData.billId}`);
        }, 5000); // wait 5 seconds
    };

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 gradient-bg">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3 text-muted">Loading shop data...</p>
            </div>
        );
    }

    if (paymentProcessing) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 gradient-bg">
                <div className="spinner-border text-success" role="status" />
                <p className="mt-3 fw-semibold text-white">Finalizing payment…</p>
            </div>
        );
    }

    if (errorMessage && !shopData) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 gradient-bg">
                <div className="alert alert-danger text-center" style={{ maxWidth: '600px' }}>
                    <h4>Error</h4>
                    <p>{errorMessage}</p>
                </div>
            </div>
        );
    }

    const renderPaymentFlow = () => {
        if (errorMessage && !billData) {
            return (
                <div className="alert alert-danger text-center" style={{ maxWidth: '600px' }}>
                    {errorMessage}
                </div>
            );
        }

        if (!billData) return null;

        if (billData.status === 'PAID') {
            return (
                <div className="card shadow-lg text-center p-4" style={{ borderRadius: '1rem' }}>
                    <h4 className="text-danger">This Bill is already paid.</h4>
                </div>
            );
        }

        return (
            <div className="card shadow-lg p-4" style={{ borderRadius: '1rem', maxWidth: '600px', width: '100%' }}>
                <div className="mb-4">
                    <QRpaymentDetails billData={billData} shopData={shopData} />
                </div>
                {clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm
                            onPaymentSuccess={handlePaymentSuccess}
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
        );
    };

    return (
        <div
            className="gradient-bg d-flex flex-column justify-content-center align-items-center min-vh-100 px-3"
            style={{ paddingTop: '2rem', paddingBottom: '2rem' }}
        >
            <div className="blob d-none d-sm-block" />

            <div className="card shadow-lg mb-4 text-center p-4" style={{ borderRadius: '1.5rem', maxWidth: '600px', width: '100%' }}>
                <FaStore size={30} className="text-primary mb-3" />
                <h3 className="text-dark fw-bold">Shop Information</h3>
                <ul className="list-group list-group-flush mt-3 text-start">
                    <li className="list-group-item bg-transparent"><strong>Shop ID:</strong> {shopData.shopId}</li>
                    <li className="list-group-item bg-transparent"><strong>Shop Name:</strong> {shopData.shopName}</li>
                    <li className="list-group-item bg-transparent"><strong>Address:</strong> {shopData.address}</li>
                </ul>
                <div className="mt-4">
                    <button
                        className="btn btn-primary btn-lg px-4"
                        onClick={() => {
                            setShowPinModal(true);
                            setPin('');
                            setBillData(null);
                            setErrorMessage('');
                        }}
                    >
                        <FaLock className="me-2" />
                        Enter Bill PIN to Pay
                    </button>
                </div>
            </div>

            {renderPaymentFlow()}

            {showPinModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999
                    }}
                >
                    <div className="card shadow-lg" style={{ width: 400, padding: '2rem', borderRadius: '1rem' }}>
                        <h4 className="mb-4 text-center text-primary fw-bold">Enter Bill PIN</h4>
                        <input
                            type="text"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="form-control mb-3"
                            placeholder="e.g. 123456"
                        />
                        <div className="d-flex justify-content-end">
                            <button className="btn btn-outline-secondary me-2" onClick={() => setShowPinModal(false)}>Cancel</button>
                            <button className="btn btn-success" onClick={handleFetchBill}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .gradient-bg {
                    background: linear-gradient(135deg, #83B6B9 0%, #E3F2FD 50%, #0054FF 100%);
                    animation: bgFade 1.2s both;
                }
                @keyframes bgFade {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .blob {
                    position: absolute;
                    width: 65vw;
                    max-width: 500px;
                    height: 65vw;
                    max-height: 500px;
                    background: radial-gradient(circle at 30% 30%, #ffffff55 0%, #ffffff00 70%);
                    filter: blur(80px);
                    animation: blobFloat 14s ease-in-out infinite alternate;
                }
                @keyframes blobFloat {
                    from { transform: translate(-25%, -35%) scale(1); }
                    to { transform: translate(15%, 10%) scale(1.15); }
                }
                @media (max-width: 576px) {
                    .blob { display: none; }
                }
            `}</style>
        </div>
    );
}

export default PaymentFlowQr;
