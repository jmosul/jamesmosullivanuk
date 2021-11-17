import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import Heading from '../../../../../componets/Heading';
import abilityOptions from 'assets/images/critmas/dndbeyond/race_settings.png';

function RaceSettings() {
    return (
        <Container as="section" className="bg-light">
            <Row>
                <Col>
                    <Heading text="3. Choose a Race" />
                </Col>
            </Row>
            <Row>
                <Col>
                    <p>The next step of the dndbeyond Wizard is to choose a race.</p>
                    <p>
                        For this one-shot you must use the&nbsp;
                        <a href="https://www.dndbeyond.com/races/830434-christmas-elf"
                           title="Christmas Elf Race | dndbeyond"
                           target="_blank"
                        >Christmas Elf</a>.  It should have a little blue house icon next to it.

                        <br />I know, limiting, but this special class has some flexible options to help you build your character.
                    </p>

                    <p>
                        Your elf can pick 3 ability score increases as their base.  Santa's are diverse so these are entirely up to you.
                        <br/> Don't worry about picking the wrong ones, you can change these as much as you like before the game starts.
                    </p>
                </Col>
                <Col lg="4" className="text-center">
                    <img src={abilityOptions} alt="Ability score options" width="300"/>
                </Col>
            </Row>
        </Container>
    );
}

export default RaceSettings;
