import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import Heading from '../../../../../componets/Heading';

function PickAClass() {
    return (
        <Container as="section" className="bg-light">
            <Row>
                <Col>
                    <Heading text="4. Pick a Class"/>
                </Col>
            </Row>
            <Row>
                <Col className="text-center">
                    <p>This bit is entirely up to you, no restrictions. Woo!</p>
                    <img src="https://media0.giphy.com/media/63IzeZiFZOJLXCfFWR/giphy.gif"
                         width="200"
                         className="mb-2"
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <p>
                        Yes Macaulay Culkin, pick any class (and subclass) available, but do think about how this works with the setting. Why does your happy elf know monk-ish martial arts?
                        <br/>Similarly with any patron or religious based classes (i.e. Warlock, paladin), make your patron Christmas based.
                    </p>

                    <p>
                        <strong>Important bit:</strong> You can go all the way to level 6.
                    </p>
                </Col>
            </Row>
        </Container>
    );
}

export default PickAClass;
