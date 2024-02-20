import React, { lazy, Suspense } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import './App.css';
const Col = lazy(() => import('react-bootstrap/Col'));

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
      <Suspense fallback={<div>Loading...</div>}>
        <Col className="col-md-12">
          <p>Welcome! No session found...</p>
          <button className="button create" onClick={handleNewSessionClick}>
            Create session
          </button>
        </Col>
      </Suspense>
    </>
  );
}

export default NoSessionHome;