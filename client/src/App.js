// App.js
import React, { lazy, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import './App.css';
const Container = lazy(() => import('react-bootstrap/Container'));
const Row = lazy(() => import('react-bootstrap/Row'));
const Col = lazy(() => import('react-bootstrap/Col'));
const YesSessionHome = React.lazy(() => import('./YesSessionHome'));
const NoSessionHome = React.lazy(() => import('./NoSessionHome'));

axios.defaults.withCredentials = true

function App() {
  const [userId, setUserId] = useState(null);
  const [expiry, setExpiry] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);

  const API_BASE_URL = process.env.API_URL;

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
    const fetchUserId = async () => {
      try {
        const userId_response = await axios.get(`${API_BASE_URL}/`);
        const userId = userId_response.data
        setUserId(userId);
        localStorage.setItem('userId', userId);
        
        const get_expiry_response = await axios.get(`${API_BASE_URL}/expiry`);
        const expiry = get_expiry_response.data;
        setExpiry(expiry);
        localStorage.setItem('expires', expiry);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    const intervalId = setInterval(() => {
      fetchUserId();
    }, 1000);

    // Cleanup function: clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [killSession, setUserId, setExpiry, sessionActive, userId, expiry, API_BASE_URL]);

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