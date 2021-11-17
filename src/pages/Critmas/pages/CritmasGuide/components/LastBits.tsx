import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import Heading from '../../../../../componets/Heading';
import candySword from 'assets/images/critmas/elves/candy_sword.webp';

function LastBits() {
    return (
        <Container as="section" className="bg-light">
            <Row>
                <Col>
                    <Heading text="9. Last bits"/>
                </Col>
            </Row>
            <Row>
                <Col>
                    <p>
                        The final bits will depend on your class, remember to:

                        <ul>
                            <li>Equip your weapons and armour.</li>
                            <li>Choose your <strong>spells</strong> if you have any.</li>
                            <li>Beast masters, choose your animal companion.</li>
                        </ul>
                    </p>
                </Col>
            </Row>
        </Container>
    );
}

export default LastBits;
