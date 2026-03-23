import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert, Form } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function ClaimDetail() {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const fetchClaim = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/claims/${id}`);
      setClaim(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching claim:', error);
      setError('Failed to load claim details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      await api.post(`/claims/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh claim data
      fetchClaim();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Submitted': 'info',
      'Under Review': 'warning',
      'Approved': 'success',
      'Rejected': 'danger',
      'Pending': 'warning',
      'In Progress': 'primary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading claim details...</p>
      </Container>
    );
  }

  if (error || !claim) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || 'Claim not found'}
        </Alert>
        <Button as={Link} to="/claims" variant="primary" className="mt-3">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Claims
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h2>Claim Details</h2>
          <p className="text-muted">Claim #{claim.claim_number}</p>
        </div>
        <Button as={Link} to="/claims" variant="outline-secondary">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Claims
        </Button>
      </div>

      <Row>
        <Col md={8}>
          {/* Main Claim Info */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Claim Information</h5>
            </Card.Header>
            <Card.Body>
              <Table borderless>
                <tbody>
                  <tr>
                    <td className="fw-bold" style={{ width: '200px' }}>Status:</td>
                    <td>{getStatusBadge(claim.status)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Policy Number:</td>
                    <td>
                      <Link to={`/policies/${claim.policy?.id}`}>
                        {claim.policy_number}
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Product:</td>
                    <td>{claim.policy?.product_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Incident Date:</td>
                    <td>{formatDate(claim.incident_date)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Filing Date:</td>
                    <td>{formatDate(claim.filing_date)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Claim Amount:</td>
                    <td>
                      <h4 className="text-primary mb-0">
                        {formatCurrency(claim.claim_amount)}
                      </h4>
                    </td>
                  </tr>
                  {claim.approved_amount && (
                    <tr>
                      <td className="fw-bold">Approved Amount:</td>
                      <td>
                        <h5 className="text-success mb-0">
                          {formatCurrency(claim.approved_amount)}
                        </h5>
                      </td>
                    </tr>
                  )}
                  {claim.resolution_date && (
                    <tr>
                      <td className="fw-bold">Resolution Date:</td>
                      <td>{formatDate(claim.resolution_date)}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Description */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Incident Description</h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-0">{claim.description}</p>
            </Card.Body>
          </Card>

          {/* Documents */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Documents</h5>
            </Card.Header>
            <Card.Body>
              {claim.documents && claim.documents.length > 0 ? (
                <Table striped hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Filename</th>
                      <th>Uploaded</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claim.documents.map((doc, index) => (
                      <tr key={index}>
                        <td>
                          <i className="bi bi-file-earmark-text me-2"></i>
                          {doc.filename}
                        </td>
                        <td>{formatDate(doc.uploaded_at)}</td>
                        <td>
                          <Button
                            href={doc.url}
                            target="_blank"
                            variant="outline-primary"
                            size="sm"
                          >
                            <i className="bi bi-download me-1"></i>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted text-center mb-0">No documents uploaded yet.</p>
              )}

              {claim.status === 'Submitted' && (
                <div className="mt-3">
                  <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Upload Supporting Document</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </Form.Group>
                  {uploading && (
                    <div className="text-center">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Uploading...</span>
                      </div>
                      <span className="ms-2">Uploading...</span>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* Status Timeline */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Claim Timeline</h5>
            </Card.Header>
            <Card.Body>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-badge bg-success">
                    <i className="bi bi-check"></i>
                  </div>
                  <div className="timeline-content">
                    <h6>Claim Filed</h6>
                    <small className="text-muted">{formatDate(claim.filing_date)}</small>
                  </div>
                </div>
                
                {claim.status !== 'Submitted' && (
                  <div className="timeline-item">
                    <div className="timeline-badge bg-warning">
                      <i className="bi bi-arrow-repeat"></i>
                    </div>
                    <div className="timeline-content">
                      <h6>Under Review</h6>
                      <small className="text-muted">In progress</small>
                    </div>
                  </div>
                )}
                
                {claim.status === 'Approved' && (
                  <div className="timeline-item">
                    <div className="timeline-badge bg-success">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <div className="timeline-content">
                      <h6>Approved</h6>
                      {claim.resolution_date && (
                        <small className="text-muted">{formatDate(claim.resolution_date)}</small>
                      )}
                    </div>
                  </div>
                )}
                
                {claim.status === 'Rejected' && (
                  <div className="timeline-item">
                    <div className="timeline-badge bg-danger">
                      <i className="bi bi-x-circle"></i>
                    </div>
                    <div className="timeline-content">
                      <h6>Rejected</h6>
                      {claim.resolution_date && (
                        <small className="text-muted">{formatDate(claim.resolution_date)}</small>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Actions */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Actions</h5>
            </Card.Header>
            <Card.Body>
              {claim.status === 'Submitted' && (
                <Button 
                  variant="outline-primary" 
                  className="w-100 mb-2"
                  onClick={() => document.getElementById('formFile').click()}
                >
                  <i className="bi bi-upload me-2"></i>
                  Upload Document
                </Button>
              )}
              
              <Button 
                variant="outline-secondary" 
                className="w-100 mb-2"
                as={Link}
                to={`/policies/${claim.policy?.id}`}
              >
                <i className="bi bi-shield me-2"></i>
                View Policy
              </Button>
              
              <Button 
                variant="outline-info" 
                className="w-100"
                onClick={() => window.print()}
              >
                <i className="bi bi-printer me-2"></i>
                Print Details
              </Button>
            </Card.Body>
          </Card>

          {/* Contact Support */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Need Help?</h5>
            </Card.Header>
            <Card.Body>
              <p className="small">
                Contact our claims department for assistance with this claim.
              </p>
              <Button variant="outline-primary" className="w-100">
                <i className="bi bi-headset me-2"></i>
                Contact Support
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        .timeline-item {
          position: relative;
          padding-bottom: 20px;
        }
        .timeline-badge {
          position: absolute;
          left: -30px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
        }
        .timeline-content {
          padding-left: 10px;
        }
        .timeline-content h6 {
          margin-bottom: 5px;
        }
      `}</style>
    </Container>
  );
}

export default ClaimDetail;