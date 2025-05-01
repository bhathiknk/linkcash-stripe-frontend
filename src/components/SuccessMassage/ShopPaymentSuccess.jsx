import React, { useEffect, useState, useRef } from 'react';
import { FaDownload, FaCheckCircle } from 'react-icons/fa';
import Confetti from 'react-confetti';
import html2canvas from 'html2canvas';
import 'bootstrap/dist/css/bootstrap.min.css';

function ShopPaymentSuccess() {
    const receiptRef = useRef();
    const [transactionData, setTransactionData] = useState(null);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const [showConfetti, setShowConfetti] = useState(true);

    const urlParams = new URLSearchParams(window.location.search);
    const billId = urlParams.get('billId');

    useEffect(() => {
        if (!billId) return;
        fetchTransactionData(billId);
    }, [billId, retryCount]);

    const fetchTransactionData = async (billId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/shop-transactions/bill/${billId}`);
            if (!response.ok) throw new Error(await response.text());
            const data = await response.json();
            setTransactionData(data);
            setError('');
            setTimeout(() => setShowConfetti(false), 5000);
        } catch (err) {
            if (retryCount < 1) {
                setTimeout(() => {
                    setRetryCount(retryCount + 1);
                }, 2000);
            } else {
                setError(err.message);
            }
        }
    };

    const handleDownload = async () => {
        if (!receiptRef.current) return;
        const canvas = await html2canvas(receiptRef.current, { scale: 2 });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `shop_receipt_${billId}.png`;
        link.click();
    };

    if (!billId) {
        return (
            <div className="d-flex vh-100 justify-content-center align-items-center gradient-bg">
                <div className="alert alert-danger">No bill ID provided in URL.</div>
            </div>
        );
    }

    if (!transactionData && !error) {
        return (
            <div className="d-flex vh-100 justify-content-center align-items-center gradient-bg">
                <div className="spinner-border text-primary" role="status" />
                <p className="text-primary mt-3">Finalizing payment...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex vh-100 justify-content-center align-items-center gradient-bg">
                <div className="alert alert-danger text-center">
                    <h4>Error</h4>
                    <p>Error fetching transaction data: {error}</p>
                </div>
            </div>
        );
    }

    const {
        transactionId,
        stripeTransactionId,
        amount,
        transactionCreatedAt,
        billId: bId,
        billStatus,
        billTotal,
        billExpiresAt,
        customerName,
        items,
        totalItems,
        shopId,
        shopName,
        shopAddress
    } = transactionData;

    return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 gradient-bg px-2">
            <div className="blob d-none d-sm-block" />
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

            <div
                ref={receiptRef}
                className="card shadow-sm border-0 p-2"
                style={{
                    maxWidth: '480px',
                    width: '100%',
                    borderRadius: '0.75rem',
                    background: 'rgba(255,255,255,0.94)',
                    backdropFilter: 'blur(8px)',
                    fontSize: '0.85rem'
                }}
            >
                <div className="text-center mb-2">
                    <div className="success-icon mb-2">
                        <FaCheckCircle size={44} color="#ffffff" />
                    </div>
                    <h5 className="fw-bold text-success mb-1">Payment Successful</h5>
                    <p className="text-muted small mb-2">Your payment was processed securely.</p>
                </div>

                <div className="highlight-block bg-light mb-1 py-2 px-3">
                    <h6 className="text-uppercase text-primary mb-1 small">Amount Paid</h6>
                    <h4 className="text-dark fw-bold">£{amount.toFixed(2)}</h4>
                </div>

                <div className="highlight-block bg-white border mb-1 py-2 px-3">
                    <h6 className="text-primary small mb-1">Bill Details</h6>
                    <p className="mb-0"><strong>Bill ID:</strong> {bId}</p>
                    <p className="mb-0"><strong>Customer:</strong> {customerName}</p>
                    <p className="mb-0"><strong>Status:</strong> {billStatus}</p>
                    <p className="mb-0"><strong>Items:</strong> {totalItems}</p>
                    <p className="mb-0"><strong>Expires:</strong> {billExpiresAt || 'N/A'}</p>
                </div>

                <div className="highlight-block bg-white border mb-1 py-2 px-3">
                    <h6 className="text-primary small mb-1">Shop Info</h6>
                    <p className="mb-0"><strong>{shopName}</strong> ({shopId})</p>
                    <p className="mb-0"><strong>Address:</strong> {shopAddress}</p>
                </div>

                <div className="highlight-block bg-white border mb-1 py-2 px-3">
                    <h6 className="text-primary small mb-1">Transaction</h6>
                    <p className="mb-0"><strong>ID:</strong> {transactionId}</p>
                    <p className="mb-0"><strong>Stripe:</strong> {stripeTransactionId || 'N/A'}</p>
                    <p className="mb-0"><strong>Time:</strong> {new Date(transactionCreatedAt).toLocaleString()}</p>
                </div>

                <div className="highlight-block bg-white border mb-2 py-2 px-3">
                    <h6 className="text-primary small mb-1">Items</h6>
                    <ul className="list-group list-group-flush small">
                        {items.map(item => (
                            <li key={item.itemId} className="list-group-item d-flex justify-content-between px-2 py-1">
                                <span>{item.itemName} × {item.quantity}</span>
                                <strong>£{(item.price * item.quantity).toFixed(2)}</strong>
                            </li>
                        ))}
                    </ul>
                </div>

                <button className="btn btn-sm btn-outline-primary w-100 mt-1" onClick={handleDownload}>
                    <FaDownload className="me-2" /> Download Receipt
                </button>
            </div>

            <style>{`
                .gradient-bg {
                    background: linear-gradient(135deg, #83B6B9 0%, #E3F2FD 50%, #0054FF 100%);
                }
                .success-icon {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #00b813, #05ff1e);
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    animation: bounce 3s infinite;
                }
                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    40% { transform: scale(1.1); }
                }
                .blob {
                    position: absolute;
                    width: 50vw;
                    height: 50vw;
                    max-width: 400px;
                    max-height: 400px;
                    background: radial-gradient(circle at 30% 30%, #ffffff55 0%, #ffffff00 70%);
                    filter: blur(90px);
                    animation: blobFloat 10s ease-in-out infinite alternate;
                }
                @keyframes blobFloat {
                    from { transform: translate(-20%, -20%) scale(1); }
                    to { transform: translate(10%, 10%) scale(1.05); }
                }
                .highlight-block {
                    border-radius: 0.5rem;
                }
                @media (max-width: 480px) {
                    .card {
                        font-size: 0.78rem;
                        padding: 1rem !important;
                    }
                    .success-icon {
                        width: 54px;
                        height: 54px;
                    }
                    .btn {
                        font-size: 0.85rem;
                        padding: 0.4rem 1rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default ShopPaymentSuccess;
