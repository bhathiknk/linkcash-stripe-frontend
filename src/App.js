import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PaymentFlowRegular from './components/PaymentFlows/PaymentFlowRegular';
import PaymentFlowOneTime from './components/PaymentFlows/PaymentFlowOneTime';
import PaymentFlowGroup from './components/PaymentFlows/PaymentFlowGroup';
import PaymentStatus from './components/PaymentStatus';
import PaymentFlowQr from './components/PaymentFlows/PaymentFlowQr';
import PaymentSuccess from './components/PaymentSuccess';
import OneTimeSuccess from './components/SuccessMassage/OneTimeSuccess'
import GroupSuccess from './components/SuccessMassage/GroupSuccess';

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

            <Route path="/one-time-success/:linkId" element={<OneTimeSuccess />} />

            <Route path="/group-success" element={<GroupSuccess />} />

        </Routes>
    );
}

export default App;
