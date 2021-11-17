import React from 'react';
import './Home.css';
import {Col, Container, Row} from 'react-bootstrap';
import {Link} from 'react-router-dom';

function Home() {
  return (
    <div className="page home">
        <Container>
            <Row>
                <Col className="text-center bg-light" lg="2" md="4" sm="6">
                    <p>Looking for the Christmas One-Shot?</p>

                    <p>
                        <Link to="/critmas">You need to go here...</Link>
                    </p>
                </Col>
            </Row>
        </Container>
    </div>
  );
}

export default Home;
