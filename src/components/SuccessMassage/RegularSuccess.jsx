// src/components/RegularSuccess.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import Confetti from 'react-confetti';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function RegularSuccess() {
    const { linkId } = useParams();
    const { search } = useLocation();
    const navigate = useNavigate();
    const receiptRef = useRef(null);

    const params = new URLSearchParams(search);
    const paymentIntentId = params.get('paymentIntentId');

    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [showConfetti, setShowConfetti] = useState(true);
    const [loading, setLoading] = useState(true); // New

    useEffect(() => {
        if (!paymentIntentId) {
            setError('Missing Payment Intent ID.');
            return;
        }

        let attempts = 0;
        const maxAttempts = 5;

        const fetchData = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8080/api/payment-links/${linkId}/web?paymentIntentId=${paymentIntentId}`
                );
                if (!res.ok) throw new Error('Server not ready');
                const json = await res.json();
                setTimeout(() => {
                    setData(json);
                    setLoading(false);
                    setTimeout(() => setShowConfetti(false), 5000);
                }, 5000); // Wait 5s before showing receipt
            } catch (e) {
                if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(fetchData, 1000);
                } else {
                    setError('Unable to load payment info. Please try again.');
                }
            }
        };

        fetchData();
    }, [linkId, paymentIntentId]);

    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const onBack = () => navigate('/', { replace: true });
        window.addEventListener('popstate', onBack);
        return () => window.removeEventListener('popstate', onBack);
    }, [navigate]);

    const handleDownload = async () => {
        if (!receiptRef.current) return;
        try {
            const canvas = await html2canvas(receiptRef.current, { scale: 2 });
            const link = document.createElement('a');
            link.download = `receipt_regular_${linkId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            console.error('Download failed', e);
        }
    };

    if (error) {
        return (
            <div className="d-flex vh-100 justify-content-center align-items-center gradient-bg">
                <div className="alert alert-danger text-center">{error}</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="d-flex vh-100 justify-content-center align-items-center gradient-bg">
                <div className="spinner-border text-primary" role="status" />
                <p className="text-primary mt-3">Finalizing payment...</p>
            </div>
        );
    }

    return (
        <div
            className="d-flex flex-column justify-content-center align-items-center min-vh-100 gradient-bg"
            style={{ padding: '1rem' }}
        >
            <div className="blob d-none d-sm-block" />
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

            <div
                ref={receiptRef}
                className="card shadow-lg border-0"
                style={{
                    width: '100%',
                    maxWidth: '550px',
                    borderRadius: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    padding: '2rem',
                }}
            >
                <div className="text-center mb-4">
                    <div className="success-icon mb-3">
                        <FaCheckCircle size={60} color="#ffffff" />
                    </div>
                    <h2 className="fw-bold text-primary">Payment Successful</h2>
                    <p className="text-muted small mb-0">Your transaction has been completed securely.</p>
                </div>

                <div className="p-3 mb-4 rounded" style={{ background: '#E3F2FD' }}>
                    <h6 className="text-uppercase text-primary small mb-2">Amount Paid</h6>
                    <h2 className="fw-bold text-dark">£{parseFloat(data.amount).toFixed(2)}</h2>
                </div>

                <div className="p-3 mb-4 rounded" style={{ background: '#E3F2FD' }}>
                    <h6 className="text-uppercase text-primary small mb-2">Payment Details</h6>
                    <p className="mb-1"><strong>Title:</strong> {data.title}</p>
                    <p className="mb-1"><strong>Description:</strong> {data.description}</p>
                    {data.expireAfter && (
                        <p className="mb-0"><strong>Expires After:</strong> {data.expireAfter}</p>
                    )}
                </div>

                <div className="p-3 mb-4 rounded" style={{ background: '#E3F2FD' }}>
                    <h6 className="text-uppercase text-primary small mb-2">Transaction ID</h6>
                    <p className="small text-break">{data.stripeTransactionId || 'N/A'}</p>
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-4">
                    <button
                        className="btn btn-outline-primary w-100"
                        onClick={handleDownload}
                    >
                        <FaDownload className="me-2" /> Download Receipt
                    </button>
                </div>
            </div>

            {/* Styles */}
            <style>{`
                .gradient-bg {
                    background: linear-gradient(135deg, #83B6B9 0%, #E3F2FD 50%, #0054FF 100%);
                }
                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    40% { transform: scale(1.19); }
                }
                .success-icon {
                    width: 90px;
                    height: 90px;
                    background: linear-gradient(135deg, #00b813,#05ff1e);
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    animation: bounce 5s infinite;
                }
                .blob {
                    position: absolute;
                    width: 60vw;
                    height: 60vw;
                    max-width: 500px;
                    max-height: 500px;
                    background: radial-gradient(circle at 30% 30%, #ffffff55 0%, #ffffff00 70%);
                    filter: blur(90px);
                    animation: blobFloat 12s ease-in-out infinite alternate;
                }
                @keyframes blobFloat {
                    from { transform: translate(-25%, -30%) scale(1); }
                    to { transform: translate(15%, 10%) scale(1.15); }
                }
            `}</style>
        </div>
    );
}
