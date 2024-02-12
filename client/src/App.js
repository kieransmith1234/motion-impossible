import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';
import NoSessionHome from './NoSessionHome';
import YesSessionHome from './YesSessionHome';

axios.defaults.withCredentials = true;

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [userId, setUserId] = useState(null);
  const [expiry, setExpiry] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);

  const startSession = async () => {
    try {
      await axios.get(`${API_BASE_URL}/sessions/create`);
      setSessionActive(true);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const killSession = async () => {
    try {
      await axios.get(`${API_BASE_URL}/sessions/destroy`);
      setSessionActive(false);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        if (sessionActive) {
          const index_response = await axios.get(`${API_BASE_URL}/`);
          const userId = index_response.data;

          const get_expiry_response = await axios.get(`${API_BASE_URL}/get_expiry`);
          const expiry = get_expiry_response.data;
          setExpiry(expiry);
          setUserId(userId);
          localStorage.setItem('userId', userId);
          localStorage.setItem('expires', expiry);
        } else {
          setUserId(null);
          setExpiry(null);
          localStorage.removeItem('userId');
          localStorage.removeItem('expires');
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    const intervalId = setInterval(() => {
      fetchUserId();
    }, 1000);

    // Cleanup function: clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [sessionActive]);

  return (
    <Container className="flex-container p-3" style={{ height: '100vh', textAlign: 'center', marginTop: '5rem' }}>
      <Row>
        <Col className="col-md-12">
          <h1>Session Spawner</h1>
        </Col>
          {sessionActive ? (
            <YesSessionHome userId={userId} expiry={expiry} setExpiry={setExpiry} startSession={startSession} killSession={killSession} />
          ) : (
            <NoSessionHome startSession={startSession} killSession={killSession} />
          )}
      </Row>
    </Container>
  );
}

export default App;