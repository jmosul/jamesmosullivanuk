import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';

function CritmasGuide() {
    return (
        <Container className="bg-light" as="main">
            <Row>
                <Col>
                    YOUR GUIDE

                    <ul>
                        <li>Open Dnd Beyond</li>
                        <li>Choose correct settings</li>
                        <li>Choose Christmas Elf</li>
                        <li>Choose Class</li>
                        <li>Choose Ability Scores</li>
                        <li>Choose Background</li>
                        <li>Choose Equipment</li>
                    </ul>
                </Col>
            </Row>
        </Container>
    );
}

export default CritmasGuide;
