import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function GroupPaymentDetails({ details, selectedMember, onSelectMember }) {
    const [localSelectedMember, setLocalSelectedMember] = useState(null);

    if (!details) {
        return <p>Loading group payment details...</p>;
    }

    // Custom styles for a clean, light UI.
    const cardStyle = {
        backgroundColor: '#ffffff',
        border: '1px solid #ddd',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        padding: '1rem'
    };

    const headingStyle = {
        backgroundColor: '#f0f8ff', // AliceBlue
        padding: '0.5rem',
        borderRadius: '0.25rem',
        color: '#007bff',
        fontWeight: 'bold'
    };

    const listItemStyle = {
        backgroundColor: '#ffffff',
        border: '1px solid #ddd',
        padding: '0.75rem',
        marginBottom: '0.5rem',
        borderRadius: '0.25rem',
        transition: 'background-color 0.2s, border 0.2s'
    };

    const activeListItemStyle = {
        backgroundColor: '#e6f7ff', // light blue highlight
        border: '1px solid #91d5ff'
    };

    // Define custom badge classes (or inline styles) for paid and pending.
    // For example, for pending items, we use a red badge.
    const badgeClassForPending = 'bg-warning text-dark';
    const badgeClassForPaid = 'bg-success text-white';

    return (
        <div className="card mb-3" style={cardStyle}>
            <div className="card-body">
                <h3 className="card-title">{details.title || 'Group Payment'}</h3>
                <p className="card-text">{details.description || 'No description available.'}</p>
                <h5>Total Amount: £{details.totalAmount?.toFixed(2)}</h5>
                {details.isCompleted ? (
                    <div className="alert alert-success mt-3">
                        <strong>All payments completed!</strong> This group payment is now closed.
                    </div>
                ) : (
                    <>
                        <h6 className="mt-4" style={headingStyle}>
                            Select Your Name to Proceed with Payment
                        </h6>
                        <ul className="list-group mt-2">
                            {details.members.map((member) => {
                                const isActive =
                                    selectedMember && selectedMember.memberPaymentId === member.memberPaymentId;
                                return (
                                    <li
                                        key={member.memberPaymentId}
                                        className="list-group-item"
                                        style={{
                                            ...listItemStyle,
                                            ...(isActive ? activeListItemStyle : {}),
                                            ...(member.paid ? { cursor: 'not-allowed', opacity: 0.6 } : {})
                                        }}
                                        onClick={() => {
                                            if (!member.paid) {
                                                setLocalSelectedMember(member);
                                                onSelectMember(member);
                                            }
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <input
                                                    type="radio"
                                                    name="selectedMember"
                                                    checked={
                                                        localSelectedMember &&
                                                        localSelectedMember.memberPaymentId === member.memberPaymentId
                                                    }
                                                    onChange={() => {}}
                                                    disabled={member.paid}
                                                    style={{ marginRight: '10px' }}
                                                />
                                                <strong>{member.memberName}</strong> - £{member.assignedAmount.toFixed(2)}
                                            </div>
                                            <span
                                                className={`badge ${
                                                    member.paid ? badgeClassForPaid : badgeClassForPending
                                                }`}
                                            >
                                                {member.paid ? 'Paid' : 'Pending'}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        {localSelectedMember && (
                            <div className="mt-3 alert alert-info">
                                <strong>Selected Member:</strong> {localSelectedMember.memberName} <br />
                                <strong>Amount Due:</strong> £{localSelectedMember.assignedAmount.toFixed(2)}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default GroupPaymentDetails;
