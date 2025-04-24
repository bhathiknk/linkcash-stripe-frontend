import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Spinner, Container, Row, Col } from 'react-bootstrap';
import { FaDownload, FaCheckCircle } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function OneTimeSuccess() {
    const { linkId } = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const receiptRef = useRef();

    // ────────────────────────────────────────────────────────────────────────────
    // Disable browser “back” button on this page
    useEffect(() => {
        // Push an extra entry so clicking “back” hits this same page
        window.history.pushState(null, null, window.location.href);
        const handlePopstate = () => {
            // whenever popstate fires (i.e. user tries to go back) re-push
            window.history.pushState(null, null, window.location.href);
        };
        window.addEventListener('popstate', handlePopstate);

        return () => {
            window.removeEventListener('popstate', handlePopstate);
        };
    }, []);
    // ────────────────────────────────────────────────────────────────────────────

    // Poll for transaction details
    useEffect(() => {
        let isMounted = true;
        let attempts = 0;
        const maxAttempts = 15;

        const poll = async () => {
            attempts += 1;
            try {
                const res = await fetch(
                    `http://localhost:8080/api/one-time-payment-links/details/${linkId}`
                );
                if (res.ok) {
                    const json = await res.json();
                    if (isMounted) setData(json);
                } else {
                    if (attempts >= maxAttempts) {
                        throw new Error('Unable to load transaction details.');
                    } else {
                        setTimeout(poll, 1000);
                    }
                }
            } catch (err) {
                if (attempts >= maxAttempts) {
                    if (isMounted) setError(err.message);
                } else {
                    setTimeout(poll, 1000);
                }
            }
        };

        poll();
        return () => {
            isMounted = false;
        };
    }, [linkId]);

    const downloadReceipt = async () => {
        if (!receiptRef.current) return;
        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
            });
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `one_time_payment_${linkId}.png`;
            link.click();
        } catch (e) {
            console.error('Download failed', e);
        }
    };

    if (error) {
        return (
            <Container className="py-5">
                <Card bg="danger" text="white" className="p-4">
                    <Card.Body>
                        <Card.Title>Error</Card.Title>
                        <Card.Text>{error}</Card.Text>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    if (!data) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status" />
                <p className="mt-3">Loading transaction details…</p>
            </Container>
        );
    }

    // Styles
    const receiptContainerStyle = {
        maxWidth: 600,
        margin: '0 auto',
        padding: 20,
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    };
    const watermarkStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-30deg)',
        fontSize: '5rem',
        color: '#f8f9fa',
        fontWeight: 'bold',
        zIndex: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: 0.15,
    };

    return (
        <Container className="py-5">
            <div style={receiptContainerStyle} ref={receiptRef}>
                <div style={watermarkStyle}>LinkCash</div>

                <Card className="border-0" style={{ zIndex: 1 }}>
                    <Card.Header
                        className="text-center text-white"
                        style={{
                            backgroundColor: '#007bff',
                            borderBottom: '2px solid #0056b3',
                            borderRadius: '6px 6px 0 0',
                        }}
                    >
                        <FaCheckCircle size={48} className="mb-2" />
                        <h2 className="mb-0">Payment Successful</h2>
                    </Card.Header>
                    <Card.Body style={{ zIndex: 1 }}>
                        <Row className="mb-3">
                            <Col xs={4} className="text-muted">
                                Title:
                            </Col>
                            <Col xs={8}>{data.title}</Col>
                        </Row>
                        <Row className="mb-3">
                            <Col xs={4} className="text-muted">
                                Description:
                            </Col>
                            <Col xs={8}>{data.description}</Col>
                        </Row>
                        <Row className="mb-3">
                            <Col xs={4} className="text-muted">
                                Amount:
                            </Col>
                            <Col xs={8}>£{data.amount.toFixed(2)}</Col>
                        </Row>
                        <Row className="mb-3">
                            <Col xs={4} className="text-muted">
                                Transaction ID:
                            </Col>
                            <Col xs={8} style={{ wordBreak: 'break-all' }}>
                                {data.stripeTransactionId}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={4} className="text-muted">
                                Paid at:
                            </Col>
                            <Col xs={8}>
                                {new Date(data.usedAt).toLocaleString()}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </div>

            <div className="text-center mt-4">
                <Button variant="outline-primary" onClick={downloadReceipt}>
                    <FaDownload className="me-2" /> Download Receipt
                </Button>
            </div>
        </Container>
    );
}
