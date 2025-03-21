import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import QRpaymentDetails from '../PaymentDetailsPages/QRpaymentDetails';
import 'bootstrap/dist/css/bootstrap.min.css';

// Use your actual publishable Stripe key here
const stripePromise = loadStripe('pk_test_51QMX8zCrXpZkt7Cpt7EYqVbgNP6Lm8N1iJ389ej6Wm0UHN5jEGzo0BHZWDGzc5bw3s7GaLGhOIifHgRPpZj3dhvQ00ZSJwQUA6');

function PaymentFlowQr() {
    const { qrCode } = useParams();
    const navigate = useNavigate();

    // Shop & Bill states
    const [shopData, setShopData] = useState(null);
    const [billData, setBillData] = useState(null);

    // UI states
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // For PIN modal
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');

    // Stripe states
    const [clientSecret, setClientSecret] = useState(null);

    // 1) Fetch the Shop data by qrCode
    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/shops/qrcode/${qrCode}`);
                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(errText || 'Failed to fetch shop data.');
                }
                const data = await response.json();
                setShopData(data);
            } catch (error) {
                setErrorMessage(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (qrCode) {
            fetchShopData();
        }
    }, [qrCode]);

    // 2) Fetch the Bill data by PIN
    const handleFetchBill = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/bills/${pin}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to fetch bill data.');
            }
            const data = await response.json();
            setBillData(data);
            setShowPinModal(false);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    // 3) Once we have the Bill, fetch Stripe's clientSecret using the "shop" payment flow
    useEffect(() => {
        if (billData && !clientSecret && shopData) {
            // Build the payload for your backend's /api/transactions/initiate
            // Using "paymentType: shop"
            const payload = {
                paymentType: 'shop',
                shopId: shopData.shopId,    // from the shop data
                billId: billData.billId,
                amount: billData.total
            };
            fetchClientSecret(payload);
        }
    }, [billData, clientSecret, shopData]);

    const fetchClientSecret = async (payload) => {
        try {
            const apiUrl = 'http://localhost:8080/api/transactions/initiate';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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

    // 4) Main UI

    // Loading or error for shop
    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3 text-muted">Loading shop data...</p>
            </div>
        );
    }
    if (errorMessage && !shopData) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <div className="alert alert-danger text-center" style={{ maxWidth: '600px' }}>
                    <h4>Error</h4>
                    <p>{errorMessage}</p>
                </div>
            </div>
        );
    }
    if (!shopData) {
        return (
            <div className="text-center" style={{ minHeight: '100vh', padding: '2rem' }}>
                <p>No shop data found.</p>
            </div>
        );
    }

    // If no bill yet, user must click "Pay for Bill" and enter PIN
    // Once bill is loaded, show the details & potential payment flow
    const renderPaymentFlow = () => {
        // If we have an error while fetching the Bill, show an alert (billData === null)
        if (errorMessage && !billData) {
            return (
                <div className="alert alert-danger" style={{ maxWidth: '600px' }}>
                    {errorMessage}
                </div>
            );
        }

        // If we haven't fetched a Bill yet, just show nothing or a helpful note
        if (!billData) {
            return null; // or <p>Please enter PIN to retrieve Bill</p>
        }

        // If Bill is found, check if it's used or paid, etc. (optional)
        // For now, we let them proceed if "status" = PENDING
        if (billData.status === 'PAID') {
            return (
                <div className="card shadow text-center p-4">
                    <h4 className="text-danger">This Bill is already paid.</h4>
                </div>
            );
        }

        // If not paid => display the Bill UI and the Stripe form
        return (
            <div
                className="card shadow"
                style={{
                    border: 'none',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    maxWidth: '900px',
                    width: '100%',
                    marginBottom: '2rem'
                }}
            >
                <div className="card-body row">
                    {/* Left Column: Bill & Shop details */}
                    <div className="col-12 col-md-6 mb-4 mb-md-0">
                        <QRpaymentDetails billData={billData} shopData={shopData} />
                    </div>

                    {/* Right Column: Stripe Payment */}
                    <div className="col-12 col-md-6">
                        {clientSecret ? (
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <CheckoutForm
                                    onPaymentSuccess={() => navigate(`/payment-success?billId=${billData.billId}`)}
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
        );
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '2rem'
            }}
        >
            {/* ---------- SHOP INFO CARD ---------- */}
            <div
                className="card shadow mb-4"
                style={{ border: 'none', borderRadius: '1rem', overflow: 'hidden', maxWidth: '600px', width: '100%' }}
            >
                <div className="card-body">
                    <h2 className="card-title text-primary mb-4 text-center">Shop Information</h2>
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                            <strong>Shop ID:</strong> {shopData.shopId}
                        </li>
                        <li className="list-group-item">
                            <strong>Shop Name:</strong> {shopData.shopName}
                        </li>
                        <li className="list-group-item">
                            <strong>Address:</strong> {shopData.address}
                        </li>
                    </ul>

                    <div className="mt-4 text-center">
                        <button
                            className="btn btn-success btn-lg"
                            onClick={() => {
                                setShowPinModal(true);
                                setPin('');
                                setBillData(null);
                                setErrorMessage('');
                            }}
                        >
                            Pay for Bill
                        </button>
                    </div>
                </div>
            </div>

            {/* ---------- BILL + STRIPE FLOW ---------- */}
            {renderPaymentFlow()}

            {/* ---------- PIN MODAL (popup) ---------- */}
            {showPinModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999
                    }}
                >
                    <div
                        className="card shadow"
                        style={{ width: '400px', padding: '1.5rem', borderRadius: '0.5rem', position: 'relative' }}
                    >
                        <h4 className="mb-3 text-center">Enter Your Bill PIN</h4>
                        <input
                            type="text"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="form-control mb-4"
                            placeholder="Enter Bill PIN"
                        />
                        <div className="d-flex justify-content-end">
                            <button
                                className="btn btn-secondary me-2"
                                onClick={() => {
                                    setShowPinModal(false);
                                    setPin('');
                                }}
                            >
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleFetchBill}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentFlowQr;
