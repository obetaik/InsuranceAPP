import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

function Loading() {
  return (
    <Container className="text-center mt-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3">Loading...</p>
    </Container>
  );
}

export default Loading;