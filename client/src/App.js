import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';
import YesSessionHome from './YesSessionHome';
import NoSessionHome from './NoSessionHome';

axios.defaults.withCredentials = true;

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [userId, setUserId] = useState(null);
  const [expiry, setExpiry] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);

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
          setSessionActive(true);
        } else {
          setUserId(null);
          localStorage.removeItem('userId');
          setSessionActive(false);
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

  const startSession = async () => {
    try {
      await axios.get(`${API_BASE_URL}/sessions/create`);
      setSessionActive(true);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };  

  const killSession = useCallback(async () => {
    try {
      await axios.get(`${API_BASE_URL}/sessions/destroy`);
      setSessionActive(false);
      setUserId(null);
      setExpiry(null);
      localStorage.clear();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }, [setSessionActive, API_BASE_URL]);

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