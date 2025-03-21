import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PaymentFlowRegular from './components/PaymentFlows/PaymentFlowRegular';
import PaymentFlowOneTime from './components/PaymentFlows/PaymentFlowOneTime';
import PaymentFlowGroup from './components/PaymentFlows/PaymentFlowGroup';
import PaymentStatus from './components/PaymentStatus';
import PaymentFlowQr from './components/PaymentFlows/PaymentFlowQr';
import PaymentSuccess from './components/PaymentSuccess';

function App() {
    return (
        <Routes>
            <Route path="/link/:linkId" element={<PaymentFlowRegular />} />
            <Route path="/one-time/:linkId" element={<PaymentFlowOneTime />} />
            <Route path="/group-payment/:linkId" element={<PaymentFlowGroup />} />
            <Route path="/payment-status" element={<PaymentStatus />} />

            {/*route for scanning QR code /bill/payment/:qrCode */}
            <Route path="/bill/payment/:qrCode" element={<PaymentFlowQr />} />

            {/* Add a route for PaymentSuccess */}
            <Route path="/payment-success" element={<PaymentSuccess />} />

        </Routes>
    );
}

export default App;
