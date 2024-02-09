import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';

axios.defaults.withCredentials = true;

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [userId, setUserId] = useState(null);
  const [expiry, setExpiry] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response1 = await axios.get(`${API_BASE_URL}/`);
        const userId = response1.data;

        const response2 = await axios.get(`${API_BASE_URL}/get_expiry`);
        const expiry = response2.data;
        setExpiry(expiry);

        if (userId) {
          setUserId(userId);
          localStorage.setItem('userId', userId);
        } else {
          setUserId(null);
          localStorage.removeItem('userId');
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
  }, []);

  const handleNewSessionClick = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions/create`);
      const newUserId = response.data.userId;

      setUserId(newUserId);
      localStorage.setItem('userId', newUserId);
      localStorage.setItem('expires', response.data.expires);
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const handleDeleteSessionClick = async () => {
    try {
      console.log('Before deleting session - userId:', userId);
      await axios.get(`${API_BASE_URL}/sessions/destroy`);
      setUserId(null);
      localStorage.removeItem('userId');
      console.log('After deleting session - userId:', userId);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  useEffect(() => {
    if (expiry) {
      const intervalId = setInterval(() => {
        const now = moment();
        const expiryTime = moment(expiry);
        const diff = expiryTime.diff(now);
        const duration = moment.duration(diff);
        const seconds = duration.seconds();

        console.log(`Expiry in ${seconds} seconds.`);

        setExpiry(expiryTime.add(500, 'millisecond').format());
      }, 1000);

      // Cleanup function: clear the interval when the component unmounts or when expiry changes
      return () => clearInterval(intervalId);
    }
  }, [expiry]);

  return (
    <Container className="flex-container p-3" style={{ height: '100vh', textAlign: 'center', marginTop: '5rem' }}>
      <Row>
        <Col className="col-md-12">
          <h1>Session Spawner</h1>
          {userId ? (
            <>
              <p>
                Welcome back! Your user ID is: <span style={{ fontWeight: 'bold' }}>{userId}</span>
              </p>
              <p>
                Session expires in:{' '}
                {expiry ? (
                  <span>
                    {moment.duration(moment(expiry).diff(moment())).seconds()}
                  </span>
                ) : (
                  'unknown'
                )}
              </p>
            </>
          ) : (
            <p>Welcome! No user ID in the session.</p>
          )}
          <button className="button create" onClick={handleNewSessionClick}>
            Create session
          </button>
          <button className="button delete" onClick={handleDeleteSessionClick}>
            Delete Session
          </button>
        </Col>
      </Row>
    </Container>
  );
}

export default App;