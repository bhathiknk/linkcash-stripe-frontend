// src/components/OneTimeSuccess.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FaDownload, FaCheckCircle } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import Confetti from 'react-confetti';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function OneTimeSuccess() {
    const { linkId } = useParams();
    const receiptRef = useRef();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        let isMounted = true;
        fetch(` http://localhost:8080/api/one-time-payment-links/details/${linkId}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load transaction details.');
                return res.json();
            })
            .then(json => {
                if (isMounted) {
                    setData(json);
                    setTimeout(() => setShowConfetti(false), 5000);
                }
            })
            .catch(e => {
                if (isMounted) setError(e.message);
            });

        return () => { isMounted = false; };
    }, [linkId]);

    const downloadReceipt = async () => {
        if (!receiptRef.current) return;
        const canvas = await html2canvas(receiptRef.current, { scale: 2 });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `receipt_onetime_${linkId}.png`;
        link.click();
    };

    if (error) {
        return (
            <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
                <div className="alert alert-danger text-center">{error}</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
                <div className="spinner-border text-primary" role="status" />
            </div>
        );
    }

    return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100" style={{
            background: 'linear-gradient(135deg, #E3F2FD 0%, #ffffff 100%)',
            padding: '1rem',
        }}>
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

            <div ref={receiptRef} className="card shadow-lg border-0 p-4" style={{
                maxWidth: '550px',
                width: '100%',
                borderRadius: '1.5rem',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
            }}>
                <div className="text-center mb-4">
                    <div className="success-icon mb-3">
                        <FaCheckCircle size={60} color="#ffffff" />
                    </div>
                    <h2 className="fw-bold text-primary">Payment Successful</h2>
                    <p className="text-muted small mb-0">One-time payment completed securely.</p>
                </div>

                <div className="p-3 mb-4 rounded" style={{ background: '#E3F2FD' }}>
                    <h6 className="text-uppercase text-primary small mb-2">Amount Paid</h6>
                    <h2 className="fw-bold text-dark">£{data.amount.toFixed(2)}</h2>
                </div>

                <div className="p-3 mb-4 rounded" style={{ background: '#E3F2FD' }}>
                    <h6 className="text-uppercase text-primary small mb-2">Payment Details</h6>
                    <p><strong>Title:</strong> <span className="text-primary">{data.title}</span></p>
                    <p><strong>Description:</strong> {data.description}</p>
                </div>

                <div className="p-3 mb-4 rounded" style={{ background: '#E3F2FD' }}>
                    <h6 className="text-uppercase text-primary small mb-2">Transaction ID</h6>
                    <p className="small text-break">{data.stripeTransactionId || 'N/A'}</p>
                    <p className="small"><strong>Paid At:</strong> {new Date(data.usedAt).toLocaleString()}</p>
                </div>

                <div className="d-flex justify-content-center mt-4">
                    <button className="btn btn-outline-primary w-100" onClick={downloadReceipt}>
                        <FaDownload className="me-2" /> Download Receipt
                    </button>
                </div>
            </div>

            {/* Success icon bounce animation */}
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    40% { transform: scale(1.15); }
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
            `}</style>
        </div>
    );
}
