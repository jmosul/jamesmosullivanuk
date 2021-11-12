import React from 'react';
import './Critmas.css';
import critmasHeader from '../../assets/images/critmas/critmas.png';
import {Carousel, Col, Container, Row} from 'react-bootstrap';

import CritmasElves from './pages/CritmasElves/CritmasElves';
import {Route, Routes} from 'react-router-dom';
import CritmasGuide from './pages/CritmasGuide/CritmasGuide';

function Critmas() {
    return (
        <div className="critmas">
            <Container as="header">
                <Carousel>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src={critmasHeader}
                            alt="First slide"
                        />
                        <Carousel.Caption>
                            <Row>
                                <Col
                                    className="caption-container"
                                    lg={{span: 6, offset: 3}}
                                    md={{span: 8, offset: 2}}
                                    sm={{span: 10, offset: 1}}
                                    xs={{span: 10, offset: 1}}
                                >
                                    <h1>The Night Before Critmas</h1>
                                    <p>Can you save Christmas?</p>
                                </Col>
                            </Row>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>
            </Container>

            <Routes>
                <Route path="/" element={<CritmasElves/>}></Route>
                <Route path="guide" element={<CritmasGuide/>}></Route>
            </Routes>
        </div>
    );
}

export default Critmas;
