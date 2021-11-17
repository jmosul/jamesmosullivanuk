import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import Heading from '../../../../../componets/Heading';
import candySword from 'assets/images/critmas/elves/candy_sword.webp';

function Background() {
    return (
        <Container as="section" className="bg-light">
            <Row>
                <Col>
                    <Heading text="7. Equipment"/>
                </Col>
            </Row>
            <Row>
                <Col className="text-center" lg="3">
                    <img src={candySword} alt="Hiiiya!" width="100%" />
                </Col>
                <Col>
                    <p>
                        For equipment, choose "Starting Equipment".  This will guide you through choices related to your class and background.
                    </p>

                    <p>
                        Remember to consider giving your equipment a Christmas flourish!
                    </p>

                    <p>
                        As for magical items (including consumables), you can choose from:

                        <ul>
                            <li>6 uncommon</li>
                            <li>3 common</li>
                            <li>1 rare</li>
                        </ul>

                        It is up to you how you spread those out.
                    </p>
                </Col>
            </Row>
        </Container>
    );
}

export default Background;
