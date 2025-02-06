import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PaymentFlowRegular from './components/PaymentFlows/PaymentFlowRegular';
import PaymentFlowOneTime from './components/PaymentFlows/PaymentFlowOneTime';
import PaymentFlowGroup from './components/PaymentFlows/PaymentFlowGroup';
import PaymentStatus from './components/PaymentStatus';

function App() {
    return (
        <Routes>
            <Route path="/link/:linkId" element={<PaymentFlowRegular />} />
            <Route path="/one-time/:linkId" element={<PaymentFlowOneTime />} />
            <Route path="/group-payment/:linkId" element={<PaymentFlowGroup />} />
            <Route path="/payment-status" element={<PaymentStatus />} />
        </Routes>
    );
}

export default App;
