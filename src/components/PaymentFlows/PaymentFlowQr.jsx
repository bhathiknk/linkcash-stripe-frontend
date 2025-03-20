import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

/**
 * PaymentFlowQr.jsx
 * Example usage: <Route path="/bill/payment/:qrCode" element={<PaymentFlowQr />} />
 */
function PaymentFlowQr() {
    // 1) Get the qrCode from the URL
    const { qrCode } = useParams();

    // 2) Local states
    const [shopData, setShopData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // For Bill Payment
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [billData, setBillData] = useState(null);

    // 3) On mount, fetch the shop data by qrCode
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

    // 4) Function to call the GET /api/bills/{pin} endpoint
    const handleFetchBill = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/bills/${pin}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to fetch bill data.');
            }
            const data = await response.json();
            setBillData(data);
            setShowPinModal(false); // close modal
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    // 5) Render states: Loading, Error, or main UI
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

    return (
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            {/* --- SHOP INFO CARD --- */}
            <div
                className="card shadow mb-4"
                style={{ border: 'none', borderRadius: '1rem', overflow: 'hidden', maxWidth: '600px', width: '100%' }}
            >
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

                    {/* --- PAY FOR BILL BUTTON --- */}
                    <div className="mt-4 text-center">
                        <button
                            className="btn btn-success"
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

            {/* --- ERROR ALERT (for Bill fetching) --- */}
            {errorMessage && billData === null && (
                <div className="alert alert-danger" style={{ maxWidth: '600px' }}>
                    {errorMessage}
                </div>
            )}

            {/* --- SHOW BILL DATA IF AVAILABLE --- */}
            {billData && (
                <div
                    className="card shadow"
                    style={{ border: 'none', borderRadius: '1rem', overflow: 'hidden', maxWidth: '600px', width: '100%' }}
                >
                    <div className="card-body">
                        <h2 className="card-title text-primary mb-3">Bill Details</h2>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">
                                <strong>Bill ID:</strong> {billData.billId}
                            </li>
                            <li className="list-group-item">
                                <strong>Customer Name:</strong> {billData.customerName}
                            </li>
                            <li className="list-group-item">
                                <strong>Total:</strong> {billData.total}
                            </li>
                            <li className="list-group-item">
                                <strong>Status:</strong> {billData.status}
                            </li>
                            {/* Items */}
                            <li className="list-group-item">
                                <strong>Items:</strong>
                                <ul>
                                    {billData.items?.map((item) => (
                                        <li key={item.itemId}>
                                            {item.itemName} - x{item.quantity} @ £{item.price}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/* --- PIN MODAL (popup) --- */}
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
                        className="card"
                        style={{ width: '400px', padding: '1.5rem', borderRadius: '0.5rem', position: 'relative' }}
                    >
                        <h4 className="mb-3">Enter PIN</h4>
                        <input
                            type="text"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="form-control mb-3"
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
