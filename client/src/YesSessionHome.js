import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import { Col } from 'react-bootstrap';
import './App.css';

axios.defaults.withCredentials = true;

function YesSessionHome({ userId, expiry, setExpiry, startSession, killSession }) {
  const [isLoaded, setIsLoaded] = useState(false);

  function handleNewSessionClick() {
    try {
      startSession();
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  function handleDeleteSessionClick() {
    try {
      killSession();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  useEffect(() => {
    if (expiry && userId) {
      const intervalId = setInterval(() => {
        const now = moment();
        const expiryTime = moment(expiry);
        const diff = expiryTime.diff(now);
        const duration = moment.duration(diff);
        const seconds = duration.seconds();

        console.log(`Expiry in ${seconds} seconds.`);

        if (isLoaded && seconds <= 0) {
          killSession();
        } else {
          setExpiry(expiryTime.add(500, 'millisecond').format());
        }
      }, 500);

      return () => clearInterval(intervalId);
    } else {
      console.log('No expiry or userId set. Expiry: ' + expiry + ', userId: ' + userId);
      setExpiry(null);
    }

    setIsLoaded(true);
  }, [userId, expiry, setExpiry, killSession, isLoaded]);  

  return (
      <>
        <Col className="col-md-12">
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
          <button className="button create" onClick={handleNewSessionClick}>
            Create session
          </button>
          <button className="button delete" onClick={handleDeleteSessionClick}>
            Delete Session
          </button>
        </Col>
      </>
  );
}
          
export default YesSessionHome;