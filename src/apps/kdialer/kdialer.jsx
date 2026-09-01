import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faPlus, faUser, faTrash, faArrowUp, faArrowDown, faCheck, faDeleteLeft } from '@fortawesome/free-solid-svg-icons';
import { systemAlert } from '../../components/SystemAlert';
import './kdialer.css';

function KDialer() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, connected, ended
  const [callDuration, setCallDuration] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);
  const [activeTab, setActiveTab] = useState('dialer');
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const savedContacts = localStorage.getItem('kdialer_contacts');
    const savedCalls = localStorage.getItem('kdialer_recent');
    
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    } else {
      // Default contacts
      const defaultContacts = [
        { id: 1, name: 'John Doe', phone: '+1234567890' },
        { id: 2, name: 'Jane Smith', phone: '+9876543210' },
        { id: 3, name: 'Bob Wilson', phone: '+1122334455' }
      ];
      setContacts(defaultContacts);
      localStorage.setItem('kdialer_contacts', JSON.stringify(defaultContacts));
    }
    
    if (savedCalls) {
      setRecentCalls(JSON.parse(savedCalls));
    }
  }, []);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const handleNumberClick = (num) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber(phoneNumber + num);
    }
  };

  const handleDelete = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  const handleClear = () => {
    setPhoneNumber('');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const makeCall = (number = phoneNumber) => {
    if (!number) return;
    
    setCallStatus('calling');
    
    // Simulate call connecting
    setTimeout(() => {
      setCallStatus('connected');
      
      // Add to recent calls
      const newCall = {
        id: Date.now(),
        number: number,
        type: 'outgoing',
        duration: 0,
        timestamp: new Date().toISOString()
      };
      
      const updatedCalls = [newCall, ...recentCalls].slice(0, 20);
      setRecentCalls(updatedCalls);
      localStorage.setItem('kdialer_recent', JSON.stringify(updatedCalls));
    }, 2000);
  };

  const endCall = () => {
    if (callStatus === 'connected') {
      // Update call duration in recent calls
      const updatedCalls = [...recentCalls];
      if (updatedCalls[0]) {
        updatedCalls[0].duration = callDuration;
        setRecentCalls(updatedCalls);
        localStorage.setItem('kdialer_recent', JSON.stringify(updatedCalls));
      }
    }
    
    setCallStatus('ended');
    setTimeout(() => {
      setCallStatus('idle');
      setPhoneNumber('');
    }, 1500);
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      systemAlert('Please fill in both name and phone number', 'warning');
      return;
    }
    
    const contact = {
      id: Date.now(),
      name: newContact.name,
      phone: newContact.phone
    };
    
    const updatedContacts = [...contacts, contact];
    setContacts(updatedContacts);
    localStorage.setItem('kdialer_contacts', JSON.stringify(updatedContacts));
    setNewContact({ name: '', phone: '' });
  };

  const deleteContact = (id) => {
    const updatedContacts = contacts.filter(c => c.id !== id);
    setContacts(updatedContacts);
    localStorage.setItem('kdialer_contacts', JSON.stringify(updatedContacts));
  };

  const deleteRecentCall = (id) => {
    const updatedCalls = recentCalls.filter(c => c.id !== id);
    setRecentCalls(updatedCalls);
    localStorage.setItem('kdialer_recent', JSON.stringify(updatedCalls));
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  return (
    <div className="kdialer-container">
      <div className="kdialer-header">
        <h2><FontAwesomeIcon icon={faPhone} /> KDialer</h2>
        <div className="kdialer-tabs">
          <button 
            className={activeTab === 'dialer' ? 'tab-active' : ''}
            onClick={() => setActiveTab('dialer')}
          >
            Dialer
          </button>
          <button 
            className={activeTab === 'contacts' ? 'tab-active' : ''}
            onClick={() => setActiveTab('contacts')}
          >
            Contacts
          </button>
          <button 
            className={activeTab === 'recent' ? 'tab-active' : ''}
            onClick={() => setActiveTab('recent')}
          >
            Recent
          </button>
        </div>
      </div>

      <div className="kdialer-content">
        {activeTab === 'dialer' && (
          <div className="dialer-panel">
            {callStatus === 'idle' && (
              <>
                <div className="phone-display">
                  <input
                    type="text"
                    value={phoneNumber}
                    readOnly
                    placeholder="Enter phone number"
                    className="phone-input"
                  />
                  {phoneNumber && (
                    <button className="clear-btn" onClick={handleClear}>×</button>
                  )}
                </div>

                <div className="dialpad">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num) => (
                    <button
                      key={num}
                      className="dial-button"
                      onClick={() => handleNumberClick(num.toString())}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="dialer-actions">
                  <button className="action-btn delete-btn" onClick={handleDelete}>
                    <FontAwesomeIcon icon={faDeleteLeft} /> Delete
                  </button>
                  <button 
                    className="action-btn call-btn" 
                    onClick={() => makeCall()}
                    disabled={!phoneNumber}
                  >
                    <FontAwesomeIcon icon={faPhone} /> Call
                  </button>
                </div>
              </>
            )}

            {callStatus === 'calling' && (
              <div className="call-status">
                <div className="call-animation"><FontAwesomeIcon icon={faPhone} /></div>
                <h3>Calling...</h3>
                <p className="call-number">{phoneNumber}</p>
                <button className="end-call-btn" onClick={endCall}>
                  End Call
                </button>
              </div>
            )}

            {callStatus === 'connected' && (
              <div className="call-status">
                <div className="call-animation connected"><FontAwesomeIcon icon={faPhone} /></div>
                <h3>Connected</h3>
                <p className="call-number">{phoneNumber}</p>
                <p className="call-duration">{formatDuration(callDuration)}</p>
                <button className="end-call-btn" onClick={endCall}>
                  End Call
                </button>
              </div>
            )}

            {callStatus === 'ended' && (
              <div className="call-status">
                <div className="call-ended"><FontAwesomeIcon icon={faCheck} /></div>
                <h3>Call Ended</h3>
                <p className="call-duration">Duration: {formatDuration(callDuration)}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="contacts-panel">
            <div className="add-contact-section">
              <h3>Add New Contact</h3>
              <input
                type="text"
                placeholder="Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="contact-input"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="contact-input"
              />
              <button className="add-contact-btn" onClick={addContact}>
                <FontAwesomeIcon icon={faPlus} /> Add Contact
              </button>
            </div>

            <div className="search-section">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="contacts-list">
              {filteredContacts.length === 0 ? (
                <p className="empty-message">No contacts found</p>
              ) : (
                filteredContacts.map((contact) => (
                  <div key={contact.id} className="contact-item">
                    <div className="contact-info">
                      <div className="contact-avatar"><FontAwesomeIcon icon={faUser} /></div>
                      <div className="contact-details">
                        <h4>{contact.name}</h4>
                        <p>{contact.phone}</p>
                      </div>
                    </div>
                    <div className="contact-actions">
                      <button 
                        className="call-contact-btn"
                        onClick={() => {
                          setPhoneNumber(contact.phone);
                          setActiveTab('dialer');
                          makeCall(contact.phone);
                        }}
                      >
                        <FontAwesomeIcon icon={faPhone} />
                      </button>
                      <button 
                        className="delete-contact-btn"
                        onClick={() => deleteContact(contact.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="recent-panel">
            <h3>Recent Calls</h3>
            <div className="recent-list">
              {recentCalls.length === 0 ? (
                <p className="empty-message">No recent calls</p>
              ) : (
                recentCalls.map((call) => (
                  <div key={call.id} className="recent-item">
                    <div className="recent-icon">
                      {call.type === 'outgoing' ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />}
                    </div>
                    <div className="recent-info">
                      <h4>{call.number}</h4>
                      <p>{new Date(call.timestamp).toLocaleString()}</p>
                      {call.duration > 0 && (
                        <p className="recent-duration">Duration: {formatDuration(call.duration)}</p>
                      )}
                    </div>
                    <div className="recent-actions">
                      <button 
                        className="recall-btn"
                        onClick={() => {
                          setPhoneNumber(call.number);
                          setActiveTab('dialer');
                        }}
                      >
                        <FontAwesomeIcon icon={faPhone} />
                      </button>
                      <button 
                        className="delete-recent-btn"
                        onClick={() => deleteRecentCall(call.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KDialer;
