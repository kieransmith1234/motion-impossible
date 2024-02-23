import React from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import { Col } from 'react-bootstrap';
import './App.css';

axios.defaults.withCredentials = true;

function NoSessionHome({ startSession }) {

  function handleNewSessionClick() {
    try {
      startSession();
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  return (
    <>
      <Col className="col-md-12">
        <p>Welcome! No session found...</p>
        <button className="button create" onClick={handleNewSessionClick}>
          Create session
        </button>
      </Col>
    </>
  );
}

export default NoSessionHome;