import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * Simple component to display shop data for a scanned QR code.
 *
 * Example usage: <PaymentFlowQr />
 * URL route: /bill/payment/:qrCode
 */
function PaymentFlowQr() {
    // 1) Get the qrCode from the URL
    const { qrCode } = useParams();

    // 2) Local state for shop data & error/loading
    const [shopData, setShopData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // 3) On mount, fetch the shop data
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

    // 4) Render states: Loading, Error, or Data
    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading shop data...</p>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <div className="alert alert-danger text-center" style={{ maxWidth: '600px' }}>
                    <h4>Failed to Load Shop</h4>
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

    // 5) Display the shop data
    return (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <div className="card shadow" style={{ border: 'none', borderRadius: '1rem', overflow: 'hidden', maxWidth: '600px', width: '100%' }}>
                <div className="card-body">
                    <h2 className="card-title text-primary mb-3">Shop Info</h2>
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
                </div>
            </div>
        </div>
    );
}

export default PaymentFlowQr;
